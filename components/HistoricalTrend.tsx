import React, { useState } from 'react';

interface HistoricalTrendProps {
  wardName: string;
  trendHistory: { timestamp: string; aqi: number }[];
  status: string;
  outcomeTrend: 'Success' | 'Stable' | 'Worsening';
}

const HistoricalTrend: React.FC<HistoricalTrendProps> = ({
  wardName,
  trendHistory,
  status,
  outcomeTrend
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');

  // Simulate extended trend data for 7d view
  const extendedTrend = [
    { timestamp: '24h ago', aqi: 320 },
    { timestamp: '18h ago', aqi: 340 },
    { timestamp: '12h ago', aqi: 360 },
    { timestamp: '6h ago', aqi: 385 },
    ...trendHistory
  ];

  const displayTrend = timeRange === '24h' ? trendHistory : extendedTrend;
  const minAqi = Math.min(...displayTrend.map(d => d.aqi));
  const maxAqi = Math.max(...displayTrend.map(d => d.aqi));
  const range = maxAqi - minAqi;

  const trendColor =
    outcomeTrend === 'Success' ? 'text-green-400' : outcomeTrend === 'Worsening' ? 'text-red-400' : 'text-white/60';
  const trendIcon =
    outcomeTrend === 'Success' ? 'trending_down' : outcomeTrend === 'Worsening' ? 'trending_up' : 'trending_flat';

  // Calculate trend percentage
  const firstAqi = displayTrend[0].aqi;
  const lastAqi = displayTrend[displayTrend.length - 1].aqi;
  const trendPercentage = ((lastAqi - firstAqi) / firstAqi) * 100;

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white">Historical Trend</h4>
          <p className="text-[10px] text-white/50 mt-1">AQI progression for {wardName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-lg ${trendColor}`}>
            {trendIcon}
          </span>
          <span className={`text-sm font-black uppercase ${trendColor}`}>
            {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('24h')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
            timeRange === '24h'
              ? 'bg-primary text-background-dark'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          24h
        </button>
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
            timeRange === '7d'
              ? 'bg-primary text-background-dark'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          7d
        </button>
      </div>

      {/* Line Chart */}
      <div className="space-y-3">
        <div className="relative h-48 bg-white/5 rounded-lg border border-white/10 p-4">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0 border-t border-white/5"
              style={{ top: `${pct}%` }}
            ></div>
          ))}

          {/* SVG Line Chart */}
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
            <polyline
              points={displayTrend
                .map((point, idx) => {
                  const x = (idx / (displayTrend.length - 1)) * (100 - 8) + 4;
                  const y = 100 - ((point.aqi - minAqi) / range) * 100;
                  return `${x}% ${y}%`;
                })
                .join(' ')}
              fill="none"
              stroke="rgb(21, 239, 235)"
              strokeWidth="2"
            />
          </svg>

          {/* Data points */}
          {displayTrend.map((point, idx) => (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${(idx / (displayTrend.length - 1)) * 100}%`,
                top: `${100 - ((point.aqi - minAqi) / range) * 100}%`
              }}
            >
              <div className="size-3 bg-primary rounded-full border-2 border-background-dark"></div>
              <div className="hidden group-hover:block absolute -top-8 -left-12 bg-background-dark border border-primary rounded-lg px-2 py-1 text-xs font-bold text-white whitespace-nowrap z-10">
                {point.aqi} <span className="text-primary">AQI</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-between text-[10px] text-white/50">
          <span>0 min</span>
          <span className="absolute left-1/2 -translate-x-1/2">Time →</span>
          <span>{timeRange}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
          <p className="text-[10px] text-white/50 font-bold uppercase">Peak</p>
          <p className="text-lg font-black text-red-400 mt-1">{maxAqi}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
          <p className="text-[10px] text-white/50 font-bold uppercase">Average</p>
          <p className="text-lg font-black text-primary mt-1">
            {Math.round(displayTrend.reduce((a, b) => a + b.aqi, 0) / displayTrend.length)}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
          <p className="text-[10px] text-white/50 font-bold uppercase">Current</p>
          <p className="text-lg font-black text-yellow-400 mt-1">{lastAqi}</p>
        </div>
      </div>

      {/* Insight */}
      <div className={`rounded-lg p-4 border ${outcomeTrend === 'Success' ? 'bg-green-500/10 border-green-500/30' : outcomeTrend === 'Worsening' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-lg flex-shrink-0">
            {outcomeTrend === 'Success' ? 'thumb_up' : outcomeTrend === 'Worsening' ? 'thumb_down' : 'remove'}
          </span>
          <div>
            <p className="text-xs font-bold text-white uppercase">Trend Analysis</p>
            <p className="text-[10px] text-white/70 mt-1">
              {outcomeTrend === 'Success'
                ? 'AQI improving. Recent interventions showing positive impact.'
                : outcomeTrend === 'Worsening'
                  ? 'AQI worsening. Escalation required. Current measures insufficient.'
                  : 'AQI stable. Continue current interventions and monitor.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrend;
