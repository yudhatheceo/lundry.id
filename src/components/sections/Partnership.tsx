"use client";

import React from "react";
import { motion } from "framer-motion";
import { Handshake, Store, Factory, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PARTNER_TYPES = [
  {
    title: "Franchise",
    desc: "Buka outlet full branding dengan sistem yang sudah teruji.",
    icon: <Store className="h-8 w-8 text-primary" />,
  },
  {
    title: "Drop Outlet",
    desc: "Terima cucian di lokasi Anda dan dapatkan komisi menarik.",
    icon: <Handshake className="h-8 w-8 text-primary" />,
  },
  {
    title: "B2B Partner",
    desc: "Layanan laundry skala besar untuk Hotel, Kafe, dan Klinik.",
    icon: <Factory className="h-8 w-8 text-primary" />,
  },
  {
    title: "Reseller Chemical",
    desc: "Distribusi produk chemical laundry premium LUNDRY.id.",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
];

export function Partnership() {
  return (
    <section id="kemitraan" className="py-20 bg-soft-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Jadi Partner LUNDRY.id
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Mulai bisnis laundry modern bersama ekosistem kami yang terus berkembang.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PARTNER_TYPES.map((type, idx) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6 h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{type.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                    {type.desc}
                  </p>
                  <Button variant="link" className="p-0 h-auto font-bold text-secondary justify-start hover:text-primary">
                    Pelajari Lebih Lanjut →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-primary text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ingin berdiskusi lebih lanjut?</h3>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Tim kami siap membantu Anda memilih model bisnis yang paling sesuai dengan target pasar Anda.
          </p>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-primary font-bold px-10 rounded-full">
            Daftar Kemitraan
          </Button>
        </div>
      </div>
    </section>
  );
}
