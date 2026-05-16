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
    <section id="testimoni" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-3 block"
            >
              Social Proof
            </motion.span>
            <h2 className="font-heading text-3xl font-black tracking-tight text-primary sm:text-4xl">
              Kata Mereka Tentang <span className="text-secondary">LUNDRY</span>
            </h2>
            <p className="mt-4 text-sm md:text-lg text-muted-foreground leading-relaxed">
              Ribuan pelanggan telah beralih ke cara cuci yang lebih cerdas.
            </p>
          </div>
          
          {/* Google Rating Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-white px-5 py-4 rounded-3xl shadow-sm border border-secondary/10 self-center md:self-auto"
          >
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-9 w-9 rounded-full border-2 border-white bg-zinc-100 overflow-hidden relative shadow-sm">
                    <Image 
                      src={`https://i.pravatar.cc/100?u=${i + 10}`} 
                      alt="user" 
                      fill 
                      sizes="36px"
                    />
                  </div>
                ))}
             </div>
             <div className="h-8 w-px bg-secondary/10" />
             <div>
                <p className="text-xs font-black text-primary leading-none mb-1">4.9/5 Rating</p>
                <div className="flex items-center gap-1">
                   <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                      ))}
                   </div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Google Maps</p>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Testimonials Carousel/Grid */}
        <div className="flex gap-4 overflow-x-auto pb-10 snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="min-w-[85vw] md:min-w-0 snap-center first:ml-0 last:mr-0"
            >
              <Card className="h-full border-none bg-[#fbfdff] shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden relative group">
                <CardContent className="p-6 md:p-10">
                  <Quote className="absolute top-6 right-6 h-10 w-10 text-secondary/5" />
                  
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`} 
                      />
                    ))}
                  </div>

                  <p className="text-sm md:text-base text-primary/80 leading-relaxed font-medium mb-8 relative z-10 italic">
                    "{testimonial.comment}"
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <div className="relative h-12 w-12 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                      <Image 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-primary text-sm md:text-base leading-none mb-1">{testimonial.name}</h4>
                      <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider">{testimonial.location}</p>
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
