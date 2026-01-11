
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import CitizenDashboard from './components/CitizenDashboard';
import AuthorityDashboard from './components/AuthorityDashboard';
import InteractiveMap from './components/InteractiveMap';
import CACPage from './components/CACPage';
import CleanAirCreditsPage from './components/CleanAirCreditsPage';
import AuthorityRolePicker from './components/AuthorityRolePicker';
import AuthorityRoleView from './components/AuthorityRoleView';
import LeafletAQIMap from './components/LeafletAQIMap';
import { ViewMode, UserRole, WardData, AuthorityRole } from './types';
import { detectUserWard, storeUserWard, getStoredWard } from './services/locationService';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LANDING);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [detectedWard, setDetectedWard] = useState<WardData | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [authorityRole, setAuthorityRole] = useState<AuthorityRole>(null);

  const analyticsViewUrl = new URL('./analytics_view_-_data_analysts/code.html', import.meta.url).href;
  const executiveViewUrl = new URL('./executive_view_-_senior_decision_makers/code.html', import.meta.url).href;
  const fieldViewUrl = new URL('./field_view_-_enforcement_officers/code.html', import.meta.url).href;
  const operationalViewUrl = new URL('./operational_view_-_department_heads/code.html', import.meta.url).href;

  const getAuthorityViewForRole = (role: AuthorityRole): ViewMode => {
    switch (role) {
      case 'ANALYTICS':
        return ViewMode.AUTHORITY_ANALYTICS;
      case 'EXECUTIVE':
        return ViewMode.AUTHORITY_EXECUTIVE;
      case 'FIELD':
        return ViewMode.AUTHORITY_FIELD;
      case 'OPERATIONAL':
        return ViewMode.AUTHORITY_OPERATIONAL;
      default:
        return ViewMode.AUTHORITY_ROLE_SELECT;
    }
  };

  // Detect location on app load
  useEffect(() => {
    const detectLocation = async () => {
      // Check if already stored
      const stored = getStoredWard();
      if (stored) {
        setDetectedWard(stored);
        return;
      }

      // Request location on first visit
      if (!locationRequested) {
        setLocationRequested(true);
        const ward = await detectUserWard();
        if (ward) {
          storeUserWard(ward);
          setDetectedWard(ward);
        }
      }
    };

    detectLocation();
  }, [locationRequested]);

  const handleEnterPlatform = () => {
    setViewMode(ViewMode.LOGIN);
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    if (role === 'CITIZEN') {
      setViewMode(ViewMode.CITIZEN_DASHBOARD);
    } else if (role === 'AUTHORITY') {
      setAuthorityRole(null);
      setViewMode(ViewMode.AUTHORITY_ROLE_SELECT);
    }
  };

  const handleAuthorityRoleSelection = (role: AuthorityRole) => {
    setAuthorityRole(role);
    setViewMode(getAuthorityViewForRole(role));
  };

  const handleSignOut = () => {
    setUserRole(null);
    setAuthorityRole(null);
    setViewMode(ViewMode.LANDING);
  };

  const handleNavigate = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.LANDING:
        return (
          <section className="flex-1 px-6 lg:px-12 py-8 overflow-x-hidden">
            <div className="max-w-[1000px] mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Delhi Civic-Tech Intelligence
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8">
                Decoding Delhi’s Air <br />
                <span className="gradient-text italic">Ward-by-Ward.</span>
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mb-10 leading-relaxed font-medium">
                A specialized platform for citizens and authorities to monitor pollution hotspots, simulate policy impacts, and coordinate environmental action in real-time.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleEnterPlatform}
                  className="bg-primary text-background-dark px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:shadow-[0_0_20px_rgba(21,239,235,0.4)] transition-all"
                >
                  <span className="material-symbols-outlined">login</span>
                  Access Dashboard
                </button>
                <button
                  onClick={() => setViewMode(ViewMode.MAP_VIEW)}
                  className="border border-white/20 hover:border-primary/50 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">map</span>
                  Interactive Ward Map
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">
              <div className="lg:col-span-8 glass-panel rounded-3xl p-8 relative h-[520px] overflow-hidden group">
                <div className="absolute top-8 left-8 z-10">
                  <h3 className="text-2xl font-bold mb-1">Live Pollution Heatmap</h3>
                  <p className="text-white/50 text-sm">Source attribution for all 272 wards in real-time.</p>
                </div>
                <div className="absolute inset-0">
                  <LeafletAQIMap showChrome={false} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="flex-1 glass-panel rounded-3xl p-8 border-primary/10">
                  <span className="material-symbols-outlined text-primary text-4xl mb-4">query_stats</span>
                  <h4 className="text-xl font-bold mb-2">Trend Intelligence</h4>
                  <p className="text-white/50 text-sm mb-6">Analyzing historical AQI data against policy implementation timelines.</p>
                  <div className="h-32 w-full flex items-end gap-1 px-2">
                    {[30, 50, 20, 90, 45, 75, 50].map((h, i) => (
                      <div key={i} className="bg-primary/20 w-full rounded-t hover:bg-primary transition-all cursor-pointer" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <footer className="border-t border-white/5 pt-12 pb-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="size-6 bg-primary rounded flex items-center justify-center text-background-dark">
                  <span className="material-symbols-outlined text-xs font-bold">query_stats</span>
                </div>
                <span className="text-sm font-bold tracking-tighter uppercase">Ward-Wise Platform</span>
              </div>
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">In Collaboration with DPCC, CPCB, and Parivahan Aggregates</p>
            </footer>
          </section>
        );
      case ViewMode.LOGIN:
        return <Login onSelectRole={handleRoleSelection} onLocationDetected={(wardName) => console.log('Ward detected:', wardName)} />;
      case ViewMode.AUTHORITY_ROLE_SELECT:
        return <AuthorityRolePicker onSelect={handleAuthorityRoleSelection} onBack={() => setViewMode(ViewMode.LOGIN)} />;
      case ViewMode.AUTHORITY_ANALYTICS:
        return (
          <AuthorityRoleView
            title="Analytics View – Data Analysts"
            description="Sensor QA, anomaly hunts, and ML model performance telemetry."
            src={analyticsViewUrl}
            onBack={() => setViewMode(ViewMode.AUTHORITY_ROLE_SELECT)}
            hideMap={true}
          />
        );
      case ViewMode.AUTHORITY_EXECUTIVE:
        return (
          <AuthorityRoleView
            title="Executive View – Senior Decision Makers"
            description="Policy dashboards, mandate approvals, and risk monitoring."
            src={executiveViewUrl}
            onBack={() => setViewMode(ViewMode.AUTHORITY_ROLE_SELECT)}
            hideMap={true}
          />
        );
      case ViewMode.AUTHORITY_FIELD:
        return (
          <AuthorityRoleView
            title="Field View – Enforcement Officers"
            description="Mobile-first enforcement, evidence capture, and live incident queues."
            src={fieldViewUrl}
            onBack={() => setViewMode(ViewMode.AUTHORITY_ROLE_SELECT)}
            hideMap={true}
          />
        );
      case ViewMode.AUTHORITY_OPERATIONAL:
        return (
          <AuthorityRoleView
            title="Operational View – Department Heads"
            description="Cross-department tasking, SLA tracking, and rapid incident triage."
            src={operationalViewUrl}
            onBack={() => setViewMode(ViewMode.AUTHORITY_ROLE_SELECT)}
            hideMap={true}
          />
        );
      case ViewMode.CITIZEN_DASHBOARD:
        return <CitizenDashboard onNavigateMap={() => setViewMode(ViewMode.MAP_VIEW)} detectedWard={detectedWard || undefined} />;
      case ViewMode.AUTHORITY_DASHBOARD:
        return <AuthorityDashboard onNavigateMap={() => setViewMode(ViewMode.MAP_VIEW)} />;
      case ViewMode.MAP_VIEW:
        return <InteractiveMap onBack={() => {
          if (!userRole) {
            setViewMode(ViewMode.LANDING);
          } else {
            const returnView = userRole === 'CITIZEN' ? ViewMode.CITIZEN_DASHBOARD : getAuthorityViewForRole(authorityRole);
            setViewMode(returnView);
          }
        }} />;
      case ViewMode.CLEAN_AIR_CREDITS:
        return <CleanAirCreditsPage onNavigate={handleNavigate} />;
      case ViewMode.OPEN_DATA:
        return (
          <div className="flex-1 p-12 text-center flex flex-col items-center justify-center space-y-6">
            <span className="material-symbols-outlined text-primary text-6xl">database</span>
            <h1 className="text-4xl font-bold">Open Data Repository</h1>
            <p className="text-white/50 max-w-2xl">Access anonymized raw datasets from our network of 1,240 sensor nodes. Our transparency commitment ensures all citizen data is utilized purely for environmental calibration.</p>
            <button onClick={() => setViewMode(ViewMode.LANDING)} className="text-primary font-bold hover:underline">Return to Overview</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-white flex flex-col selection:bg-primary/30">
      <Header
        viewMode={viewMode}
        onEnterDashboard={handleEnterPlatform}
        onSignOut={handleSignOut}
        onNavigate={handleNavigate}
      />
      <main className="pt-24 flex flex-1">
        {viewMode === ViewMode.LANDING && <Sidebar />}
        {renderContent()}
      </main>
      <elevenlabs-convai agent-id="agent_1301kepesa21eg39f6q2nktr14cj"></elevenlabs-convai>
    </div>
  );
};

export default App;
