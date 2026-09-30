import { useQuery } from '@tanstack/react-query'
import { locationService } from '../services/locationService'

export const LOCATION_KEYS = {
  all: ['locations'] as const,
}

export function useLocations() {
  return useQuery({
    queryKey: LOCATION_KEYS.all,
    queryFn: () => locationService.getLocations(),
    staleTime: 60000,
  })
}
