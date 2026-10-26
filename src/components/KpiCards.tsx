import React from 'react';
import {
  Zap,
  CheckCircle2,
  Clock,
  Gauge,
  Fuel,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Building2,
  MapPin,
} from 'lucide-react';
import { DashboardMetrics } from '../types/dashboard';

interface KpiCardsProps {
  metrics: DashboardMetrics;
  onFilterQuickStatus?: (status: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  metrics,
  onFilterQuickStatus,
}) => {
  return (
    <div className="space-y-4">
      {/* Primary KPI Grid (6 Top Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Total Unit Genset */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Genset
            </span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {metrics.totalUnits}
            </span>
            <span className="text-xs font-medium text-slate-500">Unit</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Daya Terpasang:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {metrics.totalCapacityKva.toLocaleString('id-ID')} kVA
            </span>
          </div>
        </div>

        {/* Card 2: Unit Beroperasi Aktif */}
        <div
          onClick={() => onFilterQuickStatus?.('Operasi')}
          className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm hover:shadow hover:border-emerald-400 transition-all cursor-pointer group"
          title="Klik untuk memfilter daftar genset yang telah aktif beroperasi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Operasi Aktif
            </span>
            <div className="p-2 bg-emerald-100/70 text-emerald-800 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-emerald-800 font-mono">
              {metrics.unitOperasi}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {metrics.totalUnits} Unit
            </span>
            <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {metrics.realisasiOperasiPersen.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Kapasitas Operasi:</span>
            <span className="font-semibold text-emerald-700 font-mono">
              {metrics.unitOperasiKva.toLocaleString('id-ID')} kVA ({metrics.realisasiKapasitasOperasiPersen.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Card 3: Beban Riil Tersuplai */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Beban Tersuplai
            </span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Gauge className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-blue-700 font-mono">
              {metrics.totalBebanOperasiKva.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-semibold text-blue-600">kVA</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Rata-rata Loading:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {metrics.rataRataLoadingPersen}% (Max: {metrics.maxLoadingPersen}%)
            </span>
          </div>
        </div>

        {/* Card 4: Konsumsi BBM Solar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Konsumsi BBM
            </span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Fuel className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-amber-700 font-mono">
              {metrics.totalEstimasiBbmLiterJam.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-medium text-slate-500">L/jam</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Estimasi Harian:</span>
            <span className="font-semibold text-slate-800 font-mono">
              ~{Math.round(metrics.totalEstimasiBbmLiterJam * 24).toLocaleString('id-ID')} L/hari
            </span>
          </div>
        </div>

        {/* Card 5: Dilokasi Siap Operasi */}
        <div
          onClick={() => onFilterQuickStatus?.('Dilokasi')}
          className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm hover:shadow hover:border-blue-400 transition-all cursor-pointer group"
          title="Klik untuk memfilter unit yang telah tiba di gardu dan siap operasi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              Dilokasi Siap
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-100 transition-colors">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-blue-800 font-mono">
              {metrics.unitDilokasi}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {metrics.totalUnits} Unit
            </span>
            <span className="ml-auto text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {((metrics.unitDilokasi / (metrics.totalUnits || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Kapasitas Siap:</span>
            <span className="font-semibold text-blue-800 font-mono">
              {metrics.unitDilokasiKva.toLocaleString('id-ID')} kVA
            </span>
          </div>
        </div>

        {/* Card 6: Belum Tiba / Logistik */}
        <div
          onClick={() => onFilterQuickStatus?.('Belum Tiba')}
          className="bg-white rounded-xl border border-amber-300 p-4 shadow-sm hover:shadow hover:border-amber-400 transition-all cursor-pointer group"
          title="Klik untuk memfilter unit genset yang masih dalam perjalanan / belum tiba"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Belum Tiba
            </span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg group-hover:bg-amber-200 transition-colors">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-amber-700 font-mono">
              {metrics.unitBelumTiba}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {metrics.totalUnits} Unit
            </span>
            <span className="ml-auto text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
              {((metrics.unitBelumTiba / (metrics.totalUnits || 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Kapasitas Pending:</span>
            <span className="font-semibold text-amber-800 font-mono">
              {metrics.unitBelumTibaKva.toLocaleString('id-ID')} kVA
            </span>
          </div>
        </div>

      </div>

      {/* Progress & Quick Alert Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Status Operasional Penempatan 32 Unit Genset Madura
            </span>
            <span className="text-xs text-slate-500">
              (Total {metrics.totalCapacityKva.toLocaleString('id-ID')} kVA / ~{metrics.totalCapacityMva} MVA)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 inline-block"></span>
              Operasi: {metrics.unitOperasi} unit ({metrics.realisasiOperasiPersen.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block"></span>
              Dilokasi: {metrics.unitDilokasi} unit ({((metrics.unitDilokasi / metrics.totalUnits) * 100).toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block"></span>
              Belum Tiba: {metrics.unitBelumTiba} unit ({((metrics.unitBelumTiba / metrics.totalUnits) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Multi-segment stacked progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 flex overflow-hidden p-0.5 border border-slate-200">
          <div
            style={{ width: `${(metrics.unitOperasi / (metrics.totalUnits || 1)) * 100}%` }}
            className="bg-emerald-600 rounded-l-full h-full transition-all duration-500 cursor-pointer"
            title={`Operasi: ${metrics.unitOperasi} unit (${metrics.unitOperasiKva.toLocaleString('id-ID')} kVA)`}
          ></div>
          <div
            style={{ width: `${(metrics.unitDilokasi / (metrics.totalUnits || 1)) * 100}%` }}
            className="bg-blue-600 h-full transition-all duration-500 cursor-pointer"
            title={`Dilokasi Siap: ${metrics.unitDilokasi} unit (${metrics.unitDilokasiKva.toLocaleString('id-ID')} kVA)`}
          ></div>
          <div
            style={{ width: `${(metrics.unitBelumTiba / (metrics.totalUnits || 1)) * 100}%` }}
            className="bg-amber-400 rounded-r-full h-full transition-all duration-500 cursor-pointer"
            title={`Belum Tiba: ${metrics.unitBelumTiba} unit (${metrics.unitBelumTibaKva.toLocaleString('id-ID')} kVA)`}
          ></div>
        </div>

        {/* Bottom operational notice */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>
            ⚡ <strong>Realisasi Kedatangan di Lokasi:</strong> Sebanyak <strong>{metrics.unitOperasi + metrics.unitDilokasi} dari {metrics.totalUnits} unit ({metrics.realisasiTibaPersen.toFixed(1)}%)</strong> telah berada di Pulau Madura.
          </span>
          <span className="font-semibold text-slate-700">
            Total Beban Pasokan: {metrics.totalBebanOperasiKva.toLocaleString('id-ID')} kVA • BBM: {metrics.totalEstimasiBbmLiterJam} L/jam
          </span>
        </div>
      </div>
    </div>
  );
};
