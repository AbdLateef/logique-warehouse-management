import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemService } from '../services/itemService'
import { ItemQueryParams, CreateItemPayload, UpdateItemPayload } from '../types'

export const ITEM_KEYS = {
  all: ['items'] as const,
  lists: () => [...ITEM_KEYS.all, 'list'] as const,
  list: (params?: ItemQueryParams) => [...ITEM_KEYS.lists(), params] as const,
  details: () => [...ITEM_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ITEM_KEYS.details(), id] as const,
  categories: () => [...ITEM_KEYS.all, 'categories'] as const,
}

export function useItems(params?: ItemQueryParams) {
  return useQuery({
    queryKey: ITEM_KEYS.list(params),
    queryFn: () => itemService.getItems(params),
    staleTime: 5000,
  })
}

export function useItemDetail(id: string) {
  return useQuery({
    queryKey: ITEM_KEYS.detail(id),
    queryFn: () => itemService.getItemById(id),
    enabled: !!id,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ITEM_KEYS.categories(),
    queryFn: () => itemService.getCategories(),
    staleTime: 60000,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateItemPayload) => itemService.createItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all })
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateItemPayload }) =>
      itemService.updateItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all })
    },
  })
}
