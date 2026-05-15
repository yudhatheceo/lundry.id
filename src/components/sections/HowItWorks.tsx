"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  TouchpadOff, 
  CalendarCheck2, 
  Truck, 
  Sparkles 
} from "lucide-react";

const STEPS = [
  {
    title: "Pilih Layanan",
    description: "Pilih layanan kiloan atau satuan sesuai kebutuhanmu.",
    icon: <TouchpadOff className="h-10 w-10 text-secondary" />,
  },
  {
    title: "Atur Pickup",
    description: "Tentukan lokasi dan waktu penjemputan via WhatsApp.",
    icon: <CalendarCheck2 className="h-10 w-10 text-secondary" />,
  },
  {
    title: "Kami Jemput",
    description: "Kurir ramah kami akan menjemput pakaian kotor Anda.",
    icon: <Truck className="h-10 w-10 text-secondary" />,
  },
  {
    title: "Bersih & Diantar",
    description: "Pakaian bersih, wangi, dan rapi diantar kembali ke rumah.",
    icon: <Sparkles className="h-10 w-10 text-secondary" />,
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Cara Kerja LUNDRY.id
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hanya butuh 4 langkah mudah sampai baju kamu kembali bersih.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop Only) */}
          <div className="absolute top-1/2 left-0 hidden h-0.5 w-full -translate-y-1/2 bg-soft-white lg:block" />
          
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-border/50">
                  <div className="relative">
                    {step.icon}
                    <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-md">
                      {idx + 1}
                    </span>
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-primary">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed px-4">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
