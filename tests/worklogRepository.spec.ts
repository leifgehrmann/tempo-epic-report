import { mockDeep } from 'jest-mock-extended';
import TempoApi from 'tempo-client';
import { PaginatedResultSetResponse, WorklogResponse } from 'tempo-client/lib/responseTypes';
import WorklogRepository from '../src/worklogRepository';

jest.mock('tempo-client');

function fakePaginatedResult(
  worklogs: WorklogResponse[],
): PaginatedResultSetResponse<WorklogResponse> {
  return {
    self: '',
    metadata: {
      count: worklogs.length,
      offset: 0,
      limit: 20,
      next: '',
    },
    results: worklogs,
  };
}

function fakeWorklog(): WorklogResponse {
  return {
    self: '',
    tempoWorklogId: 1234,
    issue: {
      self: '',
      key: '',
    },
    timeSpentSeconds: 1000,
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

describe('WorklogRepository', () => {
  it('getUserByUsername succeeds', async () => {
    const mockTempoClient = mockDeep<TempoApi>();
    const fakeResult = fakePaginatedResult([fakeWorklog(), fakeWorklog()]);
    mockTempoClient.worklogs.getForUser.mockReturnValue(Promise.resolve(fakeResult));

    const worklogRepository = new WorklogRepository(mockTempoClient);
    const user = { accountId: '', displayName: '', username: '' };
    const worklogs = await worklogRepository.getWorklogsForUserInDateRange(
      user,
      new Date(),
      new Date(),
    );

    expect(worklogs).toHaveLength(2);
  });
});
