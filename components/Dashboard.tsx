
import React, { useState, useEffect } from 'react';
import { DELHI_WARDS } from '../constants';
import { WardData, SimulationResult } from '../types';
import { getPolicySimulation, getGeneralInsight } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [selectedWard, setSelectedWard] = useState<WardData>(DELHI_WARDS[0]);
  const [policyInput, setPolicyInput] = useState('');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');

  useEffect(() => {
    const fetchInsight = async () => {
      const text = await getGeneralInsight("Multi-modal winter action plan for industrial zones in NCT Delhi.");
      setInsight(text);
    };
    fetchInsight();
  }, []);

  const handleSimulate = async () => {
    if (!policyInput) return;
    setLoading(true);
    try {
      const res = await getPolicySimulation(selectedWard, policyInput);
      setSimulation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-12 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black mb-1 uppercase tracking-tight">AI Strategy & Policy Lab</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Decision-Support System powered by Historical CPCB Emission Factors</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedWard.id}
            onChange={(e) => setSelectedWard(DELHI_WARDS.find(w => w.id === e.target.value) || DELHI_WARDS[0])}
            className="bg-background-dark/50 border border-white/10 rounded-2xl px-6 py-3 text-xs font-black focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase tracking-widest shadow-2xl"
          >
            {DELHI_WARDS.map(w => (
              <option key={w.id} value={w.id}>{w.name} Jurisdiction</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intervention Input */}
        <div className="glass-panel p-10 rounded-[2.5rem] border-primary/10 shadow-xl flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
               <span className="material-symbols-outlined text-3xl">science</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Draft Policy Scenario</h3>
          </div>
          <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed">
            Specify localized parameters: Heavy-vehicle restrictions, Odd-Even permutations, Smog-Gun deployment frequency, or Industrial work-shifts.
          </p>
          <div className="space-y-6 flex-1 flex flex-col">
            <textarea 
              value={policyInput}
              onChange={(e) => setPolicyInput(e.target.value)}
              placeholder="e.g. restrict BS-IV diesel heavy vehicles in Okhla from 08:00 to 12:00..."
              className="w-full bg-background-dark/50 border border-white/10 rounded-3xl p-6 text-sm flex-1 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/10 font-medium italic min-h-[200px]"
            />
            <button 
              onClick={handleSimulate}
              disabled={loading}
              className="w-full bg-primary text-background-dark py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:shadow-[0_0_35px_rgba(21,239,235,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined">sync</span>
              ) : (
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
              )}
              {loading ? 'CALIBRATING SCENARIOS...' : 'EXECUTE SIMULATION'}
            </button>
          </div>
        </div>

        {/* Realistic Analysis Results */}
        <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden border-white/5 shadow-2xl flex flex-col justify-center">
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-xl font-black uppercase tracking-tight">Impact Estimation</h3>
             {simulation && <div className="text-[10px] font-black text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">CONFIDENCE: {simulation.confidenceRange}</div>}
          </div>
          {simulation ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] text-center">
                  <span className="text-[10px] uppercase font-black text-primary/60 block mb-3 tracking-[0.2em]">Projected AQI Drop</span>
                  <div className="text-6xl font-black text-primary tracking-tighter">-{simulation.projectedAqiReduction}%</div>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] text-center border border-white/10">
                  <span className="text-[10px] uppercase font-black text-white/30 block mb-3 tracking-[0.2em]">Feasibility (0-100)</span>
                  <div className="text-6xl font-black text-white tracking-tighter">{simulation.feasibility}</div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-black text-white/40 uppercase mb-3 tracking-widest border-b border-white/5 pb-2">Economic Friction</h4>
                    <p className="text-xs font-bold leading-relaxed">{simulation.economicImpact}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-white/40 uppercase mb-3 tracking-widest border-b border-white/5 pb-2">Equity Assessment</h4>
                    <p className="text-xs font-bold leading-relaxed">{simulation.socialEquityImpact || "Minimal impact on high-vulnerability population clusters expected."}</p>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                   <h4 className="text-[10px] font-black text-white/40 uppercase mb-3 tracking-widest">Decision Support Context</h4>
                   <p className="text-xs text-white/70 italic leading-relaxed">
                      "{simulation.detailedAnalysis}"
                   </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="size-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5 animate-pulse">
                 <span className="material-symbols-outlined text-5xl text-white/20">analytics</span>
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-white/20">Awaiting Simulation Parameters</p>
            </div>
          )}
        </div>
      </div>

      {/* Outcome Accountability Banner */}
      <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/20 relative group overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
           <span className="material-symbols-outlined text-[12rem] text-primary">psychology</span>
        </div>
        <div className="relative z-10">
           <h4 className="text-[10px] font-black uppercase text-primary mb-5 flex items-center gap-3 tracking-[0.2em]">
             <span className="material-symbols-outlined text-xl">auto_awesome</span>
             NCT Strategic Intelligence Summary
           </h4>
           <p className="text-2xl leading-relaxed text-white font-black tracking-tight max-w-5xl">
             {insight || "Synthesizing localized emission profiles with current meteorological drift..."}
           </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
