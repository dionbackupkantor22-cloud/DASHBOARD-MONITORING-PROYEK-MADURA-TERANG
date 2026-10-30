export interface GensetRecord {
  id: string; // Unique row identifier
  rowIndex: number;
  no: string; // e.g. "1", "2", "32"
  genset: string; // e.g. "600 kVA", "300 kVA"
  capacityKva: number; // e.g. 600, 500, 350, 300, 250, 160
  
  // Operational Fields from Spreadsheet (Tab DATA gid=0)
  status: 'Operasi' | 'Di lokasi' | 'Dilokasi' | 'Belum Tiba' | string;
  tglTiba: string; // e.g. "24 Okt 2026"
  tglInstall: string; // e.g. "24 Okt 2026", "25 Okt 2026"
  ulp: string; // e.g. "PAMEKASAN", "WARU", "KETAPANG", "SUMENEP", "SAMPANG", "AMBUNTEN"
  gardu: string; // e.g. "KA131", "KA0076", "KJ002", "KF164"
  kapasitasGardu: number; // e.g. 250, 200, 160, 100
  bebanKva: number; // e.g. 180, 265, 253, 218
  estimasiBebanAmpere: number; // e.g. 274, 403, 384, 331
  persenBebanGenset: number; // e.g. 30, 53, 98, 70 (%)
  estimasiBbmLiterJam: number; // e.g. 63.50, 93.49, 89.26 (L/jam)
  
  // Relokasi Information
  relokasiUlp: string;
  relokasiGardu: string;
  relokasiKapasitasGardu: number;
  relokasiBeban: number;
  relokasiPersenBeban: number;
  
  // Ownership & Logistics
  pemilikGenset: string; // e.g. "GENSET PLN", "GENSET PLN DI STADION", "GENSET ES"
  titikLokasiAwal: string; // Google Maps URL
  titikLokasiBaru: string; // Google Maps URL (Relokasi)
  keterangan: string;
  tindakLanjut: string;
  atributPerangkat: string; // e.g. "ATS"
  team: string; // e.g. "UP3 MDR", "HAR SBB", or "-"

  // Geographic coordinates for map plotting
  coordinates: {
    lat: number;
    lng: number;
  };

  // Backward compatibility fields
  volume: number;
  penyedia: string;
  statusMobilisasi: string;
  lokasiPemasangan: string;
  wilayah: string;
  kodeGardu: string;
  statusInstalasi: string;
  pelaksanaInstalasi: string;
  unitAsal: string;

  // Data Quality Flags
  hasDuplicateNo: boolean;
  missingFields: string[];
}

// ==========================================================
// TAB 2: SHEET "DASHBOARD" (gid=164028602) RECAP INTERFACES
// ==========================================================

export interface StatusRecapRow {
  no: string;
  status: string;
  unit: number;
  kapasitasKva: number;
  bebanTrafoKva: number;
  estimasiBbmJam: number;
}

export interface UlpRecapRow {
  no: string;
  ulp: string;
  unit: number;
  kapasitasKva: number;
  bebanTrafoKva: number;
  estimasiBbmJam: number;
}

export interface CapacityRecapRow {
  no: string;
  kapasitasKva: number;
  unit: number;
  totalKapasitasKva: number;
  bebanTrafoKva: number;
  belumTiba: number;
  diLokasi: number;
  operasi: number;
}

export interface DashboardSheetRecap {
  statusRows: StatusRecapRow[];
  statusTotal: {
    unit: number;
    kapasitasKva: number;
    bebanTrafoKva: number;
    estimasiBbmJam: number;
  };
  ulpRows: UlpRecapRow[];
  ulpTotal: {
    unit: number;
    kapasitasKva: number;
    bebanTrafoKva: number;
    estimasiBbmJam: number;
  };
  capacityRows: CapacityRecapRow[];
  capacityTotal: {
    unit: number;
    totalKapasitasKva: number;
    bebanTrafoKva: number;
    belumTiba: number;
    diLokasi: number;
    operasi: number;
  };
}

// ==========================================================
// TAB 3: SHEET "REGU" (gid=1442113655) INTERFACES
// ==========================================================

