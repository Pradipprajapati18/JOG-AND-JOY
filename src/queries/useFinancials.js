import { useQuery } from '@tanstack/react-query';
import { financialsApi } from '../api/endpoints/financials';

export function useRevenueSummary(params) {
  return useQuery({
    queryKey: ['financials', 'summary', params],
    queryFn: () => financialsApi.getSummary(params),
  });
}

export function usePayouts() {
  return useQuery({
    queryKey: ['financials', 'payouts'],
    queryFn: financialsApi.getPayouts,
  });
}

export function useSalesSeries(params) {
  return useQuery({
    queryKey: ['financials', 'salesSeries', params],
    queryFn: () => financialsApi.getSalesSeries(params),
  });
}
