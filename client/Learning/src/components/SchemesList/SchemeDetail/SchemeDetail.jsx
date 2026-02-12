import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { isTtsSupported, speakText, stopSpeaking, speakViaCloud, getPreferredLangCode } from '../../../utils/tts.js';
import { apiRequest, getAuthToken } from '../../../config/api.js';

const splitIntoDocuments = (documentsText) => {
  if (!documentsText || typeof documentsText !== 'string') return [];
  const normalized = documentsText
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/\u2022/g, ' ')
    .replace(/\*/g, ' ')
    .trim();

  const parts = normalized
    .split(/\n|\.|;|,/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const seen = new Set();
  const unique = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }
  return unique;
};

const mapToDocObjects = (items) => {
  return items.map((text) => {
    const lower = text.toLowerCase();
    const optional = lower.includes('optional') || lower.includes('if applicable');
    return {
      name: text,
      required: !optional,
      description: ''
    };
  });
};

const SchemeDetail = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [eligibilityQuestions, setEligibilityQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(false);
  const [ttsTitlePlaying, setTtsTitlePlaying] = useState(false);
  const [ttsOverviewPlaying, setTtsOverviewPlaying] = useState(false);
  const [ttsBenefitsPlaying, setTtsBenefitsPlaying] = useState(false);
  const [ttsEligibilityPlaying, setTtsEligibilityPlaying] = useState(false);
  const [ttsApplicationPlaying, setTtsApplicationPlaying] = useState(false);
  const [ttsDocumentsPlaying, setTtsDocumentsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userDocs, setUserDocs] = useState([]);

  // Refs for scrolling to sections
  const overviewRef = useRef(null);
  const benefitsRef = useRef(null);
  const eligibilityRef = useRef(null);
  const applicationRef = useRef(null);
  const documentsRef = useRef(null);
  // Refs for grabbing translated (visible) text
  const titleTextRef = useRef(null);
  const overviewTextRef = useRef(null);
  const benefitsTextRef = useRef(null);
  const eligibilityTextRef = useRef(null);
  const applicationTextRef = useRef(null);
  const documentsTextRef = useRef(null);

  // Icons
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

  useEffect(() => {
    const fetchSchemeDetail = async () => {
      try {
        setLoading(true);
        console.log('Fetching scheme with ID:', schemeId);
        
        const response = await apiRequest(`/schemes/${schemeId}`);
        
        console.log('Scheme detail response:', response);
        
        if (response && response.data) {
          setScheme(response.data);
        } else {
          setError('Scheme not found');
        }
      } catch (err) {
        console.error('Error fetching scheme details:', err);
        setError(`Failed to load scheme details: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (schemeId) {
      fetchSchemeDetail();
    }
  }, [schemeId]);

  useEffect(() => {
    setTtsAvailable(isTtsSupported());
    // In some browsers voices load async
    if (isTtsSupported()) {
      const onVoices = () => {};
      window.speechSynthesis.onvoiceschanged = onVoices;
    }
  }, []);

  const handleSpeak = async (text, fromRef) => {
    let toRead = text;
    if (fromRef && fromRef.current) {
      const visible = fromRef.current.innerText || fromRef.current.textContent || "";
      if (visible && visible.trim().length > 0) toRead = visible.trim();
    }
    if (!toRead) return;
    try {
      if (isTtsSupported()) {
        speakText(toRead, getPreferredLangCode());
      } else {
        await speakViaCloud(toRead, { lang: getPreferredLangCode() });
      }
    } catch (e) {
      try {
        await speakViaCloud(toRead, { lang: getPreferredLangCode() });
      } catch (_) {}
    }
  };

  // Load user info for docs and saved state
  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const token = await getToken();
        const me = await apiRequest('/users/me', { clerkToken: token });
        setUserDocs(Array.isArray(me.data?.documents) ? me.data.documents : []);
        // check saved schemes
        const saved = await apiRequest('/users/me/saved-schemes', { clerkToken: token });
        const arr = Array.isArray(saved.data) ? saved.data : [];
        setIsSaved(arr.some((s) => (s?._id || s?.id) === schemeId));
      } catch (e) {
        // ignore if unauthenticated
      }
    })();
  }, [schemeId, isSignedIn, getToken]);

  // Handle tab click and scroll to section
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    
    // Scroll to the corresponding section
    switch (tabId) {
      case 'overview':
        overviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      case 'benefits':
        benefitsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      case 'eligibility':
        eligibilityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      case 'application':
        applicationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      case 'documents':
        documentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      default:
        break;
    }
  };

  const loadEligibilityQuestions = async () => {
    if (!schemeId) return;
    try {
      setEligibilityLoading(true);
      setEligibilityResult(null);
      const resp = await apiRequest(`/schemes/${schemeId}/eligibility-questions`);
      const questions = resp?.data?.data?.questions || [];
      setEligibilityQuestions(questions);
      const initial = {};
      questions.forEach(q => { initial[q.key] = ''; });
      setAnswers(initial);
    } catch (e) {
      setEligibilityResult({ eligible: false, failures: [{ key: 'load', question: 'Load questions', reason: e.response?.data?.message || e.message }] });
    } finally {
      setEligibilityLoading(false);
    }
  };

  const submitEligibility = async () => {
    if (!schemeId) return;
    try {
      setEligibilityLoading(true);
      const resp = await apiRequest(`/schemes/${schemeId}/check-eligibility`, { method: 'POST', body: { answers } });
      setEligibilityResult(resp?.data?.data || { eligible: false, failures: [] });
    } catch (e) {
      setEligibilityResult({ eligible: false, failures: [{ key: 'submit', question: 'Submit answers', reason: e.response?.data?.message || e.message }] });
    } finally {
      setEligibilityLoading(false);
    }
  };

  // Navigate to dedicated eligibility page
  const handleCheckEligibility = () => {
    navigate(`/schemes/${schemeId}/eligibility`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-800">Loading scheme details...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait</p>
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
          <Link to="/schemes" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
            Back to Schemes
          </Link>
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-4 text-center border border-gray-200">
          <svg className="w-16 h-16 text-amber-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Scheme not found</h2>
          <p className="text-gray-600 mb-6 text-sm">The scheme you are looking for does not exist.</p>
          <Link to="/schemes" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
            Back to Schemes
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'application', label: 'Application Process' },
    { id: 'documents', label: 'Required Documents' },
  ];

  return (
    <div className="min-h-screen bg-white">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
          <Link to="/schemes" className="hover:text-emerald-600 transition-colors">Schemes</Link>
          <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
          <span className="text-gray-800 font-medium truncate">{scheme.scheme_name || scheme.schemeName}</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 ref={titleTextRef} className="text-3xl font-bold text-gray-900">
                {scheme.scheme_name || scheme.schemeName || 'Scheme Details'}
              </h1>
              {ttsAvailable && (
                <button
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                  title={ttsTitlePlaying ? "Stop" : "Read title"}
                  onClick={() => {
                    if (ttsTitlePlaying) {
                      stopSpeaking();
                      setTtsTitlePlaying(false);
                    } else {
                      handleSpeak(scheme.scheme_name || scheme.schemeName || 'Scheme Details', titleTextRef);
                      setTtsTitlePlaying(true);
                    }
                  }}
                >
                  {ttsTitlePlaying ? <StopIcon /> : <SpeakerIcon />}
                </button>
              )}
            </div>
            <p className="text-base text-gray-500 mt-1">
              {scheme.schemeCategory} &middot; {scheme.level} Level
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors">
              Apply Now
            </button>
            <button
              className={`px-5 py-2.5 text-sm font-semibold rounded-md border transition-colors ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={saving}
              onClick={async () => {
                if (!isSignedIn) {
                  navigate('/login');
                  return;
                }
                setSaving(true);
                try {
                  const token = await getToken();
                  if (isSaved) {
                    await apiRequest(`/users/me/saved-schemes/${schemeId}`, { method: 'DELETE', clerkToken: token });
                    setIsSaved(false);
                  } else {
                    await apiRequest(`/users/me/saved-schemes/${schemeId}`, { method: 'POST', clerkToken: token });
                    setIsSaved(true);
                  }
                } catch (e) {
                  console.error('Save toggle failed', e);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-md border border-emerald-200 transition-colors"
              onClick={handleCheckEligibility}
              disabled={eligibilityLoading}
            >
              {eligibilityLoading ? 'Loading...' : 'Check Eligibility'}
            </button>
            <button 
              className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-md transition-colors"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pt-4 pb-0 mb-8">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* All Content in One Page */}
      <div className="space-y-8">
        
        {/* Overview Section */}
        <div ref={overviewRef} id="overview-section" className="scroll-mt-32">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                {ttsAvailable && (
                  <>
                    <button
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                      title={ttsOverviewPlaying ? "Stop" : "Read overview"}
                      onClick={() => {
                        if (ttsOverviewPlaying) {
                          stopSpeaking();
                          setTtsOverviewPlaying(false);
                        } else {
                          handleSpeak(scheme.details || 'No detailed description available.', overviewTextRef);
                          setTtsOverviewPlaying(true);
                        }
                      }}
                    >
                      {ttsOverviewPlaying ? <StopIcon /> : <SpeakerIcon />}
                    </button>
                  </>
                )}
              </div>
              <div className="space-y-4">
                <p ref={overviewTextRef} className="text-gray-700 text-base leading-relaxed">{scheme.details || 'No detailed description available.'}</p>
                
                <div className="flex flex-wrap gap-2">
                  {scheme.schemeCategory && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">{scheme.schemeCategory}</span>
                  )}
                  
                  {scheme.level && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">{scheme.level}</span>
                  )}
                  
                  {/* Display tags as badges */}
                  {scheme.tags && scheme.tags.length > 0 && (
                    <>
                      {scheme.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                          #{tag}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                
                {scheme.ministry && (
                  <div className="mt-4">
                    <span className="font-semibold text-gray-900">Ministry: </span>
                    <span className="text-gray-700">{scheme.ministry}</span>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div ref={benefitsRef} id="benefits-section" className="scroll-mt-32">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Benefits</h2>
                {scheme.benefits && (
                  <>
                    <button
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                      title={ttsBenefitsPlaying ? "Stop" : "Read benefits"}
                      onClick={() => {
                        if (ttsBenefitsPlaying) {
                          stopSpeaking();
                          setTtsBenefitsPlaying(false);
                        } else {
                          handleSpeak(scheme.benefits, benefitsTextRef);
                          setTtsBenefitsPlaying(true);
                        }
                      }}
                    >
                      {ttsBenefitsPlaying ? <StopIcon /> : <SpeakerIcon />}
                    </button>
                  </>
                )}
              </div>
              <div className="space-y-4">
                {scheme.benefits ? (
                  <p ref={benefitsTextRef} className="text-gray-700 text-base leading-relaxed">{scheme.benefits}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Financial Support</h4>
                        <p className="text-sm text-gray-500">Direct financial assistance for eligible farmers</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Subsidies</h4>
                        <p className="text-sm text-gray-500">Government subsidies on agricultural equipment</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Training</h4>
                        <p className="text-sm text-gray-500">Free training and skill development programs</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Insurance Coverage</h4>
                        <p className="text-sm text-gray-500">Crop insurance and risk coverage</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Eligibility Section */}
        <div ref={eligibilityRef} id="eligibility-section" className="scroll-mt-32">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">Eligibility Criteria</h2>
                  {scheme.eligibility && (
                    <>
                      <button
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                        title={ttsEligibilityPlaying ? "Stop" : "Read eligibility"}
                        onClick={() => {
                          if (ttsEligibilityPlaying) {
                            stopSpeaking();
                            setTtsEligibilityPlaying(false);
                          } else {
                            handleSpeak(scheme.eligibility, eligibilityTextRef);
                            setTtsEligibilityPlaying(true);
                          }
                        }}
                      >
                        {ttsEligibilityPlaying ? <StopIcon /> : <SpeakerIcon />}
                      </button>
                    </>
                  )}
                </div>
                <button
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-md border border-emerald-200 transition-colors"
                  onClick={handleCheckEligibility}
                  disabled={eligibilityLoading}
                >
                  {eligibilityLoading ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full mr-2"></span>
                      Loading...
                    </>
                  ) : (
                    'Check Eligibility'
                  )}
                </button>
              </div>
              <div className="space-y-4">
                {(
                  <>
                    {scheme.eligibility && (
                      <p ref={eligibilityTextRef} className="text-gray-700 text-base leading-relaxed">{scheme.eligibility}</p>
                    )}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-gray-700 text-sm">Click the "Check Eligibility" button to answer a few yes/no questions and instantly know your eligibility status.</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
          </div>
        </div>

        {/* Eligibility modal replaced by dedicated page */}

        {/* Application Process Section */}
        <div ref={applicationRef} id="application-section" className="scroll-mt-32">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Application Process</h2>
                {scheme.application && (
                  <>
                    <button
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                      title={ttsApplicationPlaying ? "Stop" : "Read application process"}
                      onClick={() => {
                        if (ttsApplicationPlaying) {
                          stopSpeaking();
                          setTtsApplicationPlaying(false);
                        } else {
                          handleSpeak(scheme.application, applicationTextRef);
                          setTtsApplicationPlaying(true);
                        }
                      }}
                    >
                      {ttsApplicationPlaying ? <StopIcon /> : <SpeakerIcon />}
                    </button>
                  </>
                )}
              </div>
              <div className="space-y-4">
                {scheme.application ? (
                  <p ref={applicationTextRef} className="text-gray-700 text-base leading-relaxed">{scheme.application}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <span className="text-gray-700 text-sm">Check if you meet the following criteria:</span>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">Must be a registered farmer with valid documents</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">Age between 18-60 years</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">Must have valid land ownership documents</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">Annual income below specified limit</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">Must belong to eligible category (if applicable)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Required Documents Section */}
        <div ref={documentsRef} id="documents-section" className="scroll-mt-32">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Required Documents</h2>
                {scheme.documents && (
                  <>
                    <button
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                      title={ttsDocumentsPlaying ? "Stop" : "Read documents"}
                      onClick={() => {
                        if (ttsDocumentsPlaying) {
                          stopSpeaking();
                          setTtsDocumentsPlaying(false);
                        } else {
                          handleSpeak(scheme.documents, documentsTextRef);
                          setTtsDocumentsPlaying(true);
                        }
                      }}
                    >
                      {ttsDocumentsPlaying ? <StopIcon /> : <SpeakerIcon />}
                    </button>
                  </>
                )}
              </div>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <span className="text-gray-700 text-sm">Please ensure all documents are valid and clearly readable</span>
                </div>
                {(() => {
                  const parsed = mapToDocObjects(splitIntoDocuments(scheme?.documents));
                  const normalize = (s) => (s || '').toLowerCase();
                  const uploadedTypes = (userDocs || []).map((d) => normalize(d.type));
                  const isUploadedMatch = (docName) => {
                    const n = normalize(docName);
                    return uploadedTypes.some((t) => n.includes(t) || t.includes(n));
                  };
                  return (
                    <div ref={documentsTextRef} className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-gray-600 text-sm font-semibold py-3 pr-4">Document</th>
                            <th className="text-gray-600 text-sm font-semibold py-3 pr-4">Required</th>
                            <th className="text-gray-600 text-sm font-semibold py-3">Uploaded</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(parsed.length > 0 ? parsed : [
                            { name: 'No documents information available for this scheme.', required: false, description: '' }
                          ]).map((doc, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="font-medium text-gray-800 py-3 pr-4">{doc.name}</td>
                              <td className="py-3 pr-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${doc.required ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {doc.required ? 'Required' : 'Optional'}
                                </span>
                              </td>
                              <td className="py-3">
                                {isUploadedMatch(doc.name) ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Yes</span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">No</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Helpline Number</h4>
                <p className="text-emerald-600 text-lg">1800-XXX-XXXX</p>
                <p className="text-sm text-gray-500">Toll-free, 24/7 support</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                <p className="text-emerald-600 text-lg">support@farmerschemes.gov.in</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </div>
            </div>
        </div>
      </div>
      
      {/* Debug Info */}
      <div className="mt-8">
        <details className="bg-white rounded-lg border border-gray-200">
          <summary className="px-6 py-4 cursor-pointer text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Debug Info
          </summary>
          <div className="px-6 pb-6">
            <pre className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm overflow-auto text-gray-700">
              {JSON.stringify(scheme, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
    </div>
  );
};

export default SchemeDetail;