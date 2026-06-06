import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroFarmers from './hero-farmers.jpg';

const Dashboard = () => {
  const stats = [
    { label: "ACTIVE SCHEMES", value: "400+" },
    { label: "BENEFICIARIES", value: "10L+" },
    { label: "STATES COVERED", value: "28" },
    { label: "HELPLINE SUPPORT", value: "24/7" }
  ];

  const features = [
    { icon: "🤖", title: "AI-Powered Chatbot", description: "Get instant answers about government schemes, eligibility, and application processes in your language." },
    { icon: "📱", title: "WhatsApp Support", description: "Access scheme information and apply directly through WhatsApp for convenience." },
    { icon: "🏛️", title: "Government Schemes", description: "Browse 400+ central and state government schemes with detailed eligibility criteria." },
    { icon: "🗺️", title: "Interactive Maps", description: "Find the nearest help centers, offices, and service points on an interactive map." },
    { icon: "🔐", title: "Secure Auth", description: "Your data is protected with enterprise-grade security and authentication." },
    { icon: "🌐", title: "Hindi/English Multilingual", description: "Use the platform in Hindi, English, and 10+ Indian regional languages." }
  ];

  const quickActions = [
    {
      title: "New Registration",
      description: "Register yourself for government schemes and get your Farmer ID.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      link: "/register",
      linkText: "Start Now"
    },
    {
      title: "Check Status",
      description: "Track the current status of your application and benefit transfers.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      link: "/schemes",
      linkText: "Track"
    },
    {
      title: "Kisan Credit Card",
      description: "Apply for credit card loans at subsidized interest rates for agriculture.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      link: "/schemes",
      linkText: "Apply"
    },
    {
      title: "Soil Health Card",
      description: "Get information on nutrient status of your soil and recommendations.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: "/schemes",
      linkText: "View Report"
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)' }}>
      {/* ===== HERO SECTION ===== */}
      <section style={{ backgroundColor: 'var(--color-canvas)', paddingTop: '96px', paddingBottom: '96px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 mb-8" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-full)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--color-ink-mute)' }}>
                ● New Schemes: PM-Kisan Samman Nidhi Update
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-hero mb-6" style={{ color: 'var(--color-ink)' }}>
              Empowering Indian Agriculture Together
            </h1>

            {/* Subheadline */}
            <p className="text-lg mb-10 mx-auto" style={{ color: 'var(--color-ink-mute)', maxWidth: '560px', fontWeight: 400 }}>
              Access over 400+ government welfare schemes tailored for your farm's growth. Check eligibility, apply online, and track your benefits in real-time.
            </p>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/schemes" className="btn-primary-cta" style={{ padding: '12px 24px', fontSize: '14px' }}>
                Get Started
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/chatbot" className="btn-outline" style={{ padding: '12px 24px', fontSize: '14px' }}>
                Learn More
              </Link>
            </div>
          </div>

          {/* UI Mockup Image */}
          <div className="max-w-4xl mx-auto">
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <img
                src={heroFarmers}
                alt="Farmer Sahayak Dashboard Preview"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '480px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section style={{ backgroundColor: 'var(--color-canvas-soft)', borderTop: '1px solid var(--color-hairline)', borderBottom: '1px solid var(--color-hairline)', padding: '48px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-medium mb-2" style={{ color: 'var(--color-ink)' }}>
                  {stat.value}
                </div>
                <div className="text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink-mute)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section style={{ backgroundColor: 'var(--color-canvas)', padding: '96px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-section-title mb-4" style={{ color: 'var(--color-ink)' }}>
              Everything you need
            </h2>
            <p className="text-lg mx-auto" style={{ color: 'var(--color-ink-mute)', maxWidth: '560px' }}>
              A comprehensive platform to connect farmers with government support and resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-xxl)',
                }}
              >
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h3 className="text-card-title mb-2" style={{ color: 'var(--color-ink)' }}>
                  {feature.title}
                </h3>
                <p className="text-base" style={{ color: 'var(--color-ink-mute)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUICK ACTIONS SECTION ===== */}
      <section style={{ backgroundColor: 'var(--color-canvas-soft)', padding: '96px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-section-title mb-4" style={{ color: 'var(--color-ink)' }}>
              Quick Actions
            </h2>
            <p className="text-lg mx-auto" style={{ color: 'var(--color-ink-mute)', maxWidth: '560px' }}>
              Access the most frequently used services directly. Save time and get straight to what matters for your farm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-xl)',
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center mb-4" style={{ color: 'var(--color-primary)' }}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-ink)' }}>
                  {action.title}
                </h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-ink-mute)' }}>
                  {action.description}
                </p>
                <Link
                  to={action.link}
                  className="inline-flex items-center text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {action.linkText}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HELP / CTA SECTION ===== */}
      <section style={{ backgroundColor: 'var(--color-canvas)', borderTop: '1px solid var(--color-hairline)', padding: '96px 0' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-lg)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-section-title mb-4" style={{ color: 'var(--color-ink)' }}>
            Need help applying?
          </h2>
          <p className="text-lg mb-10 mx-auto" style={{ color: 'var(--color-ink-mute)', maxWidth: '560px' }}>
            Our AI Assistant 'Kisan Mitra' is available 24/7 to guide you through the process in your local language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/chatbot" className="btn-primary-cta" style={{ padding: '12px 24px', fontSize: '14px' }}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Kisan Mitra
            </Link>
            <Link to="/maps" className="btn-outline" style={{ padding: '12px 24px', fontSize: '14px' }}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find Nearest Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
