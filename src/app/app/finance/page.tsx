"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, DollarSign, AlertCircle, X,
  TrendingDown, TrendingUp, Calendar, User, FileText, CheckCircle2,
  Plus, Trash2, Download, CreditCard, RefreshCw, Calculator, Percent
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DebtItem {
  id: string;
  supplier_name: string;
  invoice_number?: string;
  purchase_date: string;
  due_date?: string;
  total_amount: number;
  remaining_debt: number;
  payment_status: "unpaid" | "partial" | "paid";
}

interface ReceivableItem {
  id: string;
  customer_name: string;
  order_number: string;
  order_date: string;
  total_amount: number;
  remaining_receivable: number;
  payment_status: "unpaid" | "partial" | "paid";
}

interface CashTransactionItem {
  id: string;
  outlet_id?: string;
  outlet?: {
    id: string;
    name: string;
  };
  transaction_date: string;
  type: "in" | "out";
  category: string;
  amount: number;
  payment_method: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

interface SettlementItem {
  payment_id: string;
  payment_method: string;
  amount: number;
  created_at: string;
  transaction_reference?: string;
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    outlet_name?: string;
  };
}

interface ProfitLossData {
  start_date: string;
  end_date: string;
  days_count: number;
  revenue: number;
  expenses: {
    payroll: number;
    supplies: number;
    operational: number;
    pg_fees: number;
    depreciation: number;
    others: number;
    total_operational_expenses: number;
  };
  net_profit: number;
  non_operating_cashflow: {
    capital_injection: number;
    prive_withdrawal: number;
    dividend_withdrawal: number;
    asset_capital_expenditure: number;
  };
}

interface OutletItem {
  id: string;
  name: string;
}

