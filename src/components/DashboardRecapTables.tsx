import React from 'react';
import { FileSpreadsheet, CheckCircle2, MapPin, Clock, Layers, Building2 } from 'lucide-react';
import { DashboardSheetRecap } from '../types/dashboard';

interface DashboardRecapTablesProps {
  recap: DashboardSheetRecap;
  onSelectStatus?: (status: string) => void;
  onSelectUlp?: (ulp: string) => void;
}

export const DashboardRecapTables: React.FC<DashboardRecapTablesProps> = ({
  recap,
  onSelectStatus,
  onSelectUlp,
}) => {
  const formatBbm = (val: number) =>
    val.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
            Rekapitulasi Operasional &amp; Distribusi Genset Madura
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan eksekutif distribusi unit berdasarkan <strong>Status Operasional</strong>, <strong>Wilayah ULP</strong>, dan <strong>Kapasitas Genset (kVA)</strong>
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          Total: {recap.statusTotal.unit} Unit • {recap.statusTotal.kapasitasKva.toLocaleString('id-ID')} kVA
        </span>
      </div>

      {/* Top 2 Tables Grid: Status Recap & ULP Recap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TABEL 1: Rekap Berdasarkan Status */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              1. Rekapitulasi Berdasarkan Status
            </h4>
            <span className="text-[11px] text-slate-500">Klik baris untuk filter</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-800 text-white font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-left w-10">No</th>
                  <th className="py-2.5 px-3 text-left">Status</th>
                  <th className="py-2.5 px-3 text-right">Unit</th>
                  <th className="py-2.5 px-3 text-right">Kapasitas Genset (kVA)</th>
                  <th className="py-2.5 px-3 text-right">Beban Trafo (kVA)</th>
                  <th className="py-2.5 px-3 text-right">Estimasi BBM / Jam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recap.statusRows.map((row) => {
                  const isOp = row.status.toLowerCase().includes('operasi');
                  const isLoc = row.status.toLowerCase().includes('lokasi');
                  return (
                    <tr
                      key={row.no}
                      onClick={() => onSelectStatus?.(row.status)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-600">{row.no}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                        {isOp ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : isLoc ? (
                          <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        {row.status}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {row.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                        {row.kapasitasKva.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-semibold">
                        {row.bebanTrafoKva.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-800 font-semibold">
                        {formatBbm(row.estimasiBbmJam)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="py-2.5 px-3"></td>
                  <td className="py-2.5 px-3 uppercase">Total</td>
                  <td className="py-2.5 px-3 text-right font-mono">{recap.statusTotal.unit}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                    {recap.statusTotal.kapasitasKva.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-800">
                    {recap.statusTotal.bebanTrafoKva.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-900">
                    {formatBbm(recap.statusTotal.estimasiBbmJam)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* TABEL 2: Rekap Berdasarkan ULP */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-600" />
              2. Rekapitulasi Berdasarkan Wilayah ULP
            </h4>
            <span className="text-[11px] text-slate-500">Klik ULP untuk filter</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-800 text-white font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-left w-10">No</th>
                  <th className="py-2.5 px-3 text-left">ULP</th>
                  <th className="py-2.5 px-3 text-right">Unit</th>
                  <th className="py-2.5 px-3 text-right">Kapasitas Genset (kVA)</th>
                  <th className="py-2.5 px-3 text-right">Beban Trafo (kVA)</th>
                  <th className="py-2.5 px-3 text-right">Estimasi BBM / Jam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recap.ulpRows.map((row) => (
                  <tr
                    key={row.ulp}
                    onClick={() => onSelectUlp?.(row.ulp)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-mono text-slate-600">{row.no}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{row.ulp}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {row.unit}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-800">
                      {row.kapasitasKva.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-blue-700 font-semibold">
                      {row.bebanTrafoKva.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-amber-800 font-semibold">
                      {formatBbm(row.estimasiBbmJam)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="py-2.5 px-3"></td>
                  <td className="py-2.5 px-3 uppercase">Total</td>
                  <td className="py-2.5 px-3 text-right font-mono">{recap.ulpTotal.unit}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                    {recap.ulpTotal.kapasitasKva.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-800">
                    {recap.ulpTotal.bebanTrafoKva.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-900">
                    {formatBbm(recap.ulpTotal.estimasiBbmJam)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>

      {/* TABEL 3: Rekap Berdasarkan Kapasitas Genset (kVA) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-emerald-700" />
            3. Rekapitulasi Berdasarkan Kapasitas Genset (kVA) &amp; Status
          </h4>
          <span className="text-[11px] text-slate-500">
            Distribusi 6 kelas kapasitas genset (160 kVA s/d 600 kVA)
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-800 text-white font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 text-left w-10">No</th>
                <th className="py-2.5 px-3 text-right">Kapasitas (kVA)</th>
                <th className="py-2.5 px-3 text-right">Unit</th>
                <th className="py-2.5 px-3 text-right">Total Kapasitas (kVA)</th>
                <th className="py-2.5 px-3 text-right">Beban Trafo (kVA)</th>
                <th className="py-2.5 px-3 text-right text-amber-300">Belum Tiba</th>
                <th className="py-2.5 px-3 text-right text-blue-300">Di Lokasi</th>
                <th className="py-2.5 px-3 text-right text-emerald-300">Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recap.capacityRows.map((row) => (
                <tr key={row.kapasitasKva} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-600">{row.no}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {row.kapasitasKva.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {row.unit}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-800">
                    {row.totalKapasitasKva.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-blue-700 font-semibold">
                    {row.bebanTrafoKva.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-amber-700 font-semibold">
                    {row.belumTiba}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-blue-700 font-semibold">
                    {row.diLokasi}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                    {row.operasi}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td className="py-2.5 px-3"></td>
                <td className="py-2.5 px-3 text-right uppercase">Total</td>
                <td className="py-2.5 px-3 text-right font-mono">{recap.capacityTotal.unit}</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                  {recap.capacityTotal.totalKapasitasKva.toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-800">
                  {recap.capacityTotal.bebanTrafoKva.toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-amber-800">
                  {recap.capacityTotal.belumTiba}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-800">
                  {recap.capacityTotal.diLokasi}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                  {recap.capacityTotal.operasi}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
