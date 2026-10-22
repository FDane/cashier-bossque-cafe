"use client";
import { useState } from "react";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
export default function Cash() {
  const [float, setFloat] = useState("");
  const [opened, setOpened] = useState(false);
  return (
    <main className="page-shell">
      <div className="max-w-3xl mx-auto">
        <Link href="/manager" className="text-moss text-sm">
          ← Manager
        </Link>
        <p className="eyebrow mt-8">REGISTER OPERATIONS</p><h1 className="text-3xl font-bold mt-2">Cash management</h1>
        <p className="text-sm text-gray-500 mt-3">Opening float and drawer overview. This screen currently uses local session data; it does not save a shift record.</p>
        <div className="panel p-6 mt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500">Shift status</p>
              <p className="text-xl font-bold">
                {opened ? "Open · T1" : "Not opened"}
              </p>
            </div>
            <span className="rounded-full bg-sage px-3 py-2 text-sm">
              {opened ? "Counting active" : "First count required"}
            </span>
          </div>
          {!opened && (
            <div className="mt-6">
              <label className="font-semibold">
                Opening float (RM)
                <input
                  value={float}
                  onChange={(e) => setFloat(e.target.value)}
                  className="mt-2 w-full rounded-xl border p-3"
                  placeholder="0.00"
                />
              </label>
              <button
                onClick={() => setOpened(true)}
                className="touch mt-4 rounded-xl bg-ink text-white px-5 font-bold"
              >
                Open shift
              </button>
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-5">
          <div className="panel p-5">
            <p className="text-gray-500">Expected drawer</p>
            <b className="text-2xl">{formatMoney(Number(float || 0) * 100)}</b>
          </div>
          <div className="panel p-5">
            <p className="text-gray-500">Cash sales</p>
            <b className="text-2xl">RM 0.00</b>
          </div>
          <div className="panel p-5">
            <p className="text-gray-500">Variance</p>
            <b className="text-2xl">RM 0.00</b>
          </div>
        </div>
      </div>
    </main>
  );
}
