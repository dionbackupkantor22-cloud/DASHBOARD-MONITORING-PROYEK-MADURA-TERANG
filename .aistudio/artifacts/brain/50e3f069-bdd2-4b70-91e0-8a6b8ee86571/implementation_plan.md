# Integrasi Penuh 3 Sheet (DATA, DASHBOARD, REGU) & Penyelarasan 100% Google Sheets Proyek Madura Terang

Perubahan ini menanamkan secara permanen link Google Sheets resmi (`1NUXMaWlM0pvqE036ke3tDaO2GX6nFO_-d961dar5FNM`) sebagai sumber data utama yang menyinkronkan ketiga tab (**`DATA`**, **`DASHBOARD`**, dan **`REGU`**) secara otomatis setiap **30 detik** dan saat tab browser dibuka kembali, serta menyamakan 100% seluruh angka, tabel rekapitulasi, dan rincian material tanpa ada satu pun data yang terlewat.

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan utama yang telah dikonfirmasi pengguna dan menjadi acuan mutlak implementasi:

- **Keputusan Terkonfirmasi 1 (Tampilkan Semua 3 Sheet Lengkap)**: Dashboard menyinkronkan dan menampilkan seluruh isi dari ketiga sheet di dokumen Google Sheets:
  1. **Sheet `DASHBOARD` (`gid=164028602`)**: Menampilkan ke-3 Tabel Rekapitulasi resmi secara utuh dan presisi (*Rekap Berdasarkan Status*, *Rekap Berdasarkan ULP*, dan *Rekap Berdasarkan Kapasitas Genset kVA*).
  2. **Sheet `DATA` (`gid=0`)**: Menampilkan ke-32 baris unit genset terbaru beserta peta lokasi 32 gardu (termasuk 8 kode gardu baru: `KA131`, `KC713`, `KA203`, `KH081`, `KJ001`, `KJ708`, `KB001`, `KA603`).
  3. **Sheet `REGU` (`gid=1442113655`)**: Menampilkan tab khusus **Data Regu & Material Instalasi** yang memuat seluruh 27 baris penugasan gardu + baris `TOTAL` (`ULP`, `GARDU`, `KETERANGAN`, `KOORDINAT`, kolom Regu `SBB, SBS, SBU, GRK, SDA, MDR`, kebutuhan material `ATS (A)`, `A3CS (M) = 320`, `SKAT 150 (BH) = 288`, `GROUNDING (SET) = 27`, `TEAM`, dan `KETERANGAN`).
- **Keputusan Terkonfirmasi 2 (Penyelarasan 100% Rumus & Angka dengan Tab `DASHBOARD` Google Sheets)**:
  - **Total Armada**: **32 Unit** dengan Total Kapasitas **10.210 kVA** (**10,21 MVA**).
  - **Rincian Status (Persis Tabel 1 Tab `DASHBOARD`)**:
    - **Operasi**: **29 Unit** | Kapasitas **8.960 kVA** | Beban Trafo **4.531 kVA** | Estimasi BBM **1.598,54 Liter/jam**.
    - **Di lokasi**: **2 Unit** | Kapasitas **900 kVA** | Beban Trafo **265 kVA** | Estimasi BBM **93,49 Liter/jam** (*No 1: 600 kVA di Pamekasan KA131 & No 20: 300 kVA di Sumenep KB001*).
    - **Belum Tiba**: **1 Unit** | Kapasitas **350 kVA** | Beban Trafo **112 kVA** | Estimasi BBM **39,51 Liter/jam** (*No 21: 350 kVA di Pamekasan KA603*).
    - **Total Keseluruhan**: **32 Unit** | Kapasitas **10.210 kVA** | Total Beban Trafo **4.908 kVA** | Total Estimasi BBM **1.731,54 Liter/jam**.
- **Keputusan Terkonfirmasi 3 (Auto-Sync 30 Detik + Fokus Tab Tanpa Login)**: Link Google Sheets ditanamkan langsung sebagai default utama aplikasi. Setiap kali halaman dibuka, di-*refresh*, atau setiap 30 detik sekali, aplikasi langsung menarik data terbaru dari ketiga sheet Google Sheets tanpa perlu login atau input link manual.

---

## 1. Overview & Core Concept

