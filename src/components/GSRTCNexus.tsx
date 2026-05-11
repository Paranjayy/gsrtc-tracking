import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  MapPin, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  Info, 
  Navigation,
  Grid,
  List as ListIcon,
  ChevronRight,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';
import { MOCK_TRIPS } from '../services/mockData';
import type { BusTrip } from '../types';

const GSRTCNexus: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'booking'>('booking');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'fare' | 'time' | 'seats'>('time');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [groupBy, setGroupBy] = useState<'none' | 'type'>('none');

  // Deep linking for tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bus = params.get('track');
    if (bus) {
      setSearchQuery(bus);
      setActiveTab('tracking');
    }
  }, []);

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
              {/* Search Section */}
              <section className="glass p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                  <TrendingUp size={200} />
                </div>
                
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-bold mb-2">Find Your <span className="text-primary">Journey</span></h2>
                  <p className="text-text-muted mb-8">Search across 200+ daily trips with real-time seat availability and premium amenities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="glass-light p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                    <label className="text-[10px] text-primary uppercase font-bold tracking-wider">From</label>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-text-muted" />
                      <input className="bg-transparent w-full text-lg font-medium" defaultValue="Junagadh Busport" />
                    </div>
                  </div>
                  <div className="glass-light p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                    <label className="text-[10px] text-primary uppercase font-bold tracking-wider">To</label>
                    <div className="flex items-center gap-2">
                      <Navigation size={18} className="text-text-muted" />
                      <input className="bg-transparent w-full text-lg font-medium" defaultValue="Rajkot Busport" />
                    </div>
                  </div>
                  <div className="glass-light p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                    <label className="text-[10px] text-primary uppercase font-bold tracking-wider">Travel Date</label>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-text-muted" />
                      <input type="date" className="bg-transparent w-full text-lg font-medium" defaultValue="2026-05-14" />
                    </div>
                  </div>
                  <button className="primary-button flex items-center justify-center gap-2 h-full text-lg">
                    <Search size={20} />
                    Search
                  </button>
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
                            className={`glass p-6 rounded-2xl group border border-white/5 hover:border-primary/30 transition-all ${
                              viewMode === 'list' ? 'flex flex-col md:flex-row items-center gap-8' : 'flex flex-col'
                            }`}
                          >
                            <div className="flex-1 flex flex-col gap-4 w-full">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  trip.busType === 'VOLVO' ? 'border-secondary text-secondary' : 'border-text-dim text-text-muted'
                                }`}>
                                  {trip.busType}
                                </span>
                                <span className="text-xs text-text-dim font-mono">{trip.busNumber}</span>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <div className="text-center md:text-left">
                                  <p className="text-2xl font-bold">{trip.departureTime}</p>
                                  <p className="text-xs text-text-dim">{trip.origin}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-1">
                                  <p className="text-[10px] text-text-dim font-medium">{trip.duration}</p>
                                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                  </div>
                                  <p className="text-[10px] text-primary font-bold">DIRECT</p>
                                </div>
                                <div className="text-center md:text-right">
                                  <p className="text-2xl font-bold">{trip.arrivalTime}</p>
                                  <p className="text-xs text-text-dim">{trip.destination}</p>
                                </div>
                              </div>
                            </div>

                            <div className={`flex items-center gap-6 ${viewMode === 'list' ? 'md:border-l border-white/5 md:pl-8' : 'mt-6 pt-4 border-t border-white/5'}`}>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-white">₹{trip.fare}</p>
                                <p className={`text-xs ${trip.seatsAvailable < 10 ? 'text-accent' : 'text-text-muted'}`}>
                                  {trip.seatsAvailable} Seats Left
                                </p>
                              </div>
                              <button 
                                className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"
                                onClick={() => window.open('https://gsrtc.in/site/', '_blank')}
                              >
                                <ArrowRight size={20} />
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
                    <MapIcon size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Real-time Tracking</h2>
                    <p className="text-sm text-text-dim">Fleet intelligence & telemetry dashboard</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-96">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                    <input 
                      placeholder="Enter Vehicle Number (e.g. GJ-18-ZT-1831)" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 relative bg-[#0a0c10] flex items-center justify-center">
                {/* Mock Map Placeholder */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                   <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#ffffff11 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>
                
                <div className="text-center z-10 space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Navigation size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">Tracking Intelligence Enabled</h3>
                  <p className="text-text-muted max-w-sm mx-auto text-sm">
                    Searching for fleet signals. GPS telemetry will appear here once a valid vehicle ID is provided.
                  </p>
                </div>

                {/* Example Bus Overlay if searched */}
                {searchQuery.length > 5 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-8 left-8 right-8 md:right-auto md:w-80 glass p-6 rounded-2xl border-l-4 border-primary"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Signal</span>
                      <button 
                        onClick={handleShare}
                        className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold hover:bg-primary/20 transition-all"
                      >
                        SHARE LINK
                      </button>
                    </div>
                    <h4 className="text-lg font-bold">{formatVehicleNo(searchQuery)}</h4>
                    <p className="text-xs text-text-muted mb-4">Junagadh Express - Route #402</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-light p-2 rounded-lg">
                        <p className="text-[10px] text-text-dim">SPEED</p>
                        <p className="font-bold">62 km/h</p>
                      </div>
                      <div className="glass-light p-2 rounded-lg">
                        <p className="text-[10px] text-text-dim">ETA</p>
                        <p className="font-bold">12 mins</p>
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/20">
                      View Route Details <ChevronRight size={16} />
                    </button>
                  </motion.div>
                )}
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
