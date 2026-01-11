
import React, { useState } from 'react';
import LeafletAQIMap from './LeafletAQIMap';
import { DELHI_WARDS } from '../constants';
import { WardData } from '../types';
import { EnrichedWardGeoJSON } from '../services/aqiMapService';

interface InteractiveMapProps {
  onBack: () => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onBack }) => {
  const [selectedWard, setSelectedWard] = useState<EnrichedWardGeoJSON | null>(null);

  const handleWardSelect = (ward: EnrichedWardGeoJSON) => {
    setSelectedWard(ward);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background-dark flex overflow-hidden font-display">
      <div className="flex-1 relative bg-[#0a0f0f]">
        {/* Leaflet Map Component */}
        <LeafletAQIMap onWardSelect={handleWardSelect} onBack={onBack} autoRefreshInterval={5 * 60 * 1000} />

        {/* Floating UI Overlays */}
        <div className="absolute top-8 left-8 flex items-center gap-4 z-10 pointer-events-none">
          <button
            onClick={onBack}
            className="size-20 rounded-2xl bg-white text-black border-2 border-gray-300 flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)] pointer-events-auto z-50"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="glass-panel px-8 py-4 rounded-3xl shadow-2xl border-white/10 pointer-events-auto">
            <h2 className="text-2xl font-black tracking-tight uppercase">Ward Action Heatmap</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="size-2 rounded-full bg-green-500 animate-ping"></span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">NCT Delhi Central Node: Operational</span>
            </div>
          </div>
          <div className="glass-panel px-6 py-3 rounded-2xl shadow-2xl border-green-500/20 bg-green-500/5 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">📡</span>
              <div>
                <div className="text-[9px] text-green-400 font-black uppercase tracking-widest">OpenAQ Live Data</div>
                <div className="text-[8px] text-white/30 font-bold">Real-time sensor network</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 glass-panel p-6 rounded-[2rem] max-w-sm shadow-2xl border-white/10 z-10">
          <div className="flex justify-between text-[10px] font-black text-white/40 uppercase mb-4 tracking-widest">
            <span>Pollution Density Metrics</span>
            <span>Scale (AQI)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-primary via-orange-500 to-red-500 shadow-inner"></div>
          <div className="flex justify-between text-[9px] font-black mt-3 text-white/40 tracking-tighter uppercase">
            <span>Satisfactory (0-50)</span>
            <span>Poor (201-300)</span>
            <span>Severe (401+)</span>
          </div>
        </div>
      </div>

      {/* Action Drawer */}
      <aside className={`w-[500px] bg-background-dark/95 backdrop-blur-3xl border-l border-white/10 p-12 flex flex-col transition-all duration-700 transform shadow-[-40px_0_80px_rgba(0,0,0,0.8)] z-40 ${selectedWard ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}>
        {selectedWard ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-12 duration-500">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-5xl font-black mb-2 tracking-tighter uppercase">{selectedWard.properties.ward_name}</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">AQI Data Profile</p>
              </div>
              <button onClick={() => setSelectedWard(null)} className="size-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90">
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>

            <div className={`p-10 rounded-[2.5rem] mb-12 flex items-center justify-between border-2 transition-all ${selectedWard.properties.aqi > 300 ? 'bg-red-500/10 border-red-500/20' : 'bg-primary/5 border-primary/20'}`}>
              <div>
                <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${selectedWard.properties.aqi > 300 ? 'text-red-500' : 'text-primary'}`}>Real-Time AQI Index</p>
                <h4 className={`text-7xl font-black tracking-tighter ${selectedWard.properties.aqi > 300 ? 'text-red-500' : 'text-primary'}`}>{selectedWard.properties.aqi}</h4>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black uppercase tracking-widest ${selectedWard.properties.aqi > 300 ? 'text-red-500' : 'text-primary'}`}>{selectedWard.properties.aqi_category}</p>
                <p className="text-[10px] text-white/30 font-bold uppercase mt-2">
                  {selectedWard.properties.source === 'sensor' ? 'Sensor Data' : 'Estimated'}
                </p>
              </div>
            </div>

            <div className="space-y-12 flex-1 overflow-y-auto pr-6 custom-scrollbar">
              <section>
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-4">Ward Metadata</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/50">Priority Score</span>
                    <span className="font-black text-primary">{selectedWard.properties.priority_score}/100</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/50">Population Density</span>
                    <span className="font-black text-primary">{selectedWard.properties.population_density}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/50">Last Updated</span>
                    <span className="font-black text-primary">{new Date(selectedWard.properties.last_updated).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/50">Data Source</span>
                    <span className={`font-black ${selectedWard.properties.source === 'sensor' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selectedWard.properties.source === 'sensor' ? '📡 Sensor' : '🔮 Estimated'}
                    </span>
                  </div>
                  {selectedWard.properties.pm2_5 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/50">PM2.5</span>
                      <span className="font-black text-primary">{selectedWard.properties.pm2_5} µg/m³</span>
                    </div>
                  )}
                </div>
              </section>

              <div className="bg-primary/5 border border-primary/10 p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-9xl">psychology_alt</span>
                </div>
                <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  Data Quality
                </h4>
                <p className="text-base text-white/80 leading-relaxed font-medium">
                  {selectedWard.properties.source === 'sensor'
                    ? '✓ Real-time sensor data from ground stations'
                    : '⚠ Estimated using distance-weighted interpolation from nearby sensors'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 opacity-30">
            <div className="size-28 rounded-full bg-white/5 flex items-center justify-center mb-10 animate-pulse border border-white/5">
              <span className="material-symbols-outlined text-6xl text-white/20">explore</span>
            </div>
            <h4 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Awaiting Ward Selection</h4>
            <p className="text-sm font-bold text-white/60 leading-relaxed uppercase tracking-tighter">
              Click on a ward on the map <br /> to view detailed AQI data.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default InteractiveMap;
