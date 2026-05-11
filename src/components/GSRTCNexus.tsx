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
    <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar scroll-smooth">
      {dates.map((date, i) => {
        const isSelected = date.toISOString().split('T')[0] === selectedDate;
        return (
          <button
            key={i}
            onClick={() => onChange(date.toISOString().split('T')[0])}
            className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${
              isSelected 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                : 'glass-light border-white/5 text-text-dim hover:border-white/20'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="text-xl font-bold">{date.getDate()}</span>
            <span className="text-[10px] opacity-60 font-medium">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
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
      <div className="glass-light px-6 py-4 rounded-3xl flex flex-col justify-center border border-transparent hover:border-primary/20 transition-all group">
        <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">{label}</span>
        <div className="flex items-center gap-3">
          {label === 'Origin' ? <Locate size={18} className="text-text-dim" /> : <MapPin size={18} className="text-text-dim" />}
          <input 
            className="bg-transparent w-full text-xl font-bold outline-none" 
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 w-full mt-2 glass p-2 rounded-2xl z-[60] border border-white/10 shadow-2xl"
          >
            {filtered.map(s => (
              <button
                key={s}
                onClick={() => { onChange(s); setShow(false); }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 text-sm font-bold transition-all flex items-center justify-between group"
              >
                {s}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TerminalFeed: React.FC<{ logs: string[] }> = ({ logs }) => {
  return (
    <div className="bg-black/40 rounded-2xl p-4 font-mono text-[10px] h-32 overflow-y-auto border border-white/5 space-y-1 no-scrollbar">
       <div className="flex items-center gap-2 text-primary font-bold mb-2">
          <Terminal size={12} /> TELEMETRY_STREAM_VTS_LATEST
       </div>
       {logs.map((log, i) => (
         <div key={i} className="flex gap-2">
            <span className="text-text-dim opacity-30">[{new Date().toLocaleTimeString()}]</span>
            <span className={log.includes('ERR') ? 'text-accent' : log.includes('OK') ? 'text-green-400' : 'text-text-dim'}>
              {log}
            </span>
         </div>
       ))}
    </div>
  );
};

const GSRTCNexus: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'booking'>('booking');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'fare' | 'time' | 'seats'>('time');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [groupBy, setGroupBy] = useState<'none' | 'type'>('none');
  const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [travelDate, setTravelDate] = useState('2026-05-14');
  const [logs, setLogs] = useState<string[]>(['SYS: Booting VTS Engine...', 'SYS: Handshaking with Amnex...', 'SYS: OK']);
  const [isScanning, setIsScanning] = useState(false);
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

  // Deep linking for tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bus = params.get('track');
    if (bus) {
      setSearchQuery(bus);
      setActiveTab('tracking');
    }
  }, []);

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

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Header */}
      <header className="glass fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Bus className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">GSRTC <span className="text-primary">NEXUS</span></h1>
            <p className="text-[10px] text-text-dim uppercase tracking-widest font-medium">Advanced Transit Intelligence</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-1 glass-light p-1 rounded-full">
          {(['booking', 'tracking'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-text-muted">Current Region</p>
            <p className="text-sm font-semibold">Gujarat, India</p>
          </div>
          <div className="w-10 h-10 rounded-full glass-light flex items-center justify-center border border-white/10">
            <Info size={18} className="text-text-muted" />
          </div>
        </div>
      </header>

      <main className="pt-32 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'booking' ? (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Redesigned Search Section */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                  <div className="max-w-xl">
                    <h2 className="text-5xl font-bold tracking-tighter mb-2">Nexus <span className="text-primary">Booking</span></h2>
                    <p className="text-text-muted text-lg">Intelligent route discovery with real-time seat telemetry.</p>
                  </div>
                  <div className="flex items-center gap-2 glass-light p-1.5 rounded-2xl border border-white/5">
                    <button className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-white flex items-center gap-2">
                       <Zap size={14} className="text-primary" /> Instant Book
                    </button>
                    <button className="px-4 py-2 rounded-xl text-sm font-medium text-text-dim hover:text-white transition-all">
                       Corporate
                    </button>
                  </div>
                </div>

                <div className="glass p-2 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-stretch gap-2">
                  <div className="flex-1 flex flex-col md:flex-row gap-2 relative">
                    <StationAutocomplete value={origin} onChange={setOrigin} label="Origin" />
                    
                    <div 
                      onClick={() => { const tmp = origin; setOrigin(destination); setDestination(tmp); }}
                      className="w-12 h-12 self-center bg-white/5 rounded-full flex items-center justify-center rotate-90 md:rotate-0 text-text-dim hover:text-primary transition-all cursor-pointer z-10"
                    >
                       <ArrowRight size={20} />
                    </div>

                    <StationAutocomplete value={destination} onChange={setDestination} label="Destination" />
                  </div>

                  <button className="primary-button md:w-48 rounded-[1.5rem] flex items-center justify-center gap-3 text-xl font-bold py-6">
                    <Search size={24} />
                    Search
                  </button>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                         <Calendar size={14} className="text-primary" /> Select Travel Date
                      </h3>
                   </div>
                   <MagicDatePicker selectedDate={travelDate} onChange={setTravelDate} />
                </div>
              </section>

              {/* Filters & Results */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 space-y-6">
                  <div className="glass p-6 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Filter size={16} /> Filters
                      </h3>
                      <button className="text-xs text-primary hover:underline">Reset</button>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm text-text-dim block uppercase tracking-wider font-bold">Bus Type</label>
                      <div className="flex flex-wrap gap-2">
                        {busTypes.map(type => (
                          <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              filterType === type 
                              ? 'bg-primary/20 border-primary text-primary' 
                              : 'border-white/5 text-text-muted hover:border-white/20'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm text-text-dim block uppercase tracking-wider font-bold">Sort By</label>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-text-main outline-none"
                      >
                        <option value="time">Departure Time</option>
                        <option value="fare">Lowest Fare</option>
                        <option value="seats">Most Seats</option>
                      </select>
                    </div>
                    <div className="space-y-4 border-t border-white/5 pt-6">
                      <label className="text-sm text-text-dim block uppercase tracking-wider font-bold">Group By</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setGroupBy('none')}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                            groupBy === 'none' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-text-muted'
                          }`}
                        >
                          None
                        </button>
                        <button
                          onClick={() => setGroupBy('type')}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                            groupBy === 'type' ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-text-muted'
                          }`}
                        >
                          Bus Type
                        </button>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Results List */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-text-muted text-sm">Showing {processedTrips.length} results</p>
                    <div className="flex items-center gap-2 glass-light p-1 rounded-lg">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-text-dim'}`}
                      >
                        <ListIcon size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-text-dim'}`}
                      >
                        <Grid size={18} />
                      </button>
                    </div>
                  </div>

                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-8'}>
                    {Object.entries(groupedTrips).map(([group, trips]) => (
                      <div key={group} className={viewMode === 'list' ? 'space-y-4' : 'contents'}>
                        {groupBy !== 'none' && (
                          <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                            <ChevronRight size={20} /> {group}
                          </h3>
                        )}
                        {trips.map((trip) => (
                          <motion.div
                            layout
                            key={trip.id}
                            className={`glass p-8 rounded-[2.5rem] group border border-white/5 hover:border-primary/40 transition-all shadow-xl hover:shadow-primary/5 ${
                              viewMode === 'list' ? 'flex flex-col md:flex-row items-stretch gap-12' : 'flex flex-col'
                            }`}
                          >
                            <div className="flex-1 flex flex-col justify-between gap-6 w-full">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                                    trip.busType === 'VOLVO' ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-white/5 border-white/10 text-text-dim'
                                  }`}>
                                    {trip.busType}
                                  </span>
                                  <span className="text-[10px] font-bold text-text-dim/60 tracking-widest uppercase">{trip.busNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                   <span className="text-[10px] font-bold text-green-500 uppercase">Available</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between gap-8 relative">
                                <div className="z-10 bg-black/20 backdrop-blur-md p-4 rounded-3xl border border-white/5 min-w-[120px]">
                                  <p className="text-4xl font-black tracking-tighter">{trip.departureTime}</p>
                                  <p className="text-sm font-bold text-text-dim mt-1">{trip.origin}</p>
                                </div>

                                <div className="flex-1 flex flex-col items-center gap-2 px-4">
                                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{trip.duration}</span>
                                  <div className="w-full h-[2px] bg-white/5 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#05070a] border-2 border-primary shadow-[0_0_15px_rgba(96,165,250,0.5)] flex items-center justify-center">
                                       <div className="w-1 h-1 rounded-full bg-primary" />
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">DIRECT</span>
                                </div>

                                <div className="z-10 bg-black/20 backdrop-blur-md p-4 rounded-3xl border border-white/5 text-right min-w-[120px]">
                                  <p className="text-4xl font-black tracking-tighter">{trip.arrivalTime}</p>
                                  <p className="text-sm font-bold text-text-dim mt-1">{trip.destination}</p>
                                </div>
                              </div>
                            </div>

                            <div className={`flex flex-col justify-between gap-6 ${viewMode === 'list' ? 'md:border-l md:border-white/5 md:pl-12 md:min-w-[200px]' : 'mt-8 pt-8 border-t border-white/5'}`}>
                              <div className="text-right space-y-1">
                                <p className="text-[10px] text-text-dim uppercase font-black tracking-widest">Starting from</p>
                                <p className="text-5xl font-black text-white tracking-tighter">₹{trip.fare}</p>
                                <p className={`text-xs font-bold ${trip.seatsAvailable < 10 ? 'text-accent' : 'text-primary'}`}>
                                  {trip.seatsAvailable} Seats Remaining
                                </p>
                              </div>
                              <button 
                                className="w-full h-16 bg-white/5 rounded-2xl flex items-center justify-center gap-3 group-hover:bg-primary group-hover:text-white transition-all font-black text-sm uppercase tracking-widest border border-white/10 group-hover:border-primary shadow-xl"
                                onClick={() => window.open('https://gsrtc.in/site/', '_blank')}
                              >
                                Select Seat <ArrowRight size={18} />
                              </button>
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
              className="h-[calc(100vh-12rem)] glass rounded-3xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <Cpu size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Forensic Telemetry</h2>
                    <p className="text-sm text-text-dim">Real-time VTS & Fleet Intelligence</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-[32rem]">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      placeholder="Enter Vehicle Number..." 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-primary transition-all shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRecent(searchQuery)}
                    />
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => toggleFavorite(searchQuery)}
                      className={`p-4 rounded-2xl border transition-all ${
                        favorites.includes(searchQuery) ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-text-dim'
                      }`}
                    >
                      <Star size={20} fill={favorites.includes(searchQuery) ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
              </div>

              {/* Recent & Favs Bar */}
              <div className="px-6 py-3 border-b border-white/5 flex items-center gap-6 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 text-[10px] font-black text-text-dim uppercase tracking-widest whitespace-nowrap">
                   <History size={12} /> Recent
                </div>
                {recentSearches.map(id => (
                  <button 
                    key={id}
                    onClick={() => setSearchQuery(id)}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-bold hover:border-primary/40 transition-all"
                  >
                    {id}
                  </button>
                ))}
                {favorites.length > 0 && (
                  <>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">
                       <Star size={12} /> Favorites
                    </div>
                    {favorites.map(id => (
                      <button 
                        key={id}
                        onClick={() => setSearchQuery(id)}
                        className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                      >
                        {id}
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div className="flex-1 relative bg-[#05070a] flex flex-col md:flex-row p-6 gap-6 overflow-y-auto">
                {trackingData ? (
                  <>
                    {/* Left Panel: Telemetry & Events */}
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <section className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col">
                              <h3 className="text-sm font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                                <Activity size={14} className="text-primary" /> Trip Summary
                              </h3>
                              <p className="text-2xl font-bold mt-1">{formatVehicleNo(searchQuery)}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLive ? 'bg-green-500/20 text-green-500 animate-pulse' : 'bg-white/10 text-text-dim'}`}>
                              {isLive ? 'LIVE' : 'OFFLINE'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-text-dim uppercase font-bold">Departure</p>
                              <p className="text-sm font-medium">{trackingData.depot}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-text-dim uppercase font-bold">Last Station</p>
                              <p className="text-sm font-medium">{trackingData.lastStation || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-text-dim uppercase font-bold">Last Arrival</p>
                              <p className="text-sm font-medium">{trackingData.lastArrival || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-text-dim uppercase font-bold">Status</p>
                              <p className="text-sm font-medium text-primary">{trackingData.status}</p>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-dim font-medium uppercase tracking-tighter truncate">Next: {trackingData.nextStation}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-text-dim font-bold">ETA: {trackingData.eta}</span>
                                <span className="text-primary font-bold">({trackingData.distanceToNext} KM)</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-text-dim bg-white/5 p-2 rounded-lg">
                              <span>Lat: {trackingData.lat}</span>
                              <span>Long: {trackingData.lng}</span>
                            </div>
                          </div>
                        </section>

                        <section className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                           <div className="absolute top-4 left-6">
                             <h3 className="text-sm font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
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
                                 <p className="text-5xl font-black tracking-tighter">{trackingData.speed}</p>
                                 <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">KM/H</p>
                              </div>
                           </div>
                           
                           <div className="mt-4 flex items-center gap-8 w-full border-t border-white/5 pt-4">
                              <div className="text-center flex-1">
                                 <p className="text-[10px] font-bold text-text-dim uppercase">Heading</p>
                                 <p className="text-sm font-black">{trackingData.direction}</p>
                              </div>
                              <div className="w-px h-8 bg-white/5" />
                              <div className="text-center flex-1">
                                 <p className="text-[10px] font-bold text-text-dim uppercase">Altitude</p>
                                 <p className="text-sm font-black">24m</p>
                              </div>
                           </div>
                        </section>
                      </div>

                      <section className="glass p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-sm font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                              <History size={14} className="text-primary" /> Recent Events
                           </h3>
                           <button className="text-[10px] font-bold text-primary hover:underline">VIEW FULL LOG</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                       <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-text-dim flex items-center justify-between">
                             <span>Tracking Controls</span>
                             {isScanning && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={12} className="text-primary" /></motion.div>}
                          </h4>
                          <button onClick={handleManualScan} disabled={isScanning} className="w-full bg-primary/10 border border-primary/20 text-primary py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 hover:bg-primary/20">
                             {isScanning ? 'SCANNING...' : 'TRIGGER DEEP SCAN'} <SearchCode size={16} />
                          </button>
                          <button onClick={handleShare} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                            <Share2 size={16} /> Share Intelligence
                          </button>
                          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                            <AlertCircle size={16} className="text-accent" /> Report Discrepancy
                          </button>
                       </div>

                       <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-text-dim">Fleet Status</h4>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Signal Strength</span>
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
                  <div className="text-center z-10 space-y-4 mx-auto my-auto">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Navigation size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-medium">Tracking Intelligence Enabled</h3>
                    <p className="text-text-muted max-w-sm mx-auto text-sm">
                      Searching for fleet signals. GPS telemetry will appear here once a valid vehicle ID is provided.
                    </p>
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

      {/* Floating Action Menu for Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-2 py-2 rounded-full flex items-center gap-1 shadow-2xl md:hidden">
        {(['booking', 'tracking'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === tab ? 'bg-primary text-white' : 'text-text-muted'
            }`}
          >
            {tab === 'booking' ? <Search size={16} /> : <Navigation size={16} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GSRTCNexus;
