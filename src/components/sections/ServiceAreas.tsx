"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AREAS = [
  "Jember", "Surabaya", "Malang", "Sidoarjo", "Gresik", "Kediri"
];

const OUTLETS = [
  {
    name: "LUNDRY.id Jember Kota",
    address: "Jl. Kalimantan No. 12, Sumbersari, Jember",
    hours: "07:00 - 21:00",
    status: "Buka",
  },
  {
    name: "LUNDRY.id Surabaya Timur",
    address: "Jl. Manyar Kertoarjo No. 45, Surabaya",
    hours: "07:00 - 22:00",
    status: "Buka",
  },
];

export function ServiceAreas() {
  return (
    <section id="lokasi" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left: Areas List (SEO Power) */}
          <div className="lg:w-1/3">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-primary mb-6">
              Area Layanan
            </h2>
            <p className="text-muted-foreground mb-8">
              Kami hadir di berbagai kota besar di Jawa Timur untuk memberikan layanan terbaik bagi Anda.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {AREAS.map((area) => (
                <div key={area} className="flex items-center gap-2 p-4 rounded-xl bg-soft-white border border-border/50 text-primary font-semibold">
                  <MapPin className="h-4 w-4 text-secondary" />
                  {area}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Outlets/Branches */}
          <div className="lg:w-2/3">
            <h3 className="text-xl font-bold text-primary mb-6">Cabang Terdekat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {OUTLETS.map((outlet, idx) => (
                <motion.div
                  key={outlet.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card className="border-none bg-soft-white ring-1 ring-border/50 overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-primary text-lg">{outlet.name}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {outlet.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" />
                          <span>{outlet.address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-secondary flex-shrink-0" />
                          <span>{outlet.hours}</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full gap-2 font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                        <Navigation className="h-4 w-4" />
                        Buka di Maps
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
