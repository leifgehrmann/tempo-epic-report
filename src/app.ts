import JiraApi from 'jira-client';
import TempoApi from 'tempo-client';
import Config from './config';
import WorklogRepository from './worklogRepository';
import UserRepository from './userRepository';
import IssueRepository from './issueRepository';
import Report from './report';

interface AppArguments {
  usernames: string[];
  from: Date;
  to: Date;
}

export default class App {
  private config: Config;

  private userRepository: UserRepository;

  private readonly issueRepository: IssueRepository;

  private readonly worklogRepository: WorklogRepository;

  constructor(config: Config) {
    this.config = config;
    const jiraClient = new JiraApi({
      protocol: 'https',
      host: config.jiraHost,
      username: config.jiraUsername,
      password: config.jiraPassword,
      apiVersion: '2',
      strictSSL: true,
    });
    const tempoClient = new TempoApi({
      protocol: 'https',
      host: 'api.tempo.io',
      bearerToken: config.tempoApiBearerToken,
      apiVersion: '3',
    });
    this.userRepository = new UserRepository(jiraClient);
    this.issueRepository = new IssueRepository(jiraClient);
    this.worklogRepository = new WorklogRepository(tempoClient);
  }

  async execute(args: AppArguments): Promise<string> {
    const output: string[] = [];

    const users = await this.userRepository.getUsersByUsernames(args.usernames);

    const report = new Report(
      this.issueRepository,
      this.worklogRepository,
      this.config.jiraEpicCustomFieldKey,
    );

    const epicsTotalTimeReport = await report.execute(
      {
        users,
        from: args.from,
        to: args.to,
      },
    );

    Object.values(epicsTotalTimeReport).forEach((epicTotalTimeReport) => {
      const epicName = epicTotalTimeReport.epicIssue.fields.summary;
      const totalTimeInSeconds = epicTotalTimeReport.totalTimeSpentSeconds;
      const totalTimeInDays = (totalTimeInSeconds / (60 * 60 * this.config.hoursInDay)).toFixed(1);
      output.push(`[${totalTimeInDays} days] ${epicName}`);
    });

    return output.join('\n');
  }
}
