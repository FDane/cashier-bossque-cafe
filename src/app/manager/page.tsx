"use client";
import { BarChart3, ClipboardList, Wallet, ArrowLeft } from "lucide-react";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
export default function Manager() {
  return (
    <main className="page-shell">
      <div className="max-w-6xl mx-auto">
        <Link href="/pos" className="text-moss flex gap-2 items-center mb-6">
          <ArrowLeft size={17} />
          Back to POS
        </Link>
        <div className="flex justify-between items-end mb-7">
          <div>
            <p className="text-xs uppercase tracking-widest text-moss font-bold">
              Manager view
            </p>
            <h1 className="text-3xl font-bold">Today at a glance</h1>
          </div>
          <span className="rounded-full bg-sage px-4 py-2 text-sm font-bold">
            Overview
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Revenue" value={formatMoney(0)} icon={<BarChart3 />} />
          <Stat label="Orders" value="0" icon={<ClipboardList />} />
          <Stat label="Cash sales" value={formatMoney(0)} icon={<Wallet />} />
          <Stat label="Low stock" value="0 items" icon={<span>!</span>} />
        </div>
        <p className="text-xs text-gray-500 mt-4">Reporting is not connected yet. Figures above are placeholders, not live totals.</p>
        <section className="panel p-6 mt-6">
          <h2 className="font-bold text-xl">Quick actions</h2>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <Link
              href="/manager/cash"
              className="touch rounded-xl bg-ink text-white p-4 font-bold"
            >
              Cash management
            </Link>
            <button disabled className="touch rounded-xl border p-4 font-bold opacity-40">
              Sales history · Soon
            </button>
            <button disabled className="touch rounded-xl border p-4 font-bold opacity-40">
              End-of-day report · Soon
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="panel p-5">
      <div className="flex justify-between text-moss">
        <span>{icon}</span>
        <span className="text-xs uppercase tracking-widest text-gray-400">
          Today
        </span>
      </div>
      <p className="text-gray-500 mt-5">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
