import React from 'react';

const ApplicationProcess = ({ scheme }) => {
  const steps = [
    {
      step: 1,
      title: "Check Eligibility",
      description: "Verify that you meet all eligibility criteria"
    },
    {
      step: 2,
      title: "Gather Documents",
      description: "Collect all required documents and certificates"
    },
    {
      step: 3,
      title: "Fill Application",
      description: "Complete the application form online or offline"
    },
    {
      step: 4,
      title: "Submit Application",
      description: "Submit your application with all documents"
    },
    {
      step: 5,
      title: "Track Status",
      description: "Monitor your application status online"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How to Apply</h3>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.step} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
          
          <hr className="my-6 border-gray-200" />
          
          <div className="flex justify-center">
            <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors">
              Start Application
            </button>
          </div>
      </div>
    </div>
  );
};

export default ApplicationProcess;