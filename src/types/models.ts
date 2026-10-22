import type { Timestamp } from "firebase/firestore";
export type FireDate = Timestamp | Date | string;
export type Role = "ADMIN" | "MANAGER" | "CASHIER" | "STAFF";
export type PosRole = "ADMIN" | "MANAGER" | "CASHIER";
export type ProductType = "CAFE" | "RETAIL";
export type PaymentMethod = "CASH" | "ONLINE" | "CARD" | "QR";
export interface Business {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  currency: "MYR";
  taxRate: number;
  taxInclusive: boolean;
  receiptFooter?: string;
  timezone: string;
  orderPrefix: string;
  allowNegativeStock?: boolean;
}
export interface Category {
  id: string;
  name: string;
  nameMs?: string;
  imageUrl?: string;
  color?: string;
  sortOrder: number;
  active: boolean;
  type: ProductType;
}
export interface ModifierOption {
  id: string;
  name: string;
  priceDeltaSen: number;
}
export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
}
export interface RecipeItem {
  inventoryItemId: string;
  qty: number;
}
export interface Variant {
  id: string;
  name: string;
  priceSen: number;
  sku?: string;
  barcodes?: string[];
}
export interface Product {
  id: string;
  name: string;
  nameMs?: string;
  sku: string;
  barcodes: string[];
  categoryId: string;
  type: ProductType;
  priceSen: number;
  costSen: number;
  taxable: boolean;
  imageUrl?: string;
  thumbUrl?: string;
  stockTracked: boolean;
  trackedInventoryItemId?: string;
  recipe?: RecipeItem[];
  modifierGroupIds: string[];
  variants?: Variant[];
  active: boolean;
  availableForSelfOrder: boolean;
  sortOrder: number;
}
export interface CartModifier {
  groupId: string;
  optionId: string;
  name: string;
  priceDeltaSen: number;
}
export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  qty: number;
  unitPriceSen: number;
  modifiers: CartModifier[];
  lineTotalSen: number;
  notes?: string;
}
export interface Payment {
  method: PaymentMethod;
  amountSen: number;
  reference?: string;
  provider?: string;
}
export interface Order {
  id?: string;
  idempotencyKey?: string;
  orderNumber: string;
  receiptNumber?: string;
  channel: "POS" | "SELF_ORDER" | "ONLINE";
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  items: CartItem[];
  subtotalSen: number;
  discountSen: number;
  discountReason?: string;
  taxSen: number;
  totalSen: number;
  payments: Payment[];
  cashReceivedSen: number;
  changeSen: number;
  cashierId: string;
  cashierName: string;
  terminalId: string;
  shiftId?: string;
  tableOrPickupNo?: string;
  notes?: string;
  createdAt: FireDate;
  paidAt?: FireDate;
  paymentStatus: "UNPAID" | "PAID" | "PARTIAL" | "REFUNDED";
}
export interface InventoryItem {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  reorderLevel: number;
  cost: number;
  price: number;
  supplier?: string;
  unit?: string;
  businessId?: string;
  sku?: string;
  barcodes?: string[];
  imageUrl?: string;
  updatedAt?: FireDate;
  updatedBy?: string;
}
export interface SharedUser {
  isAdmin?: boolean;
  uid: string;
  name: string;
  nric?: string;
  email?: string;
  phone?: string;
  position?: string;
  isStaff: boolean;
  status: "active" | "inactive";
  profileImage?: string;
  businessIds?: string[];
  posRole?: PosRole;
  role?: Role;
}
export interface StaffIdentity {
  isAdmin?: boolean;
  uid: string;
  name: string;
  email?: string;
  position?: string;
  profileImage?: string;
}
export interface CashDenominations {
  [key: string]: number;
}
