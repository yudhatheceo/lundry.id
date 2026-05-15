"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const TESTIMONIALS = [
  {
    name: "Siska Amelia",
    location: "Surabaya",
    comment: "Pickupnya cepat banget dan hasilnya rapi. Wanginya juga tahan lama!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop",
  },
  {
    name: "Budi Santoso",
    location: "Jember",
    comment: "Layanan 3 Jam Kilat benar-benar membantu saat ada urusan mendadak. Mantap LUNDRY.id!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop",
  },
  {
    name: "Rina Wijaya",
    location: "Malang",
    comment: "Harga transparan dan kurirnya ramah banget. Udah jadi langganan tetap di sini.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop",
  },
];

export function Testimonials() {
  return (
    <section id="testimoni" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Apa Kata Pelanggan Kami?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Social proof dari mereka yang sudah merasakan kemudahan layanan LUNDRY.id.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-soft-white px-6 py-4 rounded-2xl border border-border/50">
             <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-zinc-200 overflow-hidden relative">
                    <Image 
                      src={`https://i.pravatar.cc/100?u=${i}`} 
                      alt="user" 
                      fill 
                      sizes="40px"
                    />
                  </div>
                ))}
             </div>
             <div>
                <p className="text-sm font-bold text-primary">700+ Review</p>
                <div className="flex items-center gap-1">
                   <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                   <p className="text-xs font-medium text-muted-foreground">4.9/5 Google Rating</p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="min-w-[300px] snap-center md:min-w-0"
            >
              <Card className="h-full border-none bg-soft-white/50 ring-1 ring-border/30 hover:ring-secondary/30 transition-all">
                <CardContent className="p-8 relative">
                  <Quote className="absolute top-6 right-8 h-12 w-12 text-primary/5 -z-0" />
                  
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`} 
                      />
                    ))}
                  </div>

                  <p className="text-primary/80 italic mb-8 relative z-10">
                    "{testimonial.comment}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <Image 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary leading-none mb-1">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
