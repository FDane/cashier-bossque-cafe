"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ScanBarcode, ShoppingBag, Minus, Plus, Trash2, ArrowRight, Coffee, Package, X, Wifi, WifiOff } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useOnline } from "@/hooks/useOnline";
import { useBarcodeWedge } from "@/hooks/useBarcodeWedge";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/types/models";
const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID ?? "bossque-cafe";
export default function PosShell() {
  const { products, loading } = useProducts(businessId);
  const categories = useCategories(businessId);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const closeCart = useRef<HTMLButtonElement>(null);
  const cartTrigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const online = useOnline();
  const { items, add, remove, setQty, clear } = useCartStore();
  const { cartOpen, setCartOpen } = useUiStore();
  const visible = useMemo(() => products.filter(p => (category === "all" || p.categoryId === category) && [p.name, p.sku, ...p.barcodes].join(" ").toLowerCase().includes(search.toLowerCase())), [products, category, search]);
  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); input.current?.focus(); }
      if (e.key === "Escape") { setCartOpen(false); setConfirmClear(false); cartTrigger.current?.focus(); }
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [setCartOpen]);
  useEffect(() => { if (cartOpen) closeCart.current?.focus(); }, [cartOpen]);
  const scan = (value: string) => {
    const product = products.find(p => p.barcodes.includes(value) || p.sku === value);
    if (product) { add(product); setMessage(""); } else setMessage("No product matches that barcode.");
  };
  useBarcodeWedge(scan);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotalSen, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  return (
    <main className="register-layout">
      <section className="catalog" aria-label="Product catalog">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div><p className="eyebrow">COUNTER / {process.env.NEXT_PUBLIC_TERMINAL_ID ?? "T1"}</p><h1 className="text-2xl font-bold tracking-tight mt-1">Let’s take an order.</h1></div>
          <span className={`status-pill ${online ? "" : "text-coral"}`}>{online ? <Wifi size={14}/> : <WifiOff size={14}/>} {online ? "Connected" : "Offline · checkout paused"}</span>
        </div>
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1"><Search size={18} className="absolute left-4 top-4 text-gray-500"/><input ref={input} aria-label="Search products, SKU or barcode" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU or barcode" className="search-input"/><kbd className="absolute right-3 top-3.5 hidden sm:block text-xs text-gray-500 border rounded px-1.5">F2</kbd></div>
          <button className="secondary-button" aria-label="Enter barcode" onClick={() => { const value = window.prompt("Enter barcode"); if (value) scan(value); }}><ScanBarcode size={20}/><span className="hidden sm:inline">Scan</span></button>
        </div>
        <div className="category-strip" aria-label="Categories">
          {[{id: "all", name: "All items"}, ...[...categories].sort((a,b) => a.sortOrder-b.sortOrder)].map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className={`category-chip ${category === c.id ? "selected" : ""}`}>{c.name}<span>{c.id === "all" ? products.length : products.filter(p => p.categoryId === c.id).length}</span></button>)}
        </div>
        <div className="flex justify-between items-center my-5 text-sm"><h2 className="font-semibold">{category === "all" ? "The menu" : categories.find(c => c.id === category)?.name}</h2><span className="text-gray-500">{visible.length} products</span></div>
        {message && <div role="status" className="flex justify-between items-center mb-4 p-3 rounded-lg bg-red-50 text-coral text-sm">{message}<button aria-label="Dismiss message" onClick={() => setMessage("")} className="p-2"><X size={16}/></button></div>}
        {loading ? <div className="product-grid" aria-label="Loading products" aria-busy="true">{Array.from({length:8}, (_, i) => <div key={i} className="h-56 rounded-xl bg-black/5 animate-pulse"/>)}</div> : <div className="product-grid">{visible.map(p => <ProductCard key={p.id} product={p} quantity={items.find(i => i.productId === p.id)?.qty ?? 0} onAdd={() => add(p)}/>)}</div>}
        {!loading && !visible.length && <div className="empty-state"><Search size={30}/><h3 className="font-semibold text-ink">{products.length ? "No matching products" : "Your menu is not ready yet"}</h3><p>{products.length ? "Try a different name, SKU or category." : "Active products will appear here once added to the catalog."}</p>{products.length > 0 && <button className="secondary-button" onClick={() => {setSearch("");setCategory("all");}}>Reset filters</button>}</div>}
      </section>
      {cartOpen && <button aria-label="Close order" className="cart-backdrop" onClick={() => setCartOpen(false)}/>}
      <aside className={`order-panel ${cartOpen ? "is-open" : ""}`} aria-label="Current order">
        <div className="order-heading"><div><p className="eyebrow">CURRENT ORDER</p><h2 className="text-xl font-bold mt-1">New sale <span className="count-badge">{count}</span></h2></div><button ref={closeCart} className="secondary-button lg:hidden" aria-label="Close order" onClick={() => setCartOpen(false)}><X size={18}/></button><span className="hidden lg:block text-xs text-gray-500">Walk-in</span></div>
        <div className="order-items scrollbar">
          {!items.length ? <div className="empty-state h-full"><ShoppingBag size={34} strokeWidth={1.3}/><h3 className="text-ink font-semibold">Ready for the first item</h3><p>Tap a product or scan a barcode<br/>to start this order.</p></div> : items.map((i, index) => <div key={i.productId} className="order-line"><div className="flex gap-3"><span className="text-xs text-gray-400 pt-1 tabular-nums">{String(index+1).padStart(2,"0")}</span><div className="flex-1 min-w-0"><div className="flex justify-between gap-3"><h3 className="font-semibold text-sm leading-5">{i.name}</h3><button className="text-gray-400 hover:text-coral p-2" aria-label={`Remove ${i.name}`} onClick={() => remove(i.productId)}><Trash2 size={16}/></button></div><p className="text-xs text-gray-500 mt-1">{formatMoney(i.unitPriceSen)} each</p><div className="flex justify-between items-center mt-3"><div className="quantity-control"><button aria-label={`Decrease ${i.name}`} onClick={() => setQty(i.productId,i.qty-1)}><Minus size={14}/></button><span>{i.qty}</span><button aria-label={`Increase ${i.name}`} onClick={() => setQty(i.productId,i.qty+1)}><Plus size={14}/></button></div><strong className="text-sm tabular-nums">{formatMoney(i.lineTotalSen)}</strong></div></div></div></div>)}
        </div>
        <div className="order-footer"><div className="flex justify-between text-sm text-gray-500 mb-4"><span>Subtotal · {count} {count === 1 ? "item" : "items"}</span><span className="tabular-nums">{formatMoney(subtotal)}</span></div><div className="flex justify-between items-center border-t pt-4 mb-5"><span className="font-semibold">Order total</span><strong className="text-2xl tracking-tight tabular-nums">{formatMoney(subtotal)}</strong></div><button disabled={!items.length || !online} className="primary-button w-full justify-between" onClick={() => {setCartOpen(false);router.push("/pos/checkout");}}><span>Continue to payment</span><ArrowRight size={18}/></button>{confirmClear ? <div className="flex items-center justify-between gap-2 text-xs mt-3" role="alert"><span>Remove all items?</span><button className="p-2 text-coral font-bold" onClick={() => {clear();setConfirmClear(false);}}>Clear order</button><button className="p-2" onClick={() => setConfirmClear(false)}>Cancel</button></div> : <button disabled={!items.length} onClick={() => setConfirmClear(true)} className="w-full text-xs text-gray-500 py-3 disabled:opacity-40">Clear order</button>}</div>
      </aside>
      <button ref={cartTrigger} onClick={() => setCartOpen(true)} className="mobile-cart"><span className="flex items-center gap-2"><ShoppingBag size={18}/> View order · {count}</span><span>{formatMoney(subtotal)} <ArrowRight className="inline ml-2" size={16}/></span></button>
    </main>
  );
}
function ProductCard({product, quantity, onAdd}: {product: Product; quantity: number; onAdd: () => void}) {
  const [failed, setFailed] = useState(false);
  const image = product.thumbUrl || product.imageUrl;
  return <button onClick={onAdd} className={`product-card ${quantity ? "in-order" : ""}`} aria-label={`Add ${product.name}, ${formatMoney(product.priceSen)}${quantity ? `, ${quantity} in order` : ""}`}><div className="product-image">{image && !failed ? <img src={image} alt="" loading="lazy" onError={() => setFailed(true)}/> : <div className="product-placeholder">{product.type === "CAFE" ? <Coffee size={32} strokeWidth={1.2}/> : <Package size={32} strokeWidth={1.2}/>}<span>{product.type === "CAFE" ? "BOSSQUE CAFE" : "BOSSQUE RETAIL"}</span></div>}{quantity > 0 && <span className="product-quantity">{quantity} in order</span>}</div><div className="p-3.5"><p className="text-[10px] tracking-wider uppercase text-gray-500 mb-1">{product.type === "CAFE" ? "Cafe" : "Retail"}</p><h3 className="font-semibold text-sm leading-5 min-h-10">{product.name}</h3><div className="flex justify-between items-center mt-3"><strong className="text-sm tabular-nums">{formatMoney(product.priceSen)}</strong><span className="add-product"><Plus size={16}/></span></div></div></button>;
}
