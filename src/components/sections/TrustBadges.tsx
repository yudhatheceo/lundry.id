"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Clock, 
  Bell, 
  Truck,
  Sparkles,
  CheckCircle2,
  Tag
} from "lucide-react";

const METRICS = [
  { label: "Notifikasi Real-Time", value: "Live", icon: <Bell className="h-5 w-5" /> },
  { label: "Standar Kualitas", value: "Hotel", icon: <ShieldCheck className="h-5 w-5" /> },
  { label: "Pickup & Antar", value: "Pasti", icon: <Truck className="h-5 w-5" /> },
  { label: "Custom Parfum", value: "Gratis", icon: <Sparkles className="h-5 w-5" /> },
];

const FEATURES = [
  {
    title: "Sistem Otomatis 24 Jam",
    desc: "Order masuk, konfirmasi, status, dan invoice — semua otomatis via WhatsApp.",
    icon: <Bell className="h-6 w-6" />,
  },
  {
    title: "Garansi Kepastian Waktu",
    desc: "Jadwal pickup & antar yang terencana (08:00-10:00 & 15:00-17:00).",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    title: "Mitra Bisnis Resmi",
    desc: "Beroperasi di bawah PT NAWASENA ADIKARYA PRATAMA. Siap kerja sama formal B2B.",
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
];

export function TrustBadges() {
  return (
    <section className="py-24 bg-primary text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20 border-b border-white/10 pb-16">
          {METRICS.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                {metric.icon}
              </div>
              <h3 className="text-3xl font-black mb-1">{metric.value}</h3>
              <p className="text-sm text-white/60 font-medium">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/20">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
