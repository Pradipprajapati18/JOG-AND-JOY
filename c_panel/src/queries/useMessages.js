import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/endpoints/messages';

export function useMessagesList(filters) {
  return useQuery({
    queryKey: ['messages', filters],
    queryFn: () => messagesApi.list(filters),
  });
}

export function useMessage(id) {
  return useQuery({
    queryKey: ['messages', id],
    queryFn: () => messagesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}

export function useUpdateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => messagesApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}
