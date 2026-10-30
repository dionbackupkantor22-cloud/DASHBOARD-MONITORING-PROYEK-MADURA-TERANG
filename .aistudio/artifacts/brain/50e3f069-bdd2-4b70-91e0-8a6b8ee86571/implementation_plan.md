# Sinkronisasi Realtime Otomatis & Penyelarasan Akurasi Data Proyek Madura Terang

Perubahan ini menyelaraskan 100% perhitungan metrik, narasi eksekutif, dan pemetaan kolom antara spreadsheet sumber dengan seluruh komponen dashboard, serta mengaktifkan mesin sinkronisasi otomatis setiap **30 detik** dan saat tab browser dibuka kembali (*window focus / visibility change*) melalui akses publik tanpa perlu login atau input manual berulang.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berikut adalah keputusan utama yang telah dikonfirmasi dan akan diterapkan secara menyeluruh pada sistem:

- **Keputusan Terkonfirmasi 1 (Metode Koneksi Otomatis Tanpa Login)**: Dashboard secara otomatis menyinkronkan data dari spreadsheet sumber tanpa mewajibkan login Google OAuth setiap sesi. Sistem mendukung penarikan langsung via endpoint CSV/GViz publik Google Sheets (serta pembaruan cache-busting realtime pada dataset sumber terintegrasi) dan menyimpan konfigurasi secara persisten di penyimpanan lokal browser (`localStorage`), sehingga pengguna atau pimpinan yang membuka dashboard langsung melihat data terbaru tanpa input manual.
- **Keputusan Terkonfirmasi 2 (Interval Auto-Sync 30 Detik + Tab Focus)**: Siklus pembaruan otomatis dijalankan setiap **30 detik** secara presisi di latar belakang, ditambah pemicu instan (*immediate sync*) setiap kali pengguna kembali membuka tab browser (`visibilitychange` & `focus`).
- **Keputusan Terkonfirmasi 3 (Aturan Perhitungan KPI Hanya dari Unit Berstatus Operasi)**: Seluruh perhitungan operasional aktif — meliputi **Unit Overload ($\ge 80\%$)**, **Total Beban Tersuplai (kVA)**, **Rata-rata & Maksimum Loading (%)**, serta **Estimasi Konsumsi BBM (Liter/jam)** — dihitung secara konsisten **hanya dari unit yang berstatus `Operasi`** di seluruh komponen (Kartu KPI, Banner Ringkasan Eksekutif, Visualisasi, Perhatian Manajemen, dan Filter Cepat `Beban Kritis >80%`).
- **Rekomendasi Tambahan (Pemetaan Kolom & Narasi Dinamis)**: Seluruh teks narasi yang sebelumnya statis (*hardcoded* seperti angka `9.710 kVA`, `20 unit operasi`, atau daftar gardu overload statis) diubah menjadi sepenuhnya dinamis mengikuti isi spreadsheet terkini, kolom `TEAM` tidak lagi dipaksa menjadi `UP3 MDR` jika kosong di spreadsheet, dan kolom atribut instalasi (`ATS`) sebelum kolom `TEAM` ikut dipetakan secara akurat.

---

## 1. Overview & Core Concept

- **Apa yang Dilakukan**: Menghilangkan seluruh selisih angka antara spreadsheet sumber dan tampilan dashboard, sekaligus memastikan setiap perubahan data pada spreadsheet sumber langsung tercermin di dashboard secara otomatis setiap 30 detik atau saat jendela aplikasi dilihat kembali.
- **Target Pengguna**: Manajemen Eksekutif PLN, Tim Operasi & Pemeliharaan (UP3 Madura / HAR SBB), dan Tim Logistik Penanganan Keandalan Kelistrikan Madura.
- **Nilai Utama**: Satu sumber kebenaran data (*Single Source of Truth*) yang akurat hingga ke satuan kVA dan Liter/jam tanpa kerepotan login atau menempelkan link ulang setiap kali halaman dimuat.

---

## 2. User Experience & Visual Design

- **AlurPengguna Tanpa Hambatan (Zero-Friction Flow)**:
  1. Saat halaman dibuka, dashboard langsung menarik data terbaru dengan parameter anti-cache (`?t=timestamp`) tanpa memunculkan popup login.
  2. Indikator status di bagian atas menampilkan waktu sinkronisasi terakhir (WIB) dan hitung mundur otomatis **30 detik** (`Auto-sync: 30s` $\rightarrow$ `0s`).
  3. Saat pengguna berpindah ke tab lain (misalnya mengedit Google Sheets) lalu kembali ke tab dashboard, sistem otomatis mendeteksi fokus layar dan langsung menarik data terbaru detik itu juga.
  4. Jika pengguna ingin mengganti link Google Sheets publik dengan dokumen lain, cukup tempelkan URL satu kali saja pada panel pengaturan; sistem menyimpannya secara permanen di browser dan langsung menarik CSV publiknya tanpa meminta login OAuth.
