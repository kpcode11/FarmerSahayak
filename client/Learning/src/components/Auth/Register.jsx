import React from "react";
import { SignUp } from "@clerk/clerk-react";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-canvas-soft)' }}>
      <div className="relative z-10">
        <SignUp 
          routing="hash"
          afterSignUpUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
            },
            variables: {
              colorPrimary: '#3ecf8e',
              colorText: '#171717',
              colorTextSecondary: '#707070',
              colorBackground: '#ffffff',
              colorInputBackground: '#ffffff',
              colorInputText: '#171717',
              borderRadius: '12px',
              fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            },
            layout: {
              socialButtonsVariant: 'blockButton',
            }
          }}
        />
      </div>
    </div>
  );
}

export default Register;
