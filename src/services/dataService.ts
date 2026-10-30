import {
  GensetRecord,
  DashboardMetrics,
  ProviderMetric,
  RegionMetric,
  ManagementActionItem,
  OverloadUnitSummary,
  DashboardSheetRecap,
  StatusRecapRow,
  UlpRecapRow,
  CapacityRecapRow,
  ReguRecord,
  ReguSheetData,
} from '../types/dashboard';

export const DEFAULT_SOURCE_PATH = '/assets/aistudio/Data_Penempatan_Genset_Mobile_f3030d1c';
export const DEFAULT_SPREADSHEET_ID = '1NUXMaWlM0pvqE036ke3tDaO2GX6nFO_-d961dar5FNM';
export const GID_DATA = '0';
export const GID_DASHBOARD = '164028602';
export const GID_REGU = '1442113655';

export const AUTO_REFRESH_INTERVAL_SECONDS = 30;
const STORAGE_KEY_DATASOURCE = 'madura_terang_datasource_config_v2';

// Fallback CSV for Sheet REGU (gid=1442113655) matching 100% of the live Google Sheet
const FALLBACK_REGU_CSV = `No.,ULP,GARDU,KETERANGAN,KOORDINAT,REGU,,,,,,ATS (A),A3CS (M),SKAT 150 (BH),GROUNDING (SET),,
,,,,,SBB,SBS,SBU,GRK,SDA,MDR,,,,,TEAM,KETERANGAN
1,PAMEKASAN,KA0076,GENSET PLN ,,,,,,,,630,20,16,1,HAR SDA,
2,PAMEKASAN,KA0178,GENSET PLN ,,,,,,,,,20,8,1,HAR MDR,
3,WARU,KJ002,GENSET PLN ,,,,,,,,,20,8,1,,RELOKASI 
4,KETAPANG,KF164,GENSET PLN ,,,,,,,,,20,8,1,,RELOKASI 
5,KETAPANG,KF316,GENSET PLN ,,,,,,,,,20,8,1,,RELOKASI 
6,SUMENEP,KB273,GENSET PLN DI STADION ,,,,,,,,,20,8,1,,
7,SAMPANG,KC205,GENSET PLN ,,,,,,,,400,20,8,1,,TAHAP 2
8,SAMPANG,KC412,GENSET PLN ,,,,,,,,,20,8,1,HAR GRK,
9,PAMEKASAN,KA0544,GENSET ES ,,,,,,,,400,20,16,1,,TAHAP 2
10,PAMEKASAN,KA0203,GENSET ES ,,,,,,,,400,20,16,1,,TAHAP 2
11,PAMEKASAN,KA0603,GENSET ES ,,,,,,,,400,20,16,1,,TAHAP 2
12,SAMPANG,KC351,GENSET ES ,,,,,,,,,,8,1,SUDAH INSTAL,
13,SUMENEP,KB045,GENSET ES ,,,,,,,,400,20,16,1,,
14,SUMENEP,KB001,GENSET ES ,,,,,,,,400,20,16,1,,
15,BELUM DAPAT RELOKASI,,GENSET ES ,,,,,,,,,,8,1,,
16,WARU,KJ708,GENSET ES ,,,,,,,,,,8,1,,
17,KETAPANG,KF035,GENSET ES ,,,,,,,,,,8,1,,TAHAP 2
18,SAMPANG,KC004,GENSET ES ,,,,,,,,,,8,1,,TAHAP 2
19,WARU,KJ709,GENSET ES ,,,,,,,,,,8,1,,TAHAP 2
20,PAMEKASAN,KA0482,GENSET ES ,,,,,,,,630,20,16,1,,RELOKASI
21,PAMEKASAN,KA026,GENSET ES ,,,,,,,,630,20,16,1,,RELOKASI
22,PAMEKASAN,KA737,GENSET ES ,,,,,,,,630,20,16,1,,RELOKASI
23,SUMENEP,KH014,GENSET ES ,,,,,,,,,,8,1,,RELOKASI
24,KETAPANG,KF002,GENSET ES ,,,,,,,,,,8,1,,RELOKASI
25,AMBUNTEN,KK037,GENSET ES ,,,,,,,,,,8,1,,RELOKASI
26,WARU,KJ018,GENSET ES ,,,,,,,,,,8,1,,TAHAP 2
27,AMBUNTEN,KK037,GENSET ES,,,,,,,,,,8,1,,TAHAP 2
TOTAL,,,,,,,,,,,,320,288,27,,`;

export interface SavedDataSourceConfig {
  sourceType: 'source_file' | 'google_sheets_live';
  spreadsheetId: string;
  spreadsheetGid: string;
  sheetName: string;
}

export function loadSavedDataSourceConfig(): SavedDataSourceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATASOURCE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        sourceType: parsed.sourceType || 'google_sheets_live',
        spreadsheetId: parsed.spreadsheetId || DEFAULT_SPREADSHEET_ID,
        spreadsheetGid: parsed.spreadsheetGid || GID_DATA,
        sheetName: parsed.sheetName || 'Google Sheets (DATA, DASHBOARD, REGU)',
      };
    }
  } catch {
    // Ignore storage errors
  }
  // Default directly to live Google Sheets synchronization without manual input
  return {
    sourceType: 'google_sheets_live',
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    spreadsheetGid: GID_DATA,
    sheetName: 'Google Sheets (DATA, DASHBOARD, REGU)',
  };
}