- **Identitas Visual & Tipografi Data**:
  - **Estetika & Palet Warna**: Mempertahankan identitas korporat *PLN Siaga* dengan kanvas netral terang (`--background: #F8FAFC`), permukaan struktural bersih (`#FFFFFF` dengan garis batas halus `1px #E2E8F0`), header kontras tinggi (`#0F172A`), serta warna semantik tegas: Hijau Zamrud (`#059669`) untuk unit *Operasi*, Biru (`#2563EB`) untuk *Dilokasi Siap*, Kuning Amber (`#D97706`) untuk *Belum Tiba*, dan Merah (`#DC2626`) untuk *Overload / Trip Over Current*.
  - **Disiplin Angka Tabular (`tabular-nums`)**: Seluruh metrik kapasitas (kVA/MVA), beban (kVA/Ampere), persentase pembebanan (%), konsumsi BBM (L/jam), dan penghitung mundur menggunakan angka monospasi tabular agar sejajar vertikal dan tidak bergeser saat pembaruan realtime berlangsung.
- **Umpan Balik Interaktif**:
  - Saat sinkronisasi otomatis berjalan setiap 30 detik, pembaruan dilakukan secara mulus di latar belakang (*silent background refresh*) tanpa mengacaukan posisi gulir (*scroll*), tab aktif, maupun filter pencarian yang sedang dibuka pengguna.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Sinkronisasi Otomatis Tanpa Login (Public CSV/GViz Export + Cache-Busted Source)**
  - *Pendekatan Terpilih*: Menggunakan penarikan langsung melalui endpoint ekspor CSV publik Google Sheets (`/gviz/tq?tqx=out:csv` dan `/export?format=csv`) yang dipadukan dengan pembacaan sumber terintegrasi ber-parameter anti-cache (`cache: 'no-store'` + timestamp unik), serta penyimpanan ID/URL secara permanen di `localStorage`.
  - *Mengapa*: Mengeliminasi kedaluwarsa token OAuth 1 jam dan keharusan login ulang setiap kali halaman di-refresh, sehingga dashboard dapat ditampilkan di layar monitor ruang kontrol (command center) 24 jam penuh tanpa intervensi manual.
  - *Alternatif yang Dilewati*: Mewajibkan Google OAuth `spreadsheets.readonly` di setiap sesi — ditolak karena menyebabkan sesi terputus saat halaman dimuat ulang atau dibuka oleh pimpinan dari perangkat berbeda.

- **Keputusan 2: Penyelarasan Ketat Aturan Metrik Operasional (`Operasi` Only)**
  - *Pendekatan Terpilih*: Menetapkan satu fungsi predikat tunggal untuk status `Operasi` yang digunakan bersama oleh perhitungan Kartu KPI, Visualisasi Profil Beban Kritis, Perhatian Manajemen, dan Filter Tabel `OVERLOAD`.
  - *Mengapa*: Sebelumnya terdapat inkonsistensi di mana Kartu KPI menghitung **3 unit overload** (hanya status *Operasi*: `KF316` 98%, `KA0482` 84%, `KA0026` 82%), sedangkan Perhatian Manajemen dan Tabel menghitung **4 unit** (ikut memasukkan `KJ709` 90% yang masih berstatus *Dilokasi*). Dengan aturan baru yang dikonfirmasi pengguna, seluruh bagian dashboard konsisten menampilkan **3 unit overload** yang benar-benar sedang beroperasi menyuplai beban, sementara unit *Dilokasi* tetap terpantau pada kategori komisioning siap operasi.

