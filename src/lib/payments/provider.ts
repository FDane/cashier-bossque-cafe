import type { Order } from "@/types/models";
export interface PaymentProvider {
  createPayment(
    order: Order,
  ): Promise<{ paymentId: string; redirectUrl?: string; qrPayload?: string }>;
  getStatus(paymentId: string): Promise<"PENDING" | "PAID" | "FAILED">;
  handleWebhook(request: Request): Promise<void>;
  refund(paymentId: string, amountSen: number): Promise<void>;
}
export class InMemoryMockProvider implements PaymentProvider {
  private payments = new Map<string, string>();
  async createPayment() {
    const paymentId = crypto.randomUUID();
    this.payments.set(paymentId, "PAID");
    return { paymentId, qrPayload: `MOCK:${paymentId}` };
  }
  async getStatus(id: string) {
    return (this.payments.get(id) ?? "PENDING") as
      | "PENDING"
      | "PAID"
      | "FAILED";
  }
  async handleWebhook() {
    return;
  }
  async refund(id: string) {
    this.payments.set(id, "REFUNDED");
  }
}
