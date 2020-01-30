import { WorklogResponse } from 'tempo-client/lib/responseTypes';
import TempoApi from 'tempo-client';
import User from './user';
import paginate from './autoPaginator';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export interface WorklogRepositoryInterface {
  getWorklogsForUserInDateRange(
    user: User,
    from: Date,
    to: Date,
  ): Promise<WorklogResponse[]>;
}

export default class WorklogRepository implements WorklogRepositoryInterface {
  private readonly tempoClient: TempoApi;

  constructor(tempoClient: TempoApi) {
    this.tempoClient = tempoClient;
  }

  async getWorklogsForUserInDateRange(
    user: User,
    from: Date,
    to: Date,
  ): Promise<WorklogResponse[]> {
    return paginate((limit, offset) => this.tempoClient.worklogs.getForUser(user.accountId, {
      from: formatDate(from),
      to: formatDate(to),
      limit,
      offset,
    }));
  }
}
