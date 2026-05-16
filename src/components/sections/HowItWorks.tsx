"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  MessageCircle, 
  Truck, 
  Sparkles 
} from "lucide-react";


const STEPS = [
  {
    title: "Pesan via HP",
    description: "Pilih layanan dan atur pesanan langsung dari smartphone kamu.",
    icon: <Smartphone className="h-8 w-8 text-secondary" />,
  },
  {
    title: "Chat & Konfirmasi",
    description: "Tim kami akan konfirmasi jadwal pickup via WhatsApp.",
    icon: <MessageCircle className="h-8 w-8 text-secondary" />,
  },
  {
    title: "Jemput & Cuci",
    description: "Kurir jemput pakaianmu dan kami cuci dengan standar profesional.",
    icon: <Truck className="h-8 w-8 text-secondary" />,
  },
  {
    title: "Antar Bersih",
    description: "Pakaian kembali bersih, wangi, dan rapi ke depan pintu rumah.",
    icon: <Sparkles className="h-8 w-8 text-secondary" />,
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-3 block"
          >
            Alur Layanan
          </motion.span>
          <h2 className="font-heading text-3xl font-black tracking-tight text-primary sm:text-4xl">
            Semudah <span className="text-secondary">Itu</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
            Kami mengurus semuanya dari jemput sampai antar kembali.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical/Horizontal Line */}
          <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-secondary/40 via-secondary/20 to-transparent lg:left-0 lg:top-1/2 lg:w-full lg:h-0.5 lg:-translate-y-1/2 lg:bg-gradient-to-r" />
          
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative z-10 flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center group"
              >
                {/* Large Background Number */}
                <div className="absolute -left-4 -top-8 text-[80px] font-black text-primary/5 select-none hidden lg:block group-hover:text-secondary/10 transition-colors">
                  0{idx + 1}
                </div>

                {/* Icon & Number Circle */}
                <div className="relative flex-shrink-0 mb-0 lg:mb-8 mr-6 lg:mr-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-lg ring-1 ring-secondary/10 group-hover:scale-110 transition-transform duration-500">
                    <div className="relative">
                      {step.icon}
                      <span className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-black text-white shadow-xl">
                        0{idx + 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="pt-2 lg:pt-0">
                  <h3 className="mb-2 text-lg md:text-xl font-black text-primary">
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
