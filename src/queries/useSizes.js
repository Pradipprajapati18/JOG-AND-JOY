import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sizesApi } from '../api/endpoints/sizes';

export function useSizesList(filters = {}) {
  return useQuery({
    queryKey: ['sizes', filters],
    queryFn: () => sizesApi.list(filters),
  });
}

export function useCreateSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sizesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sizes'] });
    },
  });
}

export function useUpdateSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => sizesApi.update(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sizes'] });
    },
  });
}

export function useDeleteSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sizesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sizes'] });
    },
  });
}
