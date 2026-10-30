import {
  GensetRecord,
  DashboardMetrics,
  ProviderMetric,
  RegionMetric,
  ManagementActionItem,
  OverloadUnitSummary,
} from '../types/dashboard';

export const DEFAULT_SOURCE_PATH = '/assets/aistudio/Data_Penempatan_Genset_Mobile_f3030d1c';
export const AUTO_REFRESH_INTERVAL_SECONDS = 30;
const STORAGE_KEY_DATASOURCE = 'madura_terang_datasource_config_v1';

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
        sourceType: parsed.sourceType === 'google_sheets_live' && parsed.spreadsheetId ? 'google_sheets_live' : 'source_file',
        spreadsheetId: parsed.spreadsheetId || '',
        spreadsheetGid: parsed.spreadsheetGid || '0',
        sheetName: parsed.sheetName || 'Data Penempatan Genset',
      };
    }
  } catch {
    // Ignore storage errors
  }
  return {
    sourceType: 'source_file',
    spreadsheetId: '',
    spreadsheetGid: '0',
    sheetName: 'Data Penempatan Genset',
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
 * Single source of truth predicate for whether a unit's status is 'Operasi'.
 */
export function isOperasiStatus(status: string): boolean {
  return (status || '').toLowerCase().includes('operasi');
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
  return trimmed;
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
 * Known precise land coordinates for all Gardu in Pulau Madura.
 * Guaranteed safely inside the land boundaries of Pulau Madura.
 */
const GARDU_LAND_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Pamekasan (KA...)
  KA0076: { lat: -7.1565, lng: 113.472 },
  KA0178: { lat: -7.151, lng: 113.4835 },
  KA0482: { lat: -7.172, lng: 113.518 },
  KA482: { lat: -7.176, lng: 113.509 },
  KA0026: { lat: -7.168, lng: 113.465 },
  KA026: { lat: -7.192, lng: 113.485 },
  KA737: { lat: -7.135, lng: 113.535 },
  KA040: { lat: -7.142, lng: 113.415 },
  KA070: { lat: -7.108, lng: 113.428 },
  KA014: { lat: -7.075, lng: 113.465 },

  // Waru (KJ...)
  KJ002: { lat: -6.962, lng: 113.512 },
  KJ709: { lat: -6.955, lng: 113.528 },
  KJ018: { lat: -6.945, lng: 113.538 },

  // Ketapang (KF...)
  KF164: { lat: -6.918, lng: 113.265 },
  KF316: { lat: -6.925, lng: 113.295 },
  KF002: { lat: -6.915, lng: 113.278 },
  KF008: { lat: -6.932, lng: 113.345 },

  // Sampang (KC...)
  KC412: { lat: -7.185, lng: 113.242 },
  KC351: { lat: -7.192, lng: 113.315 },
  KC205: { lat: -7.105, lng: 113.285 },
  KC001: { lat: -7.172, lng: 113.205 },
  KC004: { lat: -7.135, lng: 113.218 },

  // Sumenep (KB..., KH...)
  KB104: { lat: -7.012, lng: 113.862 },
  KB045: { lat: -7.025, lng: 113.87 },
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

  // Check direct gardu lookup
  if (GARDU_LAND_COORDINATES[cleanGardu]) {
    const base = GARDU_LAND_COORDINATES[cleanGardu];
    // Small micro-offset if multiple units share the same gardu
    const microOffset = ((noNum % 3) - 1) * 0.0035;
    return {
      lat: +(base.lat + microOffset).toFixed(5),
      lng: +(base.lng + microOffset * 1.2).toFixed(5),
    };
  }

  // Base coordinates for Madura ULPs strictly within island boundary
  const baseCoords: Record<string, { lat: number; lng: number }> = {
    PAMEKASAN: { lat: -7.155, lng: 113.475 },
    WARU: { lat: -6.955, lng: 113.52 },
    KETAPANG: { lat: -6.92, lng: 113.28 },
    SAMPANG: { lat: -7.18, lng: 113.245 },
    SUMENEP: { lat: -7.015, lng: 113.865 },
    AMBUNTEN: { lat: -6.925, lng: 113.72 },
  };

  if (cleanUlp.includes('BELUM TIBA') || noStr === '1') {
    // Transit Hub at Kamal / Bangkalan entrance
    return { lat: -7.168, lng: 112.725 };
  }

  const center = baseCoords[cleanUlp] || { lat: -7.05, lng: 113.5 };

  // Strict, bounded offset within safe island landmass
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
 * Maps raw matrix rows (from Google Sheets or CSV) into typed GensetRecord array.
 */
export function processRawRows(matrix: string[][]): GensetRecord[] {
  if (!matrix || matrix.length === 0) return [];

  // Find header row dynamically (skipping empty leading rows)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(matrix.length, 5); i++) {
    const row = matrix[i];
    const joined = row.map((c) => c.toLowerCase()).join(' ');
    if (joined.includes('kapasitas') || joined.includes('status') || joined.includes('gardu')) {
      headerRowIndex = i;
      break;
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

  // Second ULP / Relokasi fields (usually after BBM column)
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

    // Filter out completely blank rows
    if (!noVal && !kapasitasVal && !statusVal) continue;

    const capacityKva = parseNum(kapasitasVal);
    const bebanKva = parseNum(getVal(colBebanKva));
    const persenBeban = parseNum(getVal(colPersenBeban));
    const bbmLiter = parseNum(getVal(colBbmLiter));
    const ulp = getVal(colUlp) || (noVal === '1' ? 'Belum Tiba' : 'Belum Ditentukan');
    const gardu = getVal(colGardu) || '-';
    const pemilik =
      getVal(colPemilik) ||
      (capacityKva >= 500 && parseInt(noVal, 10) <= 7 ? 'GENSET PLN' : 'GENSET ES');
    const status = statusVal || 'Operasi';

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

    // Exact TEAM from spreadsheet without forcing 'UP3 MDR' on empty cells
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
      status,
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

      // Backward compatibility fields
      volume: 1,
      penyedia: pemilik,
      statusMobilisasi: status.toLowerCase().includes('belum tiba') ? 'Belum Tiba' : 'Tiba di Madura',
      lokasiPemasangan: gardu !== '-' ? `${ulp} (${gardu})` : ulp,
      wilayah: ulp,
      kodeGardu: gardu,
      statusInstalasi: status,
      pelaksanaInstalasi: actualTeam,
      unitAsal: pemilik,
      hasDuplicateNo: false,
      missingFields,
    });
  }

  // Duplicate NO check
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
 * Calculates executive KPI metrics strictly aligned with spreadsheet rows.
 * Per confirmed rule: Load, BBM, and Overload (>=80%) are calculated strictly from 'Operasi' units.
 */
export function calculateMetrics(records: GensetRecord[]): DashboardMetrics {
  const totalUnits = records.length;
  const totalCapacityKva = records.reduce((sum, r) => sum + r.capacityKva, 0);
  const totalCapacityMva = +(totalCapacityKva / 1000).toFixed(2);

  // Status counts
  let unitOperasi = 0;
  let unitOperasiKva = 0;
  let unitDilokasi = 0;
  let unitDilokasiKva = 0;
  let unitBelumTiba = 0;
  let unitBelumTibaKva = 0;

  let totalBebanOperasiKva = 0;
  let totalEstimasiBbmLiterJam = 0;
  let totalLoadingPersenSum = 0;
  let maxLoadingPersen = 0;
  let maxLoadingGardu = '-';
  let unitOverloadCount = 0;
  const overloadUnits: OverloadUnitSummary[] = [];
  let potensiRelokasiCount = 0;
  let tripOverCurrentCount = 0;

  records.forEach((r) => {
    const st = r.status.toLowerCase();
    if (isOperasiStatus(r.status)) {
      unitOperasi++;
      unitOperasiKva += r.capacityKva;
      totalBebanOperasiKva += r.bebanKva;
      totalEstimasiBbmLiterJam += r.estimasiBbmLiterJam;
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
    } else if (st.includes('dilokasi') || st.includes('lokasi')) {
      unitDilokasi++;
      unitDilokasiKva += r.capacityKva;
    } else {
      unitBelumTiba++;
      unitBelumTibaKva += r.capacityKva;
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

  // Sort overload units descending by % load
  overloadUnits.sort((a, b) => b.persenBeban - a.persenBeban);

  const rataRataLoadingPersen =
    unitOperasi > 0 ? +(totalLoadingPersenSum / unitOperasi).toFixed(1) : 0;

  // Provider / Owner summary
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
    const st = r.status.toLowerCase();
    if (isOperasiStatus(r.status)) {
      pm.operasiCount++;
      pm.totalBebanKva += r.bebanKva;
      pm.totalBbmLiterJam = +(pm.totalBbmLiterJam + r.estimasiBbmLiterJam).toFixed(2);
    } else if (st.includes('dilokasi') || st.includes('lokasi')) {
      pm.dilokasiCount++;
    } else {
      pm.belumTibaCount++;
    }
  });

  // ULP summary
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
        garduList: [],
      });
    }
    const rm = regionMap.get(w)!;
    rm.unitCount++;
    rm.totalCapacityKva += r.capacityKva;
    const st = r.status.toLowerCase();
    if (isOperasiStatus(r.status)) {
      rm.operasiCount++;
      rm.totalBebanKva += r.bebanKva;
    } else if (st.includes('dilokasi') || st.includes('lokasi')) {
      rm.dilokasiCount++;
    } else {
      rm.belumTibaCount++;
    }
    if (r.gardu && r.gardu !== '-' && !rm.garduList.includes(r.gardu)) {
      rm.garduList.push(r.gardu);
    }
  });

  // Unique NO tracking
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

  return {
    totalUnits,
    totalCapacityKva,
    totalCapacityMva,
    uniqueNoCount: uniqueNos.size,
    duplicateNoList: Array.from(duplicates),
    unitOperasi,
    unitOperasiKva,
    unitDilokasi,
    unitDilokasiKva,
    unitBelumTiba,
    unitBelumTibaKva,
    totalBebanOperasiKva,
    totalEstimasiBbmLiterJam: +totalEstimasiBbmLiterJam.toFixed(2),
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
    totalQualityIssues: recordsWithMissingFieldsCount + duplicates.size,
    recordsWithMissingFieldsCount,
  };
}

