"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Sparkles, 
  Box, 
  Building2, 
  CheckCircle2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SERVICES = [
  {
    title: "Laundry Kiloan",
    description: "Regular, Express, dan 3 Jam Kilat. Cocok untuk pakaian harian.",
    icon: <ShoppingBag className="h-8 w-8 text-secondary" />,
    items: ["Baju & Celana", "Handuk", "Seprai"],
  },
  {
    title: "Laundry Satuan",
    description: "Perlakuan khusus untuk pakaian kesayangan Anda.",
    icon: <Sparkles className="h-8 w-8 text-secondary" />,
    items: ["Jas & Blazer", "Dress / Kebaya", "Jaket Kulit"],
  },
  {
    title: "Cucian Besar",
    description: "Bersihkan perlengkapan rumah tangga dengan mesin industri.",
    icon: <Box className="h-8 w-8 text-secondary" />,
    items: ["Bed Cover", "Karpet", "Gorden"],
  },
  {
    title: "Layanan B2B",
    description: "Partner laundry untuk bisnis Anda dengan harga kompetitif.",
    icon: <Building2 className="h-8 w-8 text-secondary" />,
    items: ["Hotel & Kost", "Restoran / Kafe", "Klinik / Gym"],
  },
];

export function Services() {
  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-3 block"
          >
            Layanan Unggulan
          </motion.span>
          <h2 className="font-heading text-3xl font-black tracking-tight text-primary sm:text-4xl">
            Solusi Laundry <span className="text-secondary">Lengkap</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Dari cuci harian sampai kebutuhan bisnis, kami punya standar kualitas yang sama tingginya.
          </p>
        </div>

        {/* Improved Grid Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="h-full border-none bg-[#fbfdff] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group rounded-2xl md:rounded-3xl overflow-hidden">
                <CardContent className="p-5 md:p-8 flex flex-col h-full">
                  <div className="mb-4 md:mb-6 inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl bg-white shadow-sm border border-secondary/5 group-hover:bg-secondary group-hover:text-white transition-colors">
                    {React.cloneElement(service.icon as React.ReactElement, { className: "h-6 w-6 md:h-8 md:w-8" })}
                  </div>
                  
                  <h3 className="mb-2 text-base md:text-xl font-black text-primary group-hover:text-secondary transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed flex-grow">
                    {service.description}
                  </p>

                  {/* Items List - Only visible on Tablet/Desktop for cleanliness */}
                  <ul className="mt-6 space-y-2 hidden md:block">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-primary/70">
                        <div className="h-1 w-1 rounded-full bg-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 md:mt-8 pt-4 border-t border-secondary/5">
                    <button className="text-[10px] md:text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                      Pesan <span className="hidden md:inline">Sekarang</span> →
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
