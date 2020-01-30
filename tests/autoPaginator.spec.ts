import { PaginatedResultSetResponse } from 'tempo-client/lib/responseTypes';
import paginate from '../src/autoPaginator';

interface Foo {
  name: string;
}

describe('AutoPaginator', () => {
  it('paginates one page successfully', async () => {
    const result = await paginate<Foo>(
      async (limit, offset): Promise<PaginatedResultSetResponse<Foo>> => ({
        self: '',
        metadata: {
          count: 3,
          offset: parseInt(offset, 10),
          limit: parseInt(limit, 10),
          next: '',
          previous: '',
        },
        results: [
          { name: 'Alice' },
          { name: 'Bob' },
          { name: 'Carrol' },
        ],
      }),
    );

    expect(result).toHaveLength(3);
  });

  it('paginates multiple pages successfully', async () => {
    const result = await paginate<Foo>(
      async (limit, offset): Promise<PaginatedResultSetResponse<Foo>> => {
        let pageResult: Foo[] = [];
        if (offset === '0') {
          pageResult = [
            { name: 'Alice' },
            { name: 'Bob' },
            { name: 'Carrol' },
          ];
        } else if (offset === '3') {
          pageResult = [
            { name: 'Danny' },
            { name: 'Erin' },
            { name: 'Fiona' },
          ];
        } else if (offset === '6') {
          pageResult = [
            { name: 'Gary' },
          ];
        }
        return {
          self: '',
          metadata: {
            count: 3,
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
            next: '',
            previous: '',
          },
          results: pageResult,
        };
      },
      3,
    );

    expect(result).toHaveLength(7);
  });
});
