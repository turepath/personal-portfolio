
import React from 'react';
import { Community } from './Community';

/**
 * Community Demo Page
 * Wraps the Community component to demonstrate the full interactive flow.
 */
export const CommunityDemo: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-earth-bg flex flex-col pt-[var(--header-height)]">
      <div className="flex-1 w-full max-w-[var(--max-content-width)] mx-auto px-6 md:px-10 py-6">
        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-4xl font-black text-earth-text tracking-tighter mb-2">Community Explorer</h1>
          <p className="text-earth-text-sec font-medium">Search for buddies, share focus logs, and start real-time study sessions.</p>
        </div>
        <Community />
      </div>
    </div>
  );
};
