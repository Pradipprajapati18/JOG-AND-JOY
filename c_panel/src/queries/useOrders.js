import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/endpoints/orders';

export function useOrdersList(filters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.list(filters),
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => ordersApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
