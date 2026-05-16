import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lundry.id'),
  title: "LUNDRY.id — Cuci & Setrika Tanpa Ribet",
  description: "Layanan laundry modern di Jember dengan standar kualitas hotel. Regular, Express, dan 3 Jam Kilat. Pickup & antar tersedia langsung dari HP kamu.",
  openGraph: {
    title: "LUNDRY.id — Cuci & Setrika Tanpa Ribet",
    description: "Layanan laundry modern di Jember. Standar hotel, parfum premium, & pickup terjadwal.",
    images: ["/logo.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUNDRY.id — Cuci & Setrika Tanpa Ribet",
    description: "Layanan laundry modern Jember. Standar hotel, parfum premium, & pickup terjadwal.",
    images: ["/logo.webp"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
