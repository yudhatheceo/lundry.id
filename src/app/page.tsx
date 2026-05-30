"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Pricing } from "@/components/sections/Pricing";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { Waitlist } from "@/components/sections/Waitlist";
import { ServiceAreas } from "@/components/sections/ServiceAreas";
import { Partnership } from "@/components/sections/Partnership";
import { Products } from "@/components/sections/Products";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/layout/Footer";
import { WaitlistModal } from "@/components/modals/WaitlistModal";
import { PublicTracker } from "@/components/sections/PublicTracker";

export default function Home() {
  const router = useRouter();
  // Only enable subdomain redirect when a mock_host param is explicitly provided
  const [isSubdomainRedirecting, setIsSubdomainRedirecting] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const searchParams = new URLSearchParams(window.location.search);
      const mockHost = searchParams.get("mock_host");

      // If no mock_host query, we stay on landing page
      if (!mockHost) {
        setIsSubdomainRedirecting(false);
        return;
      }

      const isApp =
        mockHost === "app" ||
        hostname.startsWith("app.localhost") ||
        hostname.startsWith("app.lundry.id") ||
        hostname.startsWith("dev.app.lundry.id");

      const isMitra =
        mockHost === "mitra" ||
        hostname.startsWith("mitra.localhost") ||
        hostname.startsWith("mitra.lundry.id") ||
        hostname.startsWith("dev.mitra.lundry.id");

      const isCustomer =
        mockHost === "customer" ||
        hostname.startsWith("customer.localhost") ||
        hostname.startsWith("customer.lundry.id") ||
        hostname.startsWith("dev.customer.lundry.id");

        const currentPath = window.location.pathname;
        if (isApp && currentPath !== "/app") {
          setIsSubdomainRedirecting(true);
          router.replace("/app");
        } else if (isMitra && currentPath !== "/mitra") {
          setIsSubdomainRedirecting(true);
          router.replace("/mitra");
        } else if (isCustomer && currentPath !== "/customer") {
          setIsSubdomainRedirecting(true);
          router.replace("/customer");
        } else {
          setIsSubdomainRedirecting(false);
        }
    }
  }, [router]);

  if (isSubdomainRedirecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="h-10 w-10 border-4 border-[#4DA8FF] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
          Menghubungkan ke LUNDRY.id Gateway...
        </p>
      </div>
    );
  }

  const handleOpenWaitlist = () => {
    setIsWaitlistModalOpen(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar onOpenWaitlist={handleOpenWaitlist} />
      <Hero onOpenWaitlist={handleOpenWaitlist} />
      <Waitlist onOpenWaitlist={handleOpenWaitlist} />
      <PublicTracker />
      <Services />
      <Products />
      <Pricing />
      <HowItWorks />
      <TrustBadges />
      <ServiceAreas />
      <Partnership />
      <FAQ />
      <Footer />
      <WaitlistModal isOpen={isWaitlistModalOpen} onClose={() => setIsWaitlistModalOpen(false)} />
    </main>
  );
}
