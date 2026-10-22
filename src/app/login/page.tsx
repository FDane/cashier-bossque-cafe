"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export default function Login() {
  const [nric, setNric] = useState(""), [password, setPassword] = useState(""), [show, setShow] = useState(false), [fails, setFails] = useState(0), [blocked, setBlocked] = useState(0);
  const router = useRouter();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!auth) throw new Error("Firebase client configuration is missing");
      const clean = nric.replace(/[\s-]/g, "");
      if (!/^[0-9]{12}$/.test(clean)) throw new Error();
      const credential = await signInWithEmailAndPassword(auth, `${clean}@bossque.carwash`, password);
      const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await credential.user.getIdToken() }) });
      if (!response.ok) throw new Error();
      router.push(new URLSearchParams(window.location.search).get("next") || "/pos");
    } catch {
      const count = fails + 1; setFails(count); if (count >= 5) setBlocked(Date.now() + 60000); toast.error("Login failed or account not allowed");
    }
  };
  return (
    <main className="login-shell">
      <aside className="login-brand"><img src="/logo.png" alt="Bossque"/><div><p className="text-xs tracking-[.2em] text-white/50 mb-5">BOSSQUE / CAFE & RETAIL</p><h2 className="text-5xl font-semibold tracking-tight leading-tight max-w-md">Good service.<br/>Starts here.</h2><p className="text-white/60 mt-6 text-sm">Your counter. Your team. Everything in order.</p></div><p className="text-xs text-white/40">Staff workspace · Authorised access only</p></aside>
      <div className="login-form-wrap"><form onSubmit={submit} className="w-full max-w-sm space-y-6">
        <img src="/logo.png" alt="Bossque" className="h-20 w-20 object-contain sm:hidden"/>
        <div>
          <p className="text-sm uppercase tracking-[.2em] text-moss">
            STAFF SIGN IN
          </p>
          <h1 className="text-3xl font-bold mt-2">Welcome back</h1>
          <p className="text-gray-500 mt-1">
            Sign in to your cashier workspace.
          </p>
        </div>
        <label className="block text-sm font-semibold">
          NRIC
          <input
            required
            aria-label="NRIC"
            autoComplete="username"
            inputMode="numeric"
            maxLength={14}
            value={nric}
            onChange={(e) => setNric(e.target.value.replace(/[^0-9\s-]/g, ""))}
            className="mt-2 w-full rounded-xl border p-3"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input
            required
            autoComplete="current-password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border p-3"
          />
          <button type="button" onClick={() => setShow(!show)} className="mt-2 text-sm text-moss">{show ? "Hide" : "Show"}</button>
        </label>
        <button disabled={blocked > Date.now()} className="primary-button w-full justify-center">
          Sign in to register
        </button>
        <p className="text-xs text-gray-500 text-center">Use your existing staff account to continue.</p>
      </form></div>
    </main>
  );
}
