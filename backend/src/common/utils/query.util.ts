// src/common/utils/query.util.ts
import { Model, FilterQuery } from 'mongoose';
import { QueryOptionsDto } from '../dto/query-options.dto';
import { PaginationResult } from '../interface/pagination-result.interface';

export async function paginateAndFilter<T>(
  model: Model<T>,
  options: QueryOptionsDto,
  filter: FilterQuery<T> = {},
  searchableFields: string[] = [],
): Promise<PaginationResult<T>> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const { sortBy, sortOrder, search } = options;

  // build query starting from provided filter
  const query: any = { ...filter };

  // search (if provided) across searchableFields
  if (search && searchableFields.length > 0) {
    query.$or = searchableFields.map((field) => ({
      [field]: { $regex: search, $options: 'i' },
    }));
  }

  // sorting
  const sort: any = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'DESC' ? -1 : 1;
  } else {
    // default sort (optional)
    sort.createdAt = -1;
  }

  const skip = (page - 1) * limit;

  // execute queries in parallel for performance
  console.log(
    '🔍 Final Query Sent to MongoDB:',
    JSON.stringify(query, null, 2),
  );

  const [data, total] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(limit).exec(),
    model.countDocuments(query).exec(),
  ]);

  const totalPages = Math.ceil(total / limit);

  const result: PaginationResult<T> = {
    status: true,
    page,
    limit,
    total,
    totalPages,
    data,
  };

  if (page * limit < total) result.nextPage = page + 1;
  if (skip > 0) result.prevPage = page - 1;

  return result;
}
