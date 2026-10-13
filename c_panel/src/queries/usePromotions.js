import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '../api/endpoints/promotions';

export function usePromotionsList(filters) {
  return useQuery({
    queryKey: ['promotions', filters],
    queryFn: () => promotionsApi.list(filters),
  });
}

export function usePromotion(id) {
  return useQuery({
    queryKey: ['promotions', id],
    queryFn: () => promotionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promotionsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => promotionsApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promotionsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  });
}
