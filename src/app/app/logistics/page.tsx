"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  Package, AlertCircle, X, Truck, ClipboardList, ShoppingCart, Info
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

interface StockItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  supplier_id?: string;
  supplier?: { id: string; name: string };
  last_price: number;
  notes?: string;
}

interface Purchase {
  id: string;
  supplier_id: string;
  supplier?: { id: string; name: string };
  purchase_date: string;
  invoice_number?: string;
  total_amount: number;
  paid_amount: number;
  payment_status: "unpaid" | "partial" | "paid";
  due_date?: string;
  notes?: string;
}

function fmt(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

const iCls = [
  "w-full bg-slate-800 border border-white/10 text-white text-sm",
  "rounded-xl px-3 py-2.5 outline-none",
  "focus:border-[#4DA8FF]/60 transition-colors placeholder:text-slate-500",
].join(" ");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Modal Forms ─────────────────────────────────────────────────────────────

// 1. Stock Form Modal
const StockFormModal = memo(function StockFormModal({
  item, suppliers, onClose, onSaved
}: { item?: StockItem; suppliers: Supplier[]; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name ?? "",
    unit: item?.unit ?? "kg",
    quantity: item?.quantity ?? 0,
    min_quantity: item?.min_quantity ?? 5,
    supplier_id: item?.supplier_id ?? "",
    last_price: item?.last_price ?? 0,
    notes: item?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = useCallback((k: string, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const payload = {
        ...form,
        supplier_id: form.supplier_id === "" ? null : form.supplier_id
      };
      if (isEdit) {
        await api.put(`/v1/stocks/${item!.id}`, payload);
      } else {
        await api.post("/v1/stocks", payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal menyimpan barang stok.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">
            {isEdit ? "Edit Stok Barang" : "Tambah Stok Baru"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama Barang *">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={iCls} placeholder="Deterjen Sakura Premium" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Satuan *">
              <input required value={form.unit} onChange={(e) => set("unit", e.target.value)} className={iCls} placeholder="kg, liter, pcs" />
            </Field>
            <Field label="Harga Beli Terakhir (Rp)">
              <input type="number" min={0} value={form.last_price} onChange={(e) => set("last_price", +e.target.value)} className={iCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jumlah Stok Sekarang *">
              <input required type="number" step="any" min={0} value={form.quantity} onChange={(e) => set("quantity", +e.target.value)} className={iCls} />
            </Field>
            <Field label="Batas Minimal Stok (Alert) *">
              <input required type="number" step="any" min={0} value={form.min_quantity} onChange={(e) => set("min_quantity", +e.target.value)} className={iCls} />
            </Field>
          </div>
          <Field label="Supplier Rekomendasi">
            <select value={form.supplier_id} onChange={(e) => set("supplier_id", e.target.value)} className={iCls} style={{ colorScheme: "dark" }}>
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Catatan">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${iCls} resize-none`} placeholder="Lokasi penyimpanan, dll..." />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl bg-[#4DA8FF] text-white text-sm font-bold hover:bg-[#4DA8FF]/90">{loading ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
});

// 2. Supplier Form Modal
const SupplierFormModal = memo(function SupplierFormModal({
  supplier, onClose, onSaved
}: { supplier?: Supplier; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!supplier;
  const [form, setForm] = useState({
    name: supplier?.name ?? "",
    contact_name: supplier?.contact_name ?? "",
    phone: supplier?.phone ?? "",
    address: supplier?.address ?? "",
    notes: supplier?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = useCallback((k: string, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (isEdit) {
        await api.put(`/v1/suppliers/${supplier!.id}`, form);
      } else {
        await api.post("/v1/suppliers", form);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal menyimpan supplier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">
            {isEdit ? "Edit Supplier" : "Tambah Supplier Baru"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama Perusahaan/Toko *">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={iCls} placeholder="CV. Indo Detergen Jaya" />
          </Field>
          <Field label="Nama Kontak (Sales/PIC)">
            <input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className={iCls} placeholder="Budi Santoso" />
          </Field>
          <Field label="No. Telepon/WA">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={iCls} placeholder="08123456789" />
          </Field>
          <Field label="Alamat">
            <textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} className={`${iCls} resize-none`} placeholder="Alamat lengkap supplier..." />
          </Field>
          <Field label="Catatan Tambahan">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${iCls} resize-none`} placeholder="Syarat pembayaran, diskon khusus, dll..." />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl bg-[#4DA8FF] text-white text-sm font-bold hover:bg-[#4DA8FF]/90">{loading ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
});

// 3. Purchase Form Modal
const PurchaseFormModal = memo(function PurchaseFormModal({
  suppliers, onClose, onSaved
}: { suppliers: Supplier[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    supplier_id: "",
    purchase_date: new Date().toISOString().substring(0, 10),
    invoice_number: "",
    total_amount: 0,
    paid_amount: 0,
    due_date: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = useCallback((k: string, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_id) {
      setError("Silahkan pilih supplier terlebih dahulu.");
      return;
    }
    setLoading(true); setError("");
    try {
      await api.post("/v1/purchases", {
        ...form,
        due_date: form.due_date === "" ? null : form.due_date
      });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal menyimpan pembelian.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">Catat Pembelian Baru</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Supplier *">
            <select required value={form.supplier_id} onChange={(e) => set("supplier_id", e.target.value)} className={iCls} style={{ colorScheme: "dark" }}>
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal Pembelian *">
              <input required type="date" value={form.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} className={iCls} style={{ colorScheme: "dark" }} />
            </Field>
            <Field label="No. Invoice/Nota">
              <input value={form.invoice_number} onChange={(e) => set("invoice_number", e.target.value)} className={iCls} placeholder="INV/123/2026" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Belanja (Rp) *">
              <input required type="number" min={0} value={form.total_amount} onChange={(e) => set("total_amount", +e.target.value)} className={iCls} />
            </Field>
            <Field label="Jumlah Dibayar (Rp) *">
              <input required type="number" min={0} value={form.paid_amount} onChange={(e) => set("paid_amount", +e.target.value)} className={iCls} />
            </Field>
          </div>
          {form.paid_amount < form.total_amount && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-3">
              <p className="text-[10px] text-orange-400 flex items-center gap-1.5 font-bold uppercase tracking-wide">
                <Info className="h-3.5 w-3.5" /> Pembelian Kredit (Hutang)
              </p>
              <Field label="Tanggal Jatuh Tempo Hutang *">
                <input required type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className={iCls} style={{ colorScheme: "dark" }} />
              </Field>
            </div>
          )}
          <Field label="Catatan Pembelian">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${iCls} resize-none`} placeholder="Keterangan barang yang dibeli..." />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-500/90">{loading ? "Menyimpan..." : "Catat Pembelian"}</button>
          </div>
        </form>
      </div>
    </div>
  );
});

// ─── Main Logistics Page ─────────────────────────────────────────────────────
export default function LogisticsPage() {
  const [tab, setTab] = useState<"stocks" | "suppliers" | "purchases">("stocks");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [busy, setBusy] = useState(true);

  // Modals state
  const [stockModal, setStockModal] = useState<"create" | "edit" | null>(null);
  const [supplierModal, setSupplierModal] = useState<"create" | "edit" | null>(null);
  const [purchaseModal, setPurchaseModal] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const loadSuppliers = useCallback(async () => {
    try {
      const r = await api.get("/v1/suppliers");
      const payload = r.data?.data || r.data || r;
      setSuppliers(Array.isArray(payload) ? payload : []);
    } catch {}
  }, []);

  const loadStocks = useCallback(async () => {
    try {
      const r = await api.get("/v1/stocks");
      const payload = r.data?.data || r.data || r;
      setStocks(payload?.items ?? []);
      setSummary(payload?.summary ?? null);
    } catch {}
  }, []);

  const loadPurchases = useCallback(async () => {
    try {
      const r = await api.get("/v1/purchases");
      const payload = r.data?.data || r.data || r;
      setPurchases(payload?.purchases ?? []);
    } catch {}
  }, []);

  const init = useCallback(async () => {
    setBusy(true);
    await Promise.all([loadSuppliers(), loadStocks(), loadPurchases()]);
    setBusy(false);
  }, [loadSuppliers, loadStocks, loadPurchases]);

  useEffect(() => {
    init();
  }, [init]);

  const deleteStock = async (id: string) => {
    if (!confirm("Hapus barang stok ini?")) return;
    try {
      await api.delete(`/v1/stocks/${id}`);
      loadStocks();
    } catch {
      alert("Gagal menghapus.");
    }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm("Hapus supplier ini? Peringatan: Pembelian yang terkait dengan supplier ini mungkin akan terpengaruh.")) return;
    try {
      await api.delete(`/v1/suppliers/${id}`);
      loadSuppliers();
    } catch {
      alert("Gagal menghapus.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4DA8FF]/5 rounded-full blur-3xl -z-0" />

      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-[#4DA8FF]" /> Logistik &amp; Stok
              </h1>
              <p className="text-[10px] text-slate-400">Atur ketersediaan bahan, daftar pemasok, dan rekap pembelian</p>
            </div>
          </div>
          <div className="flex gap-2">
            {tab === "stocks" && (
              <button onClick={() => { setSelectedStock(null); setStockModal("create"); }} className="px-4 py-2 bg-[#4DA8FF] text-white font-bold text-xs rounded-xl flex items-center gap-2">
                <Plus className="h-4 w-4" /> Tambah Stok
              </button>
            )}
            {tab === "suppliers" && (
              <button onClick={() => { setSelectedSupplier(null); setSupplierModal("create"); }} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2">
                <Plus className="h-4 w-4" /> Tambah Supplier
              </button>
            )}
            {tab === "purchases" && (
              <button onClick={() => setPurchaseModal(true)} className="px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Catat Pembelian
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Tab Buttons */}
        <div className="flex border-b border-white/10 gap-6">
          {[
            { id: "stocks", label: "Stok Bahan Baku", count: stocks.length },
            { id: "suppliers", label: "Daftar Supplier", count: suppliers.length },
            { id: "purchases", label: "Riwayat Pembelian", count: purchases.length }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`pb-3 font-bold text-sm relative transition-all ${tab === t.id ? "text-[#4DA8FF]" : "text-slate-400 hover:text-white"}`}
            >
              {t.label} <span className="ml-1 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-slate-300">{t.count}</span>
              {tab === t.id && (
                <motion.div layoutId="logisticsTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4DA8FF]" />
              )}
            </button>
          ))}
        </div>

        {busy ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-[#4DA8FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div>
            {/* STOCKS TAB */}
            {tab === "stocks" && (
              <div className="space-y-4">
                {summary && summary.low_stock_items > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-bold">Ada {summary.low_stock_items} barang yang stoknya menipis atau habis!</p>
                      <p className="text-[10px] text-red-400/80">Segera lakukan pembelian ke supplier terkait untuk mencegah gangguan operasional.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stocks.map(item => {
                    const isLow = item.quantity <= item.min_quantity;
                    return (
                      <div key={item.id} className={`bg-white/5 border rounded-2xl p-5 transition-all ${isLow ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50" : "border-white/10 hover:border-white/20"}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-sm text-white">{item.name}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Supplier: {item.supplier?.name ?? "Umum / Tidak Ada"}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setSelectedStock(item); setStockModal("edit"); }} className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => deleteStock(item.id)} className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 bg-black/20 p-3 rounded-xl">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Stok Saat Ini</p>
                            <p className={`text-base font-black ${isLow ? "text-red-400" : "text-[#4DA8FF]"}`}>{item.quantity} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Batas Minimal</p>
                            <p className="text-base font-bold text-white">{item.min_quantity} {item.unit}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 text-[10px]">
                          <span className="text-slate-400">Harga Beli Terakhir:</span>
                          <span className="font-bold text-emerald-400">{fmt(item.last_price)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {stocks.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">Belum ada barang terdaftar.</div>
                  )}
                </div>
              </div>
            )}

            {/* SUPPLIERS TAB */}
            {tab === "suppliers" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map(s => (
                  <div key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Truck className="h-4 w-4" /></div>
                          <h3 className="font-bold text-sm text-white">{s.name}</h3>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setSelectedSupplier(s); setSupplierModal("edit"); }} className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => deleteSupplier(s.id)} className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4 text-xs text-slate-300">
                        {s.contact_name && <p><span className="text-slate-500">Kontak:</span> {s.contact_name}</p>}
                        {s.phone && <p><span className="text-slate-500">Telepon/WA:</span> {s.phone}</p>}
                        {s.address && <p><span className="text-slate-500">Alamat:</span> {s.address}</p>}
                      </div>
                    </div>
                    {s.notes && (
                      <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-400 italic">
                        Catatan: {s.notes}
                      </div>
                    )}
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500">Belum ada supplier terdaftar.</div>
                )}
              </div>
            )}

            {/* PURCHASES TAB */}
            {tab === "purchases" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      {["Tanggal","No Invoice","Supplier","Total Belanja","Dibayar","Status","Jatuh Tempo"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {purchases.map(p => (
                      <tr key={p.id} className="hover:bg-white/5 transition-all">
                        <td className="px-4 py-3.5 text-white font-medium">{p.purchase_date}</td>
                        <td className="px-4 py-3.5 text-slate-400">{p.invoice_number ?? "-"}</td>
                        <td className="px-4 py-3.5 text-white font-bold">{p.supplier?.name ?? "Tidak Diketahui"}</td>
                        <td className="px-4 py-3.5 font-bold text-white">{fmt(p.total_amount)}</td>
                        <td className="px-4 py-3.5 text-emerald-400">{fmt(p.paid_amount)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" : p.payment_status === "partial" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                            {p.payment_status === "paid" ? "Lunas" : p.payment_status === "partial" ? "Sebagian" : "Belum Bayar"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">{p.due_date ?? "-"}</td>
                      </tr>
                    ))}
                    {purchases.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">Belum ada riwayat pembelian.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {stockModal && (
        <StockFormModal
          item={stockModal === "edit" ? selectedStock ?? undefined : undefined}
          suppliers={suppliers}
          onClose={() => setStockModal(null)}
          onSaved={() => { setStockModal(null); loadStocks(); }}
        />
      )}

      {supplierModal && (
        <SupplierFormModal
          supplier={supplierModal === "edit" ? selectedSupplier ?? undefined : undefined}
          onClose={() => setSupplierModal(null)}
          onSaved={() => { setSupplierModal(null); loadSuppliers(); }}
        />
      )}

      {purchaseModal && (
        <PurchaseFormModal
          suppliers={suppliers}
          onClose={() => setPurchaseModal(false)}
          onSaved={() => { setPurchaseModal(false); loadPurchases(); loadStocks(); }}
        />
      )}
    </div>
  );
}
