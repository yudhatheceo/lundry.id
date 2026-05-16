# LUNDRY.id — Master Plan Penyempurnaan Landing Page
> Dokumen kerja internal. Disusun berdasarkan sesi brainstorm 16 Mei 2026.  
> Status bisnis: **Pre-launch. Fase persiapan aktif.**  
> Tech stack: Next.js (CF Pages) · Laravel · MariaDB · n8n · WAHA WhatsApp API

---

## Konteks Bisnis (Fondasi Keputusan)

Sebelum menyentuh satu baris kode pun, semua perubahan frontend harus berpijak pada realita bisnis berikut:

- **Lokasi target:** Jember — area kampus Mastrip & sekitar Perempatan Jetos
- **Model bisnis:** Laundry kiloan + sistem modern. Bukan premium eksklusif, tapi **terbaik di kelasnya secara experience**
- **Segmen utama:** Mahasiswa, karyawan, ibu rumah tangga, UMKM lokal, B2B institusi
- **Diferensiasi nyata:** Bukan harga, bukan layanan eksotis — tapi **sistem, kepastian, dan komunikasi otomatis**
- **Fase 1 (Bulan 1–5):** 1 outlet operasional, bangun reputasi, validasi sistem
- **Fase 2 (Bulan 6+):** Ekspansi Drop Point ke UMKM & rumah tangga lokal
- **Badan hukum:** PT aktif — aset krusial untuk B2B formal
- **Layanan yang TIDAK dijual fase 1:** Dry clean, cuci sepatu/tas/boneka, karpet besar

---

## Prinsip Desain yang Dipertahankan

Frontend yang ada sudah solid secara visual. Tidak perlu redesign. Yang dibutuhkan adalah **penyesuaian konten dan struktur informasi** agar selaras dengan realita bisnis.

> **Tone yang dijaga:** Modern dan terpercaya — tapi tidak intimidatif. Harus terasa terjangkau dan ramah untuk semua segmen, dari mahasiswa hingga manajer hotel.

---

## SPRINT 1 — Credibility Fix
> **Prioritas tertinggi. Harus selesai sebelum domain dipublikasikan.**  
> Alasan: Konten palsu menghancurkan kepercayaan lebih cepat dari desain buruk.

---

### 1.1 · ServiceAreas.tsx — Hapus Kota Fiktif

**Masalah:**
Area layanan mencantumkan Surabaya, Malang, Sidoarjo, Gresik, Kediri — kota yang belum dilayani dan tidak ada outlet di sana.

**Aksi:**
- Hapus semua kota selain Jember
- Ganti konten OUTLETS menjadi 1 outlet saja dengan alamat placeholder yang jujur
- Tambahkan label "Coming Soon" untuk ekspansi, bukan daftar aktif

**Copy baru yang disarankan:**
```
Area Layanan: Jember (Aktif)
Ekspansi berikutnya: Segera menyusul — pantau terus.
```

**Komponen OUTLETS — ganti menjadi:**
```tsx
const OUTLETS = [
  {
    name: "LUNDRY.id — Jember (Pusat)",
    address: "Area Kampus Mastrip, Jember — alamat lengkap segera diumumkan",
    hours: "07:00 – 21:00",
    status: "Segera Buka",
  },
];
```

---

### 1.2 · TrustBadges.tsx — Ganti Metrik Palsu

**Masalah:**
"1.200+ Pelanggan", "10rb+ Kg", "4.9/5 Google", "5 Kota" — semua tidak berdasar. Bisnis belum beroperasi.

**Aksi:**
Ganti 4 metrik angka menjadi 4 **value promise** yang bisa dipertanggungjawabkan sejak hari pertama:

| Ganti dari | Menjadi |
|---|---|
| 1.200+ Pelanggan Puas | Notifikasi Real-Time |
| 4.9/5 Rating Google | Standar Kualitas Hotel |
| 10rb+ Kg Cucian Selesai | Pickup < 2 Jam |
| 5 Kota | Harga Transparan |

**Icon yang sesuai:** Bell, ShieldCheck, Truck, Tag (dari lucide-react)

**3 Feature block di bawah — ganti menjadi:**
```
✦ Sistem Otomatis 24 Jam
  Order masuk, konfirmasi, status, dan invoice — semua otomatis via WhatsApp.

✦ Garansi Kepastian Waktu
  Kami kasih tau kalau ada perubahan. Tidak ada "nunggu nggak jelas".

✦ Mitra Bisnis Resmi
  Beroperasi di bawah badan hukum PT. Siap kerja sama formal dengan institusi.
```

---

### 1.3 · Testimonials.tsx — Ganti Format

**Masalah:**
Foto dari Unsplash dengan nama fiktif. Risiko reverse image search = reputasi rusak.

**Aksi (pilih salah satu):**

**Opsi A — Pre-launch Waitlist (Direkomendasikan):**
Ganti seluruh section testimoni menjadi waitlist sederhana:
```
"Jadilah yang pertama merasakan."
[Input nama + nomor WA] → [Daftar Sekarang]
Data masuk ke n8n → tersimpan di backend → blast WA saat launch
```

