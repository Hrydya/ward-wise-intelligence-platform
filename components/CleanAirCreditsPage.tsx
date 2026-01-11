import React from 'react';
import { ViewMode } from '../types';

interface CleanAirCreditsPageProps {
  onNavigate?: (mode: ViewMode) => void;
}

const CleanAirCreditsPage: React.FC<CleanAirCreditsPageProps> = ({ onNavigate }) => {
  const handleStartCTA = () => {
    if (onNavigate) {
      onNavigate(ViewMode.LOGIN);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-background-dark via-[#0a1615] to-background-dark min-h-screen p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-block">
            <div className="size-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-5xl text-green-400">eco</span>
            </div>
          </div>
          
          <h1 className="text-6xl font-black tracking-tighter uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500">
              Clean Air Credits
            </span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Reward citizens for verified actions that help reduce pollution in Delhi — like reporting sources or joining local clean-air missions.
          </p>
          
          <p className="text-lg text-green-400 font-semibold">
            Think of CAC as proof that you did something for cleaner air.
          </p>
        </div>

        {/* How It Works */}
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-widest text-white mb-2">How It Works</h2>
            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">10-Second Flow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Act', 'Verify', 'Earn', 'Impact'].map((step, idx) => (
              <div key={step} className="relative">
                <div className="glass-panel p-8 rounded-[2rem] text-center border-green-500/20 hover:border-green-500/40 transition-all">
                  <div className="size-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-black text-green-400">{idx + 1}</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-green-400">{step}</h3>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <span className="material-symbols-outlined text-green-500/40 text-3xl">arrow_forward</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions & Rewards */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold uppercase tracking-widest text-white mb-2">Verified Actions</h2>
            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Simple. Transparent. No spam rewards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-10 rounded-[2rem] border-primary/20 hover:border-primary/40 transition-all group">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl text-primary">photo_camera</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-3">Report Pollution</h3>
              <p className="text-white/70 mb-4">Document pollution sources with photographic evidence and precise location data.</p>
              <div className="pt-6 border-t border-white/10">
                <span className="text-sm font-bold text-primary uppercase tracking-widest">+3 CAC per report</span>
              </div>
            </div>

            <div className="glass-panel p-10 rounded-[2rem] border-primary/20 hover:border-primary/40 transition-all group">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl text-primary">group</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-3">Join Mission</h3>
              <p className="text-white/70 mb-4">Participate in organized, verified local clean-air initiatives and community drives.</p>
              <div className="pt-6 border-t border-white/10">
                <span className="text-sm font-bold text-primary uppercase tracking-widest">+2 CAC per mission</span>
              </div>
            </div>

            <div className="glass-panel p-10 rounded-[2rem] border-primary/20 hover:border-primary/40 transition-all group">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl text-primary">verified</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-3">Verified & Safe</h3>
              <p className="text-white/70 mb-4">Every action is verified and de-duplicated. One reward per legitimate contribution.</p>
              <div className="pt-6 border-t border-white/10">
                <span className="text-sm font-bold text-primary uppercase tracking-widest">Anti-fraud checks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Equivalence */}
        <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/20 rounded-[2.5rem] p-12 text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Clean Energy Impact</h2>
          <div className="flex items-center justify-center gap-6">
            <div className="text-5xl font-black text-green-400">15 CAC</div>
            <div className="text-2xl text-white/50">=</div>
            <div>
              <p className="text-3xl font-black text-green-400">1 kWh</p>
              <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Clean Energy Equivalent</p>
            </div>
          </div>
          <p className="text-white/60 mt-8 max-w-xl mx-auto">
            Your verified actions translate directly into measurable clean air impact — tracked at the ward level to show real change where it matters.
          </p>
        </div>

        {/* Why This Matters */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold uppercase tracking-widest text-white mb-2">Ward-Level Impact</h2>
            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">See Your Action Drive Real Change</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'location_on', title: 'Hyper-Local', desc: 'Pollution tracked ward-by-ward, not city-wide' },
              { icon: 'trending_up', title: 'Trackable Impact', desc: 'Your credits link to your ward\'s AQI improvements' },
              { icon: 'workspace_premium', title: 'Real Accountability', desc: 'See where action is happening — and where it\'s needed most' },
            ].map((item, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-[2rem] border-white/10 hover:border-primary/30 transition-all">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                </div>
                <h3 className="font-black uppercase tracking-widest mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 p-10">
            <span className="material-symbols-outlined text-[12rem]">stars</span>
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Ready to Make a Difference?</h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Earn your first Clean Air Credit in under 2 minutes. Sign up, verify, and start contributing to cleaner air in Delhi.
            </p>
            
            <button
              onClick={handleStartCTA}
              className="inline-block bg-primary hover:bg-primary/80 text-background-dark font-black uppercase tracking-widest px-12 py-4 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(21,239,235,0.3)]"
            >
              <span className="flex items-center gap-3 justify-center">
                <span>Start Earning Credits</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="glass-panel p-8 rounded-[2rem] border-white/10">
          <div className="flex items-start gap-4">
            <div className="size-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="material-symbols-outlined text-sm text-green-400">lock</span>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-widest mb-2">Fair & Abuse-Safe</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>✓ One reward per verified action</li>
                <li>✓ Location & time verification checks</li>
                <li>✓ No fake or duplicate reports accepted</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CleanAirCreditsPage;
