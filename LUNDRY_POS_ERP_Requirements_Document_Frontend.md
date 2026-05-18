# LUNDRY.id — Software Requirements Document (SRD)
**Sistem ERP & POS Laundry Terintegrasi**
Version: 1.0.0 | Status: Draft | Tanggal: Mei 2026

---

## Daftar Isi

1. [Overview & Tujuan Sistem](#1-overview--tujuan-sistem)
2. [Arsitektur Teknis](#2-arsitektur-teknis)
3. [Domain & Integrasi lundry.id](#3-domain--integrasi-lundryid)
4. [Autentikasi & Keamanan](#4-autentikasi--keamanan)
5. [User Roles & Permission Matrix](#5-user-roles--permission-matrix)
6. [Modul 01 — POS Kasir](#6-modul-01--pos-kasir)
7. [Modul 02 — Dashboard ERP](#7-modul-02--dashboard-erp)
8. [Modul 03 — Manajemen Promosi](#8-modul-03--manajemen-promosi)
9. [Modul 04 — CRM & Manajemen Pelanggan](#9-modul-04--crm--manajemen-pelanggan)
10. [Modul 05 — QR Tracking per Bag](#10-modul-05--qr-tracking-per-bag)
11. [Modul 06 — Operasional & Manajemen Mesin](#11-modul-06--operasional--manajemen-mesin)
12. [Modul 07 — Antar-Jemput (Pickup & Delivery)](#12-modul-07--antar-jemput-pickup--delivery)
13. [Modul 08 — Inventory & Purchasing](#13-modul-08--inventory--purchasing)
14. [Modul 09 — HRD: Absensi, Shift & Payroll](#14-modul-09--hrd-absensi-shift--payroll)
15. [Modul 10 — Ulasan & Rating](#15-modul-10--ulasan--rating)
16. [Modul 11 — Keuangan & Laporan Pajak](#16-modul-11--keuangan--laporan-pajak)
17. [Modul 12 — Mitra Drop Point](#17-modul-12--mitra-drop-point)
18. [Modul 13 — Coin LUNDRY (Poin & Afiliasi)](#18-modul-13--coin-lundry-poin--afiliasi)
19. [Modul 14 — n8n Automation Hub](#19-modul-14--n8n-automation-hub)
20. [Modul 15 — Admin & Konfigurasi Sistem](#20-modul-15--admin--konfigurasi-sistem)
21. [Modul 16 — Franchise Mode (Mockup)](#21-modul-16--franchise-mode-mockup)
22. [Database Schema Overview](#22-database-schema-overview)
23. [API Endpoint Overview](#23-api-endpoint-overview)
24. [Non-Functional Requirements](#24-non-functional-requirements)
25. [Fase Pengembangan & Prioritas](#25-fase-pengembangan--prioritas)
26. [Glossary](#26-glossary)

---

## 1. Overview & Tujuan Sistem

### 1.1 Deskripsi Produk

LUNDRY.id adalah platform ERP (Enterprise Resource Planning) dan POS (Point of Sale) berbasis web yang dirancang khusus untuk bisnis laundry kiloan. Sistem ini mengelola seluruh operasional dari satu outlet yang dapat dikembangkan secara modular ke multi-outlet dan ekosistem mitra.

### 1.2 Tujuan Utama

- Mendigitalisasi seluruh alur operasional laundry dari order masuk hingga order selesai
- Menyediakan ekosistem mitra Drop Point yang terstruktur dan gamifikatif
- Membangun loyalitas pelanggan melalui sistem Coin LUNDRY dan referral
- Mengotomasi komunikasi dan notifikasi via WhatsApp menggunakan n8n
- Menyediakan data bisnis real-time untuk pengambilan keputusan owner

### 1.3 Scope Versi 1.0

- **Outlet:** 1 outlet utama (arsitektur siap multi-outlet)
- **Notifikasi:** WhatsApp saja
- **Bahasa:** Bahasa Indonesia
- **Timezone:** WIB (Asia/Jakarta)
- **Mata uang:** IDR (Rupiah)

---

## 2. Arsitektur Teknis

### 2.1 Stack Teknologi

| Layer | Teknologi |
|---|---|
| Frontend Admin & Mitra | Next.js 14+ (App Router) |
| Landing Page & Portal User | Next.js (sudah live di lundry.id) |
| Backend API | Laravel 11+ (REST API) |
| Database | MariaDB 10.11+ |
| Cache & Queue | Redis |
| Automation Engine | n8n (self-hosted) |
| WhatsApp Gateway | n8n WhatsApp node / WA Business API |
| Storage | S3-compatible (untuk QR, foto, laporan) |
| Print Server | ESCPOS / node-thermal-printer |

### 2.2 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                        LUNDRY.id                            │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Landing Page │    │  Admin Panel │    │  Mitra Panel  │  │
│  │  lundry.id   │    │  /dashboard  │    │  /mitra       │  │
│  │  (Next.js)   │    │  (Next.js)   │    │  (Next.js)    │  │
│  └──────┬───────┘    └──────┬───────┘    └───────┬───────┘  │
│         └──────────────────┼────────────────────┘           │
│                            │ REST API (HTTPS)                │
│                  ┌─────────▼─────────┐                      │
│                  │   Laravel API     │                       │
│                  │   (Backend)       │                       │
│                  └────┬────────┬─────┘                       │
│                       │        │                             │
│              ┌────────▼──┐  ┌──▼──────┐                     │
│              │  MariaDB  │  │  Redis  │                     │
│              └───────────┘  └─────────┘                     │
│                       │                                      │
│                  ┌────▼────┐                                 │
│                  │   n8n   │────► WhatsApp Business API      │
│                  └─────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Modularitas

Setiap modul dikembangkan sebagai fitur terpisah yang dapat diaktifkan/nonaktifkan via toggle di panel Admin. Modul tidak boleh saling bergantung secara hard-coded — komunikasi antar modul menggunakan Laravel Events/Listeners.

---

## 3. Domain & Integrasi lundry.id

### 3.1 Struktur Domain

| Subdomain | Fungsi | Teknologi |
|---|---|---|
| `lundry.id` | Landing page publik, portal user, registrasi mitra | Next.js (existing) |
| `app.lundry.id` | Dashboard admin, kasir, HRD, ERP | Next.js (baru) |
| `mitra.lundry.id` | Dashboard POS mitra Drop Point | Next.js (baru) |
| `api.lundry.id` | REST API backend | Laravel |
| `automation.lundry.id` | n8n instance | n8n |

### 3.2 Integrasi Landing Page (lundry.id)

Landing page yang sudah live harus dapat:

- **Registrasi Mitra Drop Point:** Form pendaftaran mitra tersedia di `lundry.id/daftar-mitra`, data dikirim ke `api.lundry.id/v1/mitra/register`
- **Tracking Order Publik:** Halaman `lundry.id/cek-order?kode=XXXX` memungkinkan pelanggan cek status tanpa login
- **Login Pelanggan (OTP WA):** Tombol "Cek Pesanan Saya" di landing page trigger OTP WA
- **Notifikasi Bell:** Setelah login, pelanggan melihat notifikasi bell (lampu hijau = ada update) di navbar landing page
- **Coin LUNDRY Display:** Saldo Coin LUNDRY pelanggan tampil di header portal setelah login
- **Referral Share:** Halaman `lundry.id/ref/[kode]` untuk pelanggan share kode referral

### 3.3 Shared Authentication

Landing page dan app admin menggunakan token JWT yang sama. Frontend landing page menyimpan token di `httpOnly cookie`. Validasi token dilakukan ke `api.lundry.id/v1/auth/verify`.

---

## 4. Autentikasi & Keamanan

### 4.1 Sistem Login OTP WhatsApp

Berlaku untuk: pelanggan, mitra Drop Point, karyawan non-admin.

**Alur:**
```
1. User masukkan nomor HP
2. Backend cek nomor HP di database
3. Generate OTP 6 digit, simpan di Redis (expire 5 menit)
4. Kirim OTP via n8n → WhatsApp
5. User masukkan OTP
6. Backend validasi → issue JWT token (expire 7 hari)
7. Refresh token otomatis jika aktif
```

**Business Rules:**
- Maksimal 3 kali request OTP per nomor per jam
- OTP salah maksimal 5 kali → nomor di-block 15 menit
- OTP hanya valid untuk 1 sesi (invalidated setelah digunakan)

### 4.2 Login Admin (Password + 2FA)

Berlaku untuk: Owner, Manajer.

**Alur:**
```
1. Email + Password
2. Jika berhasil → kirim kode 2FA via WhatsApp (6 digit)
3. Masukkan kode 2FA → issue JWT
4. Session expire 8 jam (dapat diperpanjang)
```

**Keamanan tambahan:**
- Rate limiting: 10 percobaan per IP per jam
- Audit log setiap login admin (IP, device, waktu)
- Force logout semua sesi dari panel admin
- Password harus memenuhi kriteria kuat (min. 8 karakter, angka, simbol)

### 4.3 Token & Sesi

| Role | Auth Method | Token Expire |
|---|---|---|
| Owner | Email + Password + 2FA WA | 8 jam |
| Manajer | Email + Password + 2FA WA | 8 jam |
| Kasir | OTP WA | 12 jam |
| Kurir | OTP WA | 12 jam |
| Karyawan | OTP WA | 12 jam |
| Mitra Drop Point | OTP WA | 7 hari |
| Pelanggan | OTP WA | 7 hari |

---

## 5. User Roles & Permission Matrix

### 5.1 Definisi Role

| Role | Deskripsi |
|---|---|
| **Owner** | Akses penuh ke seluruh sistem |
| **Manajer** | Akses operasional penuh, kecuali setting sistem & payroll owner |
| **Kasir** | POS, manajemen order, settlement Drop Point harian |
| **Karyawan** | Scan QR bag, update status proses, absensi |
| **Kurir** | Manajemen pickup/delivery, scan QR, update status |
| **Mitra Drop Point** | POS mitra terbatas, leaderboard, rekap komisi |
| **Pelanggan** | Portal pelanggan, cek order, Coin LUNDRY |

### 5.2 Permission Matrix

| Fitur | Owner | Manajer | Kasir | Karyawan | Kurir | Mitra | Pelanggan |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Buat order baru | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Lihat semua order | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| Void / refund order | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Input berat final | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Scan QR bag | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Dashboard ERP | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kelola promosi | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kelola karyawan | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Payroll | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Laporan keuangan | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kelola mitra DP | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settlement DP harian | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Leaderboard DP | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Coin LUNDRY admin | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tukar Coin LUNDRY | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Setting sistem | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit log | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

⚠️ = Terbatas (hanya data milik sendiri / view only)

---

## 6. Modul 01 — POS Kasir

### 6.1 Deskripsi

Antarmuka kasir untuk menerima dan memproses order dari pelanggan langsung (walk-in dan antar-jemput). Tersedia di `app.lundry.id/kasir`.

### 6.2 Fitur

#### Order Baru
- Input nama pelanggan atau cari via nomor HP
- Sistem otomatis load data pelanggan existing (nama, histori, Coin LUNDRY)
- Pilih jenis layanan (kiloan, satuan, express, dll — dikonfigurasi admin)
- Input berat estimasi (berat final diverifikasi setelah diterima)
- Catatan khusus per order (parfum pilihan, instruksi khusus, alergi)
- Pilih metode pengambilan: ambil sendiri / antar-jemput
- Jika antar-jemput: input alamat atau pilih dari histori, pilih slot pickup
- Pilih promo aktif (jika ada yang berlaku)
- Hitung total otomatis + preview Coin LUNDRY yang akan diperoleh

#### Pembayaran
- Metode pembayaran: Tunai, QRIS, Transfer Bank, Coin LUNDRY (sebagian/penuh), Prepaid Saldo
- Split payment (misal: sebagian tunai + sebagian Coin)
- Kalkulasi kembalian untuk pembayaran tunai
- Konfirmasi pembayaran → generate nomor order otomatis (`LND-YYYYMMDD-XXXX`)

#### Cetak & Nota Digital
- Cetak nota thermal 80mm otomatis setelah order dikonfirmasi
- Nota berisi: nomor order, nama pelanggan, layanan, berat estimasi, total, metode bayar, estimasi selesai, kode QR order
- Nota digital dikirim via WhatsApp ke pelanggan (opsional, toggle per transaksi)

#### Manajemen Order
- Daftar order hari ini dengan filter: status, metode pembayaran, jenis layanan
- Update status order: Diterima → Dalam Proses → Selesai → Siap Diambil → Selesai Diambil
- Void order (perlu approval Manajer/Owner)
- Refund: dicatat sebagai pengeluaran dengan kategori "Refund", dikembalikan ke metode pembayaran asal atau ke saldo prepaid pelanggan
- Riwayat transaksi dengan search dan filter

#### Verifikasi Berat Final
- Saat order dari Drop Point diterima di outlet, kasir input berat final
- Sistem hitung ulang total berdasarkan berat final
- Jika ada selisih: sistem tampilkan notifikasi, kasir konfirmasi
- Jika berat final > estimasi DP: kirim notifikasi WA ke pelanggan untuk konfirmasi selisih bayar

### 6.3 Business Rules

- Satu sesi kasir terikat ke satu akun — tidak bisa login ganda
- Void hanya bisa dilakukan dalam hari yang sama (H+0), setelah itu butuh approval Owner
- Order tidak bisa dihapus, hanya bisa void (audit trail)
- Berat minimum order: dikonfigurasi admin (default: 1 kg)
- Estimasi selesai dihitung otomatis berdasarkan kapasitas mesin aktif dan antrian

### 6.4 Integrasi

- → Modul QR Tracking: generate label QR saat order dibuat
- → Modul Coin LUNDRY: tambah poin setelah pembayaran dikonfirmasi
- → Modul Promosi: apply promo aktif
- → n8n: trigger notifikasi WA konfirmasi order ke pelanggan

---

## 7. Modul 02 — Dashboard ERP

### 7.1 Deskripsi

Pusat informasi bisnis real-time untuk Owner dan Manajer. Tersedia di `app.lundry.id/dashboard`.

### 7.2 Sub-Dashboard

#### Operational Dashboard (Real-time)
- Total order hari ini (jumlah & nilai)
- Order per status saat ini (pie chart)
- Antrian per mesin (berapa order sedang di mesin X)
- Estimasi selesai order yang sedang berjalan
- Order pickup hari ini (jadwal pagi & sore)
- Karyawan yang sedang aktif/absen hari ini

#### Financial Dashboard
- Omzet hari ini / minggu ini / bulan ini (vs periode sebelumnya)
- Revenue breakdown per jenis layanan
- Metode pembayaran breakdown (tunai, QRIS, transfer, Coin, prepaid)
- Pengeluaran operasional hari ini
- Laba kotor estimasi
- Grafik tren harian (30 hari terakhir)
- Total outstanding saldo prepaid pelanggan

#### Inventory Dashboard
- Stok bahan habis pakai dengan indikator level (aman/peringatan/kritis)
- Alert item yang perlu reorder
- Pengeluaran bahan bulan ini

#### Performance Dashboard
- Produktivitas karyawan: jumlah order ditangani per karyawan
- Average waktu proses per jenis layanan
- Rating rata-rata dari ulasan pelanggan
- Order return rate (pelanggan kembali)
- Top pelanggan bulan ini (by volume)
- Performa Drop Point (ranking mini, bisa klik untuk detail)

#### Growth Dashboard
- Total pelanggan aktif vs baru vs tidak aktif
- Pertumbuhan pelanggan per bulan (grafik)
- Performa program referral: total referral aktif, Coin LUNDRY yang dibagikan
- Total Coin LUNDRY beredar vs sudah ditukarkan

### 7.3 Fitur Umum Dashboard

- Semua widget bisa di-refresh manual atau auto-refresh setiap 60 detik
- Export laporan ke PDF dan Excel untuk semua section
- Filter periode: hari ini, minggu ini, bulan ini, custom range
- Dark mode support

---

## 8. Modul 03 — Manajemen Promosi

### 8.1 Deskripsi

Sistem promosi fleksibel dengan penjadwalan otomatis, berbagai tipe promo, dan kuota. Tersedia di `app.lundry.id/promosi`.

### 8.2 Tipe Promosi

| Tipe | Deskripsi | Contoh |
|---|---|---|
| Diskon Flat | Potongan nominal tetap | Diskon Rp5.000 semua order |
| Diskon Persentase | Potongan persen dari total | Diskon 20% |
| Happy Hour | Diskon aktif di jam tertentu | Senin-Jumat 08:00-10:00 diskon 15% |
| Member Price | Harga khusus per tier pelanggan | Silver: -10%, Gold: -15% |
| Bundle | Paket layanan dengan harga khusus | Cuci+Setrika+Lipat = Rp35.000 |
| Voucher Kode | Kode unik untuk kampanye tertentu | Kode: MAHASISWA10 |
| Cashback Coin | Order dapat Coin LUNDRY extra | 2x Coin setiap Selasa |
| Flash Sale | Promo dengan countdown & kuota terbatas | 50 slot diskon 30% hari ini |
| Promo Otomatis | Trigger berbasis event (ulang tahun, dll) | Voucher ulang tahun otomatis |
| Buy X Get Y | Beli sekian dapat bonus | Cuci 5kg gratis setrika 1kg |
| Referral Bonus | Bonus bagi referrer dan new customer | New customer -15%, referrer +50 Coin |

### 8.3 Penjadwalan Promosi

Setiap promo memiliki konfigurasi:
- **Tanggal aktif:** start date dan end date
- **Jam aktif:** jam mulai dan jam berakhir (untuk Happy Hour)
- **Hari aktif:** checkbox hari (Senin, Selasa, ..., Minggu)
- **Kuota maksimal:** jumlah penggunaan (total atau per pelanggan)
- **Auto-stop:** otomatis nonaktif jika kuota habis atau tanggal lewat
- **Status:** Draft, Aktif, Dijadwalkan, Selesai, Nonaktif

### 8.4 Aturan Kombinasi Promo

- Konfigurasi: boleh stackable atau tidak (per promo)
- Jika tidak stackable: sistem terapkan promo dengan nilai terbesar untuk pelanggan
- Voucher kode selalu bisa dikombinasikan dengan promo otomatis (kecuali dikunci)
- Promo member price tidak bisa dikombinasikan dengan Flash Sale

### 8.5 Fitur Tambahan

- Preview simulasi: "Jika promo ini aktif, berapa order yang terdampak hari ini?"
- Duplikasi promo untuk kampanye berulang
- Riwayat penggunaan promo (siapa pakai, kapan, nilai diskon)
- ROI tracking: total diskon diberi vs omzet tambahan yang dihasilkan

### 8.6 Integrasi dengan n8n

Promo dapat di-broadcast via WA ke segmen pelanggan tertentu menggunakan n8n (dibahas di Modul 14).

---

## 9. Modul 04 — CRM & Manajemen Pelanggan

### 9.1 Deskripsi

Database terpusat pelanggan dengan segmentasi otomatis, riwayat order, dan manajemen loyalitas.

### 9.2 Data Pelanggan

- Nama lengkap, nomor HP (primary key unik), alamat
- Catatan preferensi: parfum favorit, instruksi cuci, alergi bahan
- Tier membership: Regular, Silver, Gold, Platinum (dihitung otomatis berdasarkan total spend)
- Saldo prepaid
- Total Coin LUNDRY (aktif & expired)
- Kode referral unik
- Jumlah referral sukses
- Asal registrasi: walk-in, Drop Point, referral, landing page

### 9.3 Segmentasi Otomatis

| Segmen | Kriteria |
|---|---|
| Pelanggan Baru | Order pertama dalam 7 hari terakhir |
| Pelanggan Reguler | Order dalam 30 hari terakhir |
| Pelanggan VIP | Total spend > threshold yang dikonfigurasi admin |
| Tidak Aktif | Tidak ada order >30 hari |
| Risiko Churn | Tidak ada order >60 hari |

### 9.4 Tier Membership

| Tier | Syarat Akumulasi Total Spend | Benefit |
|---|---|---|
| Regular | < Rp200.000 | Harga normal |
| Silver | Rp200.000 – Rp500.000 | Diskon 5%, 1.2x Coin |
| Gold | Rp500.000 – Rp1.500.000 | Diskon 10%, 1.5x Coin |
| Platinum | > Rp1.500.000 | Diskon 15%, 2x Coin, priority service |

> Catatan: Threshold tier dapat dikonfigurasi oleh Owner.

### 9.5 Fitur

- Pencarian pelanggan by nama, HP, atau nomor order
- Riwayat order lengkap per pelanggan
- Timeline interaksi (kapan terakhir order, notifikasi yang dikirim)
- Manual tag pelanggan (VIP, blacklist, dll)
- Top-up saldo prepaid pelanggan oleh kasir
- Lihat pohon referral pelanggan (siapa yang dia ajak, siapa yang mengajak dia)
- Export data pelanggan ke CSV

---

## 10. Modul 05 — QR Tracking per Bag

### 10.1 Deskripsi

Setiap order mendapatkan label QR unik yang ditempel di plastik laundry. Karyawan wajib scan setiap pergantian status menggunakan HP. Sistem ini memastikan akuntabilitas dan transparansi setiap tahap proses.

### 10.2 Alur Scan

```
[Order Dibuat] → QR digenerate → Cetak label QR
      ↓
[DP / Kasir Terima] → Scan QR → Status: "Diterima di Outlet"
      ↓
[Karyawan Proses Cuci] → Scan QR → Status: "Sedang Dicuci"
      ↓
[Karyawan Proses Kering] → Scan QR → Status: "Sedang Dikeringkan"
      ↓
[Karyawan Proses Setrika/Lipat] → Scan QR → Status: "Sedang Disetrika"
      ↓
[Quality Check] → Scan QR + centang checklist → Status: "QC Selesai"
      ↓
[Siap Diambil/Dikirim] → Scan QR → Status: "Menunggu Pickup/Delivery"
      ↓
[Kurir/Pelanggan Ambil] → Scan QR → Status: "Selesai"
```

### 10.3 Label QR

- Ukuran: 5×5 cm (print thermal atau stiker)
- Berisi: QR code, nomor order, nama pelanggan (3 karakter pertama), tanggal
- Generate otomatis saat order dibuat
- Bisa reprint label dari dashboard kasir

### 10.4 Scan via HP Karyawan

- Karyawan akses `app.lundry.id/scan` dari browser HP (PWA)
- Kamera HP langsung aktif untuk scan QR
- Setelah scan: tampil info order + tombol konfirmasi status
- Tidak perlu app download — cukup browser

### 10.5 Quality Control Checklist

Sebelum status "QC Selesai" dikonfirmasi, karyawan harus centang:
- [ ] Tidak ada pakaian yang tertinggal
- [ ] Jumlah item sesuai catatan
- [ ] Kondisi bersih dan kering sempurna
- [ ] Dilipat/dikemas dengan baik
- [ ] Label nama pelanggan sudah terpasang

### 10.6 Wanprestasi Drop Point

Jika scan oleh Drop Point tidak sesuai (estimasi berat berbeda jauh, order tidak lengkap, dll):
- Admin/kasir dapat flag wanprestasi di sistem
- Coin komisi Drop Point dikurangi secara otomatis sesuai konfigurasi penalty
- History wanprestasi dicatat di profil mitra Drop Point
- 3 kali wanprestasi dalam 1 bulan → notifikasi warning otomatis ke admin

### 10.7 Pelacakan Publik

Pelanggan bisa cek status di `lundry.id/cek-order?kode=LND-YYYYMMDD-XXXX` tanpa login — tampil status terkini dan estimasi selesai.

---

## 11. Modul 06 — Operasional & Manajemen Mesin

### 11.1 Deskripsi

Manajemen kapasitas mesin laundry untuk kalkulasi antrian dan estimasi selesai yang akurat.

### 11.2 Data Mesin

- Nama mesin, jenis (cuci/pengering/setrika)
- Kapasitas (kg)
- Status: Aktif, Penuh, Maintenance, Nonaktif
- Durasi siklus rata-rata (menit)
- Jadwal maintenance berkala

### 11.3 Fitur

- Dashboard kapasitas mesin real-time
- Auto-assign order ke mesin berdasarkan kapasitas dan antrian
- Kalkulasi estimasi selesai otomatis
- Catat kerusakan/maintenance dengan tanggal dan keterangan
- Alert jika mesin jadwal maintenance dalam 3 hari ke depan
- Riwayat penggunaan mesin

---

## 12. Modul 07 — Antar-Jemput (Pickup & Delivery)

### 12.1 Deskripsi

Layanan antar-jemput gratis untuk pelanggan langsung (bukan Drop Point). Kurir intern fokus hanya ke pelanggan direct.

### 12.2 Slot Pickup

| Slot | Jam |
|---|---|
| Pagi | 08:00 – 10:00 |
| Sore | 15:00 – 17:00 |

Pickup dan delivery dilakukan bersamaan dalam satu kunjungan: kurir datang ambil pakaian kotor, sekaligus antar pakaian yang sudah selesai (jika ada).

### 12.3 Alur

```
1. Pelanggan request pickup via kasir / WA bot
2. Pilih slot (pagi/sore) dan tanggal
3. Konfirmasi alamat
4. Admin/kurir lihat daftar pickup hari ini
5. Kurir assign ke dirinya sendiri
6. Kurir berangkat → scan QR saat tiba di lokasi pelanggan
7. Ambil cucian kotor → buat order baru (atau link ke order existing)
8. Antar cucian selesai (jika ada) → scan QR selesai delivery
9. Notifikasi WA otomatis ke pelanggan di setiap tahap
```

### 12.4 Fitur Kurir

- Dashboard `app.lundry.id/kurir` (mobile-friendly)
- Daftar pickup & delivery hari ini
- Navigasi (link ke Google Maps per alamat)
- Scan QR untuk update status
- Catatan per pengantaran (tidak ada orang di rumah, dll)

### 12.5 Business Rules

- Layanan pickup gratis dalam radius yang dikonfigurasi admin
- Pelanggan di luar radius: notifikasi tidak tersedia / biaya tambahan
- Pembatalan pickup harus minimal 1 jam sebelum slot
- Jika tidak ada orang di rumah: kurir catat, reschedule otomatis ditawarkan via WA

---

## 13. Modul 08 — Inventory & Purchasing

### 13.1 Fitur Inventory

- Daftar bahan habis pakai: deterjen, pewangi, plastik, hanger, dll
- Stok saat ini, satuan, minimum stok, harga beli
- Mutasi stok: masuk (pembelian) dan keluar (pemakaian harian)
- Alert otomatis jika stok < minimum
- Laporan pemakaian bahan per bulan

### 13.2 Fitur Purchasing

- Daftar supplier dengan kontak
- Purchase Order (PO): buat, kirim (via WA/email), terima barang
- Riwayat pembelian per supplier
- Harga rata-rata beli per item (untuk kalkulasi HPP)

### 13.3 Aset & Maintenance

- Daftar aset: mesin cuci, pengering, setrika, dll
- Jadwal servis berkala per aset
- Catat biaya servis/perbaikan
- Alert jika jadwal servis sudah lewat

---

## 14. Modul 09 — HRD: Absensi, Shift & Payroll

### 14.1 Absensi

- Clock-in/out via QR code statis (ditempel di outlet) atau PIN 6 digit
- Karyawan scan dari HP mereka → `app.lundry.id/absen`
- Rekap absensi: hadir, terlambat, izin, sakit, alpa
- Batas toleransi keterlambatan dikonfigurasi admin (default: 15 menit)
- Laporan absensi bulanan per karyawan

### 14.2 Manajemen Shift

- Buat jadwal shift per karyawan (drag-and-drop interface)
- Shift types: Pagi, Siang, Sore (jam dikonfigurasi admin)
- Swap shift antar karyawan (perlu approval manajer)
- Kalender shift bulanan

### 14.3 Payroll

**Komponen gaji:**
- Gaji pokok (per bulan atau per hari)
- Tunjangan tetap (transport, makan, dll)
- Uang lembur: kalkulasi otomatis berdasarkan jam lebih dari shift
- Bonus performa: input manual oleh manajer
- Potongan keterlambatan: sesuai konfigurasi (misal: Rp5.000/terlambat)
- Potongan BPJS Kesehatan & Ketenagakerjaan (persentase dikonfigurasi)
- Potongan lainnya: kasbon, dll

**Proses payroll:**
- Payroll dihitung per periode (mingguan atau bulanan)
- Preview payroll sebelum dikonfirmasi
- Setelah dikonfirmasi: generate slip gaji per karyawan
- Slip gaji otomatis dikirim via WhatsApp (via n8n)
- Status pembayaran: Belum Dibayar / Sudah Dibayar (dicatat manual)

### 14.4 Performa Karyawan

- Jumlah order yang ditangani per karyawan per periode
- Rating dari pelanggan yang terkait dengan order yang dikerjakan
- Rekap overtime per karyawan

---

## 15. Modul 10 — Ulasan & Rating

### 15.1 Deskripsi

Feedback pelanggan otomatis setelah order selesai, dikumpulkan via WhatsApp.

### 15.2 Alur

```
1. Order berstatus "Selesai Diambil" atau "Delivered"
2. Tunggu X jam (dikonfigurasi admin, default: 3 jam)
3. n8n kirim WA ke pelanggan:
   "Halo [Nama], cucianmu dari LUNDRY.id sudah sampai!
    Kasih rating yuk 😊
    ⭐⭐⭐⭐⭐ → [link]"
4. Pelanggan buka link → halaman rating sederhana (1-5 bintang + komentar opsional)
5. Data rating masuk ke sistem
6. Jika rating ≤ 2: alert otomatis ke manajer via WA
```

### 15.3 Fitur Admin

- Dashboard ulasan: rata-rata rating, distribusi bintang, komentar terbaru
- Filter ulasan: per periode, per rating, per karyawan yang menangani
- Balas komentar (dicatat internal, tidak dikirim ke pelanggan kecuali dikonfigurasi)
- Ulasan dapat di-flag jika tidak relevan
- Export ulasan ke CSV

### 15.4 Business Rules

- Satu order = satu kesempatan rating
- Rating hanya bisa dilakukan 1x per order (tidak bisa edit)
- Link rating expire setelah 72 jam
- Pelanggan dapat +10 Coin LUNDRY setelah submit rating

---

## 16. Modul 11 — Keuangan & Laporan Pajak

### 16.1 Laporan Keuangan Sederhana

Dirancang untuk dioperasikan oleh non-akuntan. Tidak menggunakan double-entry accounting.

**Laporan yang tersedia:**
- **Ringkasan Harian:** total pemasukan, total pengeluaran, net kas
- **Laporan Omzet:** per periode, per jenis layanan, per metode bayar
- **Laporan Pengeluaran:** per kategori (bahan, gaji, sewa, maintenance, refund, dll)
- **Rekonsiliasi Kas:** kas fisik vs kas sistem (cocok untuk shift kasir)
- **Laba Rugi Sederhana:** omzet – HPP bahan – pengeluaran operasional

### 16.2 Rekonsiliasi Pembayaran Online

- Daftar transaksi QRIS/Transfer hari ini dari sistem
- Kasir konfirmasi mana yang sudah masuk ke rekening
- Selisih dicatat sebagai "pending" hingga dikonfirmasi

### 16.3 Laporan Pajak Sederhana

- Rekap omzet bulanan dan tahunan
- Rekap PPh Final (UMKM 0.5% dari omzet bruto) — kalkulasi otomatis
- Export laporan untuk diserahkan ke konsultan pajak atau dilaporkan sendiri
- Format ekspor: PDF dan Excel
- Catatan: sistem tidak menggantikan konsultan pajak, hanya menyediakan data

### 16.4 Keuangan Drop Point

- Rekap setoran tunai harian per Drop Point
- Rekap komisi yang harus dibayar per Drop Point per hari
- Status settlement: Belum Selesai / Sudah Selesai (ditandai kasir)
- Laporan outstanding (DP yang belum setor)

---

## 17. Modul 12 — Mitra Drop Point

### 17.1 Deskripsi

Ekosistem mitra bisnis independen yang menjadi titik setor dan ambil cucian atas nama LUNDRY.id. Setiap mitra memiliki dashboard POS sendiri di `mitra.lundry.id`.

### 17.2 Registrasi Mitra

**Jalur pendaftaran:**
- Melalui landing page `lundry.id/daftar-mitra`
- Langsung didaftarkan oleh admin di panel

**Data mitra:**
- Nama bisnis & nama pemilik
- Nomor HP (untuk OTP login dan notifikasi WA)
- Alamat lengkap Drop Point
- Zona / wilayah layanan
- Foto tempat usaha (upload)
- Nomor rekening untuk pencairan komisi

**Status pendaftaran:** Menunggu Verifikasi → Diverifikasi → Aktif / Nonaktif / Suspensi

### 17.3 Alur Operasional Harian

```
PAGI: Pelanggan setor cucian kotor ke Drop Point
  → Mitra input order di dashboard POS mitra
  → Sistem generate nomor order & QR bag
  → Pelanggan bayar tunai ke mitra (atau via QRIS langsung ke LUNDRY.id)
  → Mitra cetak/kirim nota WA ke pelanggan (atas nama LUNDRY.id)

SIANG/SORE: Mitra antar order hari ini ke outlet LUNDRY.id
  → Kasir verifikasi, scan QR, input berat final
  → Mitra ambil order yang sudah selesai dari kemarin
  → Setor uang tunai hari sebelumnya ke kasir
  → Ambil komisi hari sebelumnya dari kasir
  → Kasir konfirmasi settlement → cetak bukti setor

HARI BERIKUTNYA: Mitra ambil order jadi, antar ke pelanggan
  → Scan QR serah terima ke pelanggan
  → Notifikasi WA ke pelanggan otomatis dari sistem LUNDRY.id
```

### 17.4 Dashboard POS Mitra

**Fitur tersedia:**
- Input order baru (nama pelanggan, HP, berat estimasi, jenis layanan, catatan)
- Scan QR bag (kamera HP)
- Lihat status semua order aktif di titik mereka
- Terima pembayaran tunai (dicatat di sistem sebagai "tunai di DP")
- Kirim nota WA ke pelanggan (template dari LUNDRY.id)
- Rekap setoran & komisi hari ini
- Riwayat order (30 hari terakhir)
- Leaderboard Drop Point
- Promo aktif dari LUNDRY.id (read-only)
- Notifikasi dari sistem

**Fitur tidak tersedia untuk mitra:**
- Edit harga atau buat promo sendiri
- Lihat data finansial LUNDRY.id
- Akses data mitra lain
- Kelola payroll atau karyawan LUNDRY.id

### 17.5 Sistem Pembayaran Drop Point

| Jenis Bayar | Alur |
|---|---|
| Tunai | Diterima mitra → disetor ke kasir setiap hari |
| QRIS/Transfer | Langsung masuk rekening LUNDRY.id, mitra tidak pegang uang |
| Prepaid Saldo | Dipotong otomatis dari saldo pelanggan di sistem LUNDRY.id |

### 17.6 Sistem Komisi

- **Model:** Per kilogram (berat final yang diverifikasi kasir outlet)
- **Rate:** Dikonfigurasi per mitra oleh admin (default rate + opsi kustomisasi)
- **Pembayaran komisi:** Harian, saat mitra datang ke outlet
- **Kalkulasi:** Berat final order × rate komisi per kg
- **Potongan penalty wanprestasi:** Dikonfigurasi admin

### 17.7 Tiering Mitra

| Tier | Syarat (kg/bulan) | Benefit |
|---|---|---|
| Reguler | < 100 kg | Komisi standar |
| Silver | 100 – 250 kg | Komisi + 2%, badge di leaderboard |
| Gold | > 250 kg | Komisi + 5%, prioritas support, branding kit |

### 17.8 Leaderboard Drop Point

- Ranking berdasarkan total kg yang masuk per periode (mingguan/bulanan)
- Hanya bisa diakses oleh mitra Drop Point (tidak publik)
- Tampil: posisi saat ini, nama mitra teratas (anonim kecuali top 3), total kg mereka, dan kg yang dibutuhkan untuk naik peringkat
- Badge pencapaian: naik peringkat, konsisten top 5, dsb
- Reward periode: ditetapkan manual oleh admin (contoh: Sepeda Listrik, Ponsel)
- Pengumuman reward di dashboard mitra sebelum periode dimulai

### 17.9 Notifikasi ke Pelanggan Drop Point

Semua notifikasi WA ke pelanggan tetap atas nama LUNDRY.id, menyertakan nama Drop Point:

> *"Halo Kak Cika, cucianmu nomor order #LND-20260517-0042 sudah siap diambil di Warung Madura Pak Soleh ya. Terima kasih telah menggunakan LUNDRY.id! 🌟"*

Mitra tidak bisa mengirim notifikasi sendiri ke pelanggan di luar sistem.

### 17.10 Integrasi n8n untuk Drop Point

| Trigger | Aksi WA |
|---|---|
| Mitra baru diverifikasi | "Selamat bergabung! Akun Drop Point kamu sudah aktif" |
| Order di DP sudah selesai di outlet | "Ada [X] order siap diambil hari ini" |
| Mitra naik tier | "Selamat! Kamu naik ke tier Silver 🎉" |
| Mitra tidak ada order >7 hari | Pesan re-engagement |
| Wanprestasi ke-3 dalam bulan ini | Alert warning ke mitra |

---

## 18. Modul 13 — Coin LUNDRY (Poin & Afiliasi)

### 18.1 Deskripsi

Sistem loyalitas berbasis Coin LUNDRY yang berlaku di seluruh ekosistem — baik order langsung maupun via Drop Point. Mendorong retensi pelanggan dan pertumbuhan organik melalui program referral.

### 18.2 Cara Mendapatkan Coin LUNDRY

| Aktivitas | Coin |
|---|---|
| Setiap Rp1.000 transaksi | 1 Coin (atau sesuai multiplier tier) |
| Referral berhasil (teman transaksi pertama) | 50 Coin bonus |
| Ulang tahun | 100 Coin bonus |
| Submit ulasan & rating | 10 Coin |
| Order pertama (new customer) | 25 Coin welcome bonus |
| Challenge bulanan (dikonfigurasi admin) | Variabel |
| Event Coin 2x (dikonfigurasi admin) | 2x Coin dari transaksi |

**Multiplier berdasarkan tier:**
- Regular: 1x
- Silver: 1.2x
- Gold: 1.5x
- Platinum: 2x

### 18.3 Cara Menggunakan Coin LUNDRY

| Penukaran | Coin yang Diperlukan |
|---|---|
| Diskon Rp5.000 | 100 Coin |
| Gratis cuci 1 kg | 200 Coin |
| Gratis paket express 3 kg | 500 Coin |
| Voucher Rp50.000 | 1.000 Coin |
| Merchandise LUNDRY.id | Variabel (dikonfigurasi admin) |
| Reward Leaderboard Afiliasi (misal: iPhone) | 50.000 Coin |

> Semua rate penukaran dapat dikonfigurasi oleh Owner.

### 18.4 Aturan Coin

- Coin expire: 3 bulan setelah diterima (FIFO — coin tertua dipakai pertama)
- Coin tidak bisa ditransfer antar pelanggan
- Coin hanya bisa ditukar, tidak bisa dicairkan ke uang
- Coin dari referral baru aktif setelah transaksi pertama teman selesai

### 18.5 Program Referral

- Setiap pelanggan mendapatkan kode referral unik (format: `LUNDRY-[nama_5char]`)
- Referral hanya 1 level (flat referral)
- **Referrer** mendapat: 50 Coin bonus setiap teman yang sukses transaksi pertama
- **New customer** mendapat: diskon 15% untuk order pertama (dikonfigurasi admin)
- Syarat referral valid: new customer harus transaksi minimum Rp30.000
- Anti-abuse: validasi nomor HP unik, tidak bisa referral diri sendiri

### 18.6 Leaderboard Afiliasi

- Terpisah dari leaderboard Drop Point
- Ranking berdasarkan total Coin LUNDRY yang dikumpulkan pelanggan
- Bisa diakses oleh semua pelanggan (publik dalam ekosistem)
- Periode: bulanan
- Reward besar ditukarkan dengan Coin (bukan hadiah langsung) — contoh: iPhone = 50.000 Coin
- Admin set reward yang tersedia dan stok reward di dashboard

### 18.7 Dashboard Coin LUNDRY (Pelanggan)

Diakses dari `lundry.id` setelah login OTP WA:
- Saldo Coin saat ini
- Riwayat perolehan dan penukaran Coin
- Coin yang akan expire dalam 30 hari
- Kode referral + tombol share (link ke WA, copy)
- Daftar reward yang bisa ditukar
- Posisi di leaderboard afiliasi

### 18.8 Integrasi n8n untuk Coin LUNDRY

| Trigger | Aksi WA |
|---|---|
| Coin bertambah | "Kamu dapat 45 Coin LUNDRY! Total: 320 Coin 🎉" |
| Coin cukup untuk reward | "Coinmu cukup untuk gratis cuci 1 kg! Mau tukar?" |
| Coin mau expire (7 hari) | "120 Coin kamu akan hangus 7 hari lagi!" |
| Referral berhasil | "Temanmu baru order! Kamu dapat 50 Coin bonus 🎊" |
| Challenge selesai | "Kamu berhasil order 5x bulan ini! +75 Coin masuk!" |
| Ulang tahun | "Happy Birthday! 100 Coin sudah masuk sebagai hadiah 🎂" |

---

## 19. Modul 14 — n8n Automation Hub

### 19.1 Deskripsi

n8n berfungsi sebagai automation engine yang menerima webhook dari Laravel dan menjalankan aksi seperti pengiriman WhatsApp, penjadwalan, dan trigger antar-sistem.

### 19.2 Integrasi Teknis

```
Laravel → Webhook POST → n8n Workflow
n8n → WhatsApp Business API → Pelanggan/Karyawan/Mitra
```

- Setiap event penting di Laravel men-trigger HTTP POST ke endpoint n8n
- n8n mengelola queue pengiriman WA agar tidak rate-limited
- n8n dapat di-configure tanpa mengubah kode Laravel

### 19.3 Master Automation Flows

#### A. Order & Operasional

| Event | Penerima | Pesan |
|---|---|---|
| Order baru dibuat | Pelanggan | Konfirmasi order + nomor order + estimasi selesai |
| Status order berubah | Pelanggan | Update status terkini |
| Order selesai (outlet) | Pelanggan | "Cucianmu siap diambil/dikirim!" |
| Pickup dijadwalkan | Pelanggan | Konfirmasi jadwal pickup + slot |
| Reminder pickup | Pelanggan | H-1 jam sebelum slot pickup |
| Kurir berangkat delivery | Pelanggan | "Kurirmu sedang dalam perjalanan!" |
| Order delivered | Pelanggan | Konfirmasi terima + link rating (3 jam kemudian) |

#### B. Drop Point

| Event | Penerima | Pesan |
|---|---|---|
| Order DP selesai di outlet | Mitra | Daftar order yang bisa diambil hari ini + total setoran |
| Mitra naik tier | Mitra | Selamat + info benefit baru |
| Mitra >7 hari tanpa order | Mitra | Pesan re-engagement |
| Wanprestasi ke-3 | Mitra | Warning resmi |
| Pendaftaran mitra diverifikasi | Mitra | Akun aktif + panduan mulai |

#### C. Coin LUNDRY & Referral

| Event | Penerima | Pesan |
|---|---|---|
| Coin diterima | Pelanggan | Total Coin terbaru |
| Coin hampir expire | Pelanggan | Peringatan 7 hari sebelum expire |
| Coin cukup untuk reward | Pelanggan | Tawaran penukaran |
| Referral berhasil | Referrer | Notifikasi + Coin bonus |
| Ulang tahun pelanggan | Pelanggan | Selamat + Coin hadiah |

#### D. Promosi & Marketing

| Event | Penerima | Pesan |
|---|---|---|
| Flash sale mulai | Segmen pelanggan terpilih | Broadcast promo |
| Pelanggan tidak aktif >30 hari | Pelanggan tidak aktif | Pesan reaktivasi + voucher |
| Pelanggan tidak aktif >60 hari | Pelanggan risiko churn | Penawaran khusus comeback |

#### E. Internal & Operasional

| Event | Penerima | Pesan |
|---|---|---|
| Stok bahan < minimum | Manajer/Owner | Alert stok |
| Rating ≤ 2 bintang | Manajer | Alert review negatif |
| Payroll periode selesai | Karyawan | Slip gaji via WA |
| Reminder jadwal maintenance mesin | Owner/Manajer | Alert maintenance |

### 19.4 Konfigurasi n8n dari Admin Panel

- Daftar active workflows (nama, status on/off)
- Test trigger manual dari admin panel
- Log pengiriman WA (sukses/gagal) per workflow
- Konfigurasi delay (misal: rating dikirim X jam setelah delivered)

---

## 20. Modul 15 — Admin & Konfigurasi Sistem

### 20.1 Manajemen Pengguna

- Tambah/edit/nonaktifkan akun karyawan, mitra, dll
- Reset akses (force logout semua sesi)
- Log aktivitas per pengguna

### 20.2 Konfigurasi Layanan & Harga

- Daftar jenis layanan: nama, satuan (kg/item), harga
- Harga bisa berbeda per tier pelanggan
- Minimum order per layanan
- Waktu proses estimasi per layanan

### 20.3 Konfigurasi Outlet

- Nama outlet, alamat, nomor HP operasional
- Jam operasional
- Radius layanan antar-jemput
- Kapasitas mesin

### 20.4 Konfigurasi Sistem

- Toggle modul aktif/nonaktif
- Konfigurasi printer thermal (IP printer, port)
- Konfigurasi n8n webhook URL
- Konfigurasi WhatsApp Business phone number
- Template pesan WA per event (editable)
- Konfigurasi Coin LUNDRY (rate, expire, penukaran)
- Konfigurasi tier membership (threshold, benefit)
- Konfigurasi payroll (komponen, persentase potongan)

### 20.5 Audit Log

- Setiap aksi penting dicatat: siapa, apa, kapan, dari IP mana
- Filter audit log: per user, per modul, per periode
- Export audit log ke CSV

---

## 21. Modul 16 — Franchise Mode (Mockup)

### 21.1 Status

**Mockup only — tidak dikembangkan di v1.0.** UI/UX dirancang namun tidak fungsional. Placeholder untuk roadmap v2.0.

### 21.2 Fitur yang Direncanakan (v2.0)

- Dashboard Owner Franchise (multi-outlet terpisah dari outlet utama)
- Sistem bagi hasil: konfigurasi persentase per franchisee
- Laporan konsolidasi seluruh franchise
- Manajemen standar operasional (SOP digital)
- Branding kit per franchise

### 21.3 Arsitektur yang Disiapkan

Database dan API dirancang dengan kolom `outlet_id` di seluruh entitas utama sehingga ekspansi multi-outlet tidak memerlukan perubahan schema besar.

---

## 22. Database Schema Overview

### 22.1 Entitas Utama

```
users                   → semua pengguna sistem (role-based)
outlets                 → data outlet (siap multi-outlet)
customers               → data pelanggan
orders                  → transaksi order
order_items             → detail item per order
order_status_logs       → history perubahan status order
payments                → transaksi pembayaran
qr_bags                 → label QR per bag
bag_scan_logs           → log scan QR per karyawan

drop_points             → data mitra Drop Point
drop_point_orders       → order yang masuk via DP
drop_point_settlements  → rekap setoran & komisi harian
drop_point_penalties    → catatan wanprestasi

coin_lundry_ledger      → buku besar Coin LUNDRY per pelanggan
coin_transactions       → detail perolehan & penukaran Coin
referrals               → data referral (referrer → referee)
coin_rewards            → daftar reward yang bisa ditukar

promotions              → data promosi
promotion_usages        → penggunaan promo per order
voucher_codes           → kode voucher unik

machines                → data mesin laundry
machine_logs            → log penggunaan & maintenance mesin

employees               → data karyawan (extend users)
attendance_logs         → log absensi
shifts                  → jadwal shift
payroll_periods         → periode payroll
payroll_items           → detail gaji per karyawan per periode

inventory_items         → daftar bahan & stok
inventory_mutations     → mutasi stok masuk/keluar
suppliers               → data supplier
purchase_orders         → PO ke supplier

reviews                 → ulasan & rating pelanggan
notifications           → log notifikasi WA
audit_logs              → audit trail seluruh sistem
system_configs          → konfigurasi sistem (key-value)
```

### 22.2 Kolom Standar

Setiap tabel menyertakan:
- `id` (ULID atau UUID)
- `outlet_id` (untuk multi-outlet readiness)
- `created_at`, `updated_at`
- `deleted_at` (soft delete)

---

## 23. API Endpoint Overview

### 23.1 Konvensi

- Base URL: `https://api.lundry.id/v1`
- Format: JSON
- Auth: Bearer Token (JWT) di header `Authorization`
- Versi: URI versioning (`/v1/`)
- Error format: `{ "status": "error", "code": 422, "message": "...", "errors": {} }`

### 23.2 Endpoint Utama per Modul

#### Auth
```
POST   /auth/otp/request          → Request OTP WA
POST   /auth/otp/verify           → Verifikasi OTP → issue token
POST   /auth/admin/login          → Login admin (email + password)
POST   /auth/admin/2fa/verify     → Verifikasi 2FA admin
POST   /auth/logout               → Invalidate token
GET    /auth/me                   → Get current user
```

#### Orders
```
GET    /orders                    → Daftar order (filter: status, tanggal)
POST   /orders                    → Buat order baru
GET    /orders/{id}               → Detail order
PATCH  /orders/{id}/status        → Update status order
POST   /orders/{id}/void          → Void order
POST   /orders/{id}/payment       → Konfirmasi pembayaran
GET    /orders/{id}/receipt       → Generate nota PDF/HTML
```

#### QR & Scanning
```
GET    /qr/{order_id}             → Get data QR order
POST   /qr/scan                   → Scan QR → update status + log
GET    /qr/{order_id}/print       → Generate label QR untuk print
```

#### Drop Points
```
GET    /drop-points               → Daftar Drop Point
POST   /drop-points               → Daftar mitra baru
GET    /drop-points/{id}          → Detail mitra
PATCH  /drop-points/{id}          → Update data mitra
POST   /drop-points/{id}/suspend  → Suspend mitra
GET    /drop-points/{id}/orders   → Order aktif di DP ini
POST   /drop-points/{id}/settlement → Konfirmasi settlement harian
GET    /drop-points/leaderboard   → Data leaderboard (authed mitra only)
```

#### Coin LUNDRY
```
GET    /coins/balance             → Saldo Coin pelanggan
GET    /coins/history             → Riwayat Coin
POST   /coins/redeem              → Tukar Coin dengan reward
GET    /coins/rewards             → Daftar reward tersedia
GET    /coins/leaderboard         → Leaderboard afiliasi
GET    /referral/code             → Kode referral saya
GET    /referral/stats            → Statistik referral saya
```

#### Customers
```
GET    /customers                 → Daftar pelanggan
POST   /customers                 → Tambah pelanggan baru
GET    /customers/{id}            → Detail pelanggan
PATCH  /customers/{id}            → Update data pelanggan
GET    /customers/{id}/orders     → Riwayat order pelanggan
POST   /customers/{id}/topup      → Top-up saldo prepaid
```

#### Promotions
```
GET    /promotions                → Daftar promosi
POST   /promotions                → Buat promosi baru
GET    /promotions/{id}           → Detail promosi
PATCH  /promotions/{id}           → Update promosi
DELETE /promotions/{id}           → Nonaktifkan promosi
POST   /promotions/preview        → Simulasi promo
POST   /vouchers/validate         → Validasi kode voucher
```

#### HRD
```
GET    /employees                 → Daftar karyawan
POST   /attendance/checkin        → Clock-in karyawan
POST   /attendance/checkout       → Clock-out karyawan
GET    /attendance                → Rekap absensi (filter: karyawan, periode)
GET    /shifts                    → Jadwal shift
POST   /shifts                    → Buat jadwal shift
GET    /payroll/periods           → Daftar periode payroll
POST   /payroll/periods/{id}/process → Proses payroll periode
GET    /payroll/periods/{id}/slips   → Slip gaji per periode
```

#### Reports
```
GET    /reports/daily             → Laporan harian
GET    /reports/revenue           → Laporan omzet
GET    /reports/expenses          → Laporan pengeluaran
GET    /reports/tax               → Laporan pajak
GET    /reports/inventory         → Laporan inventory
GET    /reports/export/{type}     → Export PDF/Excel
```

#### n8n Webhooks (internal)
```
POST   /webhooks/n8n/order-status  → Dipanggil n8n untuk update dari WA bot
POST   /webhooks/n8n/otp           → Dipanggil n8n untuk konfirmasi OTP terkirim
```

---

## 24. Non-Functional Requirements

### 24.1 Performa

- Response API: < 300ms untuk 95% request pada load normal
- Dashboard load time: < 2 detik
- QR scan response: < 1 detik
- Thermal print trigger: < 2 detik dari konfirmasi order
- Sistem harus mampu menangani 100 concurrent users

### 24.2 Keamanan

- Semua komunikasi via HTTPS (TLS 1.2+)
- JWT token disimpan di httpOnly cookie (bukan localStorage)
- Input validation dan sanitasi di semua endpoint
- SQL injection protection via ORM (Eloquent)
- XSS protection di frontend (Next.js built-in)
- Rate limiting di semua endpoint publik
- Audit log semua aksi admin
- Backup database otomatis harian

### 24.3 Ketersediaan

- Uptime target: 99.5%
- Backup harian, retensi 30 hari
- Maintenance window: hari Minggu dini hari (00:00 – 04:00 WIB)
- Graceful degradation: jika n8n down, notifikasi WA masuk ke queue dan dikirim saat kembali online

### 24.4 Skalabilitas

- Arsitektur siap horizontal scaling (stateless API)
- Database connection pooling
- Redis untuk cache dan session
- File storage di object storage (S3-compatible), bukan di server lokal
- Kolom `outlet_id` di seluruh tabel untuk ekspansi multi-outlet tanpa migrasi besar

### 24.5 Aksesibilitas & UX

- Responsive design: dashboard optimal di desktop 1280px+, kasir & scan optimal di mobile
- Dashboard mitra optimal di smartphone (layar 5–6.5 inci)
- Scan QR menggunakan kamera browser (tidak perlu app)
- Offline-ready untuk scan QR (PWA dengan service worker — jika sinyal tidak stabil)
- Bahasa: Indonesia

---

## 25. Fase Pengembangan & Prioritas

### Fase 1 — Core (8–10 minggu)
Fondasi sistem yang harus ada sebelum outlet buka.

- [ ] Autentikasi (OTP WA + Admin password + 2FA)
- [ ] Modul POS Kasir (order, pembayaran, cetak nota)
- [ ] QR Tracking per Bag (generate, scan, update status)
- [ ] Dashboard ERP — Operational & Financial
- [ ] Modul Pelanggan dasar (database, riwayat order)
- [ ] Manajemen Mesin & kapasitas dasar
- [ ] n8n Setup + Notifikasi WA dasar (order confirmed, selesai)
- [ ] Integrasi dasar dengan lundry.id (tracking publik, login pelanggan)

### Fase 2 — Growth (6–8 minggu)
Fitur pertumbuhan dan loyalitas.

- [ ] Coin LUNDRY (poin, penukaran, leaderboard afiliasi)
- [ ] Program Referral
- [ ] Modul Promosi (semua tipe, penjadwalan)
- [ ] Ulasan & Rating otomatis
- [ ] Modul Drop Point (dashboard mitra, komisi, settlement, leaderboard)
- [ ] Registrasi mitra dari lundry.id
- [ ] n8n flows lengkap (semua automation)

### Fase 3 — Operations (4–6 minggu)
Fitur operasional internal.

- [ ] HRD — Absensi, Shift, Payroll
- [ ] Antar-Jemput (dashboard kurir, jadwal pickup)
- [ ] Inventory & Purchasing
- [ ] Laporan Keuangan lengkap & Laporan Pajak
- [ ] Dashboard ERP lengkap (semua sub-dashboard)
- [ ] CRM lanjutan (segmentasi, tier, prepaid)

### Fase 4 — Polish & Scale (ongoing)
- [ ] Franchise Mode (mockup → fungsional di v2.0)
- [ ] Optimasi performa & load testing
- [ ] AI Chatbot WA (via n8n)
- [ ] Multi-outlet support

---

## 26. Glossary

| Istilah | Definisi |
|---|---|
| **POS** | Point of Sale — sistem kasir untuk menerima dan memproses transaksi |
| **ERP** | Enterprise Resource Planning — sistem manajemen bisnis terintegrasi |
| **Drop Point (DP)** | Mitra bisnis independen yang menjadi titik setor/ambil cucian |
| **Coin LUNDRY** | Mata uang loyalitas digital milik ekosistem LUNDRY.id |
| **OTP** | One-Time Password — kode satu kali pakai untuk verifikasi |
| **QR Bag** | Label QR unik yang ditempel di plastik cucian per order |
| **Settlement** | Proses penyelesaian keuangan harian antara Drop Point dan outlet |
| **n8n** | Platform automation open-source yang mengelola workflow dan notifikasi |
| **Prepaid** | Saldo yang dibayar dimuka oleh pelanggan dan dapat digunakan untuk order |
| **Wanprestasi** | Pelanggaran kewajiban oleh mitra Drop Point (estimasi salah, order tidak lengkap, dll) |
| **Tier** | Level pelanggan atau mitra berdasarkan volume transaksi |
| **Leaderboard** | Papan peringkat berdasarkan performa (kg untuk DP, Coin untuk afiliasi) |
| **WA Bot** | Bot WhatsApp terintegrasi via n8n untuk komunikasi otomatis |
| **HPP** | Harga Pokok Produksi — biaya langsung untuk menghasilkan layanan |
| **QC** | Quality Control — pengecekan kualitas sebelum cucian diserahkan |
| **PWA** | Progressive Web App — web yang dapat berfungsi seperti aplikasi mobile |
| **ULID** | Universally Unique Lexicographically Sortable Identifier — format ID database |
| **2FA** | Two-Factor Authentication — verifikasi dua langkah untuk keamanan admin |

---

*Dokumen ini adalah living document. Setiap perubahan fitur setelah dokumen ini disahkan harus dicatat dalam changelog dan disetujui oleh Owner sebelum diimplementasikan.*

**LUNDRY.id © 2026 — Confidential**
