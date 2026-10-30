import React, { useState } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Layers,
  Info,
  Gauge,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { DashboardMetrics } from '../types/dashboard';

interface VisualizationsProps {
  metrics: DashboardMetrics;
  onSelectProvider?: (provider: string) => void;
  onSelectStatus?: (status: string) => void;
  onSelectRegion?: (region: string) => void;
}

export const Visualizations: React.FC<VisualizationsProps> = ({
  metrics,
  onSelectProvider,
  onSelectStatus,
  onSelectRegion,
}) => {
  const [metricMode, setMetricMode] = useState<'capacity' | 'beban' | 'units'>('capacity');
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Status Donut Data
  const statusData = [
    {
      label: 'Operasi',
      count: metrics.unitOperasi,
      kva: metrics.unitOperasiKva,
      color: '#059669', // emerald-600
      bgClass: 'bg-emerald-600',
      percent: metrics.totalUnits > 0 ? (metrics.unitOperasi / metrics.totalUnits) * 100 : 0,
      description: 'Genset terhubung ke gardu dan aktif menyuplai daya konsumen.',
    },
    {
      label: 'Dilokasi',
      count: metrics.unitDilokasi,
      kva: metrics.unitDilokasiKva,
      color: '#2563eb', // blue-600
      bgClass: 'bg-blue-600',
      percent: metrics.totalUnits > 0 ? (metrics.unitDilokasi / metrics.totalUnits) * 100 : 0,
      description: 'Genset telah tiba di lokasi gardu dan siap komisioning.',
    },
    {
      label: 'Belum Tiba',
      count: metrics.unitBelumTiba,
      kva: metrics.unitBelumTibaKva,
      color: '#f59e0b', // amber-500
      bgClass: 'bg-amber-500',
      percent: metrics.totalUnits > 0 ? (metrics.unitBelumTiba / metrics.totalUnits) * 100 : 0,
      description: 'Unit dalam transit logistik menuju titik gardu penempatan.',
    },
  ];

  // SVG Donut calculation
  const totalCount = metrics.totalUnits || 1;
  let cumulativeAngle = 0;
  const radius = 64;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  // Max values for ULP bar chart
  const maxUlpCapacity = Math.max(...metrics.regionMetrics.map((r) => r.totalCapacityKva), 1);
  const maxUlpBeban = Math.max(...metrics.regionMetrics.map((r) => r.totalBebanKva), 1);
  const maxUlpUnits = Math.max(...metrics.regionMetrics.map((r) => r.unitCount), 1);

  // Top 2 ULPs dynamically computed
  const topRegionsText = metrics.regionMetrics
    .filter((r) => r.wilayah !== 'Belum Tiba' && r.wilayah !== 'Belum Ditentukan')
    .slice(0, 2)
    .map((r) => `${r.wilayah} (${r.unitCount} unit)`)
    .join(' & ');

  // Dynamic overload units summary text (Operasi only)
  const overloadText =
    metrics.overloadUnits.length > 0
      ? metrics.overloadUnits
          .map((u) => `Gardu ${u.gardu} ${u.ulp} (${u.persenBeban}%)`)
          .join(', ')
      : 'Tidak ada genset berstatus Operasi yang melebihi batas beban 80%';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Chart 1: Distribusi per Wilayah ULP */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-700" />
              Sebaran per Unit Layanan Pelanggan (ULP)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasi kapasitas dan beban operasional aktif di masing-masing area Madura
            </p>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto text-xs">
            <button
              onClick={() => setMetricMode('capacity')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                metricMode === 'capacity'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kapasitas
            </button>
            <button
              onClick={() => setMetricMode('beban')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                metricMode === 'beban'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Beban Operasi
            </button>
            <button
              onClick={() => setMetricMode('units')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                metricMode === 'units'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unit
            </button>
          </div>
        </div>

        {/* ULP horizontal bars */}
        <div className="mt-5 space-y-4">
          {metrics.regionMetrics.map((r) => {
            let val = r.totalCapacityKva;
            let maxVal = maxUlpCapacity;
            let displayVal = `${r.totalCapacityKva.toLocaleString('id-ID')} kVA`;

            if (metricMode === 'beban') {
              val = r.totalBebanKva;
              maxVal = maxUlpBeban;
              displayVal = `${r.totalBebanKva.toLocaleString('id-ID')} kVA`;
            } else if (metricMode === 'units') {
              val = r.unitCount;
              maxVal = maxUlpUnits;
              displayVal = `${r.unitCount} Unit`;
            }

            const percentWidth = Math.max(6, (val / (maxVal || 1)) * 100);

            return (
              <div
                key={r.wilayah}
                onClick={() => onSelectRegion?.(r.wilayah)}
                className="group cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors"
                title={`Klik untuk filter data ULP ${r.wilayah}`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                    {r.wilayah}
                    <span className="text-[11px] font-normal text-slate-500">
                      ({r.unitCount} unit • {r.garduList.length} gardu)
                    </span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {displayVal}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex border border-slate-200">
                  <div
                    style={{ width: `${percentWidth}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500 group-hover:brightness-110"
                  ></div>
                </div>

                {/* Sub status summary */}
                <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="text-emerald-700 font-medium">Operasi: {r.operasiCount}</span>
                  {r.dilokasiCount > 0 && <span className="text-blue-700">Dilokasi: {r.dilokasiCount}</span>}
                  {r.belumTibaCount > 0 && <span className="text-amber-700">Belum Tiba: {r.belumTibaCount}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Total Area Terdata: {metrics.regionMetrics.length} Kategori Wilayah</span>
          {topRegionsText && (
            <span className="font-medium text-slate-700">
              Terbanyak: {topRegionsText}
            </span>
          )}
        </div>
      </div>

      {/* Chart 2: Status Operasional Genset (Donut) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-700" />
              Distribusi Status Operasional Genset
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rasio kesiapan unit genset: Operasi, Berada di Lokasi, dan Belum Tiba
            </p>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center gap-6 justify-center">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />
                {statusData.map((seg) => {
                  const strokeDasharray = `${(seg.count / totalCount) * circumference} ${circumference}`;
                  const strokeDashoffset = -cumulativeAngle;
                  cumulativeAngle += (seg.count / totalCount) * circumference;

                  return (
                    <circle
                      key={seg.label}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoveredSegment(seg.label)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => onSelectStatus?.(seg.label)}
                    />
                  );
                })}
              </svg>

              {/* Center donut label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {metrics.totalUnits}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Unit
                </span>
              </div>
            </div>

            {/* Legend & Details */}
            <div className="space-y-3 flex-1 w-full">
              {statusData.map((item) => (
                <div
                  key={item.label}
                  onClick={() => onSelectStatus?.(item.label)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    hoveredSegment === item.label
                      ? 'bg-slate-50 border-slate-400 shadow-xs'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-800">
                      <span className={`w-3 h-3 rounded-full ${item.bgClass} flex-shrink-0`}></span>
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-900">
                      {item.count} unit ({item.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.description}</span>
                    <span className="font-mono font-medium text-slate-700">
                      {item.kva.toLocaleString('id-ID')} kVA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span>
            {metrics.unitOperasi + metrics.unitDilokasi} dari {metrics.totalUnits} unit ({metrics.realisasiTibaPersen.toFixed(1)}%) telah berada di daratan Madura ({metrics.unitOperasi} beroperasi aktif, {metrics.unitDilokasi} siap komisioning).
          </span>
        </div>
      </div>

      {/* Chart 3: Pemilik Genset & Kontribusi Kapasitas */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-700" />
            Kepemilikan Genset: PLN vs Rekanan ES
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komposisi aset genset penanganan keandalan kelistrikan Madura
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.providerMetrics.map((pm) => {
            const isPln = pm.penyedia.includes('PLN');

            return (
              <div
                key={pm.penyedia}
                onClick={() => onSelectProvider?.(pm.penyedia)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isPln
                    ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                    : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isPln ? 'text-emerald-900' : 'text-blue-900'}`}>
                    {pm.penyedia}
                  </span>
                  <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {pm.unitCount} Unit
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Total Kapasitas:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {pm.totalCapacityKva.toLocaleString('id-ID')} kVA
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Operasi Aktif:</span>
                    <span className="font-semibold text-emerald-700">
                      {pm.operasiCount} unit ({pm.totalBebanKva.toLocaleString('id-ID')} kVA beban)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Konsumsi BBM:</span>
                    <span className="font-mono text-blue-700">
                      {pm.totalBbmLiterJam.toLocaleString('id-ID')} L/jam
                    </span>
                  </div>
                </div>

                {/* Status bar within provider */}
                <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${(pm.operasiCount / pm.unitCount) * 100}%` }}
                    className="bg-emerald-600 h-full"
                    title={`Operasi: ${pm.operasiCount}`}
                  ></div>
                  <div
                    style={{ width: `${(pm.dilokasiCount / pm.unitCount) * 100}%` }}
                    className="bg-blue-600 h-full"
                    title={`Dilokasi: ${pm.dilokasiCount}`}
                  ></div>
                  <div
                    style={{ width: `${(pm.belumTibaCount / pm.unitCount) * 100}%` }}
                    className="bg-amber-400 h-full"
                    title={`Belum Tiba: ${pm.belumTibaCount}`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 4: Profil Pembebanan Kritis (>=80%) & Manajemen Relokasi */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-700" />
              Profil Beban Operasi & Unit Prioritas Relokasi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifikasi genset berstatus Operasi dengan pembebanan tinggi dan rencana optimasi penempatan
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {/* Critical unit list (Strictly 'Operasi' units >= 80%) */}
            <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 text-xs">
              <div className="flex items-center justify-between font-bold text-red-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Genset Operasi Beban Kritis (&gt;=80% Kapasitas):
                </span>
                <span className="font-mono">{metrics.unitOverloadCount} Unit</span>
              </div>
              <p className="text-red-700 text-[11px] leading-relaxed">
                <strong>{overloadText}</strong> beroperasi pada batas kapasitas atas. Perlu pembagian fasa atau relokasi kapasitas genset lebih besar.
              </p>
            </div>

            {/* Relocation list */}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="h-4 w-4 text-amber-600" />
                  Potensi Relokasi Terjadwal:
                </span>
                <span className="font-mono">{metrics.potensiRelokasiCount} Unit</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Termasuk unit di gardu <strong>KC412</strong> (Trip Over Current) rencana pindah ke <strong>KC713</strong>, serta titik potensi relokasi di gardu Waru, Ketapang, Pamekasan, dan Sumenep.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Rata-rata Pembebanan Operasi: <strong>{metrics.rataRataLoadingPersen}%</strong></span>
          <span className="font-semibold text-slate-700">Total Beban Operasi: {metrics.totalBebanOperasiKva.toLocaleString('id-ID')} kVA</span>
        </div>
      </div>

    </div>
  );
};
