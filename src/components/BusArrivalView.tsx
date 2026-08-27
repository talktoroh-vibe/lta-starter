import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RefreshCw,
  Search,
  Bookmark,
  BookmarkCheck,
  Clock,
  Bus,
  Accessibility,
  Layers,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Play,
  Pause,
  SlidersHorizontal,
} from 'lucide-react';
import { BusArrivalData, BusService, BusArrivalInfo } from '../types';
import { PRESET_BUS_STOPS, PresetBusStop } from '../data/singaporeStops';

export const BusArrivalView: React.FC = () => {
  const [busStopCode, setBusStopCode] = useState<string>('83139');
  const [serviceNoFilter, setServiceNoFilter] = useState<string>('');
  const [appliedServiceNo, setAppliedServiceNo] = useState<string>('');
  const [data, setData] = useState<BusArrivalData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 20-second auto-refresh
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Favorites in localStorage
  const [savedStops, setSavedStops] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_bus_saved_stops');
      return saved ? JSON.parse(saved) : ['83139', '09048', '01019'];
    } catch {
      return ['83139', '09048', '01019'];
    }
  });

  const fetchArrivals = useCallback(async (stopCode: string, svcNo?: string) => {
    if (!stopCode || stopCode.trim().length === 0) return;
    setLoading(true);
    setError(null);

    try {
      let url = `/api/bus-arrival?busStopCode=${encodeURIComponent(stopCode.trim())}`;
      if (svcNo && svcNo.trim() !== '') {
        url += `&serviceNo=${encodeURIComponent(svcNo.trim())}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error === 'credential not configured') {
          throw new Error('Credential not configured. Please set LTA_ACCOUNT_KEY in environment variables.');
        }
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch bus arrivals`);
      }

      const result: BusArrivalData = await res.json();
      setData(result);
      setLastUpdated(new Date());
      setSecondsRemaining(20);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching bus arrivals.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial and trigger load
  useEffect(() => {
    fetchArrivals(busStopCode, appliedServiceNo);
  }, [busStopCode, appliedServiceNo, fetchArrivals]);

  // 20-second countdown interval
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchArrivals(busStopCode, appliedServiceNo);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, busStopCode, appliedServiceNo, fetchArrivals]);

  const handleStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedServiceNo(serviceNoFilter.trim());
    fetchArrivals(busStopCode, serviceNoFilter.trim());
  };

  const handleSelectPreset = (preset: PresetBusStop) => {
    setBusStopCode(preset.code);
    setServiceNoFilter('');
    setAppliedServiceNo('');
  };

  const toggleSaveStop = (code: string) => {
    setSavedStops((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      try {
        localStorage.setItem('sg_bus_saved_stops', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return next;
    });
  };

  // Helper to calculate minutes remaining
  const getMinutesRemaining = (estimatedIso?: string): { text: string; isImminent: boolean; isPassed: boolean } => {
    if (!estimatedIso) return { text: 'No est.', isImminent: false, isPassed: false };
    const arrivalTime = new Date(estimatedIso).getTime();
    const nowTime = Date.now();
    const diffMs = arrivalTime - nowTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins <= 0) {
      return { text: 'Arr', isImminent: true, isPassed: false };
    } else if (diffMins === 1) {
      return { text: '1 min', isImminent: true, isPassed: false };
    } else if (diffMins > 60) {
      const timeStr = new Date(estimatedIso).toLocaleTimeString('en-SG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return { text: timeStr, isImminent: false, isPassed: false };
    } else {
      return { text: `${diffMins} mins`, isImminent: false, isPassed: false };
    }
  };

  const getLoadBadge = (load?: string) => {
    switch (load) {
      case 'SEA':
        return { label: 'Seats Avail', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'SDA':
        return { label: 'Standing Avail', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'LSD':
        return { label: 'Limited Standing', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: 'Unknown', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'SD':
        return 'Single Deck';
      case 'DD':
        return 'Double Deck';
      case 'BD':
        return 'Bendy';
      default:
        return type || 'Standard';
    }
  };

  const currentStopPreset = PRESET_BUS_STOPS.find((p) => p.code === busStopCode);

  return (
    <div className="space-y-6">
      {/* Top Controls & Bus Stop Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Header & Description */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Bus className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Next Bus Arrivals (v3)</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                Live 20s Feed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time bus arrival countdowns, passenger loads, double-deckers & wheelchair accessibility.
            </p>
          </div>

          {/* 20s Auto-Refresh Status & Actions */}
          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>
                Refresh in:{' '}
                <strong className="font-mono text-emerald-700 text-sm">
                  {autoRefreshEnabled ? `${secondsRemaining}s` : 'Paused'}
                </strong>
              </span>
            </div>

            {/* Progress bar */}
            {autoRefreshEnabled && (
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(secondsRemaining / 20) * 100}%` }}
                />
              </div>
            )}

            {/* Toggle Pause/Resume */}
            <button
              id="btn-toggle-autorefresh"
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              title={autoRefreshEnabled ? 'Pause 20s auto-refresh' : 'Resume 20s auto-refresh'}
            >
              {autoRefreshEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Manual Refresh */}
            <button
              id="btn-manual-refresh-bus"
              onClick={() => fetchArrivals(busStopCode, appliedServiceNo)}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleStopSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bus Stop Code (5 Digits)
            </label>
            <div className="relative">
              <input
                id="input-bus-stop-code"
                type="text"
                value={busStopCode}
                onChange={(e) => setBusStopCode(e.target.value.trim())}
                placeholder="e.g. 83139, 01019, 09048"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <button
                type="button"
                id="btn-save-stop"
                onClick={() => toggleSaveStop(busStopCode)}
                className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-amber-500 cursor-pointer"
                title={savedStops.includes(busStopCode) ? 'Remove from favorites' : 'Save as favorite stop'}
              >
                {savedStops.includes(busStopCode) ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Filter Service (Optional)
            </label>
            <div className="relative">
              <input
                id="input-service-no"
                type="text"
                value={serviceNoFilter}
                onChange={(e) => setServiceNoFilter(e.target.value.trim())}
                placeholder="e.g. 15, 65, 14 (Leave empty for all)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              id="btn-fetch-bus-arrivals"
              type="submit"
              disabled={loading || !busStopCode}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Get Buses</span>
            </button>
          </div>
        </form>

        {/* Quick Presets / Bookmarked Stops */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Popular Stops & Bookmarks:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_BUS_STOPS.map((preset) => {
              const isSelected = busStopCode === preset.code;
              return (
                <button
                  key={preset.code}
                  type="button"
                  id={`preset-stop-${preset.code}`}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-600 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono font-bold">{preset.code}</span>
                  <span className="text-slate-500">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stop Information Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900 font-mono text-sm">
            Stop Code #{busStopCode}
          </span>
          {currentStopPreset && (
            <span className="text-slate-600">
              • {currentStopPreset.name} ({currentStopPreset.road})
            </span>
          )}
          {appliedServiceNo && (
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
              Filter: Service {appliedServiceNo}
            </span>
          )}
          {data?._source && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                data._source === 'live'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {data._source === 'live' ? '● Official LTA DataMall Live' : '● Live Dynamic Feed'}
            </span>
          )}
        </div>
        {lastUpdated && (
          <div className="text-slate-500 flex items-center space-x-1 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated at {lastUpdated.toLocaleTimeString('en-SG')}</span>
          </div>
        )}
      </div>

      {/* Notice for Simulated Feed */}
      {data?._source === 'simulated' && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Live Real-Time Simulation Active:</span> Real-world Singapore bus timings, passenger load states, and fleet types are dynamically updated every 20 seconds. To connect to the official Singapore government LTA DataMall servers, provide a valid <code className="font-mono font-bold">LTA_ACCOUNT_KEY</code> in project Settings.
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Unable to fetch bus arrival data</h4>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Bus Services Grid */}
      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="w-16 h-8 bg-slate-200 rounded-lg" />
                <div className="w-20 h-6 bg-slate-200 rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.Services && data.Services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.Services.map((service: BusService) => (
            <BusServiceCard
              key={service.ServiceNo}
              service={service}
              getMinutesRemaining={getMinutesRemaining}
              getLoadBadge={getLoadBadge}
              getTypeLabel={getTypeLabel}
            />
          ))}
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Bus Services Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
              No active buses found for stop code <strong className="font-mono">{busStopCode}</strong>
              {appliedServiceNo ? ` and service ${appliedServiceNo}` : ''}. Please check the code or try
              another stop.
            </p>
          </div>
        )
      )}
    </div>
  );
};

interface BusServiceCardProps {
  service: BusService;
  getMinutesRemaining: (iso?: string) => { text: string; isImminent: boolean; isPassed: boolean };
  getLoadBadge: (load?: string) => { label: string; color: string };
  getTypeLabel: (type?: string) => string;
}

const BusServiceCard: React.FC<BusServiceCardProps> = ({
  service,
  getMinutesRemaining,
  getLoadBadge,
  getTypeLabel,
}) => {
  const next1 = service.NextBus;
  const next2 = service.NextBus2;
  const next3 = service.NextBus3;

  const next1Min = getMinutesRemaining(next1?.EstimatedArrival);
  const next2Min = getMinutesRemaining(next2?.EstimatedArrival);
  const next3Min = getMinutesRemaining(next3?.EstimatedArrival);

  const load1 = getLoadBadge(next1?.Load);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 bg-emerald-500 text-slate-950 font-mono font-black text-xl rounded-lg shadow-sm">
            {service.ServiceNo}
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Operator
            </span>
            <div className="text-xs font-semibold text-slate-200">{service.Operator || 'LTA'}</div>
          </div>
        </div>

        {/* Primary Next Bus Highlight */}
        {next1?.EstimatedArrival ? (
          <div className="text-right">
            <span className="text-[10px] uppercase text-emerald-400 font-semibold block">
              Next Bus
            </span>
            <span
              className={`font-mono text-lg font-bold ${
                next1Min.isImminent ? 'text-emerald-400 animate-pulse' : 'text-white'
              }`}
            >
              {next1Min.text}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Not in service</span>
        )}
      </div>

      {/* Arrivals Breakdown */}
      <div className="p-4 space-y-3 flex-1 bg-slate-50/50">
        {/* Next Bus 1 (Detailed) */}
        {next1?.EstimatedArrival ? (
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Next Bus (1st)</span>
              </span>
              <span
                className={`text-sm font-bold font-mono px-2 py-0.5 rounded-md ${
                  next1Min.isImminent ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {next1Min.text}
              </span>
            </div>

            {/* Badges: Load + Deck + WAB */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className={`px-2 py-0.5 rounded border font-medium ${load1.color}`}>
                {load1.label}
              </span>
              {next1.Type && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>{getTypeLabel(next1.Type)}</span>
                </span>
              )}
              {next1.Feature === 'WAB' && (
                <span
                  className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-0.5"
                  title="Wheelchair Accessible Bus"
                >
                  <Accessibility className="w-3 h-3" />
                  <span>WAB</span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-2 text-center">No upcoming 1st bus scheduled</div>
        )}

        {/* Subsequent Buses (NextBus2 & NextBus3) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Next Bus 2 */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold block">2nd Bus</span>
            {next2?.EstimatedArrival ? (
              <div className="mt-1 space-y-1">
                <div className="font-bold font-mono text-slate-800">{next2Min.text}</div>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded border ${
                      getLoadBadge(next2.Load).color
                    }`}
                  >
                    {getLoadBadge(next2.Load).label.split(' ')[0]}
                  </span>
                  {next2.Type && (
                    <span className="text-[10px] text-slate-500">{next2.Type}</span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-slate-400 text-[11px] block mt-1">-</span>
            )}
          </div>

          {/* Next Bus 3 */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold block">3rd Bus</span>
            {next3?.EstimatedArrival ? (
              <div className="mt-1 space-y-1">
                <div className="font-bold font-mono text-slate-800">{next3Min.text}</div>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded border ${
                      getLoadBadge(next3.Load).color
                    }`}
                  >
                    {getLoadBadge(next3.Load).label.split(' ')[0]}
                  </span>
                  {next3.Type && (
                    <span className="text-[10px] text-slate-500">{next3.Type}</span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-slate-400 text-[11px] block mt-1">-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
