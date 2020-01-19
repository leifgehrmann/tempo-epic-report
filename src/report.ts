import TempoApi from 'tempo-client';
import JiraApi from 'jira-client';
import UserRepository from './userRepository';

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
    const users = await userRepository.getUsersByUsernames(reportQuery.usernames);

    const worklogs: string[] = [];
    users.forEach((user) => {
      worklogs.push(user.displayName);
    });

    // 4. Fetch all the worklogs for the usernames

    // 5. For each worklog, fetch the issue
    // 6. For each issue, fetch the epic
    // 7. Accumulate the worklog timings for each worklog, grouped by epic or issue

    return JSON.stringify(worklogs);
  }
}
