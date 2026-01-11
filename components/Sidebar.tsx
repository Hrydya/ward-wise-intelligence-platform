
import React from 'react';
import { DELHI_WARDS } from '../constants';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden xl:flex w-80 flex-col border-r border-white/5 bg-background-dark/50 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto p-6 scrollbar-hide">
      <div className="mb-8">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Command Center</h3>
        <div className="space-y-4">
          {DELHI_WARDS.slice(0, 3).map((ward) => (
            <div key={ward.id} className={`glass-panel p-4 rounded-xl border-l-4 ${
              ward.status === 'CRITICAL' ? 'border-l-red-500' : 
              ward.status === 'POOR' ? 'border-l-orange-500' : 'border-l-primary'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-white/50">{ward.name}</span>
                <span className={`text-xs font-bold ${
                  ward.status === 'CRITICAL' ? 'text-red-500' : 
                  ward.status === 'POOR' ? 'text-orange-500' : 'text-primary'
                }`}>{ward.status}</span>
              </div>
              <div className="text-2xl font-bold">{ward.aqi} AQI</div>
              <p className="text-[10px] text-white/40 mt-2">
                Primary: {ward.sourceDistribution.vehicular > ward.sourceDistribution.industrial ? 'Vehicular' : 'Industrial'}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <span className="material-symbols-outlined text-sm">notifications_active</span>
            <span className="text-xs font-bold">Active Alerts (4)</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Industrial zone violations detected in Okhla Phase III. Automated notices dispatched.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
