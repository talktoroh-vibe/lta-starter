import React, { useState, useEffect, useMemo } from 'react';
import {
  Car,
  Search,
  RefreshCw,
  MapPin,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  AlertCircle,
  TrendingUp,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { CarparkItem, CarparkResponse } from '../types';
import { generateClientCarparks } from '../services/clientTransportService';

export const CarparkView: React.FC = () => {
  const [carparks, setCarparks] = useState<CarparkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string>('ALL');
  const [selectedLotType, setSelectedLotType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'lots-desc' | 'lots-asc' | 'name'>('lots-desc');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 24;

  const fetchCarparks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/carparks');
      if (res.ok) {
        const data: CarparkResponse = await res.json();
        setCarparks(data.value || []);
        setLastUpdated(new Date());
        return;
      }
      // Fallback
      const fallback = generateClientCarparks();
      setCarparks(fallback.value || []);
      setLastUpdated(new Date());
    } catch (_err: any) {
      const fallback = generateClientCarparks();
      setCarparks(fallback.value || []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarparks();
  }, []);

  // Summary Metrics
  const stats = useMemo(() => {
    let totalLots = 0;
    let hdbCount = 0;
    let ltaCount = 0;
    let uraCount = 0;
    let fullCount = 0;

    carparks.forEach((cp) => {
      const lots = Number(cp.AvailableLots) || 0;
      totalLots += lots;
      if (lots === 0) fullCount++;

      const agency = cp.Agency?.toUpperCase();
      if (agency === 'HDB') hdbCount++;
      else if (agency === 'LTA') ltaCount++;
      else if (agency === 'URA') uraCount++;
    });

    return {
      totalCarparks: carparks.length,
      totalLots,
      hdbCount,
      ltaCount,
      uraCount,
      fullCount,
    };
  }, [carparks]);

  // Filtered & Sorted carparks
  const filteredCarparks = useMemo(() => {
    return carparks
      .filter((cp) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const dev = (cp.Development || '').toLowerCase();
          const area = (cp.Area || '').toLowerCase();
          const id = (cp.CarParkID || '').toLowerCase();
          if (!dev.includes(q) && !area.includes(q) && !id.includes(q)) {
            return false;
          }
        }

        // Agency
        if (selectedAgency !== 'ALL' && cp.Agency?.toUpperCase() !== selectedAgency) {
          return false;
        }

        // Lot Type
        if (selectedLotType !== 'ALL' && cp.LotType !== selectedLotType) {
          return false;
        }

        // Availability status
        const lots = Number(cp.AvailableLots) || 0;
        if (selectedStatus === 'PLENTY' && lots < 50) return false;
        if (selectedStatus === 'MODERATE' && (lots < 10 || lots >= 50)) return false;
        if (selectedStatus === 'LOW' && (lots <= 0 || lots >= 10)) return false;
        if (selectedStatus === 'FULL' && lots > 0) return false;

        return true;
      })
      .sort((a, b) => {
        const lotsA = Number(a.AvailableLots) || 0;
        const lotsB = Number(b.AvailableLots) || 0;
        if (sortBy === 'lots-desc') return lotsB - lotsA;
        if (sortBy === 'lots-asc') return lotsA - lotsB;
        if (sortBy === 'name') return (a.Development || '').localeCompare(b.Development || '');
        return 0;
      });
  }, [carparks, searchQuery, selectedAgency, selectedLotType, selectedStatus, sortBy]);

  const totalPages = Math.ceil(filteredCarparks.length / itemsPerPage);
  const paginatedCarparks = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredCarparks.slice(start, start + itemsPerPage);
  }, [filteredCarparks, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedAgency, selectedLotType, selectedStatus, sortBy]);

  const getStatusInfo = (available: number) => {
    if (available >= 50) {
      return {
        label: 'Plenty Lots',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        barColor: 'bg-emerald-500',
        width: '100%',
      };
    } else if (available >= 10) {
      return {
        label: 'Moderate',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        barColor: 'bg-amber-500',
        width: '50%',
      };
    } else if (available > 0) {
      return {
        label: 'Low Space',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        barColor: 'bg-rose-500',
        width: '20%',
      };
    } else {
      return {
        label: 'Full',
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        barColor: 'bg-slate-400',
        width: '5%',
      };
    }
  };

  const getLotTypeName = (lotType: string) => {
    switch (lotType) {
      case 'C':
        return 'Cars';
      case 'H':
        return 'Heavy Vehicles';
      case 'Y':
        return 'Motorcycles';
      default:
        return lotType || 'Cars';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Tracked</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {stats.totalCarparks.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">HDB, LTA & URA Carparks</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Live Available Lots</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {stats.totalLots.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across all sectors</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Agencies Tracked</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-800 flex items-center space-x-2">
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs">
              HDB {stats.hdbCount}
            </span>
            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200 text-xs">
              LTA {stats.ltaCount}
            </span>
            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 text-xs">
              URA {stats.uraCount}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Combined agency feeds</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Full Lots</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600">
            {stats.fullCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Currently 0 lots available</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <Car className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Live Carpark Lot Availability</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time lot counts from HDB, LTA and URA carparks across Singapore.
            </p>
          </div>

          <button
            id="btn-refresh-carparks"
            onClick={fetchCarparks}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Lots</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <input
              id="input-carpark-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mall, road, area, or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Agency Filter */}
          <div>
            <select
              id="select-carpark-agency"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Agencies (HDB, LTA, URA)</option>
              <option value="HDB">HDB Carparks</option>
              <option value="LTA">LTA Carparks</option>
              <option value="URA">URA Carparks</option>
            </select>
          </div>

          {/* Lot Type */}
          <div>
            <select
              id="select-carpark-lot-type"
              value={selectedLotType}
              onChange={(e) => setSelectedLotType(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Lot Types</option>
              <option value="C">Cars (C)</option>
              <option value="Y">Motorcycles (Y)</option>
              <option value="H">Heavy Vehicles (H)</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              id="select-carpark-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="lots-desc">Most Available Lots</option>
              <option value="lots-asc">Least Available Lots</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Area Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Search:</span>
          {['Marina', 'Orchard', 'Bugis', 'Bedok', 'Jurong', 'Tampines', 'Woodlands', 'HarbourFront', 'Changi'].map(
            (area) => (
              <button
                key={area}
                type="button"
                id={`btn-quick-carpark-${area}`}
                onClick={() => setSearchQuery(searchQuery === area ? '' : area)}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer border ${
                  searchQuery === area
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {area}
              </button>
            )
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Error Loading Carpark Data</h4>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          Showing <strong>{filteredCarparks.length}</strong> matching carparks
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString('en-SG')}</span>}
      </div>

      {/* Carpark Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : paginatedCarparks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedCarparks.map((cp, idx) => {
            const availableNum = Number(cp.AvailableLots) || 0;
            const status = getStatusInfo(availableNum);
            const coordinates = cp.Location ? cp.Location.split(' ') : null;
            const googleMapsUrl =
              coordinates && coordinates.length === 2
                ? `https://www.google.com/maps/search/?api=1&query=${coordinates[0]},${coordinates[1]}`
                : null;

            return (
              <div
                key={`${cp.CarParkID}-${idx}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Agency & ID header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      #{cp.CarParkID}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          cp.Agency === 'HDB'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : cp.Agency === 'URA'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {cp.Agency || 'LTA'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                        {getLotTypeName(cp.LotType)}
                      </span>
                    </div>
                  </div>

                  {/* Title & Area */}
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 min-h-[2.5rem]">
                    {cp.Development || 'Carpark Location'}
                  </h3>
                  {cp.Area && (
                    <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cp.Area}</span>
                    </div>
                  )}
                </div>

                {/* Lot Availability Meter */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Available Lots</span>
                    <span className="font-mono text-xl font-bold text-slate-900">
                      {availableNum.toLocaleString()}
                    </span>
                  </div>

                  {/* Visual gauge bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.barColor}`}
                      style={{ width: status.width }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${status.badge}`}>
                      {status.label}
                    </span>

                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1 cursor-pointer"
                        title="Open in Google Maps"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Carparks Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            No matching carparks found with the current search query and filters. Try adjusting your search.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            id="btn-carpark-prev-page"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs text-slate-600 px-2 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            id="btn-carpark-next-page"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
