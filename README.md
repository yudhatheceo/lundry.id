# LUNDRY.id - Modern Laundry Ecosystem

LUNDRY.id adalah landing page premium yang dirancang untuk menjadi gerbang utama ekosistem layanan laundry modern. Project ini dibangun dengan fokus pada konversi tinggi, kecepatan akses, dan desain mobile-first yang intuitif.

## 🚀 Fitur & Fungsi Saat Ini

### 1. High-Conversion Hero Section
- **Dynamic Pricing Cards:** Menampilkan harga layanan utama (Regular, Express, 3 Jam) langsung di fold pertama.
- **Trust Indicators:** Badge "Terjamin Higienis" dan metrik kepuasan pelanggan untuk membangun kredibilitas instan.
- **Smart CTA:** Tombol pemesanan yang terintegrasi dengan alur WhatsApp.

### 2. Modular Services & Pricing
- **Interactive Tabs:** Filter harga berdasarkan kategori (Kiloan, Satuan, dll) menggunakan Shadcn/UI Tabs.
- **Responsive Grid:** Layout yang menyesuaikan diri dari mobile (horizontal swipe) ke desktop (multi-column grid).

### 3. Trust & Social Proof
- **Testimonials Carousel:** Ulasan pelanggan asli dengan visual rating.
- **Local SEO Section:** Daftar area layanan dan cabang yang dioptimasi untuk mesin pencari (Jember, Surabaya, Malang, dsb).
- **Partnership Portal:** Informasi mengenai kemitraan Franchise, Drop Outlet, dan B2B.

### 4. Technical Excellence
- **Mobile-First UX:** Hamburger menu yang solid dan navigasi yang dioptimasi untuk jempol pengguna HP.
- **Next.js Image Optimization:** Semua aset menggunakan Next.js Image API untuk performa loading secepat kilat (WebP format, lazy loading).
- **Framer Motion Animations:** Transisi antar section yang smooth dan interaktif.

## 🛠️ Stack Teknologi

- **Frontend Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/) (Next generation Base UI components)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment Ready:** Cloudflare Pages/Workers optimized.

---

## 📈 Roadmap Pengembangan (Ke Arah POS & ERP)

Project ini dirancang sebagai pondasi awal. Berikut adalah arah pengembangan selanjutnya untuk menjadikannya sistem manajemen laundry yang utuh:

### Fase 1: Customer Portal & Order Tracking (Mini POS)
- **Authentication:** Sistem login pelanggan menggunakan nomor WhatsApp/OTP.
- **Order Tracking:** Fitur bagi pelanggan untuk melihat status cucian mereka secara real-time (Wash > Dry > Fold > Ready).
- **History:** Dashboard riwayat transaksi pelanggan.

### Fase 2: Merchant POS (Point of Sale)
- **Admin Dashboard:** Interface khusus staf outlet untuk input transaksi.
- **QR Code Billing:** Integrasi pencetakan nota/struk via thermal printer atau WhatsApp digital receipt.
- **Weight Integration:** Integrasi API dengan timbangan digital (IoT).
- **Payment Gateway:** Integrasi Midtrans/Xendit untuk pembayaran non-tunai (QRIS, VA).

### Fase 3: ERP (Enterprise Resource Planning)
- **Inventory Management:** Pelacakan stok chemical (deterjen, parfum) di setiap cabang.
- **Financial Reporting:** Laporan laba-rugi otomatis per outlet atau konsolidasi pusat.
- **HRM:** Manajemen absensi dan komisi kurir/staf produksi.
- **B2B Module:** Manajemen kontrak khusus untuk partner hotel/RS (Invoicing periodik).

---

## 💻 Cara Menjalankan Project Secara Lokal

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/username/lundry-id.git
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
4.  **Build for Production:**
    ```bash
    npm run build
    ```

## 📄 Lisensi
Project ini dikembangkan secara eksklusif oleh **The Beacon** untuk **LUNDRY.id**.

---
*Generated with ❤️ by Antigravity AI*
