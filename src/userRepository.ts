import JiraApi from 'jira-client';
import User from './user';

export interface UserRepositoryInterface {
  getUserByUsername(username: string): Promise<User>;
  getUsersByUsernames(usernames: string[]): Promise<User[]>;
}

export default class UserRepository implements UserRepositoryInterface {
  private readonly jiraClient: JiraApi;

  constructor(jiraClient: JiraApi) {
    this.jiraClient = jiraClient;
  }

  async getUserByUsername(username: string): Promise<User> {
    const searchResult = await this.jiraClient.searchUsers({
      username,
    });

    if (searchResult.length === 0) {
      throw Error(`Username '${username}' not found`);
    }

    if (searchResult.length > 1) {
      throw Error(`Multiple results for username '${username}' found`);
    }

    return {
      displayName: searchResult[0].displayName,
      accountId: searchResult[0].accountId,
      username,
    };
  }

  async getUsersByUsernames(usernames: string[]): Promise<User[]> {
    return Promise.all(usernames.map(
      async (username): Promise<User> => this.getUserByUsername(username),
    ));
  }
}
