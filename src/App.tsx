import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  GensetRecord,
  DashboardMetrics,
  ManagementActionItem,
  DataSourceState,
  FilterState,
  ReguSheetData,
} from './types/dashboard';
import {
  AUTO_REFRESH_INTERVAL_SECONDS,
  DEFAULT_SPREADSHEET_ID,
  loadFromSourceFile,
  loadFromGoogleSheets,
  calculateMetrics,
  generateManagementActionItems,
  loadSavedDataSourceConfig,
  saveDataSourceConfig,
  extractSpreadsheetId,
  extractSpreadsheetGid,
} from './services/dataService';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebase';
import { Header } from './components/Header';
import { ExecutiveSummaryBanner } from './components/ExecutiveSummaryBanner';
import { KpiCards } from './components/KpiCards';
import { DashboardRecapTables } from './components/DashboardRecapTables';
import { Visualizations } from './components/Visualizations';
import { GensetMap } from './components/GensetMap';
import { ManagementAttention } from './components/ManagementAttention';
import { MonitoringTable } from './components/MonitoringTable';
import { ReguMaterialSection } from './components/ReguMaterialSection';
import { SheetsConnectionModal } from './components/SheetsConnectionModal';
import { Footer } from './components/Footer';
import {
  LayoutDashboard,
  ShieldAlert,
  TableProperties,
  Layers,
  Navigation,
  Users,
} from 'lucide-react';

