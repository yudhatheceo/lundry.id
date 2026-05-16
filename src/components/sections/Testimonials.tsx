"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, Sparkles, Gift, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Testimonials() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for n8n integration
    setIsSubmitted(true);
  };

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
                    Jadilah 100 Orang Pertama di Jember!
                  </h2>
                  <p className="text-white/70 text-sm md:text-base mb-10 leading-relaxed">
                    Kami segera buka di area Kampus Mastrip. Daftar waitlist sekarang dan nikmati privilege khusus yang tidak didapatkan pelanggan lain.
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

              {/* Form Side - 3/5 width */}
              <div className="lg:col-span-3 p-8 md:p-14 flex flex-col justify-center bg-white">
                {!isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="mb-10">
                      <h3 className="text-2xl md:text-3xl font-black text-primary mb-3">Amankan Slot Anda</h3>
                      <div className="flex items-center gap-2 text-red-500 font-bold text-[11px] uppercase tracking-wider">
                        <Timer className="h-4 w-4 animate-pulse" />
                        Hanya tersisa 42 slot lagi!
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Lengkap</label>
                        <Input 
                          placeholder="Contoh: Budi Santoso" 
                          required 
                          className="h-12 bg-soft-white border-border/50 focus:border-secondary rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nomor WhatsApp</label>
                        <Input 
                          type="tel" 
                          placeholder="0811xxxxxxx" 
                          required 
                          className="h-12 bg-soft-white border-border/50 focus:border-secondary rounded-xl"
                        />
                      </div>
                      <Button type="submit" className="w-full h-14 rounded-xl font-bold bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/10 transition-all hover:scale-[1.01] active:scale-95 mt-6">
                        Gabung Waitlist Sekarang
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground mt-8 leading-relaxed italic">
                        *Kami akan mengirimi Anda pesan saat kami resmi dibuka. <br className="hidden md:block" />
                        Tenang, tidak ada spam. Hanya voucher dan update penting.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Gift className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-2">Berhasil Terdaftar!</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                      Terima kasih sudah bergabung. Kami telah mencatat nomor Anda. Siap-siap dapet kejutan wangi dari LUNDRY.id!
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsSubmitted(false)}
                      className="rounded-xl font-bold text-xs"
                    >
                      Daftarkan Nomor Lain
                    </Button>
                  </motion.div>
                )}
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
