import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ExternalLink,
  X,
  FileSpreadsheet,
  MapPin,
} from 'lucide-react';
import { GensetRecord, FilterState } from '../types/dashboard';
import { isOperasiStatus, isDilokasiStatus } from '../services/dataService';

interface MonitoringTableProps {
  records: GensetRecord[];
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  onResetFilter: () => void;
}

export const MonitoringTable: React.FC<MonitoringTableProps> = ({
  records,
  filterState,
  onUpdateFilter,
  onResetFilter,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<GensetRecord | null>(null);
  const [sortField, setSortField] = useState<keyof GensetRecord>('rowIndex');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Dynamic status counts from actual spreadsheet records
  const statusCounts = useMemo(() => {
    let operasi = 0;
    let dilokasi = 0;
    let belumTiba = 0;
    records.forEach((r) => {
      if (isOperasiStatus(r.status)) operasi++;
      else if (isDilokasiStatus(r.status)) dilokasi++;
      else belumTiba++;
    });
    return { operasi, dilokasi, belumTiba };
  }, [records]);

  // Distinct filter lists
  const distinctUlps = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.ulp))).filter(
      (u) => u && u !== 'Belum Tiba' && u !== 'Belum Ditentukan'
    );
  }, [records]);

  const distinctProviders = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.pemilikGenset))).filter(Boolean);
  }, [records]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search query
      if (filterState.searchQuery) {
        const q = filterState.searchQuery.toLowerCase();
        const matchSearch =
          r.no.toLowerCase().includes(q) ||
          r.genset.toLowerCase().includes(q) ||
          r.ulp.toLowerCase().includes(q) ||
          r.gardu.toLowerCase().includes(q) ||
          r.pemilikGenset.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.keterangan.toLowerCase().includes(q) ||
          r.tindakLanjut.toLowerCase().includes(q) ||
          r.atributPerangkat.toLowerCase().includes(q) ||
          r.team.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      // Status filter (handles both 'Di lokasi' and 'Dilokasi')
      if (filterState.status !== 'ALL') {
        if (filterState.status.toLowerCase().includes('lokasi')) {
          if (!isDilokasiStatus(r.status)) return false;
        } else if (r.status.toLowerCase() !== filterState.status.toLowerCase()) {
          return false;
        }
      }

      // ULP filter
      if (filterState.ulp !== 'ALL' && r.ulp.toUpperCase() !== filterState.ulp.toUpperCase()) {
        return false;
      }

      // Provider filter
      if (filterState.penyedia !== 'ALL' && r.pemilikGenset !== filterState.penyedia) {
        return false;
      }

      // Overload only (>=80% strictly on 'Operasi' units per confirmed rule)
      if (filterState.overloadOnly && (!isOperasiStatus(r.status) || r.persenBebanGenset < 80)) {
        return false;
      }

      // Relokasi only
      if (filterState.relokasiOnly) {
        const hasRelokasi =
          Boolean(r.relokasiUlp) ||
          r.tindakLanjut.toLowerCase().includes('relokasi') ||
          r.keterangan.toLowerCase().includes('relokasi');
        if (!hasRelokasi) return false;
      }

      return true;
    });
  }, [records, filterState]);

  // Sort records
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (
        sortField === 'capacityKva' ||
        sortField === 'bebanKva' ||
        sortField === 'persenBebanGenset' ||
        sortField === 'estimasiBbmLiterJam' ||
        sortField === 'rowIndex'
      ) {
        return sortDirection === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }

      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
    return list;
  }, [filteredRecords, sortField, sortDirection]);

  const handleSort = (field: keyof GensetRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Kapasitas Genset (kVA)',
      'Status',
      'Tiba',
      'Install',
      'ULP',
      'GARDU',
      'Kapasitas Gardu',
      'Beban (kVA)',
      'Estimasi Beban (A)',
      '% Beban',
      'Estimasi BBM (L/Jam)',
      'ULP Relokasi',
      'GARDU Relokasi',
      'Beban Relokasi',
      'Pemilik Genset',
      'Keterangan',
      'Tindak Lanjut / ATS',
      'Team',
      'Google Maps Awal',
      'Google Maps Baru',
    ];

    const rows = sortedRecords.map((r) => [
      `"${r.no}"`,
      r.capacityKva,
      `"${r.status}"`,
      `"${r.tglTiba}"`,
      `"${r.tglInstall}"`,
      `"${r.ulp}"`,
      `"${r.gardu}"`,
      r.kapasitasGardu,
      r.bebanKva,
      r.estimasiBebanAmpere,
      `"${r.persenBebanGenset}%"`,
      r.estimasiBbmLiterJam,
      `"${r.relokasiUlp}"`,
      `"${r.relokasiGardu}"`,
      r.relokasiBeban,
      `"${r.pemilikGenset}"`,
      `"${r.keterangan}"`,
      `"${r.tindakLanjut}"`,
      `"${r.team}"`,
      `"${r.titikLokasiAwal}"`,
      `"${r.titikLokasiBaru}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Monitoring_Penempatan_Genset_Madura_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (isOperasiStatus(status)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Operasi
        </span>
      );
    }
    if (isDilokasiStatus(status)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <MapPin className="h-3 w-3 text-blue-600" />
          Di lokasi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <Clock className="h-3 w-3 text-amber-600" />
        Belum Tiba
      </span>
    );
  };

  const getLoadingBadge = (pct: number, isOperasi: boolean) => {
    if (pct >= 80 && isOperasi) {
      return (
        <span className="font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
          {pct}%
        </span>
      );
    }
    if (pct >= 70) {
      return (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          {pct}%
        </span>
      );
    }
    return (
      <span className="font-mono font-medium text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded">
        {pct}%
      </span>
    );
  };

  const hasActiveFilters =
    Boolean(filterState.searchQuery) ||
    filterState.status !== 'ALL' ||
    filterState.ulp !== 'ALL' ||
    filterState.penyedia !== 'ALL' ||
    filterState.overloadOnly ||
    filterState.relokasiOnly;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
            Tabel Monitoring Penempatan Genset Mobile Madura
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap {records.length} unit genset dengan parameter pembebanan (kVA/A), BBM (L/jam), gardu, tindak lanjut, tim, dan titik Google Maps
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilter}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV ({sortedRecords.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-1">
        
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
            placeholder="Cari gardu, ULP, kapasitas, ATS, tim, keterangan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => onUpdateFilter({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter (Dynamic Counts) */}
        <div>
          <select
            value={filterState.status}
            onChange={(e) => onUpdateFilter({ status: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="ALL">Semua Status ({records.length})</option>
            <option value="Operasi">Operasi ({statusCounts.operasi})</option>
            <option value="Di lokasi">Di lokasi ({statusCounts.dilokasi})</option>
            <option value="Belum Tiba">Belum Tiba ({statusCounts.belumTiba})</option>
          </select>
        </div>

        {/* ULP Filter */}
        <div>
          <select
            value={filterState.ulp}
            onChange={(e) => onUpdateFilter({ ulp: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="ALL">Semua ULP</option>
            {distinctUlps.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Provider Filter */}
        <div>
          <select
            value={filterState.penyedia}
            onChange={(e) => onUpdateFilter({ penyedia: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="ALL">Semua Pemilik</option>
            {distinctProviders.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdateFilter({ overloadOnly: !filterState.overloadOnly })}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold border flex-1 transition-all ${
              filterState.overloadOnly
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Filter unit berstatus Operasi dengan beban >= 80%"
          >
            &gt;80% Beban
          </button>

          <button
            onClick={() => onUpdateFilter({ relokasiOnly: !filterState.relokasiOnly })}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold border flex-1 transition-all ${
              filterState.relokasiOnly
                ? 'bg-purple-600 text-white border-purple-700'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Filter unit yang tercatat potensi relokasi"
          >
            Relokasi
          </button>
        </div>

      </div>

      {/* Records Count Badge */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Menampilkan <strong>{sortedRecords.length}</strong> dari total <strong>{records.length}</strong> unit genset
        </span>
        {filterState.overloadOnly && (
          <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
            Mode Filter: Menampilkan genset Operasi pembebanan kritis (&gt;=80%)
          </span>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th
                onClick={() => handleSort('rowIndex')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors w-12"
              >
                <div className="flex items-center gap-1">
                  No
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('capacityKva')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Kapasitas
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('ulp')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  ULP / Gardu
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('bebanKva')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Beban (kVA)
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('persenBebanGenset')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  % Beban
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('estimasiBbmLiterJam')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  BBM (L/jam)
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-3">Pemilik</th>
              <th className="py-3 px-3">Keterangan / Relokasi</th>
              <th className="py-3 px-3">Team</th>
              <th className="py-3 px-3 text-center">Peta</th>
              <th className="py-3 px-3 text-center w-12">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-500">
                  Tidak ada data genset yang sesuai dengan kriteria filter saat ini.
                </td>
              </tr>
            ) : (
              sortedRecords.map((r) => {
                const isSelected = selectedRecord?.id === r.id;
                const isTrip = r.keterangan.toLowerCase().includes('trip');
                const isOperasi = isOperasiStatus(r.status);
                const isOverload = isOperasi && r.persenBebanGenset >= 80;

                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/50' : ''
                    } ${isTrip ? 'bg-red-50/30' : isOverload ? 'bg-orange-50/20' : ''}`}
                  >
                    {/* No */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {r.no}
                    </td>

                    {/* Kapasitas */}
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {r.genset}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {getStatusBadge(r.status)}
                    </td>

                    {/* ULP / Gardu */}
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {r.ulp}
                        </span>
                        {r.gardu && r.gardu !== '-' && (
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1 rounded">
                            {r.gardu}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Beban (kVA) & Ampere */}
                    <td className="py-3 px-3">
                      {r.bebanKva > 0 ? (
                        <div>
                          <span className="font-mono font-bold text-slate-900 block">
                            {r.bebanKva} kVA
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {r.estimasiBebanAmpere} A
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>

                    {/* % Beban */}
                    <td className="py-3 px-3 text-center">
                      {r.persenBebanGenset > 0 ? (
                        getLoadingBadge(r.persenBebanGenset, isOperasi)
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">0%</span>
                      )}
                    </td>

                    {/* BBM Liter/Jam */}
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {r.estimasiBbmLiterJam > 0 ? (
                        <span>{r.estimasiBbmLiterJam}</span>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>

                    {/* Pemilik */}
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      <span className="truncate block max-w-[120px]" title={r.pemilikGenset}>
                        {r.pemilikGenset}
                      </span>
                    </td>

                    {/* Keterangan / Relokasi / ATS */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {isTrip && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            TRIP
                          </span>
                        )}
                        {r.relokasiUlp && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            Ke {r.relokasiGardu || r.relokasiUlp}
                          </span>
                        )}
                        {r.atributPerangkat && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {r.atributPerangkat}
                          </span>
                        )}
                        {!isTrip && !r.relokasiUlp && r.keterangan && (
                          <span className="text-slate-600 text-[11px]">{r.keterangan}</span>
                        )}
                        {!isTrip && !r.relokasiUlp && !r.keterangan && !r.atributPerangkat && (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                      {r.team && r.team !== '-' ? (
                        <span className="font-semibold text-slate-800">{r.team}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Peta link */}
                    <td className="py-3 px-3 text-center">
                      {r.titikLokasiAwal ? (
                        <a
                          href={r.titikLokasiAwal}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 inline-flex text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded"
                          title="Buka titik koordinat di Google Maps"
                        >
                          <MapPin className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Detail trigger */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded"
                        title="Lihat detail baris"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Row Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold">
                  No {selectedRecord.no}
                </span>
                <h4 className="font-bold text-sm">
                  {selectedRecord.gardu !== '-' ? `Gardu ${selectedRecord.gardu}` : selectedRecord.ulp} - {selectedRecord.genset}
                </h4>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Warnings inside modal if trip or operational overload */}
              {(selectedRecord.keterangan ||
                (isOperasiStatus(selectedRecord.status) && selectedRecord.persenBebanGenset >= 80)) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-red-800">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    Catatan Kritis Operasional
                  </span>
                  {selectedRecord.keterangan && (
                    <p>• {selectedRecord.keterangan}</p>
                  )}
                  {isOperasiStatus(selectedRecord.status) && selectedRecord.persenBebanGenset >= 80 && (
                    <p>• Pembebanan genset operasi telah mencapai {selectedRecord.persenBebanGenset}%, melebihi batas rekomendasi 80%.</p>
                  )}
                </div>
              )}

              {/* Data Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[11px] block">Kapasitas Genset:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {selectedRecord.capacityKva} kVA
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Pemilik Genset:</span>
                  <span className="font-bold text-slate-900">
                    {selectedRecord.pemilikGenset}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Status Operasi:</span>
                  <div className="mt-0.5">
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Beban Spreadsheet:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedRecord.bebanKva} kVA ({selectedRecord.estimasiBebanAmpere} A)
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Rasio Pembebanan:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedRecord.persenBebanGenset}%
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Konsumsi BBM Solar:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {selectedRecord.estimasiBbmLiterJam} Liter/jam
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Kapasitas Gardu Trafo:</span>
                  <span className="font-mono text-slate-800">
                    {selectedRecord.kapasitasGardu} kVA
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Tim Lapangan & Perangkat:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRecord.team !== '-' ? selectedRecord.team : '-'}
                    {selectedRecord.atributPerangkat ? ` • ${selectedRecord.atributPerangkat}` : ''}
                  </span>
                </div>
              </div>

              {/* Relocation info if exists */}
              {selectedRecord.relokasiUlp && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-1 text-purple-900">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-purple-800">
                    Rencana Relokasi Target
                  </span>
                  <p>
                    Target ULP: <strong>{selectedRecord.relokasiUlp}</strong> • Gardu: <strong>{selectedRecord.relokasiGardu || '-'}</strong>
                  </p>
                  {selectedRecord.relokasiKapasitasGardu > 0 && (
                    <p>
                      Kapasitas Gardu Target: {selectedRecord.relokasiKapasitasGardu} kVA • Beban: {selectedRecord.relokasiBeban} kVA ({selectedRecord.relokasiPersenBeban}%)
                    </p>
                  )}
                  {selectedRecord.titikLokasiBaru && (
                    <a
                      href={selectedRecord.titikLokasiBaru}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-purple-700 hover:text-purple-900 underline mt-1"
                    >
                      <span>Buka Titik Lokasi Baru di Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Navigation button */}
              {selectedRecord.titikLokasiAwal && (
                <a
                  href={selectedRecord.titikLokasiAwal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Buka Titik Lokasi di Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
