"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt, Timer, Zap, Star, ShieldCheck, ShoppingBag, Handshake } from "lucide-react";

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
    <section className="relative overflow-hidden bg-white">
      {/* Top Banner: Cinematic Overlay Experience */}
      <div className="relative h-[550px] md:h-[650px] w-full flex items-center">
        {/* Banner Image with Multi-layer Masking */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.webp" 
            alt="LUNDRY.id Premium Service"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Layered Overlays for depth and readability */}
          <div className="absolute inset-0 bg-primary/40" /> {/* Base tint */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
              Laundry Modern #1 Jember
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl font-black tracking-tight text-white sm:text-7xl leading-[1.1] drop-shadow-lg"
            >
              Cuci & Setrika <br />
              <span className="text-secondary">Tanpa Ribet</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base md:text-lg text-white/80 max-w-md leading-relaxed font-medium"
            >
              Eksperiens laundry terbaik dengan standar kualitas hotel. 
              Bersih, Wangi, & Cepat sampai di depan pintu Anda.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button size="lg" className="h-14 rounded-full font-bold text-sm px-10 bg-secondary hover:bg-secondary/90 text-white shadow-md border-none transition-all hover:scale-[1.02] active:scale-95">
                Pesan Sekarang
                <ShoppingBag className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" className="h-14 rounded-full font-bold text-sm px-10 bg-[#FFB703] hover:bg-[#E5A503] text-primary shadow-md border-none transition-all hover:scale-[1.02] active:scale-95">
                Jadi Partner
                <Handshake className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Transition Area: Pricing Cards (Refined Palette) */}
      <div className="bg-[#f8fbff] py-12 pb-20 relative -mt-8 rounded-t-[40px] z-20 shadow-[0_-20px_50px_rgba(20,33,61,0.15)] md:rounded-none md:mt-0 md:shadow-none border-t border-white/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 max-w-5xl mx-auto">
            {PRICING_CARDS.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white hover:shadow-[0_15px_45px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-2 rounded-3xl overflow-hidden group">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center transition-colors group-hover:bg-secondary group-hover:text-white">
                        {React.cloneElement(card.icon as any, { className: "h-8 w-8 transition-colors" })}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary text-xl leading-tight">{card.label}</h4>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-1 opacity-60">Layanan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary tracking-tighter">
                        {card.price}
                        <span className="text-xs font-normal text-muted-foreground/60 ml-0.5">{card.unit}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Social Proof Metrics */}
          <div className="mt-12 flex items-center justify-center gap-16 md:hidden">
             <div className="text-center group">
                <p className="text-3xl font-black text-primary group-hover:text-secondary transition-colors">1.2k+</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-2">Pelanggan</p>
             </div>
             <div className="w-px h-12 bg-primary/5" />
             <div className="text-center group">
                <p className="text-3xl font-black text-primary group-hover:text-secondary transition-colors">4.9/5</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                   <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                   <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Rating</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}