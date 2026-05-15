"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  Award,
  Star
} from "lucide-react";

const METRICS = [
  { label: "Pelanggan Puas", value: "1.200+", icon: <UserCheck className="h-5 w-5" /> },
  { label: "Rating Google", value: "4.9/5", icon: <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /> },
  { label: "Cucian Selesai", value: "10rb+ Kg", icon: <Award className="h-5 w-5" /> },
  { label: "Area Layanan", value: "5 Kota", icon: <ShieldCheck className="h-5 w-5" /> },
];

const FEATURES = [
  {
    title: "Higienis & Bersih",
    desc: "Proses pencucian standar tinggi dan detergent ramah lingkungan.",
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  {
    title: "Tepat Waktu",
    desc: "Jaminan jemput dan antar sesuai estimasi yang dijanjikan.",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    title: "Kurir Ramah",
    desc: "Partner kurir kami terlatih untuk melayani Anda dengan senyum.",
    icon: <UserCheck className="h-6 w-6" />,
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
