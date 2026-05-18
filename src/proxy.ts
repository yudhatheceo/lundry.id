import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Ambil host dari header
  let hostname = req.headers.get("host") || "";

  // Trik Mocking Subdomain untuk Pengujian di HP/Lokal via Query String (?mock_host=app)
  const mockHostParam = req.nextUrl.searchParams.get("mock_host");
  if (mockHostParam === "app") {
    hostname = "app.lundry.id";
  } else if (mockHostParam === "mitra") {
    hostname = "mitra.lundry.id";
  }

  // Definisikan rute subdomain
  const isAppSubdomain = 
    hostname.startsWith("app.localhost") || 
    hostname.startsWith("app.lundry.id") || 
    hostname.startsWith("dev.app.lundry.id");
    
  const isMitraSubdomain = 
    hostname.startsWith("mitra.localhost") || 
    hostname.startsWith("mitra.lundry.id") || 
    hostname.startsWith("dev.mitra.lundry.id");

  // 1. Routing untuk app.lundry.id
  if (isAppSubdomain) {
    url.pathname = `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Routing untuk mitra.lundry.id
  if (isMitraSubdomain) {
    url.pathname = `/mitra${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. Routing default (Landing Page)
  // Tidak di-rewrite, langsung menuju ke root /
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali yang berawalan dengan:
     * - api (API routes backend)
     * - _next/static (static files Next)
     * - _next/image (image optimization files Next)
     * - favicon.ico (favicon file)
     * - logo.webp, hero.webp, dll (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.webp|hero.webp|assets|.*\\..*).*)",
  ],
};
