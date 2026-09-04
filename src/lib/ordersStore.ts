import type { Order } from "@/types/order";

const orders = new Map<string, Order>();

export function saveOrder(order: Order) {
  orders.set(order.id, order);
}

export function getOrder(id: string) {
  return orders.get(id);
}

export function updateOrderStatus(
  id: string,
  status: Order["status"]
) {
  const order = orders.get(id);

  if (!order) {
    return null;
  }

  const updatedOrder: Order = {
    ...order,
    status,
  };

  orders.set(id, updatedOrder);

  return updatedOrder;
}

export function getOrders() {
  return Array.from(orders.values());
}