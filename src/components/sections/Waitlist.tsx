"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, Sparkles, Gift, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WaitlistProps {
  onOpenWaitlist: () => void;
}

export function Waitlist({ onOpenWaitlist }: WaitlistProps) {
  return (
    <section id="waitlist" className="py-24 bg-[#fbfdff] overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-border/40 rounded-[32px] p-3 md:p-4 shadow-2xl shadow-primary/5">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 overflow-hidden">
              {/* Content Side - 2/5 width */}
              <div className="lg:col-span-2 bg-primary rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                {/* Abstract decoration inside the inner frame */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="relative z-10"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-secondary text-[10px] font-bold uppercase tracking-widest mb-8">
                    <Sparkles className="h-3 w-3" />
                    Early Bird Perks
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6">
                    Jadilah 500 Orang Pertama di Jember!
                  </h2>
                  <p className="text-white/70 text-sm md:text-base mb-10 leading-relaxed">
                    Gabung sekarang juga! Jadi member pertama LUNDRY.id dan nikmati privillege khusus. Kuota terbatas, jangan sampai kehabisan!
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                      <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-secondary transition-transform group-hover:scale-110">
                        <Gift className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Voucher Diskon 50%</p>
                        <p className="text-[10px] text-white/50">Untuk pencucian pertama Anda.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-secondary transition-transform group-hover:scale-110">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Free Upgrade Parfum</p>
                        <p className="text-[10px] text-white/50">Pilih aroma hotel bintang 5 favoritmu.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Form Side - 3/5 width (Replaced with CTA) */}
              <div className="lg:col-span-3 p-8 md:p-14 flex flex-col justify-center bg-white relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary bg-secondary/5 border border-secondary/10 px-3 py-1 rounded-full">
                      Kuota Terbatas
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-primary mt-6 mb-3">
                      Amankan Slot Prioritas Anda!
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Dapatkan keuntungan eksklusif Early Bird LUNDRY.id sebelum kuota pendaftaran 500 member pertama terisi penuh. 
                    </p>
                  </div>

                  {/* Progress Slots Indicator */}
                  <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-primary">Slot Waitlist Terisi</span>
                      <span className="font-black text-secondary uppercase tracking-widest text-[10px]">
                        82% Terisi (412 / 500)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200/60 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "82.4%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-secondary rounded-full"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      *Slot tersisa diperbarui otomatis secara real-time.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={onOpenWaitlist}
                      className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest bg-secondary hover:bg-secondary/90 text-white shadow-xl shadow-secondary/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group"
                    >
                      Gabung Waitlist Sekarang
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Proses cepat kurang dari 30 detik · Bebas spam
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Trust Indicators for Waitlist */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-black uppercase tracking-tighter text-primary">Trusted by The Beacon</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-black uppercase tracking-tighter text-primary">PT Nawasena Group</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
