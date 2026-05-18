"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Store, 
  PlusCircle, 
  Receipt, 
  Gift, 
  Smartphone, 
  Trophy, 
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MitraDashboard() {
  const stats = [
    { label: "Cucian Diterima", value: "142.5 Kg", change: "Bulan Ini", icon: <TrendingUp className="h-5 w-5 text-emerald-500" /> },
    { label: "Komisi Aktif", value: "Rp 356.250", change: "Rp 2.500 / kg", icon: <Receipt className="h-5 w-5 text-[#4DA8FF]" /> },
    { label: "Peringkat Drop Point", value: "#4 di Jember", change: "Top 10%", icon: <Trophy className="h-5 w-5 text-yellow-500" /> },
  ];

  const rewards = [
    { target: "500kg / bulan", reward: "Bonus Tunai Rp 250rb", active: true, progress: "28%" },
    { target: "1.000kg / bulan", reward: "Smartphone Baru", active: false, progress: "14%" },
    { target: "Kumulatif 3.000kg", reward: "Sepeda Listrik", active: false, progress: "4.7%" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-secondary text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="h-3 w-3" />
              LUNDRY.id Partner Portal
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              Portal <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-teal-400">Mitra Drop Point</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2">
              Warung Pojok Mastrip (Mitra #012) · Kelola usaha rumahan tanpa modal!
            </p>
          </div>
          
          <Button className="h-14 px-8 rounded-full font-bold bg-secondary hover:bg-secondary/90 text-white gap-2 shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <PlusCircle className="h-5 w-5" />
            Input Cucian Masuk
          </Button>
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

        {/* Rewards Progression */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rewards Card */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-300">Target & Rewards Mitra (Fase 2)</h2>
            <div className="grid grid-cols-1 gap-4">
              {rewards.map((r, idx) => (
                <motion.div
                  key={r.target}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-secondary/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                      <p className="text-sm font-bold text-slate-300">{r.target}</p>
                    </div>
                    <p className="text-lg font-black text-white">{r.reward}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Progress</p>
                      <p className="text-sm font-bold text-secondary">{r.progress}</p>
                    </div>
                    <div className="h-12 w-24 bg-white/10 rounded-xl overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-secondary to-teal-400 transition-all duration-1000"
                        style={{ width: r.progress }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Info / Tips Card */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-300">Marketing Kit</h2>
            <Card className="bg-gradient-to-br from-primary to-slate-900 border-white/10 text-white rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl relative group h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
              <CardContent className="p-8 flex flex-col justify-between h-full space-y-8">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/20 text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black">Mau tingkatkan omzet?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bagikan brosur digital LUNDRY.id ke grup WhatsApp RT/RW dan warga sekitar kos Anda. Dapatkan spanduk fisik gratis dari tim kami!
                  </p>
                </div>
                
                <Button variant="outline" className="w-full rounded-2xl border-white/10 hover:bg-white/10 text-white font-bold text-xs gap-2 py-6">
                  Download Marketing Kit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
