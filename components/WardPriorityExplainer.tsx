import React, { useState } from 'react';

interface WardPriorityExplainerProps {
  wardName: string;
  aqi: number;
  priorityScore: number;
  populationDensity: string;
  dataConfidence: 'Low' | 'Medium' | 'High';
  sensorCoverage: number;
  aqiDuration: string;
  whyToday: string;
}

const WardPriorityExplainer: React.FC<WardPriorityExplainerProps> = ({
  wardName,
  aqi,
  priorityScore,
  populationDensity,
  dataConfidence,
  sensorCoverage,
  aqiDuration,
  whyToday
}) => {
  const [showFormula, setShowFormula] = useState(false);

  // Calculate contributions (for transparency)
  const aqiWeight = (aqi / 500) * 40; // AQI is 40% of score
  const durationWeight = Math.min((parseInt(aqiDuration) / 24) * 30, 30); // Duration is 30%
  const populationWeight = populationDensity === 'High' ? 20 : populationDensity === 'Medium' ? 10 : 0; // Population is 20%
  const confidenceWeight = dataConfidence === 'High' ? 10 : dataConfidence === 'Medium' ? 5 : 0; // Confidence is 10%

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white">Priority Score Breakdown</h4>
          <p className="text-[10px] text-white/50 mt-1">Transparent calculation for {wardName}</p>
        </div>
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="text-xs font-bold text-primary hover:underline"
        >
          {showFormula ? 'Hide' : 'Show'} Formula
        </button>
      </div>

      {showFormula && (
        <div className="bg-white/5 rounded-lg p-4 border border-primary/20 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/70">AQI Severity (40%)</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${aqiWeight}%` }}></div>
                </div>
                <span className="font-black text-white/80 min-w-8">{aqiWeight.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/70">Duration of High AQI (30%)</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${durationWeight}%` }}></div>
                </div>
                <span className="font-black text-white/80 min-w-8">{durationWeight.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/70">Population Density (20%)</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${populationWeight}%` }}></div>
                </div>
                <span className="font-black text-white/80 min-w-8">{populationWeight.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/70">Data Confidence (10%)</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${confidenceWeight}%` }}></div>
                </div>
                <span className="font-black text-white/80 min-w-8">{confidenceWeight.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="text-[10px] font-black text-white/80">COMPOSITE PRIORITY SCORE</span>
            <span className="text-lg font-black text-primary">{priorityScore}</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="material-symbols-outlined text-sm text-primary">info</span>
          <span className="text-white/70">{whyToday}</span>
        </div>
      </div>
    </div>
  );
};

export default WardPriorityExplainer;
