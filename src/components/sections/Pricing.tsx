"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const PRICING_DATA = {
  kiloan: [
    { name: "Cuci Setrika Regular", price: "8rb", unit: "/kg", info: "2-3 Hari Selesai" },
    { name: "Cuci Setrika Express", price: "16rb", unit: "/kg", info: "1 Hari Selesai" },
    { name: "Cuci Setrika 3 Jam Kilat", price: "25rb", unit: "/kg", info: "3 Jam Selesai" },
    { name: "Setrika Saja", price: "6rb", unit: "/kg", info: "1-2 Hari Selesai" },
  ],
  satuan: [
    { name: "Jas / Blazer", price: "35rb", unit: "/pcs", info: "Pembersihan Professional" },
    { name: "Sepatu (Deep Cleaning)", price: "45rb", unit: "/pasang", info: "Free Parfum" },
    { name: "Tas (Medium)", price: "50rb", unit: "/pcs", info: "Leather Care" },
    { name: "Gaun / Dress", price: "60rb", unit: "/pcs", info: "Bahan Sensitif" },
  ],
  dryclean: [
    { name: "Kebaya Premium", price: "75rb", unit: "/pcs", info: "Dry Cleaning" },
    { name: "Jas Set", price: "85rb", unit: "/set", info: "Cuci Kering" },
    { name: "Karpet / m2", price: "15rb", unit: "/m2", info: "Pembersihan Dalam" },
  ],
  b2b: [
    { name: "Paket Hotel", price: "Kontak", unit: "", info: "Sprei, Handuk, Selimut" },
    { name: "Paket Kos-kosan", price: "Kontak", unit: "", info: "Layanan Langganan" },
    { name: "Paket Restoran", price: "Kontak", unit: "", info: "Seragam, Taplak Meja" },
  ],
};

export function Pricing() {
  return (
    <section id="harga" className="py-20 bg-soft-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Harga Transparan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tidak ada biaya tersembunyi. Pilih paket yang sesuai kebutuhanmu.
          </p>
        </div>

        <Tabs defaultValue="kiloan" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/50 p-1 border h-auto flex-wrap justify-center sm:flex-nowrap">
              <TabsTrigger value="kiloan" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">Kiloan</TabsTrigger>
              <TabsTrigger value="satuan" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">Satuan</TabsTrigger>
              <TabsTrigger value="dryclean" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">Dry Clean</TabsTrigger>
              <TabsTrigger value="b2b" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">B2B</TabsTrigger>
            </TabsList>
          </div>

          {Object.entries(PRICING_DATA).map(([key, items]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-transparent hover:border-secondary/20 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-primary">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.info}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-secondary">
                        {item.price}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">{item.unit}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Butuh jemputan sekarang?</p>
            <h3 className="text-xl font-bold text-primary">Klik tombol di bawah ini</h3>
          </div>
          <Button size="lg" className="h-14 px-10 rounded-full font-bold text-lg gap-3 bg-[#25D366] hover:bg-[#128C7E] shadow-xl shadow-green-200">
            <MessageCircle className="h-6 w-6" />
            Pesan via WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
