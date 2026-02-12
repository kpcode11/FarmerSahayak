import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroFarmers from './hero-farmers.jpg';

const Dashboard = () => {
  const stats = [
    { label: "ACTIVE SCHEMES", value: "400+", sublabel: "" },
    { label: "BENEFICIARIES", value: "10L+", sublabel: "" },
    { label: "STATES COVERED", value: "28", sublabel: "" },
    { label: "HELPLINE SUPPORT", value: "24/7", sublabel: "" }
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
      linkText: "Start Now",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
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
      linkText: "Track",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
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
      linkText: "Apply",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
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
      linkText: "View Report",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  const categories = [
    {
      title: "Machinery",
      description: "Subsidies on equipment",
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
      link: "/schemes"
    },
    {
      title: "Crop Insurance",
      description: "Protect against loss",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
      link: "/schemes"
    },
    {
      title: "Irrigation",
      description: "Water management",
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
      link: "/schemes"
    },
    {
      title: "Fertilizers",
      description: "Nutrient subsidies",
      image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop",
      link: "/schemes"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                <span className="text-xs font-medium text-emerald-700">
                  ● New Schemes: PM-Kisan Samman Nidhi Update
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                Empowering Indian{" "}
                <span className="text-emerald-600">Agriculture</span>{" "}
                Together
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed">
                Access over <span className="font-semibold text-gray-900">400+</span> government welfare schemes tailored for your farm's growth. Check eligibility, apply online, and track your benefits in real-time.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/schemes"
                  className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  Explore Schemes
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/schemes"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Check Eligibility
                </Link>
              </div>

              {/* Farmers Joined */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img src="https://ui-avatars.com/api/?name=Farmer+1&background=10b981&color=fff" alt="Farmer" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://ui-avatars.com/api/?name=Farmer+2&background=059669&color=fff" alt="Farmer" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://ui-avatars.com/api/?name=Farmer+3&background=047857&color=fff" alt="Farmer" className="w-8 h-8 rounded-full border-2 border-white" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    100+
                  </div>
                </div>
                <span className="text-sm text-gray-600">Farmers joined this month</span>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={heroFarmers}
                  alt="Farmer with technology"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                
                {/* Overlay Card */}
                <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Latest Disbursement</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">
                      LIVE UPDATE
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹2,450 Cr
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Transferred to PM-KISAN beneficiaries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access the most frequently used services directly. Save time and get straight to what matters for your farm.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${action.bgColor} ${action.iconColor} rounded-lg flex items-center justify-center mb-4`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {action.description}
                </p>
                <Link
                  to={action.link}
                  className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
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

      {/* Browse Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Browse Categories
              </h2>
              <p className="text-gray-600">
                Find the right support for every aspect of farming
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">{category.title}</h3>
                  <p className="text-sm text-gray-200">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need help applying?
          </h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Our AI Assistant 'Kisan Mitra' is available 24/7 to guide you through the process in your local language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chatbot"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-emerald-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Kisan Mitra
            </Link>
            <Link
              to="/maps"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
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
