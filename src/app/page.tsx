export const runtime = "edge";

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
