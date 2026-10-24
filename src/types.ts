// Ідентифікатор сутності може бути і рядком, і числом
export type EntityId = string | number;

export interface BaseProduct {
  readonly id: EntityId;
  title: string;
  price: number;
  description?: string;
  tags: string[];
  inStock: boolean;
}

// Варіант 6: будівельні матеріали
export type UnitOfMeasure = 'kg' | 'm2' | 'm3';

export interface Product extends BaseProduct {
  unitOfMeasure: UnitOfMeasure;
  weightPerUnitKg: number;
  isHeavyCargo: boolean;
}

// Дані товару без id: id видає createProduct
export type ProductData = Omit<Product, 'id'>;

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type DeliveryMethod = 'cargo_freight' | 'courier' | 'warehouse_pickup';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type TimestampMetadata = {
  readonly createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  readonly orderId: string;
  customerEmail: string;
  items: CartItem[];
  status: OrderStatus;
  delivery: DeliveryMethod;
} & TimestampMetadata;
