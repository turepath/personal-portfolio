
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  const variants = {
    primary: "bg-earth-accent text-white hover:bg-earth-accent-hover shadow-sm",
    secondary: "bg-earth-card-alt text-earth-text hover:bg-earth-border",
    danger: "bg-earth-danger text-white hover:opacity-90",
    ghost: "bg-transparent text-earth-text-sec hover:text-earth-text hover:bg-earth-card",
    outline: "bg-transparent border border-earth-border text-earth-text hover:bg-earth-card",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export const Toggle: React.FC<{ enabled: boolean; onChange: () => void; label?: string }> = ({ enabled, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer group">
      {label && <span className="mr-3 text-sm text-earth-text-sec group-hover:text-earth-text transition-colors">{label}</span>}
      <div className="relative" onClick={(e) => { e.preventDefault(); onChange(); }}>
        <div className={`block w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-earth-accent' : 'bg-earth-border'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${enabled ? 'translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-earth-text opacity-40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-earth-bg w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-earth-border flex justify-between items-center bg-earth-card">
          <h3 className="text-lg font-bold text-earth-text">{title}</h3>
          <button onClick={onClose} className="text-earth-text-sec hover:text-earth-text p-1 rounded-full hover:bg-earth-border transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Badge: React.FC<{ color?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral'; children: React.ReactNode }> = ({ color = 'neutral', children }) => {
  const colors = {
    accent: "bg-earth-accent/10 text-earth-accent",
    success: "bg-earth-success/10 text-earth-success",
    warning: "bg-earth-warning/10 text-earth-warning",
    danger: "bg-earth-danger/10 text-earth-danger",
    neutral: "bg-earth-card-alt text-earth-text-sec",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};

export const PaymentUI: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-earth-text mb-1">$9.99<span className="text-sm font-normal text-earth-text-sec">/month</span></div>
        <p className="text-sm text-earth-text-sec">Unlock all 1:pro rooms & custom virtual avatars</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-earth-card-alt/30 border border-earth-border rounded-lg">
          <div className="w-5 h-5 bg-earth-success rounded-full flex items-center justify-center text-white">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span className="text-sm text-earth-text">HD Video Quality</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-earth-card-alt/30 border border-earth-border rounded-lg">
          <div className="w-5 h-5 bg-earth-success rounded-full flex items-center justify-center text-white">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span className="text-sm text-earth-text">Unlimited Focus Sessions</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-earth-card-alt/30 border border-earth-border rounded-lg">
          <div className="w-5 h-5 bg-earth-success rounded-full flex items-center justify-center text-white">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span className="text-sm text-earth-text">Exclusive Pro Badges</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={onComplete} className="flex flex-col items-center justify-center gap-2 p-4 border border-earth-border rounded-xl hover:bg-earth-card hover:border-earth-accent transition-all group">
          <div className="w-8 h-8 text-earth-text-sec group-hover:text-earth-accent">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 14h2v2h-2zm0-8h2v6h-2z"/></svg>
          </div>
          <span className="text-xs font-bold text-earth-text uppercase">Pay with Points</span>
          <span className="text-[10px] text-earth-text-sec">500 Points</span>
        </button>
        <button onClick={onComplete} className="flex flex-col items-center justify-center gap-2 p-4 border border-earth-border rounded-xl hover:bg-earth-card hover:border-earth-accent transition-all group">
          <div className="w-8 h-8 text-earth-text-sec group-hover:text-earth-accent">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V12h16v6zm0-10H4V6h16v2z"/></svg>
          </div>
          <span className="text-xs font-bold text-earth-text uppercase">Credit Card</span>
          <span className="text-[10px] text-earth-text-sec">Visa / Master</span>
        </button>
      </div>

      <p className="text-[10px] text-center text-earth-text-sec px-4">
        By clicking pay, you agree to our Terms of Service and Privacy Policy. Subscriptions renew automatically.
      </p>
    </div>
  );
};
