import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  MapPin, 
  Search, 
  Filter, 
  ArrowRight, 
  Info, 
  Navigation,
  Grid,
  List as ListIcon,
  ChevronRight,
  Activity,
  History,
  Share2,
  AlertCircle,
  Calendar,
  Zap,
  Locate,
  Star,
  Cpu,
  Gauge,
  Terminal,
  RefreshCw,
  SearchCode
} from 'lucide-react';
import { MOCK_TRIPS, STATIONS } from '../services/mockData';
import { GSRTCService } from '../services/gsrtc';
import type { BusTrip, TrackingInfo } from '../types';

const MagicDatePicker: React.FC<{ selectedDate: string; onChange: (date: string) => void }> = ({ selectedDate, onChange }) => {
  const dates = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  return (
    <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar scroll-smooth">
      {dates.map((date, i) => {
        const isSelected = date.toISOString().split('T')[0] === selectedDate;
        return (
          <button
            key={i}
            onClick={() => onChange(date.toISOString().split('T')[0])}
            className={`flex-shrink-0 w-16 h-20 md:w-18 md:h-22 rounded-[1.15rem] flex flex-col items-center justify-center gap-1 transition-all border ${
              isSelected 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02] z-10' 
                : 'bg-white/[0.035] border-white/5 text-text-dim hover:border-white/15 hover:bg-white/[0.06]'
            }`}
          >
            <span className={`text-[9px] uppercase font-extrabold tracking-[0.18em] ${isSelected ? 'text-white/78' : 'text-text-dim/55'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="text-2xl md:text-[2rem] font-black text-editorial">{date.getDate()}</span>
            <span className={`text-[9px] font-extrabold uppercase tracking-[0.22em] ${isSelected ? 'text-white/65' : 'text-text-dim/40'}`}>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
          </button>
        );
      })}
    </div>
  );
};

const StationAutocomplete: React.FC<{ value: string; onChange: (val: string) => void; label: string }> = ({ value, onChange, label }) => {
  const [show, setShow] = useState(false);
  const filtered = useMemo(() => 
    STATIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value).slice(0, 5),
    [value]
  );

  return (
    <div className="relative flex-1">
      <div className="soft-field px-5 py-4 flex flex-col justify-center transition-all group focus-within:border-primary/40 focus-within:bg-white/[0.07]">
        <span className="text-[9px] text-primary font-black uppercase tracking-[0.28em] mb-1 group-hover:translate-x-1 transition-transform">{label}</span>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl shrink-0">
            {label === 'Origin' ? <Locate size={16} className="text-primary" /> : <MapPin size={16} className="text-primary" />}
          </div>
          <input 
            className="bg-transparent w-full text-base md:text-lg font-semibold outline-none placeholder:text-text-dim/40 text-white tracking-tight truncate" 
            placeholder={`Enter ${label}...`}
            value={value}
            onChange={(e) => { onChange(e.target.value); setShow(true); }}
            onFocus={() => setShow(true)}
            onBlur={() => setTimeout(() => setShow(false), 200)}
          />
        </div>
      </div>
      <AnimatePresence>
        {show && filtered.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute top-full left-0 w-full mt-3 glass-panel p-2.5 rounded-[1.35rem] z-[60] border border-white/10 shadow-3xl"
          >
            {filtered.map(s => (
              <button
                key={s}
                onClick={() => { onChange(s); setShow(false); }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/8 text-sm font-semibold transition-all flex items-center justify-between group/item"
              >
                <span className="group-hover/item:text-white transition-colors">{s}</span>
                <ArrowRight size={16} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TerminalFeed: React.FC<{ logs: string[] }> = ({ logs }) => {
  const bottomRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/35 rounded-[1.25rem] p-4 font-mono text-[10px] h-40 overflow-y-auto border border-white/5 space-y-1 no-scrollbar">
       <div className="flex items-center gap-2 text-green-400 font-bold mb-3 border-b border-white/5 pb-2">
          <Terminal size={12} /> <span>AMNEX_VTS_STREAM</span>
          <span className="ml-auto text-text-dim animate-pulse">LIVE</span>
       </div>
       {logs.length === 0 && (
         <p className="text-text-dim opacity-40 italic">Awaiting telemetry packets...</p>
       )}
       {logs.map((log, i) => (
         <div key={i} className="flex gap-2">
            <span className="text-text-dim opacity-25 shrink-0">[{new Date().toLocaleTimeString()}]</span>
            <span className={`break-all ${
              log.includes('ERR') ? 'text-red-400' : 
              log.includes('OK') || log.includes('✓') ? 'text-green-400' : 
              log.includes('WARN') ? 'text-yellow-400' :
              'text-slate-400'
            }`}>
              {log}
            </span>
         </div>
       ))}
       <div ref={bottomRef} />
    </div>
  );
};

const TICKER_ITEMS = [
  'GJ18ZT1831 — JUNAGADH → RAJKOT — ON TIME',
  'GJ06BT5047 — AHMEDABAD → SURAT — DELAYED 12 MIN',
  'GJ01ZA2291 — VADODARA → ANAND — ON TIME',
  'FLEET STATUS: 4,281 BUSES ONLINE — NETWORK OPTIMAL',
  'GJ18ZT1832 — PORBANDAR → JUNAGADH — DEPARTED',
  'GJ05GH2201 — GANDHINAGAR → MEHSANA — ON TIME',
  'NEW ROUTE: BHAVNAGAR → PALITANA — BOOKING OPEN',
  'GJ21XY8811 — SURAT → NAVSARI — APPROACHING STATION',
];

const TickerBar: React.FC = () => (
  <div className="border-t border-white/5 py-1.5 overflow-hidden relative bg-black/25">
    <div className="flex items-center">
      <div className="shrink-0 px-4 py-0.5 bg-primary text-white text-[9px] font-black tracking-[0.18em] uppercase z-10 mr-4 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.22)]">
        LIVE
      </div>
      <div className="ticker-wrap flex-1">
        <div className="ticker-inner animate-ticker">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              {item} <span className="text-primary mx-6">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);


const GSRTCNexus: React.FC = () => {
  // Slug-based routing: read ?tab= and ?track= from URL on mount
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracking' | 'booking'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'booking' || tab === 'tracking') return tab;
    return 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'fare' | 'time' | 'seats'>('time');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<'ALL' | 'GSRTC' | 'REDBUS'>('ALL');
  const [groupBy, setGroupBy] = useState<'none' | 'type'>('none');
  const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [travelDate, setTravelDate] = useState('2026-05-14');
  const [logs, setLogs] = useState<string[]>(['SYS: Booting VTS Engine...', 'SYS: Handshaking with Amnex...', 'SYS: OK']);
  const [isScanning, setIsScanning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('nexus_favs') || '[]'));
  const [recentSearches, setRecentSearches] = useState<string[]>(() => JSON.parse(localStorage.getItem('nexus_recent') || '[]'));
  const [origin, setOrigin] = useState('Junagadh Busport');
  const [destination, setDestination] = useState('Rajkot Busport');

  useEffect(() => {
    localStorage.setItem('nexus_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('nexus_recent', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const addRecent = (id: string) => {
    if (!id || id.length < 6) return;
    setRecentSearches(prev => [id, ...prev.filter(p => p !== id)].slice(0, 5));
  };

  // Sync URL with active tab (slug routing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bus = params.get('track');
    if (bus) {
      setSearchQuery(bus);
      setActiveTab('tracking');
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.length >= 6 && activeTab === 'tracking') {
      const url = new URL(window.location.href);
      url.searchParams.set('track', searchQuery);
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchQuery, activeTab]);

  // Live Tracking Polling (Virtual Socket)
  useEffect(() => {
    if (activeTab === 'tracking' && searchQuery.length >= 6) {
      setIsLive(true);
      const stop = GSRTCService.startVirtualSocket(searchQuery, (data) => {
        setTrackingData(data);
        setLogs(prev => [`VTS: Lat ${data.lat} Lng ${data.lng} Speed ${data.speed} OK`, ...prev].slice(0, 20));
      });
      return () => {
        stop();
        setIsLive(false);
      };
    } else {
      setTrackingData(null);
    }
  }, [activeTab, searchQuery]);

  const handleManualScan = async () => {
    if (!searchQuery) return;
    setIsScanning(true);
    setLogs(prev => ['SYS: Manual Deep Scan Triggered...', ...prev]);
    const data = await GSRTCService.trackVehicle(searchQuery);
    if (data) {
      setTrackingData(data);
      setLogs(prev => ['SYS: Scan Complete. High Fidelity Mapping Updated.', ...prev]);
    }
    setTimeout(() => setIsScanning(false), 2000);
  };

  const formatVehicleNo = (val: string) => {
    const clean = val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (clean.length === 10) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 6)}-${clean.slice(6)}`;
    }
    return clean;
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('track', searchQuery);
    navigator.clipboard.writeText(url.toString());
    alert('Tracking link copied for family sharing! 🚀');
  };

  // Filtering & Sorting Logic
  const processedTrips = useMemo(() => {
    let result = [...MOCK_TRIPS];

    // Filter by type
    if (filterType !== 'ALL') {
      result = result.filter(t => t.busType === filterType);
    }

    // Filter by source
    if (filterSource !== 'ALL') {
      result = result.filter(t => t.source === filterSource);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'fare') return a.fare - b.fare;
      if (sortBy === 'seats') return b.seatsAvailable - a.seatsAvailable;
      if (sortBy === 'time') return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });

    return result;
  }, [sortBy, filterType]);

  const groupedTrips = useMemo(() => {
    if (groupBy === 'none') return { 'All Trips': processedTrips };
    
    return processedTrips.reduce((acc, trip) => {
      const key = trip.busType;
      if (!acc[key]) acc[key] = [];
      acc[key].push(trip);
      return acc;
    }, {} as Record<string, BusTrip[]>);
  }, [processedTrips, groupBy]);

  const busTypes = ['ALL', ...new Set(MOCK_TRIPS.map(t => t.busType))];
  const routePresets = [
    { label: 'Junagadh to Rajkot', origin: 'Junagadh Busport', destination: 'Rajkot Busport' },
    { label: 'Ahmedabad to Surat', origin: 'Ahmedabad Central', destination: 'Surat Central' },
    { label: 'Bhavnagar to Palitana', origin: 'Bhavnagar', destination: 'Somnath' },
    { label: 'Gandhinagar to Mehsana', origin: 'Gandhinagar', destination: 'Mehsana' },
  ];
  const sourceCounts = useMemo(() => ({
    GSRTC: processedTrips.filter((trip) => trip.source === 'GSRTC').length,
    REDBUS: processedTrips.filter((trip) => trip.source === 'REDBUS').length,
  }), [processedTrips]);

  const FiltersPanel = (
    <div className="stat-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter size={16} /> Filters
        </h3>
        <button className="text-xs text-primary hover:underline" onClick={() => {
          setFilterType('ALL');
          setFilterSource('ALL');
          setSortBy('time');
          setGroupBy('none');
        }}>
          Reset
        </button>
      </div>

      <div className="space-y-3">
        <label className="section-title block">Bus type</label>
        <div className="flex flex-wrap gap-2">
          {busTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-semibold border transition-all soft-chip ${
                filterType === type 
                ? 'soft-chip-active' 
                : 'hover:border-white/18'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="section-title block">Source</label>
        <div className="flex gap-2">
          {['ALL', 'GSRTC', 'REDBUS'].map(src => (
            <button
              key={src}
              onClick={() => setFilterSource(src as any)}
              className={`flex-1 py-2 text-[10px] font-black border transition-all soft-chip ${
                filterSource === src ? 'soft-chip-active' : ''
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="section-title block">Sort by</label>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full soft-field p-3 text-sm text-text-main outline-none"
        >
          <option value="time">Departure Time</option>
          <option value="fare">Lowest Fare</option>
          <option value="seats">Most Seats</option>
        </select>
      </div>
      <div className="space-y-3 border-t border-white/5 pt-5">
        <label className="section-title block">Group by</label>
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy('none')}
            className={`flex-1 py-2 text-xs font-semibold border transition-all soft-chip ${
              groupBy === 'none' ? 'soft-chip-active' : ''
            }`}
          >
            None
          </button>
          <button
            onClick={() => setGroupBy('type')}
            className={`flex-1 py-2 text-xs font-semibold border transition-all soft-chip ${
              groupBy === 'type' ? 'soft-chip-active' : ''
            }`}
          >
            Bus Type
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Header & Live Ticker Container */}
      <div className="fixed top-0 left-0 w-full z-50 flex flex-col bg-black/50 backdrop-blur-2xl border-b border-white/8">
        <header className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/18">
              <Bus className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight">GSRTC <span className="text-primary">NEXUS</span></h1>
              <p className="text-[9px] md:text-[10px] text-text-dim uppercase tracking-[0.24em] font-semibold">Advanced transit intelligence</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full text-[10px] border border-white/5">
            {(['dashboard', 'booking', 'tracking'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 md:px-6 py-2 rounded-full font-black transition-all uppercase tracking-[0.18em] ${
                  activeTab === tab 
                    ? 'bg-primary text-white shadow-xl shadow-primary/18' 
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-text-muted uppercase tracking-[0.2em]">Current region</p>
              <p className="text-sm font-semibold">Gujarat, India</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
              <Info size={18} className="text-text-muted" />
            </div>
          </div>
        </header>

        {/* Live Ticker Bar */}
        <TickerBar />
      </div>

      <main className="pt-48 md:pt-52 px-4 md:px-6 max-w-[1440px] mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
             <motion.div
               key="dashboard"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-12"
             >
                <section>
                   <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-10">
                     <div className="hero-copy">
                       <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-editorial">Nexus <span className="text-primary">intelligence</span></h2>
                       <p className="text-text-muted text-base md:text-lg max-w-2xl">Operational overview of the GSRTC fleet and partner networks, shaped to be readable at a glance.</p>
                     </div>
                     <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                        <div className="stat-card px-5 py-4">
                           <p className="section-title text-primary">Fleet online</p>
                           <p className="text-2xl md:text-3xl font-black mt-2 tabular-nums">4,281</p>
                           <p className="text-xs text-text-dim mt-1">vehicles active</p>
                        </div>
                        <div className="stat-card px-5 py-4">
                           <p className="section-title text-secondary">Network load</p>
                           <p className="text-2xl md:text-3xl font-black mt-2 text-secondary">Optimal</p>
                           <p className="text-xs text-text-dim mt-1">live telemetry stable</p>
                        </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        onClick={() => setActiveTab('tracking')}
                        className="stat-card p-6 md:p-7 rounded-[1.75rem] border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                      >
                         <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                            <Navigation size={24} className="text-primary" />
                         </div>
                         <h3 className="text-xl md:text-2xl font-black mb-2 tracking-tight">Fleet tracker</h3>
                         <p className="text-text-muted text-sm leading-relaxed max-w-sm">Real-time GPS telemetry with deep-scan capability and a calmer control surface.</p>
                      </div>
                      
                      <div 
                        onClick={() => setActiveTab('booking')}
                        className="stat-card p-6 md:p-7 rounded-[1.75rem] border border-white/5 hover:border-secondary/30 transition-all cursor-pointer group"
                      >
                         <div className="w-12 h-12 bg-secondary/15 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                            <Search size={24} className="text-secondary" />
                         </div>
                         <h3 className="text-xl md:text-2xl font-black mb-2 tracking-tight">Universal booking</h3>
                         <p className="text-text-muted text-sm leading-relaxed max-w-sm">Aggregated search from GSRTC direct and Redbus indexing without the clutter.</p>
                      </div>

                      <div 
                        className="stat-card p-6 md:p-7 rounded-[1.75rem] border border-white/5 hover:border-accent/30 transition-all cursor-pointer group"
                      >
                         <div className="w-12 h-12 bg-accent/15 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                            <Cpu size={28} className="text-accent" />
                         </div>
                         <h3 className="text-xl md:text-2xl font-black mb-2 tracking-tight">VTS forensic</h3>
                         <p className="text-text-muted text-sm leading-relaxed max-w-sm">Analyze raw vehicle logs, speed metrics, and waypoint precision in real time.</p>
                      </div>
                   </div>
                </section>

                <section className="space-y-6">
                   <div className="flex items-center justify-between">
                      <h3 className="section-title flex items-center gap-2">
                         <History size={14} className="text-primary" /> Recent Fleet Signals
                      </h3>
                      <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.18em]">View all signals</button>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {recentSearches.length > 0 ? recentSearches.map(id => (
                        <div key={id} onClick={() => { setSearchQuery(id); setActiveTab('tracking'); }} className="stat-card p-5 rounded-[1.5rem] border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.18em]">{id}</span>
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                           </div>
                           <p className="text-base md:text-lg font-black tracking-tight group-hover:text-primary transition-colors">Tracking update ready</p>
                           <p className="text-[10px] text-text-dim mt-1">Last seen just now</p>
                        </div>
                      )) : (
                        <div className="col-span-full py-12 text-center border border-dashed border-white/8 rounded-[1.75rem] bg-white/[0.02]">
                           <p className="text-text-muted">No recent fleet signals detected. Start tracking to see history.</p>
                        </div>
                      )}
                   </div>
                </section>
             </motion.div>
          ) : activeTab === 'booking' ? (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Redesigned Search Section */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                  <div className="hero-copy">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-[0.95] text-editorial">Nexus <span className="text-primary">booking</span></h2>
                    <p className="text-text-muted text-base md:text-lg max-w-2xl">Intelligent route discovery with real-time seat telemetry, laid out with more air and less noise.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/5">
                    <button className="px-4 py-2 rounded-full text-[10px] font-black bg-primary text-white flex items-center gap-2 shadow-lg shadow-primary/16 uppercase tracking-[0.18em]">
                       <Zap size={14} /> Instant book
                    </button>
                    <button className="px-4 py-2 rounded-full text-[10px] font-bold text-text-dim hover:text-white transition-all uppercase tracking-[0.18em]">
                       Corporate
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {routePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setOrigin(preset.origin);
                        setDestination(preset.destination);
                        setActiveTab('booking');
                      }}
                      className="text-left stat-card p-4 rounded-[1.35rem] hover:border-primary/20 transition-all group"
                    >
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Quick route</p>
                      <p className="text-sm md:text-base font-black tracking-tight group-hover:text-primary transition-colors">
                        {preset.label}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="stat-card p-4 rounded-[1.35rem]">
                    <p className="section-title">Matched routes</p>
                    <p className="text-2xl font-black mt-2 tabular-nums">{processedTrips.length}</p>
                    <p className="text-[10px] text-text-dim mt-1 uppercase tracking-[0.18em]">Live inventory from current filters</p>
                  </div>
                  <div className="stat-card p-4 rounded-[1.35rem]">
                    <p className="section-title text-primary">Direct inventory</p>
                    <p className="text-2xl font-black mt-2 tabular-nums">{sourceCounts.GSRTC}</p>
                    <p className="text-[10px] text-text-dim mt-1 uppercase tracking-[0.18em]">GSRTC direct sources</p>
                  </div>
                  <div className="stat-card p-4 rounded-[1.35rem]">
                    <p className="section-title text-secondary">Partner inventory</p>
                    <p className="text-2xl font-black mt-2 tabular-nums">{sourceCounts.REDBUS}</p>
                    <p className="text-[10px] text-text-dim mt-1 uppercase tracking-[0.18em]">Redbus indexed routes</p>
                  </div>
                </div>

                <div className="p-2 rounded-[2rem] glass-panel flex flex-col md:flex-row items-stretch gap-2">
                  <div className="flex-1 flex flex-col md:flex-row gap-2 relative">
                    <StationAutocomplete value={origin} onChange={setOrigin} label="Origin" />
                    
                    <div 
                      onClick={() => { const tmp = origin; setOrigin(destination); setDestination(tmp); }}
                      className="w-12 h-12 self-center bg-white/5 rounded-full flex items-center justify-center rotate-90 md:rotate-0 text-text-dim hover:text-primary transition-all cursor-pointer z-10 border border-white/5 shadow-xl hover:scale-105"
                    >
                       <ArrowRight size={18} />
                    </div>

                    <StationAutocomplete value={destination} onChange={setDestination} label="Destination" />
                  </div>

                  <button 
                    onClick={() => {
                      setIsSearching(true);
                      setTimeout(() => setIsSearching(false), 1500);
                    }}
                    className="primary-button md:w-60 rounded-[1.5rem] flex items-center justify-center gap-4 py-5"
                  >
                    <AnimatePresence mode="wait">
                      {isSearching ? (
                        <motion.div 
                          key="searching"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <RefreshCw size={20} className="animate-spin" /> 
                          <span className="text-xs font-black uppercase tracking-[0.18em]">Indexing...</span>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="search"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <Search size={20} /> 
                          <span className="font-black uppercase tracking-[0.18em]">Search</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <h3 className="section-title flex items-center gap-2">
                         <Calendar size={14} className="text-primary" /> Select Travel Date
                      </h3>
                   </div>
                   <MagicDatePicker selectedDate={travelDate} onChange={setTravelDate} />
                </div>
              </section>

              {/* Filters & Results */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="hidden md:block w-full md:w-64 space-y-6">
                  {FiltersPanel}
                </aside>

                {/* Results List */}
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-text-muted text-sm">Showing {processedTrips.length} results</p>
                      <p className="text-[10px] text-text-dim uppercase tracking-[0.18em] mt-1">
                        {sourceCounts.GSRTC} GSRTC • {sourceCounts.REDBUS} Redbus
                      </p>
                    </div>
                    <div className="flex items-center gap-2 glass-light p-1 rounded-full">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-text-dim'}`}
                      >
                        <ListIcon size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-text-dim'}`}
                      >
                        <Grid size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="md:hidden flex items-center justify-between gap-3">
                    <button
                      onClick={() => setIsMobileFiltersOpen(prev => !prev)}
                      className="soft-chip px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                      {isMobileFiltersOpen ? 'Hide filters' : 'Show filters'}
                    </button>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
                      {groupBy === 'none' ? 'Ungrouped' : 'Grouped by bus type'}
                    </p>
                  </div>

                  <AnimatePresence>
                    {isMobileFiltersOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden"
                      >
                        {FiltersPanel}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-3' : 'space-y-4'}>
                    {Object.entries(groupedTrips).map(([group, trips]) => (
                      <div key={group} className={viewMode === 'list' ? 'space-y-4' : 'contents'}>
                        {groupBy !== 'none' && (
                          <h3 className="text-base font-bold text-primary flex items-center gap-2 mb-2">
                            <ChevronRight size={20} /> {group}
                          </h3>
                        )}
                        {trips.map((trip) => (
                          <motion.div
                            layout
                            key={trip.id}
                            className={`glass-card p-5 md:p-6 rounded-[1.6rem] group border border-white/5 hover:border-primary/24 overflow-hidden relative ${
                              viewMode === 'list' ? 'flex flex-col gap-5' : 'flex flex-col'
                            }`}
                          >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                            <div className="flex-1 grid gap-5 xl:grid-cols-[1.4fr,0.6fr] items-start">
                              <div className="space-y-4 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.22em]">{trip.busType}</span>
                                  <span className="text-[10px] md:text-xs font-semibold text-text-dim tracking-[0.18em] uppercase">{trip.busNumber}</span>
                                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                                    trip.source === 'REDBUS' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
                                  }`}>
                                    {trip.source === 'REDBUS' ? 'Indexed via Redbus' : 'GSRTC direct'}
                                  </span>
                                  <span className="ml-auto flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
                                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                     <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.18em]">Live</span>
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                                  <div className="soft-field px-4 py-4 text-left min-w-0">
                                    <p className="text-3xl md:text-[2.65rem] font-black tracking-tight leading-none text-editorial">{trip.departureTime}</p>
                                    <p className="text-[10px] font-semibold text-text-dim mt-2 uppercase tracking-[0.18em] truncate">{trip.origin}</p>
                                  </div>

                                  <div className="flex flex-col items-center justify-center px-1">
                                    <div className="px-3 py-1 rounded-full glass-panel border border-primary/20">
                                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.24em]">Direct</span>
                                    </div>
                                    <div className="my-2.5 flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.65)]" />
                                       <div className="w-14 md:w-20 h-px bg-gradient-to-r from-primary/90 via-primary/35 to-transparent" />
                                    </div>
                                    <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.22em]">{trip.duration}</span>
                                  </div>

                                  <div className="soft-field px-4 py-4 text-right min-w-0">
                                    <p className="text-3xl md:text-[2.65rem] font-black tracking-tight leading-none text-editorial">{trip.arrivalTime}</p>
                                    <p className="text-[10px] font-semibold text-text-dim mt-2 uppercase tracking-[0.18em] truncate">{trip.destination}</p>
                                  </div>
                                </div>
                              </div>

                              <div className={`flex flex-col justify-between gap-3 ${viewMode === 'list' ? 'xl:border-l xl:border-white/10 xl:pl-5' : 'pt-1'}`}>
                                <div className="space-y-1 xl:text-right">
                                  <p className="section-title">Operational fare</p>
                                  <p className="text-4xl md:text-[2.9rem] font-black text-white tracking-tight leading-none text-editorial">₹{trip.fare}</p>
                                  <div className="flex items-center xl:justify-end gap-2 mt-2">
                                     <div className={`w-1.5 h-1.5 rounded-full ${trip.seatsAvailable < 10 ? 'bg-accent' : 'bg-primary'}`} />
                                     <p className={`text-[10px] font-black tracking-[0.18em] uppercase ${trip.seatsAvailable < 10 ? 'text-accent' : 'text-primary'}`}>
                                       {trip.seatsAvailable} seats remaining
                                     </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  <button 
                                    className="primary-button w-full h-11 rounded-[0.95rem] flex items-center justify-center gap-3 text-[11px]"
                                    onClick={() => window.open(trip.source === 'REDBUS' ? 'https://www.redbus.in/' : 'https://gsrtc.in/site/', '_blank')}
                                  >
                                    Select seat <ArrowRight size={15} />
                                  </button>
                                  <button 
                                    className="w-full h-9 glass-panel hover:bg-white/8 rounded-[0.95rem] flex items-center justify-center gap-2 transition-all font-semibold text-[10px] uppercase tracking-[0.18em] text-text-dim hover:text-white group/track"
                                    onClick={() => {
                                      setSearchQuery(trip.busNumber);
                                      setActiveTab('tracking');
                                      handleManualScan();
                                    }}
                                  >
                                    <Activity size={13} className="text-primary group-hover/track:animate-pulse" /> Track telemetry
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-[calc(100vh-12rem)] glass rounded-[2rem] overflow-hidden flex flex-col"
            >
              <div className="p-5 md:p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/15 rounded-xl">
                    <Cpu size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Forensic telemetry</h2>
                    <p className="text-sm text-text-dim">Real-time VTS and fleet intelligence</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-[32rem]">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      placeholder="Enter Vehicle Number..." 
                      className="w-full soft-field py-4 pl-12 pr-4 text-sm font-semibold focus:border-primary transition-all shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addRecent(searchQuery)}
                    />
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => toggleFavorite(searchQuery)}
                      className={`p-4 rounded-2xl border transition-all ${
                        favorites.includes(searchQuery) ? 'bg-primary/16 border-primary text-primary' : 'bg-white/5 border-white/10 text-text-dim'
                      }`}
                    >
                      <Star size={20} fill={favorites.includes(searchQuery) ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
              </div>

              {/* Recent & Favs Bar */}
              <div className="px-5 md:px-6 py-3 border-b border-white/5 flex items-center gap-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 text-[10px] font-black text-text-dim uppercase tracking-[0.22em] whitespace-nowrap">
                   <History size={12} /> Recent
                </div>
                {recentSearches.map(id => (
                  <button 
                    key={id}
                    onClick={() => setSearchQuery(id)}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-semibold hover:border-primary/35 transition-all"
                  >
                    {id}
                  </button>
                ))}
                {favorites.length > 0 && (
                  <>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.22em] whitespace-nowrap">
                       <Star size={12} /> Favorites
                    </div>
                    {favorites.map(id => (
                      <button 
                        key={id}
                        onClick={() => setSearchQuery(id)}
                        className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary hover:bg-primary/18 transition-all"
                      >
                        {id}
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div className="flex-1 relative bg-[#05070a] flex flex-col md:flex-row p-5 md:p-6 gap-5 overflow-y-auto">
                {trackingData ? (
                  <>
                    {/* Left Panel: Telemetry & Events */}
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        <div className="stat-card p-4">
                          <p className="section-title">Status</p>
                          <p className="text-xl font-black mt-2 text-primary">{trackingData.status}</p>
                          <p className="text-[10px] text-text-dim mt-1">Live feed active</p>
                        </div>
                        <div className="stat-card p-4">
                          <p className="section-title">Speed</p>
                          <p className="text-xl font-black mt-2 tabular-nums">{trackingData.speed} km/h</p>
                          <p className="text-[10px] text-text-dim mt-1">Current velocity</p>
                        </div>
                        <div className="stat-card p-4">
                          <p className="section-title">Next stop</p>
                          <p className="text-lg font-black mt-2">{trackingData.nextStation || 'N/A'}</p>
                          <p className="text-[10px] text-text-dim mt-1">{trackingData.distanceToNext} km away</p>
                        </div>
                        <div className="stat-card p-4">
                          <p className="section-title">ETA</p>
                          <p className="text-xl font-black mt-2">{trackingData.eta}</p>
                          <p className="text-[10px] text-text-dim mt-1">to next stop</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <section className="stat-card relative overflow-hidden">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col">
                              <h3 className="section-title flex items-center gap-2">
                                <Activity size={14} className="text-primary" /> Trip Summary
                              </h3>
                              <p className="text-2xl font-black mt-1 tracking-tight">{formatVehicleNo(searchQuery)}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLive ? 'bg-green-500/15 text-green-400 animate-pulse' : 'bg-white/10 text-text-dim'}`}>
                              {isLive ? 'LIVE' : 'OFFLINE'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="section-title">Departure</p>
                              <p className="text-sm font-semibold mt-1">{trackingData.depot}</p>
                            </div>
                            <div>
                              <p className="section-title">Last station</p>
                              <p className="text-sm font-semibold mt-1">{trackingData.lastStation || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="section-title">Last arrival</p>
                              <p className="text-sm font-semibold mt-1">{trackingData.lastArrival || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="section-title">Status</p>
                              <p className="text-sm font-semibold mt-1 text-primary">{trackingData.status}</p>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                             <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-text-dim">
                                   <span>Proximity to {trackingData.nextStation}</span>
                                   <span className="text-primary">{trackingData.distanceToNext} km remaining</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${Math.max(10, 100 - (trackingData.distanceToNext || 0))}%` }}
                                     className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                                   />
                                </div>
                             </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-dim font-medium uppercase tracking-tighter truncate">ETA: {trackingData.eta}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-bold">Live signal</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-text-dim bg-white/5 p-2.5 rounded-xl border border-white/5">
                               <div className="flex items-center gap-2">
                                  <MapPin size={10} className="text-primary" />
                                  <span>{trackingData.lat.toFixed(6)}, {trackingData.lng.toFixed(6)}</span>
                               </div>
                               <button onClick={() => window.open(`https://www.google.com/maps?q=${trackingData.lat},${trackingData.lng}`, '_blank')} className="text-primary hover:underline">OPEN MAP</button>
                            </div>
                          </div>
                        </section>

                        <section className="stat-card flex flex-col items-center justify-center relative overflow-hidden">
                           <div className="absolute top-4 left-6">
                             <h3 className="section-title flex items-center gap-2">
                               <Gauge size={14} className="text-primary" /> Velocity
                             </h3>
                           </div>
                           
                           {/* Forensic Speedometer */}
                           <div className="relative w-48 h-48 flex items-center justify-center mt-4">
                              <svg className="w-full h-full -rotate-90">
                                 <circle cx="96" cy="96" r="80" className="stroke-white/5" strokeWidth="12" fill="none" />
                                 <motion.circle 
                                   cx="96" cy="96" r="80" 
                                   className="stroke-primary" 
                                   strokeWidth="12" 
                                   fill="none"
                                   strokeDasharray="502.4"
                                   initial={{ strokeDashoffset: 502.4 }}
                                   animate={{ strokeDashoffset: 502.4 - (502.4 * (trackingData.speed / 120)) }}
                                   strokeLinecap="round"
                                 />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <p className="text-5xl font-black tracking-tighter tabular-nums">{trackingData.speed}</p>
                                 <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.18em]">KM/H</p>
                              </div>
                           </div>
                           
                           <div className="mt-4 flex items-center gap-8 w-full border-t border-white/5 pt-4">
                              <div className="text-center flex-1">
                                 <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.18em]">Heading</p>
                                 <p className="text-sm font-black mt-1">{trackingData.direction}</p>
                              </div>
                              <div className="w-px h-8 bg-white/5" />
                              <div className="text-center flex-1">
                                 <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.18em]">Altitude</p>
                                 <p className="text-sm font-black mt-1">24m</p>
                              </div>
                           </div>
                        </section>
                      </div>

                      <section className="stat-card">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="section-title flex items-center gap-2">
                              <History size={14} className="text-primary" /> Recent Events
                           </h3>
                           <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-[0.18em]">View full log</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="space-y-4">
                             {trackingData.events?.map((event, i) => (
                               <div key={i} className="flex items-start gap-4 relative group">
                                 <div className="mt-1 w-2 h-2 rounded-full bg-primary relative z-10" />
                                 {i !== trackingData.events!.length - 1 && (
                                   <div className="absolute left-[3px] top-4 bottom-[-16px] w-[2px] bg-white/5" />
                                 )}
                                 <div className="flex-1">
                                   <div className="flex items-center justify-between">
                                     <p className="text-sm font-bold">{event.type}</p>
                                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                       event.status === 'On time' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-muted'
                                     }`}>
                                       {event.status}
                                     </span>
                                   </div>
                                   <p className="text-xs text-text-dim">{event.location} — {event.time}</p>
                                 </div>
                               </div>
                             ))}
                           </div>
                           <TerminalFeed logs={logs} />
                        </div>
                      </section>
                    </div>

                    <div className="w-full md:w-80 space-y-4">
                       <div className="stat-card space-y-4">
                          <h4 className="section-title flex items-center justify-between">
                             <span>Tracking controls</span>
                             {isScanning && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={12} className="text-primary" /></motion.div>}
                          </h4>
                          <button onClick={handleManualScan} disabled={isScanning} className="w-full bg-primary/10 border border-primary/20 text-primary py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 hover:bg-primary/18">
                             {isScanning ? 'Scanning...' : 'Trigger deep scan'} <SearchCode size={16} />
                          </button>
                          <button onClick={handleShare} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                            <Share2 size={16} /> Share intelligence
                          </button>
                          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                            <AlertCircle size={16} className="text-accent" /> Report discrepancy
                          </button>
                       </div>

                       <div className="stat-card space-y-4">
                          <h4 className="section-title">Fleet status</h4>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.18em]">Signal strength</span>
                              <span className="text-[10px] font-bold text-primary">STABLE</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[85%]" />
                            </div>
                          </div>
                          <p className="text-[10px] text-text-dim text-center leading-relaxed">
                            Telemetry source: <span className="text-primary font-bold">AMNEX VTS PRO</span><br/>
                            Last synced: {new Date(trackingData.lastUpdated).toLocaleTimeString()}
                          </p>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                     
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="relative z-10 text-center max-w-md p-10"
                     >
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/20 animate-float shadow-2xl shadow-primary/10">
                           <Navigation size={48} className="text-primary" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tight mb-4 text-editorial">Awaiting signal</h3>
                        <p className="text-text-muted text-base leading-relaxed mb-8">
                           Enter a vehicle registration number above to begin telemetry extraction.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                           <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">VTS link ready</span>
                        </div>
                     </motion.div>
                  </div>
                )}
                
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                   <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Dock */}
      <div className="mobile-dock md:hidden flex items-center gap-1">
        {([['dashboard', Grid, 'HOME'], ['booking', Search, 'BOOK'], ['tracking', Navigation, 'TRACK']] as const).map(([tab, Icon, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center gap-1 px-5 py-2.5 rounded-full text-[9px] font-black transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text-muted hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GSRTCNexus;
