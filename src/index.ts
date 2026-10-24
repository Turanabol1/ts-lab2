import { calculateLineTotal, createProduct } from './catalog.js';
import { calculateCartTotal, createOrder, updateOrderStatus } from './orders.js';
import { isCreditCardPayment, maskCardNumber, processPayment } from './payments.js';
import type { PaymentDetails } from './payments.js';
import type { CartItem, DeliveryMethod, Order, Product } from './types.js';
import { validateCustomerInput } from './validation.js';

function describeProduct(product: Product): void {
  const stock = product.inStock ? 'так' : 'ні';
  console.log(
    `- Створено товар #${product.id}: [${product.title}] - ${product.price} грн/${product.unitOfMeasure} (В наявності: ${stock})`,
  );
  const heavy = product.isHeavyCargo ? 'так' : 'ні';
  console.log(
    `  Специфікації: одиниця виміру: ${product.unitOfMeasure}, вага одиниці: ${product.weightPerUnitKg} кг, великовантажний: ${heavy}`,
  );
}

function tryRun(label: string, action: () => unknown): void {
  try {
    action();
    console.log(`${label}: помилки немає`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : 'Error';
    console.log(`${label}: ${name}: ${message}`);
  }
}

console.log('=== СИСТЕМА ОБРОБКИ ЗАМОВЛЕНЬ (E-COMMERCE CORE) ===');

console.log('\n[Каталог товарів]');
const cement = createProduct(1, {
  title: 'Цемент М500',
  price: 9,
  description: 'Портландцемент у мішках',
  tags: ['цемент', 'в’яжучі'],
  inStock: true,
  unitOfMeasure: 'kg',
  weightPerUnitKg: 1,
  isHeavyCargo: false,
});
const sand = createProduct('sand-02', {
  title: 'Пісок річковий',
  price: 650,
  tags: ['пісок', 'навалом'],
  inStock: true,
  unitOfMeasure: 'm3',
  weightPerUnitKg: 1600,
  isHeavyCargo: true,
});
const drywall = createProduct(3, {
  title: 'Гіпсокартон 12.5 мм',
  price: 150,
  tags: ['гіпсокартон', 'оздоблення'],
  inStock: true,
  unitOfMeasure: 'm2',
  weightPerUnitKg: 8.5,
  isHeavyCargo: false,
});
[cement, sand, drywall].forEach(describeProduct);

console.log('\n[Формування кошика]');
const cart: CartItem[] = [
  { product: cement, quantity: 50 },
  { product: sand, quantity: 3 },
  { product: drywall, quantity: 20 },
];
cart.forEach((item, index) => {
  const line = calculateLineTotal(item.product.price, item.quantity);
  console.log(
    `${index + 1}. ${item.product.title} x ${item.quantity} ${item.product.unitOfMeasure} = ${line} грн`,
  );
});
const total = calculateCartTotal(cart);
const discounted = calculateLineTotal(total, 1, 10);
const totalWeight = cart.reduce((sum, item) => sum + item.product.weightPerUnitKg * item.quantity, 0);
console.log(`Загальна вартість замовлення: ${total} грн`);
console.log(`Зі знижкою 10%: ${discounted} грн`);
console.log(`Загальна вага вантажу: ${totalWeight} кг`);

console.log('\n[Створення замовлення]');
const hasHeavy = cart.some((item) => item.product.isHeavyCargo);
const delivery: DeliveryMethod = hasHeavy ? 'cargo_freight' : 'courier';
const order: Order = createOrder(
  `ord-${Date.now().toString(36)}`,
  '  customer@example.com ',
  cart,
  delivery,
);
console.log(`Замовлення ID: ${order.orderId}`);
console.log(`Клієнт: ${order.customerEmail}`);
console.log(`Доставка: ${order.delivery}`);
console.log(`Початковий статус: ${order.status}`);
console.log(`Час створення: ${order.createdAt.toISOString()}`);

console.log('\n[Зміна життєвого циклу]');
const processing = updateOrderStatus(order, 'processing');
console.log(
  `Оновлення статусу: ${order.status} -> ${processing.status} (Оновлено: ${processing.updatedAt.toISOString()})`,
);
const shipped = updateOrderStatus(processing, 'shipped');
console.log(
  `Оновлення статусу: ${processing.status} -> ${shipped.status} (Оновлено: ${shipped.updatedAt.toISOString()})`,
);
console.log(`Початковий об'єкт не змінився: ${order.status}`);

console.log('\n[Процесинг платежу]');
const payments: PaymentDetails[] = [
  { type: 'card', cardNumber: '4111 1111 1111 8821', cardHolder: 'John Doe', cvv: '123' },
  { type: 'cash', cashAmountToPay: 6000 },
  { type: 'online_service', serviceName: 'ApplePay', transactionRef: 'tx-7f3a91' },
];
for (const payment of payments) {
  console.log(`Метод оплати: ${payment.type}`);
  console.log(`Маскування: ${maskCardNumber(payment)}`);
  if (isCreditCardPayment(payment)) {
    console.log(`Власник картки: ${payment.cardHolder}`);
  }
  console.log(`Результат: ${processPayment(payment, discounted)}`);
  console.log('');
}

console.log('[Перевірка захисту від некоректних даних]');
tryRun('Від’ємна кількість', () => calculateLineTotal(100, -1));
tryRun('Від’ємна ціна', () => calculateLineTotal(-5, 2));
tryRun('Email не рядок', () => validateCustomerInput(12345));
tryRun('Email без @', () => validateCustomerInput('customer.example.com'));
tryRun('Зі статусу delivered', () => {
  const delivered = updateOrderStatus(shipped, 'delivered');
  return updateOrderStatus(delivered, 'processing');
});
