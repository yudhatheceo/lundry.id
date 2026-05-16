"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WhatsAppFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.a
        href="https://wa.me/628113683131?text=Halo+LUNDRY.id+saya+ingin+bertanya"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-full shadow-2xl shadow-green-500/30 group"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        </div>
        <span className="font-black text-sm uppercase tracking-widest hidden md:block">
          Pesan Sekarang
        </span>
      </motion.a>
    </div>
  );
}
