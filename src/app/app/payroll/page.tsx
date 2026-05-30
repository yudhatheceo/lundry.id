"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Pencil, CheckCircle2, AlertCircle,
  Users, Wallet, X, ChevronDown, ChevronUp
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PayrollItem {
  id: string; payroll_id: string; user_id: string;
  user_name: string; user_role: string;
  basic_salary: number;
  allowances: { label: string; amount: number }[];
  deductions: { label: string; amount: number }[];
  total_allowances: number; total_deductions: number;
  gross_salary: number; net_salary: number;
}

interface Payroll {
  id: string; month: number; year: number; period_label: string;
  status: "draft" | "finalized";
  total_gross: number; total_deductions: number; total_net: number;
  notes?: string; created_at: string;
  items: PayrollItem[];
}

function fmt(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

// ─── Item Edit Form ───────────────────────────────────────────────────────────
function ItemEditModal({ item, payrollId, onClose, onSaved }: {
  item: PayrollItem; payrollId: string; onClose: () => void; onSaved: () => void;
}) {
  const [basicSalary, setBasicSalary] = useState(item.basic_salary);
  const [allowances, setAllowances] = useState<{ label: string; amount: number }[]>(
    item.allowances.length > 0 ? item.allowances : [{ label: "Tunjangan Makan", amount: 0 }]
  );
  const [deductions, setDeductions] = useState<{ label: string; amount: number }[]>(
    item.deductions.length > 0 ? item.deductions : [{ label: "BPJS Kesehatan", amount: 0 }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAllow = allowances.reduce((s, a) => s + (a.amount || 0), 0);
  const totalDeduct = deductions.reduce((s, d) => s + (d.amount || 0), 0);
  const gross = basicSalary + totalAllow;
  const net = Math.max(0, gross - totalDeduct);

  const updateRow = <T extends { label: string; amount: number }>(
    list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, i: number, key: keyof T, val: any
  ) => setList(list.map((r, idx) => idx === i ? { ...r, [key]: val } : r) as T[]);

  const handleSave = async () => {
    setLoading(true); setError("");
    try {
      await api.put(`/v1/payrolls/${payrollId}/items/${item.id}`, {
        basic_salary: basicSalary,
        allowances: allowances.filter(a => a.label),
        deductions: deductions.filter(d => d.label),
      });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Gagal menyimpan.");
    } finally { setLoading(false); }
  };

  const inputCls = "bg-slate-800 border border-white/10 text-white text-xs rounded-lg px-2.5 py-2 outline-none focus:border-[#4DA8FF]/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-bold">Edit Slip Gaji</h2>
            <p className="text-xs text-slate-400">{item.user_name} · <span className="capitalize">{item.user_role}</span></p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>
          )}

          {/* Gaji Pokok */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Gaji Pokok (Rp)</label>
            <input type="number" min={0} value={basicSalary} onChange={(e) => setBasicSalary(+e.target.value)}
              className={`${inputCls} w-full text-sm`} />
          </div>

          {/* Tunjangan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Tunjangan</label>
              <button onClick={() => setAllowances([...allowances, { label: "", amount: 0 }])}
                className="text-[10px] text-[#4DA8FF] font-bold flex items-center gap-1">
                <Plus className="h-3 w-3" /> Tambah
              </button>
            </div>
            <div className="space-y-2">
              {allowances.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input value={a.label} onChange={(e) => updateRow(allowances, setAllowances, i, "label", e.target.value)}
                    placeholder="Nama tunjangan" className={`${inputCls} flex-1`} />
                  <input type="number" min={0} value={a.amount} onChange={(e) => updateRow(allowances, setAllowances, i, "amount", +e.target.value)}
                    className={`${inputCls} w-32`} />
                  <button onClick={() => setAllowances(allowances.filter((_, idx) => idx !== i))}
                    className="text-slate-500 hover:text-red-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Potongan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Potongan</label>
              <button onClick={() => setDeductions([...deductions, { label: "", amount: 0 }])}
                className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                <Plus className="h-3 w-3" /> Tambah
              </button>
            </div>
            <div className="space-y-2">
              {deductions.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <input value={d.label} onChange={(e) => updateRow(deductions, setDeductions, i, "label", e.target.value)}
                    placeholder="Nama potongan" className={`${inputCls} flex-1`} />
                  <input type="number" min={0} value={d.amount} onChange={(e) => updateRow(deductions, setDeductions, i, "amount", +e.target.value)}
                    className={`${inputCls} w-32`} />
                  <button onClick={() => setDeductions(deductions.filter((_, idx) => idx !== i))}
                    className="text-slate-500 hover:text-red-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Gaji Pokok</span><span className="font-bold">{fmt(basicSalary)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Tunjangan</span><span className="font-bold text-emerald-400">+{fmt(totalAllow)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Gaji Kotor</span><span className="font-bold">{fmt(gross)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Potongan</span><span className="font-bold text-red-400">-{fmt(totalDeduct)}</span></div>
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="font-bold">Gaji Bersih</span>
              <span className="font-black text-[#4DA8FF] text-base">{fmt(net)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-10 rounded-2xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5">Batal</button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 h-10 rounded-2xl bg-[#4DA8FF] text-white text-sm font-bold hover:bg-[#4DA8FF]/90 disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Payroll Detail Card ──────────────────────────────────────────────────────
function PayrollCard({ payroll, onRefresh }: { payroll: Payroll; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<PayrollItem | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const finalize = async () => {
    if (!confirm(`Finalisasi payroll ${payroll.period_label}? Data tidak bisa diubah setelah ini.`)) return;
    setFinalizing(true);
    try { await api.post(`/v1/payrolls/${payroll.id}/finalize`); onRefresh(); }
    catch { alert("Gagal finalisasi."); }
    finally { setFinalizing(false); }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="font-bold text-white">{payroll.period_label}</p>
            <p className="text-xs text-slate-400">{payroll.items.length} karyawan · {payroll.status === "finalized" ? "✅ Finalisasi" : "📝 Draft"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500">Total Gaji Bersih</p>
            <p className="font-black text-[#4DA8FF]">{fmt(payroll.total_net)}</p>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/10">
            <div className="p-5 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Gaji Kotor", value: fmt(payroll.total_gross), color: "text-white" },
                  { label: "Total Potongan", value: fmt(payroll.total_deductions), color: "text-red-400" },
                  { label: "Gaji Bersih", value: fmt(payroll.total_net), color: "text-[#4DA8FF]" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[9px] text-slate-400 mb-1">{s.label}</p>
                    <p className={`font-bold text-xs ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      {["Nama","Role","Gaji Pokok","Tunjangan","Potongan","Gaji Bersih","Aksi"].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payroll.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5">
                        <td className="px-3 py-2.5 text-white font-medium">{item.user_name}</td>
                        <td className="px-3 py-2.5"><span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-[9px] font-bold capitalize">{item.user_role}</span></td>
                        <td className="px-3 py-2.5 text-slate-300">{fmt(item.basic_salary)}</td>
                        <td className="px-3 py-2.5 text-emerald-400">+{fmt(item.total_allowances)}</td>
                        <td className="px-3 py-2.5 text-red-400">-{fmt(item.total_deductions)}</td>
                        <td className="px-3 py-2.5 font-bold text-[#4DA8FF]">{fmt(item.net_salary)}</td>
                        <td className="px-3 py-2.5">
                          {payroll.status === "draft" && (
                            <button onClick={() => setEditItem(item)}
                              className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                              <Pencil className="h-3 w-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {payroll.status === "draft" && (
                <button onClick={finalize} disabled={finalizing}
                  className="w-full h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-500/90 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                  <CheckCircle2 className="h-4 w-4" />
                  {finalizing ? "Memfinalisasi..." : `Finalisasi Payroll ${payroll.period_label}`}
                </button>
              )}
              {payroll.status === "finalized" && (
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold py-2">
                  <CheckCircle2 className="h-4 w-4" /> Payroll ini sudah difinalisasi
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editItem && (
          <ItemEditModal
            item={editItem} payrollId={payroll.id}
            onClose={() => setEditItem(null)}
            onSaved={() => { setEditItem(null); onRefresh(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create Payroll Modal ─────────────────────────────────────────────────────
function CreatePayrollModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  const handleCreate = async () => {
    setLoading(true); setError("");
    try {
      await api.post("/v1/payrolls", { month, year, notes });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Gagal membuat payroll.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Buat Payroll Baru</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Bulan</label>
              <select value={month} onChange={(e) => setMonth(+e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none" style={{ colorScheme: 'dark' }}>
                {MONTHS.map((m, i) => <option key={i} value={i+1} className="bg-slate-800 text-white">{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Tahun</label>
              <input type="number" value={year} min={2020} onChange={(e) => setYear(+e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Catatan</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none resize-none" />
          </div>
          <p className="text-[10px] text-slate-500">Sistem akan otomatis membuat item gaji untuk semua staf aktif.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-10 rounded-2xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5">Batal</button>
            <button onClick={handleCreate} disabled={loading}
              className="flex-1 h-10 rounded-2xl bg-purple-500 text-white text-sm font-bold hover:bg-purple-500/90 disabled:opacity-50">
              {loading ? "Membuat..." : "Buat Payroll"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [busy, setBusy] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const r = await api.get("/v1/payrolls");
      const payload = r.data?.data || r.data || r;
      setPayrolls(Array.isArray(payload) ? payload : []);
    } catch {}
    finally { setBusy(false); }
  };

  useEffect(() => { load(); }, []);

  const totalNet = payrolls.reduce((s, p) => s + p.total_net, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl -z-0" />

      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" /> Payroll Karyawan
              </h1>
              <p className="text-[10px] text-slate-400">Penggajian bulanan sederhana — tidak perlu background akuntansi</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-500/90 text-white rounded-xl text-sm font-bold transition-all">
            <Plus className="h-4 w-4" /> Buat Payroll Bulan Ini
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 space-y-4">
        {/* Banner Info Auto Kalkulasi */}
        <div className="p-4 rounded-2xl bg-[#4DA8FF]/10 border border-[#4DA8FF]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#4DA8FF]/20 text-[#4DA8FF]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#4DA8FF]">Engine Payroll Pintar Aktif! (Fase 4)</h4>
              <p className="text-xs text-slate-400">Gaji Pokok, Uang Makan (Harian &times; Kehadiran), dan Bonus Kinerja (Poin Produksi &times; Rp 1.500) sekarang <strong>dihitung otomatis</strong> setiap Anda membuat Payroll baru.</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        {payrolls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Periode</p>
              <p className="text-2xl font-black text-white">{payrolls.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Pengeluaran Gaji</p>
              <p className="text-2xl font-black text-purple-400">{fmt(totalNet)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Periode Terakhir</p>
              <p className="text-lg font-black text-white">{payrolls[0]?.period_label ?? "-"}</p>
            </div>
          </div>
        )}

        {busy ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payrolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="mb-4">Belum ada data payroll.</p>
            <button onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-500/90 transition-all">
              Buat Payroll Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {payrolls.map((p) => (
              <PayrollCard key={p.id} payroll={p} onRefresh={load} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreatePayrollModal
            onClose={() => setShowCreate(false)}
            onSaved={() => { setShowCreate(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
