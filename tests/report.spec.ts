import { mock } from 'jest-mock-extended';
import Report from '../src/report';
import IssueRepository from '../src/issueRepository';
import WorklogRepository from '../src/worklogRepository';

describe('Report', () => {
  it('Constructor succeeds', async () => {
    const issueRepository = mock<IssueRepository>();
    const worklogRepository = mock<WorklogRepository>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const report = new Report(issueRepository, worklogRepository, 'customfield_12345');
  });
});
