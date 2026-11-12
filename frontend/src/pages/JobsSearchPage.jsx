import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  X, 
  SlidersHorizontal, 
  Briefcase, 
  Navigation, 
  ChevronDown, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  BookmarkCheck, 
  Wifi, 
  Filter
} from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function JobsSearchPage() {
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('job_type') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'best_match');
  const [minMatch, setMinMatch] = useState(searchParams.get('min_match') || '');
  const [radiusKm, setRadiusKm] = useState(searchParams.get('radius_km') || '');
  const [remoteOnly, setRemoteOnly] = useState(searchParams.get('remote') === 'true');
  const [savedOnly, setSavedOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Load saved job IDs from localStorage
  const loadSavedIds = useCallback(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('jobhub_saved_jobs') || '[]');
      setSavedJobIds(ids);
    } catch {
      setSavedJobIds([]);
    }
  }, []);

  useEffect(() => {
    loadSavedIds();
    const handleSavedChange = () => loadSavedIds();
    window.addEventListener('jobhub_saved_updated', handleSavedChange);
    return () => window.removeEventListener('jobhub_saved_updated', handleSavedChange);
  }, [loadSavedIds]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (location && location !== 'all') params.location = location;
      if (jobType && jobType !== 'all') params.job_type = jobType;
      if (sortBy) params.sort_by = sortBy;
      if (minMatch) params.min_match = minMatch;
      if (radiusKm) params.radius_km = radiusKm;
      if (remoteOnly) params.is_remote = true;

      const res = await api.get('/jobs/', { params });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to search jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [location, jobType, sortBy, minMatch, radiusKm, remoteOnly]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setJobType('');
    setMinMatch('');
    setRadiusKm('');
    setRemoteOnly(false);
    setSavedOnly(false);
    setSortBy('best_match');
  };

  const hasActiveFilters = Boolean(
    searchQuery || location || jobType || minMatch || radiusKm || remoteOnly || savedOnly
  );

  const quickPills = [
    { label: 'Junior Backend', query: 'Backend' },
    { label: 'Python & FastAPI', query: 'Python' },
    { label: 'React Frontend', query: 'React' },
    { label: 'Savar Smart City', loc: 'Savar' },
    { label: 'Banani Tech Hub', loc: 'Banani' },
  ];

  // Apply client-side filters like savedOnly or remoteOnly fallback
  const displayedJobs = useMemo(() => {
    let result = [...jobs];

    if (savedOnly) {
      result = result.filter(j => savedJobIds.includes(j.id));
    }

    if (remoteOnly) {
      result = result.filter(j => j.is_remote);
    }

    return result;
  }, [jobs, savedOnly, savedJobIds, remoteOnly]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section with Seamless Radial Glow */}
      <div className="relative overflow-hidden hero-nordic-glow border-b border-[#E7E5E4]/80 py-10 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto space-y-6 relative z-10">
          
          {/* Title & AI Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] border border-[#99F6E4] text-xs font-semibold mb-2.5 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F766E]"></span>
                </span>
                <span>Proactive AI Placement Engine Active</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight font-heading leading-tight">
                Explore Engineering Opportunities
              </h1>
              <p className="text-sm text-[#78716C] mt-2 max-w-2xl leading-relaxed">
                Semantic search and proximity-ranked internships and entry-level engineering jobs, tailored to your university skills and active hub radius.
              </p>
            </div>

            {/* AI Mode Banner */}
            <div className="flex items-center gap-2.5 bg-white/95 border border-[#99F6E4] px-4 py-2.5 rounded-xl text-xs font-semibold text-[#0F766E] shadow-2xs self-start sm:self-auto backdrop-blur-xs transition-all duration-200 hover:shadow-xs">
              <Sparkles className="w-4 h-4 text-[#0F766E] animate-pulse shrink-0" />
              <span>Semantic Hybrid Match Active</span>
            </div>
          </div>

          {/* Search Bar Container */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7E5E4] shadow-[0_10px_30px_-5px_rgba(28,25,23,0.05),0_2px_6px_rgba(28,25,23,0.02)] space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              
              {/* Main search input with refined focus ring and clear button */}
              <div className="relative flex-1 group">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#0F766E] transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, technical skills, or company (e.g. Python, Docker, TechNova)..."
                  className="w-full pl-10 pr-9 py-3 text-xs sm:text-sm rounded-xl border border-stone-200/90 bg-[#FAF8F5]/70 hover:bg-[#FAF8F5] focus:bg-white text-[#1C1917] placeholder-stone-400 font-medium focus:outline-none focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.25)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.35)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Jobs</span>
              </button>
            </form>

            {/* Quick Keyword Suggestion Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
              <span className="text-[#78716C] font-semibold text-[11px] flex items-center gap-1.5 mr-1 select-none">
                <Sparkles className="w-3 h-3 text-[#0F766E]" />
                Quick Suggestions:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {quickPills.map((p, i) => {
                  const isSelected =
                    (p.query && searchQuery.toLowerCase() === p.query.toLowerCase()) ||
                    (p.loc && location.toLowerCase() === p.loc.toLowerCase());

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (p.query) setSearchQuery(p.query);
                        if (p.loc) setLocation(p.loc);
                        fetchJobs();
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] shadow-2xs font-semibold'
                          : 'bg-stone-100/90 hover:bg-[#CCFBF1]/50 text-stone-700 hover:text-[#0F766E] border border-stone-200/80 hover:border-[#99F6E4] font-medium'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Bar with Sleek Custom Select Controls */}
            <div className="pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                
                {/* Hub Location Filter */}
                <div className="relative group">
                  <MapPin className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${location ? 'text-[#0F766E]' : 'text-stone-400 group-hover:text-stone-600'}`} />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`appearance-none pl-8 pr-7 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all duration-150 shadow-2xs focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 ${
                      location
                        ? 'bg-[#CCFBF1]/40 border-[#99F6E4] text-[#0F766E]'
                        : 'bg-white border-stone-200/90 text-stone-700 hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    <option value="">All Locations</option>
                    <option value="Savar">Savar Hub</option>
                    <option value="Banani">Banani Hub</option>
                    <option value="Mohakhali">Mohakhali Hub</option>
                    <option value="Dhanmondi">Dhanmondi Hub</option>
                    <option value="Uttara">Uttara Hub</option>
                    <option value="Mirpur">Mirpur Hub</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-stone-600 transition-colors" />
                </div>

                {/* Job Type Filter */}
                <div className="relative group">
                  <Briefcase className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${jobType ? 'text-[#0F766E]' : 'text-stone-400 group-hover:text-stone-600'}`} />
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className={`appearance-none pl-8 pr-7 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all duration-150 shadow-2xs focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 ${
                      jobType
                        ? 'bg-[#CCFBF1]/40 border-[#99F6E4] text-[#0F766E]'
                        : 'bg-white border-stone-200/90 text-stone-700 hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    <option value="">All Job Types</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-stone-600 transition-colors" />
                </div>

                {/* Min Match Score */}
                <div className="relative group">
                  <Sparkles className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${minMatch ? 'text-[#0F766E]' : 'text-stone-400 group-hover:text-stone-600'}`} />
                  <select
                    value={minMatch}
                    onChange={(e) => setMinMatch(e.target.value)}
                    className={`appearance-none pl-8 pr-7 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all duration-150 shadow-2xs focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 ${
                      minMatch
                        ? 'bg-[#CCFBF1]/40 border-[#99F6E4] text-[#0F766E]'
                        : 'bg-white border-stone-200/90 text-stone-700 hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    <option value="">Any Match %</option>
                    <option value="70">≥ 70% Match</option>
                    <option value="80">≥ 80% Match</option>
                    <option value="90">≥ 90% Match</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-stone-600 transition-colors" />
                </div>

                {/* Radius Filter */}
                <div className="relative group">
                  <Navigation className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${radiusKm ? 'text-[#0F766E]' : 'text-stone-400 group-hover:text-stone-600'}`} />
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    className={`appearance-none pl-8 pr-7 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all duration-150 shadow-2xs focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 ${
                      radiusKm
                        ? 'bg-[#CCFBF1]/40 border-[#99F6E4] text-[#0F766E]'
                        : 'bg-white border-stone-200/90 text-stone-700 hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    <option value="">Any Distance</option>
                    <option value="2">Within 2 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-stone-600 transition-colors" />
                </div>

                {/* Remote Toggle Pill */}
                <button
                  type="button"
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer shadow-2xs ${
                    remoteOnly
                      ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]'
                      : 'bg-white border-stone-200/90 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Remote Only</span>
                </button>

                {/* Bookmarked Jobs Toggle Pill */}
                <button
                  type="button"
                  onClick={() => setSavedOnly(!savedOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer shadow-2xs ${
                    savedOnly
                      ? 'bg-[#FFEDD5] text-[#F97316] border-[#FED7AA]'
                      : 'bg-white border-stone-200/90 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Saved ({savedJobIds.length})</span>
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] bg-[#FFEDD5]/60 hover:bg-[#FFEDD5] border border-[#FED7AA] transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
                    title="Reset all active filters"
                  >
                    <RotateCcw className="w-3 h-3 text-[#EA580C]" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Sort By Dropdown & View Mode Switcher */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400 font-medium text-xs whitespace-nowrap hidden sm:inline">Rank by:</span>
                  <div className="relative group">
                    <SlidersHorizontal className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-hover:text-stone-600 transition-colors" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-8 pr-7 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-stone-200/90 bg-white hover:bg-stone-50/70 text-stone-800 shadow-2xs focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 transition-all duration-150"
                    >
                      <option value="best_match">Best AI Match</option>
                      <option value="proximity">Closest Proximity</option>
                      <option value="newest">Recently Posted</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-stone-600 transition-colors" />
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#0F766E] shadow-2xs font-bold'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-[#0F766E] shadow-2xs font-bold'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Results Content Area */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Results Header Count & Active Filter Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#78716C]">
          <div className="flex items-center gap-2">
            <span>
              Showing <b className="text-[#1C1917] font-bold">{displayedJobs.length}</b> verified engineering opportunities
            </span>
            {savedOnly && (
              <span className="badge-pill bg-[#FFEDD5] text-[#F97316] border-[#FED7AA] text-[10px]">
                Bookmarked Only
              </span>
            )}
            {remoteOnly && (
              <span className="badge-pill bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA] text-[10px]">
                Remote Only
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#78716C]">
            Updated in real-time
          </span>
        </div>

        {/* Grid or List of Results */}
        {loading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-[14px] border border-[#E7E5E4] text-center space-y-4 shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-[#1C1917]">No Matching Opportunities Found</p>
              <p className="text-xs text-[#78716C] max-w-md mx-auto mt-1">
                {savedOnly 
                  ? "You haven't bookmarked any jobs yet. Browse the open engineering roles and tap the bookmark icon on any job card to save it."
                  : "Try expanding your search query or loosening your location hub and match score filters."}
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3.5"}>
            {displayedJobs.map((job) => (
              <JobCard key={job.id} job={job} layout={viewMode} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
