"use client";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatMoney } from "@/lib/money";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
export default function Checkout() {
  const { items, clear } = useCartStore();
  const [method, setMethod] = useState<"CASH" | "CARD" | "QR">("CASH");
  const [received, setReceived] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const subtotal = items.reduce((n, i) => n + i.lineTotalSen, 0);
  const receivedSen = Math.round(Number(received || 0) * 100);
  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          items,
          payments: [
            { method, amountSen: method === "CASH" ? subtotal : subtotal },
          ],
          cashReceivedSen: receivedSen,
          cashierId: "current-user",
          cashierName: "Cashier",
          terminalId: process.env.NEXT_PUBLIC_TERMINAL_ID ?? "T1",
        }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      clear();
      toast.success("Sale completed");
      router.push("/pos/success");
    } catch {
      toast.error("Checkout unavailable. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="page-shell">
      <div>
        <button onClick={() => router.push('/pos')} className="mb-5 text-moss text-sm">
          ← Back to cart
        </button>
        <div className="grid md:grid-cols-2 gap-6 items-start">
        <section className="panel p-6"><p className="eyebrow">CURRENT ORDER</p><h2 className="text-xl font-bold mt-2 mb-5">Order summary</h2><div className="divide-y">{items.map(i=><div key={i.productId} className="py-4 flex justify-between gap-4 text-sm"><span><span className="text-gray-500 mr-3">{i.qty}×</span>{i.name}</span><strong className="whitespace-nowrap tabular-nums">{formatMoney(i.lineTotalSen)}</strong></div>)}</div>{!items.length && <p className="text-sm text-gray-500 py-6">No items in this order. Return to the register to add products.</p>}<div className="border-t pt-5 mt-2 flex justify-between items-center"><span className="text-sm font-semibold">Amount due</span><strong className="text-2xl tabular-nums">{formatMoney(subtotal)}</strong></div></section>
        <div className="panel p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Payment
          </p>
          <h1 className="text-3xl font-bold mb-6">Complete sale</h1>
          <div className="flex gap-2 mb-6">
            {(["CASH", "CARD", "QR"] as const).map((m) => (
              <button
                key={m}
                aria-pressed={method === m}
                onClick={() => setMethod(m)}
                className={`min-h-16 flex-1 rounded-lg border text-sm font-semibold ${method === m ? "bg-ink text-white" : "bg-white"}`}
              >
                {m === "QR" ? "Online QR" : m[0] + m.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          {method === "CASH" && (
            <label className="block font-semibold mb-5">
              Cash received (RM)
              <input
                autoFocus
                inputMode="decimal"
                type="number"
                min="0"
                step="0.01"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                className="mt-2 w-full rounded-xl border p-4 text-2xl"
                placeholder="0.00"
              />
            </label>
          )}
          {method === "CASH" && <div className="flex flex-wrap gap-2 mb-5">{[...new Set([subtotal / 100, ...[10,20,50,100].filter(n=>n*100>=subtotal)])].map((amount,index)=><button key={amount} className="secondary-button !min-h-10 !py-2 !px-3 !text-xs" onClick={()=>setReceived(amount.toFixed(2))}>{index === 0 ? "Exact amount" : `RM ${amount}`}</button>)}</div>}
          {method !== "CASH" && <p className="text-sm text-gray-500 bg-cream rounded-lg p-4 mb-5">Confirm the {method === "CARD" ? "card terminal" : "QR payment"} shows a successful payment before completing this sale.</p>}
          <div className="space-y-3 border-t pt-5">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{items.reduce((n, i) => n + i.qty, 0)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {method === "CASH" && (
              <div className="flex justify-between text-moss font-bold">
                <span>Change</span>
                <span>{formatMoney(Math.max(0, receivedSen - subtotal))}</span>
              </div>
            )}
          </div>
          <button
            onClick={submit}
            disabled={
              submitting ||
              !items.length ||
              (method === "CASH" && (!Number.isFinite(receivedSen) || receivedSen < subtotal))
            }
            className="touch mt-7 w-full rounded-xl bg-ink text-white p-4 font-bold disabled:opacity-40"
          >
            {submitting ? "Processing…" : "Confirm payment"}
          </button>
        </div>
        </div>
      </div>
    </main>
  );
}
