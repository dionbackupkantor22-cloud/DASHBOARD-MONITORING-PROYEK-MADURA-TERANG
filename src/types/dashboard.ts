export interface GensetRecord {
  id: string; // Unique row identifier
  rowIndex: number;
  no: string; // e.g. "1", "2", "32"
  genset: string; // e.g. "600 kVA", "300 kVA"
  capacityKva: number; // e.g. 600, 500, 350, 300, 250, 160
  
  // New Operational Fields from Spreadsheet
  status: 'Operasi' | 'Dilokasi' | 'Belum Tiba' | string;
  tglTiba: string; // e.g. "24 Oct 2026"
  tglInstall: string; // e.g. "24 Oct 2026", "25 Oct 2026"
  ulp: string; // e.g. "PAMEKASAN", "WARU", "KETAPANG", "SUMENEP", "SAMPANG", "AMBUNTEN"
  gardu: string; // e.g. "KA0076", "KJ002", "KF164"
  kapasitasGardu: number; // e.g. 250, 200, 160
  bebanKva: number; // e.g. 265, 253, 218
  estimasiBebanAmpere: number; // e.g. 403, 384, 331
  persenBebanGenset: number; // e.g. 53, 98, 70 (%)
  estimasiBbmLiterJam: number; // e.g. 95.4, 63, 44.28 (L/jam)
  
  // Relokasi Information
  relokasiUlp: string;
  relokasiGardu: string;
  relokasiKapasitasGardu: number;
  relokasiBeban: number;
  relokasiPersenBeban: number;
  
  // Ownership & Logistics
  pemilikGenset: string; // e.g. "GENSET PLN", "GENSET ES"
  titikLokasiAwal: string; // Google Maps URL
  titikLokasiBaru: string; // Google Maps URL (Relokasi)
  keterangan: string; // e.g. "TRIP OVER CURRENT", "GENSET PLN DI STADION"
  tindakLanjut: string; // e.g. "RELOKASI", "ATS"
  team: string; // e.g. "UP3 MDR", "HAR SBB"

  // Geographic coordinates for map plotting
  coordinates: {
    lat: number;
    lng: number;
  };

  // Backward compatibility fields
  volume: number;
  penyedia: string; // maps to pemilikGenset
  statusMobilisasi: string; // 'Tiba di Madura' | 'Belum Tiba'
  lokasiPemasangan: string; // e.g. "PAMEKASAN (KA0076)"
  wilayah: string; // maps to ulp
  kodeGardu: string; // maps to gardu
  statusInstalasi: string; // 'Operasi' | 'Dilokasi' | 'Belum Tiba'
  pelaksanaInstalasi: string; // maps to team
  unitAsal: string;

  // Data Quality Flags
  hasDuplicateNo: boolean;
  missingFields: string[];
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
  garduList: string[];
}

export interface DashboardMetrics {
  totalUnits: number;
  totalCapacityKva: number;
  totalCapacityMva: number;
  
  // Unique Unit Numbers
  uniqueNoCount: number;
  duplicateNoList: string[];

  // Real-time Operational Status
  unitOperasi: number;
  unitOperasiKva: number;
  unitDilokasi: number;
  unitDilokasiKva: number;
  unitBelumTiba: number;
  unitBelumTibaKva: number;

  // Operational Load & Fuel
  totalBebanOperasiKva: number;
  totalEstimasiBbmLiterJam: number;
  rataRataLoadingPersen: number;
  maxLoadingPersen: number;
  unitOverloadCount: number; // >80% loading
  potensiRelokasiCount: number; // relokasi flagged

  // Percentages with denominators
  realisasiOperasiPersen: number; // unitOperasi / totalUnits * 100
  realisasiTibaPersen: number; // (unitOperasi + unitDilokasi) / totalUnits * 100
  realisasiKapasitasOperasiPersen: number; // unitOperasiKva / totalCapacityKva * 100

  // Provider summary
  providerMetrics: ProviderMetric[];

  // ULP summary
  regionMetrics: RegionMetric[];

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
  status: string; // 'ALL' | 'Operasi' | 'Dilokasi' | 'Belum Tiba'
  ulp: string; // 'ALL' or specific ULP
  relokasiOnly: boolean;
  overloadOnly: boolean; // >80% loading
  team: string; // 'ALL' or specific
}
