# LUNDRY.id — Modern Laundry Ecosystem 🧺✨

LUNDRY.id adalah gerbang utama menuju ekosistem laundry modern yang dirancang khusus untuk kenyamanan pelanggan dan efisiensi merchant. Project ini mencakup **Landing Page** untuk pemasaran dan **POS & ERP Gateway** terintegrasi penuh untuk operasional.

Built with ❤️ by **The Beacon Team** — Bagian dari **PT NAWASENA ADIKARYA PRATAMA**.

---

## 🚀 Status Saat Ini: V1.5.0 (Integrasi Webhook WhatsApp & n8n)
Sistem telah melalui fase iterasi yang agresif. Saat ini LUNDRY.id tidak hanya melayani sebagai landing page untuk ekspansi pasar di Jember, melainkan telah memiliki *core-engine* POS & ERP yang tangguh dengan rilis terbaru v1.5.0.

### 🔥 Fitur Unggulan Terkini (ERP & POS Gateway - v1.5.0 Overhaul):
- **Autentikasi Multi-Step Login OTP:** Implementasi transisi visual yang halus pada halaman login Next.js ke input kode verifikasi OTP WhatsApp 6-digit ketika terdeteksi akun memerlukan autentikasi ganda. Dilengkapi countdown timer 60 detik untuk pencegahan spam permintaan ulang OTP.
- **Pengaturan Webhook & Toggle OTP:** Opsi kontrol visual di halaman Settings dashboard Owner untuk mengaktifkan/menonaktifkan fitur login OTP secara global serta memasukkan URL webhook n8n/GoWA dinamis.
- **Dashboard Manajemen Mesin:** Antarmuka pemantauan *real-time* status seluruh mesin (beroperasi, rusak, perawatan) yang dilengkapi fitur pendaftaran modul IoT (ESP32) menggunakan `device_id` tanpa menimpa nomor seri bawaan pabrik.
- **Pencatatan Putaran & Servis:** Modul input siklus putaran mesin secara masal (*batch input*) pada akhir shift, dan *logbook* historis jadwal pemeliharaan (servis berkala) per mesin.
- **Desain UI/UX Kasir Tegas & Solid:** Transformasi antarmuka POS dengan batasan radius melengkung maksimal 8px, *segmented controls* langsung tanpa *modal pop-up*, dan tampilan yang lebih kaku, elegan, serta responsif.
- **Timbangan Kiloan Mutlak (Integer Only):** Pencatatan estimasi berat dan kuantitas order tak lagi memproses angka desimal (0.5 Kg) maupun melakukan otomatisasi pembulatan *server-side*. Pembulatan harga mutlak diatur secara manual oleh Kasir lewat komponen *Stepper* Kiloan.
- **Minimum Charge 4 Kg Otomatis:** Perhitungan *sub-total* layanan kiloan di panel Rincian Transaksi secara otomatis menjamin tagihan minimal terhitung 4 Kg, disertai notifikasi visual transparan bila *real weight* di bawah standar minimum, tanpa mengorbankan akurasi pelacakan berat aktual beban mesin.
- **Dashboard Validasi Produksi:** Implementasi QR Scanner terpadu untuk tim produksi. Sistem validasi bag otomatis melalui tahapan status (Received -> Washing -> Drying -> Ironing -> Packing -> Ready) tanpa celah terlewat, dan mewajibkan *mismatch flag* serta alasan apabila Pcs aktual berbeda dari estimasi kasir.
- **Manajemen Order & Tracking Pcs:** Pencatatan detail Pcs dan pembagian load (Balanced Split Bag algoritma) di Kasir untuk menyeimbangkan kapasitas mesin dan tracking per customer.
- **Two-Faced Receipts & Modal Cetak Pintar:** Halaman Cetak Struk Transaksi dan Produksi yang terpisah (Tanpa label harga di nota produksi) yang bisa dicetak otomatis via modal popup kasir/order list tanpa merusak layout.
- **Auth Foundation & RBAC:** Sistem *Role-Based Access Control* dengan *middleware* ketat untuk melindungi *dashboard* operasional (Owner, Manager, Kasir, Kurir).
- **POS Kasir Tablet-First:** Layar kasir yang responsif dan sangat dioptimalkan untuk perangkat tablet (layar sentuh). Memiliki fitur pencarian pelanggan instan, multi-cart layanan, dan dukungan diskon otomatis.
- **Order Tracking & Thermal Print:** Halaman khusus `Daftar Order` dan `Detail Order` yang mendukung tracking resi (QR Bags) dan mode cetak struk Thermal Printer Kasir 80mm.
- **Customer Management:** Sistem penyimpanan data pelanggan terpusat yang melacak poin *L-Coins*, *Prepaid Balance* (Deposit), dan riwayat *membership tier*.
- **Staff Management:** Panel khusus pemilik bisnis (Owner/Manager) untuk mendaftarkan akun kasir & kurir, serta mengatur izin akses login sistem.
- **Dashboard Real-time:** *Live stats* untuk melacak Omzet Hari ini, Cucian Diproses, dan utilitas Mesin Cuci aktif.
- **Theme Support & Clean Branding:** Integrasi `next-themes` untuk transisi tema yang halus, pembersihan seluruh boilerplate Next.js/Tailwind, dan penggunaan aset resmi `/logo-small.png` di seluruh ekosistem aplikasi.

### 🌐 Fitur Front-Facing (Landing Page):
- **Early Access Waitlist & Pre-Launch Promo** untuk Jember area.
- **Service Specialization:** Kiloan, Satuan, Paket Mahasiswa/Keluarga.
- **B2B Partnership & Mitra Drop-Point**.

