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
    q: "Bagaimana cara memesan?",
    a: "Cukup chat WhatsApp kami. Bot kami akan memandu kamu mulai dari pilih layanan, jadwal pickup, sampai konfirmasi harga. Tidak perlu install aplikasi apapun.",
  },
  {
    q: "Berapa biaya antar-jemput?",
    a: "Gratis untuk radius 3km dari outlet kami di Jember. Di luar itu dikenakan Rp2.000/km. Konfirmasi ongkir otomatis muncul saat kamu order via WA.",
  },
  {
    q: "Apakah ada paket langganan?",
    a: "Ada! Mulai dari Paket Mahasiswa 20kg/bulan. Lebih hemat dan tidak perlu order satu-satu setiap minggu.",
  },
  {
    q: "Bagaimana kalau pakaian saya rusak atau hilang?",
    a: "Kami bertanggung jawab penuh. Setiap pakaian dicatat dan difoto saat masuk. Ada sistem klaim yang bisa kamu ajukan langsung via WhatsApp.",
  },
  {
    q: "Metode pembayaran apa yang diterima?",
    a: "QRIS (semua e-wallet), transfer bank, dan tunai saat pickup/delivery. Invoice dikirim otomatis via WhatsApp.",
  },
  {
    q: "Apakah bisa untuk kebutuhan bisnis (hotel, kos, dll)?",
    a: "Bisa. Kami melayani B2B dengan harga kontrak, invoicing bulanan, dan bisa tanda tangan MOU formal karena kami beroperasi sebagai PT.",
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
            <Button 
              size="lg" 
              onClick={() => window.open("https://wa.me/628113683131?text=Halo+LUNDRY.id+saya+ingin+order+laundry", "_blank")}
              className="w-full sm:w-auto h-14 px-10 rounded-full font-bold text-lg gap-3 bg-[#25D366] hover:bg-[#128C7E]"
            >
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
