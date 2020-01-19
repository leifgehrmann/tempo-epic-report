import TempoApi from 'tempo-client';
import { WorklogResponse } from 'tempo-client/lib/responseTypes';
import JiraApi, { IssueObject } from 'jira-client';
import UserRepository from './userRepository';
import WorklogRepository from './worklogRepository';
import User from './user';

interface EpicsTotalTimeReport {
  [key: string]: {
    epicIssue: IssueObject;
    totalTimeSpentSeconds: number;
  };
}

interface ReportQuery {
  usernames: string[];
  from: Date;
  to: Date;
}

export default class Report {
  private readonly jiraClient: JiraApi;

  private readonly tempoClient: TempoApi;

  private readonly jiraEpicCustomFieldKey: string;

  private readonly userRepository: UserRepository;

  private readonly worklogRepository: WorklogRepository;

  private readonly issueCache: { [key: string]: IssueObject };

  private readonly epicsTotalTime: EpicsTotalTimeReport;

  constructor(jiraClient: JiraApi, tempoClient: TempoApi, jiraEpicCustomFieldKey: string) {
    this.jiraClient = jiraClient;
    this.tempoClient = tempoClient;
    this.jiraEpicCustomFieldKey = jiraEpicCustomFieldKey;
    this.userRepository = new UserRepository(this.jiraClient);
    this.worklogRepository = new WorklogRepository(this.tempoClient);
    this.issueCache = {};
    this.epicsTotalTime = {};
  }

  async execute(reportQuery: ReportQuery): Promise<EpicsTotalTimeReport> {
    // 1. Fetch the usernames from JIRA
    const users = await this.userRepository.getUsersByUsernames(reportQuery.usernames);

    // 2. Fetch all the worklogs for each username
    const allWorklogs = await this.fetchWorklogsForUsers(users, reportQuery);

    // 3. For each worklog, fetch the issue
    await this.fetchIssuesForWorklogs(allWorklogs);

    // 4. For each issue, fetch the epic
    await this.fetchParentsForIssues(Object.values(this.issueCache));

    // 5. For each issue, fetch the parent
    await this.fetchEpicsForIssues(Object.values(this.issueCache));

    // 6. Accumulate the worklog timings for each worklog, grouped by epic or issue
    allWorklogs.forEach((worklog) => {
      const issue = this.getCachedIssueByKey(worklog.issue.key);
      const epicIssue = this.getCachedEpicOrMainIssueForIssue(issue);
      if (!(epicIssue.key in this.epicsTotalTime)) {
        this.epicsTotalTime[epicIssue.key] = {
          epicIssue,
          totalTimeSpentSeconds: 0,
        };
      }
      this.epicsTotalTime[epicIssue.key].totalTimeSpentSeconds += worklog.timeSpentSeconds;
    });

    return this.epicsTotalTime;
  }

  async fetchWorklogsForUsers(users: User[], reportQuery: ReportQuery): Promise<WorklogResponse[]> {
    const allWorklogs: WorklogResponse[] = [];

    const userWorklogsPromise = users.map(
      (user) => this.worklogRepository.getWorklogsForUserInDateRange(
        user,
        reportQuery.from,
        reportQuery.to,
      ),
    );

    const usersWorklogs = await Promise.all(userWorklogsPromise);

    usersWorklogs.forEach((userWorklogs) => {
      allWorklogs.push(...userWorklogs);
    });

    return allWorklogs;
  }

  async fetchIssuesForWorklogs(worklogs: WorklogResponse[]): Promise<IssueObject[]> {
    const issuesPromise = worklogs.map(
      (worklog) => {
        const issueKey = worklog.issue.key;
        return this.fetchIssue(issueKey);
      },
    );

    return Promise.all(issuesPromise);
  }

  async fetchParentsForIssues(issues: IssueObject[]): Promise<(IssueObject|null)[]> {
    const parentIssuesPromise = issues.map(
      (issue) => {
        const parentIssueKey = issue.fields.parent?.key;
        if (parentIssueKey === undefined) {
          return Promise.resolve(null);
        }
        return this.fetchIssue(parentIssueKey);
      },
    );

    return Promise.all(parentIssuesPromise);
  }

  async fetchEpicsForIssues(issues: IssueObject[]): Promise<(IssueObject|null)[]> {
    const epicIssuesPromise = issues.map(
      (issue) => {
        const epicIssueKey = issue.fields[this.jiraEpicCustomFieldKey];
        if (epicIssueKey === null) {
          return Promise.resolve(null);
        }
        return this.fetchIssue(epicIssueKey);
      },
    );

    return Promise.all(epicIssuesPromise);
  }

  async fetchIssue(issueKey: string): Promise<IssueObject> {
    if (issueKey in this.issueCache) {
      return Promise.resolve(this.issueCache[issueKey]);
    }
    const issue = await this.jiraClient.findIssue(issueKey);
    this.issueCache[issueKey] = issue;
    return issue;
  }

  getCachedIssueByKey(issueKey: string): IssueObject {
    if (!(issueKey in this.issueCache)) {
      throw Error(`Cache did not have issueKey: ${issueKey}`);
    }
    return this.issueCache[issueKey];
  }

  getCachedEpicOrMainIssueForIssue(issue: IssueObject): IssueObject {
    const parentIssueKey = issue.fields?.parent?.key;
    if (parentIssueKey !== undefined) {
      return this.getCachedEpicOrMainIssueForIssue(this.getCachedIssueByKey(parentIssueKey));
    }
    const epicIssueKey = issue.fields[this.jiraEpicCustomFieldKey];
    if (epicIssueKey !== null) {
      return this.getCachedIssueByKey(epicIssueKey);
    }
    return issue;
  }
}
