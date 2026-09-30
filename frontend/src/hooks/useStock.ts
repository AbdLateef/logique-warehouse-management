import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stockService } from '../services/stockService'
import { ReceiveStockPayload } from '../types'
import { ITEM_KEYS } from './useItems'

export const STOCK_KEYS = {
  all: ['stocks'] as const,
  byItem: (itemId: string) => [...STOCK_KEYS.all, 'item', itemId] as const,
}

export function useStockByItem(itemId: string) {
  return useQuery({
    queryKey: STOCK_KEYS.byItem(itemId),
    queryFn: () => stockService.getStockByItemId(itemId),
    enabled: !!itemId,
  })
}

export function useReceiveStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReceiveStockPayload) => stockService.receiveStock(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all })
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.byItem(variables.item_id) })
    },
  })
}
