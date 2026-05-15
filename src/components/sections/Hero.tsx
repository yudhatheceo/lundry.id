"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt, Timer, Zap, Star, ShieldCheck } from "lucide-react";

const PRICING_CARDS = [
  {
    label: "Regular",
    price: "8rb",
    unit: "/kilo",
    icon: <Shirt className="h-6 w-6 text-primary" />,
    color: "bg-white",
  },
  {
    label: "Express",
    price: "16rb",
    unit: "/kilo",
    icon: <Zap className="h-6 w-6 text-secondary" />,
    color: "bg-white",
  },
  {
    label: "3 Jam Kilat",
    price: "25rb",
    unit: "/kilo",
    icon: <Timer className="h-6 w-6 text-accent" />,
    color: "bg-white",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-20 md:pt-16 md:pb-32">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/3 rounded-full bg-secondary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/4 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center lg:flex-row lg:gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider mb-6"
            >
              <Zap className="h-3 w-3 fill-secondary" />
              Laundry Modern #1 Jember
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-heading text-5xl font-black tracking-tight text-primary sm:text-6xl lg:text-7xl leading-[1.1]"
            >
              Cuci & Setrika <br />
              <span className="text-secondary">Tanpa Ribet</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Regular, Express, dan 3 Jam Kilat. <br className="hidden sm:block" />
              Pickup & antar tersedia langsung dari HP kamu. <br className="hidden sm:block" />
              <span className="font-bold text-primary italic">“Drop. Wash. Done.”</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
            >
              <Button size="lg" className="w-full sm:w-auto h-14 rounded-full font-bold text-lg px-10 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Pesan Sekarang
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 rounded-full font-bold text-lg px-10 border-2 hover:bg-soft-white transition-colors">
                Cek Harga
              </Button>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="mt-12 flex items-center justify-center lg:justify-start gap-8"
            >
               <div>
                  <p className="text-2xl font-black text-primary">1.2k+</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Pelanggan</p>
               </div>
               <div className="w-px h-8 bg-border" />
               <div>
                  <p className="text-2xl font-black text-primary">4.9/5</p>
                  <div className="flex items-center gap-1">
                     <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                     <p className="text-xs text-muted-foreground uppercase font-bold">Rating Google</p>
                  </div>
               </div>
            </motion.div>
          </div>

          {/* Image & Cards Fold */}
          <div className="relative mt-20 flex-1 lg:mt-0 w-full max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] w-full max-w-[480px] mx-auto lg:ml-auto lg:mr-0"
            >
              {/* Image Frame with specialized rounding and shadow */}
              <div className="absolute -inset-4 bg-soft-white rounded-[40px] -z-10" />
              <div className="relative h-full w-full overflow-hidden rounded-[32px] shadow-2xl ring-1 ring-black/5">
                <Image
                  src="/hero.png" 
                  alt="LUNDRY.id Staff"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
                  className="object-cover transition-transform duration-700 hover:scale-110"
                  priority
                />
              </div>

              {/* Trust Badge overlay */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -left-6 top-10 bg-white p-4 rounded-2xl shadow-xl z-30 hidden sm:flex items-center gap-3 border border-border/50"
              >
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary leading-tight">Terjamin Higienis</p>
                  <p className="text-[10px] text-muted-foreground">Proses Standar Hotel</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Pricing Cards - Re-arranged for better 'tata letak' */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:absolute lg:bottom-10 lg:-left-20 lg:right-auto lg:w-[450px] lg:mt-0 z-40">
              {PRICING_CARDS.map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                >
                  <Card className="border-none shadow-xl ring-1 ring-border/30 bg-white/95 backdrop-blur-sm hover:-translate-y-1 transition-all">
                    <CardContent className="flex items-center gap-4 p-4 lg:flex-col lg:items-center lg:text-center lg:gap-2">
                      <div className="rounded-xl bg-soft-white p-2 shadow-inner">
                        {card.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                        <p className="text-lg font-black text-primary leading-none mt-1">
                          {card.price}
                          <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{card.unit}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
