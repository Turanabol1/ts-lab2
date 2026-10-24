import { calculateLineTotal } from './catalog.js';
import { validateCustomerInput } from './validation.js';
import type { CartItem, DeliveryMethod, Order, OrderStatus } from './types.js';

// Зі цих статусів замовлення вже нікуди не переводиться
const FINAL_STATUSES: readonly OrderStatus[] = ['cancelled', 'delivered'];

export function calculateCartTotal(items: CartItem[], discountPercent: number = 0): number {
  return items.reduce(
    (sum, item) => sum + calculateLineTotal(item.product.price, item.quantity, discountPercent),
    0,
  );
}

export function createOrder(
  orderId: string,
  customerEmail: string,
  items: CartItem[],
  delivery: DeliveryMethod,
): Order {
  const email = validateCustomerInput(customerEmail);
  if (items.length === 0) {
    throw new Error('Замовлення не може бути порожнім');
  }
  const now = new Date();
  return {
    orderId,
    customerEmail: email,
    items: [...items],
    status: 'pending',
    delivery,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateOrderStatus(order: Order, newStatus: OrderStatus): Order {
  if (FINAL_STATUSES.includes(order.status)) {
    throw new Error(
      `Замовлення ${order.orderId} має статус '${order.status}', змінити його на '${newStatus}' не можна`,
    );
  }
  // повертаємо нову копію, старий об'єкт не чіпаємо
  return {
    ...order,
    items: [...order.items],
    status: newStatus,
    updatedAt: new Date(),
  };
}
