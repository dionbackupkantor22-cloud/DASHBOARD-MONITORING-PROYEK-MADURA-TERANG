import React from 'react';
import { ShieldCheck, Info, FileSpreadsheet, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-100">
          
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Integritas & Tata Kelola Data
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Dashboard ini beroperasi secara <strong>Read-Only</strong> dan tidak mengubah sel dalam Google Sheets atau file sumber. Seluruh KPI, diagram persentase, dan kartu metrik dikalkulasi langsung dari struktur baris aktual yang berhasil dimuat.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-slate-700" />
              Keamanan Kredensial
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Autentikasi menggunakan Google Workspace OAuth 2.0 dengan prinsip hak akses terkecil (<em>spreadsheets.readonly</em>). Token akses disimpan eksklusif pada memori runtime (in-memory) dan tidak disimpan di local storage peramban.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-600" />
              Siklus Sinkronisasi
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Pembaruan data otomatis berkala setiap 60 detik dengan proteksi pencegahan permintaan bertumpuk (concurrency lock). Jika jaringan terputus, data cache terakhir tetap dipertahankan dengan indikator peringatan visual.
            </p>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>
            © 2026 Dashboard Monitoring Proyek Madura Terang • Sistem Manajemen Keandalan Kelistrikan Madura
          </span>
          <span className="font-mono">
            Versi Produksi 1.0 • Responsif Desktop, Tablet & Smartphone
          </span>
        </div>

      </div>
    </footer>
  );
};
