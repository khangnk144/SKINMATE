export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const API_ROOT_URL = API_URL.replace(/\/api\/v1\/?$/, '');

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const getItems = <T>(data: T[] | PaginatedResponse<T>): T[] => {
  return Array.isArray(data) ? data : data.items;
};

export const getPaginationMeta = <T>(data: T[] | PaginatedResponse<T>) => {
  if (Array.isArray(data)) {
    return {
      total: data.length,
      page: 1,
      limit: data.length || 1,
    };
  }

  return {
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const buildListUrl = (path: string, options?: { page?: number; limit?: number; search?: string }) => {
  const params = new URLSearchParams();

  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.search?.trim()) params.set('search', options.search.trim());

  const query = params.toString();
  return `${API_URL}${path}${query ? `?${query}` : ''}`;
};
