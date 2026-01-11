import React from 'react';
import { AuthorityRole } from '../types';

interface AuthorityRolePickerProps {
  onSelect: (role: AuthorityRole) => void;
  onBack?: () => void;
}

const ROLES: Array<{ id: AuthorityRole; title: string; subtitle: string; icon: string; badge: string; details: string }> = [
  {
    id: 'EXECUTIVE',
    title: 'Executive Command',
    subtitle: 'Senior Decision Makers',
    icon: 'military_tech',
    badge: 'Policy & Mandates',
    details: 'City-wide directives, outcome dashboards, and mandate approvals.'
  },
  {
    id: 'OPERATIONAL',
    title: 'Operational Control',
    subtitle: 'Department Heads',
    icon: 'settings_suggest',
    badge: 'SLA & Response',
    details: 'Cross-department tasking, SLA tracking, and rapid incident triage.'
  },
  {
    id: 'FIELD',
    title: 'Field Enforcement',
    subtitle: 'Enforcement Officers',
    icon: 'shield_person',
    badge: 'On-Ground Actions',
    details: 'Mobile-first enforcement, evidence capture, and live incident queues.'
  },
  {
    id: 'ANALYTICS',
    title: 'Analytics Lab',
    subtitle: 'Data Analysts',
    icon: 'query_stats',
    badge: 'Models & QA',
    details: 'Sensor QA, anomaly hunts, and ML model performance telemetry.'
  }
];

const AuthorityRolePicker: React.FC<AuthorityRolePickerProps> = ({ onSelect, onBack }) => {
  return (
    <div className="flex-1 p-6 lg:p-12 bg-background-dark/40 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-2">Authority Access</p>
            <h1 className="text-4xl font-black tracking-tight">Choose your command lane</h1>
            <p className="text-white/50 text-sm mt-2">Select the workspace that matches your role. Each lane loads a tailored control room.</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="border border-white/10 hover:border-primary/60 text-white/70 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all p-5 text-left flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-xl bg-white/5 text-white flex items-center justify-center group-hover:bg-primary group-hover:text-background-dark transition-colors">
                  <span className="material-symbols-outlined text-2xl">{role.icon}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/70 px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-background-dark transition-colors">
                  {role.badge}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight">{role.title}</h3>
                <p className="text-white/40 text-sm font-semibold">{role.subtitle}</p>
              </div>
              <p className="text-sm text-white/60 leading-relaxed flex-1">{role.details}</p>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-sm">login</span>
                Enter workspace
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorityRolePicker;
