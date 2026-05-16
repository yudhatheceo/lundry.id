"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Camera, Share2, Play, MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border/50 pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative h-8 w-32">
                <Image
                  src="/logo.jpg"
                  alt="LUNDRY.id"
                  fill
                  sizes="(max-width: 768px) 128px, 128px"
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Layanan laundry modern yang praktis, cepat, dan terpercaya. Kami siap mengurus pakaian kotor Anda agar Anda punya lebih banyak waktu untuk hal penting lainnya.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-soft-white flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-colors">
                <Camera className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-soft-white flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-colors">
                <MessageSquare className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-soft-white flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-primary mb-6">Navigasi</h4>
            <ul className="space-y-4">
              {["Layanan", "Harga", "Cara Kerja", "Testimoni", "Kemitraan"].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas (SEO) */}
          <div>
            <h4 className="font-bold text-primary mb-6">Area Layanan</h4>
            <ul className="space-y-4">
              {["Jember", "Surabaya", "Malang", "Sidoarjo", "Gresik"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-primary mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary flex-shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Head Office: <br />
                  Gumelar, Balung, Jember, Jawa Timur
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">0811-3683-3131</span>-
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">halo@lundry.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LUNDRY.id. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Kebijakan Privasi</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
  -}
