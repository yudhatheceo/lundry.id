"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ServiceItem {
  id: number;
  category: string;
  service_name: string;
  duration: string;
  price: number;
  unit: string;
  is_active: boolean;
}

export function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gunakan fetch biasa (bukan axios api.ts) agar tidak kena interceptor 401 → redirect login
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    fetch(`${baseUrl}/public/services`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        setServices(data);
      })
      .catch((e) => console.error("Gagal memuat layanan:", e))
      .finally(() => setLoading(false));
  }, []);

  // Kelompokkan berdasarkan kategori
  const grouped = (Array.isArray(services) ? services : []).reduce((acc, svc) => {
    if (!svc.is_active) return acc; // hanya tampilkan layanan aktif
    (acc[svc.category] = acc[svc.category] || []).push(svc);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

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

        {loading ? (
          <div className="flex justify-center items-center py-12 gap-3">
            <div className="h-7 w-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-primary font-medium text-sm">Memuat layanan...</span>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">Belum ada layanan yang tersedia.</p>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-10">
              <h3 className="text-base font-bold text-slate-600 uppercase tracking-wider mb-4 border-b pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((svc, idx) => (
                  <motion.div
                    key={svc.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Card className="h-full border-none bg-[#fbfdff] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group rounded-2xl">
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-primary text-sm leading-tight group-hover:text-secondary transition-colors">
                            {svc.service_name}
                          </h4>
                          <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">⏱ {svc.duration}</p>
                        <div className="mt-auto pt-3 border-t border-secondary/10">
                          <p className="text-lg font-black text-secondary">
                            Rp {svc.price.toLocaleString("id-ID")}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{svc.unit}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
