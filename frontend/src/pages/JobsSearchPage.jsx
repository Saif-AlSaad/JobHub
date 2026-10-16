import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Sparkles, Filter, X, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function JobsSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('job_type') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'best_match');
  const [minMatch, setMinMatch] = useState(searchParams.get('min_match') || '');
  const [radiusKm, setRadiusKm] = useState(searchParams.get('radius_km') || '');

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
  }, [location, jobType, sortBy, minMatch, radiusKm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setJobType('');
    setMinMatch('');
    setRadiusKm('');
    setSortBy('best_match');
  };

  const hasActiveFilters = Boolean(searchQuery || location || jobType || minMatch || radiusKm);

  const quickPills = [
    { label: 'Junior Backend', query: 'Backend' },
    { label: 'Python & FastAPI', query: 'Python' },
    { label: 'React Frontend', query: 'React' },
    { label: 'Savar Smart City', loc: 'Savar' },
    { label: 'Banani Tech Hub', loc: 'Banani' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section with Seamless Radial Glow */}
      <div className="relative overflow-hidden hero-nordic-glow border-b border-[#E7E5E4]/80 py-10 px-6">
        <div className="max-w-[1280px] mx-auto space-y-6 relative z-10">
          
          {/* Title & AI Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                Proactive AI Placement Engine Active
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight font-heading">
                Explore Engineering Opportunities
              </h1>
              <p className="text-sm text-[#78716C] mt-1.5 max-w-2xl leading-relaxed">
                Semantic search and proximity-ranked internships and entry-level engineering jobs, tailored to your university skills and active hub radius.
              </p>
            </div>

            {/* AI Mode Banner */}
            <div className="flex items-center gap-2 bg-[#CCFBF1] border border-[#99F6E4] px-4 py-2 rounded-[10px] text-xs font-bold text-[#0F766E] shadow-xs self-start sm:self-auto">
              <Sparkles className="w-4 h-4 text-[#0F766E] animate-pulse" />
              <span>Semantic Hybrid Match Active</span>
            </div>
          </div>

          {/* Search Bar Container: Pure White, Rounded-XL, Warm Shadow */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#E7E5E4] shadow-[0_10px_25px_-5px_rgba(28,25,23,0.05)] space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              
              {/* Main search input with Deep Forest Teal focus ring */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, technical skills, or company (e.g. Python, Docker, TechNova)..."
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-[10px] border border-[#E7E5E4] bg-[#FAF8F5] focus-ring font-medium text-[#1C1917] placeholder-[#78716C]/70"
                />
              </div>

              {/* Secondary CTA Accent: Warm Terracotta */}
              <button
                type="submit"
                className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-[10px] shadow-[0_4px_12px_rgba(249,115,22,0.25)] transition-all duration-150 active:scale-[0.98]"
              >
                Search Jobs
              </button>
            </form>

            {/* Natural Language Quick Search Suggestion Chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[#78716C] font-semibold text-[11px] mr-1">Quick Suggestions:</span>
              {quickPills.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (p.query) setSearchQuery(p.query);
                    if (p.loc) setLocation(p.loc);
                    fetchJobs();
                  }}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F3EFEA] text-[#1C1917] border border-[#E7E5E4] hover:bg-[#CCFBF1] hover:text-[#0F766E] hover:border-[#99F6E4] transition-all duration-150"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Secondary Container: Subtle Warm Stone Filter Bar */}
            <div className="pt-3 border-t border-[#E7E5E4] flex flex-wrap items-center justify-between gap-3 text-xs bg-[#F3EFEA]/40 p-3 rounded-[10px]">
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Hub Location Filter */}
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-3 py-1.5 rounded-[8px] border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring"
                >
                  <option value="">All Locations</option>
                  <option value="Savar">Savar Hub</option>
                  <option value="Banani">Banani Hub</option>
                  <option value="Mohakhali">Mohakhali Hub</option>
                  <option value="Dhanmondi">Dhanmondi Hub</option>
                  <option value="Uttara">Uttara Hub</option>
                  <option value="Mirpur">Mirpur Hub</option>
                </select>

                {/* Job Type Filter */}
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="px-3 py-1.5 rounded-[8px] border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring"
                >
                  <option value="">All Job Types</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>

                {/* Min Match Score */}
                <select
                  value={minMatch}
                  onChange={(e) => setMinMatch(e.target.value)}
                  className="px-3 py-1.5 rounded-[8px] border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring"
                >
                  <option value="">Any Match %</option>
                  <option value="70">≥ 70% Match</option>
                  <option value="80">≥ 80% Match</option>
                  <option value="90">≥ 90% Match</option>
                </select>

                {/* Radius Filter */}
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="px-3 py-1.5 rounded-[8px] border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring"
                >
                  <option value="">Any Distance</option>
                  <option value="2">Within 2 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="20">Within 20 km</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs text-[#EA580C] hover:underline font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset filters
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[#78716C] font-medium text-[11px]">Rank by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-[8px] border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring"
                >
                  <option value="best_match">Best AI Match</option>
                  <option value="proximity">Closest Proximity</option>
                  <option value="newest">Recently Posted</option>
                </select>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Results Content Area */}
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
        
        {/* Results Header Count */}
        <div className="flex items-center justify-between text-xs text-[#78716C]">
          <span>
            Showing <b className="n text-[#1C1917] font-bold">{jobs.length}</b> verified engineering opportunities
          </span>
          <span className="text-[11px] text-[#78716C]">
            Updated in real-time
          </span>
        </div>

        {/* Grid of Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-[12px] border border-[#E7E5E4] text-center space-y-3 shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
            <p className="text-base font-bold text-[#1C1917]">No Matching Opportunities Found</p>
            <p className="text-xs text-[#78716C] max-w-md mx-auto">
              Try expanding your search criteria or adjusting your location hub and radius filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
