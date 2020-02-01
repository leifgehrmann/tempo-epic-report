import { mock } from 'jest-mock-extended';
import { WorklogResponse } from 'tempo-client/lib/responseTypes';
import { IssueObject } from 'jira-client';
import Report from '../src/report';
import IssueRepository from '../src/issueRepository';
import WorklogRepository from '../src/worklogRepository';
import User from '../src/user';

const jiraEpicCustomFieldKey = 'customfield_12345';

function fakeUser(name: string): User {
  return {
    accountId: name,
    displayName: `User ${name}`,
    username: `${name}@example.com`,
  };
}

function fakeWorklog(timeSpentSeconds: number, issueKey: string): WorklogResponse {
  return {
    self: '',
    tempoWorklogId: 1234,
    issue: {
      self: '',
      key: issueKey,
    },
    timeSpentSeconds,
    billableSeconds: 0,
    startDate: '2020-01-01',
    startTime: '12:00',
    description: '',
    createdAt: '',
    updatedAt: '',
    author: {
      self: '',
      accountId: '',
      displayName: '',
    },
    attributes: {
      self: '',
      values: [],
    },
  };
}

function fakeIssue(
  key: string,
  summary: string,
  parentType: null|'epic'|'subTask' = null,
  parentKey: null|string = null,
): IssueObject {
  const issue: IssueObject = {
    id: '12345',
    key,
    fields: {
      summary,
    },
  };

  if (parentType === 'epic') {
    issue.fields[jiraEpicCustomFieldKey] = parentKey;
  } else if (parentType === 'subTask') {
    issue.fields.parent = { key: parentKey };
  }

  return issue;
}

describe('Report', () => {
  it('Generates report', async () => {
    const alice = fakeUser('alice');
    const bob = fakeUser('bob');
    const from = new Date('2020-01-01');
    const to = new Date('2020-01-07');

    const issueRepository = mock<IssueRepository>();
    issueRepository.fetchIssue
      .calledWith('TEST-1')
      .mockResolvedValue(fakeIssue('TEST-1', 'Achilles', 'subTask', 'TEST-4'));
    issueRepository.fetchIssue
      .calledWith('TEST-2')
      .mockResolvedValue(fakeIssue('TEST-2', 'Skylla & Charybdis', 'epic', 'TEST-3'));
    issueRepository.fetchIssue
      .calledWith('TEST-3')
      .mockResolvedValue(fakeIssue('TEST-3', 'Odyssey'));
    issueRepository.fetchIssue
      .calledWith('TEST-4')
      .mockResolvedValue(fakeIssue('TEST-4', 'Illiad'));

    const worklogRepository = mock<WorklogRepository>();
    worklogRepository.getWorklogsForUserInDateRange
      .calledWith(alice, from, to)
      .mockResolvedValue([
        fakeWorklog(1000, 'TEST-1'),
        fakeWorklog(290, 'TEST-2'),
      ]);
    worklogRepository.getWorklogsForUserInDateRange
      .calledWith(bob, from, to)
      .mockResolvedValue([
        fakeWorklog(2300, 'TEST-2'),
        fakeWorklog(500, 'TEST-3'),
      ]);

    const report = new Report(issueRepository, worklogRepository, jiraEpicCustomFieldKey);
    const result = await report.execute({
      users: [alice, bob],
      from,
      to,
    });

    expect(Object.keys(result)).toHaveLength(2);
    expect(result['TEST-3'].totalTimeSpentSeconds).toEqual(3090);
    expect(result['TEST-4'].totalTimeSpentSeconds).toEqual(1000);
    expect(result['TEST-3'].epicIssue.fields.summary).toEqual('Odyssey');
    expect(result['TEST-4'].epicIssue.fields.summary).toEqual('Illiad');
  });
});
