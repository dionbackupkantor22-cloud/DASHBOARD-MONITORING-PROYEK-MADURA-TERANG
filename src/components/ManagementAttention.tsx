import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ShieldAlert,
  ExternalLink,
  MapPin,
  RotateCw,
  Gauge,
  Fuel,
} from 'lucide-react';
import { ManagementActionItem, DashboardMetrics } from '../types/dashboard';

interface ManagementAttentionProps {
  actionItems: ManagementActionItem[];
  metrics: DashboardMetrics;
  onFilterUnit?: (unitNo: string) => void;
}

export const ManagementAttention: React.FC<ManagementAttentionProps> = ({
  actionItems,
  metrics,
  onFilterUnit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(actionItems[0]?.id || null);

  const filteredItems = actionItems.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && item.severity !== selectedSeverity) return false;
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Tinggi':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Prioritas Tinggi
          </span>
        );
      case 'Sedang':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Prioritas Sedang
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Informasi
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Operasi & Keandalan':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
            Operasi & Keandalan
          </span>
        );
      case 'Logistik & Kedatangan':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Logistik & Kedatangan
          </span>
        );
      case 'Relokasi & Optimasi':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            Relokasi & Optimasi
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Perhatian Manajemen & Tindak Lanjut Lapangan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengawasan unit kritis, rencana relokasi, monitoring BBM, dan percepatan kedatangan genset
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Semua Kategori ({actionItems.length})</option>
              <option value="Operasi & Keandalan">Operasi & Keandalan</option>
              <option value="Logistik & Kedatangan">Logistik & Kedatangan</option>
              <option value="Relokasi & Optimasi">Relokasi & Optimasi</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="Tinggi">Prioritas Tinggi</option>
              <option value="Sedang">Prioritas Sedang</option>
              <option value="Info">Informasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Audit Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block text-[11px]">Trip Over Current:</span>
          <span className="font-bold text-red-700 font-mono text-sm flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {metrics.tripOverCurrentCount} Unit (KC412)
          </span>
          <span className="text-[10px] text-slate-500 block">
            Rencana relokasi ke KC713
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">Beban Kritis Operasi (&gt;=80%):</span>
          <span className="font-bold text-orange-700 font-mono text-sm flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {metrics.unitOverloadCount} Unit
          </span>
          <span className="text-[10px] text-slate-500 block">
            Max {metrics.maxLoadingPersen}% di {metrics.maxLoadingGardu}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">Genset Belum Tiba:</span>
          <span className="font-bold text-amber-700 font-mono text-sm flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {metrics.unitBelumTiba} Unit
          </span>
          <span className="text-[10px] text-slate-500 block">
            Kapasitas {metrics.unitBelumTibaKva.toLocaleString('id-ID')} kVA
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px]">Konsumsi Solar:</span>
          <span className="font-bold text-blue-700 font-mono text-sm flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {metrics.totalEstimasiBbmLiterJam} L/jam
          </span>
          <span className="text-[10px] text-slate-500 block">
            ~{Math.round(metrics.totalEstimasiBbmLiterJam * 24).toLocaleString('id-ID')} Liter/hari
          </span>
        </div>
      </div>

      {/* List of Action Items */}
      <div className="space-y-3 pt-1">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Tidak ada item tindak lanjut yang sesuai dengan filter yang dipilih.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-lg border transition-all ${
                  isExpanded
                    ? 'border-slate-300 bg-white shadow-sm ring-1 ring-slate-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Item header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 flex items-start justify-between cursor-pointer gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(item.severity)}
                      {getCategoryBadge(item.category)}
                      <span className="text-xs text-slate-500 font-mono">
                        Dampak: {item.affectedUnitsCount} Unit
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {/* Expandable recommendations and details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-lg space-y-3">
                    
                    {/* Action recommendation */}
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                        Rekomendasi Tindak Lanjut Operasional
                      </span>
                      <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                        {item.recommendedAction}
                      </p>
                    </div>

                    {/* Affected unit identifiers & Map Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                          Unit Terkait:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.unitIdentifiers.slice(0, 15).map((ident, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                const match = ident.match(/No\s*([0-9]+)/i);
                                if (match && match[1]) {
                                  onFilterUnit?.(match[1]);
                                }
                              }}
                              className="px-2 py-0.5 text-xs bg-white text-slate-700 rounded border border-slate-200 hover:border-slate-400 font-mono transition-colors"
                              title="Klik untuk memfilter unit ini pada tabel"
                            >
                              {ident}
                            </button>
                          ))}
                        </div>
                      </div>

                      {item.mapsUrl && (
                        <a
                          href={item.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors self-start sm:self-end"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Buka Lokasi di Google Maps</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Sumber: Dataset Penempatan Genset Mobile Madura Terang</span>
        <span className="font-semibold text-slate-700">Audit Status: Sinkron Data Baru</span>
      </div>
    </div>
  );
};