/**
 * Generates executive management action items dynamically from actual spreadsheet data.
 */
export function generateManagementActionItems(
  records: GensetRecord[],
  metrics: DashboardMetrics
): ManagementActionItem[] {
  const items: ManagementActionItem[] = [];

  // Item 1: Trip Over Current
  const tripRecords = records.filter((r) => r.keterangan.toLowerCase().includes('trip'));
  if (tripRecords.length > 0) {
    const firstTrip = tripRecords[0];
    items.push({
      id: 'act-trip-overcurrent',
      category: 'Operasi & Keandalan',
      severity: 'Tinggi',
      title: `Penanganan Trip Over Current & Eksekusi Relokasi (${firstTrip.ulp} ${firstTrip.gardu})`,
      description: `Genset No ${firstTrip.no} (${firstTrip.genset}) di ${firstTrip.ulp} ${firstTrip.gardu} mengalami '${firstTrip.keterangan}' dengan beban ${firstTrip.bebanKva} kVA (${firstTrip.persenBebanGenset}%).${
        firstTrip.relokasiGardu
          ? ` Direncanakan relokasi ke gardu ${firstTrip.relokasiGardu} (beban ${firstTrip.relokasiBeban} kVA, kapasitas gardu ${firstTrip.relokasiKapasitasGardu} kVA).`
          : ''
      }`,
      affectedUnitsCount: tripRecords.length,
      unitIdentifiers: tripRecords.map((r) => `No ${r.no} (${r.gardu})`),
      recommendedAction:
        'Lakukan inspeksi pemutus daya (MCCB), pembagian beban fasa, dan percepat penempatan genset pengganti ke gardu target relokasi.',
      mapsUrl: firstTrip?.titikLokasiAwal,
    });
  }

  // Item 2: Genset Overload Warning (>=80% loading among 'Operasi' units)
  const overloadUnits = records.filter(
    (r) => isOperasiStatus(r.status) && r.persenBebanGenset >= 80
  );
  if (overloadUnits.length > 0) {
    const overloadSummaryText = overloadUnits
      .map((r) => `${r.gardu} ${r.ulp} (${r.persenBebanGenset}%)`)
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
        'Pantau temperatur mesin dan cooling system secara berkala. Prioritaskan manuver beban jaringan atau relokasi kapasitas lebih besar untuk mencegah blackout akibat overload.',
    });
  }

  // Item 3: Logistik Unit Belum Tiba (Dynamic Count & Breakdown)
  const unarrived = records.filter((r) => r.status.toLowerCase().includes('belum tiba'));
  if (unarrived.length > 0) {
    const plnUnarrived = unarrived.filter((r) => r.pemilikGenset.toUpperCase().includes('PLN'));
    const esUnarrived = unarrived.filter((r) => !r.pemilikGenset.toUpperCase().includes('PLN'));
    items.push({
      id: 'act-belum-tiba',
      category: 'Logistik & Kedatangan',
      severity: 'Sedang',
      title: `Monitoring Kedatangan ${unarrived.length} Unit Genset (${metrics.unitBelumTibaKva.toLocaleString('id-ID')} kVA)`,
      description: `Sebanyak ${unarrived.length} unit genset (${plnUnarrived.length} unit PLN dan ${esUnarrived.length} unit ES dengan total kapasitas ${metrics.unitBelumTibaKva.toLocaleString('id-ID')} kVA) tercatat berstatus Belum Tiba di lokasi.`,
      affectedUnitsCount: unarrived.length,
      unitIdentifiers: unarrived.map((r) => `No ${r.no}: ${r.genset} -> ${r.ulp}`),
      recommendedAction:
        'Koordinasikan jadwal penyeberangan kapal fery Tanjung Perak - Madura dan pastikan kesiapan landasan gardu tujuan sebelum unit tiba.',
    });
  }

  // Item 4: Unit Dilokasi Siap Operasi
  const atLocation = records.filter((r) => {
    const st = r.status.toLowerCase();
    return st.includes('dilokasi') || (st.includes('lokasi') && !isOperasiStatus(r.status));
  });
  if (atLocation.length > 0) {
    const locSummary = atLocation
      .map((r) => `No ${r.no} (${r.genset} di ${r.ulp} ${r.gardu})`)
      .join(' & ');
    items.push({
      id: 'act-dilokasi-commissioning',
      category: 'Operasi & Keandalan',
      severity: 'Sedang',
      title: `Percepatan Komisioning ${atLocation.length} Unit Dilokasi Siap Operasi (${metrics.unitDilokasiKva.toLocaleString('id-ID')} kVA)`,
      description: `Genset ${locSummary} telah berada di lokasi gardu namun status operasi belum aktif menyuplai beban.`,
      affectedUnitsCount: atLocation.length,
      unitIdentifiers: atLocation.map((r) => `No ${r.no} (${r.ulp} - ${r.gardu})`),
      recommendedAction:
        'Lakukan uji sinkronisasi tegangan dan segera sambungkan ke busbar distribusi untuk mulai memasok daya ke konsumen.',
    });
  }

  // Item 5: Logistik Bahan Bakar Minyak (BBM Solar)
  if (metrics.totalEstimasiBbmLiterJam > 0) {
    const dailyLiters = Math.round(metrics.totalEstimasiBbmLiterJam * 24);
    items.push({
      id: 'act-fuel-supply',
      category: 'Logistik & Kedatangan',
      severity: 'Info',
      title: `Manajemen Rantai Pasok BBM Solar (~${dailyLiters.toLocaleString('id-ID')} Liter/Hari)`,
      description: `Operasional aktif ${metrics.unitOperasi} unit genset saat ini mengonsumsi ${metrics.totalEstimasiBbmLiterJam.toLocaleString('id-ID')} Liter/jam, setara dengan ~${dailyLiters.toLocaleString('id-ID')} Liter per 24 jam operasi kontinu.`,
      affectedUnitsCount: metrics.unitOperasi,
      unitIdentifiers: [`${metrics.unitOperasi} Unit Operasi Aktif`],
      recommendedAction:
        'Jadwalkan rute mobil tangki solar berkala per ULP (Pamekasan, Waru, Ketapang, Sampang, Sumenep) agar tangki harian genset tidak pernah di bawah 30%.',
    });
  }

  return items;
}

