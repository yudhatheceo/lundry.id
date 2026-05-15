import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Pricing } from "@/components/sections/Pricing";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { Testimonials } from "@/components/sections/Testimonials";
import { ServiceAreas } from "@/components/sections/ServiceAreas";
import { Partnership } from "@/components/sections/Partnership";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Pricing />
      <HowItWorks />
      <TrustBadges />
      <Testimonials />
      <ServiceAreas />
      <Partnership />
      <FAQ />
      <Footer />
    </main>
  );
}
