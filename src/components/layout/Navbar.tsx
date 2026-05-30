"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Layanan", href: "#layanan" },
  { label: "Waitlist", href: "#waitlist" },
  { label: "Harga", href: "#harga" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Lokasi", href: "#lokasi" },
  { label: "Kemitraan", href: "#kemitraan" },
];

interface NavbarProps {
  onOpenWaitlist: () => void;
}

export function Navbar({ onOpenWaitlist }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full border-b transition-colors ${isOpen ? "bg-white" : "bg-background/80 backdrop-blur-md"}`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-32">
              <Image
                src="/logo.webp"
                alt="LUNDRY.id"
                fill
                sizes="(max-width: 768px) 128px, 128px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Button className="font-semibold" size="sm" onClick={onOpenWaitlist}>
              Pesan Sekarang
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Moved OUTSIDE for total opacity */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-[60] bg-white lg:hidden">
          <div className="flex flex-col space-y-4 p-6 shadow-xl h-full">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-lg font-bold text-primary transition-colors hover:text-secondary pl-4 border-l-4 border-transparent hover:border-secondary"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4">
              <Button 
                onClick={() => { setIsOpen(false); onOpenWaitlist(); }}
                className="w-full font-bold" 
                size="lg"
              >
                Pesan Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