export interface ReguRecord {
  id: string;
  no: string;
  ulp: string;
  gardu: string;
  keteranganGenset: string; // e.g. "GENSET PLN", "GENSET ES"
  koordinat: string;
  reguSbb: string;
  reguSbs: string;
  reguSbu: string;
  reguGrk: string;
  reguSda: string;
  reguMdr: string;
  atsAmpere: number; // e.g. 630, 400
  a3csMeter: number; // e.g. 20
  skat150Bh: number; // e.g. 16, 8
  groundingSet: number; // e.g. 1
  team: string; // e.g. "HAR SDA", "HAR MDR", "HAR GRK", "SUDAH INSTAL"
  keteranganStatus: string; // e.g. "RELOKASI", "TAHAP 2"
}

export interface ReguSheetData {
  rows: ReguRecord[];
  totals: {
    totalA3csMeter: number;
    totalSkat150Bh: number;
    totalGroundingSet: number;
    totalRows: number;
    totalWithAts: number;
  };
}

export interface ProviderMetric {
  penyedia: string;
  unitCount: number;
  totalCapacityKva: number;
  operasiCount: number;
  dilokasiCount: number;
  belumTibaCount: number;
  totalBebanKva: number;
  totalBbmLiterJam: number;
}

export interface RegionMetric {
  wilayah: string; // ULP name
  unitCount: number;
  totalCapacityKva: number;
  operasiCount: number;
  dilokasiCount: number;
  belumTibaCount: number;
  totalBebanKva: number;
  totalBbmJam: number;
  garduList: string[];
}

export interface OverloadUnitSummary {
  no: string;
  gardu: string;
  ulp: string;
  persenBeban: number;
  bebanKva: number;
  capacityKva: number;
}

export interface DashboardMetrics {
  totalUnits: number;
  totalCapacityKva: number;
  totalCapacityMva: number;
  
  // Unique Unit Numbers
  uniqueNoCount: number;
  duplicateNoList: string[];

  // Real-time Operational Status (100% synced with Tab DASHBOARD)
  unitOperasi: number;
  unitOperasiKva: number;
  unitOperasiBebanKva: number;
  unitOperasiBbmJam: number;

  unitDilokasi: number;
  unitDilokasiKva: number;
  unitDilokasiBebanKva: number;
  unitDilokasiBbmJam: number;

  unitBelumTiba: number;
  unitBelumTibaKva: number;
  unitBelumTibaBebanKva: number;
  unitBelumTibaBbmJam: number;

  // Total across all 32 units (matching Tab DASHBOARD Total row: 4,908 kVA & 1,731.54 L/jam)
  totalBebanTrafoAllKva: number;
  totalEstimasiBbmAllJam: number;

  // Operational Load & Fuel
  totalBebanOperasiKva: number;
  totalEstimasiBbmLiterJam: number;
  rataRataLoadingPersen: number;
  maxLoadingPersen: number;
  maxLoadingGardu: string;
  unitOverloadCount: number; // >=80% loading
  overloadUnits: OverloadUnitSummary[];
  potensiRelokasiCount: number;

  // Percentages with denominators
  realisasiOperasiPersen: number;
  realisasiTibaPersen: number;
  realisasiKapasitasOperasiPersen: number;

  // Provider summary
  providerMetrics: ProviderMetric[];

  // ULP summary
  regionMetrics: RegionMetric[];

  // Full Recap Tables from Tab DASHBOARD
  dashboardRecap: DashboardSheetRecap;

  // Data Quality Metrics
  totalQualityIssues: number;
  recordsWithMissingFieldsCount: number;
  tripOverCurrentCount: number;
}

export interface ManagementActionItem {
  id: string;
  category: 'Operasi & Keandalan' | 'Logistik & Kedatangan' | 'Relokasi & Optimasi';
  severity: 'Tinggi' | 'Sedang' | 'Info';
  title: string;
  description: string;
  affectedUnitsCount: number;
  unitIdentifiers: string[];
  recommendedAction: string;
  mapsUrl?: string;
}

export interface DataSourceState {
  sourceType: 'source_file' | 'google_sheets_live';
  spreadsheetId?: string;
  spreadsheetGid?: string;
  sheetName?: string;
  lastUpdated: Date | null;
  isSyncing: boolean;
  isStale: boolean;
  error: string | null;
  autoRefreshCountdown: number;
}

export interface FilterState {
  searchQuery: string;
  penyedia: string; // 'ALL' or specific
  status: string; // 'ALL' | 'Operasi' | 'Di lokasi' | 'Belum Tiba'
  ulp: string; // 'ALL' or specific ULP
  relokasiOnly: boolean;
  overloadOnly: boolean; // >=80% loading
  team: string; // 'ALL' or specific
}