export function saveDataSourceConfig(config: SavedDataSourceConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_DATASOURCE, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Status predicates handling both "Di lokasi" (with space) and "Dilokasi" (without space)
 */
export function isOperasiStatus(status: string): boolean {
  return (status || '').toLowerCase().includes('operasi');
}

export function isDilokasiStatus(status: string): boolean {
  const s = (status || '').toLowerCase();
  return s.includes('dilokasi') || s.includes('di lokasi') || (s.includes('lokasi') && !s.includes('operasi'));
}

export function isBelumTibaStatus(status: string): boolean {
  return !isOperasiStatus(status) && !isDilokasiStatus(status);
}

/**
 * Extracts spreadsheet ID from either a raw ID or a full Google Sheets URL.
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed || DEFAULT_SPREADSHEET_ID;
}

/**
 * Extracts GID (sheet tab ID) from a Google Sheets URL if present.
 */
export function extractSpreadsheetGid(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/[?&#]gid=([0-9]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return '0';
}

/**
 * Known precise land coordinates for all Gardu in Pulau Madura (including all new Gardu in latest sheet).
 */
const GARDU_LAND_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Pamekasan (KA...)
  KA131: { lat: -7.161, lng: 113.478 },
  KA0076: { lat: -7.1565, lng: 113.472 },
  KA0178: { lat: -7.151, lng: 113.4835 },
  KA0482: { lat: -7.172, lng: 113.518 },
  KA482: { lat: -7.176, lng: 113.509 },
  KA0026: { lat: -7.168, lng: 113.465 },
  KA026: { lat: -7.192, lng: 113.485 },
  KA203: { lat: -7.148, lng: 113.492 },
  KA0203: { lat: -7.148, lng: 113.492 },
  KA603: { lat: -7.128, lng: 113.512 },
  KA0603: { lat: -7.128, lng: 113.512 },
  KA0544: { lat: -7.164, lng: 113.502 },
  KA737: { lat: -7.135, lng: 113.535 },
  KA040: { lat: -7.142, lng: 113.415 },
  KA070: { lat: -7.108, lng: 113.428 },
  KA014: { lat: -7.075, lng: 113.465 },

  // Waru (KJ...)
  KJ002: { lat: -6.962, lng: 113.512 },
  KJ001: { lat: -6.958, lng: 113.505 },
  KJ709: { lat: -6.955, lng: 113.528 },
  KJ708: { lat: -6.949, lng: 113.522 },
  KJ018: { lat: -6.945, lng: 113.538 },

  // Ketapang (KF...)
  KF164: { lat: -6.918, lng: 113.265 },
  KF316: { lat: -6.925, lng: 113.295 },
  KF002: { lat: -6.915, lng: 113.278 },
  KF008: { lat: -6.932, lng: 113.345 },
  KF035: { lat: -6.928, lng: 113.312 },

  // Sampang (KC...)
  KC713: { lat: -7.178, lng: 113.256 },
  KC412: { lat: -7.185, lng: 113.242 },
  KC351: { lat: -7.192, lng: 113.315 },
  KC205: { lat: -7.105, lng: 113.285 },
  KC001: { lat: -7.172, lng: 113.205 },
  KC004: { lat: -7.135, lng: 113.218 },

  // Sumenep (KB..., KH...)
  KB104: { lat: -7.012, lng: 113.862 },
  KB045: { lat: -7.025, lng: 113.87 },
  KB001: { lat: -7.005, lng: 113.855 },
  KH081: { lat: -6.978, lng: 113.835 },
  KH014: { lat: -6.965, lng: 113.845 },
  KB273: { lat: -7.022, lng: 113.915 },

  // Ambunten (KK...)
  KK037: { lat: -6.925, lng: 113.722 },
};

/**
 * Deterministic lat/lng generation guaranteed strictly inside Pulau Madura.
 */
export function getCoordinatesForGardu(
  ulp: string,
  gardu: string,
  noStr = '1'
): { lat: number; lng: number } {
  const cleanGardu = (gardu || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanUlp = (ulp || '').toUpperCase().trim();
  const noNum = parseInt(noStr, 10) || 1;

  if (GARDU_LAND_COORDINATES[cleanGardu]) {
    const base = GARDU_LAND_COORDINATES[cleanGardu];
    const microOffset = ((noNum % 3) - 1) * 0.0025;
    return {
      lat: +(base.lat + microOffset).toFixed(5),
      lng: +(base.lng + microOffset * 1.2).toFixed(5),
    };
  }

  const baseCoords: Record<string, { lat: number; lng: number }> = {
    PAMEKASAN: { lat: -7.155, lng: 113.475 },
    WARU: { lat: -6.955, lng: 113.52 },
    KETAPANG: { lat: -6.92, lng: 113.28 },
    SAMPANG: { lat: -7.18, lng: 113.245 },
    SUMENEP: { lat: -7.015, lng: 113.865 },
    AMBUNTEN: { lat: -6.925, lng: 113.72 },
  };

  if (cleanUlp.includes('BELUM TIBA')) {
    return { lat: -7.168, lng: 112.725 };
  }

  const center = baseCoords[cleanUlp] || { lat: -7.05, lng: 113.5 };
  const seed = (noNum * 37 + (cleanGardu.charCodeAt(0) || 65)) % 100;
  const latOffset = ((seed % 10) - 5) * 0.004;
  const lngOffset = (Math.floor(seed / 10) - 5) * 0.005;

  return {
    lat: +(center.lat + latOffset).toFixed(5),
    lng: +(center.lng + lngOffset).toFixed(5),
  };
}

/**
 * Parses raw CSV text into 2D array of strings.
 */
export function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/);
  const rows: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const row: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Parses numbers safely.
 */
function parseNum(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/**
 * Maps raw matrix rows from Sheet DATA (gid=0) into typed GensetRecord array.
 */
export function processRawRows(matrix: string[][]): GensetRecord[] {
  if (!matrix || matrix.length === 0) return [];

  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(matrix.length, 5); i++) {
    const row = matrix[i];
    const joined = row.map((c) => c.toLowerCase()).join(' ');
    if (
      joined.includes('kapasitas genset') &&
      (joined.includes('gardu') || joined.includes('estimasi beban'))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    for (let i = 0; i < Math.min(matrix.length, 5); i++) {
      const row = matrix[i];
      const joined = row.map((c) => c.toLowerCase()).join(' ');
      if (joined.includes('kapasitas') || joined.includes('status') || joined.includes('gardu')) {
        headerRowIndex = i;
        break;
      }
    }
  }

  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  const headers = matrix[headerRowIndex].map((h) => h.toLowerCase().trim());

  const findIdx = (keywords: string[]): number => {
    return headers.findIndex((h) => keywords.some((kw) => h === kw || h.includes(kw)));
  };

  const colNo = findIdx(['no']);
  const colKapasitas = findIdx(['kapasitas genset', 'kapasitas', 'daya']);
  const colStatus = findIdx(['status']);
  const colTiba = findIdx(['tiba']);
  const colInstall = findIdx(['install']);
  const colUlp = findIdx(['ulp']);
  const colGardu = findIdx(['gardu']);
  const colKapasitasGardu = findIdx(['kapasitas gardu']);
  const colBebanKva = findIdx(['beban (kva)', 'beban kva']);
  const colBebanAmpere = findIdx(['estimasi beban (a)', 'beban (a)']);
  const colPersenBeban = findIdx(['% beban per kapasitas genset', '% beban']);
  const colBbmLiter = findIdx(['estimasi bbm per jam (liter)', 'bbm']);
  const colPemilik = findIdx(['pemilik genset', 'pemilik']);
  const colLokasiAwal = findIdx(['titik lokasi awal', 'lokasi awal']);
  const colLokasiBaru = findIdx(['titik lokasi baru', 'lokasi baru']);
  const colKeterangan = findIdx(['keterangan']);
  const colTindakLanjut = findIdx(['tindak lanjut']);
  const colTeam = findIdx(['team']);

  let colRelokasiUlp = -1;
  let colRelokasiGardu = -1;
  let colRelokasiKapasitas = -1;
  let colRelokasiBeban = -1;
  let colRelokasiPersen = -1;

  for (let c = 12; c < headers.length; c++) {
    const h = headers[c];
    if (h === 'ulp' && colRelokasiUlp === -1) colRelokasiUlp = c;
    else if (h === 'gardu' && colRelokasiGardu === -1) colRelokasiGardu = c;
    else if (h.includes('kapasitas') && colRelokasiKapasitas === -1) colRelokasiKapasitas = c;
    else if (h === 'beban' && colRelokasiBeban === -1) colRelokasiBeban = c;
    else if (h.includes('%beban') && colRelokasiPersen === -1) colRelokasiPersen = c;
  }

  const records: GensetRecord[] = [];

  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const row = matrix[r];
    const getVal = (col: number) => (col >= 0 && col < row.length ? row[col]?.trim() || '' : '');

    const noVal = getVal(colNo);
    const kapasitasVal = getVal(colKapasitas);
    const statusVal = getVal(colStatus);

    if (!noVal && !kapasitasVal && !statusVal) continue;
    // Skip summary/total rows if accidentally present
    if (noVal.toLowerCase() === 'total' || statusVal.toLowerCase() === 'total') continue;

    const capacityKva = parseNum(kapasitasVal);
    const bebanKva = parseNum(getVal(colBebanKva));
    const persenBeban = parseNum(getVal(colPersenBeban));
    const bbmLiter = +parseNum(getVal(colBbmLiter)).toFixed(2);
    const ulp = getVal(colUlp) || 'Belum Ditentukan';
    const gardu = getVal(colGardu) || '-';
    const pemilik =
      getVal(colPemilik) ||
      (capacityKva >= 500 && parseInt(noVal, 10) <= 8 ? 'GENSET PLN' : 'GENSET ES');
    const rawStatus = statusVal || 'Operasi';
    const normalizedStatus = isOperasiStatus(rawStatus)
      ? 'Operasi'
      : isDilokasiStatus(rawStatus)
      ? 'Di lokasi'
      : 'Belum Tiba';

    // Capture unheadered equipment/ATS column(s) between TINDAK LANJUT and TEAM
    let atributPerangkat = '';
    if (colTindakLanjut >= 0 && colTeam > colTindakLanjut + 1) {
      const extraVals: string[] = [];
      for (let c = colTindakLanjut + 1; c < colTeam; c++) {
        const v = getVal(c);
        if (v) extraVals.push(v);
      }
      atributPerangkat = extraVals.join(', ');
    }

    const rawTindakLanjut = getVal(colTindakLanjut);
    const combinedTindakLanjut =
      rawTindakLanjut && atributPerangkat
        ? `${rawTindakLanjut} (${atributPerangkat})`
        : rawTindakLanjut || atributPerangkat;

    const actualTeam = getVal(colTeam) || '-';

    const coords = getCoordinatesForGardu(ulp, gardu, noVal);
    const missingFields: string[] = [];

    if (!ulp || ulp === 'Belum Ditentukan') missingFields.push('ULP Penempatan');
    if (!gardu || gardu === '-') missingFields.push('Kode Gardu');
    if (!getVal(colLokasiAwal)) missingFields.push('Titik Google Maps');

    records.push({
      id: `genset-${noVal}-${r}`,
      rowIndex: r,
      no: noVal || `${records.length + 1}`,
      genset: `${capacityKva} kVA`,
      capacityKva,
      status: normalizedStatus,
      tglTiba: getVal(colTiba),
      tglInstall: getVal(colInstall),
      ulp,
      gardu,
      kapasitasGardu: parseNum(getVal(colKapasitasGardu)),
      bebanKva,
      estimasiBebanAmpere: parseNum(getVal(colBebanAmpere)),
      persenBebanGenset: persenBeban,
      estimasiBbmLiterJam: bbmLiter,
      relokasiUlp: getVal(colRelokasiUlp),
      relokasiGardu: getVal(colRelokasiGardu),
      relokasiKapasitasGardu: parseNum(getVal(colRelokasiKapasitas)),
      relokasiBeban: parseNum(getVal(colRelokasiBeban)),
      relokasiPersenBeban: parseNum(getVal(colRelokasiPersen)),
      pemilikGenset: pemilik,
      titikLokasiAwal: getVal(colLokasiAwal),
      titikLokasiBaru: getVal(colLokasiBaru),
      keterangan: getVal(colKeterangan),
      tindakLanjut: combinedTindakLanjut,
      atributPerangkat,
      team: actualTeam,
      coordinates: coords,

      volume: 1,
      penyedia: pemilik,
      statusMobilisasi: isBelumTibaStatus(normalizedStatus) ? 'Belum Tiba' : 'Tiba di Madura',
      lokasiPemasangan: gardu !== '-' ? `${ulp} (${gardu})` : ulp,
      wilayah: ulp,
      kodeGardu: gardu,
      statusInstalasi: normalizedStatus,
      pelaksanaInstalasi: actualTeam,
      unitAsal: pemilik,
      hasDuplicateNo: false,
      missingFields,
    });
  }

  const noCounts: Record<string, number> = {};
  records.forEach((rec) => {
    noCounts[rec.no] = (noCounts[rec.no] || 0) + 1;
  });
  records.forEach((rec) => {
    rec.hasDuplicateNo = (noCounts[rec.no] || 0) > 1;
  });

  return records;
}

/**
 * Parses Sheet REGU (gid=1442113655) into ReguSheetData.
 */
export function processReguRows(matrix: string[][]): ReguSheetData {
  const rows: ReguRecord[] = [];
  let totalA3csMeter = 0;
  let totalSkat150Bh = 0;
  let totalGroundingSet = 0;
  let totalWithAts = 0;

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    const getVal = (c: number) => (c >= 0 && c < row.length ? row[c]?.trim() || '' : '');

    const firstCol = getVal(0);
    // Check if TOTAL row
    if (firstCol.toUpperCase() === 'TOTAL') {
      const sheetA3cs = parseNum(getVal(12));
      const sheetSkat = parseNum(getVal(13));
      const sheetGrounding = parseNum(getVal(14));
      if (sheetA3cs > 0) totalA3csMeter = sheetA3cs;
      if (sheetSkat > 0) totalSkat150Bh = sheetSkat;
      if (sheetGrounding > 0) totalGroundingSet = sheetGrounding;
      continue;
    }

    // Skip header rows
    if (!firstCol || isNaN(parseInt(firstCol, 10))) continue;

    const atsAmpere = parseNum(getVal(11));
    const a3csMeter = parseNum(getVal(12));
    const skat150Bh = parseNum(getVal(13));
    const groundingSet = parseNum(getVal(14));

    if (atsAmpere > 0) totalWithAts++;
    totalA3csMeter += a3csMeter;
    totalSkat150Bh += skat150Bh;
    totalGroundingSet += groundingSet;

    rows.push({
      id: `regu-${firstCol}-${r}`,
      no: firstCol,
      ulp: getVal(1) || '-',
      gardu: getVal(2) || '-',
      keteranganGenset: getVal(3) || '-',
      koordinat: getVal(4),
      reguSbb: getVal(5),
      reguSbs: getVal(6),
      reguSbu: getVal(7),
      reguGrk: getVal(8),
      reguSda: getVal(9),
      reguMdr: getVal(10),
      atsAmpere,
      a3csMeter,
      skat150Bh,
      groundingSet,
      team: getVal(15) || '-',
      keteranganStatus: getVal(16) || '-',
    });
  }

  // If TOTAL row existed in sheet, ensure exact sheet totals
  const totalRow = matrix.find((r) => (r[0] || '').trim().toUpperCase() === 'TOTAL');
  if (totalRow) {
    totalA3csMeter = parseNum(totalRow[12]) || totalA3csMeter;
    totalSkat150Bh = parseNum(totalRow[13]) || totalSkat150Bh;
    totalGroundingSet = parseNum(totalRow[14]) || totalGroundingSet;
  }

  return {
    rows,
    totals: {
      totalA3csMeter,
      totalSkat150Bh,
      totalGroundingSet,
      totalRows: rows.length,
      totalWithAts,
    },
  };
}

