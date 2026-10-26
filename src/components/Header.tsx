import React from 'react';
import {
  RefreshCw,
  Database,
  CloudCheck,
  AlertTriangle,
  FileSpreadsheet,
  LogIn,
  LogOut,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DataSourceState } from '../types/dashboard';

interface HeaderProps {
  dataSource: DataSourceState;
  onRefresh: () => void;
  onOpenSheetsModal: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dataSource,
  onRefresh,
  onOpenSheetsModal,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
}) => {
  const formattedTime = dataSource.lastUpdated
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Asia/Jakarta',
      }).format(dataSource.lastUpdated) + ' WIB'
    : 'Belum dimuat';

  const isLiveSheets = dataSource.sourceType === 'google_sheets_live';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top corporate bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-inner flex-shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                  Dashboard Monitoring Proyek Madura Terang
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-700/60 rounded">
                  PLN SIAGA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive Tracking Distribusi, Mobilisasi & Interkoneksi Genset Keandalan Madura
              </p>
            </div>
          </div>

          {/* Controls & Connection Status */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-end md:self-center">
            
            {/* Source & Status Pill */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <span className="flex h-2 w-2 relative">
                {dataSource.isSyncing ? (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                ) : dataSource.isStale ? (
                  <span className="inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                ) : (
                  <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    dataSource.isSyncing
                      ? 'bg-amber-400'
                      : dataSource.isStale
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                ></span>
              </span>

              <div className="flex flex-col">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  {isLiveSheets ? (
                    <>
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                      Google Sheets Live
                    </>
                  ) : (
                    <>
                      <Database className="h-3.5 w-3.5 text-cyan-400" />
                      Spreadsheet Sumber
                    </>
                  )}
                  {dataSource.isStale && (
                    <span className="text-[10px] text-amber-400 font-semibold">(Data Lama)</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">
                  {dataSource.isSyncing
                    ? 'Sedang memperbarui...'
                    : `Update: ${formattedTime}`}
                </span>
              </div>

              {/* Countdown badge */}
              <div
                className="ml-1 pl-2 border-l border-slate-700 text-[10px] text-slate-400 hidden lg:block"
                title="Pembaruan otomatis data setiap 60 detik"
              >
                Auto-sync: <span className="font-mono text-emerald-400">{dataSource.autoRefreshCountdown}s</span>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={dataSource.isSyncing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                dataSource.isSyncing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white border border-slate-600'
              }`}
              title="Segarkan data seketika dari sumber"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${dataSource.isSyncing ? 'animate-spin text-emerald-400' : ''}`}
              />
              <span className="hidden sm:inline">Segarkan Data</span>
            </button>

            {/* Connect / Change Sheets Button */}
            <button
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white transition-colors shadow-sm"
              title="Kelola integrasi Google Sheets atau ubah Spreadsheet ID"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Sumber Data</span>
            </button>

            {/* Google Auth Account */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-700">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-7 w-7 rounded-full border border-slate-600"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-200">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                )}
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                  title={`Keluar (${user.email || user.displayName})`}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
                title="Masuk dengan akun Google untuk akses Google Sheets pribadi/tim"
              >
                <LogIn className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden sm:inline">Masuk Google</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Warning ribbon if data is stale or error occurred */}
      {dataSource.error && (
        <div className="bg-red-950/90 border-t border-b border-red-800/80 px-4 py-2 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>
              <strong>Peringatan Pembaruan:</strong> {dataSource.error}. Dashboard tetap menampilkan data terakhir yang berhasil dimuat.
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="text-xs font-semibold underline text-red-300 hover:text-white ml-2 flex-shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </header>
  );
};
