"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, FlaskConical, Droplets, Hammer, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PRODUCTS = [
  {
    title: "Deterjen & Pelembut Premium",
    desc: "Formula higienis, wangi tahan lama, aman untuk semua jenis bahan pakaian.",
    price: "Mulai 25rb",
    icon: <Droplets className="h-6 w-6" />,
    image: "/images/deterjen.png",
  },
  {
    title: "Pewangi Laundry Konsentrat",
    desc: "Varian eksklusif LUNDRY.id. Aroma hotel bintang 5 yang bisa kamu pakai di rumah.",
    price: "Mulai 45rb",
    icon: <FlaskConical className="h-6 w-6" />,
    image: "/images/pewangi.png",
  },
  {
    title: "Peralatan Laundry Industri",
    desc: "Mesin cuci, setrika uap, hingga troli. Kualitas yang kami pakai di outlet kami.",
    price: "Hubungi Kami",
    icon: <Hammer className="h-6 w-6" />,
    image: "/images/peralatan.png",
  },
];

export function Products() {
  return (
    <section id="produk" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-3 block"
            >
              LUNDRY.id Supply
            </motion.span>
            <h2 className="font-heading text-3xl font-black tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Produk yang Kami <span className="text-secondary">Pakai Sendiri</span>
            </h2>
            <p className="mt-4 text-sm md:text-lg text-muted-foreground leading-relaxed">
              Kini tersedia untuk umum. Kami hanya menjual apa yang kami gunakan untuk menjamin kualitas terbaik bagi pelanggan kami.
            </p>
          </div>
          <Button 
            onClick={() => window.open("https://wa.me/628113683131?text=Halo+LUNDRY.id+saya+ingin+tanya+produk+chemical", "_blank")}
            className="rounded-full font-bold bg-primary hover:bg-primary/90 text-white gap-2 h-14 px-8"
          >
            Lihat Semua Produk
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRODUCTS.map((product, idx) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[32px] overflow-hidden group h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                      {product.icon}
                    </div>
                    <span className="text-white font-bold text-sm">{product.price}</span>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-black text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-grow">
                    {product.desc}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`https://wa.me/628113683131?text=Halo+LUNDRY.id+saya+tertarik+dengan+${product.title}`, "_blank")}
                    className="w-full rounded-2xl font-bold border-secondary text-secondary hover:bg-secondary hover:text-white transition-all"
                  >
                    Tanya Stok via WA
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
