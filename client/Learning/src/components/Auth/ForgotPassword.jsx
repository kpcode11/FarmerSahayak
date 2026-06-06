import React from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-canvas-soft)' }}>
      <div className="w-full" style={{ maxWidth: '400px', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xxl)' }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--color-ink-mute)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-sub-title mb-2" style={{ color: 'var(--color-ink)' }}>Password Reset</h1>
          <p style={{ color: 'var(--color-ink-mute)', fontSize: '16px' }}>Handled by Clerk Authentication</p>
        </div>

        <div className="mb-6 p-4" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)' }}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" style={{ color: 'var(--color-ink-mute)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm" style={{ color: 'var(--color-ink-mute)' }}>
                Password reset is now handled by Clerk. Click "Forgot password?" on the login page to reset your password.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="btn-primary-cta w-full"
            style={{ padding: '12px 16px' }}
          >
            Go to Login
          </button>
          
          <div className="text-center">
            <Link to="/register" className="text-sm underline" style={{ color: 'var(--color-ink)' }}>
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
