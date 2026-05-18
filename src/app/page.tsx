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

export default function Home() {
  const router = useRouter();
  const [isSubdomainRedirecting, setIsSubdomainRedirecting] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const searchParams = new URLSearchParams(window.location.search);
      const mockHost = searchParams.get("mock_host");

      // Check for App Subdomain
      const isApp = 
        mockHost === "app" ||
        hostname.startsWith("app.localhost") || 
        hostname.startsWith("app.lundry.id") || 
        hostname.startsWith("dev.app.lundry.id");

      // Check for Mitra Subdomain
      const isMitra = 
        mockHost === "mitra" ||
        hostname.startsWith("mitra.localhost") || 
        hostname.startsWith("mitra.lundry.id") || 
        hostname.startsWith("dev.mitra.lundry.id");

      if (isApp) {
        router.replace("/app");
      } else if (isMitra) {
        router.replace("/mitra");
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

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Waitlist />
      <Services />
      <Products />
      <Pricing />
      <HowItWorks />
      <TrustBadges />
      <ServiceAreas />
      <Partnership />
      <FAQ />
      <Footer />
    </main>
  );
}