- **Apa yang Dilakukan**: Menghubungkan dashboard secara langsung dan permanen ke dokumen Google Sheets `1NUXMaWlM0pvqE036ke3tDaO2GX6nFO_-d961dar5FNM` (Tab `DATA`, `DASHBOARD`, dan `REGU`), memastikan setiap sel, baris total, dan tabel rekapitulasi yang ada di Google Sheets tampil 100% identik di dalam aplikasi.
- **Target Pengguna**: Manajemen Eksekutif PLN, Koordinator Proyek Madura Terang, serta Tim Teknis Lapangan (`UP3 MDR`, `HAR SBB`, `HAR SDA`, `HAR MDR`, `HAR GRK`).
- **Nilai Utama**: Kemudahan pemantauan satu pintu di mana seluruh tabel di tab `DASHBOARD`, rincian 32 unit di tab `DATA`, serta tabel personel & material di tab `REGU` tersaji lengkap dan otomatis ter-update secara realtime.

---

## 2. User Experience & Visual Design

- **Struktur Navigasi Lengkap (Mencakup Ketiga Sheet)**:
  1. **Ringkasan & Tabel Rekap (`Sheet DASHBOARD`)**: Menampilkan Kartu KPI Utama yang sinkron 100% dengan tab `DASHBOARD`, diikuti oleh **3 Tabel Rekapitulasi Resmi** (*Rekap per Status*, *Rekap per ULP*, dan *Rekap per Kapasitas Genset kVA* beserta baris `Total`-nya), Peta Geografis 32 Unit, dan Grafik Visualisasi.
  2. **Tabel Monitoring 32 Unit (`Sheet DATA`)**: Menampilkan seluruh 32 baris dan kolom dari sheet `DATA` (`No`, `Kapasitas Genset (kVA)`, `Status`, `Tiba`, `Install`, `ULP`, `GARDU`, `KAPASITAS GARDU`, `BEBAN (kVA)`, `ESTIMASI BEBAN (A)`, `% BEBAN PER KAPASITAS GENSET`, `ESTIMASI BBM PER JAM (LITER)`, `ULP/GARDU/KAPASITAS/BEBAN/%BEBAN Relokasi`, `PEMILIK GENSET`, `TITIK LOKASI AWAL`, `TITIK LOKASI BARU`, `KETERANGAN`, `TINDAK LANJUT / ATS`, dan `TEAM`).
  3. **Data Regu & Material (`Sheet REGU`)**: Tab khusus yang menampilkan tabel matriks dari sheet `REGU` secara utuh (27 baris + baris `TOTAL`: `No.`, `ULP`, `GARDU`, `KETERANGAN`, `KOORDINAT`, matriks Regu `SBB | SBS | SBU | GRK | SDA | MDR`, material `ATS (A) | A3CS (M) | SKAT 150 (BH) | GROUNDING (SET)`, `TEAM`, dan `KETERANGAN` seperti `RELOKASI`, `TAHAP 2`, `SUDAH INSTAL`), dilengkapi kartu ringkasan material (`Total A3CS: 320 m`, `Total SKAT 150: 288 bh`, `Total Grounding: 27 set`).
  4. **Peta Lokasi Genset & Perhatian Manajemen**: Terintegrasi langsung dengan data terbaru dari sheet `DATA` dan `REGU`.
- **Tipografi & Disiplin Tabel**:
  - Seluruh angka kapasitas, beban trafo (`4.908 kVA` total / `4.531 kVA` operasi), dan estimasi konsumsi BBM (`1.731,54 L/jam` total / `1.598,54 L/jam` operasi) ditampilkan dengan angka monospasi (`tabular-nums`) dan format desimal yang presisi sesuai tampilan Google Sheets.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Penarikan Paralel 3 Sheet Sekaligus (`Promise.all` pada `gid=0`, `gid=164028602`, `gid=1442113655`)**
  - *Pendekatan Terpilih*: Setiap siklus sinkronisasi (saat aplikasi dibuka, setiap 30 detik, atau saat tab browser aktif kembali), layanan data menarik CSV terbaru dari ketiga GID secara paralel dan memperbarui state `records` (Sheet `DATA`), `dashboardSummaryTables` (Sheet `DASHBOARD`), dan `reguRecords` (Sheet `REGU`).
  - *Mengapa*: Menjamin apabila ada perubahan pada salah satu dari ketiga tab di Google Sheets (baik perubahan status genset di `DATA`, tabel rekap di `DASHBOARD`, maupun update material/tim di `REGU`), ketiganya langsung ter-update serentak di aplikasi tanpa jeda.

