import JiraApi from 'jira-client';
import UserRepository from '../src/userRepository';

jest.mock('jira-client');

describe('UserRepository', () => {
  it('getUserByUsername succeeds', async () => {
    const mockJiraClient: jest.Mocked<JiraApi> = new JiraApi({ host: '' }) as jest.Mocked<JiraApi>;
    mockJiraClient.searchUsers.mockImplementation(async () => (
      [
        {
          displayName: 'Bobby Tables',
          accountId: 'ABC123',
        },
      ]
    ));
    const userRepository = new UserRepository(mockJiraClient);
    const user = await userRepository.getUserByUsername('bob@example.com');
    expect(user.displayName).toEqual('Bobby Tables');
    expect(user.accountId).toEqual('ABC123');
  });

  it('getUserByUsername fails with 0 results', async () => {
    expect.assertions(1);
    const mockJiraClient: jest.Mocked<JiraApi> = new JiraApi({ host: '' }) as jest.Mocked<JiraApi>;
    mockJiraClient.searchUsers.mockImplementation(async () => ([]));
    const userRepository = new UserRepository(mockJiraClient);
    try {
      await userRepository.getUserByUsername('bob@example.com');
    } catch (e) {
      expect(e.message).toMatch("Username 'bob@example.com' not found");
    }
  });

  it('getUserByUsername fails with > 1 results', async () => {
    expect.assertions(1);
    const mockJiraClient: jest.Mocked<JiraApi> = new JiraApi({ host: '' }) as jest.Mocked<JiraApi>;
    mockJiraClient.searchUsers.mockImplementation(async () => ([
      {
        displayName: 'Bobby Tables',
        accountId: 'ABC123',
      },
      {
        displayName: 'Simon Kobob',
        accountId: 'EFG456',
      },
    ]));
    const userRepository = new UserRepository(mockJiraClient);
    try {
      await userRepository.getUserByUsername('bob@example.com');
    } catch (e) {
      expect(e.message).toMatch("Multiple results for username 'bob@example.com' found");
    }
  });

  it('getUsersByUsernames succeeds', async () => {
    const mockJiraClient: jest.Mocked<JiraApi> = new JiraApi({ host: '' }) as jest.Mocked<JiraApi>;
    let numberOfCalls = 0;
    mockJiraClient.searchUsers.mockImplementation(async () => {
      numberOfCalls += 1;
      if (numberOfCalls === 1) {
        return [
          {
            displayName: 'Bobby Tables',
            accountId: 'ABC123',
          },
        ];
      }
      return [
        {
          displayName: 'Alice Liddell',
          accountId: 'HIJ789',
        },
      ];
    });
    const userRepository = new UserRepository(mockJiraClient);
    const users = await userRepository.getUsersByUsernames(['bob@example.com', 'alice@example.com']);
    expect(users).toHaveLength(2);
    expect(users[0].displayName).toBe('Bobby Tables');
    expect(users[1].displayName).toBe('Alice Liddell');
  });
});
