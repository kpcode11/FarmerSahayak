import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from "../../config/api.js";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest, getAuthToken } from "../../config/api.js";
import { isTtsSupported, speakText, stopSpeaking, speakViaCloud, getPreferredLangCode } from "../../utils/tts.js";

// Icon components defined outside to prevent re-render issues
const SavedIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const SpeakerIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10H7L11 6V18L7 14H4V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.54 8.46C16.4779 9.39788 17.0054 10.6699 17.0054 12C17.0054 13.3301 16.4779 14.6021 15.54 15.54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.07 5.93C19.9377 7.79766 20.9974 10.337 20.9974 13C20.9974 15.663 19.9377 18.2023 18.07 20.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StopIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const SchemesList = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedSchemes, setSavedSchemes] = useState(new Set());
  const [savingStates, setSavingStates] = useState({});
  const [ttsAvailable, setTtsAvailable] = useState(false);
  const [ttsPlayingMap, setTtsPlayingMap] = useState({});
  // Refs to extract translated (visible) text per card
  const titleRefs = React.useRef({});
  const summaryRefs = React.useRef({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [limit, setLimit] = useState(10);

  // URL search params syncing for filters/search
  const [searchParams, setSearchParams] = useSearchParams();
  // Applied filter state (drives fetching)
  const [level, setLevel] = useState(searchParams.get("level") || "all");
  const [schemeCategory, setSchemeCategory] = useState(searchParams.get("schemeCategory") || "");
  const [tags, setTags] = useState(searchParams.get("tags") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt:desc");

  // UI input state (does not trigger fetching until Apply)
  const [uiLevel, setUiLevel] = useState(searchParams.get("level") || "all");
  const [uiSchemeCategory, setUiSchemeCategory] = useState(searchParams.get("schemeCategory") || "");
  const [uiTags, setUiTags] = useState(searchParams.get("tags") || "");
  const [uiQ, setUiQ] = useState(searchParams.get("q") || "");
  const [uiSort, setUiSort] = useState(searchParams.get("sort") || "createdAt:desc");

  // Initialize page/limit from URL once on mount
  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);
    if (!isNaN(pageParam)) setCurrentPage(pageParam);
    if (!isNaN(limitParam)) setLimit(limitParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Init TTS availability
  useEffect(() => {
    setTtsAvailable(isTtsSupported());
    if (isTtsSupported()) {
      const onVoices = () => {};
      window.speechSynthesis.onvoiceschanged = onVoices;
    }
  }, []);

  const handleSpeak = async (text) => {
    if (!text) return;
    try {
      if (isTtsSupported()) {
        speakText(text, getPreferredLangCode());
      } else {
        await speakViaCloud(text, { lang: getPreferredLangCode() });
      }
    } catch (e) {
      try {
        await speakViaCloud(text, { lang: getPreferredLangCode() });
      } catch (_) {}
    }
  };

  // Load saved schemes for logged-in users
  useEffect(() => {
    const loadSavedSchemes = async () => {
      if (!isSignedIn) return;
      
      try {
        const token = await getToken();
        const response = await apiRequest('/users/me/saved-schemes', { clerkToken: token });
        const saved = response.data || [];
        const savedIds = new Set(saved.map(s => s._id || s.id));
        setSavedSchemes(savedIds);
      } catch (error) {
        console.error('Failed to load saved schemes:', error);
      }
    };

    loadSavedSchemes();
  }, [isSignedIn, getToken]);

  const queryObject = useMemo(() => {
    const obj = { page: currentPage, limit };
    if (level && level !== "all") obj.level = level;
    if (schemeCategory) obj.schemeCategory = schemeCategory;
    if (tags) obj.tags = tags;
    if (q) obj.q = q;
    if (sort) obj.sort = sort;
    return obj;
  }, [currentPage, limit, level, schemeCategory, tags, q, sort]);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(queryObject).toString();
        const response = await axios.get(`${API_BASE_URL}/schemes?${params}`);

        if (response.data && response.data.data && response.data.data.scheme) {
          setSchemes(response.data.data.scheme);
          setTotalPages(response.data.data.TotalPages || 0);
          setCurrentPage(response.data.data.CurrentPage || 1);
          setTotalSchemes(
            response.data.data.TotalSchemes ||
              response.data.data.TotalPages * limit
          );
        } else {
          setSchemes([]);
          setTotalPages(0);
          setTotalSchemes(0);
        }

        setError(null);
      } catch (err) {
        setError(`Failed to load schemes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [queryObject]);

  // Reflect applied filters to URL
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("page", String(currentPage));
    next.set("limit", String(limit));
    if (level && level !== "all") next.set("level", level);
    if (schemeCategory) next.set("schemeCategory", schemeCategory);
    if (tags) next.set("tags", tags);
    if (q) next.set("q", q);
    if (sort) next.set("sort", sort);
    setSearchParams(next, { replace: true });
  }, [currentPage, limit, level, schemeCategory, tags, q, sort, setSearchParams]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  // Handle items per page change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLevel(uiLevel);
    setSchemeCategory(uiSchemeCategory);
    setTags(uiTags);
    setQ(uiQ);
    setSort(uiSort);
    setCurrentPage(1);
  };

  // Handle save/unsave scheme
  const handleSaveToggle = async (schemeId) => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }

    setSavingStates(prev => ({ ...prev, [schemeId]: true }));
    
    try {
      const token = await getToken();
      const isCurrentlySaved = savedSchemes.has(schemeId);
      
      if (isCurrentlySaved) {
        await apiRequest(`/users/me/saved-schemes/${schemeId}`, { method: 'DELETE', clerkToken: token });
        setSavedSchemes(prev => {
          const newSet = new Set(prev);
          newSet.delete(schemeId);
          return newSet;
        });
      } else {
        await apiRequest(`/users/me/saved-schemes/${schemeId}`, { method: 'POST', clerkToken: token });
        setSavedSchemes(prev => new Set([...prev, schemeId]));
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    } finally {
      setSavingStates(prev => ({ ...prev, [schemeId]: false }));
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = 5;
      }
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const getCategoryBadgeColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'agriculture': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'insurance': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'education': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'healthcare': return 'bg-red-100 text-red-700 border-red-300';
      case 'housing': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'employment': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'financial aid': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'credit / loans': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'machinery': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'irrigation': return 'bg-sky-100 text-sky-700 border-sky-300';
      case 'livestock': return 'bg-lime-100 text-lime-700 border-lime-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-800">Loading schemes...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the latest schemes</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-4 text-center border border-gray-200">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 py-8">

          {/* ===== LEFT SIDEBAR ===== */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <form onSubmit={handleSearchSubmit} className="space-y-7">

              {/* Level / Location Filter */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">State / Location</h4>
                <div className="relative">
                  <select
                    value={uiLevel}
                    onChange={(e) => { setUiLevel(e.target.value); }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white appearance-none cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="all">All India (Central)</option>
                    <option value="State">State Level</option>
                    <option value="Central">Central Level</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Category</h4>
                <input
                  type="text"
                  value={uiSchemeCategory}
                  onChange={(e) => setUiSchemeCategory(e.target.value)}
                  placeholder="e.g. Agriculture"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Tags Filter */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Tags</h4>
                <input
                  type="text"
                  value={uiTags}
                  onChange={(e) => setUiTags(e.target.value)}
                  placeholder="comma,separated"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Apply & Clear */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUiLevel("all");
                    setUiSchemeCategory("");
                    setUiTags("");
                    setUiQ("");
                    setUiSort("createdAt:desc");
                    setLevel("all");
                    setSchemeCategory("");
                    setTags("");
                    setQ("");
                    setSort("createdAt:desc");
                    setCurrentPage(1);
                  }}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-semibold py-3 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Active Filters */}
              {(level !== "all" || schemeCategory || tags || q) && (
                <div className="pt-2 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Filters</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {level !== "all" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {level}
                      </span>
                    )}
                    {schemeCategory && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {schemeCategory}
                      </span>
                    )}
                    {tags && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tags}
                      </span>
                    )}
                    {q && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        &quot;{q}&quot;
                      </span>
                    )}
                  </div>
                </div>
              )}
            </form>
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <main className="flex-1 min-w-0">

            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Active Schemes</h1>
                <p className="text-base text-gray-500 mt-1">
                  {totalSchemes > 0
                    ? `Showing ${totalSchemes} schemes based on your preferences`
                    : 'No schemes found'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="search"
                    value={uiQ}
                    onChange={(e) => { setUiQ(e.target.value); setQ(e.target.value); setCurrentPage(1); }}
                    placeholder="Search schemes..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none w-52 sm:w-64 transition-colors"
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 whitespace-nowrap hidden sm:inline">Sort by:</label>
                  <div className="relative">
                    <select
                      value={uiSort}
                      onChange={(e) => { setUiSort(e.target.value); setSort(e.target.value); setCurrentPage(1); }}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white appearance-none cursor-pointer pr-9 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                    >
                      <option value="createdAt:desc">Relevance</option>
                      <option value="createdAt:asc">Oldest</option>
                      <option value="scheme_name:asc">Name A-Z</option>
                      <option value="scheme_name:desc">Name Z-A</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* No Results */}
            {schemes.length === 0 && !loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Schemes Found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your search criteria or clear all filters.
                </p>
                <button
                  onClick={() => {
                    setUiLevel("all"); setUiSchemeCategory(""); setUiTags(""); setUiQ("");
                    setLevel("all"); setSchemeCategory(""); setTags(""); setQ(""); setCurrentPage(1);
                  }}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  View All Schemes
                </button>
              </div>
            ) : (
              /* ===== SCHEME CARDS GRID ===== */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {schemes.map((scheme) => (
                  <div
                    key={scheme._id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex flex-col"
                  >
                    <div className="p-6 flex flex-col flex-1">
                      {/* Top: Badge + Level + Save */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {scheme.schemeCategory && (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold border ${getCategoryBadgeColor(scheme.schemeCategory)}`}>
                              {scheme.schemeCategory}
                            </span>
                          )}
                          {scheme.level && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {scheme.level}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleSaveToggle(scheme._id)}
                          disabled={savingStates[scheme._id]}
                          className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${
                            savingStates[scheme._id] ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            savedSchemes.has(scheme._id)
                              ? 'text-emerald-600'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title={savedSchemes.has(scheme._id) ? 'Unsave' : 'Save'}
                        >
                          {savingStates[scheme._id] ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : savedSchemes.has(scheme._id) ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                          ) : (
                            <SavedIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Title */}
                      <h3
                        ref={(el) => { if (el) titleRefs.current[scheme._id] = el; }}
                        className="text-base font-bold text-gray-900 leading-snug mb-2"
                      >
                        {scheme.scheme_name || scheme.schemeName || "No Name"}
                      </h3>

                      {/* Description */}
                      {scheme.details && (
                        <p
                          ref={(el) => { if (el) summaryRefs.current[scheme._id] = el; }}
                          className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3 flex-1"
                        >
                          {scheme.details.length > 160
                            ? `${scheme.details.substring(0, 160)}...`
                            : scheme.details}
                        </p>
                      )}

                      {/* Info Rows */}
                      <div className="space-y-2.5 mb-5">
                        {scheme.schemeCategory && (
                          <div className="flex items-start gap-2.5">
                            <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-400">Category</p>
                              <p className="text-sm font-medium text-gray-800">{scheme.schemeCategory}</p>
                            </div>
                          </div>
                        )}
                        {scheme.tags && scheme.tags.length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-400">Tags</p>
                              <p className="text-sm font-medium text-gray-800">{scheme.tags.slice(0, 3).join(', ')}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          {/* Listen Button */}
                          {ttsAvailable && (
                            <button
                              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                              title={ttsPlayingMap[scheme._id] ? "Stop" : "Listen"}
                              onClick={() => {
                                const isPlaying = !!ttsPlayingMap[scheme._id];
                                if (isPlaying) {
                                  stopSpeaking();
                                  setTtsPlayingMap((s) => ({ ...s, [scheme._id]: false }));
                                } else {
                                  const nameVis = titleRefs.current[scheme._id]?.innerText || titleRefs.current[scheme._id]?.textContent || (scheme.scheme_name || scheme.schemeName || "");
                                  const sumVis = summaryRefs.current[scheme._id]?.innerText || summaryRefs.current[scheme._id]?.textContent || (scheme.details || "");
                                  const summary = (sumVis || "").trim().slice(0, 220);
                                  const text = summary ? `${nameVis}. ${summary}` : nameVis;
                                  handleSpeak(text);
                                  setTtsPlayingMap((s) => ({ ...s, [scheme._id]: true }));
                                }
                              }}
                            >
                              {ttsPlayingMap[scheme._id] ? <StopIcon className="w-3.5 h-3.5" /> : <SpeakerIcon className="w-3.5 h-3.5" />}
                              {ttsPlayingMap[scheme._id] ? 'STOP' : 'LISTEN'}
                            </button>
                          )}
                          {/* <Link
                            to={`/schemes/${scheme._id}`}
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            View Details
                          </Link> */}
                        </div>

                        {/* View Details Button */}
                        <Link
                          to={`/schemes/${scheme._id}`}
                          className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-8">
                {/* Prev */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 flex items-center justify-center rounded-md border text-sm transition-colors ${
                    currentPage === 1
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Ellipsis */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">...</span>
                )}

                {/* Next */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 flex items-center justify-center rounded-md border text-sm transition-colors ${
                    currentPage === totalPages
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SchemesList;
