import React from 'react';

const Eligibility = ({ scheme }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Eligibility Criteria</h3>
          <div className="space-y-4">
            {scheme.eligibility ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{scheme.eligibility}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <span className="text-gray-700 text-sm">Check if you meet the following criteria:</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" disabled />
                    <span className="text-gray-700">Must be a registered farmer</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" disabled />
                    <span className="text-gray-700">Age between 18-60 years</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" disabled />
                    <span className="text-gray-700">Must have valid land ownership documents</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" disabled />
                    <span className="text-gray-700">Annual income below specified limit</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Eligibility;