/**
 * Loads data from default source file with strict cache-busting so updates are reflected immediately.
 */
export async function loadFromSourceFile(): Promise<GensetRecord[]> {
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
  return processRawRows(rows);
}

/**
 * Loads data from Google Sheets automatically via Public CSV/GViz link WITHOUT requiring login.
 * If accessToken is provided and public access fails, falls back to Google Sheets API v4.
 */
export async function loadFromGoogleSheets(
  spreadsheetId: string,
  accessToken?: string | null,
  gid = '0',
  range = 'A1:Z100'
): Promise<{ records: GensetRecord[]; sheetNames: string[] }> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const cleanGid = gid || '0';
  const timestamp = Date.now();

  // 1. Try Public Google Visualization CSV Export first (Zero-Login Auto-Sync)
  const publicUrls = [
    `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&gid=${cleanGid}&t=${timestamp}`,
    `https://docs.google.com/spreadsheets/d/${cleanId}/export?format=csv&gid=${cleanGid}&t=${timestamp}`,
  ];

  for (const url of publicUrls) {
    try {
      const pubRes = await fetch(url, {
        cache: 'no-store',
      });
      if (pubRes.ok) {
        const csvText = await pubRes.text();
        // Verify it's not an HTML sign-in page
        if (
          csvText &&
          !csvText.trim().toLowerCase().startsWith('<!doctype html') &&
          !csvText.trim().toLowerCase().startsWith('<html')
        ) {
          const rows = parseCsv(csvText);
          const records = processRawRows(rows);
          if (records.length > 0) {
            return { records, sheetNames: [`GID:${cleanGid}`] };
          }
        }
      }
    } catch {
      // Proceed to next endpoint or OAuth fallback
    }
  }

  // 2. Fallback to Authenticated Google Sheets API v4 if accessToken is present
  if (!accessToken) {
    throw new Error(
      'Gagal mengakses link Google Sheets secara publik. Pastikan pengaturan berbagi Google Sheets Anda disetel ke "Siapa saja yang memiliki link dapat melihat" (Anyone with the link can view).'
    );
  }

  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets.properties`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!metaRes.ok) {
    if (metaRes.status === 401 || metaRes.status === 403) {
      throw new Error(
        'Spreadsheet tidak bersifat publik dan sesi izin Google telah kedaluwarsa. Ubah akses sheet menjadi "Siapa saja yang memiliki link" agar sinkron otomatis tanpa login.'
      );
    }
    if (metaRes.status === 404) {
      throw new Error(`Spreadsheet dengan ID "${cleanId}" tidak ditemukan. Periksa kembali URL Google Sheets.`);
    }
    const errData = await metaRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gagal mengakses Google Sheets (${metaRes.status})`);
  }

  const metaData = await metaRes.json();
  const sheetNames: string[] = (metaData.sheets || []).map(
    (s: { properties?: { title?: string } }) => s.properties?.title || 'Sheet1'
  );

  const targetRange = range.includes('!') ? range : `'${sheetNames[0] || 'Sheet1'}'!A1:Z100`;

  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
    targetRange
  )}?valueRenderOption=FORMATTED_VALUE`;

  const valuesRes = await fetch(valuesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!valuesRes.ok) {
    const errData = await valuesRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gagal mengambil baris data dari Google Sheets (${valuesRes.status})`);
  }

  const valuesData = await valuesRes.json();
  const rawValues: string[][] = valuesData.values || [];
  const records = processRawRows(rawValues);

  return { records, sheetNames };
}
