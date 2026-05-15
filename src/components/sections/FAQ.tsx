"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const FAQS = [
  {
    q: "Berapa minimal laundry di LUNDRY.id?",
    a: "Untuk layanan kiloan, minimal laundry adalah 3kg. Jika kurang dari itu, tetap akan dikenakan tarif minimal 3kg.",
  },
  {
    q: "Apakah ada layanan pickup dan antar?",
    a: "Ya! Kami menyediakan layanan antar-jemput langsung ke lokasi Anda. Anda bisa mengatur jadwal pickup melalui WhatsApp.",
  },
  {
    q: "Area mana saja yang dijangkau LUNDRY.id?",
    a: "Saat ini kami melayani area Jember, Surabaya, Malang, dan Sidoarjo. Cek section Lokasi untuk detail lebih lanjut.",
  },
  {
    q: "Berapa lama proses pengerjaannya?",
    a: "Kami punya 3 paket: Regular (2-3 hari), Express (1 hari), dan 3 Jam Kilat (khusus cucian kiloan).",
  },
  {
    q: "Apakah bisa untuk laundry hotel atau kafe?",
    a: "Tentu! Kami memiliki layanan B2B khusus untuk bisnis dengan harga kontrak yang lebih kompetitif.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-primary mb-6">
              Pertanyaan Umum
            </h2>
            <p className="text-muted-foreground">
              Masih punya pertanyaan? Kami sudah merangkum hal-hal yang sering ditanyakan oleh pelanggan kami.
            </p>
          </div>
          
          <div className="lg:w-2/3">
            <Accordion className="w-full">
              {FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-border/50">
                  <AccordionTrigger className="text-left font-bold text-primary hover:text-secondary hover:no-underline py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center p-12 rounded-3xl bg-secondary/5 border border-secondary/10">
          <h2 className="text-3xl font-black text-primary mb-4">Cucian numpuk?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            Tinggal klik, kurir kami jemput, dan kamu tinggal terima bersih.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full font-bold text-lg gap-3 bg-[#25D366] hover:bg-[#128C7E]">
              <MessageCircle className="h-6 w-6" />
              Pesan Sekarang
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-full font-bold text-lg border-primary text-primary">
              Lihat Pricelist
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
