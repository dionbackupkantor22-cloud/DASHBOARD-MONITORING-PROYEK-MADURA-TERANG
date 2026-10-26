import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Database,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DataSourceState } from '../types/dashboard';
import { extractSpreadsheetId } from '../services/dataService';

interface SheetsConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSource: DataSourceState;
  user: User | null;
  onLogin: () => void;
  onSelectSourceType: (type: 'source_file' | 'google_sheets_live') => void;
  onConnectSheetsId: (sheetId: string) => Promise<void>;
  isLoggingIn: boolean;
}

export const SheetsConnectionModal: React.FC<SheetsConnectionModalProps> = ({
  isOpen,
  onClose,
  dataSource,
  user,
  onLogin,
  onSelectSourceType,
  onConnectSheetsId,
  isLoggingIn,
}) => {
  const [inputUrl, setInputUrl] = useState<string>(dataSource.spreadsheetId || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplySheets = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const sheetId = extractSpreadsheetId(inputUrl);
    if (!sheetId) {
      setLocalError('Harap masukkan URL Spreadsheet atau ID Spreadsheet Google yang valid.');
      return;
    }

    if (!user) {
      setLocalError('Harap Masuk dengan Google terlebih dahulu untuk memberikan izin akses membaca Google Sheets.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConnectSheetsId(sheetId);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan ke Google Sheets';
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDefaultFile = () => {
    onSelectSourceType('source_file');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Konfigurasi Sumber Data Spreadsheet
              </h3>
              <p className="text-xs text-slate-400">
                Pilih sumber data live Google Sheets atau file dataset Proyek Madura Terang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Active Source Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Pilih Moda Integrasi Data:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: File Sumber Proyek Madura Terang */}
              <div
                onClick={handleSelectDefaultFile}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  dataSource.sourceType === 'source_file'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Database className="h-4 w-4 text-emerald-700" />
                      Spreadsheet Sumber
                    </span>
                    {dataSource.sourceType === 'source_file' && (
                      <span className="h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Membaca dataset aktual <strong>Data_Penempatan_Genset_Mobile</strong> (32 unit genset, 9.710 kVA, beban riil, konsumsi BBM, gardu, relokasi, dan titik Google Maps).
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 mt-2 bg-emerald-100/60 px-2 py-0.5 rounded w-fit">
                  Data Terverifikasi Siap Pakai
                </span>
              </div>

              {/* Option 2: Live Google Sheets API */}
              <div
                onClick={() => onSelectSourceType('google_sheets_live')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  dataSource.sourceType === 'google_sheets_live'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                      Google Sheets Live
                    </span>
                    {dataSource.sourceType === 'google_sheets_live' && (
                      <span className="h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sinkronisasi langsung dengan file Google Sheets di Google Drive via Google Sheets API resmi.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-blue-800 mt-2 bg-blue-100/60 px-2 py-0.5 rounded w-fit">
                  Real-time Cloud Sync
                </span>
              </div>

            </div>
          </div>

          {/* Google Auth Status Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block text-xs">
                  {user ? `Terhubung: ${user.email || user.displayName}` : 'Autentikasi Google Workspace'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {user
                    ? 'Izin akses baca Google Sheets (spreadsheets.readonly) aktif.'
                    : 'Masuk dengan Google untuk mengizinkan aplikasi membaca Google Sheets Anda.'}
                </span>
              </div>
            </div>

            {!user && (
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 border border-slate-300 shadow-xs flex-shrink-0 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-blue-600" />
                <span>{isLoggingIn ? 'Memproses...' : 'Masuk Google'}</span>
              </button>
            )}
          </div>

          {/* Form for Google Sheets URL if Live Sheets is selected */}
          {dataSource.sourceType === 'google_sheets_live' && (
            <form onSubmit={handleApplySheets} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  URL Spreadsheet atau Spreadsheet ID:
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tempel link spreadsheet proyek atau ID dari URL dokumen Google Sheets Anda.
                </span>
              </div>

              {localError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
                  <span>{localError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
                    isSubmitting || !user
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800'
                  }`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{isSubmitting ? 'Memverifikasi...' : 'Hubungkan & Sinkronkan'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Read-only Governance Notice */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">
              Prinsip Keamanan & Tata Kelola Data:
            </span>
            <p>
              • Dashboard bersifat <strong>read-only</strong>. Sistem tidak mengubah, mengedit, atau menghapus sel pada Google Sheets sumber.
            </p>
            <p>
              • Akses token OAuth disimpan murni di memori kerja (in-memory) dan tidak pernah disimpan ke local storage browser.
            </p>
            <p>
              • Pembaruan data otomatis berjalan di latar belakang setiap <strong>60 detik</strong> dengan proteksi anti-duplicate request.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">
            Mode Saat Ini: <strong>{dataSource.sourceType === 'google_sheets_live' ? 'Google Sheets Live' : 'Spreadsheet Sumber Proyek'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
