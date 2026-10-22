import type { Order, Payment } from "./models";
export interface CheckoutInput {
  orderId?: string;
  idempotencyKey: string;
  items: Order["items"];
  discountSen?: number;
  discountReason?: string;
  payments: Payment[];
  cashReceivedSen?: number;
  cashierId?: string;
  cashierName?: string;
  terminalId: string;
  customerId?: string;
  notes?: string;
  tableOrPickupNo?: string;
}
export interface CheckoutResult {
  order: Order;
  warning?: string;
  alreadyProcessed?: boolean;
}
