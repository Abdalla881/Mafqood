export interface PaginationResult<T> {
  status?: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
  nextPage?: number;
  prevPage?: number;
}
