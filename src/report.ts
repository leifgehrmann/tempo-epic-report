import TempoApi from 'tempo-client';
import { WorklogResponse } from 'tempo-client/lib/responseTypes';
import JiraApi, { IssueObject } from 'jira-client';
import UserRepository from './userRepository';
import WorklogRepository from './worklogRepository';
import User from './user';

type IssueKey = string;

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

  private readonly issueEpicMap: { [key: string]: IssueKey };

  constructor(jiraClient: JiraApi, tempoClient: TempoApi, jiraEpicCustomFieldKey: string) {
    this.jiraClient = jiraClient;
    this.tempoClient = tempoClient;
    this.jiraEpicCustomFieldKey = jiraEpicCustomFieldKey;
    this.userRepository = new UserRepository(this.jiraClient);
    this.worklogRepository = new WorklogRepository(this.tempoClient);
    this.issueCache = {};
    this.issueEpicMap = {};
  }

  async execute(reportQuery: ReportQuery): Promise<string> {
    // 1. Fetch the usernames from JIRA
    const users = await this.userRepository.getUsersByUsernames(reportQuery.usernames);

    // 2. Fetch all the worklogs for each username
    const allWorklogs = await this.fetchWorklogsForUsers(users, reportQuery);

    // 3. For each worklog, fetch the issue
    const issues = await this.fetchIssuesForWorklogs(allWorklogs);

    // 4. For each issue, fetch the epic
    // const epics = await this.fetchEpicsForWorklogs();

    // 5. Accumulate the worklog timings for each worklog, grouped by epic or issue

    return JSON.stringify(issues);
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

  // async fetchEpicsForIssues(issues: IssueObject[]) {
  //
  // }

  async fetchIssue(issueKey: string): Promise<IssueObject> {
    if (issueKey in this.issueCache) {
      return Promise.resolve(this.issueCache[issueKey]);
    }
    const issue = await this.jiraClient.findIssue(issueKey);
    this.issueCache[issueKey] = issue;
    return issue;
  }
}
