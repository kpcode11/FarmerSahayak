import React from 'react';

const Benefits = ({ scheme }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Key Benefits</h3>
          <div className="space-y-4">
            {scheme.benefits ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{scheme.benefits}</p>
              </div>
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
                    <h4 className="font-semibold text-gray-900">Insurance</h4>
                    <p className="text-sm text-gray-500">Crop insurance and risk coverage</p>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Benefits;