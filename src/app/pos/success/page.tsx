"use client";
import { Check, Printer, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
export default function Success() {
  const r = useRouter();
  return (
    <main className="min-h-[calc(100dvh-76px)] bg-cream grid place-items-center p-6">
      <div className="panel p-10 max-w-md w-full text-center">
        <div className="mx-auto rounded-full bg-moss text-white w-16 h-16 grid place-items-center">
          <Check size={35} />
        </div>
        <h1 className="text-3xl font-bold mt-5">Sale complete</h1>
        <p className="text-gray-500 mt-2">
          Payment recorded successfully. The receipt is ready.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button
            onClick={() => window.print()}
            className="touch rounded-xl border font-bold flex gap-2 items-center justify-center"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={() => r.push("/pos")}
            className="touch rounded-xl bg-ink text-white font-bold flex gap-2 items-center justify-center"
          >
            <Plus size={18} />
            New order
          </button>
        </div>
      </div>
    </main>
  );
}
