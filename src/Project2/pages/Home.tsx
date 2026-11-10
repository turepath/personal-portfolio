
import React, { useState } from 'react';
import { Button } from '../components/Common';

export const Home: React.FC = () => {
  const [isFocusing, setIsFocusing] = useState(false);

  const toggleFocus = () => {
    setIsFocusing(true);
    setTimeout(() => {
      window.location.hash = '#/rooms';
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] relative overflow-hidden">
      {/* Abstract background shapes for depth */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-earth-accent/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-earth-warning/5 rounded-full blur-3xl -z-10"></div>

      <div className="text-center max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-earth-accent/10 rounded-full text-earth-accent text-[10px] font-bold uppercase tracking-widest mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-earth-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-earth-accent"></span>
          </span>
          1,240 Users Flowing Now
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-8 text-earth-text tracking-tight leading-[1.15]">
          Find your flow in a <br/>
          <span className="text-earth-accent italic font-serif">connected</span> workspace.
        </h2>
        <p className="text-earth-text-sec text-lg md:text-xl mb-14 max-w-lg mx-auto leading-relaxed opacity-90">
          Join a community of focused students and professionals from around the globe. Video study rooms for everyone.
        </p>

        <div className="flex flex-col items-center gap-8 w-full">
          <Button 
            className="w-full max-w-xs h-16 text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            onClick={toggleFocus}
            isLoading={isFocusing}
          >
            Focus Now
          </Button>
          <button onClick={() => window.location.hash = '#/settings'} className="text-sm font-bold text-earth-text-sec hover:text-earth-accent transition-colors flex items-center gap-2 group">
            Adjust Session Preference
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
