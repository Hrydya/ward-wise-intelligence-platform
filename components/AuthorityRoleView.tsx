import React from 'react';
import LeafletAQIMap from './LeafletAQIMap';

interface AuthorityRoleViewProps {
  title: string;
  description?: string;
  src: string;
  onBack: () => void;
  hideMap?: boolean;
}

const AuthorityRoleView: React.FC<AuthorityRoleViewProps> = ({ title, description, src, onBack, hideMap = false }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <div className="flex-1 flex flex-col bg-background-dark/30 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/10 bg-background-dark/80 backdrop-blur">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1">Authority Workspace</p>
          <h2 className="text-2xl font-bold leading-tight">{title}</h2>
          {description && <p className="text-white/50 text-sm">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="border border-white/10 text-white/80 hover:text-white hover:border-primary/60 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Open in new tab
          </a>
          <button
            onClick={onBack}
            className="bg-primary text-background-dark px-4 py-2 rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
        </div>
      </div>
      {!hideMap && (
        <div className="p-4 lg:p-8 bg-background-dark/40 border-b border-white/5">
          <div className="glass-panel rounded-2xl overflow-hidden border-white/10 relative h-[360px]">
            <div className="absolute top-3 left-3 z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Interactive Ward Map</p>
              <p className="text-white/60 text-xs">Live AQI heatmap embedded for quick context</p>
            </div>
            <LeafletAQIMap showChrome={false} key={title} />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
          </div>
        </div>
      )}
      <div className="flex-1 relative bg-background-dark">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background-dark">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">settings_suggest</span>
            <p className="text-primary font-bold tracking-widest uppercase text-xs animate-pulse">Loading Workspace...</p>
          </div>
        )}
        <iframe
          title={title}
          src={src}
          className={`w-full h-[calc(100vh-120px)] bg-white border-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default AuthorityRoleView;