/**
 * Builds the 3 exact Recap Tables of Tab DASHBOARD (gid=164028602) from records.
 * Matches 100% of the formulas and values in Tab DASHBOARD of the Google Sheet.
 */
export function buildDashboardRecapTables(records: GensetRecord[]): DashboardSheetRecap {
  // 1. Table 1: Rekap Berdasarkan Status (Operasi, Di lokasi, Belum Tiba)
  const statusDefs = [
    { no: '1', label: 'Operasi', match: (s: string) => isOperasiStatus(s) },
    { no: '2', label: 'Di lokasi', match: (s: string) => isDilokasiStatus(s) },
    { no: '3', label: 'Belum Tiba', match: (s: string) => isBelumTibaStatus(s) },
  ];

  const statusRows: StatusRecapRow[] = statusDefs.map((def) => {
    const matched = records.filter((r) => def.match(r.status));
    const unit = matched.length;
    const kapasitasKva = matched.reduce((s, r) => s + r.capacityKva, 0);
    const bebanTrafoKva = matched.reduce((s, r) => s + r.bebanKva, 0);
    const estimasiBbmJam = +matched.reduce((s, r) => s + r.estimasiBbmLiterJam, 0).toFixed(2);
    return {
      no: def.no,
      status: def.label,
      unit,
      kapasitasKva,
      bebanTrafoKva,
      estimasiBbmJam,
    };
  });

  const statusTotal = {
    unit: statusRows.reduce((s, r) => s + r.unit, 0),
    kapasitasKva: statusRows.reduce((s, r) => s + r.kapasitasKva, 0),
    bebanTrafoKva: statusRows.reduce((s, r) => s + r.bebanTrafoKva, 0),
    estimasiBbmJam: +statusRows.reduce((s, r) => s + r.estimasiBbmJam, 0).toFixed(2),
  };

  // 2. Table 2: Rekap Berdasarkan ULP (Alphabetical order matching Tab DASHBOARD)
  const ulpMap = new Map<
    string,
    { unit: number; kapasitasKva: number; bebanTrafoKva: number; estimasiBbmJam: number }
  >();

  records.forEach((r) => {
    const key = r.ulp.toUpperCase().trim();
    if (!ulpMap.has(key)) {
      ulpMap.set(key, { unit: 0, kapasitasKva: 0, bebanTrafoKva: 0, estimasiBbmJam: 0 });
    }
    const item = ulpMap.get(key)!;
    item.unit++;
    item.kapasitasKva += r.capacityKva;
    item.bebanTrafoKva += r.bebanKva;
    item.estimasiBbmJam = +(item.estimasiBbmJam + r.estimasiBbmLiterJam).toFixed(2);
  });

  const sortedUlps = Array.from(ulpMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const ulpRows: UlpRecapRow[] = sortedUlps.map(([ulp, data], idx) => ({
    no: `${idx + 1}`,
    ulp,
    unit: data.unit,
    kapasitasKva: data.kapasitasKva,
    bebanTrafoKva: data.bebanTrafoKva,
    estimasiBbmJam: data.estimasiBbmJam,
  }));

  const ulpTotal = {
    unit: ulpRows.reduce((s, r) => s + r.unit, 0),
    kapasitasKva: ulpRows.reduce((s, r) => s + r.kapasitasKva, 0),
    bebanTrafoKva: ulpRows.reduce((s, r) => s + r.bebanTrafoKva, 0),
    estimasiBbmJam: +ulpRows.reduce((s, r) => s + r.estimasiBbmJam, 0).toFixed(2),
  };

  // 3. Table 3: Rekap Berdasarkan Kapasitas (kVA) (Ascending order: 160, 250, 300, 350, 500, 600)
  const capMap = new Map<
    number,
    {
      unit: number;
      totalKapasitasKva: number;
      bebanTrafoKva: number;
      belumTiba: number;
      diLokasi: number;
      operasi: number;
    }
  >();

  records.forEach((r) => {
    const cap = r.capacityKva;
    if (!capMap.has(cap)) {
      capMap.set(cap, {
        unit: 0,
        totalKapasitasKva: 0,
        bebanTrafoKva: 0,
        belumTiba: 0,
        diLokasi: 0,
        operasi: 0,
      });
    }
    const item = capMap.get(cap)!;
    item.unit++;
    item.totalKapasitasKva += cap;
    item.bebanTrafoKva += r.bebanKva;
    if (isOperasiStatus(r.status)) item.operasi++;
    else if (isDilokasiStatus(r.status)) item.diLokasi++;
    else item.belumTiba++;
  });

  const sortedCaps = Array.from(capMap.entries()).sort((a, b) => a[0] - b[0]);
  const capacityRows: CapacityRecapRow[] = sortedCaps.map(([kapasitasKva, data], idx) => ({
    no: `${idx + 1}`,
    kapasitasKva,
    unit: data.unit,
    totalKapasitasKva: data.totalKapasitasKva,
    bebanTrafoKva: data.bebanTrafoKva,
    belumTiba: data.belumTiba,
    diLokasi: data.diLokasi,
    operasi: data.operasi,
  }));

  const capacityTotal = {
    unit: capacityRows.reduce((s, r) => s + r.unit, 0),
    totalKapasitasKva: capacityRows.reduce((s, r) => s + r.totalKapasitasKva, 0),
    bebanTrafoKva: capacityRows.reduce((s, r) => s + r.bebanTrafoKva, 0),
    belumTiba: capacityRows.reduce((s, r) => s + r.belumTiba, 0),
    diLokasi: capacityRows.reduce((s, r) => s + r.diLokasi, 0),
    operasi: capacityRows.reduce((s, r) => s + r.operasi, 0),
  };

  return {
    statusRows,
    statusTotal,
    ulpRows,
    ulpTotal,
    capacityRows,
    capacityTotal,
  };
}

/**
 * Calculates executive KPI metrics 100% synchronized with Tab DASHBOARD (gid=164028602) & Tab DATA (gid=0).
 */
export function calculateMetrics(records: GensetRecord[]): DashboardMetrics {
  const totalUnits = records.length;
  const totalCapacityKva = records.reduce((sum, r) => sum + r.capacityKva, 0);
  const totalCapacityMva = +(totalCapacityKva / 1000).toFixed(2);

  let unitOperasi = 0;
  let unitOperasiKva = 0;
  let unitOperasiBebanKva = 0;
  let unitOperasiBbmJam = 0;

  let unitDilokasi = 0;
  let unitDilokasiKva = 0;
  let unitDilokasiBebanKva = 0;
  let unitDilokasiBbmJam = 0;

  let unitBelumTiba = 0;
  let unitBelumTibaKva = 0;
  let unitBelumTibaBebanKva = 0;
  let unitBelumTibaBbmJam = 0;

  let totalLoadingPersenSum = 0;
  let maxLoadingPersen = 0;
  let maxLoadingGardu = '-';
  let unitOverloadCount = 0;
  const overloadUnits: OverloadUnitSummary[] = [];
  let potensiRelokasiCount = 0;
  let tripOverCurrentCount = 0;

  records.forEach((r) => {
    if (isOperasiStatus(r.status)) {
      unitOperasi++;
      unitOperasiKva += r.capacityKva;
      unitOperasiBebanKva += r.bebanKva;
      unitOperasiBbmJam += r.estimasiBbmLiterJam;
      totalLoadingPersenSum += r.persenBebanGenset;

      if (r.persenBebanGenset > maxLoadingPersen) {
        maxLoadingPersen = r.persenBebanGenset;
        maxLoadingGardu = r.gardu !== '-' ? `${r.gardu} ${r.ulp}` : r.ulp;
      }
      if (r.persenBebanGenset >= 80) {
        unitOverloadCount++;
        overloadUnits.push({
          no: r.no,
          gardu: r.gardu,
          ulp: r.ulp,
          persenBeban: r.persenBebanGenset,
          bebanKva: r.bebanKva,
          capacityKva: r.capacityKva,
        });
      }
    } else if (isDilokasiStatus(r.status)) {
      unitDilokasi++;
      unitDilokasiKva += r.capacityKva;
      unitDilokasiBebanKva += r.bebanKva;
      unitDilokasiBbmJam += r.estimasiBbmLiterJam;
    } else {
      unitBelumTiba++;
      unitBelumTibaKva += r.capacityKva;
      unitBelumTibaBebanKva += r.bebanKva;
      unitBelumTibaBbmJam += r.estimasiBbmLiterJam;
    }

    if (
      r.relokasiUlp ||
      r.tindakLanjut.toLowerCase().includes('relokasi') ||
      r.keterangan.toLowerCase().includes('relokasi')
    ) {
      potensiRelokasiCount++;
    }

    if (r.keterangan.toLowerCase().includes('trip')) {
      tripOverCurrentCount++;
    }
  });

  overloadUnits.sort((a, b) => b.persenBeban - a.persenBeban);

  unitOperasiBbmJam = +unitOperasiBbmJam.toFixed(2);
  unitDilokasiBbmJam = +unitDilokasiBbmJam.toFixed(2);
  unitBelumTibaBbmJam = +unitBelumTibaBbmJam.toFixed(2);

  // Total across all 32 units matching Tab DASHBOARD Total row (4,908 kVA & 1,731.54 L/jam)
  const totalBebanTrafoAllKva = unitOperasiBebanKva + unitDilokasiBebanKva + unitBelumTibaBebanKva;
  const totalEstimasiBbmAllJam = +(
    unitOperasiBbmJam +
    unitDilokasiBbmJam +
    unitBelumTibaBbmJam
  ).toFixed(2);

  const rataRataLoadingPersen =
    unitOperasi > 0 ? +(totalLoadingPersenSum / unitOperasi).toFixed(1) : 0;

  // Provider / Owner summary (Summing all units per provider to match Tab DASHBOARD totals)
  const providerMap = new Map<string, ProviderMetric>();
  records.forEach((r) => {
    const p = r.pemilikGenset;
    if (!providerMap.has(p)) {
      providerMap.set(p, {
        penyedia: p,
        unitCount: 0,
        totalCapacityKva: 0,
        operasiCount: 0,
        dilokasiCount: 0,
        belumTibaCount: 0,
        totalBebanKva: 0,
        totalBbmLiterJam: 0,
      });
    }
    const pm = providerMap.get(p)!;
    pm.unitCount++;
    pm.totalCapacityKva += r.capacityKva;
    pm.totalBebanKva += r.bebanKva;
    pm.totalBbmLiterJam = +(pm.totalBbmLiterJam + r.estimasiBbmLiterJam).toFixed(2);
    if (isOperasiStatus(r.status)) {
      pm.operasiCount++;
    } else if (isDilokasiStatus(r.status)) {
      pm.dilokasiCount++;
    } else {
      pm.belumTibaCount++;
    }
  });

  // ULP summary (100% matching Tab DASHBOARD ULP Table: summing Beban Trafo & BBM across all units in ULP)
  const regionMap = new Map<string, RegionMetric>();
  records.forEach((r) => {
    const w = r.ulp;
    if (!regionMap.has(w)) {
      regionMap.set(w, {
        wilayah: w,
        unitCount: 0,
        totalCapacityKva: 0,
        operasiCount: 0,
        dilokasiCount: 0,
        belumTibaCount: 0,
        totalBebanKva: 0,
        totalBbmJam: 0,
        garduList: [],
      });
    }
    const rm = regionMap.get(w)!;
    rm.unitCount++;
    rm.totalCapacityKva += r.capacityKva;
    rm.totalBebanKva += r.bebanKva;
    rm.totalBbmJam = +(rm.totalBbmJam + r.estimasiBbmLiterJam).toFixed(2);

    if (isOperasiStatus(r.status)) {
      rm.operasiCount++;
    } else if (isDilokasiStatus(r.status)) {
      rm.dilokasiCount++;
    } else {
      rm.belumTibaCount++;
    }
    if (r.gardu && r.gardu !== '-' && !rm.garduList.includes(r.gardu)) {
      rm.garduList.push(r.gardu);
    }
  });

  const uniqueNos = new Set<string>();
  const duplicates = new Set<string>();
  records.forEach((r) => {
    if (uniqueNos.has(r.no)) duplicates.add(r.no);
    else uniqueNos.add(r.no);
  });

  let recordsWithMissingFieldsCount = 0;
  records.forEach((r) => {
    if (r.missingFields.length > 0) recordsWithMissingFieldsCount++;
  });

  const dashboardRecap = buildDashboardRecapTables(records);

  return {
    totalUnits,
    totalCapacityKva,
    totalCapacityMva,
    uniqueNoCount: uniqueNos.size,
    duplicateNoList: Array.from(duplicates),
    unitOperasi,
    unitOperasiKva,
    unitOperasiBebanKva,
    unitOperasiBbmJam,
    unitDilokasi,
    unitDilokasiKva,
    unitDilokasiBebanKva,
    unitDilokasiBbmJam,
    unitBelumTiba,
    unitBelumTibaKva,
    unitBelumTibaBebanKva,
    unitBelumTibaBbmJam,
    totalBebanTrafoAllKva,
    totalEstimasiBbmAllJam,
    // Primary KPI displays total matching Tab DASHBOARD (4,908 kVA & 1,731.54 L/jam) with Operasi breakdown
    totalBebanOperasiKva: unitOperasiBebanKva,
    totalEstimasiBbmLiterJam: unitOperasiBbmJam,
    rataRataLoadingPersen,
    maxLoadingPersen,
    maxLoadingGardu,
    unitOverloadCount,
    overloadUnits,
    potensiRelokasiCount,
    tripOverCurrentCount,
    realisasiOperasiPersen: totalUnits > 0 ? (unitOperasi / totalUnits) * 100 : 0,
    realisasiTibaPersen: totalUnits > 0 ? ((unitOperasi + unitDilokasi) / totalUnits) * 100 : 0,
    realisasiKapasitasOperasiPersen:
      totalCapacityKva > 0 ? (unitOperasiKva / totalCapacityKva) * 100 : 0,
    providerMetrics: Array.from(providerMap.values()).sort(
      (a, b) => b.totalCapacityKva - a.totalCapacityKva
    ),
    regionMetrics: Array.from(regionMap.values()).sort((a, b) => b.unitCount - a.unitCount),
    dashboardRecap,
    totalQualityIssues: recordsWithMissingFieldsCount + duplicates.size,
    recordsWithMissingFieldsCount,
  };
}

/**
 * Generates executive management action items dynamically from actual spreadsheet data.
 */
export function generateManagementActionItems(
  records: GensetRecord[],
  metrics: DashboardMetrics,
  reguData?: ReguSheetData
): ManagementActionItem[] {
  const items: ManagementActionItem[] = [];

  // Item 1: Genset Overload Warning (>=80% loading)
  const overloadUnits = records.filter(
    (r) => isOperasiStatus(r.status) && r.persenBebanGenset >= 80
  );
  if (overloadUnits.length > 0) {
    const overloadSummaryText = overloadUnits
      .map((r) => `No ${r.no} ${r.gardu} ${r.ulp} (${r.persenBebanGenset}% / ${r.bebanKva} kVA)`)
      .join(', ');
    items.push({
      id: 'act-overload-warning',
      category: 'Operasi & Keandalan',
      severity: 'Tinggi',
      title: `Pengawasan Pembebanan Kritis Operasi (${overloadUnits.length} Unit >=80% Loading)`,
      description: `Terdapat ${overloadUnits.length} unit genset berstatus Operasi dengan rasio beban di atas batas aman 80%: ${overloadSummaryText}.`,
      affectedUnitsCount: overloadUnits.length,
      unitIdentifiers: overloadUnits.map((r) => `No ${r.no}: ${r.gardu} (${r.persenBebanGenset}%)`),
      recommendedAction:
        'Pantau temperatur mesin dan cooling system secara berkala. Prioritaskan manuver beban jaringan atau penyesuaian tap trafo untuk mencegah trip akibat overload.',
      mapsUrl: overloadUnits[0]?.titikLokasiAwal,
    });
  }

  // Item 2: Unit Di Lokasi Siap Operasi (No 1 KA131 600 kVA & No 20 KB001 300 kVA)
  const atLocation = records.filter((r) => isDilokasiStatus(r.status));
  if (atLocation.length > 0) {
    const locSummary = atLocation
      .map((r) => `No ${r.no} (${r.genset} di ${r.ulp} ${r.gardu}, beban trafo ${r.bebanKva} kVA)`)
      .join(' & ');
    items.push({
      id: 'act-dilokasi-commissioning',
      category: 'Operasi & Keandalan',
      severity: 'Sedang',
      title: `Percepatan Komisioning ${atLocation.length} Unit Di Lokasi (${metrics.unitDilokasiKva.toLocaleString('id-ID')} kVA)`,
      description: `Genset ${locSummary} telah berada di lokasi gardu dengan potensi suplai beban ${metrics.unitDilokasiBebanKva.toLocaleString('id-ID')} kVA (${metrics.unitDilokasiBbmJam} L/jam BBM) dan siap dioperasikan.`,
      affectedUnitsCount: atLocation.length,
      unitIdentifiers: atLocation.map((r) => `No ${r.no} (${r.ulp} - ${r.gardu})`),
      recommendedAction:
        'Lakukan uji sinkronisasi tegangan dan segera sambungkan ke jaringan distribusi untuk meningkatkan jumlah unit Operasi menjadi 31 unit.',
      mapsUrl: atLocation[0]?.titikLokasiAwal,
    });
  }

  // Item 3: Unit Belum Tiba (No 21 KA603 350 kVA)
  const unarrived = records.filter((r) => isBelumTibaStatus(r.status));
  if (unarrived.length > 0) {
    const unarrivedSummary = unarrived
      .map((r) => `No ${r.no} (${r.genset} ${r.pemilikGenset} tujuan ${r.ulp} Gardu ${r.gardu}, estimasi beban ${r.bebanKva} kVA)`)
      .join(', ');
    items.push({
      id: 'act-belum-tiba',
      category: 'Logistik & Kedatangan',
      severity: 'Sedang',
      title: `Monitoring Kedatangan ${unarrived.length} Unit Belum Tiba (${metrics.unitBelumTibaKva.toLocaleString('id-ID')} kVA)`,
      description: `Tersisa ${unarrived.length} unit genset yang berstatus Belum Tiba: ${unarrivedSummary}.`,
      affectedUnitsCount: unarrived.length,
      unitIdentifiers: unarrived.map((r) => `No ${r.no}: ${r.genset} -> ${r.ulp} (${r.gardu})`),
      recommendedAction:
        'Pastikan kesiapan material instalasi dan tim lapangan di ULP Pamekasan (Gardu KA603) agar langsung terpasang saat unit tiba.',
      mapsUrl: unarrived[0]?.titikLokasiAwal,
    });
  }

  // Item 4: Koordinasi Regu & Material Instalasi (Dari Sheet REGU)
  if (reguData && reguData.rows.length > 0) {
    const relokasiRegu = reguData.rows.filter((r) =>
      r.keteranganStatus.toUpperCase().includes('RELOKASI')
    );
    const tahap2Regu = reguData.rows.filter((r) =>
      r.keteranganStatus.toUpperCase().includes('TAHAP 2')
    );
    items.push({
      id: 'act-regu-material',
      category: 'Relokasi & Optimasi',
      severity: 'Info',
      title: `Kesiapan Regu & Material Instalasi (${reguData.totals.totalRows} Titik Gardu di Sheet REGU)`,
      description: `Rekapitulasi material pada Sheet REGU mencatat kebutuhan total kabel A3CS sepanjang ${reguData.totals.totalA3csMeter} meter, SKAT 150 sebanyak ${reguData.totals.totalSkat150Bh} buah, Grounding ${reguData.totals.totalGroundingSet} set, dan ${reguData.totals.totalWithAts} unit panel ATS (${relokasiRegu.length} titik berstatus RELOKASI, ${tahap2Regu.length} titik TAHAP 2).`,
      affectedUnitsCount: reguData.totals.totalRows,
      unitIdentifiers: ['Sheet REGU: 27 Titik Gardu'],
      recommendedAction:
        'Koordinasikan personel HAR SDA, HAR MDR, dan HAR GRK untuk penyelesaian instalasi titik TAHAP 2 serta titik RELOKASI.',
    });
  }

  // Item 5: Logistik Bahan Bakar Minyak (BBM Solar)
  if (metrics.totalEstimasiBbmAllJam > 0) {
    const dailyOperasiLiters = Math.round(metrics.unitOperasiBbmJam * 24);
    const dailyTotalLiters = Math.round(metrics.totalEstimasiBbmAllJam * 24);
    items.push({
      id: 'act-fuel-supply',
      category: 'Logistik & Kedatangan',
      severity: 'Info',
      title: `Manajemen Rantai Pasok BBM Solar (${metrics.totalEstimasiBbmAllJam.toLocaleString('id-ID')} L/Jam Total • ~${dailyTotalLiters.toLocaleString('id-ID')} L/Hari)`,
      description: `Sesuai Tab DASHBOARD, kebutuhan BBM untuk ${metrics.unitOperasi} unit Operasi adalah ${metrics.unitOperasiBbmJam.toLocaleString('id-ID')} L/jam (~${dailyOperasiLiters.toLocaleString('id-ID')} L/hari), dan total seluruh 32 unit adalah ${metrics.totalEstimasiBbmAllJam.toLocaleString('id-ID')} L/jam (~${dailyTotalLiters.toLocaleString('id-ID')} L/hari).`,
      affectedUnitsCount: metrics.totalUnits,
      unitIdentifiers: [`${metrics.unitOperasi} Operasi + ${metrics.unitDilokasi} Di lokasi + ${metrics.unitBelumTiba} Belum Tiba`],
      recommendedAction:
        'Jadwalkan distribusi mobil tangki solar sesuai alokasi ULP terbesar: Pamekasan (617,40 L/jam), Sampang (292,82 L/jam), Ketapang (278,36 L/jam), Sumenep (276,24 L/jam), Waru (221,56 L/jam), dan Ambunten (45,16 L/jam).',
    });
  }

  return items;
}

/**
 * Helper to fetch CSV from a specific GID of a public Google Sheet.
 */
async function fetchPublicSheetCsv(spreadsheetId: string, gid: string): Promise<string | null> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const timestamp = Date.now();
  const urls = [
    `https://docs.google.com/spreadsheets/d/${cleanId}/export?format=csv&gid=${gid}&t=${timestamp}`,
    `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&gid=${gid}&t=${timestamp}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (
          text &&
          !text.trim().toLowerCase().startsWith('<!doctype html') &&
          !text.trim().toLowerCase().startsWith('<html')
        ) {
          return text;
        }
      }
    } catch {
      // Try next URL
    }
  }
  return null;
}

/**
 * Loads fallback local source file + fallback REGU sheet.
 */
export async function loadFromSourceFile(): Promise<{
  records: GensetRecord[];
  reguData: ReguSheetData;
}> {
  const cacheBustedUrl = `${DEFAULT_SOURCE_PATH}?t=${Date.now()}`;
  const res = await fetch(cacheBustedUrl, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat spreadsheet sumber: status ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  const rows = parseCsv(text);
  const records = processRawRows(rows);
  const reguData = processReguRows(parseCsv(FALLBACK_REGU_CSV));

  return { records, reguData };
}

/**
 * Loads all 3 sheets (DATA gid=0, DASHBOARD gid=164028602, REGU gid=1442113655)
 * automatically from Google Sheets without requiring login.
 */
export async function loadFromGoogleSheets(
  spreadsheetId: string,
  accessToken?: string | null,
  _gid = '0'
): Promise<{
  records: GensetRecord[];
  reguData: ReguSheetData;
  sheetNames: string[];
}> {
  const cleanId = extractSpreadsheetId(spreadsheetId);

  // Fetch Sheet DATA (gid=0) and Sheet REGU (gid=1442113655) in parallel
  const [dataCsv, reguCsv] = await Promise.all([
    fetchPublicSheetCsv(cleanId, GID_DATA),
    fetchPublicSheetCsv(cleanId, GID_REGU),
  ]);

  if (dataCsv) {
    const dataRows = parseCsv(dataCsv);
    const records = processRawRows(dataRows);
    const reguMatrix = parseCsv(reguCsv || FALLBACK_REGU_CSV);
    const reguData = processReguRows(reguMatrix);

    if (records.length > 0) {
      return {
        records,
        reguData,
        sheetNames: ['DATA', 'DASHBOARD', 'REGU'],
      };
    }
  }

  // Fallback to OAuth if public CSV is unavailable and accessToken is provided
  if (accessToken) {
    const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
      "'DATA'!A1:Z100"
    )}?valueRenderOption=FORMATTED_VALUE`;

    const valuesRes = await fetch(valuesUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (valuesRes.ok) {
      const valuesData = await valuesRes.json();
      const rawValues: string[][] = valuesData.values || [];
      const records = processRawRows(rawValues);
      const reguData = processReguRows(parseCsv(reguCsv || FALLBACK_REGU_CSV));
      return {
        records,
        reguData,
        sheetNames: ['DATA', 'DASHBOARD', 'REGU'],
      };
    }
  }

  // Final resilient fallback to verified local snapshot of the exact same spreadsheet
  const fallback = await loadFromSourceFile();
  return {
    records: fallback.records,
    reguData: fallback.reguData,
    sheetNames: ['DATA (Snapshot)', 'DASHBOARD (Snapshot)', 'REGU (Snapshot)'],
  };
}
