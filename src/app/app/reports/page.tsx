"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart2, TrendingUp, ShoppingBag, Users, UserCheck,
  ArrowLeft, RefreshCw, Download, Calendar, ChevronDown,
  Activity, AlertTriangle, Gauge
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import api from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
type Period = "daily" | "weekly" | "monthly";
type TabId  = "ringkasan" | "produksi" | "transaksi" | "penjualan" | "pelanggan" | "karyawan";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "ringkasan",  label: "Ringkasan",         icon: <BarChart2 className="h-4 w-4" /> },
  { id: "produksi",   label: "Produksi",          icon: <Activity className="h-4 w-4" /> },
  { id: "transaksi",  label: "Transaksi",          icon: <TrendingUp className="h-4 w-4" /> },
  { id: "penjualan",  label: "Penjualan",          icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "pelanggan",  label: "Pelanggan",          icon: <Users className="h-4 w-4" /> },
  { id: "karyawan",   label: "Karyawan",           icon: <UserCheck className="h-4 w-4" /> },
];

const STATUS_COLORS: Record<string, string> = {
  received: "#4DA8FF", processing: "#a78bfa", ready: "#34d399",
  delivered: "#10b981", voided: "#f87171", paid: "#34d399",
};

const PIE_COLORS = ["#4DA8FF", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#fb923c"];

function fmt(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ─── Period Selector ──────────────────────────────────────────────────────────
function PeriodSelector({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
      {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            period === p ? "bg-[#4DA8FF] text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          {p === "daily" ? "Harian" : p === "weekly" ? "Mingguan" : "Bulanan"}
        </button>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Tab: Ringkasan ───────────────────────────────────────────────────────────
function TabRingkasan({ period }: { period: Period }) {
  const [fin,  setFin]  = useState<any>(null);
  const [svc,  setSvc]  = useState<any>(null);
  const [stat, setStat] = useState<any>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    Promise.all([
      api.get(`/v1/reports/financial?period=${period}`),
      api.get(`/v1/reports/sales-by-service?period=${period}`),
      api.get(`/v1/reports/orders-by-status?period=${period}`),
    ]).then(([f, s, st]) => {
      setFin(f.data?.data || f.data || f);
      setSvc(s.data?.data || s.data || s);
      setStat(st.data?.data || st.data || st);
    }).catch(() => {}).finally(() => setBusy(false));
  }, [period]);

  if (busy) return <Spinner />;

  const chartData  = fin?.chart_data  ?? [];
  const svcItems   = svc?.items       ?? [];
  const statItems  = stat?.items      ?? [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"   value={fmt(fin?.total_revenue ?? 0)} />
        <StatCard label="Jumlah Order"    value={`${fin?.total_orders ?? 0} order`} />
        <StatCard label="Rata-rata Order" value={fmt(fin?.average_order ?? 0)} />
        <StatCard label="Total Transaksi" value={`${stat?.total ?? 0} order`} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-sm text-slate-300 mb-4">Trend Revenue</h3>
        {chartData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4DA8FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4DA8FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #ffffff20", borderRadius: 8 }}
                formatter={(v: any) => [fmt(v as number), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4DA8FF" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Service Volume + Order Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-sm text-slate-300 mb-4">Volume per Layanan</h3>
          {svcItems.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={svcItems.slice(0, 7)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="service_name" width={120} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #ffffff20", borderRadius: 8 }} formatter={(v: any) => [fmt(v as number), "Revenue"]} />
                <Bar dataKey="total_revenue" fill="#4DA8FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-sm text-slate-300 mb-4">Distribusi Status Order</h3>
          {statItems.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statItems} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={(props: any) => `${props.status ?? props.name} ${props.percentage ?? 0}%`} labelLine={false}>
                  {statItems.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #ffffff20", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Payment Mix */}
      {(fin?.payment_mix?.length ?? 0) > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-sm text-slate-300 mb-4">Metode Pembayaran</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fin.payment_mix.map((pm: any, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 capitalize">{pm.method}</p>
                <p className="font-bold text-white mt-1">{fmt(pm.total)}</p>
                <p className="text-[10px] text-slate-500">{pm.count} transaksi</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Transaksi ───────────────────────────────────────────────────────────
function TabTransaksi({ period }: { period: Period }) {
  const [data,   setData]   = useState<any>(null);
  const [busy,   setBusy]   = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setBusy(true);
    api.get(`/v1/reports/transactions?period=${period}`)
      .then((r) => setData(r.data?.data || r.data || r))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [period]);

  const rows: any[] = data?.transactions ?? [];
  const filtered = filter === "all" ? rows : rows.filter((r) => r.payment_status === filter);

  const exportCSV = () => {
    const header = "No Order,Tanggal,Pelanggan,Status,Bayar,Metode,Total\n";
    const body = filtered.map((r) =>
      `${r.order_number},${r.created_at.slice(0,10)},${r.customer_name},${r.status},${r.payment_status},${r.payment_method},${r.final_amount}`
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `transaksi-${period}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="paid">Lunas</option>
            <option value="unpaid">Belum Bayar</option>
            <option value="partial">Sebagian</option>
          </select>
          <span className="text-xs text-slate-400">{filtered.length} data</span>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {busy ? <Spinner /> : filtered.length === 0 ? <Empty /> : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-xs">
            <thead className="bg-white/5">
              <tr>
                {["No Order","Tanggal","Pelanggan","Status","Metode","Diskon","Total"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((r: any) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-[#4DA8FF] font-bold">{r.order_number}</td>
                  <td className="px-4 py-3 text-slate-300">{r.created_at.slice(0,10)}</td>
                  <td className="px-4 py-3 text-white">{r.customer_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: (STATUS_COLORS[r.status] || "#666") + "22", color: STATUS_COLORS[r.status] || "#fff" }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 capitalize">{r.payment_method}</td>
                  <td className="px-4 py-3 text-red-400">{r.discount_amount > 0 ? `-${fmt(r.discount_amount)}` : "-"}</td>
                  <td className="px-4 py-3 font-bold text-white">{fmt(r.final_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Penjualan ───────────────────────────────────────────────────────────
function TabPenjualan({ period }: { period: Period }) {
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    api.get(`/v1/reports/sales-by-service?period=${period}`)
      .then((r) => setData(r.data?.data || r.data || r))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [period]);

  const items: any[] = data?.items ?? [];

  return (
    <div className="space-y-4">
      <StatCard label="Total Revenue Periode" value={fmt(data?.grand_total ?? 0)} sub={`${items.length} layanan aktif`} />
      {busy ? <Spinner /> : items.length === 0 ? <Empty /> : (
        <>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-slate-300 mb-4">Revenue per Layanan</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={items}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="service_name" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #ffffff20", borderRadius: 8 }} formatter={(v: any) => [fmt(v as number), "Revenue"]} />
                <Bar dataKey="total_revenue" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-xs">
              <thead className="bg-white/5">
                <tr>
                  {["Layanan","Qty Terjual","Revenue","% dari Total","Jumlah Order"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-white font-medium">{s.service_name}</td>
                    <td className="px-4 py-3 text-slate-300">{s.total_qty} kg</td>
                    <td className="px-4 py-3 font-bold text-white">{fmt(s.total_revenue)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#a78bfa] rounded-full" style={{ width: `${s.percentage}%` }} />
                        </div>
                        <span className="text-slate-300 w-10 text-right">{s.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{s.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab: Pelanggan ───────────────────────────────────────────────────────────
function TabPelanggan({ period }: { period: Period }) {
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    api.get(`/v1/reports/customers?period=${period}`)
      .then((r) => setData(r.data?.data || r.data || r))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [period]);

  const top:  any[] = data?.top_customers  ?? [];
  const tier: any[] = data?.tier_breakdown ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Pelanggan" value={`${data?.total_customers ?? 0}`} />
        <StatCard label="Pelanggan Baru"  value={`+${data?.new_customers ?? 0}`} sub="Periode ini" />
      </div>

      {tier.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tier.map((t: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest capitalize">{t.tier}</p>
              <p className="text-2xl font-black text-white mt-1">{t.count}</p>
            </div>
          ))}
        </div>
      )}

      {busy ? <Spinner /> : top.length === 0 ? <Empty /> : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-xs">
            <thead className="bg-white/5">
              <tr>
                {["#","Nama","No. HP","Tier","Order","Total Belanja"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {top.map((c: any, i: number) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-500 font-bold">{i+1}</td>
                  <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-slate-400">{c.phone}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-[10px] font-bold capitalize">{c.tier}</span></td>
                  <td className="px-4 py-3 text-slate-300">{c.order_count}x</td>
                  <td className="px-4 py-3 font-bold text-[#4DA8FF]">{fmt(c.total_spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Karyawan ────────────────────────────────────────────────────────────
function TabKaryawan({ period }: { period: Period }) {
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    api.get(`/v1/reports/staff-performance?period=${period}`)
      .then((r) => setData(r.data?.data || r.data || r))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [period]);

  const staff: any[] = data?.staff ?? [];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <h3 className="font-bold text-sm text-emerald-400 mb-2 flex items-center gap-2">
          <Activity className="h-4 w-4" /> Leaderboard Kinerja (Sistem Poin Terbobot)
        </h3>
        <p className="text-xs text-slate-400">Poin dihitung otomatis dari scan barcode tas (Tracking Order). Bobot poin bergantung pada tahap produksi (Setrika x3, Cuci x1.5, Packing x2) dikali beban kerja (kg).</p>
      </div>

      {busy ? <Spinner /> : staff.length === 0 ? <Empty /> : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-xs">
            <thead className="bg-white/5">
              <tr>
                {["Peringkat", "Karyawan", "Role / Status", "Poin Masuk", "Penalti (Error)", "Poin Bersih"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staff.map((s: any, idx: number) => (
                <tr key={s.id} className="hover:bg-white/5">
                  <td className="px-4 py-4 text-center w-16">
                    {idx === 0 ? <span className="text-amber-400 text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">🥇</span> : 
                     idx === 1 ? <span className="text-slate-300 text-lg">🥈</span> : 
                     idx === 2 ? <span className="text-amber-700 text-lg">🥉</span> : 
                     <span className="text-slate-500 font-bold text-sm">{idx + 1}</span>}
                  </td>
                  <td className="px-4 py-3 text-white font-bold text-sm">{s.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-[#4DA8FF]/10 text-[#4DA8FF] rounded-full text-[9px] font-bold capitalize">{s.role}</span>
                      {s.employee_type && <span className="px-2 py-0.5 bg-slate-500/10 text-slate-300 border border-slate-500/20 rounded-full text-[9px] uppercase">{s.employee_type.replace('_',' ')}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-mono font-bold">+{s.total_points}</td>
                  <td className="px-4 py-3 text-red-400 font-mono font-bold">{s.total_penalties > 0 ? `-${s.total_penalties}` : "0"}</td>
                  <td className="px-4 py-3 font-black text-[#4DA8FF] text-base">{s.net_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TabProduksi() {
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    api.get("/v1/reports/production-dashboard")
      .then((r) => setData(r.data?.data || r.data || r))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <Spinner />;
  if (!data) return <Empty />;

  const inbound = data.inbound ?? { kg: 0, pcs: 0, orders: 0, bags: 0 };
  const outbound = data.outbound ?? { kg: 0, pcs: 0, orders: 0, bags: 0 };
  const pipeline = data.pipeline ?? [];
  const bottleneck = data.bottleneck ?? { status: "received", kg: 0, load_min: 0, load_max: 0 };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      received: "Penerimaan / Antrean",
      sorting: "Penyortiran",
      washing: "Pencucian (Washing)",
      drying: "Pengeringan (Drying)",
      ironing: "Penyetrikaan (Ironing)",
      packing: "Pengemasan (Packing)",
      ready_for_pickup: "Siap Diambil/Kirim",
    };
    return labels[status] ?? status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      received: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
      sorting: "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
      washing: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400",
      drying: "from-pink-500/20 to-pink-600/5 border-pink-500/30 text-pink-400",
      ironing: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
      packing: "from-teal-500/20 to-teal-600/5 border-teal-500/30 text-teal-400",
      ready_for_pickup: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
    };
    return colors[status] ?? "from-slate-500/20 to-slate-600/5 border-slate-500/30 text-slate-400";
  };

  return (
    <div className="space-y-6">
      {/* Bottleneck Alert banner */}
      {bottleneck.kg > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-300">Bottleneck Terdeteksi di Tahap: <span className="uppercase font-extrabold">{getStatusLabel(bottleneck.status)}</span></h4>
              <p className="text-xs text-slate-400">Terdapat tumpukan volume sebesar <strong className="text-white">{bottleneck.kg} kg</strong>. Membutuhkan estimasi <strong className="text-white">{bottleneck.load_min}-{bottleneck.load_max} load mesin</strong>.</p>
            </div>
          </div>
          <div className="text-xs px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg font-bold border border-amber-500/30 self-start md:self-auto">
            Prioritas Briefing Staff
          </div>
        </div>
      )}

      {/* Inbound vs Outbound grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inbound Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
          <h3 className="font-bold text-sm text-blue-400 flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4" /> Aliran Masuk Hari Ini (Inbound)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Berat</p>
              <p className="text-2xl font-black text-white">{inbound.kg} kg</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Pcs</p>
              <p className="text-2xl font-black text-white">{inbound.pcs} pcs</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Transaksi Order</p>
              <p className="text-lg font-bold text-slate-300">{inbound.orders} order</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Jumlah Kantong (Bags)</p>
              <p className="text-lg font-bold text-slate-300">{inbound.bags} bag</p>
            </div>
          </div>
        </div>

        {/* Outbound Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2 mb-4">
            <Gauge className="h-4 w-4" /> Aliran Selesai Hari Ini (Outbound)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Berat Selesai</p>
              <p className="text-2xl font-black text-white">{outbound.kg} kg</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Pcs Validated</p>
              <p className="text-2xl font-black text-white">{outbound.pcs} pcs</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Order Selesai</p>
              <p className="text-lg font-bold text-slate-300">{outbound.orders} order</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Kantong Keluar</p>
              <p className="text-lg font-bold text-slate-300">{outbound.bags} bag</p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Pipeline Stages */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-sm text-slate-300 mb-6">Pipeline Tahap Produksi & Estimasi Load Mesin</h3>
        <div className="space-y-4">
          {pipeline.map((stage: any) => {
            const isBottleneck = stage.status === bottleneck.status && bottleneck.kg > 0;
            return (
              <div
                key={stage.status}
                className={`p-4 rounded-xl border bg-gradient-to-r ${getStatusColor(stage.status)} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:scale-[1.01]`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm uppercase tracking-wider text-white">
                      {getStatusLabel(stage.status)}
                    </span>
                    {isBottleneck && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-black border border-red-500/30 uppercase animate-pulse">
                        Bottleneck
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-300">
                    <div>Berat: <strong className="text-white">{stage.kg} kg</strong></div>
                    <div>Jumlah: <strong className="text-white">{stage.pcs} pcs</strong></div>
                    <div>Kantong: <strong className="text-white">{stage.bags} bag</strong></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
                  {stage.bags > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
                      {stage.load_min > 0 && (
                        <div>
                          <span>Est. Load Mesin: </span>
                          <strong className="text-white font-bold">{stage.load_min} - {stage.load_max} load</strong>
                          <span className="text-[10px] text-slate-400 block sm:inline sm:ml-1">(asumsi 5-8 kg)</span>
                        </div>
                      )}
                      
                      {stage.underload_loads > 0 && (
                        <div className="text-rose-400 font-bold">
                          ⚠️ {stage.underload_loads} Bag Underload (&lt;4kg)
                        </div>
                      )}
                      {stage.tolerance_loads > 0 && (
                        <div className="text-amber-400 font-bold">
                          ⚠️ {stage.tolerance_loads} Bag Berat Toleransi (8-9kg)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 border-2 border-[#4DA8FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <BarChart2 className="h-8 w-8 mb-3 opacity-30" />
      <p className="text-sm">Belum ada data untuk periode ini</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("ringkasan");
  const [period,    setPeriod]    = useState<Period>("daily");

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl -z-0" />

      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-[#4DA8FF]" /> Laporan & Analitik
              </h1>
              <p className="text-[10px] text-slate-400">Owner / Manager Dashboard — ERP Fase 4</p>
            </div>
          </div>
          <PeriodSelector period={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#4DA8FF] text-white shadow-lg shadow-[#4DA8FF]/20"
                  : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab + period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "ringkasan"  && <TabRingkasan  period={period} />}
          {activeTab === "produksi"   && <TabProduksi />}
          {activeTab === "transaksi"  && <TabTransaksi  period={period} />}
          {activeTab === "penjualan"  && <TabPenjualan  period={period} />}
          {activeTab === "pelanggan"  && <TabPelanggan  period={period} />}
          {activeTab === "karyawan"   && <TabKaryawan   period={period} />}
        </motion.div>
      </div>
    </div>
  );
}
