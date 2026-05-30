import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "next-themes";

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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

