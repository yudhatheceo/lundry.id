"use client";

import React from "react";
import { motion } from "framer-motion";
import { Handshake, Store, Factory, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PARTNER_TYPES = [
  {
    title: "Franchise Outlet",
    desc: "Buka outlet LUNDRY.id dengan sistem manajemen digital lengkap.",
    benefits: ["Full Branding & Support", "Sistem POS Terintegrasi", "SOP & Training Karyawan"],
    icon: <Store className="h-7 w-7 text-secondary" />,
  },
  {
    title: "Drop Point",
    desc: "Terima cucian di toko/rumah Anda dan dapatkan komisi instan.",
    benefits: ["Tanpa Modal Awal", "Komisi s/d 20% / Order", "Pickup Rutin dari Kami"],
    icon: <Handshake className="h-7 w-7 text-secondary" />,
  },
  {
    title: "Corporate B2B",
    desc: "Solusi laundry untuk Hotel, Restoran, dan instansi besar.",
    benefits: ["Harga Khusus Volume Besar", "Prioritas Layanan Express", "Invoicing & Report Bulanan"],
    icon: <Factory className="h-7 w-7 text-secondary" />,
  },
  {
    title: "Reseller Chemical",
    desc: "Distribusi produk pewangi & deterjen premium LUNDRY.id.",
    benefits: ["Produk Eksklusif Jember", "Margin Keuntungan Tinggi", "Marketing Kit Disediakan"],
    icon: <Users className="h-7 w-7 text-secondary" />,
  },
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
                    {React.cloneElement(type.icon as React.ReactElement, { className: "h-7 w-7 transition-colors" })}
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3 leading-tight">{type.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {type.desc}
                  </p>
                  
                  {/* Benefit List - The 'Informative' Part */}
                  <ul className="space-y-3 mb-8">
                    {type.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-primary/70">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Button variant="link" className="mt-auto p-0 h-auto font-black text-[10px] uppercase tracking-widest text-secondary justify-start hover:text-primary transition-all">
                    Detail Kerjasama →
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
            <Button size="lg" className="bg-[#FFB703] hover:bg-[#E5A503] text-primary font-black px-12 h-14 rounded-full shadow-xl shadow-black/10 transition-transform hover:scale-105 active:scale-95">
              Daftar Jadi Partner
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
