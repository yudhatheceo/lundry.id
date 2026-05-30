"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Shirt, 
  Timer, 
  Zap, 
  QrCode, 
  BarChart2,
  LineChart, 
  Users, 
  Settings, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  UserCheck,
  LogOut,
  ClipboardList,
  Package,
  Wallet,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/useAuthStore";
import api from "@/lib/api";

export default function AppDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [statsData, setStatsData] = React.useState({
    omzet: "Rp 1.420.000",
    omzetChange: "+12.3%",
    cucian: "24 Bag",
    cucianChange: "6 Express",
    mesin: "8 / 10 unit",
    mesinChange: "80% Kapasitas",
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get("/v1/reports/dashboard");
        if (res.data) {
          const payload = res.data.data || res.data;
          setStatsData({
            omzet: `Rp ${payload.omzet?.toLocaleString("id-ID") || 0}`,
            omzetChange: payload.omzet_change || "0%",
            cucian: `${payload.active_bags || 0} Bag`,
            cucianChange: `${payload.express_bags || 0} Express`,
            mesin: `${payload.active_machines || 0} / ${payload.total_machines || 0} unit`,
            mesinChange: `${payload.machine_capacity_percent || 0}% Kapasitas`,
          });
        }
      } catch {
        // Fallback to default mock if API fails/not ready
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  const stats = [
    { label: "Omzet Hari Ini", value: statsData.omzet, change: statsData.omzetChange, icon: <TrendingUp className="h-5 w-5 text-emerald-500" /> },
    { label: "Cucian Diproses", value: statsData.cucian, change: statsData.cucianChange, icon: <Shirt className="h-5 w-5 text-[#4DA8FF]" /> },
    { label: "Mesin Cuci Aktif", value: statsData.mesin, change: statsData.mesinChange, icon: <Timer className="h-5 w-5 text-yellow-500" /> },
  ];

    const quickActions = [
    { name: "POS Kasir Utama", desc: "Input order kiloan & satuan kilat", shortcut: "F1", icon: <Zap className="h-6 w-6" />, color: "bg-secondary text-white", link: "/app/kasir", roles: ["owner", "manager", "cashier"] },
    { name: "Scan QR Bag", desc: "Pindah status cucian kurir/staf", shortcut: "F2", icon: <QrCode className="h-6 w-6" />, color: "bg-primary text-white", link: "/app/scan", roles: ["owner", "manager", "cashier", "courier", "employee", "staff"] },
    { name: "Daftar Order", desc: "Lihat & kelola semua order masuk", shortcut: "F3", icon: <ClipboardList className="h-6 w-6" />, color: "bg-purple-600 text-white", link: "/app/orders", roles: ["owner", "manager", "cashier"] },
    { name: "Pelanggan", desc: "Manajemen data pelanggan & deposit", shortcut: "F4", icon: <Users className="h-6 w-6" />, color: "bg-emerald-500 text-white", link: "/app/customers", roles: ["owner", "manager", "cashier"] },
    { name: "Laporan & Analitik", desc: "Revenue, transaksi, dan chart performa bisnis", shortcut: "F5", icon: <BarChart2 className="h-6 w-6" />, color: "bg-orange-500 text-white", link: "/app/reports", roles: ["owner", "manager"] },
    { name: "Absensi (Clock In/Out)", desc: "Catat waktu mulai dan selesai shift", shortcut: "F6", icon: <Timer className="h-6 w-6" />, color: "bg-teal-500 text-white", link: "/app/attendance", roles: ["owner", "manager", "cashier", "courier", "staff", "driver"] },
  ].filter(action => !user || action.roles.includes(user.role as string));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 lg:p-12 relative overflow-hidden font-sans">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4DA8FF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8 md:space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 md:pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#4DA8FF] text-[10px] font-black uppercase tracking-widest mb-4">
              <div className="relative h-4 w-4">
                <Image src="/logo-small.png" alt="LUNDRY.id" fill className="object-contain" />
              </div>
              LUNDRY.id POS & ERP Gateway
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-black tracking-tight leading-none">
              Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4DA8FF] to-cyan-400">Kasir & Staf</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2">
              Outlet Jember (Pusat) · Selamat bertugas{user ? `, ${user.name}` : ""}!
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-[#4DA8FF]/20 flex items-center justify-center text-[#4DA8FF]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Operator Aktif</p>
                <p className="text-sm font-bold">{user?.name || "Guest"} <span className="text-[10px] text-slate-500 uppercase">({user?.role || "-"})</span></p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all shrink-0"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl transition-all group-hover:scale-125" />
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tight">{stat.value}</p>
                    <span className="inline-block text-[10px] font-black bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300">
                      {stat.change}
                    </span>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions / Core Modules */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-300">Modul Kerja Utama (Fase 3)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, idx) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="h-full"
              >
                <Link href={action.link} className="h-full block">
                  <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden backdrop-blur-md hover:border-[#4DA8FF]/30 hover:bg-white/10 transition-all duration-500 h-full flex flex-col group cursor-pointer">
                    <CardContent className="p-6 md:p-8 flex flex-col flex-grow">
                      <div className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${action.color} group-hover:scale-110 transition-transform duration-500`}>
                        {action.icon}
                      </div>
                      <h3 className="text-lg md:text-xl font-black mb-2 group-hover:text-[#4DA8FF] transition-colors">{action.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-8 flex-grow">{action.desc}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                        <span className="px-2 py-1 bg-white/10 border border-white/10 text-[10px] md:text-xs font-black rounded-lg uppercase tracking-wider">
                          Key: {action.shortcut}
                        </span>
                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-slate-400 group-hover:text-[#4DA8FF] group-hover:translate-x-2 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Admin & Settings Section */}
        {(user?.role === "owner" || user?.role === "manager") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 pt-6"
          >
            <h2 className="text-xl font-bold text-slate-300">Pengaturan & Admin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Link href="/app/staff" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">Manajemen Staf</h3>
                      <p className="text-xs text-slate-400">Atur hak akses kasir, kurir & manager</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
              <Link href="/app/services" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#4DA8FF]/10 text-[#4DA8FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-[#4DA8FF] transition-colors">Manajemen Layanan</h3>
                      <p className="text-xs text-slate-400">Atur layanan, harga, dan kategori</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-[#4DA8FF] group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
              <Link href="/app/assets" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors">Aset & Depresiasi</h3>
                      <p className="text-xs text-slate-400">Inventarisir aset + kalkulasi penyusutan</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
              <Link href="/app/payroll" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">Payroll Karyawan</h3>
                      <p className="text-xs text-slate-400">Penggajian bulanan + slip gaji digital</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
              <Link href="/app/deductions" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-rose-400 transition-colors">Kasbon & Denda</h3>
                      <p className="text-xs text-slate-400">Kelola pinjaman dan penalti karyawan</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
              <Link href="/app/commissions" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Komisi & Bonus</h3>
                      <p className="text-xs text-slate-400">Atur insentif penjualan kasir & marketing</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
              <Link href="/app/logistics" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#4DA8FF]/10 text-[#4DA8FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-[#4DA8FF] transition-colors">Logistik &amp; Stok</h3>
                      <p className="text-xs text-slate-400">Kelola stok bahan baku, supplier, &amp; pembelian</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-[#4DA8FF] group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
              <Link href="/app/finance" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">Keuangan &amp; Buku Pembantu</h3>
                      <p className="text-xs text-slate-400">Buku pembantu hutang supplier &amp; piutang pelanggan</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
              <Link href="/app/machines" className="block">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Timer className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-yellow-400 transition-colors">Manajemen Mesin (IoT Ready)</h3>
                      <p className="text-xs text-slate-400">Pencatatan siklus harian &amp; jadwal perawatan</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-yellow-400 group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Technical Notice Banner */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-bold text-sm text-[#4DA8FF] uppercase tracking-wider mb-1">Status Integrasi API Gateway</h4>
            <p className="text-xs text-slate-400">
              API Client terhubung ke <code className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">http://127.0.0.1:8000/api</code> via Axios Interceptor.
            </p>
          </div>
          <Button onClick={() => router.push('/app/settings')} variant="outline" className="rounded-full border-white/10 hover:bg-white/10 text-white font-bold text-xs">
            Buka Integrasi API →
          </Button>
        </div>
      </div>
    </div>
  );
}
