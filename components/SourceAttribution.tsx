import React, { useState } from 'react';

interface SourceAttributionProps {
  wardName: string;
  sourceDistribution: {
    industrial: number;
    vehicular: number;
    construction: number;
    biomass: number;
  };
}

const SourceAttribution: React.FC<SourceAttributionProps> = ({ wardName, sourceDistribution }) => {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  const sources = [
    {
      name: 'Vehicular Traffic',
      value: sourceDistribution.vehicular,
      icon: 'directions_car',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/40',
      tips: [
        'High traffic congestion during 7-10 AM & 5-8 PM',
        'Heavy vehicles contribute 35% of traffic emissions',
        'Idling at signals adds 2-3 AQI points'
      ]
    },
    {
      name: 'Industrial Emissions',
      value: sourceDistribution.industrial,
      icon: 'factory',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/40',
      tips: [
        'Chimney stack violations detected (avg height: 18m)',
        '12 units operating without emission permits',
        'Bypass behavior during peak hours: 3-5 PM'
      ]
    },
    {
      name: 'Construction Dust',
      value: sourceDistribution.construction,
      icon: 'construction',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/40',
      tips: [
        'Metro pillar work: ongoing (Phase 2)',
        'Road construction on 3 arterial roads',
        'Dust suppression inadequate at 2 sites'
      ]
    },
    {
      name: 'Waste Burning',
      value: sourceDistribution.biomass,
      icon: 'local_fire_department',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      tips: [
        'Backyard burning reported 4x this week',
        'Peak times: 6-8 AM, 6-9 PM',
        'High probability: seasonal disposal'
      ]
    }
  ];

  const totalValue = Object.values(sourceDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-6">
      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">Source Attribution</h4>
        <p className="text-[10px] text-white/50 mb-4">
          <span className="text-primary">Indicative, not measured</span> — Based on sensor patterns + satellite + complaints
        </p>
      </div>

      <div className="space-y-3">
        {sources.map((source) => {
          const percentage = (source.value / totalValue) * 100;
          const isHovered = hoveredSource === source.name;

          return (
            <div
              key={source.name}
              onMouseEnter={() => setHoveredSource(source.name)}
              onMouseLeave={() => setHoveredSource(null)}
              className={`space-y-2 p-3 rounded-lg border transition-all ${isHovered ? source.borderColor + ' ' + source.bgColor : 'border-white/5'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-lg ${source.color}`}>
                    {source.icon}
                  </span>
                  <span className="text-sm font-bold text-white">{source.name}</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black ${source.color}`}>{source.value}%</span>
                  <p className="text-[10px] text-white/40">{percentage.toFixed(0)}% of total</p>
                </div>
              </div>

              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${source.bgColor.replace('/20', '')}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {isHovered && (
                <div className="bg-background-dark/80 rounded-lg p-3 border border-white/10 space-y-1 animate-in fade-in duration-200">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide">Key Indicators:</p>
                  {source.tips.map((tip, idx) => (
                    <div key={idx} className="flex gap-2 text-[11px] text-white/60">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-[10px] text-white/50 leading-relaxed">
          <strong className="text-primary">Confidence Level:</strong> Medium-High for this ward.
          Primary source (Vehicular) is well-covered by sensors. Industrial emissions estimated via satellite + traffic pattern correlation. Construction dust based on active site reports.
        </p>
      </div>
    </div>
  );
};

export default SourceAttribution;
