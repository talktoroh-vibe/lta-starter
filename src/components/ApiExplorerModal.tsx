import React, { useState } from 'react';
import {
  X,
  Code2,
  Play,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointDef {
  id: string;
  name: string;
  method: 'GET';
  path: string;
  description: string;
  defaultParams: Record<string, string>;
  ltaUpstream: string;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'bus-arrival',
    name: '1. Next Buses at Stop (v3)',
    method: 'GET',
    path: '/api/bus-arrival',
    description: 'Returns real-time bus arrivals, load (SEA/SDA/LSD), deck type (SD/DD/BD), and wheelchair accessibility.',
    defaultParams: {
      busStopCode: '83139',
      serviceNo: '15',
    },
    ltaUpstream: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139&ServiceNo=15',
  },
  {
    id: 'carparks',
    name: '2. Live Carpark Lots (HDB + LTA + URA)',
    method: 'GET',
    path: '/api/carparks',
    description: 'Returns real-time available carpark lots across HDB, LTA, and URA developments across Singapore.',
    defaultParams: {},
    ltaUpstream: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
  },
  {
    id: 'traffic-incidents',
    name: '3. Traffic Incidents',
    method: 'GET',
    path: '/api/traffic-incidents',
    description: 'Returns active accidents, road works, vehicle breakdowns, and heavy traffic reports on expressways.',
    defaultParams: {},
    ltaUpstream: 'https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents',
  },
  {
    id: 'train-alerts',
    name: '4. MRT & LRT Train Alerts',
    method: 'GET',
    path: '/api/train-alerts',
    description: 'Returns live MRT/LRT rail operational status, affected segments, and free bus bridging services.',
    defaultParams: {},
    ltaUpstream: 'https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts',
  },
  {
    id: 'config-status',
    name: '5. Backend Credential Health',
    method: 'GET',
    path: '/api/config-status',
    description: 'Checks server-side credential configuration safely without leaking keys to the client.',
    defaultParams: {},
    ltaUpstream: 'Local Server Security Verification',
  },
];

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({ isOpen, onClose }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [params, setParams] = useState<Record<string, string>>(ENDPOINTS[0].defaultParams);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setParams(ep.defaultParams);
    setResponseStatus(null);
    setResponseTime(null);
    setResponseBody(null);
  };

  const handleParamChange = (key: string, value: string) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const buildUrl = () => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      const stringVal = String(v ?? '');
      if (stringVal.trim() !== '') {
        searchParams.append(k, stringVal.trim());
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `${selectedEndpoint.path}?${queryString}` : selectedEndpoint.path;
  };

  const executeRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseTime(null);
    setResponseBody(null);

    const startTime = performance.now();
    try {
      const url = buildUrl();
      const res = await fetch(url);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!responseBody) return;
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Backend API Explorer & Tester</h3>
              <p className="text-xs text-slate-400">
                Directly execute, inspect, and verify Singapore LTA DataMall proxy endpoints.
              </p>
            </div>
          </div>

          <button
            id="btn-close-api-explorer"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Endpoint selector */}
          <div className="md:col-span-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Available Endpoints
            </span>
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  id={`btn-select-ep-${ep.id}`}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex flex-col space-y-1 ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-emerald-400">{ep.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 font-mono">
                      {ep.method}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 truncate">{ep.path}</span>
                </button>
              );
            })}

            {/* Security Guardrail Reminder */}
            <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Protected</span>
              </div>
              <p>
                API credentials are read strictly server-side in <code className="text-slate-200">/api/</code> via{' '}
                <code className="text-slate-200">process.env</code>. Keys are never exposed to browser clients.
              </p>
            </div>
          </div>

          {/* Right: Parameter Editor & Response Inspector */}
          <div className="md:col-span-7 space-y-4 flex flex-col">
            {/* Selected endpoint details */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{selectedEndpoint.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">Proxy to LTA DataMall</span>
              </div>
              <p className="text-xs text-slate-300">{selectedEndpoint.description}</p>

              {/* Upstream URL note */}
              <div className="text-[11px] font-mono text-slate-400 break-all bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Upstream Provider URL:</span>
                {selectedEndpoint.ltaUpstream}
              </div>

              {/* Parameters Editor */}
              {Object.keys(params).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <span className="text-xs font-semibold text-slate-300">Query Parameters</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(params).map(([key, val]) => (
                      <div key={key}>
                        <label className="text-[11px] font-mono text-slate-400 block mb-0.5">{key}</label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleParamChange(key, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request URL preview & Send button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 truncate">
                  GET {buildUrl()}
                </div>
                <button
                  id="btn-send-api-test"
                  onClick={executeRequest}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'fill-slate-950'}`} />
                  <span>{loading ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>
            </div>

            {/* Response Console */}
            <div className="flex-1 flex flex-col rounded-xl bg-slate-950 border border-slate-800 overflow-hidden min-h-[220px]">
              <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-slate-300">Live Response</span>
                  {responseStatus !== null && (
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        responseStatus === 200
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      HTTP {responseStatus}
                    </span>
                  )}
                  {responseTime !== null && (
                    <span className="text-slate-400 font-mono text-[11px] flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{responseTime}ms</span>
                    </span>
                  )}
                </div>

                {responseBody && (
                  <button
                    id="btn-copy-response-json"
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy JSON</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* JSON Display */}
              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 max-h-[300px]">
                {loading ? (
                  <div className="flex items-center justify-center h-32 text-slate-500 space-x-2">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to backend proxy & fetching live payload...</span>
                  </div>
                ) : responseBody ? (
                  <pre className="text-emerald-300/90 whitespace-pre-wrap">{responseBody}</pre>
                ) : (
                  <div className="text-slate-500 text-center py-10">
                    Click <strong>"Send Request"</strong> above to test this backend endpoint.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
