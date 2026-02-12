import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@clerk/clerk-react';
import { apiRequest, getAuthToken } from "../../config/api.js";

const SavedSchemes = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingStates, setRemovingStates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const loadSavedSchemes = async () => {
      if (!isSignedIn) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        const response = await apiRequest('/users/me/saved-schemes', { clerkToken: token });
        setSavedSchemes(response.data || []);
        setError(null);
      } catch (err) {
        setError(`Failed to load saved schemes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadSavedSchemes();
  }, [navigate, isSignedIn, getToken]);

  const handleRemoveSaved = async (schemeId) => {
    setRemovingStates(prev => ({ ...prev, [schemeId]: true }));
    
    try {
      const token = await getToken();
      await apiRequest(`/users/me/saved-schemes/${schemeId}`, { method: 'DELETE', clerkToken: token });
      setSavedSchemes(prev => prev.filter(scheme => (scheme._id || scheme.id) !== schemeId));
    } catch (error) {
      console.error('Failed to remove saved scheme:', error);
    } finally {
      setRemovingStates(prev => ({ ...prev, [schemeId]: false }));
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

  const filteredSchemes = useMemo(() => {
    let result = [...savedSchemes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        (s.scheme_name || s.schemeName || "").toLowerCase().includes(q) ||
        (s.details || "").toLowerCase().includes(q) ||
        (s.schemeCategory || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "name-asc") {
      result.sort((a, b) => (a.scheme_name || a.schemeName || "").localeCompare(b.scheme_name || b.schemeName || ""));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => (b.scheme_name || b.schemeName || "").localeCompare(a.scheme_name || a.schemeName || ""));
    }
    return result;
  }, [savedSchemes, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-800">Loading your saved schemes...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ===== PAGE HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">My Saved Schemes</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                {savedSchemes.length} {savedSchemes.length === 1 ? 'Scheme' : 'Schemes'}
              </span>
            </div>
            <p className="text-base text-gray-500">
              Review and manage the government programs you&apos;ve bookmarked for later.
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved..."
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none w-44 sm:w-52 transition-colors"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white appearance-none cursor-pointer pr-9 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="name-asc">Sort by: Name A-Z</option>
                <option value="name-desc">Sort by: Name Z-A</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ===== EMPTY STATE ===== */}
        {savedSchemes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Schemes Yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Start exploring government schemes and bookmark the ones that matter to you.
            </p>
            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse All Schemes
            </Link>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No matching schemes</h3>
            <p className="text-sm text-gray-500">Try a different search term.</p>
          </div>
        ) : (
          /* ===== SCHEME CARDS GRID ===== */
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {filteredSchemes.map((scheme) => {
              const id = scheme._id || scheme.id;
              return (
                <div
                  key={id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex flex-col"
                >
                  <div className="p-6 flex flex-col flex-1">
                    {/* Top Row: Category badge + Remove icon */}
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

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveSaved(id)}
                        disabled={removingStates[id]}
                        className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${
                          removingStates[id]
                            ? 'opacity-50 cursor-not-allowed text-gray-300'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                        title="Remove from saved"
                      >
                        {removingStates[id] ? (
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">
                      {scheme.scheme_name || scheme.schemeName || "No Name"}
                    </h3>

                    {/* Description */}
                    {scheme.details && (
                      <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3 flex-1">
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
                      <Link
                        to={`/schemes/${id}`}
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/schemes/${id}`}
                        className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== BROWSE MORE CTA ===== */}
        {savedSchemes.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Looking for more?</h4>
            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
              There are many more schemes available. Browse and bookmark the ones relevant to you.
            </p>
            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse All Schemes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSchemes;
