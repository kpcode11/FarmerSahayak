"use client";
import React from 'react';
import { Link } from 'react-router-dom';

const FooterComponent = () => {
  const quickLinks = [
    { name: "All Schemes", url: "/schemes" },
    { name: "Eligibility Checker", url: "/schemes" },
    { name: "Application Status", url: "/schemes" },
    { name: "Grievance Redressal", url: "/schemes" }
  ];

  const resources = [
    { name: "User Manual", url: "#" },
    { name: "FAQs", url: "#" },
    { name: "Contact Support", url: "/chatbot" },
    { name: "News & Updates", url: "#" }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌾</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Farmer Sahayak</h3>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A centralized platform bridging the gap between Indian farmers and government welfare schemes.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.url}
                  className="block text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Resources</h4>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <Link
                  key={index}
                  to={resource.url}
                  className="block text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {resource.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start text-sm">
                <svg className="w-5 h-5 mr-2 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-400">1800 180 1551</span>
              </div>
              <div className="flex items-start text-sm">
                <svg className="w-5 h-5 mr-2 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400">help@farmersahayak.gov.in</span>
              </div>
              <div className="flex items-start text-sm">
                <svg className="w-5 h-5 mr-2 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">Ministry of Agriculture & Farmers Welfare, Government of India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2026 Farmer Sahayak Platform. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
