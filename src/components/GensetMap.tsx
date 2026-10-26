import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  ExternalLink,
  Zap,
  Gauge,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Navigation,
  Layers,
  Globe,
  Compass,
  X,
  Maximize2,
} from 'lucide-react';
import L from 'leaflet';
import { GensetRecord } from '../types/dashboard';

interface GensetMapProps {
  records: GensetRecord[];
  onSelectRecord?: (record: GensetRecord) => void;
}

// Bounding box for exact projection on Pulau Madura vector map
const LNG_MIN = 112.58;
const LNG_MAX = 114.18;
const LAT_NORTH = -6.80;
const LAT_SOUTH = -7.28;
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 450;

/**
 * Projects real GPS coordinates (lng, lat) to SVG coordinate space.
 */
function projectGeoToSvg(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SVG_WIDTH;
  const y = ((lat - LAT_NORTH) / (LAT_SOUTH - LAT_NORTH)) * SVG_HEIGHT;
  return {
    x: Math.max(20, Math.min(SVG_WIDTH - 20, x)),
    y: Math.max(20, Math.min(SVG_HEIGHT - 20, y)),
  };
}

export const GensetMap: React.FC<GensetMapProps> = ({ records, onSelectRecord }) => {
  const [mapMode, setMapMode] = useState<'thematic' | 'leaflet'>('thematic');
  const [selectedUlp, setSelectedUlp] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<GensetRecord | null>(null);
  const [hoveredRecord, setHoveredRecord] = useState<GensetRecord | null>(null);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter records by ULP
  const filteredMapRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedUlp !== 'ALL' && r.ulp.toUpperCase() !== selectedUlp.toUpperCase()) {
        return false;
      }
      return true;
    });
  }, [records, selectedUlp]);

  const distinctUlps = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.ulp && r.ulp !== 'Belum Tiba' && r.ulp !== 'Belum Ditentukan') {
        set.add(r.ulp.toUpperCase());
      }
    });
    return Array.from(set);
  }, [records]);

  const getMarkerColor = (r: GensetRecord) => {
    if (r.keterangan.toLowerCase().includes('trip')) return '#ef4444'; // Red
    if (r.persenBebanGenset >= 80) return '#ea580c'; // Orange
    if (r.status.toLowerCase().includes('operasi')) return '#059669'; // Emerald
    if (r.status.toLowerCase().includes('dilokasi')) return '#2563eb'; // Blue
    return '#f59e0b'; // Amber
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (mapMode !== 'leaflet') {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Center of Pulau Madura
      const map = L.map(mapContainerRef.current, {
        center: [-7.05, 113.45],
        zoom: 9.5,
        minZoom: 8,
        maxZoom: 16,
      });

      // High-quality OpenStreetMap cartography tile
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    // Refresh markers on Leaflet
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      filteredMapRecords.forEach((r) => {
        const color = getMarkerColor(r);
        const isSelected = selectedRecord?.id === r.id;

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="
              background-color: ${color};
              width: ${isSelected ? '28px' : '22px'};
              height: ${isSelected ? '28px' : '22px'};
              border-radius: 9999px;
              border: 2px solid #ffffff;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-family: monospace;
              font-size: 10px;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              ${r.no}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([r.coordinates.lat, r.coordinates.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedRecord(r);
          onSelectRecord?.(r);
        });

        marker.bindTooltip(
          `<strong>No ${r.no}: ${r.gardu}</strong> (${r.genset})<br/>Status: ${r.status} • ${r.bebanKva} kVA`,
          { direction: 'top', offset: [0, -10] }
        );

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [mapMode, filteredMapRecords, selectedRecord, onSelectRecord]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      
      {/* Map Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Peta Geografis Penempatan Genset Mobile Pulau Madura
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemetaan lokasi gardu distribusi daratan Madura (Bangkalan, Sampang, Pamekasan, Sumenep)
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Mode Switcher & ULP filter */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Map Type Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setMapMode('thematic')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                mapMode === 'thematic'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-emerald-700" />
              <span>Peta Vektor Madura</span>
            </button>
            <button
              onClick={() => setMapMode('leaflet')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                mapMode === 'leaflet'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span>OpenStreetMap Satelit</span>
            </button>
          </div>

          {/* ULP Zone Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedUlp('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedUlp === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Semua ({records.length})
            </button>
            {distinctUlps.map((ulp) => (
              <button
                key={ulp}
                onClick={() => setSelectedUlp(ulp)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedUlp === ulp
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {ulp}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* MAP CANVAS VIEW */}
      {mapMode === 'leaflet' ? (
        /* Leaflet Real OSM Interactive Map */
        <div className="relative w-full h-[420px] rounded-xl border border-slate-200 overflow-hidden shadow-inner z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] shadow-sm z-[1000] text-slate-700">
            💡 Peta Interaktif OpenStreetMap: Klik atau geser untuk melihat jalan dan detail wilayah.
          </div>
        </div>
      ) : (
        /* Authentic Thematic SVG Vector Map of Pulau Madura */
        <div className="relative w-full aspect-[21/10] sm:aspect-[24/9] bg-gradient-to-b from-sky-100/70 via-sky-50/60 to-emerald-50/50 rounded-xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center select-none">
          
          {/* Subtle water bathymetry contours */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf815_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

          {/* SVG Map of Pulau Madura */}
          <svg
            viewBox="0 0 1000 450"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Island Landmass Gradient */}
              <linearGradient id="maduraLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>

              {/* Coastal Shadow */}
              <filter id="islandShadow" x="-5%" y="-5%" width="115%" height="115%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Ocean Body Annotations */}
            <text x="500" y="38" fill="#0284c7" fontSize="13" fontWeight="bold" letterSpacing="6" opacity="0.45" textAnchor="middle">
              LAUT JAWA
            </text>
            <text x="350" y="435" fill="#0284c7" fontSize="13" fontWeight="bold" letterSpacing="5" opacity="0.45" textAnchor="middle">
              SELAT MADURA
            </text>
            <text x="910" y="390" fill="#0284c7" fontSize="11" fontWeight="bold" letterSpacing="3" opacity="0.4" textAnchor="middle">
              SELAT MADURA TIMUR
            </text>

            {/* Jembatan Suramadu Link to Surabaya */}
            <path
              d="M 125,370 L 125,435"
              stroke="#047857"
              strokeWidth="4"
              strokeDasharray="6 3"
              opacity="0.8"
            />
            <text x="135" y="420" fill="#065f46" fontSize="10" fontWeight="bold">
              Jembatan Suramadu ↓
            </text>

            {/* 
              ACCURATE GEOGRAPHICAL CONTOUR OF PULAU MADURA
              Constructed precisely from West (Kamal/Bangkalan) to East (Kalianget/Sumenep)
              Safe inland margins strictly enveloping all 32 genset coordinates.
            */}
            <path
              d="
                M 65,340
                C 55,305 60,260 70,220
                C 80,180 100,140 135,115
                C 175,90 220,78 275,76
                C 335,74 395,78 450,75
                C 520,70 580,68 645,68
                C 715,68 780,72 840,82
                C 890,92 935,115 965,145
                C 980,165 975,195 955,225
                C 930,255 895,280 855,295
                C 825,310 790,320 755,325
                C 710,330 660,335 605,340
                C 555,345 505,355 450,360
                C 395,365 340,370 280,368
                C 220,365 170,365 125,370
                C 90,375 75,365 65,340 Z
              "
              fill="url(#maduraLandGradient)"
              stroke="#94a3b8"
              strokeWidth="2.5"
              filter="url(#islandShadow)"
            />

            {/* Internal Administrative Boundaries (ULP / Kabupaten) */}
            {/* Bangkalan - Sampang Border */}
            <path d="M 280,76 C 275,170 278,270 280,368" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
            {/* Sampang - Pamekasan Border */}
            <path d="M 525,71 C 520,165 522,255 525,350" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
            {/* Pamekasan - Sumenep Border */}
            <path d="M 700,70 C 695,160 698,250 705,330" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />

            {/* Arterial Highway Network (Pantura & Lintas Selatan) */}
            {/* Pantura Madura Route */}
            <path
              d="M 85,320 Q 150,110 270,90 T 520,84 T 700,82 T 930,130"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              opacity="0.6"
            />
            {/* Lintas Selatan Madura Route */}
            <path
              d="M 85,340 Q 125,360 275,350 T 520,335 T 700,318 T 850,285"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.2"
              opacity="0.65"
            />
            {/* Cross-Island Corridor: Sampang - Ketapang */}
            <path d="M 430,345 L 430,85" fill="none" stroke="#e2e8f0" strokeWidth="1.8" strokeDasharray="3 3" />
            {/* Cross-Island Corridor: Pamekasan - Waru */}
            <path d="M 590,330 L 590,80" fill="none" stroke="#e2e8f0" strokeWidth="1.8" strokeDasharray="3 3" />

            {/* Regional Territory Labels */}
            <g opacity="0.75">
              {/* BANGKALAN */}
              <text x="175" y="220" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle">
                BANGKALAN
              </text>
              <text x="120" y="335" fill="#64748b" fontSize="10" fontWeight="semibold">Kamal</text>

              {/* SAMPANG & KETAPANG */}
              <text x="400" y="275" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle">
                SAMPANG
              </text>
              <text x="400" y="125" fill="#047857" fontSize="12" fontWeight="bold" textAnchor="middle">
                ULP KETAPANG
              </text>
              <text x="400" y="325" fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle">
                ULP SAMPANG
              </text>

              {/* PAMEKASAN & WARU */}
              <text x="610" y="275" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle">
                PAMEKASAN
              </text>
              <text x="610" y="125" fill="#047857" fontSize="12" fontWeight="bold" textAnchor="middle">
                ULP WARU
              </text>
              <text x="610" y="320" fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle">
                ULP PAMEKASAN
              </text>

              {/* SUMENEP & AMBUNTEN */}
              <text x="815" y="235" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle">
                SUMENEP
              </text>
              <text x="760" y="120" fill="#047857" fontSize="12" fontWeight="bold" textAnchor="middle">
                ULP AMBUNTEN
              </text>
              <text x="830" y="290" fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle">
                ULP SUMENEP
              </text>
            </g>
          </svg>

          {/* Legend Overlay */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs border border-slate-200 p-2.5 rounded-xl shadow-xs text-[11px] space-y-1 z-10 pointer-events-auto">
            <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider mb-1">
              Status Operasi Genset:
            </span>
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs"></span>
              <span>Operasi Aktif ({records.filter((r) => r.status.toLowerCase().includes('operasi')).length})</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs"></span>
              <span>Dilokasi Siap ({records.filter((r) => r.status.toLowerCase().includes('dilokasi')).length})</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs"></span>
              <span>Belum Tiba ({records.filter((r) => r.status.toLowerCase().includes('belum')).length})</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-800">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
              <span>Trip / Beban Kritis &gt;80%</span>
            </div>
          </div>

          {/* Interactive Genset Markers on Authentic Island Geometry */}
          {filteredMapRecords.map((record) => {
            const pos = projectGeoToSvg(record.coordinates.lng, record.coordinates.lat);
            const color = getMarkerColor(record);
            const isSelected = selectedRecord?.id === record.id;
            const isTrip = record.keterangan.toLowerCase().includes('trip');
            const isOverload = record.persenBebanGenset >= 80;

            // Percentage positioning relative to SVG width/height
            const leftPct = (pos.x / SVG_WIDTH) * 100;
            const topPct = (pos.y / SVG_HEIGHT) * 100;

            return (
              <div
                key={record.id}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                }}
                onClick={() => {
                  setSelectedRecord(record);
                  onSelectRecord?.(record);
                }}
                onMouseEnter={() => setHoveredRecord(record)}
                onMouseLeave={() => setHoveredRecord(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                title={`No ${record.no}: ${record.gardu} (${record.genset}) - ${record.status}`}
              >
                {/* Ping animation for Trip or Overload */}
                {(isTrip || isOverload) && (
                  <span
                    style={{ backgroundColor: color }}
                    className="animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-60 -top-1 -left-1"
                  ></span>
                )}

                {/* Pin element */}
                <div
                  style={{ backgroundColor: color }}
                  className={`flex items-center justify-center text-white font-mono font-bold text-[10px] rounded-full shadow-md border-2 border-white transition-all duration-200 ${
                    isSelected
                      ? 'w-7 h-7 scale-125 ring-2 ring-slate-900 z-30'
                      : 'w-5 h-5 hover:scale-125'
                  }`}
                >
                  {record.no}
                </div>

                {/* Hover Tooltip */}
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-30">
                  <div className="font-bold flex items-center gap-1">
                    <span>No {record.no}:</span>
                    <span>{record.gardu !== '-' ? record.gardu : record.ulp}</span>
                    <span className="text-emerald-400 font-mono">({record.genset})</span>
                  </div>
                  <div className="text-[9px] text-slate-300 mt-0.5">
                    {record.status} • {record.bebanKva} kVA ({record.persenBebanGenset}%)
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* Selected Marker Detail Card (Flyout Card) */}
      {selectedRecord && (
        <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/80 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                NO: {selectedRecord.no}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Gardu {selectedRecord.gardu} - {selectedRecord.ulp}
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                ({selectedRecord.genset} • {selectedRecord.pemilikGenset})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedRecord.titikLokasiAwal && (
                <a
                  href={selectedRecord.titikLokasiAwal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Buka di Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Metric specs for selected marker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Status Operasi:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                {selectedRecord.status.toLowerCase().includes('operasi') ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                )}
                {selectedRecord.status}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Beban Riil:</span>
              <span className="font-mono font-bold text-emerald-700 mt-0.5 block">
                {selectedRecord.bebanKva} kVA ({selectedRecord.estimasiBebanAmpere} A)
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Rasio Loading:</span>
              <span
                className={`font-mono font-bold mt-0.5 block ${
                  selectedRecord.persenBebanGenset >= 80 ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                {selectedRecord.persenBebanGenset}% Kapasitas
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Konsumsi BBM:</span>
              <span className="font-mono font-bold text-blue-700 mt-0.5 block">
                {selectedRecord.estimasiBbmLiterJam} L/jam
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Kapasitas Gardu:</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                {selectedRecord.kapasitasGardu} kVA
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Pelaksana & Tim:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {selectedRecord.team || 'UP3 MDR'}
              </span>
            </div>
          </div>

          {/* Operational notes if exists */}
          {(selectedRecord.keterangan || selectedRecord.relokasiUlp || selectedRecord.tindakLanjut) && (
            <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Catatan Operasional:</strong>{' '}
                  {selectedRecord.keterangan && (
                    <span className="font-semibold text-red-700">[{selectedRecord.keterangan}] </span>
                  )}
                  {selectedRecord.tindakLanjut && <span>Tindak lanjut: {selectedRecord.tindakLanjut}. </span>}
                  {selectedRecord.relokasiUlp && (
                    <span>
                      Rencana relokasi ke <strong>{selectedRecord.relokasiUlp} ({selectedRecord.relokasiGardu})</strong> beban {selectedRecord.relokasiBeban} kVA ({selectedRecord.relokasiPersenBeban}%).
                    </span>
                  )}
                </span>
              </div>

              {selectedRecord.titikLokasiBaru && (
                <a
                  href={selectedRecord.titikLokasiBaru}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex-shrink-0"
                >
                  <span>Titik Relokasi Baru</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

        </div>
      )}

      {/* Map Summary Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          Menampilkan <strong>{filteredMapRecords.length} unit genset</strong> seluruhnya berada di wilayah daratan Pulau Madura
        </span>
        <span className="text-slate-400 text-[11px]">
          Koordinat diselaraskan dengan batas wilayah ULP: Pamekasan, Waru, Ketapang, Sampang, Sumenep, Ambunten
        </span>
      </div>

    </div>
  );
};
