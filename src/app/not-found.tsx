import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream p-6">
      <div className="panel max-w-md p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-moss">Bossque Cafe</p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-gray-500">The page you requested does not exist.</p>
        <Link href="/pos" className="mt-6 inline-block rounded-xl bg-ink px-5 py-3 font-bold text-white">Back to POS</Link>
      </div>
    </main>
  );
}