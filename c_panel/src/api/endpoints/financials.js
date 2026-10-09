import * as mockApi from '../mockApi';
import { computeRevenueSummary, computePayoutSchedule, computeSalesSeries } from '../../utils/selectors';

export const financialsApi = {
  async getSummary({ from, to } = {}) {
    const ordersRes = await mockApi.list('orders');
    return computeRevenueSummary(ordersRes.data || [], { from, to });
  },
  async getPayouts() {
    // We don't have a payouts table in Supabase right now, returning empty array
    return [];
  },
  async getSalesSeries({ granularity } = {}) {
    const ordersRes = await mockApi.list('orders');
    return computeSalesSeries(ordersRes.data || [], { granularity });
  }
};
