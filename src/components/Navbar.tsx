import React, { useEffect, useState } from 'react';
import { Bus, Car, AlertTriangle, Train, Code2, RefreshCw, Clock } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBackendHealthy: boolean | null;
  onOpenApiExplorer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendHealthy,
  onOpenApiExplorer,
}) => {
  const [sgtTime, setSgtTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setSgtTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'bus', label: 'Bus Arrivals (v3)', icon: Bus },
    { id: 'carparks', label: 'Carpark Lots', icon: Car },
    { id: 'traffic', label: 'Traffic Incidents', icon: AlertTriangle },
    { id: 'trains', label: 'MRT / LRT Status', icon: Train },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-inner text-slate-950 font-bold">
              <Bus className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SG Transport Live</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LTA DataMall
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-time buses, carparks, traffic & train alerts
              </p>
            </div>
          </div>

          {/* Time & API Status & Tester Button */}
          <div className="flex items-center space-x-3">
            {/* Singapore Clock */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono">{sgtTime} SGT</span>
            </div>

            {/* Backend Health Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy === true
                    ? 'bg-emerald-400 animate-pulse'
                    : isBackendHealthy === false
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300 text-[11px] hidden sm:inline">
                {isBackendHealthy === true
                  ? 'API Connected'
                  : isBackendHealthy === false
                  ? 'API Disconnected'
                  : 'Checking...'}
              </span>
            </div>

            {/* API Explorer Trigger */}
            <button
              id="btn-open-api-explorer"
              onClick={onOpenApiExplorer}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition cursor-pointer"
              title="Test live backend endpoints & raw JSON"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Explorer</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-4 border-t border-slate-800/80 py-2 overflow-x-auto scrollbar-none">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
