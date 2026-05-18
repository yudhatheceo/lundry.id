# 🧪 Panduan Pengujian Multi-Subdomain Secara Lokal (Pre-Deployment Guide)
> **Sistem ERP & POS LUNDRY.id**  
> **Peran:** Lead Frontend Developer (Forge / The Beacon)  
> **Status:** Panduan Pengujian Lokal · Mei 2026  
> **Konteks:** Diperbarui menggunakan Cloudflared Tunnel sesuai pilihan infrastruktur tim.

---

Mantap sekali, Yud! Menggunakan **Cloudflared Tunnel** adalah keputusan yang sangat cerdas. Selain gratis, aman, dan tanpa batasan bandwidth seperti Ngrok, Cloudflared terintegrasi langsung dengan ekosistem **Cloudflare** (yang memang kita pakai untuk deployment produksi LUNDRY.id di Cloudflare Pages!). 

Berikut adalah dokumentasi yang sudah diperbarui khusus menggunakan **Cloudflared Tunnel (Argo Tunnel)** untuk mengetes subdomain Next.js Middleware di HP maupun laptop secara *seamless*.

---

## Metode 1: Localhost Subdomains (Otomatis & Tanpa Setup!)
> **Tingkat Kemudahan:** 🌟🌟🌟🌟🌟 (Sangat Mudah)  
> **Cocok untuk:** Pengujian cepat di browser PC/Laptop dev.

Di browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox), subdomain dari `localhost` secara otomatis akan di-resolve langsung ke IP local loopback `127.0.0.1` tanpa perlu mengubah konfigurasi apa pun di OS!

### Langkah-langkah:
1. Jalankan server Next.js lokal seperti biasa:
   ```bash
   npm run dev
   ```
   *(Asumsikan aplikasi berjalan di port `3000`)*
2. Buka tab baru di browser dan akses URL berikut:
   - 🏠 **Landing Page / Public:** `http://localhost:3000`
   - 💼 **Dashboard ERP / Kasir:** `http://app.localhost:3000`
   - 🏪 **POS Drop Point:** `http://mitra.localhost:3000`

Next.js Middleware kita akan mendeteksi awalan subdomain dan secara instan menyajikan route groups yang sesuai (`(public)`, `(app)`, atau `(mitra)`).

---

## Metode 2: Custom Local Domains (hosts File Windows)
> **Tingkat Kemudahan:** 🌟🌟🌟🌟 (Mudah)  
> **Cocok untuk:** Pengujian simulasi nama domain asli (misal: `lundry.local`, `app.lundry.local`).

Jika kamu ingin sensasi pengujian yang mirip dengan domain produksi tanpa port `localhost`, kamu bisa mendaftarkan domain tiruan di sistem operasi Windows-mu.

### Langkah-langkah:
1. Buka aplikasi **Notepad** dengan akses **Run as Administrator**.
2. Buka file konfigurasi hosts Windows di jalur berikut:
   `C:\Windows\System32\drivers\etc\hosts`
3. Tambahkan baris-baris berikut di bagian paling bawah file:
   ```text
   127.0.0.1    lundry.local
   127.0.0.1    app.lundry.local
   127.0.0.1    mitra.lundry.local
   ```
4. Simpan file tersebut, jalankan `npm run dev`, lalu akses di browser:
   - 🏠 `http://lundry.local:3000`
   - 💼 `http://app.lundry.local:3000`
   - 🏪 `http://mitra.lundry.local:3000`

---

## Metode 3: Pengujian di HP Real via Cloudflared Tunnel
> **Tingkat Kemudahan:** 🌟🌟🌟🌟🌟 (Sangat Direkomendasikan!)  
> **Cocok untuk:** Menguji fitur kamera HP Karyawan/Kurir secara langsung menggunakan **HTTPS** yang aman (wajib agar izin kamera HP aktif).

Karena Cloudflared Tunnel menyajikan koneksi HTTPS secara bawaan, kita bisa melakukan pengujian di HP dengan dua pendekatan: **Quick Tunnel (trycloudflare.com)** untuk tes instan, atau **Named Tunnel** terintegrasi DNS untuk pengujian profesional.

### Pendekatan A: Quick Tunnel instan (trycloudflare.com)
Cocok untuk tes cepat sekali jalan tanpa login akun Cloudflare.

