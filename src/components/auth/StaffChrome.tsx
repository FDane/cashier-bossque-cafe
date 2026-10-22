"use client";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { usePathname, useRouter } from "next/navigation";
import type { StaffIdentity } from "@/types/models";
import Link from "next/link";
import { ShoppingBag, LayoutDashboard, LogOut, PackagePlus } from "lucide-react";

export default function StaffChrome({
  user,
  children,
}: {
  user: StaffIdentity | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [locked, setLocked] = useState(false);
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (!user || pathname === "/login") return;
    const minutes = Number(process.env.NEXT_PUBLIC_IDLE_LOCK_MINUTES ?? 30);
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setLocked(true), minutes * 60000);
    };
    ["mousemove", "keydown", "click", "touchstart"].forEach((e) =>
      window.addEventListener(e, reset),
    );
    reset();
    return () => {
      clearTimeout(timer);
      ["mousemove", "keydown", "click", "touchstart"].forEach((e) =>
        window.removeEventListener(e, reset),
      );
    };
  }, [user, pathname]);
  if (!user || pathname === "/login") return <>{children}</>;
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const unlock = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth || !user.email || !password) return;
    try {
      await signInWithEmailAndPassword(auth, user.email, password);
      setPassword("");
      setLocked(false);
    } catch {}
  };
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    if (auth) await signOut(auth);
    router.push("/login");
  };
  return (
    <>
      <header className="staff-header no-print">
        <Link
          href="/pos"
          className="brand-link"
          aria-label="Bossque Cafe register"
        >
          <img src="/logo.png" alt="Bossque" />
          <div className="brand-copy">
            <p className="text-sm font-bold tracking-widest">BOSSQUE</p>
            <p className="eyebrow mt-0.5">CAFE & RETAIL</p>
          </div>
        </Link>
        <nav className="app-nav" aria-label="Main navigation">
          <Link
            href="/pos"
            aria-label="Register"
            aria-current={pathname.startsWith("/pos") ? "page" : undefined}
            className={pathname.startsWith("/pos") ? "active" : ""}
          >
            <ShoppingBag size={18} />
            <span>Register</span>
          </Link>
          {user.isAdmin && <><Link
            href="/manager"
            aria-label="Manager"
            aria-current={pathname.startsWith("/manager") ? "page" : undefined}
            className={pathname.startsWith("/manager") ? "active" : ""}
          >
            <LayoutDashboard size={18} />
            <span>Manager</span>
          </Link>
          <Link href="/inventory" aria-label="Add inventory" aria-current={pathname.startsWith("/inventory") ? "page" : undefined} className={pathname.startsWith("/inventory") ? "active" : ""}>
            <PackagePlus size={18}/><span>Add inventory</span>
          </Link></>}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-sage text-xs font-bold text-moss">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="leading-tight" title={user.name}>
            <p className="max-w-[90px] sm:max-w-[180px] truncate text-xs sm:text-sm font-semibold">
              {user.name}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {user.position || "Staff"}
            </p>
            <span className="text-[10px] text-moss">● Logged in</span>
          </div>
          <button
            onClick={logout}
            aria-label="Logout"
            className="secondary-button !px-2 sm:!px-3"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>
      {children}
      {locked && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink p-6 text-white">
          <form
            onSubmit={unlock}
            className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 text-ink"
          >
            <img
              src="/logo.png"
              alt="Bossque"
              className="h-16 w-16 object-contain"
            />
            <p className="eyebrow">SESSION LOCKED</p>
            <h2 className="text-2xl font-bold">
              Welcome back, {user.name.split(" ")[0]}.
            </h2>
            <p className="text-sm text-gray-500">
              Re-enter your password to continue. Your cart is preserved.
            </p>
            <input
              autoFocus
              required
              aria-label="Password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border p-3"
            />
            <button className="primary-button w-full justify-center">
              Unlock register
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full p-2 text-sm text-moss"
            >
              Switch user
            </button>
          </form>
        </div>
      )}
    </>
  );
}
