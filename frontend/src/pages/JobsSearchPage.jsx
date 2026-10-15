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
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
      
      {/* Title & AI Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Explore Opportunities</h1>
          <p className="text-sm text-[#475569] mt-1">
            Semantic search and proximity-ranked internships and entry-level engineering jobs.
          </p>
        </div>

        {/* AI Mode Banner */}
        <div className="flex items-center gap-2 bg-[#ECFEFF] border border-[#A5F3FC] px-3.5 py-1.5 rounded-[10px] text-xs font-bold text-[#0E7490]">
          <Sparkles className="w-4 h-4 text-[#06B6D4] animate-pulse" />
          <span>Semantic Hybrid Match Active</span>
        </div>
      </div>

      {/* Large Search Input & Controls Bar */}
      <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          
          {/* Main search text */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, technical skills, or company (e.g. Python, Docker, TechNova)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] focus-ring font-medium text-[#0F172A]"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-[10px] transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Natural Language Quick Search Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#64748B] font-semibold text-[11px] mr-1">Quick Suggestions:</span>
          {quickPills.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (p.query) setSearchQuery(p.query);
                if (p.loc) setLocation(p.loc);
                fetchJobs();
              }}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-[#475569] hover:bg-slate-200 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Filter Sliders & Dropdown Selectors */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Hub Location Filter */}
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A]"
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
              className="px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A]"
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
              className="px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A]"
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
              className="px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A]"
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
                className="inline-flex items-center gap-1 text-xs text-[#EF4444] hover:underline font-semibold"
              >
                <X className="w-3.5 h-3.5" />
                Reset filters
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] font-medium text-[11px]">Rank by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A]"
            >
              <option value="best_match">Best AI Match</option>
              <option value="proximity">Closest Proximity</option>
              <option value="newest">Recently Posted</option>
            </select>
          </div>
        </div>

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-[#64748B]">
        <span>
          Showing <b className="n text-[#0F172A]">{jobs.length}</b> verified opportunities
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
        <div className="bg-white p-12 rounded-[16px] border border-[#E2E8F0] text-center space-y-3">
          <p className="text-base font-bold text-[#0F172A]">No Matching Opportunities Found</p>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Try expanding your search criteria or adjusting your location hub and radius filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white text-xs font-bold"
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
  );
}
