import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/endpoints/orders';
import { supabase } from '../lib/supabase';

export function useOrdersList(filters) {
  const qc = useQueryClient();

  useEffect(() => {
    let channel;
    try {
      const channelId = `orders-list-${Math.random().toString(36).slice(2, 9)}`;
      channel = supabase
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          qc.invalidateQueries({ queryKey: ['orders'] });
        });
      channel.subscribe();
    } catch {
      // ignore
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [qc]);

  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.list(filters),
    refetchInterval: 3000, // 3-second auto-poll guarantee across windows/tabs
  });
}

export function useOrder(id) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!id) return;
    let channel;
    try {
      const channelId = `order-${id}-${Math.random().toString(36).slice(2, 9)}`;
      channel = supabase
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          qc.invalidateQueries({ queryKey: ['orders'] });
          qc.invalidateQueries({ queryKey: ['orders', id] });
        });
      channel.subscribe();
    } catch {
      // ignore
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [id, qc]);

  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
    refetchInterval: 3000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => ordersApi.update(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
