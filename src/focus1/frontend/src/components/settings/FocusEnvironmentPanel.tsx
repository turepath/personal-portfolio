
import React from 'react';
import { Toggle, Badge } from '../Common';

interface FocusEnvironmentPanelProps {
  settings: any;
  onChange: (delta: any) => void;
  onReset: () => void;
}

const ACCENT_PRESETS = [
  { name: 'Calm Deep Sea Blue', hex: '#3D5A80' },
  { name: 'Peaceful Earth Tone', hex: '#8A9B6E' },
  { name: 'Soft Neutral Gray', hex: '#7B7B7B' },
];

export const FocusEnvironmentPanel: React.FC<FocusEnvironmentPanelProps> = ({ settings, onChange, onReset }) => {
  const env = settings.focusEnvironment;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-earth-text">Focus Environment</h3>
          <p className="text-earth-text-sec text-sm">Merge of Appearance & Accessibility for optimal flow.</p>
        </div>
        <button onClick={onReset} className="text-xs font-bold text-earth-accent hover:underline">Reset to defaults</button>
      </div>

      <section className="space-y-6">
        {/* Theme Mode */}
        <div>
          <label className="block text-sm font-bold text-earth-text mb-3" id="theme-label">Theme Mode</label>
          <div className="flex gap-2" role="radiogroup" aria-labelledby="theme-label">
            {['Light', 'Dark', 'Auto (system)'].map(mode => (
              <button
                key={mode}
                onClick={() => onChange({ focusEnvironment: { ...env, themeMode: mode } })}
                className={`flex-1 py-2 text-sm rounded-lg border transition-all ${env.themeMode === mode ? 'bg-earth-accent text-white border-earth-accent' : 'bg-earth-card border-earth-border text-earth-text-sec'}`}
                aria-checked={env.themeMode === mode}
                role="radio"
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Simplified Mode */}
        <div className="p-4 bg-earth-card rounded-xl border border-earth-border flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-earth-text">Simplified Mode</p>
            <p className="text-xs text-earth-text-sec">Hide non-essential decorations and widgets.</p>
          </div>
          <Toggle 
            enabled={env.simplifiedMode} 
            onChange={() => onChange({ focusEnvironment: { ...env, simplifiedMode: !env.simplifiedMode } })}
            aria-label="Toggle Simplified Mode"
          />
        </div>

        {/* Animation Control */}
        <div>
          <label className="block text-sm font-bold text-earth-text mb-2">Animation Control</label>
          <select 
            value={env.animationControl}
            onChange={(e) => onChange({ focusEnvironment: { ...env, animationControl: e.target.value } })}
            className="w-full bg-earth-card border border-earth-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-earth-accent outline-none"
            aria-label="Select animation style"
          >
            <option>Normal</option>
            <option>Reduced motion</option>
            <option>Disabled</option>
          </select>
          <p className="mt-1.5 text-[10px] text-earth-text-sec leading-tight">
            <Badge color="accent">Cognitive Note</Badge> Reducing motion helps maintain focus by minimizing visual distractions.
          </p>
        </div>

        {/* Focus Accent */}
        <div>
          <label className="block text-sm font-bold text-earth-text mb-3">Focus Accent Color</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ACCENT_PRESETS.map(preset => (
              <button
                key={preset.hex}
                onClick={() => onChange({ focusEnvironment: { ...env, focusAccent: preset.hex } })}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${env.focusAccent === preset.hex ? 'border-earth-accent ring-1 ring-earth-accent bg-earth-accent/5' : 'border-earth-border hover:bg-earth-card'}`}
                aria-label={`Select ${preset.name} theme`}
              >
                <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: preset.hex }}></div>
                <span className="text-xs font-medium text-earth-text leading-none">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-earth-text">Font Size</label>
            <span className="text-xs text-earth-text-sec font-mono">{env.fontSize}px</span>
          </div>
          <input 
            type="range" 
            min="12" max="24" 
            value={env.fontSize}
            onChange={(e) => onChange({ focusEnvironment: { ...env, fontSize: parseInt(e.target.value) } })}
            className="w-full h-1.5 bg-earth-border rounded-lg appearance-none cursor-pointer accent-earth-accent"
            aria-label="Adjust font size"
          />
          <div className="flex justify-between mt-1 text-[10px] text-earth-text-sec uppercase font-bold">
            <span>Small</span>
            <span>Default</span>
            <span>Large</span>
          </div>
        </div>

        {/* Preview Area */}
        <div className="mt-8">
          <p className="text-xs font-bold text-earth-text-sec uppercase tracking-widest mb-3">Real-time Preview</p>
          <div className={`p-4 rounded-xl border-2 border-dashed border-earth-border bg-earth-bg overflow-hidden relative`}>
            {/* Mini Mock of Home Page */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-12 rounded bg-earth-card"></div>
                <div className="flex gap-1">
                  <div className="h-4 w-4 rounded bg-earth-card"></div>
                  <div className="h-4 w-4 rounded bg-earth-card"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold leading-tight" style={{ color: env.focusAccent, fontSize: `${env.fontSize}px` }}>
                  Your Focus Title
                </h4>
                <div className="h-2 w-3/4 rounded" style={{ backgroundColor: `${env.focusAccent}20` }}></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: env.focusAccent }}></div>
                <div className="h-8 w-8 rounded-lg bg-earth-card"></div>
              </div>
              {!env.simplifiedMode && (
                <div className="flex gap-1 mt-2">
                   <div className="h-4 w-10 rounded-full bg-earth-success/20"></div>
                   <div className="h-4 w-10 rounded-full bg-earth-warning/20"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
