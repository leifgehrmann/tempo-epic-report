import JiraApi, { IssueObject } from 'jira-client';

export default class IssueRepository {
  private readonly jiraClient: JiraApi;

  constructor(jiraClient: JiraApi) {
    this.jiraClient = jiraClient;
  }

  public async fetchIssue(issueKey: string): Promise<IssueObject> {
    return this.jiraClient.findIssue(issueKey);
  }
}
