import React, { useState } from 'react';

interface DataConfidenceLayerProps {
  wardName: string;
  sensorCoverage: number;
  dataConfidence: 'Low' | 'Medium' | 'High';
  dataSource: 'sensor' | 'estimated';
  lastUpdated: string;
  aqi: number;
}

const DataConfidenceLayer: React.FC<DataConfidenceLayerProps> = ({
  wardName,
  sensorCoverage,
  dataConfidence,
  dataSource,
  lastUpdated,
  aqi
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const confidenceColor =
    dataConfidence === 'High' ? 'text-green-400' : dataConfidence === 'Medium' ? 'text-yellow-400' : 'text-red-400';
  const confidenceBg =
    dataConfidence === 'High'
      ? 'bg-green-500/20 border-green-500/40'
      : dataConfidence === 'Medium'
        ? 'bg-yellow-500/20 border-yellow-500/40'
        : 'bg-red-500/20 border-red-500/40';

  const borderStyle = dataSource === 'sensor' ? 'solid' : 'dashed';
  const borderDescription = dataSource === 'sensor' ? 'Sensor-backed data' : 'Estimated (satellite/patterns)';

  return (
    <div className={`rounded-xl p-6 border-2 ${borderStyle} border-white/20`} style={{ borderStyle }}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white">Data Confidence & Sources</h4>
            <p className="text-[10px] text-white/50 mt-1">For {wardName}</p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-bold text-primary hover:underline"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${confidenceBg} ${confidenceColor}`}>
            <span className="material-symbols-outlined text-sm">
              {dataConfidence === 'High' ? 'check_circle' : dataConfidence === 'Medium' ? 'help' : 'warning'}
            </span>
            Confidence: {dataConfidence}
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-black uppercase tracking-wider flex items-center gap-2 bg-white/5 text-white/70">
            <span className="material-symbols-outlined text-sm">
              {dataSource === 'sensor' ? 'sensors' : 'cloud_queue'}
            </span>
            {borderDescription}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[10px] text-white/50 font-bold uppercase">Sensor Coverage</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-lg font-black text-primary">{sensorCoverage}%</p>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${sensorCoverage}%` }}></div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[10px] text-white/50 font-bold uppercase">Last Updated</p>
            <p className="text-sm font-black text-white mt-2">{lastUpdated}</p>
          </div>
        </div>

        {/* Data Quality Indicator */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-[10px] font-bold text-white/70 uppercase">Data Quality Assessment</p>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">
            This ward's AQI reading is based on a combination of <strong>{sensorCoverage}% active sensor coverage</strong> and <strong>{100 - sensorCoverage}% estimated data</strong> (derived from satellite imagery, traffic patterns, and historical baselines).
            The confidence level <strong className={`${confidenceColor}`}>{dataConfidence}</strong> reflects both the sensor density and model accuracy.
          </p>
        </div>

        {showDetails && (
          <div className="space-y-4 border-t border-white/10 pt-4 animate-in fade-in duration-200">
            {/* Detailed Breakdown */}
            <div className="space-y-3">
              <p className="text-xs font-black text-white/70 uppercase tracking-wide">Sensor Network Details</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-white/60">Active Monitors</span>
                  <span className="font-black text-primary">{Math.ceil((sensorCoverage / 100) * 15)} / 15</span>
                </div>
                <div className="flex justify-between text-[10px] bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-white/60">Average Refresh Rate</span>
                  <span className="font-black text-white">15 minutes</span>
                </div>
                <div className="flex justify-between text-[10px] bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-white/60">Data Redundancy</span>
                  <span className={`font-black ${dataConfidence === 'High' ? 'text-green-400' : dataConfidence === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {dataConfidence === 'High' ? 'Triple-checked' : dataConfidence === 'Medium' ? 'Double-checked' : 'Single source'}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="space-y-3">
              <p className="text-xs font-black text-white/70 uppercase tracking-wide">Contributing Data Sources</p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                  <span className="material-symbols-outlined text-green-400 flex-shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <p className="text-[10px] font-bold text-white">Ground Sensors (CPCB Network)</p>
                    <p className="text-[10px] text-white/50">12 operational units, 15-min intervals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
                  <span className="material-symbols-outlined text-yellow-400 flex-shrink-0 mt-0.5">satellite</span>
                  <div>
                    <p className="text-[10px] font-bold text-white">Satellite Data (Sentinel-5P)</p>
                    <p className="text-[10px] text-white/50">2-3 hour latency, {100 - sensorCoverage}% coverage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                  <span className="material-symbols-outlined text-blue-400 flex-shrink-0 mt-0.5">traffic</span>
                  <div>
                    <p className="text-[10px] font-bold text-white">Traffic & Mobility Data</p>
                    <p className="text-[10px] text-white/50">Google Maps API, Inrix, local sensors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Uncertainty Estimate */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400">warning</span>
                <p className="text-xs font-black text-white/70 uppercase">Estimated Uncertainty</p>
              </div>
              <p className="text-[10px] text-white/60">
                <strong className="text-orange-400">±{dataConfidence === 'High' ? '5%' : dataConfidence === 'Medium' ? '12%' : '25%'}</strong> AQI range at 95% confidence level
              </p>
              <div className="text-[10px] text-white/50 mt-2">
                This means the actual AQI is likely between <strong>{aqi - (dataConfidence === 'High' ? 5 : dataConfidence === 'Medium' ? 12 : 25)}</strong> and <strong>{aqi + (dataConfidence === 'High' ? 5 : dataConfidence === 'Medium' ? 12 : 25)}</strong>
              </div>
            </div>

            {/* Next Update */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
              <p className="text-[10px] text-white/50 font-bold uppercase">Next Scheduled Update</p>
              <p className="text-sm font-black text-primary mt-1">in ~10 minutes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataConfidenceLayer;
