import api from './api';
import { ApiResponse, StockDetail, ReceiveStockPayload, TransferStockPayload, StockMutationLog } from '../types';

export const stockService = {
  receiveStock: async (payload: ReceiveStockPayload): Promise<ApiResponse<StockDetail>> => {
    const response = await api.post<ApiResponse<StockDetail>>('/api/v1/stock/receive', payload);
    return response.data;
  },

  transferStock: async (payload: TransferStockPayload): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/api/v1/stock/transfer', payload);
    return response.data;
  },

  getStockByItemId: async (itemId: string): Promise<ApiResponse<StockDetail[]>> => {
    const response = await api.get<ApiResponse<StockDetail[]>>(`/api/v1/stock/${itemId}`);
    return response.data;
  },

  getStockLogsByItemId: async (itemId: string): Promise<ApiResponse<StockMutationLog[]>> => {
    const response = await api.get<ApiResponse<StockMutationLog[]>>(`/api/v1/stock/${itemId}/logs`);
    return response.data;
  },
};
