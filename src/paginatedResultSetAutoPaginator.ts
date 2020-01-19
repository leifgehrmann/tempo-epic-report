import { PaginatedResultSetResponse } from 'tempo-client/lib/responseTypes';

export default async function paginate<T>(
  callback: (limit: string, offset: string) => Promise<PaginatedResultSetResponse<T>>,
): Promise<T[]> {
  const results: T[] = [];
  const limit = 20;
  const maxOffset = 100;
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
