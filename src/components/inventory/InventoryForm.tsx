"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PackagePlus, RefreshCw } from "lucide-react";

type InventoryItem = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  reorderLevel: number;
  cost: number;
  price: number;
  supplier?: string;
  unit?: string;
  sku?: string;
};

export default function InventoryForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [listError, setListError] = useState("");
  const submitting = useRef(false);
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    setListError("");
    try {
      const response = await fetch("/api/inventory", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load inventory.");
      const result = (await response.json()) as { items: InventoryItem[] };
      setItems(result.items);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Unable to load inventory.");
    } finally {
      setLoadingItems(false);
    }
  }, []);
  useEffect(() => { void loadItems(); }, [loadItems]);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    submitting.current = true;
    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), category: data.get("category"),
          supplier: data.get("supplier"), unit: data.get("unit"), sku: data.get("sku"),
          quantity: Number(data.get("quantity")), reorderLevel: Number(data.get("reorderLevel")),
          cost: Number(data.get("cost")), price: Number(data.get("price")),
        }),
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error("Your session has expired. Sign in again before adding inventory.");
        if (response.status === 403) throw new Error("Only an admin can add inventory.");
        throw new Error("Unable to save inventory. Check your entries and try again.");
      }
      setSuccess(`${data.get("name")} was added to cafe inventory.`);
      form.reset();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save inventory.");
    } finally { setSaving(false); submitting.current = false; }
  };
  return <div className="space-y-8"><form onSubmit={save} className="panel p-6 sm:p-8 max-w-3xl">
    <fieldset disabled={saving} className="space-y-6">
      <legend className="text-lg font-semibold mb-5">Item details</legend>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField name="name" label="Item name" required maxLength={200}/>
        <TextField name="category" label="Category" required maxLength={100}/>
        <TextField name="sku" label="SKU (optional)" maxLength={100}/>
        <TextField name="unit" label="Unit (e.g. pcs, kg, litre)" required maxLength={40}/>
        <TextField name="supplier" label="Supplier (optional)" maxLength={200}/>
      </div>
      <div className="border-t pt-6 grid sm:grid-cols-2 gap-5">
        <NumberField name="quantity" label="Opening quantity" step="any"/>
        <NumberField name="reorderLevel" label="Low-stock threshold" step="any"/>
        <NumberField name="cost" label="Cost per unit (RM)" step="0.01"/>
        <NumberField name="price" label="Selling price per unit (RM)" step="0.01"/>
      </div>
      <p className="text-xs text-gray-500">This adds inventory only. To sell the item, add or link a product through the catalog admin.</p>
      <button className="primary-button" disabled={saving}><PackagePlus size={18}/>{saving ? "Saving item…" : "Add inventory item"}</button>
    </fieldset>
    {error && <p role="alert" className="text-sm text-coral mt-5">{error}</p>}
    {success && <p role="status" className="text-sm text-moss mt-5">{success}</p>}
  </form>
  <section className="panel overflow-hidden">
    <div className="flex items-center justify-between gap-4 border-b p-5 sm:p-6">
      <div><p className="eyebrow">CAFE STOCK</p><h2 className="text-xl font-bold mt-1">Inventory items <span className="text-sm font-normal text-gray-500">({items.length})</span></h2></div>
      <button type="button" onClick={() => void loadItems()} disabled={loadingItems} className="secondary-button" aria-label="Refresh inventory"><RefreshCw size={16} className={loadingItems ? "animate-spin" : ""}/><span className="hidden sm:inline">Refresh</span></button>
    </div>
    {listError && <p role="alert" className="p-5 text-sm text-coral">{listError}</p>}
    {loadingItems ? <p className="p-6 text-sm text-gray-500">Loading inventory…</p> : items.length === 0 ? <p className="p-6 text-sm text-gray-500">No cafe inventory items yet. Add your first item above.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-sage/40 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-3">Item</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3">Cost</th><th className="px-5 py-3">Price</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t"><td className="px-5 py-4"><p className="font-semibold">{item.name}</p>{item.sku && <p className="text-xs text-gray-500">{item.sku}</p>}</td><td className="px-5 py-4">{item.category || "—"}</td><td className={`px-5 py-4 font-semibold ${item.quantity <= item.reorderLevel ? "text-coral" : ""}`}>{item.quantity} {item.unit || ""}</td><td className="px-5 py-4">RM {item.cost.toFixed(2)}</td><td className="px-5 py-4">RM {item.price.toFixed(2)}</td></tr>)}</tbody></table></div>}
  </section></div>;
}

function TextField({ name, label, required = false, maxLength }: { name: string; label: string; required?: boolean; maxLength: number }) {
  return <label className="block text-sm font-semibold">{label}<input name={name} required={required} maxLength={maxLength} className="mt-2 w-full rounded-lg border p-3 font-normal"/></label>;
}
function NumberField({ name, label, step }: { name: string; label: string; step: string }) {
  return <label className="block text-sm font-semibold">{label}<input name={name} type="number" inputMode="decimal" required min="0" max="1000000000" step={step} defaultValue="0" className="mt-2 w-full rounded-lg border p-3 font-normal"/></label>;
}