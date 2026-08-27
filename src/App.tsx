import React, { useState, useEffect } from 'react';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { BusArrivalView } from './components/BusArrivalView';
import { CarparkView } from './components/CarparkView';
import { TrafficIncidentsView } from './components/TrafficIncidentsView';
import { TrainAlertsView } from './components/TrainAlertsView';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { ShieldCheck, Database, Radio, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('bus');
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/config-status');
        if (res.ok) {
          const data = await res.json();
          setIsBackendHealthy(data.configured === true);
        } else {
          setIsBackendHealthy(false);
        }
      } catch {
        setIsBackendHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendHealthy={isBackendHealthy}
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'bus' && <BusArrivalView />}
        {activeTab === 'carparks' && <CarparkView />}
        {activeTab === 'traffic' && <TrafficIncidentsView />}
        {activeTab === 'trains' && <TrainAlertsView />}
      </main>

      {/* API Explorer Modal */}
      <ApiExplorerModal
        isOpen={isApiExplorerOpen}
        onClose={() => setIsApiExplorerOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Singapore Land Transport Authority (LTA) DataMall Live Gateway</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Server-Side Credential Protection</span>
            </span>
            <span>•</span>
            <button
              id="btn-footer-open-api"
              onClick={() => setIsApiExplorerOpen(true)}
              className="text-slate-300 hover:text-emerald-400 underline underline-offset-2 transition cursor-pointer"
            >
              Test Backend APIs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
