export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  total_stock?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateItemPayload {
  sku: string;
  name: string;
  category: string;
  unit: string;
}

export interface UpdateItemPayload {
  sku: string;
  name: string;
  category: string;
  unit: string;
}

export interface ItemQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}
