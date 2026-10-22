"use client";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";
export default function Display() {
  const [stage, setStage] = useState("idle");
  useEffect(() => {
    const channel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("bossque-kiosk")
        : null;
    if (!channel) return;
    channel.onmessage = (e) => setStage(e.data.stage ?? "idle");
    return () => channel.close();
  }, []);
  return (
    <main className="min-h-[calc(100dvh-76px)] bg-ink text-white grid place-items-center p-8">
      <div className="w-full max-w-3xl text-center">
        <img src="/logo.png" alt="Bossque" className="mx-auto w-32 h-32 object-contain mb-8"/><p className="tracking-[.25em] text-[#d7bd7b] text-sm font-semibold">BOSSQUE CAFE</p>
        {stage === "idle" ? (
          <>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight mt-12">Selamat Datang</h1>
            <p className="text-2xl text-white/60 mt-4">
              Your order will appear here
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mt-12">Your order</h1>
            <div className="panel bg-white text-ink mt-8 p-8 text-left">
              <div className="flex justify-between">
                <span>Current order</span>
                <b>{formatMoney(0)}</b>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
