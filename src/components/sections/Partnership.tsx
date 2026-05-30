"use client";

import React from "react";
import { motion } from "framer-motion";
import { Handshake, Store, Factory, Package, Gift, Trophy, Smartphone, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PARTNER_TYPES = [
  {
    title: "Drop Point",
    desc: "Ubah teras rumah jadi mesin uang tanpa modal. Cukup terima cucian, kami yang jemput.",
    benefits: ["Modal 0 Rupiah", "Bonus Cash & Reward", "Marketing Kit Lengkap"],
    icon: <Handshake className="h-7 w-7 text-secondary" />,
    cta: "Daftar Jadi Mitra",
  },
  {
    title: "Corporate B2B",
    desc: "Kerja sama resmi dengan PT untuk Hotel, Restoran, dan institusi besar.",
    benefits: ["Harga Kontrak Khusus", "Invoicing Bulanan", "MOU Formal Ready"],
    icon: <Factory className="h-7 w-7 text-secondary" />,
    cta: "Hubungi Kami",
  },
  {
    title: "Reseller Chemical",
    desc: "Distribusi produk pewangi & deterjen premium yang kami gunakan sendiri.",
    benefits: ["Margin Keuntungan Tinggi", "Social Proof Terjamin", "Marketing Support"],
    icon: <Package className="h-7 w-7 text-secondary" />,
    cta: "Cek Katalog",
  },
  {
    title: "Franchise Outlet",
    desc: "Sistem manajemen digital lengkap untuk Anda yang ingin investasi lebih serius.",
    benefits: ["Coming Soon - Phase 3", "Support Operasional", "Ecosystem POS Digital"],
    icon: <Store className="h-7 w-7 text-secondary" />,
    cta: "Pantau Progress",
  },
];

const DROP_POINT_REWARDS = [
  { target: "500kg/bulan", reward: "Bonus Tunai Rp250.000", icon: <Gift className="h-4 w-4" /> },
  { target: "1.000kg/bulan", reward: "Smartphone Baru", icon: <Smartphone className="h-4 w-4" /> },
  { target: "Kumulatif", reward: "Sepeda Listrik Eksklusif", icon: <Trophy className="h-4 w-4" /> },
];

export function Partnership() {
  return (
    <section id="kemitraan" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#fbfdff] -z-0 rounded-l-[100px] hidden lg:block" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-16 text-center lg:text-left flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-3 block"
            >
              Business Opportunity
            </motion.span>
            <h2 className="font-heading text-3xl font-black tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Tumbuh Bersama <span className="text-secondary">Ekosistem Kami</span>
            </h2>
            <p className="mt-4 text-sm md:text-lg text-muted-foreground leading-relaxed">
              Pilih model bisnis yang paling sesuai dengan target dan budget Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PARTNER_TYPES.map((type, idx) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="h-full border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-2 rounded-3xl bg-white overflow-hidden group">
                <CardContent className="p-6 md:p-8 flex flex-col h-full">
                  <div className="mb-6 h-14 w-14 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center transition-colors group-hover:bg-secondary group-hover:text-white">
                    {React.cloneElement(type.icon as any, { className: "h-7 w-7 transition-colors" })}
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3 leading-tight">{type.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {type.desc}
                  </p>
                  
                  {/* Benefit List */}
                  <ul className="space-y-3 mb-8">
                    {type.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-primary/70">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Drop Point Specific Rewards */}
                  {type.title === "Drop Point" && (
                    <div className="mt-2 mb-8 p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-secondary mb-3 flex items-center gap-2">
                        <Zap className="h-3 w-3 fill-secondary" /> Potential Rewards
                      </p>
                      <div className="space-y-2">
                        {DROP_POINT_REWARDS.map((r, i) => (
                          <div key={i} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-secondary">{r.icon}</span>
                              <span className="text-[9px] font-medium text-primary/60">{r.target}</span>
                            </div>
                            <span className="text-[10px] font-bold text-primary">{r.reward}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="link" 
                    onClick={() => window.open("https://wa.me/628113683131?text=Halo+LUNDRY.id+saya+tertarik+dengan+program+" + encodeURIComponent(type.title), "_blank")}
                    className="mt-auto p-0 h-auto font-black text-[10px] uppercase tracking-widest text-secondary justify-start hover:text-primary transition-all"
                  >
                    {type.cta} →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Highlighted CTA Block */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-16 p-8 md:p-12 rounded-[40px] bg-primary relative overflow-hidden shadow-2xl shadow-primary/20"
        >
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="max-w-xl">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Konsultasi Bisnis Gratis?</h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Tim ekspansi kami siap membantu Anda menganalisis potensi pasar di lokasi Anda dan memilih model kerjasama terbaik.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => window.open("https://wa.me/628113683131?text=Halo+LUNDRY.id+saya+ingin+tanya+kemitraan", "_blank")}
              className="bg-[#FFB703] hover:bg-[#E5A503] text-primary font-black px-12 h-14 rounded-full shadow-xl shadow-black/10 transition-transform hover:scale-105 active:scale-95"
            >
              Daftar Jadi Partner
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