function fmt(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

// ─── Pay Debt Modal ───────────────────────────────────────────────────────────
const PayDebtModal = memo(function PayDebtModal({
  item, onClose, onSaved
}: { item: DebtItem; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState<number>(item.remaining_debt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > item.remaining_debt) {
      setError("Jumlah pembayaran tidak valid.");
      return;
    }
    setLoading(true); setError("");
    try {
      await api.post(`/v1/purchases/${item.id}/pay`, { amount });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal memproses pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">Bayar Cicilan Hutang</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Supplier</p>
            <p className="font-bold text-white text-sm">{item.supplier_name}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3 rounded-xl">
            <div>
              <p className="text-slate-400 mb-0.5">Sisa Hutang</p>
              <p className="font-bold text-red-400">{fmt(item.remaining_debt)}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Total Asli</p>
              <p className="font-bold text-slate-300">{fmt(item.total_amount)}</p>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Jumlah Bayar (Rp) *</label>
            <input required type="number" max={item.remaining_debt} min={1} value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-[#4DA8FF]/60 transition-colors" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-500/90">{loading ? "Memproses..." : "Bayar Hutang"}</button>
          </div>
        </form>
      </div>
    </div>
  );
});

// ─── Add Cash Transaction Modal ───────────────────────────────────────────────
const AddTransactionModal = memo(function AddTransactionModal({
  onClose, onSaved, outlets
}: { onClose: () => void; onSaved: () => void; outlets: OutletItem[] }) {
  const [type, setType] = useState<"in" | "out">("out");
  const [category, setCategory] = useState("operasional");
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);
  const [outletId, setOutletId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "pendapatan_laundry", label: "Pendapatan Laundry" },
    { value: "gaji_karyawan", label: "Gaji Karyawan" },
    { value: "supply", label: "Supply & Bahan Baku" },
    { value: "operasional", label: "Biaya Operasional" },
    { value: "modal_owner", label: "Modal Owner (Ekuitas)" },
    { value: "prive_owner", label: "Prive Owner (Prive)" },
    { value: "deviden_owner", label: "Deviden Owner" },
    { value: "pembelian_aset", label: "Pembelian Aset" },
    { value: "cicilan_aset", label: "Cicilan Aset" },
    { value: "biaya_layanan_pg", label: "Biaya PG (MDR)" },
    { value: "lainnya", label: "Lain-lain" }
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("Jumlah transaksi harus lebih dari 0.");
      return;
    }
    setLoading(true); setError("");
    try {
      await api.post(`/v1/finance/cash-transactions`, {
        type, category, amount, payment_method: paymentMethod,
        transaction_date: transactionDate, outlet_id: outletId || null, notes
      });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal menyimpan transaksi kas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">Catat Mutasi Kas Manual</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
        
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button type="button" onClick={() => setType("out")} className={`flex-1 py-2 font-bold rounded-lg transition-all ${type === "out" ? "bg-red-500 text-white" : "text-slate-400"}`}>UANG KELUAR</button>
            <button type="button" onClick={() => setType("in")} className={`flex-1 py-2 font-bold rounded-lg transition-all ${type === "in" ? "bg-emerald-500 text-white" : "text-slate-400"}`}>UANG MASUK</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Tanggal *</label>
              <input required type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Outlet (Optional)</label>
              <select value={outletId} onChange={(e) => setOutletId(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none">
                <option value="">Pusat / Head Office</option>
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Kategori *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Metode Pembayaran *</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none">
                <option value="cash">Tunai (Cash)</option>
                <option value="bank_transfer">Transfer Bank</option>
                <option value="qris">QRIS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Jumlah Transaksi (Rp) *</label>
            <input required type="number" min={1} value={amount || ""} onChange={(e) => setAmount(+e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white text-sm font-bold rounded-xl px-3 py-2.5 outline-none" placeholder="Masukkan nominal rupiah" />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Catatan</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none resize-none" placeholder="Keterangan transaksi..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5">Batal</button>
            <button type="submit" disabled={loading} className={`flex-1 h-10 rounded-xl text-white text-sm font-bold hover:opacity-90 ${type === "out" ? "bg-red-500" : "bg-emerald-500"}`}>{loading ? "Menyimpan..." : "Simpan Transaksi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
});

// ─── Claim Settlement PG Modal ────────────────────────────────────────────────
const ClaimSettlementModal = memo(function ClaimSettlementModal({
  payment, onClose, onSaved
}: { payment: SettlementItem; onClose: () => void; onSaved: () => void }) {
  const [mdrFee, setMdrFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mdrFee < 0 || mdrFee > payment.amount) {
      setError("Biaya MDR/Layanan tidak valid.");
      return;
    }
    setLoading(true); setError("");
    try {
      await api.post(`/v1/finance/settlements/${payment.payment_id}/claim`, { mdr_fee: mdrFee });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal memproses settlement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">Settlement QRIS / Transfer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
        <form onSubmit={handleClaim} className="space-y-4">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Order</span>
              <span className="font-bold text-white">#{payment.order.order_number}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Pelanggan</span>
              <span className="font-bold text-white">{payment.order.customer_name}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Metode</span>
              <span className="font-bold text-white uppercase">{payment.payment_method}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Total Dibayar</span>
              <span className="font-black text-white text-sm">{fmt(payment.amount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Biaya MDR / Potongan PG (Rp)</label>
            <input type="number" min={0} max={payment.amount} value={mdrFee} onChange={(e) => setMdrFee(+e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-[#4DA8FF]/60 transition-colors" placeholder="0" />
            <p className="text-[10px] text-slate-400 mt-1">Uang yang akan masuk ke kas utama adalah net: <span className="font-bold text-emerald-400">{fmt(payment.amount - mdrFee)}</span></p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500">{loading ? "Memproses..." : "Konfirmasi Cair"}</button>
          </div>
        </form>
      </div>
    </div>
  );
});

// ─── Main Finance Page ────────────────────────────────────────────────────────
export default function FinancePage() {
  const [tab, setTab] = useState<"ledger" | "settlement" | "debts" | "receivables" | "profit-loss">("ledger");
  
  // Data states
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [transactions, setTransactions] = useState<CashTransactionItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [plData, setPlData] = useState<ProfitLossData | null>(null);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);

  // Ledger filter states
  const [filterOutlet, setFilterOutlet] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );

  // Financial summary states
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [totalReceivable, setTotalReceivable] = useState<number>(0);
  const [totalInFlow, setTotalInFlow] = useState<number>(0);
  const [totalOutFlow, setTotalOutFlow] = useState<number>(0);
  const [totalPendingSettlement, setTotalPendingSettlement] = useState<number>(0);

  // Modal / status states
  const [busy, setBusy] = useState(true);
  const [payModal, setPayModal] = useState<DebtItem | null>(null);
  const [addTxModal, setAddTxModal] = useState(false);
  const [claimModal, setClaimModal] = useState<SettlementItem | null>(null);
  const [message, setMessage] = useState("");

  const loadDebts = useCallback(async () => {
    try {
      const r = await api.get("/v1/purchases/debts");
      const payload = r.data?.data || r.data || r;
      setDebts(payload?.items ?? []);
      setTotalDebt(payload?.total_debt ?? 0);
    } catch {}
  }, []);

  const loadReceivables = useCallback(async () => {
    try {
      const r = await api.get("/v1/purchases/receivables");
      const payload = r.data?.data || r.data || r;
      setReceivables(payload?.items ?? []);
      setTotalReceivable(payload?.total_receivable ?? 0);
    } catch {}
  }, []);

  const loadOutlets = useCallback(async () => {
    try {
      // In typical monorepo setup we fetch user or staff settings, but let's populate directly or from v1/staff
      // Let's assume standard outlets endpoint or fall back safely.
      const r = await api.get("/v1/staff"); 
      const staffList = r.data?.data || [];
      const distinctOutlets = Array.from(new Set(staffList.map((s: any) => s.outlet_id).filter(Boolean)))
        .map(id => ({ id: id as string, name: `Outlet ${id}` })); // Basic mapping
      setOutlets(distinctOutlets);
    } catch {}
  }, []);

  const loadLedger = useCallback(async () => {
    try {
      const params = {
        outlet_id: filterOutlet || undefined,
        category: filterCategory || undefined,
        type: filterType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      };
      const r = await api.get("/v1/finance/cash-transactions", { params });
      const resData = r.data?.data || r.data || {};
      setTransactions(resData.transactions ?? []);
      setTotalInFlow(resData.summary?.total_in ?? 0);
      setTotalOutFlow(resData.summary?.total_out ?? 0);
    } catch {}
  }, [filterOutlet, filterCategory, filterType, startDate, endDate]);

  const loadSettlements = useCallback(async () => {
    try {
      const r = await api.get("/v1/finance/settlements");
      const resData = r.data?.data || r.data || {};
      setSettlements(resData.payments ?? []);
      setTotalPendingSettlement(resData.total_pending_amount ?? 0);
    } catch {}
  }, []);

  const loadProfitLoss = useCallback(async () => {
    try {
      const params = { start_date: startDate, end_date: endDate };
      const r = await api.get("/v1/reports/profit-loss", { params });
      setPlData(r.data?.data || r.data || null);
    } catch {}
  }, [startDate, endDate]);

  const deleteTransaction = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mutasi kas manual ini?")) return;
    try {
      const r = await api.delete(`/v1/finance/cash-transactions/${id}`);
      setMessage(r.data?.message ?? "Transaksi dihapus.");
      setTimeout(() => setMessage(""), 3000);
      loadLedger();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Gagal menghapus transaksi.");
    }
  };

  const exportToCSV = () => {
    const headers = ["Tanggal", "Outlet", "Tipe", "Kategori", "Jumlah", "Metode Bayar", "Catatan", "Jenis Transaksi"];
    const rows = transactions.map(t => [
      t.transaction_date,
      t.outlet?.name ?? "Pusat (Head Office)",
      t.type === "in" ? "Masuk" : "Keluar",
      t.category.toUpperCase(),
      t.amount,
      t.payment_method.toUpperCase(),
      t.notes ?? "",
      t.reference_id ? "Sistem Otomatis" : "Manual"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_arus_kas_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const init = useCallback(async () => {
    setBusy(true);
    await Promise.all([
      loadDebts(),
      loadReceivables(),
      loadOutlets(),
      loadLedger(),
      loadSettlements(),
      loadProfitLoss()
    ]);
    setBusy(false);
  }, [loadDebts, loadReceivables, loadOutlets, loadLedger, loadSettlements, loadProfitLoss]);

  useEffect(() => {
    init();
  }, [init]);

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
                <DollarSign className="h-5 w-5 text-[#4DA8FF]" /> Keuangan &amp; Kas Besar
              </h1>
              <p className="text-[10px] text-slate-400">Standardized Single-Entry Bookkeeping Ledger &amp; PG Settlements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { init(); }} className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={() => setAddTxModal(true)} className="h-9 px-4 rounded-xl bg-[#4DA8FF] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-[#4DA8FF]/90 transition-all">
              <Plus className="h-4 w-4" /> Catat Kas
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 relative z-10">
        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {message}
          </div>
        )}

        {/* Summary Card Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total Masuk (Periode)</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{fmt(totalInFlow)}</p>
              <p className="text-[9px] text-slate-400/80 mt-1">Semua penerimaan kas &amp; POS</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><TrendingUp className="h-5 w-5" /></div>
          </div>

          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total Keluar (Periode)</p>
              <p className="text-xl font-black text-red-400 mt-1">{fmt(totalOutFlow)}</p>
              <p className="text-[9px] text-slate-400/80 mt-1">Beban, suplai, aset, gaji</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400"><TrendingDown className="h-5 w-5" /></div>
          </div>

          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Pending PG Settlement</p>
              <p className="text-xl font-black text-yellow-400 mt-1">{fmt(totalPendingSettlement)}</p>
              <p className="text-[9px] text-slate-400/80 mt-1">{settlements.length} transaksi non-tunai</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400"><CreditCard className="h-5 w-5" /></div>
          </div>

          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Saldo Bersih (KasFlow)</p>
              <p className={`text-xl font-black mt-1 ${totalInFlow - totalOutFlow >= 0 ? "text-[#4DA8FF]" : "text-red-400"}`}>{fmt(totalInFlow - totalOutFlow)}</p>
              <p className="text-[9px] text-slate-400/80 mt-1">Realisasi mutasi bersih</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#4DA8FF]/10 flex items-center justify-center text-[#4DA8FF]"><Calculator className="h-5 w-5" /></div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/10 gap-6 overflow-x-auto scrollbar-hide pb-0.5">
          {[
            { id: "ledger", label: "Arus Kas Utama", count: transactions.length, activeColor: "text-[#4DA8FF]", barColor: "bg-[#4DA8FF]" },
            { id: "settlement", label: "Settlement PG", count: settlements.length, activeColor: "text-yellow-400", barColor: "bg-yellow-400" },
            { id: "profit-loss", label: "Laporan Laba Rugi", count: null, activeColor: "text-emerald-400", barColor: "bg-emerald-400" },
            { id: "debts", label: "Hutang Supplier", count: debts.length, activeColor: "text-red-400", barColor: "bg-red-400" },
            { id: "receivables", label: "Piutang Pelanggan", count: receivables.length, activeColor: "text-teal-400", barColor: "bg-teal-400" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`pb-3 font-bold text-xs relative transition-all whitespace-nowrap ${tab === t.id ? t.activeColor : "text-slate-400 hover:text-white"}`}
            >
              {t.label}
              {t.count !== null && <span className="ml-1 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">{t.count}</span>}
              {tab === t.id && (
                <motion.div layoutId="financeTabUnderline" className={`absolute bottom-0 left-0 right-0 h-0.5 ${t.barColor}`} />
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
            {/* LEDGER TAB */}
            {tab === "ledger" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Mulai Tanggal</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Sampai Tanggal</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Tipe Mutasi</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none">
                      <option value="">Semua Tipe</option>
                      <option value="in">Uang Masuk</option>
                      <option value="out">Uang Keluar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Kategori</label>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 outline-none">
                      <option value="">Semua Kategori</option>
                      <option value="pendapatan_laundry">Pendapatan Laundry</option>
                      <option value="gaji_karyawan">Gaji Karyawan</option>
                      <option value="supply">Supply & Bahan Baku</option>
                      <option value="operasional">Biaya Operasional</option>
                      <option value="modal_owner">Modal Owner</option>
                      <option value="prive_owner">Prive Owner</option>
                      <option value="deviden_owner">Deviden</option>
                      <option value="pembelian_aset">Pembelian Aset</option>
                      <option value="cicilan_aset">Cicilan Aset</option>
                      <option value="biaya_layanan_pg">PG MDR Fees</option>
                      <option value="lainnya">Lain-lain</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-end">
                    <button onClick={exportToCSV} className="w-full h-9 bg-slate-800 border border-white/10 hover:bg-slate-800/80 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all">
                      <Download className="h-4 w-4" /> Ekspor CSV
                    </button>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        {["Tanggal", "Outlet", "Tipe", "Kategori", "Jumlah", "Metode", "Catatan", "Aksi"].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-bold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-white/5 transition-all">
                          <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{t.transaction_date}</td>
                          <td className="px-4 py-3.5 text-slate-300 font-medium whitespace-nowrap">{t.outlet?.name ?? "Pusat (HQ)"}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${t.type === "in" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                              {t.type === "in" ? "Masuk" : "Keluar"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-bold uppercase text-[10px] text-slate-300 whitespace-nowrap">{t.category.replace("_", " ")}</td>
                          <td className={`px-4 py-3.5 font-black text-sm whitespace-nowrap ${t.type === "in" ? "text-emerald-400" : "text-red-400"}`}>
                            {t.type === "in" ? "+" : "-"}{fmt(t.amount)}
                          </td>
                          <td className="px-4 py-3.5 uppercase text-slate-400 whitespace-nowrap">{t.payment_method}</td>
                          <td className="px-4 py-3.5 text-slate-300 max-w-xs truncate">{t.notes ?? "-"}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {t.reference_id ? (
                              <span className="text-[10px] text-slate-500 italic">Sistem</span>
                            ) : (
                              <button onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-500">
                            Tidak ada data mutasi kas yang ditemukan untuk periode dan filter ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SETTLEMENT TAB */}
            {tab === "settlement" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      {["Tanggal", "No Order", "Pelanggan", "Outlet", "Metode", "Referensi PG", "Jumlah Kotor", "Aksi"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-bold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {settlements.map(item => (
                      <tr key={item.payment_id} className="hover:bg-white/5 transition-all">
                        <td className="px-4 py-3.5 text-slate-400">{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                        <td className="px-4 py-3.5 font-bold text-white">#{item.order.order_number}</td>
                        <td className="px-4 py-3.5 font-medium text-white">{item.order.customer_name}</td>
                        <td className="px-4 py-3.5 text-slate-300">{item.order.outlet_name ?? "HQ"}</td>
                        <td className="px-4 py-3.5 uppercase text-slate-300 font-bold">{item.payment_method}</td>
                        <td className="px-4 py-3.5 text-slate-400 italic">{item.transaction_reference ?? "-"}</td>
                        <td className="px-4 py-3.5 font-black text-white">{fmt(item.amount)}</td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setClaimModal(item)}
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                          >
                            Cairkan Kas
                          </button>
                        </td>
                      </tr>
                    ))}
                    {settlements.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400 opacity-60 mt-3" />
                            <p>Hebat! Seluruh dana pembayaran non-tunai sudah cair ke kas utama.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* PROFIT & LOSS TAB */}
            {tab === "profit-loss" && plData && (
              <div className="max-w-3xl mx-auto bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="border-b border-white/5 pb-4 text-center">
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">Laporan Laba Rugi Operasional</h2>
                  <p className="text-slate-400 text-xs mt-1">Periode: {new Date(plData.start_date).toLocaleDateString("id-ID")} - {new Date(plData.end_date).toLocaleDateString("id-ID")}</p>
                  <p className="text-[10px] text-slate-500 italic mt-0.5">Skala Waktu: {plData.days_count} Hari Kerja</p>
                </div>

                {/* 1. Pendapatan */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold border-b border-white/10 pb-2">
                    <span className="text-[#4DA8FF] uppercase tracking-wide">I. Pendapatan Operasional</span>
                    <span className="text-white">{fmt(plData.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center pl-4 text-xs text-slate-400">
                    <span>Pendapatan Jasa Laundry</span>
                    <span>{fmt(plData.revenue)}</span>
                  </div>
                </div>

                {/* 2. Beban */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-sm font-bold border-b border-white/10 pb-2">
                    <span className="text-red-400 uppercase tracking-wide">II. Beban Operasional</span>
                    <span className="text-white">{fmt(plData.expenses.total_operational_expenses)}</span>
                  </div>
                  <div className="space-y-2 pl-4 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Beban Gaji Karyawan (Payroll)</span>
                      <span>{fmt(plData.expenses.payroll)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Pembelian Supply &amp; Bahan Baku</span>
                      <span>{fmt(plData.expenses.supplies)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Operasional Kantor &amp; Utilitas</span>
                      <span>{fmt(plData.expenses.operational)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban PG Settlement MDR Fees</span>
                      <span>{fmt(plData.expenses.pg_fees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Penyusutan Aset (Depresiasi) *</span>
                      <span className="underline decoration-dotted decoration-white/30" title="Dihitung secara proporsional berdasarkan log depresiasi tahunan/cycle">{fmt(plData.expenses.depreciation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Lainnya</span>
                      <span>{fmt(plData.expenses.others)}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Laba Bersih */}
                <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center text-base font-black border border-white/10 mt-6">
                  <span className="uppercase tracking-wider">Laba Bersih Operasional</span>
                  <span className={plData.net_profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {fmt(plData.net_profit)}
                  </span>
                </div>

                {/* 4. Rekonsiliasi Non-Operasional */}
                <div className="space-y-3 pt-4 border-t border-white/5 text-xs">
                  <h3 className="font-bold text-slate-300 uppercase text-[10px] tracking-widest">III. Arus Kas Non-Operasional (Ekuitas/Aset)</h3>
                  <div className="grid grid-cols-2 gap-4 text-slate-400">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">Setoran Modal Owner</span>
                      <span className="font-bold text-emerald-400 text-sm">{fmt(plData.non_operating_cashflow.capital_injection)}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">Penarikan Prive Owner</span>
                      <span className="font-bold text-red-400 text-sm">{fmt(plData.non_operating_cashflow.prive_withdrawal)}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">Pembagian Deviden</span>
                      <span className="font-bold text-red-400 text-sm">{fmt(plData.non_operating_cashflow.dividend_withdrawal)}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">Belanja Modal / Pembelian Aset</span>
                      <span className="font-bold text-slate-300 text-sm">{fmt(plData.non_operating_cashflow.asset_capital_expenditure)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 italic text-center pt-2">
                  * Note: Sesuai SAK, belanja modal / cicilan pembelian aset dicatat sebagai pengeluaran kas namun tidak mengurangi laba operasional secara langsung, melainkan diamortisasi secara berkala lewat beban depresiasi.
                </div>
              </div>
            )}

            {/* DEBTS TAB */}
            {tab === "debts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {debts.map(item => {
                  const daysLeft = item.due_date ? Math.ceil((new Date(item.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
                  return (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-sm text-white">{item.supplier_name}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Invoice: {item.invoice_number ?? "-"}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.payment_status === "partial" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                            {item.payment_status === "partial" ? "Sebagian" : "Belum Bayar"}
                          </span>
                        </div>

                        <div className="space-y-2 mt-4 text-xs text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tgl Pembelian:</span>
                            <span className="font-medium text-white">{item.purchase_date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Jatuh Tempo:</span>
                            <span className="font-medium text-white">{item.due_date ?? "-"}</span>
                          </div>
                          {daysLeft !== null && (
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-500">Sisa Hari:</span>
                              <span className={`font-bold ${daysLeft < 3 ? "text-red-400" : "text-yellow-400"}`}>{daysLeft <= 0 ? "Lewat Jatuh Tempo!" : `${daysLeft} Hari Lagi`}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Sisa Hutang</p>
                          <p className="text-sm font-black text-red-400">{fmt(item.remaining_debt)}</p>
                        </div>
                        <button
                          onClick={() => setPayModal(item)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all"
                        >
                          Bayar
                        </button>
                      </div>
                    </div>
                  );
                })}
                {debts.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 opacity-60" />
                    <p>Hebat! Tidak ada hutang supplier yang outstanding.</p>
                  </div>
                )}
              </div>
            )}

            {/* RECEIVABLES TAB */}
            {tab === "receivables" && (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      {["Tanggal","No Order","Pelanggan","Total Order","Sisa Piutang","Status Bayar"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {receivables.map(item => (
                      <tr key={item.id} className="hover:bg-white/5 transition-all">
                        <td className="px-4 py-3.5 text-slate-400">{item.order_date}</td>
                        <td className="px-4 py-3.5 font-bold text-white">#{item.order_number}</td>
                        <td className="px-4 py-3.5 font-medium text-white">{item.customer_name}</td>
                        <td className="px-4 py-3.5 text-slate-300">{fmt(item.total_amount)}</td>
                        <td className="px-4 py-3.5 font-black text-emerald-400">{fmt(item.remaining_receivable)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.payment_status === "partial" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                            {item.payment_status === "partial" ? "DP/Sebagian" : "Belum Bayar"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {receivables.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400 opacity-60 mt-3" />
                          <p>Semua penjualan dari pelanggan sudah dibayar lunas.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PAY DEBT MODAL */}
      {payModal && (
        <PayDebtModal
          item={payModal}
          onClose={() => setPayModal(null)}
          onSaved={() => { setPayModal(null); loadDebts(); loadLedger(); loadProfitLoss(); }}
        />
      )}

      {/* ADD MANUAL TRANSACTION MODAL */}
      {addTxModal && (
        <AddTransactionModal
          outlets={outlets}
          onClose={() => setAddTxModal(false)}
          onSaved={() => { setAddTxModal(false); loadLedger(); loadProfitLoss(); }}
        />
      )}

      {/* CLAIM SETTLEMENT MODAL */}
      {claimModal && (
        <ClaimSettlementModal
          payment={claimModal}
          onClose={() => setClaimModal(null)}
          onSaved={() => { setClaimModal(null); loadSettlements(); loadLedger(); loadProfitLoss(); }}
        />
      )}
    </div>
  );
}
