import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  GensetRecord,
  DashboardMetrics,
  ManagementActionItem,
  DataSourceState,
  FilterState,
} from './types/dashboard';
import {
  loadFromSourceFile,
  loadFromGoogleSheets,
  calculateMetrics,
  generateManagementActionItems,
} from './services/dataService';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebase';
import { Header } from './components/Header';
import { ExecutiveSummaryBanner } from './components/ExecutiveSummaryBanner';
import { KpiCards } from './components/KpiCards';
import { Visualizations } from './components/Visualizations';
import { GensetMap } from './components/GensetMap';
import { ManagementAttention } from './components/ManagementAttention';
import { MonitoringTable } from './components/MonitoringTable';
import { SheetsConnectionModal } from './components/SheetsConnectionModal';
import { Footer } from './components/Footer';
import {
  LayoutDashboard,
  ShieldAlert,
  TableProperties,
  Layers,
  MapPin,
  Navigation,
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'attention' | 'table' | 'all'>('overview');

  // Sheets modal state
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);

  // Data Source & Sync State
  const [dataSource, setDataSource] = useState<DataSourceState>({
    sourceType: 'source_file',
    spreadsheetId: '',
    sheetName: '',
    lastUpdated: null,
    isSyncing: false,
    isStale: false,
    error: null,
    autoRefreshCountdown: 60,
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

  // Records & Cached Records
  const [records, setRecords] = useState<GensetRecord[]>([]);
  const isFetchingRef = useRef<boolean>(false);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Fetch data function
  const fetchData = useCallback(async (isManual = false) => {
    // Prevent overlapping concurrent requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setDataSource((prev) => ({
      ...prev,
      isSyncing: true,
      error: null,
    }));

    try {
      let loadedRecords: GensetRecord[] = [];

      if (dataSource.sourceType === 'google_sheets_live' && dataSource.spreadsheetId) {
        const token = await getAccessToken();
        if (!token) {
          throw new Error('Sesi Google Sheets memerlukan autentikasi. Silakan Masuk dengan Google.');
        }
        const result = await loadFromGoogleSheets(dataSource.spreadsheetId, token);
        loadedRecords = result.records;
      } else {
        // Load default verified source file
        loadedRecords = await loadFromSourceFile();
      }

      setRecords(loadedRecords);
      setDataSource((prev) => ({
        ...prev,
        isSyncing: false,
        isStale: false,
        lastUpdated: new Date(),
        error: null,
        autoRefreshCountdown: 60,
      }));
    } catch (err: unknown) {
      console.error('Fetch data error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyinkronkan data terbaru';
      setDataSource((prev) => ({
        ...prev,
        isSyncing: false,
        isStale: prev.lastUpdated !== null,
        error: msg,
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [dataSource.sourceType, dataSource.spreadsheetId]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 60-Second Auto Refresh Interval & 1-second Countdown
  useEffect(() => {
    countdownTimerRef.current = setInterval(() => {
      setDataSource((prev) => {
        if (prev.isSyncing) return prev;

        if (prev.autoRefreshCountdown <= 1) {
          fetchData();
          return { ...prev, autoRefreshCountdown: 60 };
        }

        return {
          ...prev,
          autoRefreshCountdown: prev.autoRefreshCountdown - 1,
        };
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [fetchData]);

  // Calculated Metrics & Action Items
  const metrics = useMemo<DashboardMetrics>(() => {
    return calculateMetrics(records);
  }, [records]);

  const actionItems = useMemo<ManagementActionItem[]>(() => {
    return generateManagementActionItems(records, metrics);
  }, [records, metrics]);

  // Handle Google Login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        if (dataSource.sourceType === 'google_sheets_live') {
          fetchData(true);
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

  // Switch source type
  const handleSelectSourceType = (type: 'source_file' | 'google_sheets_live') => {
    setDataSource((prev) => ({
      ...prev,
      sourceType: type,
      autoRefreshCountdown: 60,
    }));
  };

  // Connect custom Google Sheets ID
  const handleConnectSheetsId = async (sheetId: string) => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Harap masuk dengan Google terlebih dahulu.');
    }

    const result = await loadFromGoogleSheets(sheetId, token);
    setRecords(result.records);
    setDataSource((prev) => ({
      ...prev,
      sourceType: 'google_sheets_live',
      spreadsheetId: sheetId,
      sheetName: result.sheetNames[0] || 'Sheet1',
      lastUpdated: new Date(),
      isStale: false,
      error: null,
      autoRefreshCountdown: 60,
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
        status: 'ALL',
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
        onRefresh={() => fetchData(true)}
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

        {/* Tab Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto overflow-x-auto max-w-full">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Ringkasan & Visualisasi</span>
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
              <span>Peta Lokasi Genset</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono font-bold">
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
              onClick={() => setActiveTab('table')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableProperties className="h-4 w-4 text-emerald-600" />
              <span>Tabel Monitoring</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
                {records.length}
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
              <span>Semua Tampilan</span>
            </button>

          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Basis Data: <strong>{metrics.totalUnits} Unit</strong> ({metrics.totalCapacityKva.toLocaleString('id-ID')} kVA • {metrics.totalBebanOperasiKva.toLocaleString('id-ID')} kVA Beban)</span>
          </div>
        </div>

        {/* Tab 1: Overview & Visualizations */}
        {(activeTab === 'overview' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
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

        {/* Tab 2: Dedicated Map View */}
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

        {/* Tab 3: Management Attention & Action Items */}
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

        {/* Tab 4: Detailed Monitoring Table */}
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

      </main>

      {/* Sheets Connection Configuration Modal */}
      <SheetsConnectionModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        dataSource={dataSource}
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
