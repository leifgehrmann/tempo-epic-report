import { PaginatedResultSetResponse } from 'tempo-client/lib/responseTypes';

// Auto-Paginates a "PaginatedResultSetResponse" until the number of results for a
// page is less than the max.

export default async function paginate<T>(
  callback: (limit: string, offset: string) => Promise<PaginatedResultSetResponse<T>>,
  limit = 20,
): Promise<T[]> {
  const results: T[] = [];
  const maxOffset = 1000;
  let previousResultCount = 0;
  let offset = 0;
  while (previousResultCount === limit || offset === 0) {
    // eslint-disable-next-line no-await-in-loop
    const result = await callback(String(limit), String(offset));
    results.push(...result.results);

    previousResultCount = result.metadata.count;
    offset += limit;

    if (offset > maxOffset) {
      break;
    }
  }
  return results;
}
