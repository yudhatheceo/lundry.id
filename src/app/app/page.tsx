"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Shirt, 
  Timer, 
  Zap, 
  QrCode, 
  LineChart, 
  Users, 
  Settings, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AppDashboard() {
  const stats = [
    { label: "Omzet Hari Ini", value: "Rp 1.420.000", change: "+12.3%", icon: <TrendingUp className="h-5 w-5 text-emerald-500" /> },
    { label: "Cucian Diproses", value: "24 Bag", change: "6 Express", icon: <Shirt className="h-5 w-5 text-[#4DA8FF]" /> },
    { label: "Mesin Cuci Aktif", value: "8 / 10 unit", change: "80% Kapasitas", icon: <Timer className="h-5 w-5 text-yellow-500" /> },
  ];

  const quickActions = [
    { name: "POS Kasir Utama", desc: "Input order kiloan & satuan kilat", shortcut: "F1", icon: <Zap className="h-6 w-6" />, color: "bg-secondary text-white", link: "/app/kasir" },
    { name: "Scan QR Bag Laundry", desc: "Pindah status cucian kurir/staf", shortcut: "F2", icon: <QrCode className="h-6 w-6" />, color: "bg-primary text-white", link: "/app/scan" },
    { name: "Manajemen Staf / HRD", desc: "Absensi PIN & jadwal shift", shortcut: "F3", icon: <Users className="h-6 w-6" />, color: "bg-purple-600 text-white", link: "/app" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4DA8FF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#4DA8FF] text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="h-3 w-3" />
              LUNDRY.id POS & ERP Gateway
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4DA8FF] to-cyan-400">Kasir & Staf</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2">
              Outlet Jember (Pusat) · Selamat bertugas, Staf The Beacon!
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-[#4DA8FF]/20 flex items-center justify-center text-[#4DA8FF]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Operator Aktif</p>
              <p className="text-sm font-bold">Rian (Cashier Shift A)</p>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <CardContent className="p-8 flex flex-col flex-grow">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${action.color} group-hover:scale-110 transition-transform duration-500`}>
                        {action.icon}
                      </div>
                      <h3 className="text-xl font-black mb-2 group-hover:text-[#4DA8FF] transition-colors">{action.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-8 flex-grow">{action.desc}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                        <span className="px-3 py-1 bg-white/10 border border-white/10 text-xs font-black rounded-lg uppercase tracking-wider">
                          Shortcut: {action.shortcut}
                        </span>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#4DA8FF] group-hover:translate-x-2 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technical Notice Banner */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-bold text-sm text-[#4DA8FF] uppercase tracking-wider mb-1">Status Integrasi API Gateway</h4>
            <p className="text-xs text-slate-400">
              API Client terhubung ke <code className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">http://127.0.0.1:8000/api</code> via Axios Interceptor.
            </p>
          </div>
          <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/10 text-white font-bold text-xs">
            Buka Integrasi API →
          </Button>
        </div>
      </div>
    </div>
  );
}
