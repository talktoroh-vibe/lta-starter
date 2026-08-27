import React, { useState, useEffect } from 'react';
import {
  Train,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Bus,
  ArrowRight,
  ShieldCheck,
  Info,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { TrainAlertsResponse, TrainAlertAffectedSegment } from '../types';
import { MRT_LINES, MrtLineInfo } from '../data/singaporeStops';

export const TrainAlertsView: React.FC = () => {
  const [trainData, setTrainData] = useState<TrainAlertsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTrainAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/train-alerts');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error === 'credential not configured') {
          throw new Error('Credential not configured. Please set LTA_ACCOUNT_KEY in environment variables.');
        }
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch train service alerts`);
      }
      const data: TrainAlertsResponse = await res.json();
      setTrainData(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load train alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainAlerts();
  }, []);

  const isNormal = trainData?.value?.Status === 1 || !trainData?.value?.AffectedSegments?.length;
  const affectedSegments = trainData?.value?.AffectedSegments || [];
  const broadcastMessages = trainData?.value?.Message || [];

  return (
    <div className="space-y-6">
      {/* Network Status Banner */}
      <div
        className={`rounded-2xl p-6 border shadow-xs transition-all ${
          isNormal
            ? 'bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-emerald-800/80'
            : 'bg-gradient-to-r from-rose-900 to-slate-900 text-white border-rose-800/80'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-2xl ${
                isNormal ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isNormal ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">
                  {isNormal ? 'All MRT & LRT Lines Operating Normally' : 'Train Service Disruption Alert'}
                </h2>
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    isNormal
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                      : 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                  }`}
                >
                  {isNormal ? 'Status Normal' : 'Active Disruption'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                {isNormal
                  ? 'No delays or service disruptions reported across Singapore rail networks by LTA/SMRT/SBS Transit.'
                  : 'Delays or train bridging services are in place for the affected lines shown below.'}
              </p>
            </div>
          </div>

          <button
            id="btn-refresh-trains"
            onClick={fetchTrainAlerts}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 shadow-xs transition cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Check Rail Status</span>
          </button>
        </div>

        {lastUpdated && (
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct telemetry feed from LTA DataMall TrainServiceAlerts</span>
            </span>
            <span>Last checked: {lastUpdated.toLocaleTimeString('en-SG')}</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Error Loading Train Service Alerts</h4>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Disruption Details (if active) */}
      {!isNormal && affectedSegments.length > 0 && (
        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200 space-y-4">
          <h3 className="text-base font-bold text-rose-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Affected Rail Segments & Free Bridging Bus</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affectedSegments.map((segment: TrainAlertAffectedSegment, idx: number) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{segment.Line}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                    Direction: {segment.Direction}
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <div>
                    <strong>Affected Stations:</strong> {segment.Stations}
                  </div>
                  {segment.FreePublicBus && (
                    <div className="text-emerald-700 flex items-center space-x-1">
                      <Bus className="w-3.5 h-3.5" />
                      <span>Free Public Bus: {segment.FreePublicBus}</span>
                    </div>
                  )}
                  {segment.FreeMRTShuttle && (
                    <div className="text-blue-700 flex items-center space-x-1">
                      <Train className="w-3.5 h-3.5" />
                      <span>Free Shuttle: {segment.FreeMRTShuttle} ({segment.MRTShuttleDirection})</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast Messages if any */}
      {broadcastMessages.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-2">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-amber-700" />
            <span>Official Rail Operator Advisory</span>
          </h4>
          {broadcastMessages.map((msg, i) => (
            <p key={i} className="text-xs text-amber-950 font-medium">
              {msg.Content}
            </p>
          ))}
        </div>
      )}

      {/* All Lines Status Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Train className="w-4 h-4 text-slate-700" />
            <span>Singapore Mass Rapid Transit (MRT) & LRT Lines</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">{MRT_LINES.length} Lines Monitored</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MRT_LINES.map((line: MrtLineInfo) => {
            // Check if this line is in affected segments
            const isLineAffected = affectedSegments.some(
              (seg) =>
                seg.Line.toLowerCase().includes(line.code.toLowerCase()) ||
                seg.Line.toLowerCase().includes(line.name.toLowerCase())
            );

            return (
              <div
                key={line.code}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  {/* Line Header & Color Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-10 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs"
                        style={{ backgroundColor: line.color, color: line.textColor }}
                      >
                        {line.code}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{line.name}</h4>
                        <span className="text-[10px] text-slate-500">{line.operator}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isLineAffected ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Line Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 my-3 bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Stations</span>
                      <strong className="text-slate-800">{line.stations} Stations</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Track Length</span>
                      <strong className="text-slate-800">{line.length}</strong>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Service Health</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                      isLineAffected
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isLineAffected ? 'Disrupted' : 'Normal Service'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