1. Pastikan Next.js dev server berjalan di PC (`npm run dev` pada port 3000).
2. Jalankan perintah Cloudflared Tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare akan men-generate URL HTTPS acak, misalnya:  
   `https://mats-laundry-testing.trycloudflare.com`
4. **Trik Mocking Subdomain untuk Pengujian di HP:**  
   Karena Quick Tunnel gratisan hanya memberikan satu domain tunggal, kita bisa memodifikasi sementara `middleware.ts` selama fase testing lokal agar bisa membaca parameter query string URL (`?mock_host=...`) untuk menyimulasikan subdomain di browser smartphone:
   - 💼 **Tes POS Kasir / ERP:** Buka `https://xxx.trycloudflare.com/?mock_host=app`
   - 🏪 **Tes POS Drop Point:** Buka `https://xxx.trycloudflare.com/?mock_host=mitra`
   - 🏠 **Tes Landing Page:** Buka `https://xxx.trycloudflare.com/`

#### Kode Mocking Host di `src/middleware.ts` untuk Pengujian HP:
```typescript
// Tambahkan baris ini di baris pertama middleware.ts khusus saat fase testing lokal:
const mockHostParam = req.nextUrl.searchParams.get('mock_host');
let hostname = req.headers.get('host') || '';

if (mockHostParam === 'app') {
  hostname = 'app.lundry.id';
} else if (mockHostParam === 'mitra') {
  hostname = 'mitra.lundry.id';
}
```

---

### Pendekatan B: Named Tunnel & Custom Domain (Rekomendasi Power User 🚀)
Karena domain `lundry.id` di-host di Cloudflare, kita bisa membuat Named Tunnel permanen sehingga kamu bisa mengetes dengan domain asli sesungguhnya dari HP tanpa trik mock query parameter!

```
[HP Kurir/Karyawan] ──► dev.app.lundry.id (HTTPS) ──► Cloudflare Edge ──► [cloudflared daemon di PC] ──► localhost:3000
```

1. **Buat Tunnel Baru:**
   ```bash
   cloudflared tunnel create lundry-dev
   ```
2. **Konfigurasikan DNS di Cloudflare Dashboard:**
   Petakan subdomain testing khusus ke ID tunnel-mu:
   - CNAME `dev.lundry.id` -> `[ID-TUNNEL-KAMU].cfargotunnel.com`
   - CNAME `dev.app.lundry.id` -> `[ID-TUNNEL-KAMU].cfargotunnel.com`
   - CNAME `dev.mitra.lundry.id` -> `[ID-TUNNEL-KAMU].cfargotunnel.com`
3. **Buat File Konfigurasi lokal (`config.yml`):**
   ```yaml
   tunnel: [ID-TUNNEL-KAMU]
   credentials-file: C:\Users\spyud\.cloudflared\[ID-TUNNEL-KAMU].json

   ingress:
     - hostname: dev.lundry.id
       service: http://localhost:3000
     - hostname: dev.app.lundry.id
       service: http://localhost:3000
     - hostname: dev.mitra.lundry.id
       service: http://localhost:3000
     - service: http_status:404
   ```
4. **Jalankan Tunnel-mu:**
   ```bash
   cloudflared tunnel run lundry-dev
   ```
5. **Jajal di HP-mu secara Real!**  
   Buka browser smartphone kamu dan langsung ketik domain aslinya via HTTPS:
   - 🏠 `https://dev.lundry.id`
   - 💼 `https://dev.app.lundry.id` (POS Kasir / scan kamera langsung jalan!)
   - 🏪 `https://dev.mitra.lundry.id` (POS Drop Point jalan!)

---

### Kenapa Cloudflared Jauh Lebih Baik untuk LUNDRY.id?
- **Zero Configuration HTTPS:** Memudahkan browser handphone mendeteksi "Secure Context", sehingga API kamera HP (`getUserMedia`) dapat diakses tanpa hambatan keamanan demi kenyamanan testing modul scan QR (Modul 05).
- **Infrastruktur Produksi:** Membiasakan tim The Beacon dengan flow tunneling Cloudflare yang nantinya juga akan digunakan untuk mengamankan komunikasi API Backend Laravel ke Automation Engine n8n di production!

Semangat nge-build-nya, Yud! Jika butuh bantuan untuk meracik file ingress `config.yml` atau penulisan middleware-nya, panggil Forge saja! 🚀🔥
