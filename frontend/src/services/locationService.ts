import api from './api';
import { ApiResponse, Location } from '../types';

export const locationService = {
  getLocations: async (): Promise<ApiResponse<Location[]>> => {
    const response = await api.get<ApiResponse<Location[]>>('/api/v1/locations');
    return response.data;
  },
};
