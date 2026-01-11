
import React, { useState, useEffect } from 'react';
import { DELHI_WARDS, MOCK_COMPLAINTS } from '../constants';
import { WardData } from '../types';
import { getHealthAdvice, getWardExplainer } from '../services/geminiService';
import cacService from '../services/cacService';
import { getStoredWard } from '../services/locationService';
import LeafletAQIMap from './LeafletAQIMap';

interface CitizenDashboardProps {
  onNavigateMap: () => void;
  detectedWard?: WardData;
}

const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onNavigateMap, detectedWard }) => {
  const [advice, setAdvice] = useState<string>('');
  const [explainer, setExplainer] = useState<string>('');
  const [isReporting, setIsReporting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [reportData, setReportData] = useState({
    image: null as string | null,
    location: null as { lat: number; lng: number } | null,
    description: '',
    type: 'Fire Incident'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Start as not joined; joining happens when user clicks the button
  const [joinedMission, setJoinedMission] = useState<boolean>(false);

  // Use detected ward or stored ward, fallback to first ward
  const userWard = detectedWard || getStoredWard() || DELHI_WARDS[0];

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReportData(prev => ({ ...prev, image: ev.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setReportData(prev => ({
          ...prev,
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }));
      });
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReporting(false);
      setReportData({ image: null, location: null, description: '', type: 'Fire Incident' });

      // Award CAC for report (3 CAC) — assign a unique action id to avoid double-award
      try {
        const id = `report_${Date.now()}`;
        const res = cacService.awardCAC(3, { id, note: 'Report submitted' });
        if (res && res.ok) {
          alert(`Report dispatched — You earned 3 CAC! New balance: ${res.newBalance} CAC`);
        } else {
          // still notify dispatch success
          alert('Report dispatched to Central Command successfully!');
        }
      } catch (e) {
        alert('Report dispatched to Central Command successfully!');
      }

    }, 1500);
  };

  useEffect(() => {
    const fetchContext = async () => {
      const [hMsg, eMsg] = await Promise.all([
        getHealthAdvice(userWard.aqi),
        getWardExplainer(userWard)
      ]);
      setAdvice(hMsg);
      setExplainer(eMsg);
    };
    fetchContext();
  }, []);

  return (
    <div className="flex-1 p-6 space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-700">
      
      {/* Full-Width Header Status */}
      <section className="bg-white dark:bg-[#2D525A] rounded-xl p-8 shadow-xl border border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#00bdd6] uppercase tracking-widest text-xs font-bold">
              <span className="material-symbols-outlined text-xs">location_on</span>
              {userWard.name} • Live Status
            </div>
            <h2 className="text-4xl font-black">Current Atmospheric Status</h2>
            <p className="text-slate-500 dark:text-slate-300 max-w-md">
              Environmental sensors updated 4 minutes ago. Data sourced from CPCB & DPCC Network.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-10">
            <div className="flex items-baseline gap-4">
              <span className={`text-7xl font-black tracking-tighter ${userWard.aqi > 200 ? 'text-red-500' : userWard.aqi > 100 ? 'text-orange-500' : userWard.aqi > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                {userWard.aqi}
              </span>
              <div className="flex flex-col">
                <span className={`text-xl font-bold uppercase tracking-wide ${userWard.aqi > 200 ? 'text-red-500' : userWard.aqi > 100 ? 'text-orange-500' : userWard.aqi > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {userWard.status}
                </span>
                <span className="text-xs opacity-60">Indian AQI Index</span>
              </div>
            </div>
            <div className="h-16 w-px bg-white/10 hidden xl:block"></div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined font-bold">trending_up</span>
                <span className="text-lg font-bold">+12% Higher</span>
              </div>
              <p className="text-sm opacity-60">Compared to 24h average</p>
            </div>
            <button 
              onClick={onNavigateMap}
              className="bg-[#00bdd6] hover:bg-[#00bdd6]/90 text-[#1b3f46] font-extrabold px-6 py-3 rounded-lg flex items-center gap-2 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined">map</span>
              Ward Heatmap
            </button>
          </div>
        </div>
      </section>

      {/* Main Body Split */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Column (60%) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Health Advisory Guide */}
          <div className="bg-white dark:bg-[#2D525A] rounded-xl p-6 shadow-md border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00bdd6]">medical_services</span>
                <h3 className="text-xl font-bold">Health Advisory Guide</h3>
              </div>
              <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
                Active Warning
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1b3f46]/50 border border-white/5 flex flex-col items-center text-center gap-3">
                <span className="material-symbols-outlined text-3xl text-[#00bdd6]">masks</span>
                <p className="text-sm font-bold">Wear N95 Outdoors</p>
                <p className="text-xs opacity-60">Essential for exposure over 15 mins</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1b3f46]/50 border border-white/5 flex flex-col items-center text-center gap-3">
                <span className="material-symbols-outlined text-3xl text-[#00bdd6]">window_closed</span>
                <p className="text-sm font-bold">Seal Windows</p>
                <p className="text-xs opacity-60">Keep indoor filtration active</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1b3f46]/50 border border-white/5 flex flex-col items-center text-center gap-3">
                <span className="material-symbols-outlined text-3xl text-[#00bdd6]">directions_run</span>
                <p className="text-sm font-bold">No High Activity</p>
                <p className="text-xs opacity-60">Avoid cardio in public spaces</p>
              </div>
            </div>

            {/* Medical Details */}
            <div className="border-t border-white/10 pt-6">
              <p className="text-sm font-semibold mb-4 opacity-80 uppercase tracking-widest">
                Medical Details & Vulnerability
              </p>
              <div className="space-y-3">
                <div className="flex gap-4 p-4 rounded-lg bg-[#00bdd6]/5 border border-[#00bdd6]/10">
                  <span className="material-symbols-outlined text-[#00bdd6] mt-1">info</span>
                  <div>
                    <p className="font-bold text-sm">Sensitive Groups at Elevated Risk</p>
                    <p className="text-sm opacity-70 leading-relaxed">
                      {advice || "Loading personalized health recommendations..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Environmental Context */}
          <div className="bg-white dark:bg-[#2D525A] rounded-xl p-6 shadow-md border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 size-48 bg-[#00bdd6]/5 rounded-full blur-3xl group-hover:bg-[#00bdd6]/10 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#00bdd6]">psychology</span>
              <h3 className="text-xl font-bold">AI Environmental Context</h3>
            </div>
            <div className="space-y-4 relative z-10">
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-100 italic">
                "{explainer || "Analyzing local sensor pulse and emission patterns..."}"
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold uppercase py-1 px-2 bg-white/5 rounded border border-white/10">
                  Industrial: {userWard.sourceDistribution.industrial}%
                </span>
                <span className="text-[10px] font-bold uppercase py-1 px-2 bg-white/5 rounded border border-white/10">
                  Vehicular: {userWard.sourceDistribution.vehicular}%
                </span>
                <span className="text-[10px] font-bold uppercase py-1 px-2 bg-white/5 rounded border border-white/10">
                  Construction: {userWard.sourceDistribution.construction}%
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Civic Response Tracker */}
          <div className="bg-white dark:bg-[#2D525A] rounded-xl p-6 shadow-md border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00bdd6]">account_balance</span>
                <h3 className="text-xl font-bold">Civic Response</h3>
              </div>
              <span className="text-xs opacity-60">Live Updates</span>
            </div>
            <div className="space-y-4">
              {MOCK_COMPLAINTS.slice(0, 3).map((c, idx) => (
                <div key={c.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`size-2 rounded-full ${idx === 0 ? 'bg-[#00bdd6] ring-4 ring-[#00bdd6]/20' : idx === 1 ? 'bg-slate-400' : 'bg-green-400'}`}></div>
                    {idx < 2 && <div className="w-0.5 h-12 bg-white/10 mt-1"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm">{c.type}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        c.status === 'Resolved' ? 'bg-green-500/20 text-green-400' : 
                        c.status === 'Actioned' ? 'bg-[#00bdd6]/20 text-[#00bdd6]' : 
                        'bg-white/10 opacity-60'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs opacity-60 mt-1">{c.location}</p>
                    <p className="text-[10px] opacity-40 mt-2">SLA: {c.slaRemaining}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setReportData(d => ({ ...d, type: 'Fire Incident' })); setIsReporting(true); }}
              className="bg-white dark:bg-[#2D525A] p-5 rounded-xl border border-white/5 hover:border-[#00bdd6]/50 transition-all text-left flex flex-col gap-3 group"
            >
              <div className="size-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">local_fire_department</span>
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Report Burning</p>
                <p className="text-[10px] opacity-50 mt-1">Illegal waste or debris</p>
              </div>
            </button>
            
            <button 
              onClick={() => setIsAuditing(true)}
              className="bg-white dark:bg-[#2D525A] p-5 rounded-xl border border-white/5 hover:border-[#00bdd6]/50 transition-all text-left flex flex-col gap-3 group"
            >
              <div className="size-10 rounded-lg bg-[#00bdd6]/10 text-[#00bdd6] flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">volunteer_activism</span>
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Join Mission</p>
                <p className="text-[10px] opacity-50 mt-1">Clean-air taskforce</p>
              </div>
            </button>

            <button 
              onClick={onNavigateMap}
              className="bg-white dark:bg-[#2D525A] p-5 rounded-xl border border-white/5 hover:border-[#00bdd6]/50 transition-all text-left flex flex-col gap-3 group"
            >
              <div className="size-10 rounded-lg bg-[#00bdd6]/10 text-[#00bdd6] flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">map</span>
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Ward Heatmap</p>
                <p className="text-[10px] opacity-50 mt-1">Real-time density</p>
              </div>
            </button>

            <button 
              onClick={() => window.location.href = '/clean-air-credits'}
              className="bg-white dark:bg-[#2D525A] p-5 rounded-xl border border-white/5 hover:border-[#00bdd6]/50 transition-all text-left flex flex-col gap-3 group"
            >
              <div className="size-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Clean Air Credits</p>
                <p className="text-[10px] opacity-50 mt-1">Earn CAC rewards</p>
              </div>
            </button>
          </div>

          {/* Ward Map Snapshot */}
          <div className="bg-white dark:bg-[#2D525A] rounded-xl p-4 shadow-md border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Ward Map View</p>
              <span className="material-symbols-outlined text-sm opacity-60">map</span>
            </div>
            <div className="w-full h-48 rounded-lg overflow-hidden border border-white/5 relative">
              <LeafletAQIMap showChrome={false} />
              <button
                onClick={onNavigateMap}
                className="absolute top-2 right-2 bg-background-dark/70 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10 hover:border-primary/60 hover:text-primary transition-colors"
              >
                Open Full Map
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="text-[10px] opacity-60">Sensor Hotspot: {userWard.name}</p>
              <button onClick={onNavigateMap} className="text-[10px] font-bold text-[#00bdd6] hover:underline">
                Launch Map →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Metric Bar */}
      <footer className="bg-white dark:bg-[#2D525A]/40 rounded-xl p-4 flex flex-wrap gap-8 justify-between items-center text-xs border border-white/5">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#00bdd6]"></span>
            <span className="opacity-60">Population: {userWard.populationDensity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-400"></span>
            <span className="opacity-60">Priority: {userWard.priorityScore}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-yellow-400"></span>
            <span className="opacity-60">Complaints: {userWard.complaints}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-400"></span>
            <span className="opacity-60">Response Time: {userWard.responseTime}</span>
          </div>
        </div>
        <p className="opacity-40 font-medium">Last synced: Today at {new Date().toLocaleTimeString()} • System Status: Stable</p>
      </footer>
      {/* Incident Reporting Overlay */}
      {isReporting && (
        <div className="fixed inset-0 z-50 bg-background-dark/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0a0f0f] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsReporting(false)} className="absolute top-6 right-6 size-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-black uppercase tracking-tighter mb-1 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-3xl">e911_emergency</span>
              Report Incident
            </h2>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-8">Direct Line to Civil Defense</p>

            <div className="space-y-6">

              {/* Type Selection (Simplified) */}
              <div className="flex gap-3">
                {['Fire Incident', 'Waste Burning', 'Industrial'].map(type => (
                  <button
                    key={type}
                    onClick={() => setReportData(p => ({ ...p, type }))}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${reportData.type === type ? 'bg-primary text-background-dark border-primary' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Evidence Module */}
              <div className="grid grid-cols-2 gap-4">
                {/* Camera Input */}
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageCapture}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${reportData.image ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 group-hover:border-white/30'}`}>
                    {reportData.image ? (
                      <img src={reportData.image} alt="Evidence" className="h-full w-full object-cover rounded-2xl" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-3xl mb-2 text-white/50">photo_camera</span>
                        <span className="text-[9px] font-bold uppercase text-white/30">Add Evidence</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Location Input */}
                <button
                  onClick={handleLocationDetect}
                  className={`h-32 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${reportData.location ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                >
                  {reportData.location ? (
                    <>
                      <span className="material-symbols-outlined text-3xl mb-2 text-green-500">my_location</span>
                      <span className="text-[9px] font-bold uppercase text-green-500">
                        {reportData.location.lat.toFixed(4)}, {reportData.location.lng.toFixed(4)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl mb-2 text-white/50">add_location_alt</span>
                      <span className="text-[9px] font-bold uppercase text-white/30">Tag Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <div>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the incident (e.g. 'Large smoke plume visible near market area...')"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Submit Report
                    </>
                  )}
                </button>
                <p className="text-center text-[9px] text-white/30 font-bold uppercase mt-4">
                  False reporting is a punishable offense under Section 182 IPC.
                </p>
              </div>

            </div>
          </div>
        </div>
      )
      }

      {/* Citizen Audits Modal */}
      {isAuditing && (
        <div className="fixed inset-0 z-50 bg-background-dark/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0a0f0f] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsAuditing(false)} className="absolute top-6 right-6 size-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-black uppercase tracking-tighter mb-1 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
              Audit Squad
            </h2>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-8">Civic Oversight Taskforce</p>

            <div className="space-y-6">
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                <h3 className="text-lg font-bold text-white mb-2">Upcoming Mission</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-primary font-black text-2xl uppercase tracking-tighter">Waste Segregation</div>
                    <div className="text-xs text-white/50 font-bold uppercase mt-1">Saturday, 10:00 AM • Market Area</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => {
                        // Mark joined locally and award CAC (+2) - fixed action ID prevents duplicate awards
                        const actionId = 'join:WasteSegregation';
                        const res = cacService.awardCAC(2, { id: actionId, note: 'Joined mission: Waste Segregation' });
                        
                        if (res && res.ok) {
                          alert(`Joined — You earned 2 CAC! New balance: ${res.newBalance} CAC`);
                          setJoinedMission(true);
                          try { localStorage.setItem('joinedWasteSegregation', 'true'); } catch {}
                        } else if (res?.error === 'already awarded') {
                          alert('You have already joined this mission and received your CAC reward.');
                          setJoinedMission(true);
                        } else {
                          alert('Joined — Unable to award CAC: ' + (res?.error || 'Unknown error'));
                          setJoinedMission(true);
                        }
                      }}
                      disabled={joinedMission}
                      className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${joinedMission ? 'bg-white/10 text-white/60 cursor-default' : 'bg-primary text-background-dark hover:scale-105'}`}
                    >
                      {joinedMission ? 'Joined' : 'Join'}
                    </button>

                    {joinedMission && (
                      <div className="text-[10px] text-white/40 font-bold uppercase mt-2">You're registered for this mission — we'll send updates.</div>
                    )}

                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Past Audits</h4>
                <div className="space-y-3">
                  {[
                    { title: 'Construction Dust Check', status: 'Completed', score: '85%' },
                    { title: 'Park Maintenance', status: 'Pending Review', score: '-' }
                  ].map(audit => (
                    <div key={audit.title} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <div className="font-bold text-sm">{audit.title}</div>
                        <div className="text-[9px] font-bold text-white/30 uppercase">{audit.status}</div>
                      </div>
                      <div className="font-mono text-primary font-bold">{audit.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default CitizenDashboard;