- **Keputusan 3: Penghapusan Seluruh Teks Narasi Statis (Full Dynamic Narrative)**
  - *Pendekatan Terpilih*: Membangun seluruh kalimat ringkasan di *Executive Summary Banner*, *Visualizations*, *Management Attention*, dan *Modal Sumber Data* secara dinamis dari hasil kalkulasi baris spreadsheet saat itu juga.
  - *Mengapa*: Saat data di spreadsheet diubah (misalnya unit *Belum Tiba* berubah menjadi *Operasi*, atau kapasitas bertambah), teks narasi otomatis berubah mengikuti data riil (bukan lagi menampilkan angka statis `9.710 kVA` atau `20 unit operasi`, melainkan angka aktual `10.350 kVA`, `21 unit operasi`, `2 unit dilokasi`, dan `9 unit belum tiba`).

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Diagram Arsitektur & Alur Sinkronisasi Realtime

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   SUMBER DATA SPREADSHEET (SINGLE SOURCE)                  │
│  • Public Google Sheets CSV/GViz Stream (Tanpa Perlu Login OAuth)          │
│  • Live Source Dataset Stream (Anti-Cache ?t=timestamp + no-store)         │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
┌───────────────────────────────────┐   ┌────────────────────────────────────┐
│   AUTO-SYNC SCHEDULER (30 DETIK)  │   │   WINDOW FOCUS & VISIBILITY HOOK   │
│ • Interval presisi 30s via Ref    │   │ • Trigger instan saat tab kembali  │
│ • Anti-duplicate fetch lock       │   │   aktif (visibilitychange / focus) │
└─────────────────┬─────────────────┘   └─────────────────┬──────────────────┘
                  └───────────────────┬───────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   DATA PARSER & NORMALIZATION ENGINE                       │
│  • Pemetaan Kolom Dinamis (Kapasitas, Status, ULP, Gardu, Beban, BBM)      │
│  • Pembacaan Kolom Atribut Instalasi (ATS) & Team Aktual (Tanpa Paksaan)   │
│  • Kalkulasi Metrik Ketat Berbasis Status "Operasi" (Overload, Beban, BBM) │
│  • Generator Item Perhatian Manajemen & Narasi Dinamis 100%                │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
        ┌───────────────────┬─────────┴─────────┬────────────────────┐
        ▼                   ▼                   ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌────────────────┐
│  KARTU KPI &  │   │  PETA LOKASI  │   │  VISUALISASI  │   │ TABEL MONITOR  │
│ BANNER UTAMA  │   │ GENSET MADURA │   │ & MANAJEMEN   │   │ & FILTER CEPAT │
│ (21 Operasi,  │   │ (32 Titik     │   │ (3 Overload   │   │ (Sinkron dengan│
│ 10.350 kVA)   │   │  Koordinat)   │   │  Operasi)     │   │  Angka KPI)    │
└───────────────┘   └───────────────┘   └───────────────┘   └────────────────┘
```

### Model Data & Perbaikan Pemetaan Kolom
1. **Perbaikan Parser Baris (`processRawRows`)**:
   - Membaca nilai kolom `TEAM` sesuai isi sel sebenarnya di spreadsheet (hanya `UP3 MDR` pada No 1 dan `HAR SBB` pada No 7; baris yang kosong ditampilkan sebagai `-` tanpa dipaksa menjadi `UP3 MDR`).
   - Membaca kolom atribut perangkat (seperti `ATS` pada kolom ke-23 di baris No 1 dan No 7) dan menggabungkannya ke informasi tindak lanjut/perangkat agar tidak ada data spreadsheet yang hilang.
2. **Penyelarasan Metrik Operasional (`calculateMetrics` & `generateManagementActionItems`)**:
   - `unitOperasi`: 21 unit (`6.650 kVA`), `unitDilokasi`: 2 unit (`550 kVA`), `unitBelumTiba`: 9 unit (`3.150 kVA`), `totalCapacityKva`: `10.350 kVA` (`10,35 MVA`).
   - `unitOverloadCount`: Dihitung khusus dari unit berstatus `Operasi` dengan `% Beban >= 80%` (3 unit: `KF316` 98%, `KA0482` 84%, `KA0026` 82%).
   - Filter Cepat `Beban Kritis >80%` (`overloadOnly`) pada tabel dan daftar unit di *Perhatian Manajemen* menggunakan kriteria yang sama (`status === 'Operasi' && persenBebanGenset >= 80`) sehingga angka pada tombol filter, kartu KPI, grafik, dan hasil tabel selalu identik.
3. **Perbaikan Arsitektur Auto-Sync 30 Detik**:
   - Memisahkan *side-effect* pemanggilan `fetchData()` dari fungsi *state updater* React menggunakan `useRef` untuk referensi fungsi terbaru, mencegah *stale closure*, dan menambahkan pendengar event `visibilitychange` serta `focus` pada `window` untuk sinkronisasi seketika saat pengguna kembali ke tab dashboard.
