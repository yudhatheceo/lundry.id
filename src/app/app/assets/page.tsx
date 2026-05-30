"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  Package, AlertCircle, X
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Asset {
  id: string; name: string; category: string; brand?: string;
  serial_number?: string; purchase_price: number; purchase_date: string;
  useful_life_years: number; depreciation_method: string;
  salvage_value: number; current_book_value: number;
  location?: string; condition: string; notes?: string;
  years_used: number; years_remaining: number;
  this_year_depreciation: number; depreciation_percent: number;
  depreciation_schedule?: any[];
}

const CATEGORY_LABELS: Record<string, string> = {
  mesin: "Mesin", kendaraan: "Kendaraan",
  peralatan: "Peralatan", inventaris: "Inventaris", lainnya: "Lainnya",
};

const CONDITION_COLORS: Record<string, string> = {
  good:     "text-emerald-400 bg-emerald-500/10",
  fair:     "text-yellow-400 bg-yellow-500/10",
  poor:     "text-red-400 bg-red-500/10",
  disposed: "text-slate-400 bg-slate-500/10",
};

// ─── Helpers — TOP-LEVEL supaya tidak di-recreate setiap render ───────────────
function fmt(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

const iCls = [
  "w-full bg-slate-800 border border-white/10 text-white text-sm",
  "rounded-xl px-3 py-2.5 outline-none",
  "focus:border-[#4DA8FF]/60 transition-colors placeholder:text-slate-500",
].join(" ");

// Field HARUS di luar semua komponen agar tidak di-remount setiap setState
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

// ─── Form Modal — dibungkus memo agar tidak re-render karena callback baru ────
const AssetFormModal = memo(function AssetFormModal({
  asset, onClose, onSaved,
}: { asset?: Asset; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!asset;

  const [form, setForm] = useState({
    name:                asset?.name               ?? "",
    category:            asset?.category           ?? "mesin",
    brand:               asset?.brand              ?? "",
    serial_number:       asset?.serial_number      ?? "",
    purchase_price:      asset?.purchase_price     ?? 0,
    purchase_date:       asset?.purchase_date      ?? "",
    useful_life_years:   asset?.useful_life_years  ?? 5,
    depreciation_method: asset?.depreciation_method ?? "straight_line",
    salvage_value:       asset?.salvage_value      ?? 0,
    location:            asset?.location           ?? "",
    condition:           asset?.condition          ?? "good",
    notes:               asset?.notes              ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // useCallback agar fungsi handler stabil antar render
  const set = useCallback((k: string, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (isEdit) {
        await api.put(`/v1/assets/${asset!.id}`, form);
      } else {
        await api.post("/v1/assets", form);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal menyimpan aset.");
    } finally {
      setLoading(false);
    }
  };

  // Gunakan div biasa (bukan motion.div) agar tidak ada re-animate yang ganggu fokus
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-bold text-lg text-white">
            {isEdit ? "Edit Aset" : "Tambah Aset Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Aset *">
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={iCls}
                placeholder="Mesin Cuci Front Load"
              />
            </Field>

            <Field label="Kategori *">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={iCls}
                style={{ colorScheme: "dark" }}
              >
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v} className="bg-slate-800 text-white">{l}</option>
                ))}
              </select>
            </Field>

            <Field label="Merk / Brand">
              <input
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                className={iCls}
                placeholder="Samsung, LG, dll"
              />
            </Field>

            <Field label="No. Seri">
              <input
                value={form.serial_number}
                onChange={(e) => set("serial_number", e.target.value)}
                className={iCls}
                placeholder="SN-XXXX"
              />
            </Field>

            <Field label="Harga Beli (Rp) *">
              <input
                required
                type="number"
                min={0}
                value={form.purchase_price}
                onChange={(e) => set("purchase_price", +e.target.value)}
                className={iCls}
              />
            </Field>

            <Field label="Tanggal Beli *">
              <input
                required
                type="date"
                value={form.purchase_date}
                onChange={(e) => set("purchase_date", e.target.value)}
                className={iCls}
                style={{ colorScheme: "dark" }}
              />
            </Field>

            <Field label="Umur Ekonomis (Tahun) *">
              <input
                required
                type="number"
                min={1}
                max={50}
                value={form.useful_life_years}
                onChange={(e) => set("useful_life_years", +e.target.value)}
                className={iCls}
              />
            </Field>

            <Field label="Metode Depresiasi *">
              <select
                value={form.depreciation_method}
                onChange={(e) => set("depreciation_method", e.target.value)}
                className={iCls}
                style={{ colorScheme: "dark" }}
              >
                <option value="straight_line"     className="bg-slate-800 text-white">Garis Lurus (Straight Line)</option>
                <option value="declining_balance"  className="bg-slate-800 text-white">Saldo Menurun (Declining Balance)</option>
              </select>
            </Field>

            <Field label="Nilai Sisa (Rp)">
              <input
                type="number"
                min={0}
                value={form.salvage_value}
                onChange={(e) => set("salvage_value", +e.target.value)}
                className={iCls}
              />
            </Field>

            <Field label="Lokasi Aset">
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className={iCls}
                placeholder="Outlet Jember Pusat"
              />
            </Field>

            <Field label="Kondisi">
              <select
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                className={iCls}
                style={{ colorScheme: "dark" }}
              >
                <option value="good"     className="bg-slate-800 text-white">Baik</option>
                <option value="fair"     className="bg-slate-800 text-white">Cukup</option>
                <option value="poor"     className="bg-slate-800 text-white">Rusak</option>
                <option value="disposed" className="bg-slate-800 text-white">Dibuang</option>
              </select>
            </Field>
          </div>

          <Field label="Catatan">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className={`${iCls} resize-none`}
              placeholder="Keterangan tambahan..."
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-2xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-2xl bg-[#4DA8FF] text-white text-sm font-bold hover:bg-[#4DA8FF]/90 transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Aset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// ─── Depreciation Schedule ────────────────────────────────────────────────────
function DepreciationSchedule({ asset }: { asset: Asset }) {
  const [open,     setOpen]     = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    if (schedule.length === 0) {
      const r = await api.get(`/v1/assets/${asset.id}`);
      const payload = r.data?.data || r.data || r;
      setSchedule(payload?.depreciation_schedule ?? []);
    }
    setOpen(true);
  };

  return (
    <div className="mt-3 border-t border-white/5 pt-3">
      <button
        onClick={toggle}
        className="flex items-center gap-2 text-[10px] text-[#4DA8FF] font-bold uppercase tracking-widest hover:text-[#4DA8FF]/80 transition-colors"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {open ? "Sembunyikan" : "Lihat"} Jadwal Depresiasi
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-[10px]">
                <thead className="bg-white/5">
                  <tr>
                    {["Tahun","Periode","Depresiasi","Nilai Awal","Nilai Akhir"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {schedule.map((s) => (
                    <tr key={s.year} className={s.year === new Date().getFullYear() ? "bg-[#4DA8FF]/5" : ""}>
                      <td className={`px-3 py-2 font-bold ${s.year === new Date().getFullYear() ? "text-[#4DA8FF]" : "text-white"}`}>{s.year}</td>
                      <td className="px-3 py-2 text-slate-400">Tahun {s.period}</td>
                      <td className="px-3 py-2 text-red-400">{fmt(s.depreciation)}</td>
                      <td className="px-3 py-2 text-slate-300">{fmt(s.book_value_start)}</td>
                      <td className="px-3 py-2 text-emerald-400">{fmt(s.book_value_end)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Asset Card ───────────────────────────────────────────────────────────────
function AssetCard({ asset, onEdit, onDelete }: {
  asset: Asset; onEdit: () => void; onDelete: () => void;
}) {
  const pct = Math.min(100, asset.depreciation_percent);
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[asset.category] ?? asset.category}
            </span>
            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${CONDITION_COLORS[asset.condition]}`}>
              {asset.condition === "good" ? "Baik" : asset.condition === "fair" ? "Cukup" : asset.condition === "poor" ? "Rusak" : "Dibuang"}
            </span>
          </div>
          <h3 className="font-bold text-white text-sm leading-tight">{asset.name}</h3>
          {asset.brand && (
            <p className="text-[10px] text-slate-500 mt-0.5">
              {asset.brand}{asset.serial_number ? ` · ${asset.serial_number}` : ""}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit}   className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><p className="text-[9px] text-slate-500 uppercase tracking-widest">Harga Beli</p><p className="text-sm font-bold text-white">{fmt(asset.purchase_price)}</p></div>
        <div><p className="text-[9px] text-slate-500 uppercase tracking-widest">Nilai Buku Saat Ini</p><p className="text-sm font-bold text-emerald-400">{fmt(asset.current_book_value)}</p></div>
        <div><p className="text-[9px] text-slate-500 uppercase tracking-widest">Depresiasi Tahun Ini</p><p className="text-sm font-bold text-red-400">{fmt(asset.this_year_depreciation)}</p></div>
        <div><p className="text-[9px] text-slate-500 uppercase tracking-widest">Sisa Umur</p><p className="text-sm font-bold text-white">{asset.years_remaining} tahun</p></div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] text-slate-500">
          <span>Nilai Terdepresiasi</span><span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct > 75 ? "bg-red-500" : pct > 50 ? "bg-yellow-500" : "bg-emerald-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <DepreciationSchedule asset={asset} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const [assets,   setAssets]   = useState<Asset[]>([]);
  const [summary,  setSummary]  = useState<any>(null);
  const [busy,     setBusy]     = useState(true);
  const [modal,    setModal]    = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [filter,   setFilter]   = useState("all");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await api.get("/v1/assets");
      const payload = r.data?.data || r.data || r;
      setAssets(payload?.assets ?? []);
      setSummary(payload?.summary ?? null);
    } catch {}
    finally { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus aset ini?")) return;
    try { await api.delete(`/v1/assets/${id}`); load(); }
    catch { alert("Gagal menghapus aset."); }
  };

  // Callback stabil — tidak dibuat ulang tiap render → AssetFormModal tidak re-render
  const handleClose = useCallback(() => { setModal(null); setSelected(null); }, []);
  const handleSaved = useCallback(() => { setModal(null); setSelected(null); load(); }, [load]);

  const filtered = filter === "all" ? assets : assets.filter((a) => a.category === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-0" />

      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-400" /> Aset &amp; Depresiasi
              </h1>
              <p className="text-[10px] text-slate-400">Inventarisir aset tetap + kalkulasi penyusutan otomatis</p>
            </div>
          </div>
          <button
            onClick={() => { setSelected(null); setModal("create"); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-500/90 text-white rounded-xl text-sm font-bold transition-all"
          >
            <Plus className="h-4 w-4" /> Tambah Aset
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 space-y-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Aset",       value: `${summary.total_assets} unit`,      color: "text-white" },
              { label: "Nilai Perolehan",   value: fmt(summary.total_value),            color: "text-white" },
              { label: "Nilai Buku Total",  value: fmt(summary.total_book_value),       color: "text-emerald-400" },
              { label: "Total Depresiasi",  value: fmt(summary.total_depreciated),      color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["all", ...Object.keys(CATEGORY_LABELS)].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === c ? "bg-orange-500 text-white" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {c === "all" ? "Semua" : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {/* Asset Grid */}
        {busy ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Package className="h-10 w-10 mb-3 opacity-30" />
            <p>Belum ada aset. Klik "Tambah Aset" untuk mulai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <AssetCard
                key={a.id}
                asset={a}
                onEdit={() => { setSelected(a); setModal("edit"); }}
                onDelete={() => handleDelete(a.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal — tidak di dalam AnimatePresence agar tidak ada re-animate saat form diisi */}
      {modal && (
        <AssetFormModal
          key={modal === "edit" ? selected?.id ?? "edit" : "create"}
          asset={modal === "edit" ? selected ?? undefined : undefined}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
