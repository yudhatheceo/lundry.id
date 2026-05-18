import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { QueryProvider } from "@/components/providers/QueryProvider";

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
  title: "Laundry Express Jember | LUNDRY.id",
  description: "LUNDRY.id Laundry Express 3 Jam Selesai di Jember. Standar Bintang 5, harga mahasiswa.",
  openGraph: {
    title: "Laundry Express Jember | LUNDRY.id",
    description: "LUNDRY.id Laundry Express 3 Jam Selesai di Jember. Standar Bintang 5, harga mahasiswa.",
    images: ["/logo.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUNDRY.id | Laundry Express Jember",
    description: "LUNDRY.id Laundry Express 3 Jam Selesai di Jember. Standar Bintang 5, harga mahasiswa.",
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
        <QueryProvider>
          {children}
        </QueryProvider>
        <WhatsAppFloat />
      </body>
    </html>
  );
}
