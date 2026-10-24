export function validateCustomerInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new TypeError(`Очікувався рядок, отримано: ${typeof input}`);
  }
  const cleaned = input.trim();
  if (cleaned === '') {
    throw new Error('Рядок не може бути порожнім');
  }
  if (!cleaned.includes('@')) {
    throw new Error(`Некоректний формат (немає символу @): "${cleaned}"`);
  }
  return cleaned;
}
