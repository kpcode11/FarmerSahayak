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
    <footer style={{ backgroundColor: 'var(--color-canvas)', borderTop: '1px solid var(--color-hairline)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: 'var(--space-huge)', paddingBottom: 'var(--space-huge)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-ink)' }}>Farmer Sahayak</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-mute)' }}>
              A centralized platform bridging the gap between Indian farmers and government welfare schemes.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>Platform</h4>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.url}
                  className="block text-sm transition-colors"
                  style={{ color: 'var(--color-ink-mute)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>Resources</h4>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <Link
                  key={index}
                  to={resource.url}
                  className="block text-sm transition-colors"
                  style={{ color: 'var(--color-ink-mute)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {resource.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start text-sm">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-ink-mute)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span style={{ color: 'var(--color-ink-mute)' }}>1800 180 1551</span>
              </div>
              <div className="flex items-start text-sm">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-ink-mute)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span style={{ color: 'var(--color-ink-mute)' }}>help@farmersahayak.gov.in</span>
              </div>
              <div className="flex items-start text-sm">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-ink-mute)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={{ color: 'var(--color-ink-mute)' }}>Ministry of Agriculture & Farmers Welfare, Government of India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8" style={{ borderTop: '1px solid var(--color-hairline)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm" style={{ color: 'var(--color-ink-mute)', fontSize: '13px' }}>
              © 2026 Farmer Sahayak Platform. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a
                href="#"
                className="transition-colors"
                style={{ color: 'var(--color-ink)', textDecoration: 'none', fontSize: '13px' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="transition-colors"
                style={{ color: 'var(--color-ink)', textDecoration: 'none', fontSize: '13px' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="transition-colors"
                style={{ color: 'var(--color-ink)', textDecoration: 'none', fontSize: '13px' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
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