**Opsi B — Placeholder Jujur:**
Tampilkan card kosong dengan teks:
```
"Ulasan pertama menunggu pelanggan pertama kami. 
Jadilah yang pertama — pesan saat kami buka."
```

---

## SPRINT 2 — Sinkronisasi Konten & Layanan
> **Dikerjakan setelah Sprint 1 selesai.**  
> Fokus: Apa yang dijual harus konsisten di seluruh halaman.

---

### 2.1 · Pricing.tsx — Restrukturisasi Tab

**Hapus:** Tab "Dry Clean" — layanan ini tidak tersedia di Fase 1.

**Ganti struktur tab menjadi:**

| Tab | Isi |
|---|---|
| **Kiloan** | Regular, Express, Kilat, Setrika Only |
| **Satuan** | Jas/Blazer, Gaun/Dress (hanya item yang realistis diproses) |
| **Langganan** | Paket bulanan — INI YANG BARU, lihat detail di bawah |
| **B2B** | Hotel, Kos, Resto, Institusi — dengan CTA konsultasi |

**Tambahkan Tab Langganan Bulanan:**
```tsx
langganan: [
  { name: "Paket Mhs 20kg", price: "140rb", unit: "/bulan", info: "Hemat 12.5% dari Regular" },
  { name: "Paket Keluarga 40kg", price: "260rb", unit: "/bulan", info: "Hemat 18%" },
  { name: "Paket Kos 100kg", price: "580rb", unit: "/bulan", info: "Prioritas antar-jemput" },
]
```

**Tambahkan keterangan antar-jemput di bawah tab:**
```
Antar-jemput gratis untuk radius 3km dari outlet · Di luar radius: Rp2.000/km
```

---

### 2.2 · Services.tsx — Pangkas & Luruskan

**Hapus dari items list:**
- "Jaket Kulit" dari Laundry Satuan (butuh chemical & handling khusus)
- "Klinik / Gym" dari B2B (belum ada rate, jangan janji dulu)

**Ganti menjadi 4 card yang jujur dan kuat:**

```
1. Laundry Kiloan
   Regular / Express / 3 Jam Kilat / Setrika Only
   → Pakaian harian, handuk, seprai

2. Laundry Satuan
   Jas, Blazer, Gaun, Dress, Seragam Formal
   → Penanganan khusus per item

3. Paket Langganan
   20kg / 40kg / Custom untuk kos & keluarga
   → Bayar bulanan, hemat otomatis

4. Layanan B2B
   Hotel, Kos-kosan, Restoran, Kantor, Kampus, Gym
   → Kerja sama kontrak dengan PT terdaftar
```

---

### 2.3 · FAQ.tsx — Update Pertanyaan

**Hapus pertanyaan yang tidak akurat:**
- Referensi kota selain Jember
- Referensi dry clean

**Tambahkan pertanyaan yang paling sering ditanyakan secara real:**

```
Q: Bagaimana cara memesan?
A: Cukup chat WhatsApp kami. Bot kami akan panduan kamu dari pilih layanan,
   jadwal pickup, sampai konfirmasi harga. Tidak perlu install aplikasi apapun.

Q: Berapa biaya antar-jemput?
A: Gratis untuk radius 3km dari outlet kami. Di luar itu dikenakan Rp2.000/km.
   Konfirmasi ongkir otomatis muncul saat kamu order via WA.

Q: Apakah ada paket langganan?
A: Ada! Mulai dari Paket Mahasiswa 20kg/bulan. Lebih hemat dan nggak perlu
   order satu-satu setiap minggu.

Q: Bagaimana kalau pakaian saya rusak atau hilang?
A: Kami bertanggung jawab penuh. Setiap pakaian dicatat dan difoto saat masuk.
   Ada sistem klaim yang bisa kamu ajukan langsung via WhatsApp.

Q: Metode pembayaran apa yang diterima?
A: QRIS (semua e-wallet), transfer bank, dan tunai saat pickup/delivery.
   Invoice dikirim otomatis via WhatsApp.

Q: Apakah bisa untuk kebutuhan bisnis (hotel, kos, dll)?
A: Bisa. Kami melayani B2B dengan harga kontrak, invoicing bulanan, dan
   bisa tanda tangan MOU formal karena kami beroperasi sebagai PT.
```

---

## SPRINT 3 — Penambahan Section Baru
> **Dikerjakan setelah Sprint 1 & 2 selesai.**  
> Fokus: Informasi yang strategis tapi belum ada di landing page.

---

### 3.1 · Partnership.tsx — Reorder & Reframe

**Urutan card diubah menjadi:**

```
1. Drop Point [PRIORITAS UTAMA]
2. Corporate B2B
3. Reseller Chemical & Alat
4. Franchise Outlet [SEMBUNYIKAN atau tandai "Coming Soon"]
```

**Drop Point — copy baru yang lebih kuat:**
```
Jadikan rumah atau toko kamu titik layanan LUNDRY.id.

Tanpa modal. Tanpa risiko. Komisi per kilogram yang masuk lewat kamu.

Cocok untuk: warung, konter pulsa, toko ATK, ibu rumah tangga, kantin kos.

✦ Komisi langsung per transaksi
✦ Pickup rutin dari tim kami
✦ Target achievement = reward nyata
```

