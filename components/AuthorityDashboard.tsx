
import React, { useState } from 'react';
import { DELHI_WARDS, MOCK_COMPLAINTS, CONSTRUCTION_SITES, NO_IDLING_HOTSPOTS } from '../constants';
import { AuthorityTool } from '../types';
import Dashboard from './Dashboard';
import LeafletAQIMap from './LeafletAQIMap';
import WardPriorityExplainer from './WardPriorityExplainer';
import SourceAttribution from './SourceAttribution';
import WardActionRecommendations from './WardActionRecommendations';
import DataConfidenceLayer from './DataConfidenceLayer';
import HistoricalTrend from './HistoricalTrend';
import ComplaintTracker from './ComplaintTracker';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

interface AuthorityDashboardProps {
  onNavigateMap: () => void;
}

const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({ onNavigateMap }) => {
  const [activeTool, setActiveTool] = useState<AuthorityTool>(AuthorityTool.OVERVIEW);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);

  // Export button component for reusability
  const ExportButtons: React.FC<{ onExportCSV: () => void; onExportJSON: () => void; label?: string }> = ({ 
    onExportCSV, 
    onExportJSON, 
    label = 'Export Data' 
  }) => (
    <div className="flex gap-2">
      <button 
        onClick={onExportCSV}
        className="bg-primary/10 hover:bg-primary/20 border border-primary/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">download</span>
        CSV
      </button>
      <button 
        onClick={onExportJSON}
        className="bg-primary/10 hover:bg-primary/20 border border-primary/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">code</span>
        JSON
      </button>
    </div>
  );

  const renderEmbeddedMap = () => (
    <div className="glass-panel rounded-[2rem] overflow-hidden border-white/10 relative">
      <button
        onClick={() => setIsMapExpanded(!isMapExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">map</span>
          <div className="text-left">
            <p className="text-sm font-black uppercase tracking-widest text-white">Interactive Ward Map</p>
            <p className="text-[10px] text-white/60">Live AQI heatmap with ward selection</p>
          </div>
        </div>
        <span className={`material-symbols-outlined text-white/60 transition-transform ${isMapExpanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {isMapExpanded && (
        <div className="relative h-[420px] border-t border-white/10">
          <LeafletAQIMap showChrome={false} key={`tool-map-${activeTool}`} />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
          <button
            onClick={onNavigateMap}
            className="absolute top-4 right-4 z-10 bg-primary text-background-dark text-xs font-bold px-4 py-2 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Open Full Map
          </button>
        </div>
      )}
    </div>
  );

  const handleExport = () => {
    // 1. Define Headers
    const headers = ['Rank', 'Ward Name', 'Primary Vector', 'Priority Score', 'Outcome Trend', 'SLA Criticality'];

    // 2. Process Data (Sort matching the table display)
    const sortedWards = [...DELHI_WARDS].sort((a, b) => b.priorityScore - a.priorityScore);

    // 3. Generate Rows
    const rows = sortedWards.map((w, index) => {
      const rank = `#0${index + 1}`;
      const primaryVector = w.sourceDistribution.vehicular > 50 ? 'Vehicular' : 'Industrial';
      const slaCriticality = index < 2 ? 'Action Mandate' : 'Monitoring';
      return [
        rank,
        w.name,
        primaryVector,
        `${w.priorityScore}%`,
        w.outcomeTrend,
        slaCriticality
      ].join(',');
    });

    // 4. Combine into CSV String
    const csvContent = [headers.join(','), ...rows].join('\n');

    // 5. Create Blob and Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ward_priority_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [selectedWard, setSelectedWard] = useState<string>('w44'); // Default to ANAND VIHAR
  const currentWard = DELHI_WARDS.find(w => w.id === selectedWard) || DELHI_WARDS[0];

  const renderTool = () => {
    switch (activeTool) {
      case AuthorityTool.OVERVIEW:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Governance Command Center</h2>
                <p className="text-white/40 font-bold text-xs mt-1 uppercase tracking-widest">Unified Decision Support for NCT Delhi • TIER 1: Ward Priority Index</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary/10 border border-primary/30 px-5 py-2 rounded-2xl flex items-center gap-3">
                  <span className="size-2 bg-primary rounded-full animate-ping"></span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Real-Time Node Sync Active</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* TIER 1: Priority Queue - Scientific Decision Support */}
              <div className="lg:col-span-8 glass-panel rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest">🔥 TIER 1: Ward Priority Index</h3>
                    <p className="text-[10px] text-white/40 mt-1 uppercase font-bold tracking-tighter">"Which ward needs attention FIRST?" — Ranked by composite risk</p>
                  </div>
                  <ExportButtons 
                    onExportCSV={handleExport}
                    onExportJSON={() => exportToJSON(DELHI_WARDS, 'ward_priority_index')}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] uppercase font-black text-white/40 tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-8 py-5">Rank</th>
                        <th className="px-8 py-5">Ward / Hotspot</th>
                        <th className="px-8 py-5">AQI</th>
                        <th className="px-8 py-5">Priority Score</th>
                        <th className="px-8 py-5">Urgency</th>
                        <th className="px-8 py-5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[...DELHI_WARDS].sort((a, b) => b.priorityScore - a.priorityScore).map((w, i) => (
                        <tr 
                          key={w.id} 
                          onClick={() => setSelectedWard(w.id)}
                          className={`hover:bg-white/5 transition-colors group cursor-pointer ${selectedWard === w.id ? 'bg-primary/10' : ''}`}
                        >
                          <td className="px-8 py-6">
                            <span className={`text-lg font-black ${i === 0 ? 'text-red-500' : i === 1 ? 'text-orange-500' : 'text-white/30'}`}>#0{i + 1}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-black text-sm uppercase tracking-tight">{w.name}</div>
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">{w.populationDensity} Density • {w.dataSource === 'sensor' ? '📡 Sensor' : '🛰️ Est.'}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`font-black text-lg ${w.aqi > 300 ? 'text-red-500' : w.aqi > 200 ? 'text-orange-500' : 'text-yellow-500'}`}>
                              {w.aqi}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full ${w.priorityScore > 85 ? 'bg-red-500' : w.priorityScore > 70 ? 'bg-orange-500' : 'bg-primary'}`} style={{ width: `${w.priorityScore}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-white/80">{w.priorityScore}%</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${w.priorityScore > 85 ? 'bg-red-500/10 text-red-500' : w.priorityScore > 70 ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                              {w.priorityScore > 85 ? '🔴 CRITICAL' : w.priorityScore > 70 ? '🟠 SEVERE' : '🟢 MODERATE'}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button className="text-primary hover:text-primary/70 font-black">
                              <span className="material-symbols-outlined">arrow_outward</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ward Detail Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel p-6 rounded-[2rem] border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white">Selected Ward</h4>
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                      currentWard.priorityScore > 85 
                        ? 'bg-red-500/10 text-red-400 border-red-500/40'
                        : currentWard.priorityScore > 70
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/40'
                          : 'bg-green-500/10 text-green-400 border-green-500/40'
                    }`}>
                      {currentWard.name}
                    </span>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="text-4xl font-black text-primary">{currentWard.aqi}</div>
                    <div className="text-[10px] text-white/50 font-bold">AQI Index</div>
                    <div className="text-sm font-black text-white mt-2">{currentWard.status}</div>
                  </div>
                </div>

                <DataConfidenceLayer
                  wardName={currentWard.name}
                  sensorCoverage={currentWard.sensorCoverage}
                  dataConfidence={currentWard.dataConfidence}
                  dataSource={currentWard.dataSource}
                  lastUpdated={currentWard.lastUpdated || 'Just now'}
                  aqi={currentWard.aqi}
                />
              </div>
            </div>

            {/* TIER 1: Detailed Ward Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WardPriorityExplainer
                wardName={currentWard.name}
                aqi={currentWard.aqi}
                priorityScore={currentWard.priorityScore}
                populationDensity={currentWard.populationDensity}
                dataConfidence={currentWard.dataConfidence}
                sensorCoverage={currentWard.sensorCoverage}
                aqiDuration={currentWard.aqiDuration || '6 hours'}
                whyToday={currentWard.whyToday || 'High pollution due to multiple factors'}
              />
              
              <SourceAttribution
                wardName={currentWard.name}
                sourceDistribution={currentWard.sourceDistribution}
              />
            </div>

            {/* TIER 1: Action Recommendations */}
            <WardActionRecommendations
              wardName={currentWard.name}
              priorityScore={currentWard.priorityScore}
              recommendedActions={currentWard.recommendedActions || []}
              status={currentWard.status}
            />

            {/* TIER 2: Historical Trend & Complaint Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HistoricalTrend
                wardName={currentWard.name}
                trendHistory={currentWard.trendHistory || []}
                status={currentWard.status}
                outcomeTrend={currentWard.outcomeTrend}
              />
              
              <ComplaintTracker wardName={currentWard.name} />
            </div>

            {/* Interactive Ward Map - Collapsible */}
            {renderEmbeddedMap()}
          </div>
        );
      case AuthorityTool.SIMULATION:
        return <Dashboard />;
      case AuthorityTool.NO_IDLING:
        return (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black uppercase">No-Idling Zones</h2>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Responsible Agency: Delhi Traffic Police (Environmental Wing)</p>
              </div>
              <div className="flex gap-4">
                <ExportButtons 
                  onExportCSV={() => exportToCSV(NO_IDLING_HOTSPOTS, 'no_idling_hotspots')}
                  onExportJSON={() => exportToJSON(NO_IDLING_HOTSPOTS, 'no_idling_hotspots')}
                />
                <button className="bg-primary text-background-dark px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Activate Ward Pulse</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-10 rounded-[2.5rem]">
                <h3 className="font-black text-xs uppercase tracking-widest text-white/40 mb-8 border-b border-white/5 pb-4">Compliance Hotspots</h3>
                <div className="space-y-6">
                  {NO_IDLING_HOTSPOTS.map(h => (
                    <div key={h.id} className="flex justify-between items-center p-5 bg-white/5 border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
                      <div>
                        <h4 className="font-black text-sm uppercase">{h.site}</h4>
                        <p className="text-[10px] text-white/40 font-bold uppercase mt-1">{h.ward}</p>
                        <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{h.violations} Daily Violations</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-white/30 uppercase bg-white/5 px-3 py-1 rounded-lg block mb-2">{h.sla}</span>
                        <span className="text-[8px] text-white/40">{h.lastUpdate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/20 flex flex-col justify-center items-center text-center">
                <span className="material-symbols-outlined text-primary text-6xl mb-6">timer</span>
                <p className="text-sm font-medium text-white/80 italic leading-relaxed max-w-xs">
                  "AI Analysis: Enforcing a 200m Engine-Off radius at ISBT Anand Vihar during peak transit hours (06:00-09:00) reduces localized CO and NO2 concentrations by **31%**."
                </p>
              </div>
            </div>

            {/* Interactive Ward Map - Collapsible */}
            {renderEmbeddedMap()}
          </div>
        );
      case AuthorityTool.CONSTRUCTION:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase">Dust Enforcement Registry</h2>
              <div className="flex gap-4">
                <ExportButtons 
                  onExportCSV={() => exportToCSV(CONSTRUCTION_SITES, 'construction_sites')}
                  onExportJSON={() => exportToJSON(CONSTRUCTION_SITES, 'construction_sites')}
                />
                <button className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Issue Stop-Work Mandate</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CONSTRUCTION_SITES.map(site => (
                <div key={site.id} className="glass-panel p-8 rounded-[2.5rem] flex flex-col hover:border-primary/20 transition-all group border-l-4 border-l-primary">
                  <div className="flex justify-between mb-8 items-start">
                    <div className="bg-white/5 px-3 py-1 rounded-lg">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{site.responsibleAgency} Registry</span>
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase ${site.status === 'Penalized' ? 'bg-red-500 text-white' : 'bg-green-500/10 text-green-500'}`}>{site.status}</span>
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tight mb-2">{site.name}</h4>
                  <p className="text-xs text-white/40 font-bold uppercase mb-8">{site.location}</p>
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between text-[10px] font-black uppercase text-white/40">
                      <span>Compliance Health</span>
                      <span>{site.compliance}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full transition-all duration-1000 ${site.compliance < 50 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${site.compliance}%` }}></div>
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-white/5 text-[9px] font-bold text-white/40 uppercase">
                    SLA: {site.slaDeadline}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Ward Map - Collapsible */}
            {renderEmbeddedMap()}
          </div>
        );
      case AuthorityTool.WASTE_BURNING:
        const wasteBurningData = MOCK_COMPLAINTS.filter(c => c.type === 'Waste Burning');
        
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black uppercase">Waste Burning Response</h2>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">{wasteBurningData.length} Active Incidents</p>
              </div>
              <ExportButtons 
                onExportCSV={() => exportToCSV(wasteBurningData, 'waste_burning_incidents')}
                onExportJSON={() => exportToJSON(wasteBurningData, 'waste_burning_incidents')}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wasteBurningData.map(c => (
                <div key={c.id} className="glass-panel p-8 rounded-[2.5rem] border-l-4 border-l-orange-500 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-7xl">local_fire_department</span>
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Active Incident</span>
                    <span className="text-[9px] font-black text-white/40 uppercase">{c.timestamp}</span>
                  </div>
                  <h4 className="text-lg font-black uppercase mb-1">{c.ward}</h4>
                  <p className="text-xs text-white/60 font-medium mb-8">{c.location}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Current SLA Status</span>
                      <span className="text-xs font-bold text-primary uppercase">{c.slaRemaining}</span>
                    </div>
                    <button className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Acknowledge</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Ward Map - Collapsible */}
            {renderEmbeddedMap()}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center animate-pulse">
            <span className="material-symbols-outlined text-8xl mb-6">construction</span>
            <h3 className="text-2xl font-black uppercase tracking-widest">Enforcement Module Loading</h3>
            <p className="text-sm font-bold mt-2">Syncing localized sensor data with department API...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-background-dark/20">
      <div className="sticky top-0 z-40 bg-background-dark/90 backdrop-blur-xl border-b border-white/5 px-6 lg:px-12 flex gap-10 overflow-x-auto scrollbar-hide">
        {[
          { id: AuthorityTool.OVERVIEW, icon: 'shield_person', label: 'Command' },
          { id: AuthorityTool.NO_IDLING, icon: 'block', label: 'No-Idling' },
          { id: AuthorityTool.CONSTRUCTION, icon: 'construction', label: 'Dust Registry' },
          { id: AuthorityTool.WASTE_BURNING, icon: 'local_fire_department', label: 'Rapid Fire' },
          { id: AuthorityTool.SIMULATION, icon: 'analytics', label: 'Policy Sim' }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`py-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-b-2 transition-all whitespace-nowrap ${activeTool === tool.id ? 'border-primary text-primary' : 'border-transparent text-white/20 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-xl">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>
      <div className="p-6 lg:p-12">
        {renderTool()}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
