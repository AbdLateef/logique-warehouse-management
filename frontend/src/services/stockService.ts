import api from './api';
import { ApiResponse, StockDetail, ReceiveStockPayload } from '../types';

export const stockService = {
  receiveStock: async (payload: ReceiveStockPayload): Promise<ApiResponse<StockDetail>> => {
    const response = await api.post<ApiResponse<StockDetail>>('/api/v1/stock/receive', payload);
    return response.data;
  },

  getStockByItemId: async (itemId: string): Promise<ApiResponse<StockDetail[]>> => {
    const response = await api.get<ApiResponse<StockDetail[]>>(`/api/v1/stock/${itemId}`);
    return response.data;
  },
};
