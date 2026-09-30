import api from './api';
import { ApiResponse, Item, CreateItemPayload, UpdateItemPayload, ItemQueryParams } from '../types';

export const itemService = {
  getItems: async (params?: ItemQueryParams): Promise<ApiResponse<Item[]>> => {
    const response = await api.get<ApiResponse<Item[]>>('/api/v1/items', { params });
    return response.data;
  },

  getItemById: async (id: string): Promise<ApiResponse<Item>> => {
    const response = await api.get<ApiResponse<Item>>(`/api/v1/items/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>('/api/v1/items/categories');
    return response.data;
  },

  createItem: async (payload: CreateItemPayload): Promise<ApiResponse<Item>> => {
    const response = await api.post<ApiResponse<Item>>('/api/v1/items', payload);
    return response.data;
  },

  updateItem: async (id: string, payload: UpdateItemPayload): Promise<ApiResponse<Item>> => {
    const response = await api.put<ApiResponse<Item>>(`/api/v1/items/${id}`, payload);
    return response.data;
  },

  deleteItem: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/api/v1/items/${id}`);
    return response.data;
  },
};
