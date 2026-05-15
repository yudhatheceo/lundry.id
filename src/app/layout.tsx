import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUNDRY.id — Cuci & Setrika Tanpa Ribet",
  description: "Regular, Express, dan 3 Jam Kilat. Pickup & antar tersedia langsung dari HP kamu. Drop. Wash. Done.",
  openGraph: {
    title: "LUNDRY.id — Cuci & Setrika Tanpa Ribet",
    description: "Layanan laundry modern Jember, Surabaya, Malang. Pickup & Antar langsung dari HP.",
    images: ["/logo.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUNDRY.id — Cuci & Setrika Tanpa Ribet",
    description: "Layanan laundry modern Jember, Surabaya, Malang.",
    images: ["/logo.jpg"],
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
      <body className="min-h-full flex flex-col font-inter">{children}</body>
    </html>
  );
}
