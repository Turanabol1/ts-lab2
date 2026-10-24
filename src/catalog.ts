import type { EntityId, Product, ProductData } from './types.js';

export function createProduct(id: EntityId, data: ProductData): Product {
  if (data.title.trim() === '') {
    throw new Error('Назва товару не може бути порожньою');
  }
  if (data.price < 0) {
    throw new Error(`Ціна не може бути від'ємною: ${data.price}`);
  }
  if (data.weightPerUnitKg < 0) {
    throw new Error(`Вага одиниці не може бути від'ємною: ${data.weightPerUnitKg}`);
  }
  // tags копіюємо, щоб зовнішній масив не міг змінити товар
  return { ...data, id, tags: [...data.tags] };
}

export function calculateLineTotal(
  price: number,
  quantity: number,
  discountPercent: number = 0,
): number {
  if (price < 0) {
    throw new Error(`Ціна не може бути від'ємною: ${price}`);
  }
  if (quantity < 0) {
    throw new Error(`Кількість не може бути від'ємною: ${quantity}`);
  }
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error(`Знижка має бути від 0 до 100%: ${discountPercent}`);
  }
  const total = price * quantity * (1 - discountPercent / 100);
  return Math.round(total * 100) / 100;
}