---

## 🛠️ Stack Teknologi (Cutting-Edge)
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Theme Manager:** [Next-Themes](https://github.com/pacocoursey/next-themes) (Dark/Light mode support)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (Persisted Auth & POS Cart)
- **Data Fetching:** Axios + React Query (Optional)
- **Date Utility:** Day.js (Lokal Bahasa Indonesia `id`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **UI Base:** [Shadcn/UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📈 Roadmap Pengembangan

### ✅ Fase 1 (Selesai)
- Launching Landing Page & Pengumpulan Database Waitlist.
- Setup arsitektur POS Kasir & ERP Gateway.

### ✅ Fase 2 (Selesai)
- **Sistem POS Terintegrasi:** Layout UI Checkout, Print Struk, dan Manajemen Cart.
- **Manajemen Modul Utama:** Halaman UI Pelanggan, Staf, Order List, dan Dashboard.
*(Catatan: Fitur UI Fase 2 selesai dalam mode Staging/Demo Mock).*

### ✅ Fase 3 (On Going - Current State)
- **Integrasi API End-to-End (FE ⇄ BE):** Proses menghubungkan seluruh halaman UI Staging Fase 2 dengan API Gateway Laravel secara real (menghapus mock fallback saat online).
- **Dark/Light Mode Toggle (Terisolasi):** Opsi preferensi tema menggunakan `next-themes` diimplementasikan secara terisolasi hanya pada rute POS Kasir & Dashboard (`/app`) dan Portal Mitra (`/mitra`) untuk menjaga estetika landing page publik tetap *light mode* bawaan dan mencegah kebocoran tema (*theme leakage*).
- **Resolusi Hydration Mismatch:** Penambahan `suppressHydrationWarning` pada tag HTML root untuk mencegah peringatan tidak cocok (*mismatch error*) saat React melakukan hidrasi atribut tema dinamis di sisi klien.
- **Restorasi Landing Page:** Pengembalian logo utama (`/logo.webp`) pada Navbar publik dan penghapusan tombol WhatsApp melayang (`WhatsAppFloat`) agar tata letak berfokus pada CTA formulir waitlist interaktif.
- **Database Waitlist Terproteksi:** Penyimpanan data waitlist ke database yang dilengkapi dengan integrasi Cloudflare Turnstile (Anti-Bot) untuk mencegah spam.
- **Optimasi UI/UX Waitlist & CTA Landing Page:** Penyempurnaan tombol aksi (CTA) interaktif di Landing Page utama untuk pendaftaran antrean (Waitlist), di mana form pengisian akan muncul secara otomatis dalam bentuk modal pop-up yang estetik saat tombol ditekan.
- **Modul Jasa Layanan:** Manajemen dinamis layanan laundry yang dapat diatur dari dashboard. Terintegrasi penuh dengan POS Kasir, ERP, dan otomatis tampil pada landing page.
- **Perbaikan UI/UX Tablet-First & Pembersihan Boilerplate:** Menghapus sisa logo bawaan (Next.js & Tailwind CSS) pada Dashboard, ERP & POS Kasir, dan menggantinya dengan `logo-small.png` dari *asset* resmi. Penyesuaian ukuran *font*, spasi, serta elemen blok agar antarmuka POS Kasir muat sempurna dalam satu layar tablet.


### ⏳ Fase 4 (Core Business Expansion & Mitra)
- **Mitra Portal (Drop Point):** Sistem POS khusus yang disederhanakan untuk Mitra Drop Point LUNDRY.id.
- **Modul Financial & Report:** Laporan keuangan komprehensif, pencatatan arus kas, dan analisis omzet.
- **Modul Inventory:** Pelacakan stok bahan baku (chemical/deterjen) dan operasional outlet.
- **Customer Portal:** Sistem pelacakan cucian mandiri (Tracking) bagi pelanggan yang dapat diakses langsung dari landing page.
- **Staff Portal:** Sistem manajemen operasional staf (shift, absensi, dan KPI).

### ⏳ Fase 5 (Advanced Ecosystem & CRM)
- **Modul Membership & Points:** Otomatisasi program loyalitas, *tiering* (Bronze, Silver, Gold), dan penukaran *L-Coins*.
- **Modul Logistic:** Manajemen armada antar-jemput dari Mitra Drop Point ke Pusat Pemrosesan.
- **Modul Delivery:** Sistem penugasan kurir pelanggan untuk *pickup & delivery*.
- **Modul Marketing:** Broadcast promo otomatis, integrasi WhatsApp API, dan manajemen voucher diskon.

---

## ☁️ Deployment Guide (Cloudflare Pages)
Project LUNDRY.id dibangun untuk berjalan secara *ultra-fast* di jaringan CDN Global Cloudflare.

- **Build Command:** `npx @cloudflare/next-on-pages@latest`
- **Build Output Directory:** `.vercel/output/static`
- **Compatibility Flags:** `nodejs_compat` (Wajib diaktifkan)

---

## 💻 Cara Menjalankan Project Secara Lokal
1. **Clone & Install Dependencies:** 
   ```bash
   npm install
   ```
2. **Development Server:** 
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.
3. **Staging / Production Build Test:** 
   ```bash
   npm run build
   ```

---

## 📄 Lisensi & Hak Cipta
Project ini dikembangkan secara eksklusif oleh **The Beacon** untuk **LUNDRY.id**. Seluruh aset desain dan kode dilindungi oleh hak cipta di bawah **PT NAWASENA ADIKARYA PRATAMA**.

---
*Elevating the laundry experience to the next level.* 🚀🏆