**Tambahkan Rewards Program di section Drop Point:**
```tsx
const REWARDS = [
  { target: "500kg/bulan", reward: "Bonus Tunai Rp250.000" },
  { target: "1.000kg/bulan", reward: "Smartphone Entry Level" },
  { target: "3.000kg kumulatif", reward: "Sepeda Listrik" },
];
```

**Kalkulasi potensi yang bisa ditampilkan:**
```
10 Drop Point × 20kg/hari = 200kg/hari = 6.000kg/bulan
Ini bukan proyeksi — ini target operasional Fase 2.
```

---

### 3.2 · [NEW] Section — Produk Laundry

Tambahkan section baru antara Services dan Partnership untuk **jual beli chemical & peralatan laundry**.

**Positioning:** Bukan toko biasa. Kamu supplier yang juga pakai produk ini sendiri — social proof terkuat.

**Konten section:**
```
Produk yang Kami Pakai Sendiri — Kini Tersedia untuk Umum

✦ Deterjen & Pelembut Premium
  Formula higienis, wangi tahan lama, aman untuk semua bahan.

✦ Pewangi Laundry Konsentrat
  Varian eksklusif LUNDRY.id. Bisa dijual eceran oleh Drop Point.

✦ Peralatan Laundry
  Mesin cuci, setrika industri, troli, hanger — untuk yang mau buka usaha.

CTA: "Hubungi Kami untuk Harga Grosir" → WhatsApp
```

---

### 3.3 · [NEW] Sticky WhatsApp Button

Tambahkan floating button WhatsApp yang sticky di kanan bawah — **ada di semua section, semua scroll position.**

```tsx
// Tambahkan di layout.tsx atau page.tsx, bukan per-section
<a 
  href="https://wa.me/628XXXXXXXXX?text=Halo+LUNDRY.id" 
  target="_blank"
  className="fixed bottom-6 right-6 z-50 flex items-center gap-2 
             bg-[#25D366] text-white px-5 py-3 rounded-full shadow-xl
             hover:bg-[#128C7E] transition-all hover:scale-105"
>
  <MessageCircle className="h-5 w-5" />
  <span className="font-bold text-sm">Pesan Sekarang</span>
</a>
```

---

### 3.4 · Hero.tsx — Minor Adjustment

Hero sudah kuat. Hanya 2 penyesuaian kecil:

1. **Badge "Laundry Modern #1 Jember"** — ubah menjadi **"Laundry Modern Pertama di Jember"** karena klaim #1 belum bisa dibuktikan
2. **Subtitle** — tambahkan satu kalimat yang menyentuh segmen mahasiswa:
   ```
   "Eksperiens laundry terbaik dengan standar kualitas hotel.
   Bersih, Wangi, & Cepat — cocok untuk kamu yang sibuk kuliah maupun kerja."
   ```

---

## Ringkasan Prioritas Eksekusi

```
SPRINT 1 — CREDIBILITY FIX (Lakukan duluan, hari ini)
─────────────────────────────────────────────────────
□ ServiceAreas   → Hapus semua kota kecuali Jember
□ TrustBadges    → Ganti metrik palsu dengan value promise
□ Testimonials   → Ganti dengan waitlist pre-launch

SPRINT 2 — CONTENT SYNC (Setelah Sprint 1)
─────────────────────────────────────────────────────
□ Pricing        → Hapus tab Dry Clean, tambah tab Langganan
□ Services       → Pangkas item yang tidak realistis
□ FAQ            → Update semua pertanyaan & jawaban

SPRINT 3 — NEW SECTIONS (Setelah Sprint 2)
─────────────────────────────────────────────────────
□ Partnership    → Reorder, Drop Point jadi #1, tambah rewards
□ [NEW] Produk   → Section chemical & peralatan laundry
□ [NEW] WA Float → Sticky button di semua halaman
□ Hero           → Minor copy adjustment
```

---

## Catatan untuk Backend (Referensi Fase Berikutnya)

Poin-poin berikut harus tersedia di backend sebelum frontend bisa "hidup":

| Fitur Frontend | Kebutuhan Backend |
|---|---|
| Tombol "Pesan Sekarang" | WAHA WA bot aktif + n8n flow order |
| Tab Langganan | Tabel `subscriptions` + billing cycle di Laravel |
| Waitlist pre-launch | Endpoint POST `/waitlist` + simpan ke DB |
| Drop Point rewards | Tabel `drop_points`, `transactions`, `reward_tiers` |
| B2B "Hubungi Kami" | Form lead masuk ke CRM / n8n notif ke owner |
| Produk chemical | Tabel `products` + halaman katalog terpisah |
| Lokasi outlet | Data outlet di DB → API → render di maps embed |

---

*Dokumen ini adalah living document. Update setiap kali ada keputusan bisnis baru.*  
*Versi: 1.0 · 16 Mei 2026*
