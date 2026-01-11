import React, { useState } from 'react';
import { MOCK_COMPLAINTS } from '../constants';

interface ComplaintTrackerProps {
  wardName?: string;
}

const ComplaintTracker: React.FC<ComplaintTrackerProps> = ({ wardName }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const complaints = wardName ? MOCK_COMPLAINTS.filter(c => c.ward === wardName) : MOCK_COMPLAINTS;

  const statusColors: Record<string, string> = {
    'Reported': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    'Assigned': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'Actioned': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    'Resolved': 'bg-green-500/20 text-green-400 border-green-500/40'
  };

  const intensityIcons: Record<string, string> = {
    'Low': 'signal_cellular_1_bar',
    'Medium': 'signal_cellular_2_bar',
    'High': 'signal_cellular_3_bar'
  };

  // Calculate metrics
  const activeComplaints = complaints.filter(c => c.status !== 'Resolved').length;
  const avgSla = complaints.filter(c => c.slaRemaining !== 'Resolved').length > 0
    ? complaints
        .filter(c => c.slaRemaining !== 'Resolved')
        .reduce((sum, c) => {
          const hours = parseInt(c.slaRemaining);
          return sum + (isNaN(hours) ? 24 : hours);
        }, 0) / complaints.filter(c => c.slaRemaining !== 'Resolved').length
    : 0;

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-white">Enforcement & Complaint Tracker</h4>
        <p className="text-[10px] text-white/50 mt-1">
          {wardName ? `Active cases in ${wardName}` : 'All wards overview'}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
          <p className="text-[10px] text-white/50 font-bold uppercase">Active Complaints</p>
          <p className="text-lg font-black text-orange-400 mt-1">{activeComplaints}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
          <p className="text-[10px] text-white/50 font-bold uppercase">Avg SLA Time</p>
          <p className="text-lg font-black text-primary mt-1">{avgSla.toFixed(1)}h</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
          <p className="text-[10px] text-white/50 font-bold uppercase">Resolution Rate</p>
          <p className="text-lg font-black text-green-400 mt-1">
            {complaints.length > 0
              ? Math.round(
                  (complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100
                )
              : 0}%
          </p>
        </div>
      </div>

      {/* Complaint List */}
      <div className="space-y-2">
        {complaints.map((complaint) => {
          const isExpanded = expandedId === complaint.id;
          const daysAgo = complaint.timestamp === 'Yesterday' ? 1 : 0;

          return (
            <div
              key={complaint.id}
              onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
              className="border border-white/10 rounded-lg overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="bg-white/5 group-hover:bg-white/10 p-4 flex items-start justify-between transition-colors">
                <div className="flex gap-3 flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-white/50">
                      {complaint.type === 'Waste Burning'
                        ? 'local_fire_department'
                        : complaint.type === 'Construction Dust'
                          ? 'construction'
                          : 'factory'}
                    </span>
                    <div className="size-2 rounded-full bg-white/20"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white">{complaint.type}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${statusColors[complaint.status]}`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50">{complaint.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-[9px] text-white/40 font-bold uppercase">
                      <span>Reported: {complaint.timestamp}</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                        {complaint.intensity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-black uppercase ${
                      complaint.slaRemaining === 'Resolved' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {complaint.slaRemaining}
                  </span>
                  <span className="text-[9px] text-white/40">SLA</span>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-background-dark/50 border-t border-white/5 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div>
                      <p className="text-white/50 font-bold uppercase mb-1">Responsible Department</p>
                      <p className="text-white font-semibold">{complaint.responsibleDept}</p>
                    </div>
                    <div>
                      <p className="text-white/50 font-bold uppercase mb-1">SLA Deadline</p>
                      <p className={`font-semibold ${complaint.slaRemaining === 'Resolved' ? 'text-green-400' : 'text-orange-400'}`}>
                        {complaint.slaRemaining}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/70">
                      <strong className="text-primary">Case ID:</strong> {complaint.id} • <strong className="text-primary">Ward:</strong> {complaint.ward}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary text-background-dark text-[10px] font-black py-2 rounded-lg hover:brightness-110 transition-all uppercase tracking-wide">
                      Update Status
                    </button>
                    <button className="flex-1 bg-white/10 text-white/70 text-[10px] font-black py-2 rounded-lg hover:bg-white/20 transition-all uppercase tracking-wide">
                      View Evidence
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {complaints.length === 0 && (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-white/30 block mb-2">
            check_circle
          </span>
          <p className="text-[10px] text-white/50 font-bold uppercase">No active complaints</p>
        </div>
      )}
    </div>
  );
};

export default ComplaintTracker;
