
import React from 'react';
import { SettingsLayout } from '../components/settings/SettingsLayout';

/**
 * Settings Page - Optimized Redesign
 * 
 * Features:
 * - Left Navigation (33%) + Right Content (67%) desktop layout.
 * - Centralized focus settings following accessibility and cognitive principles.
 * - Responsive transitions for tablet and mobile.
 */
export const Settings: React.FC = () => {
  return (
    <div className="pb-12 animate-in fade-in duration-700">
       <div className="mb-8">
          <h1 className="text-sm font-bold text-earth-accent uppercase tracking-[0.2em] mb-1">Configuration</h1>
          <h2 className="text-3xl font-bold text-earth-text">Personalize Experience</h2>
       </div>
       <SettingsLayout />
    </div>
  );
};
