import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filter?: Record<string, string>;
}

export function parsePagination(req: Request, defaultSort = 'createdAt'): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;
  const search = (req.query.search as string) || undefined;
  const sortBy = (req.query.sortBy as string) || defaultSort;
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

  const filter: Record<string, string> = {};
  if (req.query.role) filter.role = req.query.role as string;
  if (req.query.published) filter.published = req.query.published as string;
  if (req.query.mimetype) filter.mimetype = req.query.mimetype as string;

  return { page, limit, skip, search, sortBy, sortOrder, filter };
}

export function buildPaginatedResponse<T>(data: T[], total: number, params: PaginationParams) {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}
