import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import SchemeSearch from './SchemeSearch.jsx';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getPreferredLangCode, isTtsSupported, speakText, speakViaCloud } from '../../utils/tts.js';
import { apiRequest } from '../../config/api.js';
import { useAuth } from '@clerk/clerk-react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js';
import { API_BASE_URL } from "../../config/api.js";

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
  const [savedSchemes, setSavedSchemes] = useState(new Set());
  const [savingStates, setSavingStates] = useState({});
  const [ttsAvailable, setTtsAvailable] = useState(false);
  const [ttsPlayingMap, setTtsPlayingMap] = useState({});
  // Refs to extract translated (visible) text per card
  const titleRefs = React.useRef({});
  const summaryRefs = React.useRef({});

  const [limit, setLimit] = useState(10);

  // URL search params syncing for filters/search
  const [searchParams, setSearchParams] = useSearchParams();
  // Applied filter state (drives fetching)
  const [level, setLevel] = useState(searchParams.get("level") || "all");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt:desc");

  // UI input state (does not trigger fetching until Apply)
  const [uiLevel, setUiLevel] = useState(searchParams.get("level") || "all");
  const [uiQ, setUiQ] = useState(searchParams.get("q") || "");
  const [uiSort, setUiSort] = useState(searchParams.get("sort") || "createdAt:desc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Initialize limit from URL once on mount
  useEffect(() => {
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);
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
    const obj = { limit };
    if (level && level !== "all") obj.level = level;
    if (q) obj.q = q;
    if (sort) obj.sort = sort;
    return obj;
  }, [limit, level, q, sort]);

  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['schemesList', queryObject],
    queryFn: async ({ pageParam = 1, signal }) => {
      const params = new URLSearchParams(queryObject);
      params.set('page', pageParam);
      const response = await axios.get(`${API_BASE_URL}/schemes?${params}`, { signal });
      return response.data?.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.CurrentPage < lastPage?.TotalPages) {
        return lastPage.CurrentPage + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const schemes = queryData?.pages.flatMap(page => page.scheme || []) || [];
  const totalSchemes = queryData?.pages[0]?.TotalSchemes || 0;
  const error = queryError ? `Failed to load schemes: ${queryError.message}` : null;

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '400px'
  });

  // Reflect applied filters to URL
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("limit", String(limit));
    if (level && level !== "all") next.set("level", level);
    if (q) next.set("q", q);
    if (sort) next.set("sort", sort);
    setSearchParams(next, { replace: true });
  }, [limit, level, q, sort, setSearchParams]);

  // Handle items per page change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
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
        <div className="py-8">

          {/* ===== MAIN CONTENT ===== */}
          <main className="w-full">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Schemes</h1>
                  <p className="text-sm sm:text-base text-gray-500 mt-1">
                  {totalSchemes > 0
                    ? `Showing ${totalSchemes} schemes based on your preferences`
                    : 'No schemes found'}
                  </p>
                </div>

                {/* Active Filters */}
                {(level !== "all" || q) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active:</span>
                    {level !== "all" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {level}
                      </span>
                    )}
                    {q && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        &quot;{q}&quot;
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                <SchemeSearch 
                  initialQuery={uiQ} 
                  onSearchSubmit={(val) => {
                    setUiQ(val);
                    setQ(val);
                  }}
                />

                <select
                  value={uiLevel}
                  onChange={(e) => { 
                    setUiLevel(e.target.value); 
                    setLevel(e.target.value); 
                  }}
                  className="w-full md:w-48 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                >
                  <option value="all">All India (Central)</option>
                  <option value="State">State Level</option>
                  <option value="Central">Central Level</option>
                </select>

                <select
                  value={uiSort}
                  onChange={(e) => { setUiSort(e.target.value); setSort(e.target.value); }}
                  className="w-full md:w-48 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                >
                  <option value="createdAt:desc">Relevance / Newest</option>
                  <option value="createdAt:asc">Oldest First</option>
                  <option value="scheme_name:asc">Name A-Z</option>
                  <option value="scheme_name:desc">Name Z-A</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setUiLevel("all");
                    setUiQ("");
                    setUiSort("createdAt:desc");
                    setLevel("all");
                    setQ("");
                    setSort("createdAt:desc");
                  }}
                  className="w-full md:w-auto md:ml-auto px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  Clear All
                </button>
              </div>
            </div>

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
                    setUiLevel("all"); setUiQ("");
                    setLevel("all"); setQ("");
                  }}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  View All Schemes
                </button>
              </div>
            ) : (
              /* ===== SCHEME CARDS GRID ===== */
              <div aria-live="polite" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
                {schemes.map((scheme) => (
                  <div
                    key={scheme._id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex flex-col"
                  >
                    <div className="p-4 sm:p-6 flex flex-col flex-1">
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

            {/* ===== INFINITE SCROLL SENTINEL & LOADERS ===== */}
            {schemes.length > 0 && (
              <div className="flex flex-col items-center pb-8 space-y-6">
                {/* Sentinel Element */}
                <div ref={sentinelRef} aria-hidden="true" className="w-full h-1" />

                {isFetchingNextPage && (
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col h-64 animate-pulse">
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!hasNextPage && (
                  <p className="text-gray-500 text-sm font-medium py-4">
                    You&apos;ve reached the end of the list.
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SchemesList;
