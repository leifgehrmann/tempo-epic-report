import JiraApi from 'jira-client';
import TempoApi from 'tempo-client';
import Report from '../src/report';

jest.mock('jira-client');
jest.mock('tempo-client');

describe('Report', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('Constructor succeeds', async () => {
    const mockJiraClient: jest.Mocked<JiraApi> = new JiraApi({ host: '' }) as jest.Mocked<JiraApi>;
    jest.mock('tempo-client');
    const mockTempoClient: jest.Mocked<TempoApi> = new TempoApi({
      apiVersion: '',
      protocol: '',
      host: '',
    }) as jest.Mocked<TempoApi>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const report = new Report(mockJiraClient, mockTempoClient, 'customfield_12345');
  });
});