export default function App() {
  // Authentication state (optional fallback for private sheets)
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active view tab (Includes Sheet DASHBOARD Recap, Sheet DATA Table, Sheet REGU Table, Map, Attention, All)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'table' | 'regu' | 'map' | 'attention' | 'all'
  >('overview');

  // Sheets modal state
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);

  // Load persisted data source config (defaults directly to Google Sheets ID 1NUXMaWlM0pvqE036ke3tDaO2GX6nFO_-d961dar5FNM)
  const initialConfig = useMemo(() => loadSavedDataSourceConfig(), []);

  // Data Source & Sync State
  const [dataSource, setDataSource] = useState<DataSourceState>({
    sourceType: initialConfig.sourceType,
    spreadsheetId: initialConfig.spreadsheetId || DEFAULT_SPREADSHEET_ID,
    spreadsheetGid: initialConfig.spreadsheetGid || '0',
    sheetName: initialConfig.sheetName || 'Google Sheets (DATA, DASHBOARD, REGU)',
    lastUpdated: null,
    isSyncing: false,
    isStale: false,
    error: null,
    autoRefreshCountdown: AUTO_REFRESH_INTERVAL_SECONDS,
  });

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    penyedia: 'ALL',
    status: 'ALL',
    ulp: 'ALL',
    overloadOnly: false,
    relokasiOnly: false,
    team: 'ALL',
  });

  // Records from Sheet DATA (gid=0) & Sheet REGU (gid=1442113655)
  const [records, setRecords] = useState<GensetRecord[]>([]);
  const [reguData, setReguData] = useState<ReguSheetData>({
    rows: [],
    totals: {
      totalA3csMeter: 320,
      totalSkat150Bh: 288,
      totalGroundingSet: 27,
      totalRows: 27,
      totalWithAts: 10,
    },
  });

  const isFetchingRef = useRef<boolean>(false);

  // Initialize Auth on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch data across all 3 sheets (DATA, DASHBOARD, REGU)
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setDataSource((prev) => ({
      ...prev,
      isSyncing: true,
      error: null,
    }));

    try {
      let loadedRecords: GensetRecord[] = [];
      let loadedRegu: ReguSheetData | null = null;

      if (dataSource.sourceType === 'google_sheets_live') {
        const sheetId = dataSource.spreadsheetId || DEFAULT_SPREADSHEET_ID;
        const token = await getAccessToken();
        const result = await loadFromGoogleSheets(
          sheetId,
          token,
          dataSource.spreadsheetGid || '0'
        );
        loadedRecords = result.records;
        loadedRegu = result.reguData;
      } else {
        const result = await loadFromSourceFile();
        loadedRecords = result.records;
        loadedRegu = result.reguData;
      }

      setRecords(loadedRecords);
      if (loadedRegu) {
        setReguData(loadedRegu);
      }

      setDataSource((prev) => ({
        ...prev,
        isSyncing: false,
        isStale: false,
        lastUpdated: new Date(),
        error: null,
        autoRefreshCountdown: AUTO_REFRESH_INTERVAL_SECONDS,
      }));
    } catch (err: unknown) {
      console.error('Fetch data error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyinkronkan data terbaru';
      setDataSource((prev) => ({
        ...prev,
        isSyncing: false,
        isStale: prev.lastUpdated !== null,
        error: msg,
        autoRefreshCountdown: AUTO_REFRESH_INTERVAL_SECONDS,
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [dataSource.sourceType, dataSource.spreadsheetId, dataSource.spreadsheetGid]);

  // Keep latest fetchData reference for intervals and tab focus triggers
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  // Initial load & when source changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 30-Second Auto Refresh Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setDataSource((prev) => {
        if (prev.isSyncing) return prev;
        if (prev.autoRefreshCountdown <= 1) {
          queueMicrotask(() => {
            fetchDataRef.current();
          });
          return { ...prev, autoRefreshCountdown: AUTO_REFRESH_INTERVAL_SECONDS };
        }
        return {
          ...prev,
          autoRefreshCountdown: prev.autoRefreshCountdown - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Immediate Auto-Sync when user returns to browser tab / window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDataRef.current();
      }
    };
    const handleWindowFocus = () => {
      fetchDataRef.current();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Calculated Metrics (including exact Tab DASHBOARD 3 Recap Tables) & Action Items
  const metrics = useMemo<DashboardMetrics>(() => {
    return calculateMetrics(records);
  }, [records]);

  const actionItems = useMemo<ManagementActionItem[]>(() => {
    return generateManagementActionItems(records, metrics, reguData);
  }, [records, metrics, reguData]);

  // Handle Google Login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        if (dataSource.sourceType === 'google_sheets_live') {
          fetchDataRef.current();
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google Logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Switch source type and persist choice
  const handleSelectSourceType = (type: 'source_file' | 'google_sheets_live') => {
    setDataSource((prev) => {
      const next = {
        ...prev,
        sourceType: type,
        spreadsheetId: prev.spreadsheetId || DEFAULT_SPREADSHEET_ID,
        autoRefreshCountdown: AUTO_REFRESH_INTERVAL_SECONDS,
      };
      saveDataSourceConfig({
        sourceType: next.sourceType,
        spreadsheetId: next.spreadsheetId || DEFAULT_SPREADSHEET_ID,
        spreadsheetGid: next.spreadsheetGid || '0',
        sheetName: next.sheetName || 'Google Sheets (DATA, DASHBOARD, REGU)',
      });
      return next;
    });
  };

  // Connect custom Google Sheets URL/ID via Public CSV without requiring login
  const handleConnectSheetsId = async (rawInput: string) => {
    const sheetId = extractSpreadsheetId(rawInput);
    const gid = extractSpreadsheetGid(rawInput);
    const token = await getAccessToken();

    const result = await loadFromGoogleSheets(sheetId, token, gid);
    const resolvedSheetName = result.sheetNames.join(', ') || 'Google Sheets Live';

    saveDataSourceConfig({
      sourceType: 'google_sheets_live',
      spreadsheetId: sheetId,
      spreadsheetGid: gid,
      sheetName: resolvedSheetName,
    });

    setRecords(result.records);
    setReguData(result.reguData);
    setDataSource((prev) => ({
      ...prev,
      sourceType: 'google_sheets_live',
      spreadsheetId: sheetId,
      spreadsheetGid: gid,
      sheetName: resolvedSheetName,
      lastUpdated: new Date(),
      isSyncing: false,
      isStale: false,
      error: null,
      autoRefreshCountdown: AUTO_REFRESH_INTERVAL_SECONDS,
    }));
  };

  // Filter updates
  const handleUpdateFilter = (updates: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilter = () => {
    setFilterState({
      searchQuery: '',
      penyedia: 'ALL',
      status: 'ALL',
      ulp: 'ALL',
      overloadOnly: false,
      relokasiOnly: false,
      team: 'ALL',
    });
  };

  // Quick filter clicks
  const handleQuickStatusFilter = (key: string) => {
    if (key === 'OVERLOAD') {
      setFilterState((prev) => ({
        ...prev,
        overloadOnly: true,
        relokasiOnly: false,
        status: 'Operasi',
      }));
    } else if (key === 'RELOKASI') {
      setFilterState((prev) => ({
        ...prev,
        relokasiOnly: true,
        overloadOnly: false,
        status: 'ALL',
      }));
    } else if (key === 'ALL') {
      handleResetFilter();
    } else {
      setFilterState((prev) => ({
        ...prev,
        status: key,
        overloadOnly: false,
        relokasiOnly: false,
      }));
    }
    setActiveTab('table');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Executive Header */}
      <Header
        dataSource={dataSource}
        onRefresh={() => fetchData()}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Executive Summary Narrative & Quick Filters */}
        <ExecutiveSummaryBanner
          metrics={metrics}
          filterState={filterState}
          onSelectQuickFilter={handleQuickStatusFilter}
        />

        {/* Primary KPI Cards */}
        <KpiCards
          metrics={metrics}
          onFilterQuickStatus={handleQuickStatusFilter}
        />

        {/* Tab Navigation Controls across all 3 Sheets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-3 gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs self-start lg:self-auto overflow-x-auto max-w-full">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Sheet DASHBOARD &amp; Visualisasi</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableProperties className="h-4 w-4 text-emerald-600" />
              <span>Sheet DATA (32 Genset)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono font-bold">
                {records.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('regu')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'regu'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="h-4 w-4 text-blue-600" />
              <span>Sheet REGU &amp; Material</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-900 font-mono font-bold">
                {reguData.totals.totalRows}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Navigation className="h-4 w-4 text-emerald-500" />
              <span>Peta Lokasi</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
                {records.length} Titik
              </span>
            </button>

            <button
              onClick={() => setActiveTab('attention')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'attention'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Perhatian Manajemen</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono font-bold">
                {actionItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Semua 3 Sheet</span>
            </button>

          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Total: <strong>{metrics.totalUnits} Unit</strong> ({metrics.totalCapacityKva.toLocaleString('id-ID')} kVA • Beban Trafo: {metrics.totalBebanTrafoAllKva.toLocaleString('id-ID')} kVA • BBM: {metrics.totalEstimasiBbmAllJam.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L/jam)
            </span>
          </div>
        </div>

        {/* Tab 1: Sheet DASHBOARD Recap Tables, Map & Visualizations */}
        {(activeTab === 'overview' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Exact 3 Summary Tables from Sheet DASHBOARD (gid=164028602) */}
            <DashboardRecapTables
              recap={metrics.dashboardRecap}
              onSelectStatus={(s) => handleQuickStatusFilter(s)}
              onSelectUlp={(u) => {
                handleUpdateFilter({ ulp: u });
                setActiveTab('table');
              }}
            />

            {/* Prominent Map view in Overview */}
            <GensetMap
              records={records}
              onSelectRecord={(r) => {
                handleUpdateFilter({ searchQuery: r.no });
              }}
            />

            <Visualizations
              metrics={metrics}
              onSelectProvider={(p) => {
                handleUpdateFilter({ penyedia: p });
                setActiveTab('table');
              }}
              onSelectStatus={(s) => {
                handleUpdateFilter({ status: s });
                setActiveTab('table');
              }}
              onSelectRegion={(r) => {
                handleUpdateFilter({ ulp: r });
                setActiveTab('table');
              }}
            />
          </div>
        )}

        {/* Tab 2: Detailed Monitoring Table (Sheet DATA gid=0) */}
        {(activeTab === 'table' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MonitoringTable
              records={records}
              filterState={filterState}
              onUpdateFilter={handleUpdateFilter}
              onResetFilter={handleResetFilter}
            />
          </div>
        )}

        {/* Tab 3: Sheet REGU & Material Instalasi (gid=1442113655) */}
        {(activeTab === 'regu' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ReguMaterialSection reguData={reguData} />
          </div>
        )}

        {/* Tab 4: Dedicated Map View */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GensetMap
              records={records}
              onSelectRecord={(r) => {
                handleUpdateFilter({ searchQuery: r.no });
              }}
            />
          </div>
        )}

        {/* Tab 5: Management Attention & Action Items */}
        {(activeTab === 'attention' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ManagementAttention
              actionItems={actionItems}
              metrics={metrics}
              onFilterUnit={(unitNo) => {
                handleUpdateFilter({ searchQuery: unitNo });
                setActiveTab('table');
              }}
            />
          </div>
        )}

      </main>

      {/* Sheets Connection Configuration Modal */}
      <SheetsConnectionModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        dataSource={dataSource}
        metrics={metrics}
        user={user}
        onLogin={handleLogin}
        onSelectSourceType={handleSelectSourceType}
        onConnectSheetsId={handleConnectSheetsId}
        isLoggingIn={isLoggingIn}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
