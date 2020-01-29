import JiraApi from 'jira-client';
import IssueRepository from '../src/issueRepository';

jest.mock('jira-client');

describe('IssueRepository', () => {
  it('fetchIssue succeeds', async () => {
    const mockJiraClient: jest.Mocked<JiraApi> = new JiraApi({ host: '' }) as jest.Mocked<JiraApi>;
    mockJiraClient.findIssue.mockImplementation(async () => (
      {
        id: '12345',
        key: 'ABC-123',
      }
    ));
    const issueRepository = new IssueRepository(mockJiraClient);
    const issue = await issueRepository.fetchIssue('ABC-123');
    expect(issue.id).toEqual('12345');
    expect(issue.key).toEqual('ABC-123');
  });
});
