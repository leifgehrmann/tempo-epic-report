import TempoApi from 'tempo-client';
import { WorklogResponse } from 'tempo-client/lib/responseTypes';
import JiraApi from 'jira-client';
import UserRepository from './userRepository';
import WorklogRepository from './worklogRepository';

interface ReportQuery {
  usernames: string[];
  from: Date;
  to: Date;
}

export default class Report {
  private readonly jiraClient: JiraApi;

  private readonly tempoClient: TempoApi;

  constructor(jiraClient: JiraApi, tempoClient: TempoApi) {
    this.jiraClient = jiraClient;
    this.tempoClient = tempoClient;
  }

  async execute(reportQuery: ReportQuery): Promise<string> {
    // 1. Fetch the usernames from JIRA
    const userRepository = new UserRepository(this.jiraClient);
    const worklogRepository = new WorklogRepository(this.tempoClient);
    const users = await userRepository.getUsersByUsernames(reportQuery.usernames);

    const allWorklogs: WorklogResponse[] = [];

    // 2. Fetch all the worklogs for each username
    const userWorklogsPromise = users.map((user) => worklogRepository.getWorklogsForUserInDateRange(
      user,
      reportQuery.from,
      reportQuery.to,
    ));

    const usersWorklogs = await Promise.all(userWorklogsPromise);

    usersWorklogs.forEach((userWorklogs) => {
      allWorklogs.push(...userWorklogs);
    });

    // 3. For each worklog, fetch the issue
    // 4. For each issue, fetch the epic
    // 5. Accumulate the worklog timings for each worklog, grouped by epic or issue

    return JSON.stringify(allWorklogs);
  }
}
