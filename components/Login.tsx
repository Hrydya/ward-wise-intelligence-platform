
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { detectUserWard, storeUserWard } from '../services/locationService';

interface LoginProps {
  onSelectRole: (role: UserRole) => void;
  onLocationDetected?: (wardName: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSelectRole, onLocationDetected }) => {
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [selected, setSelected] = useState<UserRole>(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Auto-detect location when component mounts
    handleDetectLocation();
  }, []);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationStatus('Detecting your location...');
    
    const ward = await detectUserWard();
    
    if (ward) {
      storeUserWard(ward);
      setLocationStatus(`📍 Detected: ${ward.name}`);
      if (onLocationDetected) {
        onLocationDetected(ward.name);
      }
    } else {
      setLocationStatus('⚠️ Location detection failed. Using default ward.');
    }
    
    setDetectingLocation(false);
  };

  const handleAction = (e: React.MouseEvent, role: UserRole) => {
    e.stopPropagation(); // Prevent card re-selection
    onSelectRole(role);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-background-dark/30 animate-in fade-in duration-700">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4 tracking-tight">Decide for Delhi.</h2>
          <p className="text-white/40 text-lg font-medium">Choose your portal to begin monitoring and action.</p>
        </div>
        
        {locationStatus && (
          <div className={`mb-8 p-4 rounded-xl border text-sm font-medium text-center ${locationStatus.includes('Detected') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
            {locationStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Citizen Card */}
          <div 
            onClick={() => setSelected('CITIZEN')}
            className={`group cursor-pointer glass-panel p-10 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${selected === 'CITIZEN' ? 'border-primary shadow-[0_0_40px_rgba(21,239,235,0.1)]' : 'border-white/5 hover:border-primary/50'}`}
          >
            <div className={`absolute inset-0 bg-primary/5 transition-opacity ${selected === 'CITIZEN' ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`size-20 rounded-full flex items-center justify-center mb-8 mx-auto transition-all duration-500 ${selected === 'CITIZEN' ? 'bg-primary text-background-dark shadow-[0_0_20px_#15efeb]' : 'bg-white/5 text-white'}`}>
              <span className="material-symbols-outlined text-4xl">person_pin</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-center">👤 Citizen Portal</h3>
            <p className="text-sm text-white/50 mb-8 text-center px-4">Local health alerts, exposure tracking, and rewards for sustainable choices.</p>
            {selected === 'CITIZEN' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Phone Number" 
                  className="w-full bg-background-dark/80 border border-white/10 rounded-xl px-4 py-3 text-center text-sm focus:border-primary outline-none transition-all placeholder:text-white/20" 
                />
                <button 
                  onClick={(e) => handleAction(e, 'CITIZEN')}
                  className="w-full bg-primary text-background-dark py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  Get Access Code
                </button>
              </div>
            )}
          </div>

          {/* Authority Card */}
          <div 
            onClick={() => setSelected('AUTHORITY')}
            className={`group cursor-pointer glass-panel p-10 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${selected === 'AUTHORITY' ? 'border-primary shadow-[0_0_40px_rgba(21,239,235,0.1)]' : 'border-white/5 hover:border-primary/50'}`}
          >
            <div className={`absolute inset-0 bg-primary/10 transition-opacity ${selected === 'AUTHORITY' ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`size-20 rounded-full flex items-center justify-center mb-8 mx-auto transition-all duration-500 ${selected === 'AUTHORITY' ? 'bg-primary text-background-dark shadow-[0_0_20px_#15efeb]' : 'bg-white/5 text-white'}`}>
              <span className="material-symbols-outlined text-4xl">account_balance</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-center">🏛️ Authority Hub</h3>
            <p className="text-sm text-white/50 mb-8 text-center px-4">Ward-level source attribution, response tools, and policy intervention tools.</p>
            {selected === 'AUTHORITY' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
                <button 
                  onClick={(e) => handleAction(e, 'AUTHORITY')}
                  className="w-full bg-primary text-background-dark py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">shield</span>
                  SSO Officer Login
                </button>
                <p className="text-[10px] text-center text-white/30 uppercase tracking-widest font-bold">Authorized Personnel Only</p>
              </div>
            )}
          </div>
        </div>
        
        <p className="mt-16 text-center text-[10px] text-white/30 max-w-lg mx-auto uppercase tracking-tighter font-medium leading-relaxed">
          The Ward-Wise platform adheres to NCT data governance frameworks. <br/> Encryption is enforced for all department-level communications.
        </p>
      </div>
    </div>
  );
};

export default Login;
