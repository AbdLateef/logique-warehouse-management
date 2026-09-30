export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface FieldError {
  field: string;
  reason: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: FieldError[];
}
