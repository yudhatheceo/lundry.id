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
        <div className="mb-12 text-center lg:text-left">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Pilih Layanan Kami
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Dari cuci harian sampai kebutuhan bisnis, kami punya solusinya.
          </p>
        </div>

        {/* Mobile: Horizontal Swipe | Desktop: Grid */}
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="min-w-[280px] snap-center lg:min-w-0"
            >
              <Card className="h-full border-none bg-soft-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-8">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                    {service.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-primary">
                    {service.title}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-primary/80">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button className="text-sm font-bold text-secondary transition-colors hover:text-primary">
                      Lihat Detail →
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
