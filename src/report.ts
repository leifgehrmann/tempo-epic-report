import { WorklogResponse } from 'tempo-client/lib/responseTypes';
import { IssueObject } from 'jira-client';
import WorklogRepository from './worklogRepository';
import User from './user';
import IssueRepository from './issueRepository';

interface EpicsTotalTimeReport {
  [key: string]: {
    epicIssue: IssueObject;
    totalTimeSpentSeconds: number;
  };
}

interface ReportQuery {
  users: User[];
  from: Date;
  to: Date;
}

export default class Report {
  private readonly jiraEpicCustomFieldKey: string;

  private readonly issueRepository: IssueRepository;

  private readonly worklogRepository: WorklogRepository;

  private readonly issueCache: { [key: string]: IssueObject };

  private readonly epicsTotalTime: EpicsTotalTimeReport;

  constructor(
    issueRepository: IssueRepository,
    worklogRepository: WorklogRepository,
    jiraEpicCustomFieldKey: string,
  ) {
    this.issueRepository = issueRepository;
    this.worklogRepository = worklogRepository;
    this.jiraEpicCustomFieldKey = jiraEpicCustomFieldKey;
    this.issueCache = {};
    this.epicsTotalTime = {};
  }

  async execute(reportQuery: ReportQuery): Promise<EpicsTotalTimeReport> {
    // 1. Fetch all the worklogs for each username
    const allWorklogs = await this.fetchWorklogsForUsers(reportQuery.users, reportQuery);

    // 2. For each worklog, fetch the issue
    await this.fetchIssuesForWorklogs(allWorklogs);

    // 3. For each issue, fetch the epic
    await this.fetchParentsForIssues(Object.values(this.issueCache));

    // 4. For each issue, fetch the parent
    await this.fetchEpicsForIssues(Object.values(this.issueCache));

    // 5. Accumulate the worklog timings for each worklog, grouped by epic or issue
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

  private async fetchWorklogsForUsers(
    users: User[],
    reportQuery: ReportQuery,
  ): Promise<WorklogResponse[]> {
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

  private async fetchIssuesForWorklogs(worklogs: WorklogResponse[]): Promise<IssueObject[]> {
    const issuesPromise = worklogs.map(
      (worklog) => {
        const issueKey = worklog.issue.key;
        return this.fetchIssue(issueKey);
      },
    );

    return Promise.all(issuesPromise);
  }

  private async fetchParentsForIssues(issues: IssueObject[]): Promise<(IssueObject|null)[]> {
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

  private async fetchEpicsForIssues(issues: IssueObject[]): Promise<(IssueObject|null)[]> {
    const epicIssuesPromise = issues.map(
      (issue) => {
        const epicIssueKey = issue.fields[this.jiraEpicCustomFieldKey];
        if (epicIssueKey === undefined || epicIssueKey === null) {
          return Promise.resolve(null);
        }
        return this.fetchIssue(epicIssueKey);
      },
    );

    return Promise.all(epicIssuesPromise);
  }

  private async fetchIssue(issueKey: string): Promise<IssueObject> {
    if (issueKey in this.issueCache) {
      return Promise.resolve(this.issueCache[issueKey]);
    }
    const issue = await this.issueRepository.fetchIssue(issueKey);
    this.issueCache[issueKey] = issue;
    return issue;
  }

  private getCachedIssueByKey(issueKey: string): IssueObject {
    if (!(issueKey in this.issueCache)) {
      throw Error(`Cache did not have issueKey: ${issueKey}`);
    }
    return this.issueCache[issueKey];
  }

  private getCachedEpicOrMainIssueForIssue(issue: IssueObject): IssueObject {
    const parentIssueKey = issue.fields?.parent?.key;
    if (parentIssueKey !== null && parentIssueKey !== undefined) {
      return this.getCachedEpicOrMainIssueForIssue(this.getCachedIssueByKey(parentIssueKey));
    }
    const epicIssueKey = issue.fields[this.jiraEpicCustomFieldKey];
    if (epicIssueKey !== null && epicIssueKey !== undefined) {
      return this.getCachedIssueByKey(epicIssueKey);
    }
    return issue;
  }
}
