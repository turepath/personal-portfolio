
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
    <div className="pt-10 pb-12 animate-in fade-in duration-700">
       <SettingsLayout />
    </div>
  );
};
