import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { DashboardMetrics, FilterState } from '../types/dashboard';

interface ExecutiveSummaryBannerProps {
  metrics: DashboardMetrics;
  filterState: FilterState;
  onSelectQuickFilter: (key: string) => void;
}

export const ExecutiveSummaryBanner: React.FC<ExecutiveSummaryBannerProps> = ({
  metrics,
  filterState,
  onSelectQuickFilter,
}) => {
  const formatBbm = (val: number) =>
    val.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Narrative Box */}
        <div className="space-y-2 max-w-4xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="h-4 w-4" />
            <span>Executive Briefing Penanganan Pasokan Madura (Sinkron Live Google Sheets)</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
            {metrics.unitOperasi} dari {metrics.totalUnits} Unit Genset ({metrics.realisasiOperasiPersen.toFixed(1)}%) Beroperasi Aktif ({metrics.unitOperasiKva.toLocaleString('id-ID')} kVA)
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Dari total armada <strong className="text-white">{metrics.totalUnits} unit genset</strong> dengan kapasitas total{' '}
            <strong className="text-emerald-400 font-mono">{metrics.totalCapacityKva.toLocaleString('id-ID')} kVA</strong> (~{metrics.totalCapacityMva} MVA),
            sebanyak <strong className="text-emerald-400">{metrics.unitOperasi} unit ({metrics.unitOperasiKva.toLocaleString('id-ID')} kVA)</strong> telah beroperasi melayani beban trafo <strong className="text-white font-mono">{metrics.unitOperasiBebanKva.toLocaleString('id-ID')} kVA</strong> ({formatBbm(metrics.unitOperasiBbmJam)} L/jam BBM),
            sebanyak <strong className="text-blue-400">{metrics.unitDilokasi} unit ({metrics.unitDilokasiKva.toLocaleString('id-ID')} kVA)</strong> berstatus <em>Di lokasi</em> (beban trafo {metrics.unitDilokasiBebanKva} kVA),
            dan <strong className="text-amber-400">{metrics.unitBelumTiba} unit ({metrics.unitBelumTibaKva.toLocaleString('id-ID')} kVA)</strong> berstatus <em>Belum Tiba</em> (beban trafo {metrics.unitBelumTibaBebanKva} kVA).
          </p>
        </div>

        {/* Quick KPI Badge Cluster matching Tab DASHBOARD Totals */}
        <div className="flex flex-row lg:flex-col gap-2.5 sm:gap-3 flex-shrink-0 bg-slate-800/80 p-3 sm:p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">Total Kapasitas (32 Unit):</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {metrics.totalCapacityKva.toLocaleString('id-ID')} kVA
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">Total Beban Trafo:</span>
            <span className="font-mono font-bold text-white text-sm">
              {metrics.totalBebanTrafoAllKva.toLocaleString('id-ID')} kVA
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">Total Estimasi BBM:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {formatBbm(metrics.totalEstimasiBbmAllJam)} L/jam
            </span>
          </div>
        </div>

      </div>

      {/* Quick Navigation Filter Pills */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold mr-1 text-[11px] uppercase tracking-wider">
          Filter Cepat:
        </span>

        <button
          onClick={() => onSelectQuickFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterState.status === 'ALL' && !filterState.overloadOnly && !filterState.relokasiOnly
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          Semua Unit ({metrics.totalUnits})
        </button>

        <button
          onClick={() => onSelectQuickFilter('Operasi')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterState.status === 'Operasi'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Operasi ({metrics.unitOperasi})
        </button>

        <button
          onClick={() => onSelectQuickFilter('Di lokasi')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterState.status === 'Di lokasi'
              ? 'bg-blue-600 text-white font-semibold'
              : 'bg-slate-800 hover:bg-slate-700 text-blue-400'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          Di Lokasi ({metrics.unitDilokasi})
        </button>

        <button
          onClick={() => onSelectQuickFilter('Belum Tiba')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterState.status === 'Belum Tiba'
              ? 'bg-amber-600 text-white font-semibold'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-400'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Belum Tiba ({metrics.unitBelumTiba})
        </button>

        <button
          onClick={() => onSelectQuickFilter('OVERLOAD')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterState.overloadOnly
              ? 'bg-red-600 text-white font-semibold'
              : 'bg-slate-800 hover:bg-slate-700 text-red-300'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Beban Kritis &gt;=80% ({metrics.unitOverloadCount})
        </button>
      </div>
    </div>
  );
};
