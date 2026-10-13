import { useOrdersList } from './useOrders';
import { useSettingsContext } from '../context/SettingsContext';

export function useRecentActivity() {
  const { formatDate } = useSettingsContext();
  
  // Fetch the 10 most recent orders for our activity stream
  const { data: ordersData, isLoading } = useOrdersList({ pageSize: 10, sort: '-createdAt' });

  let activities = [];

  if (ordersData?.data) {
    activities = ordersData.data.map((order, idx) => {
      // Determine activity type and message based on status
      let type = 'info';
      let title = `Order ${order.orderNumber || order.id} placed`;
      
      if (order.status === 'SHIPPED') {
        type = 'success';
        title = `Order ${order.orderNumber || order.id} shipped`;
      } else if (order.status === 'DELIVERED') {
        type = 'success';
        title = `Order ${order.orderNumber || order.id} delivered`;
      } else if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
        type = 'error';
        title = `Order ${order.orderNumber || order.id} ${order.status.toLowerCase()}`;
      } else if (order.paymentStatus === 'failed') {
        type = 'error';
        title = `Payment failed for ${order.orderNumber || order.id}`;
      } else if (order.status === 'ON_HOLD') {
        type = 'warning';
        title = `Order ${order.orderNumber || order.id} on hold`;
      }

      return {
        id: `act_${order.id}_${idx}`,
        sourceId: order.id,
        type,
        title,
        time: formatDate(order.createdAt),
        rawDate: order.createdAt,
        read: idx > 2 // Mock read state: first 3 are unread
      };
    });
  }

  // Sort strictly by rawDate descending just in case
  activities.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

  return { activities, isLoading };
}
