import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../config/api.js';

function Eligibility() {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  
  // Behave like a popup/modal: lock body scroll and close on ESC
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') navigate(-1); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await apiRequest(`/schemes/${schemeId}/eligibility-questions`);
        const qs = resp?.data?.questions || [];
        setQuestions(qs);
        const init = {};
        qs.forEach(q => { init[q.key] = ''; });
        setAnswers(init);
      } finally {
        setLoading(false);
      }
    };
    if (schemeId) load();
  }, [schemeId]);

  const submit = async () => {
    try {
      setLoading(true);
      const resp = await apiRequest(`/schemes/${schemeId}/check-eligibility`, { method: 'POST', body: { answers } });
      setResult(resp?.data || { eligible: false, failures: [] });
    } catch (e) {
      setResult({ eligible: false, failures: [{ key: 'submit', question: 'Submit answers', reason: e.message || 'Unknown error' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => navigate(-1)}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[80vh] overflow-y-auto border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h1 className="text-xl font-semibold text-gray-900">Check Eligibility</h1>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => navigate(-1)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="p-4">
          {questions.length === 0 && !loading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <span className="text-gray-700">No eligibility questions configured for this scheme.</span>
            </div>
          )}

          {questions.map(q => (
            <div key={q.key} className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 mb-3">
              <label className="text-gray-900 font-medium">{q.question}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name={q.key}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    checked={answers[q.key] === 'yes'}
                    onChange={() => setAnswers({ ...answers, [q.key]: 'yes' })}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name={q.key}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    checked={answers[q.key] === 'no'}
                    onChange={() => setAnswers({ ...answers, [q.key]: 'no' })}
                  />
                  No
                </label>
              </div>
            </div>
          ))}

          {result && (
            <div className={`rounded-lg p-4 border ${result.eligible ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex flex-col gap-2">
                <span className={`font-semibold ${result.eligible ? 'text-emerald-700' : 'text-red-700'}`}>
                  {result.eligible ? 'You are eligible for this scheme.' : 'You are not eligible for this scheme.'}
                </span>
                {!result.eligible && result.failures?.length > 0 && (
                  <ul className="list-disc ml-6 text-red-600 text-sm">
                    {result.failures.map((f) => (
                      <li key={f.key}>
                        {f.question}: {f.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white mt-4">
            <button className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-md transition-colors" onClick={() => navigate(-1)}>Close</button>
            <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={submit} disabled={loading || questions.length === 0}>
              {loading ? 'Checking...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Eligibility;


