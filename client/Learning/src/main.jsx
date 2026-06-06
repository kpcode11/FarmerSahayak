import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import SchemesList from "./components/SchemesList/SchemesList.jsx";
import SavedSchemes from "./components/SchemesList/SavedSchemes.jsx";
import Layout from "./Layout.jsx";
import Maps from "./components/Maps/Maps.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import SchemeDetail from "./components/SchemesList/SchemeDetail/SchemeDetail.jsx";
import Eligibility from "./components/SchemesList/SchemeDetail/Eligibility.jsx";
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import AuthProvider from "./context/AuthContext.jsx";
import RequireAuth from "./components/Auth/RequireAuth.jsx";
import Profile from "./components/Profile/Profile.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";
import ForgotPassword from "./components/Auth/ForgotPassword.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";

// Import your Publishable Key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Dashboard />} />
      <Route path="schemes" element={<SchemesList />} />
      <Route path="schemes/:schemeId" element={<SchemeDetail />} />
      <Route path="schemes/:schemeId/eligibility" element={<Eligibility />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="maps" element={<Maps />} />
      <Route path="chatbot" element={<Chatbot />} />
      <Route
        path="saved-schemes"
        element={
          <RequireAuth>
            <SavedSchemes />
          </RequireAuth>
        }
      />
      <Route
        path="profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-soft)' }}>
            <div className="text-center">
              <h1 className="text-6xl font-medium mb-4" style={{ color: 'var(--color-ink)', letterSpacing: '-1.92px' }}>404</h1>
              <p className="text-lg mb-8" style={{ color: 'var(--color-ink-mute)' }}>Page not found!</p>
              <a href="/" className="btn-primary-cta" style={{ padding: '12px 24px' }}>
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ClerkProvider>
  </StrictMode>
);
