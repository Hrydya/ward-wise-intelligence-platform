import React, { useState } from 'react';

interface WardActionRecommendationsProps {
  wardName: string;
  priorityScore: number;
  recommendedActions: string[];
  status: string;
}

const WardActionRecommendations: React.FC<WardActionRecommendationsProps> = ({
  wardName,
  priorityScore,
  recommendedActions,
  status
}) => {
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());

  const urgencyLevel = priorityScore > 85 ? 'CRITICAL' : priorityScore > 70 ? 'SEVERE' : priorityScore > 50 ? 'MODERATE' : 'LOW';
  const urgencyColor =
    urgencyLevel === 'CRITICAL'
      ? 'bg-red-500/20 border-red-500/40 text-red-400'
      : urgencyLevel === 'SEVERE'
        ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
        : urgencyLevel === 'MODERATE'
          ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
          : 'bg-green-500/20 border-green-500/40 text-green-400';

  const actionDetails: Record<string, { dept: string; timeline: string; sla: string; effort: string }> = {
    'Restrict construction activities (48 hrs emergency ban)': {
      dept: 'MCD / DPCC',
      timeline: 'Immediate',
      sla: '30 min to issue notice',
      effort: 'High impact'
    },
    'Deploy dust suppression trucks on Ring Road': {
      dept: 'MCD Dust Squad',
      timeline: '1 hour',
      sla: '2 trucks per 5 km',
      effort: '₹8,000/day per truck'
    },
    'Traffic diversion during peak hours (7-10 AM)': {
      dept: 'Traffic Police / DCP',
      timeline: '2-4 hours',
      sla: '3 alternate routes mapped',
      effort: 'Coordination heavy'
    },
    'Coordinate with ISBT for vehicle staging area relocation': {
      dept: 'ISBT Authority / DTC',
      timeline: '24 hours',
      sla: 'Staging area shift',
      effort: 'Policy-level'
    },
    'Intensify metro construction dust management': {
      dept: 'DMRC / MCD',
      timeline: '6 hours',
      sla: 'Increase spray cycles',
      effort: 'Ongoing'
    },
    'Deploy air quality monitors at metro pillar sites': {
      dept: 'MCD / DPCC',
      timeline: '48 hours',
      sla: '8 new monitors',
      effort: '₹50,000 per monitor'
    },
    'Issue industrial emission violation notices (Plot 418 Zone B)': {
      dept: 'DPCC',
      timeline: '4 hours',
      sla: 'NOC issued',
      effort: 'Legal'
    },
    'Mandate chimney stack inspections this week': {
      dept: 'DPCC Inspection Team',
      timeline: '5 days',
      sla: '12 units',
      effort: 'High manpower'
    },
    'Restrict heavy transport during 6-9 AM (peak hours)': {
      dept: 'Traffic Police',
      timeline: 'Immediate',
      sla: 'Alternate timing enforced',
      effort: 'Enforcement-heavy'
    },
    'Continue routine monitoring': {
      dept: 'Routine',
      timeline: 'Ongoing',
      sla: 'Status: Good',
      effort: 'Low'
    },
    'Maintain traffic flow management': {
      dept: 'Routine',
      timeline: 'Ongoing',
      sla: 'Status: Managed',
      effort: 'Low'
    }
  };

  const toggleAction = (idx: number) => {
    const newSet = new Set(expandedActions);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setExpandedActions(newSet);
  };

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white">Action Recommendations</h4>
          <p className="text-[10px] text-white/50 mt-1">Decision-support recommendations for {wardName}</p>
        </div>
        <div className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${urgencyColor}`}>
          {urgencyLevel}
        </div>
      </div>

      <div className="bg-white/5 border border-primary/20 rounded-lg p-3 text-[10px] text-white/70 flex gap-2">
        <span className="material-symbols-outlined text-sm text-primary flex-shrink-0 mt-0.5">
          info
        </span>
        <span>
          <strong className="text-primary">Disclaimer:</strong> These are indicative recommendations based on current data patterns and historical precedent. Final decisions rest with policy authorities.
        </span>
      </div>

      <div className="space-y-3">
        {recommendedActions.map((action, idx) => {
          const details = actionDetails[action] || { dept: 'TBD', timeline: 'TBD', sla: 'TBD', effort: 'TBD' };
          const isExpanded = expandedActions.has(idx);

          return (
            <div
              key={idx}
              onClick={() => toggleAction(idx)}
              className="border border-white/10 rounded-lg overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="bg-white/5 group-hover:bg-white/10 p-4 flex items-start justify-between transition-colors">
                <div className="flex gap-3 flex-1">
                  <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${idx < 2 ? 'bg-red-500/20 text-red-400' : idx < 4 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-white/60'}`}>
                    <span className="text-xs font-black">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{action}</p>
                    <p className="text-[10px] text-white/50 mt-1">
                      Lead: <strong className="text-primary">{details.dept}</strong> • Timeline: {details.timeline}
                    </p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>

              {isExpanded && (
                <div className="bg-background-dark/50 border-t border-white/5 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div>
                      <p className="text-white/50 font-bold uppercase">SLA Target</p>
                      <p className="text-white mt-1">{details.sla}</p>
                    </div>
                    <div>
                      <p className="text-white/50 font-bold uppercase">Resource Impact</p>
                      <p className="text-white mt-1">{details.effort}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/70">
                      <strong>Implementation note:</strong> Coordinate with {details.dept} for enforcement. Priority assignment recommended for rapid deployment.
                    </p>
                  </div>
                  <button className="w-full bg-primary text-background-dark text-[10px] font-black py-2 rounded-lg hover:brightness-110 transition-all uppercase tracking-wide">
                    Assign to {details.dept.split('/')[0]}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-2">
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide">Quick Stats</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-black text-primary">{recommendedActions.length}</p>
            <p className="text-[10px] text-white/50">Actions</p>
          </div>
          <div>
            <p className="text-lg font-black text-orange-400">{Math.ceil(recommendedActions.length / 2)}</p>
            <p className="text-[10px] text-white/50">Urgent</p>
          </div>
          <div>
            <p className="text-lg font-black text-primary">Est. 24h</p>
            <p className="text-[10px] text-white/50">Timeline</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardActionRecommendations;
