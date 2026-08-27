import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Search,
  MapPin,
  ExternalLink,
  Wrench,
  Car,
  Clock,
  ShieldAlert,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { TrafficIncident, TrafficIncidentsResponse } from '../types';
import { EXPRESSWAYS } from '../data/singaporeStops';

export const TrafficIncidentsView: React.FC = () => {
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters
  const [selectedExpressway, setSelectedExpressway] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/traffic-incidents');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error === 'credential not configured') {
          throw new Error('Credential not configured. Please set LTA_ACCOUNT_KEY in environment variables.');
        }
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch traffic incidents`);
      }
      const data: TrafficIncidentsResponse = await res.json();
      setIncidents(data.value || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load traffic incident data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Summary Metrics
  const stats = useMemo(() => {
    let accidents = 0;
    let roadworks = 0;
    let breakdowns = 0;
    let heavyTraffic = 0;
    let other = 0;

    incidents.forEach((inc) => {
      const type = (inc.Type || '').toLowerCase();
      if (type.includes('accident')) accidents++;
      else if (type.includes('roadwork') || type.includes('work')) roadworks++;
      else if (type.includes('breakdown') || type.includes('vehicle breakdown')) breakdowns++;
      else if (type.includes('heavy') || type.includes('traffic')) heavyTraffic++;
      else other++;
    });

    return {
      total: incidents.length,
      accidents,
      roadworks,
      breakdowns,
      heavyTraffic,
      other,
    };
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const msg = (inc.Message || '').toUpperCase();
      const type = (inc.Type || '').toUpperCase();

      // Expressway filter
      if (selectedExpressway !== 'All') {
        const expMatch = msg.includes(selectedExpressway.toUpperCase());
        if (!expMatch) return false;
      }

      // Type filter
      if (selectedType !== 'ALL') {
        if (selectedType === 'ACCIDENT' && !type.includes('ACCIDENT')) return false;
        if (selectedType === 'ROADWORK' && !type.includes('ROADWORK') && !type.includes('WORK')) return false;
        if (selectedType === 'BREAKDOWN' && !type.includes('BREAKDOWN')) return false;
        if (selectedType === 'HEAVY_TRAFFIC' && !type.includes('HEAVY') && !type.includes('TRAFFIC')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!msg.toLowerCase().includes(q) && !type.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, selectedExpressway, selectedType, searchQuery]);

  const getTypeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('accident')) {
      return {
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: ShieldAlert,
        iconColor: 'text-rose-600',
        borderLeft: 'border-l-rose-500',
      };
    } else if (t.includes('roadwork') || t.includes('work')) {
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: Wrench,
        iconColor: 'text-amber-600',
        borderLeft: 'border-l-amber-500',
      };
    } else if (t.includes('breakdown')) {
      return {
        badge: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: Car,
        iconColor: 'text-orange-600',
        borderLeft: 'border-l-orange-500',
      };
    } else if (t.includes('heavy') || t.includes('traffic')) {
      return {
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Flame,
        iconColor: 'text-yellow-600',
        borderLeft: 'border-l-yellow-500',
      };
    } else {
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        icon: AlertTriangle,
        iconColor: 'text-slate-600',
        borderLeft: 'border-l-slate-400',
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Incidents</span>
            <AlertTriangle className="w-4 h-4 text-slate-700" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {stats.total}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Live LTA road alerts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Accidents</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600">
            {stats.accidents}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Active crash reports</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Roadworks</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600">
            {stats.roadworks}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Scheduled / emergency works</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Breakdowns</span>
            <Car className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-orange-600">
            {stats.breakdowns}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Disabled vehicles on road</div>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Traffic Incidents & Road Alerts</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live updates on accidents, vehicle breakdowns, road works, and congestion across Singapore.
            </p>
          </div>

          <button
            id="btn-refresh-traffic"
            onClick={fetchIncidents}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Alerts</span>
          </button>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search text */}
          <div className="sm:col-span-6 relative">
            <input
              id="input-traffic-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expressway, road, exit, or keyword..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Type filter */}
          <div className="sm:col-span-3">
            <select
              id="select-incident-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Incident Types</option>
              <option value="ACCIDENT">Accidents</option>
              <option value="ROADWORK">Road Works</option>
              <option value="BREAKDOWN">Vehicle Breakdowns</option>
              <option value="HEAVY_TRAFFIC">Heavy Traffic</option>
            </select>
          </div>

          {/* Expressway Dropdown */}
          <div className="sm:col-span-3">
            <select
              id="select-expressway"
              value={selectedExpressway}
              onChange={(e) => setSelectedExpressway(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {EXPRESSWAYS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp === 'All' ? 'All Expressways & Roads' : `${exp} Expressway`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Expressway Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Expressway Filter:</span>
          {EXPRESSWAYS.map((exp) => (
            <button
              key={exp}
              type="button"
              id={`btn-expressway-${exp}`}
              onClick={() => setSelectedExpressway(exp)}
              className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer border ${
                selectedExpressway === exp
                  ? 'bg-slate-900 text-white font-bold border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Error Loading Traffic Incidents</h4>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          Showing <strong>{filteredIncidents.length}</strong> active traffic incidents
        </span>
        {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString('en-SG')}</span>}
      </div>

      {/* Incidents List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-5 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredIncidents.length > 0 ? (
        <div className="space-y-3">
          {filteredIncidents.map((incident, idx) => {
            const style = getTypeStyle(incident.Type || 'Incident');
            const Icon = style.icon;
            const hasCoords = incident.Latitude && incident.Longitude;
            const mapUrl = hasCoords
              ? `https://www.google.com/maps/search/?api=1&query=${incident.Latitude},${incident.Longitude}`
              : null;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5 flex-1">
                  <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 ${style.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${style.badge}`}>
                        {incident.Type || 'Traffic Incident'}
                      </span>

                      {hasCoords && (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>
                            {incident.Latitude.toFixed(4)}, {incident.Longitude.toFixed(4)}
                          </span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {incident.Message}
                    </p>
                  </div>
                </div>

                {mapUrl && (
                  <div className="sm:self-center shrink-0">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Map</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Traffic Incidents Reported</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Traffic conditions on Singapore expressways and major roads are currently clear without major
            reported disruptions.
          </p>
        </div>
      )}
    </div>
  );
};
