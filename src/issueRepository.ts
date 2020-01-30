import JiraApi, { IssueObject } from 'jira-client';

export interface IssueRepositoryInterface {
  fetchIssue(issueKey: string): Promise<IssueObject>;
}

export default class IssueRepository implements IssueRepositoryInterface {
  private readonly jiraClient: JiraApi;

  constructor(jiraClient: JiraApi) {
    this.jiraClient = jiraClient;
  }

  public async fetchIssue(issueKey: string): Promise<IssueObject> {
    return this.jiraClient.findIssue(issueKey);
  }
}
