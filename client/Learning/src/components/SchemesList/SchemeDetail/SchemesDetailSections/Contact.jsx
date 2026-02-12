import React from 'react';

const Contact = ({ scheme }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Helpline Number</h4>
                <p className="text-emerald-600">1800-XXX-XXXX</p>
                <p className="text-sm text-gray-500">Toll-free, 24/7 support</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Email Support</h4>
                <p className="text-emerald-600">support@farmerschemes.gov.in</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Office Address</h4>
                <p className="text-gray-700">Department of Agriculture<br />
                Government Building<br />
                Your City, State - 123456</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Help</h3>
            <div className="space-y-4">
              <button className="w-full px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-md transition-colors">
                Download Application Form
              </button>
              <button className="w-full px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-md transition-colors">
                View FAQ
              </button>
              <button className="w-full px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-md transition-colors">
                Track Application Status
              </button>
              <button className="w-full px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors">
                Live Chat Support
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;