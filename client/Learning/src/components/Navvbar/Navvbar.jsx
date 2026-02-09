import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { useAuth } from "../../hooks/useAuth.jsx";
import { Link as RouterLink } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

function Navvbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signOut } = useClerk();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Saved Icon SVG
  const SavedIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );

  // Profile Icon SVG
  const ProfileIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  // User Menu Icon SVG
  const MenuIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-700/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <span className="text-2xl">🌾</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Farmer Sahayak
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === "/"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              to="/schemes"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === "/schemes"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              Schemes
            </Link>
            <Link
              to="/maps"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === "/maps"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              Help Centers
            </Link>
            <Link
              to="/chatbot"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === "/chatbot"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              AI Assistant
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                className="pl-3 pr-8 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
                onChange={(e) => {
                  const lang = e.target.value;
                  if (window.setLanguage) window.setLanguage(lang);
                  if (window.setAppLanguage) window.setAppLanguage(lang);
                }}
                defaultValue="en"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="hi">🇮🇳 हिं</option>
                <option value="bn">🇮🇳 বাং</option>
                <option value="te">🇮🇳 తె</option>
                <option value="mr">🇮🇳 मरा</option>
                <option value="ta">🇮🇳 த</option>
                <option value="ur">🇮🇳 اردو</option>
                <option value="gu">🇮🇳 ગુ</option>
                <option value="kn">🇮🇳 ಕ</option>
                <option value="ml">🇮🇳 മ</option>
                <option value="pa">🇮🇳 ਪੰ</option>
                <option value="or">🇮🇳 ଓ</option>
                <option value="as">🇮🇳 অ</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {user ? (
              <>
                {/* Saved Schemes Button */}
                <button
                  onClick={() => navigate("/saved-schemes")}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === "/saved-schemes"
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600"
                  }`}
                  title="View Saved Schemes"
                >
                  <SavedIcon />
                  <span>Saved</span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
                    title="Profile"
                  >
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name || "Profile"}
                        className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ProfileIcon />
                    )}
                    <MenuIcon />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl animate-fade-in z-50">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                          {user?.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.name || "Profile"}
                              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                              {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-gray-200 hover:bg-gray-700 transition-colors"
                      >
                        <ProfileIcon />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/saved-schemes"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-gray-200 hover:bg-gray-700 transition-colors sm:hidden"
                      >
                        <SavedIcon />
                        <span>Saved Schemes</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-gray-700 rounded-b-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === "/"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Home
              </Link>
              <Link
                to="/schemes"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === "/schemes"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Schemes
              </Link>
              <Link
                to="/maps"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === "/maps"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Help Centers
              </Link>
              <Link
                to="/chatbot"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === "/chatbot"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                AI Assistant
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default Navvbar;
