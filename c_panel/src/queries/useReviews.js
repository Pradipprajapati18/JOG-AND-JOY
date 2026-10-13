import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/endpoints/reviews';

export function useReviewsList(filters) {
  return useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => reviewsApi.list(filters),
  });
}

export function useReview(id) {
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => reviewsApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}
