import type { Order } from "@/types/order";

const ORDERS_STORAGE_KEY = "siac-studio-orders";

function getOrders(): Order[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);

    if (!savedOrders) {
      return [];
    }

    return JSON.parse(savedOrders) as Order[];
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify(orders)
    );
  } catch (error) {
    console.error("Erro ao salvar pedidos:", error);
  }
}

export function createOrder(order: Order): Order {
  const orders = getOrders();

  const updatedOrders = [...orders, order];

  saveOrders(updatedOrders);

  return order;
}

export function getOrderById(
  orderId: string
): Order | null {
  const orders = getOrders();

  return (
    orders.find((order) => order.id === orderId) ?? null
  );
}

export function getAllOrders(): Order[] {
  return getOrders();
}