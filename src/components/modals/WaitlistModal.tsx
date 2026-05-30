"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Gift, Timer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock n8n/Database integration call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName("");
    setPhone("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-slate-900 border border-border/20 rounded-[32px] w-full max-w-md p-8 md:p-10 shadow-2xl relative overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 h-10 w-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Decorative Inner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />

            {!isSubmitted ? (
              <div>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-wider mb-4">
                    <Sparkles className="h-3 w-3" />
                    Priority Waitlist
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-primary leading-tight mb-2">
                    Gabung Waitlist!
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Amankan voucher diskon 50% dan upgrade parfum gratis dengan mendaftar di bawah ini.
                  </p>
                  
                  <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-wider mt-4">
                    <Timer className="h-3.5 w-3.5 animate-pulse" />
                    Slot Terbatas untuk 500 Pendaftar Pertama!
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Nama Lengkap
                    </label>
                    <Input
                      placeholder="Nala Larasati"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-white/5 border-border/50 focus:border-secondary rounded-xl text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Nomor WhatsApp
                    </label>
                    <Input
                      type="tel"
                      placeholder="0811xxxxxxx"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-white/5 border-border/50 focus:border-secondary rounded-xl text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/20 transition-all hover:scale-[1.01] active:scale-95 mt-6 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Gabung Waitlist Sekarang
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-[9px] text-center text-muted-foreground mt-6 leading-relaxed italic">
                    *Kami akan mengirimkan pesan konfirmasi saat resmi dibuka. <br />
                    Bebas spam. Hanya voucher dan pembaruan penting.
                  </p>
                </form>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-primary mb-2">Berhasil Terdaftar!</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mb-8 max-w-xs mx-auto">
                  Terima kasih <span className="font-bold text-primary">{name}</span> sudah bergabung. Nomor WhatsApp <span className="font-bold text-primary">{phone}</span> telah kami simpan. Siap-siap mendapat kejutan wangi dari LUNDRY.id!
                </p>
                
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={onClose}
                    className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white text-xs"
                  >
                    Tutup Halaman
                  </Button>
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold text-secondary hover:underline py-2"
                  >
                    Daftarkan Nomor Lain
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
