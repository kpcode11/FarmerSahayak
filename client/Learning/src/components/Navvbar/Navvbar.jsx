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
    <nav className="sticky top-0 z-50" style={{ backgroundColor: 'var(--color-canvas)', borderBottom: '1px solid var(--color-hairline)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex flex-col">
              <span className="text-lg font-medium" style={{ color: 'var(--color-ink)' }}>
                Farmer Sahayak
              </span>
              <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-ink-mute)' }}>Govt. of India Initiative</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/schemes"
              className="text-base font-medium transition-colors duration-200"
              style={{
                color: location.pathname === "/schemes" ? 'var(--color-primary)' : 'var(--color-ink)',
              }}
              onMouseEnter={(e) => { if (location.pathname !== "/schemes") e.target.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { if (location.pathname !== "/schemes") e.target.style.color = 'var(--color-ink)'; }}
            >
              Schemes
            </Link>
            <Link
              to="/maps"
              className="text-base font-medium transition-colors duration-200"
              style={{
                color: location.pathname === "/maps" ? 'var(--color-primary)' : 'var(--color-ink)',
              }}
              onMouseEnter={(e) => { if (location.pathname !== "/maps") e.target.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { if (location.pathname !== "/maps") e.target.style.color = 'var(--color-ink)'; }}
            >
              Help Centers
            </Link>
            <Link
              to="/chatbot"
              className="text-base font-medium transition-colors duration-200"
              style={{
                color: location.pathname === "/chatbot" ? 'var(--color-primary)' : 'var(--color-ink)',
              }}
              onMouseEnter={(e) => { if (location.pathname !== "/chatbot") e.target.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { if (location.pathname !== "/chatbot") e.target.style.color = 'var(--color-ink)'; }}
            >
              AI Assistant
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <select
                className="pl-3 pr-8 py-2 text-sm font-medium appearance-none cursor-pointer outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--radius-sm)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-hairline)'}
                onChange={(e) => {
                  const lang = e.target.value;
                  if (window.setLanguage) window.setLanguage(lang);
                  if (window.setAppLanguage) window.setAppLanguage(lang);
                }}
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="bn">বাংলা</option>
                <option value="te">తెలుగు</option>
                <option value="mr">मराठी</option>
                <option value="ta">தமிழ்</option>
                <option value="ur">اردو</option>
                <option value="gu">ગુજરાતી</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ml">മലയാളം</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="or">ଓଡ଼ିଆ</option>
                <option value="as">অসমীয়া</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" style={{ color: 'var(--color-ink-mute)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {user ? (
              <>
                {/* Saved Schemes Button */}
                <button
                  onClick={() => navigate("/saved-schemes")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200"
                  style={{
                    color: location.pathname === "/saved-schemes" ? 'var(--color-primary)' : 'var(--color-ink)',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: location.pathname === "/saved-schemes" ? 'var(--color-canvas-soft)' : 'var(--color-canvas)',
                    fontSize: '14px',
                  }}
                  title="View Saved Schemes"
                >
                  <SavedIcon />
                  <span>Saved</span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1 p-2 transition-all"
                    style={{
                      color: 'var(--color-ink)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-soft)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Profile"
                  >
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name || "Profile"}
                        className="w-8 h-8 rounded-full object-cover"
                        style={{ border: '2px solid var(--color-hairline)' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ProfileIcon />
                    )}
                    <MenuIcon />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 animate-fade-in z-50" style={{ backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
                      {/* User info header */}
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                        <div className="flex items-center gap-3">
                          {user?.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.name || "Profile"}
                              className="w-10 h-10 rounded-full object-cover"
                              style={{ border: '2px solid var(--color-hairline)' }}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                              {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>{user?.name || "User"}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--color-ink-mute)' }}>{user?.email || ""}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 transition-colors"
                        style={{ color: 'var(--color-ink)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-soft)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <ProfileIcon />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/saved-schemes"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 transition-colors sm:hidden"
                        style={{ color: 'var(--color-ink)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-soft)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <SavedIcon />
                        <span>Saved Schemes</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-red-600 transition-colors"
                        style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                className="btn-primary-cta"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 transition-all"
              style={{ color: 'var(--color-ink)', borderRadius: 'var(--radius-sm)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-soft)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4" style={{ borderTop: '1px solid var(--color-hairline)' }}>
            <div className="space-y-1">
              <Link
                to="/schemes"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 font-medium transition-all duration-200"
                style={{
                  color: location.pathname === "/schemes" ? 'var(--color-primary)' : 'var(--color-ink)',
                  backgroundColor: location.pathname === "/schemes" ? 'var(--color-canvas-soft)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Schemes
              </Link>
              <Link
                to="/maps"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 font-medium transition-all duration-200"
                style={{
                  color: location.pathname === "/maps" ? 'var(--color-primary)' : 'var(--color-ink)',
                  backgroundColor: location.pathname === "/maps" ? 'var(--color-canvas-soft)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Help Centers
              </Link>
              <Link
                to="/chatbot"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 font-medium transition-all duration-200"
                style={{
                  color: location.pathname === "/chatbot" ? 'var(--color-primary)' : 'var(--color-ink)',
                  backgroundColor: location.pathname === "/chatbot" ? 'var(--color-canvas-soft)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                AI Assistant
              </Link>

              {/* Language selector for mobile */}
              <div className="px-4 pt-3 mt-2" style={{ borderTop: '1px solid var(--color-hairline)' }}>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-ink-mute)' }}>Language</label>
                <select
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--color-canvas)',
                    color: 'var(--color-ink)',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-hairline)'}
                  onChange={(e) => {
                    const lang = e.target.value;
                    if (window.setLanguage) window.setLanguage(lang);
                    if (window.setAppLanguage) window.setAppLanguage(lang);
                  }}
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="bn">বাংলা</option>
                  <option value="te">తెలుగు</option>
                  <option value="mr">मराठी</option>
                  <option value="ta">தமிழ்</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navvbar;