- **Keputusan 2: Penyelarasan Penuh Tabel Rekap `DASHBOARD` & Perhitungan Otomatis**
  - *Pendekatan Terpilih*: Menampilkan angka total (`10.210 kVA`, `4.908 kVA` Beban Trafo, `1.731,54 L/jam` BBM) beserta rincian per status (`Operasi`: 29 unit / 8.960 kVA / 4.531 kVA / 1.598,54 L/jam; `Di lokasi`: 2 unit / 900 kVA / 265 kVA / 93,49 L/jam; `Belum Tiba`: 1 unit / 350 kVA / 112 kVA / 39,51 L/jam) persis mengikuti struktur tab `DASHBOARD` di Google Sheets.
  - *Mengapa*: Pengguna membutuhkan kesamaan 100% antara angka yang terlihat di lembar kerja `DASHBOARD` Google Sheets dengan angka yang tampil di layar aplikasi.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Diagram Arsitektur Multi-Sheet Real-Time Sync

```
┌──────────────────────────────────────────────────────────────────────────────┐
│     GOOGLE SHEETS UTAMA (ID: 1NUXMaWlM0pvqE036ke3tDaO2GX6nFO_-d961dar5FNM)    │
├────────────────────────┬──────────────────────────┬──────────────────────────┤
│   Tab 1: DATA          │   Tab 2: DASHBOARD       │   Tab 3: REGU            │
│   (gid=0)              │   (gid=164028602)        │   (gid=1442113655)       │
│   • 32 Baris Genset    │   • Rekap Status         │   • 27 Baris Regu & Tim  │
│   • Beban, Ampere, BBM │   • Rekap Wilayah ULP    │   • Material ATS, A3CS,  │
│   • Link Google Maps   │   • Rekap Kapasitas kVA  │     SKAT 150, Grounding  │
└───────────┬────────────┴─────────────┬────────────┴─────────────┬────────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│         MULTI-SHEET REALTIME SYNC ENGINE (AUTO-SYNC 30s + TAB FOCUS)         │
│  • Fetch paralel CSV publik ke-3 GID dengan cache-busting (?t=timestamp)     │
│  • Fallback snapshot lokal yang telah diperbarui 100% sesuai sheet terbaru   │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
       ┌───────────────────────┬───────┴───────────┬───────────────────────┐
       ▼                       ▼                   ▼                       ▼
┌────────────────┐   ┌───────────────────┐   ┌─────────────────┐   ┌────────────────┐
│  REKAP & KPI   │   │ TABEL MONITORING  │   │ TABEL REGU &    │   │  PETA MADURA   │
│  3 Tabel Resmi │   │ 32 Unit Lengkap   │   │ MATERIAL (27    │   │  32 Titik Gardu│
│  Tab DASHBOARD │   │ (Sheet DATA)      │   │ Baris + TOTAL)  │   │  Terbaru       │
└────────────────┘   └───────────────────┘   └─────────────────┘   └────────────────┘
```

### Rincian Pemetaan Data & Komponen
1. **Default Konfigurasi Permanen**:
   - `DEFAULT_SPREADSHEET_ID = '1NUXMaWlM0pvqE036ke3tDaO2GX6nFO_-d961dar5FNM'`
   - `GID_DATA = '0'`, `GID_DASHBOARD = '164028602'`, `GID_REGU = '1442113655'`
   - Saat aplikasi dibuka pertama kali, sistem langsung terhubung ke Google Sheets tersebut tanpa perlu input manual.
2. **Normalisasi Status `"Di lokasi"` & Penambahan Koordinat 8 Gardu Baru**:
   - Menangani ejaan `"Di lokasi"` (dengan spasi) dan `"Dilokasi"` secara identik di seluruh filter, badge, grafik, dan perhitungan.
   - Menambahkan koordinat daratan akurat untuk 8 kode gardu baru di sheet `DATA` (`KA131`, `KC713`, `KA203`, `KH081`, `KJ001`, `KJ708`, `KB001`, `KA603`) serta gardu di sheet `REGU` (`KA0544`, `KA0203`, `KA0603`, `KF035`).
3. **Komponen Rekapitulasi Sheet `DASHBOARD` & Komponen Sheet `REGU`**:
   - Menampilkan 3 tabel rekapitulasi persis seperti di `gid=164028602` (*Rekap Status*, *Rekap ULP*, *Rekap Kapasitas (kVA)*) lengkap dengan baris `Total`.
   - Menambahkan tampilan khusus **Sheet REGU & Material** yang menampilkan seluruh kolom (`No.`, `ULP`, `GARDU`, `KETERANGAN`, `KOORDINAT`, `REGU [SBB, SBS, SBU, GRK, SDA, MDR]`, `ATS (A)`, `A3CS (M)`, `SKAT 150 (BH)`, `GROUNDING (SET)`, `TEAM`, `KETERANGAN`) beserta baris `TOTAL` (`320`, `288`, `27`).
