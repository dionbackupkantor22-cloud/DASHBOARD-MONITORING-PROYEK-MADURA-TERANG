import React, { useState, useMemo } from 'react';
import {
  Users,
  Wrench,
  Cable,
  ShieldCheck,
  Search,
  Download,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { ReguSheetData } from '../types/dashboard';

interface ReguMaterialSectionProps {
  reguData: ReguSheetData;
}

export const ReguMaterialSection: React.FC<ReguMaterialSectionProps> = ({ reguData }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUlp, setSelectedUlp] = useState<string>('ALL');
  const [selectedKetStatus, setSelectedKetStatus] = useState<string>('ALL');

  const distinctUlps = useMemo(() => {
    return Array.from(new Set(reguData.rows.map((r) => r.ulp))).filter(Boolean);
  }, [reguData.rows]);

  const filteredRows = useMemo(() => {
    return reguData.rows.filter((r) => {
      if (selectedUlp !== 'ALL' && r.ulp.toUpperCase() !== selectedUlp.toUpperCase()) {
        return false;
      }
      if (selectedKetStatus !== 'ALL') {
        if (selectedKetStatus === 'RELOKASI' && !r.keteranganStatus.toUpperCase().includes('RELOKASI')) {
          return false;
        }
        if (selectedKetStatus === 'TAHAP 2' && !r.keteranganStatus.toUpperCase().includes('TAHAP 2')) {
          return false;
        }
        if (selectedKetStatus === 'HAR' && !r.team.toUpperCase().includes('HAR') && !r.team.toUpperCase().includes('INSTAL')) {
          return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          r.no.toLowerCase().includes(q) ||
          r.ulp.toLowerCase().includes(q) ||
          r.gardu.toLowerCase().includes(q) ||
          r.keteranganGenset.toLowerCase().includes(q) ||
          r.team.toLowerCase().includes(q) ||
          r.keteranganStatus.toLowerCase().includes(q) ||
          String(r.atsAmpere).includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [reguData.rows, selectedUlp, selectedKetStatus, searchQuery]);

  const handleExportReguCsv = () => {
    const headers = [
      'No.',
      'ULP',
      'GARDU',
      'KETERANGAN',
      'KOORDINAT',
      'REGU SBB',
      'REGU SBS',
      'REGU SBU',
      'REGU GRK',
      'REGU SDA',
      'REGU MDR',
      'ATS (A)',
      'A3CS (M)',
      'SKAT 150 (BH)',
      'GROUNDING (SET)',
      'TEAM',
      'KETERANGAN STATUS',
    ];

    const rows = filteredRows.map((r) => [
      r.no,
      `"${r.ulp}"`,
      `"${r.gardu}"`,
      `"${r.keteranganGenset}"`,
      `"${r.koordinat}"`,
      `"${r.reguSbb}"`,
      `"${r.reguSbs}"`,
      `"${r.reguSbu}"`,
      `"${r.reguGrk}"`,
      `"${r.reguSda}"`,
      `"${r.reguMdr}"`,
      r.atsAmpere || '',
      r.a3csMeter || '',
      r.skat150Bh || '',
      r.groundingSet || '',
      `"${r.team !== '-' ? r.team : ''}"`,
      `"${r.keteranganStatus !== '-' ? r.keteranganStatus : ''}"`,
    ]);

    rows.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      reguData.totals.totalA3csMeter,
      reguData.totals.totalSkat150Bh,
      reguData.totals.totalGroundingSet,
      '',
      '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Sheet_REGU_Material_Madura_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top KPI Cards for Sheet REGU Material Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Titik Penugasan Regu
            </span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {reguData.totals.totalRows}
            </span>
            <span className="text-xs text-slate-500">Titik Gardu</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between">
            <span>Panel ATS Terdata:</span>
            <span className="font-mono font-semibold text-emerald-700">
              {reguData.totals.totalWithAts} Unit (400A / 630A)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Kabel A3CS
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Cable className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-800">
              {reguData.totals.totalA3csMeter.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-medium text-slate-500">Meter (M)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between">
            <span>Rata-rata per Gardu:</span>
            <span className="font-mono font-semibold text-slate-800">20 Meter / Titik</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total SKAT 150
            </span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-blue-800">
              {reguData.totals.totalSkat150Bh.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-medium text-slate-500">Buah (BH)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between">
            <span>Konfigurasi:</span>
            <span className="font-mono font-semibold text-slate-800">8 s/d 16 BH / Gardu</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Grounding
            </span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-800">
              {reguData.totals.totalGroundingSet.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-medium text-slate-500">Set</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between">
            <span>Standar Proteksi:</span>
            <span className="font-mono font-semibold text-slate-800">1 Set / Titik Gardu</span>
          </div>
        </div>
      </div>

      {/* Main Sheet REGU Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
              Tabel Sheet REGU: Penugasan Tim &amp; Kebutuhan Material Instalasi (gid=1442113655)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan 100% baris dan kolom dari tab <strong>REGU</strong>: alokasi Regu (SBB, SBS, SBU, GRK, SDA, MDR), ATS (A), A3CS (M), SKAT 150 (BH), Grounding (SET), Team, dan Keterangan
            </p>
          </div>

          <button
            onClick={handleExportReguCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm self-start md:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor Sheet REGU ({filteredRows.length})</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari gardu, ULP, HAR SDA, RELOKASI, TAHAP 2..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedUlp}
            onChange={(e) => setSelectedUlp(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="ALL">Semua ULP ({reguData.rows.length})</option>
            {distinctUlps.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select
            value={selectedKetStatus}
            onChange={(e) => setSelectedKetStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="ALL">Semua Kategori Keterangan</option>
            <option value="RELOKASI">Keterangan: RELOKASI</option>
            <option value="TAHAP 2">Keterangan: TAHAP 2</option>
            <option value="HAR">Sudah Ada Team (HAR SDA / MDR / GRK / INSTAL)</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-800 text-white font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th rowSpan={2} className="py-2.5 px-2.5 text-left border-r border-slate-700 w-10">
                  No.
                </th>
                <th rowSpan={2} className="py-2.5 px-3 text-left border-r border-slate-700">
                  ULP
                </th>
                <th rowSpan={2} className="py-2.5 px-3 text-left border-r border-slate-700">
                  GARDU
                </th>
                <th rowSpan={2} className="py-2.5 px-3 text-left border-r border-slate-700">
                  KETERANGAN
                </th>
                <th rowSpan={2} className="py-2.5 px-2.5 text-center border-r border-slate-700">
                  KOORDINAT
                </th>
                <th colSpan={6} className="py-1.5 px-2 text-center border-b border-r border-slate-700 bg-slate-900">
                  REGU
                </th>
                <th rowSpan={2} className="py-2.5 px-2.5 text-right border-r border-slate-700">
                  ATS (A)
                </th>
                <th rowSpan={2} className="py-2.5 px-2.5 text-right border-r border-slate-700">
                  A3CS (M)
                </th>
                <th rowSpan={2} className="py-2.5 px-2.5 text-right border-r border-slate-700">
                  SKAT 150 (BH)
                </th>
                <th rowSpan={2} className="py-2.5 px-2.5 text-right border-r border-slate-700">
                  GROUNDING (SET)
                </th>
                <th rowSpan={2} className="py-2.5 px-3 text-left border-r border-slate-700">
                  TEAM
                </th>
                <th rowSpan={2} className="py-2.5 px-3 text-left">
                  KETERANGAN
                </th>
              </tr>
              <tr className="bg-slate-700 text-[10px]">
                <th className="py-1 px-2 text-center border-r border-slate-600">SBB</th>
                <th className="py-1 px-2 text-center border-r border-slate-600">SBS</th>
                <th className="py-1 px-2 text-center border-r border-slate-600">SBU</th>
                <th className="py-1 px-2 text-center border-r border-slate-600">GRK</th>
                <th className="py-1 px-2 text-center border-r border-slate-600">SDA</th>
                <th className="py-1 px-2 text-center border-r border-slate-600">MDR</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-100">
                    {r.no}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-100">
                    {r.ulp}
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold text-emerald-800 border-r border-slate-100">
                    {r.gardu}
                  </td>
                  <td className="py-2 px-3 text-slate-700 border-r border-slate-100">
                    {r.keteranganGenset}
                  </td>
                  <td className="py-2 px-2.5 text-center text-slate-400 border-r border-slate-100">
                    {r.koordinat || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-100">
                    {r.reguSbb || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-100">
                    {r.reguSbs || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-100">
                    {r.reguSbu || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-100">
                    {r.reguGrk || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-100">
                    {r.reguSda || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-100">
                    {r.reguMdr || '-'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-semibold text-slate-900 border-r border-slate-100">
                    {r.atsAmpere > 0 ? r.atsAmpere : '-'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono text-emerald-800 font-semibold border-r border-slate-100">
                    {r.a3csMeter > 0 ? r.a3csMeter : '-'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono text-blue-800 font-semibold border-r border-slate-100">
                    {r.skat150Bh > 0 ? r.skat150Bh : '-'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono text-amber-800 font-semibold border-r border-slate-100">
                    {r.groundingSet > 0 ? r.groundingSet : '-'}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-100">
                    {r.team !== '-' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono">
                        {r.team}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {r.keteranganStatus !== '-' ? (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          r.keteranganStatus.toUpperCase().includes('RELOKASI')
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {r.keteranganStatus}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={12} className="py-2.5 px-3 text-left uppercase border-r border-slate-200">
                  TOTAL MATERIAL SHEET REGU
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-emerald-800 border-r border-slate-200">
                  {reguData.totals.totalA3csMeter}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-blue-800 border-r border-slate-200">
                  {reguData.totals.totalSkat150Bh}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-amber-800 border-r border-slate-200">
                  {reguData.totals.totalGroundingSet}
                </td>
                <td colSpan={2} className="py-2.5 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
