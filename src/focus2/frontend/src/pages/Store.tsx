
import React, { useState, useEffect } from 'react';
import { usePoints } from '../hooks/usePoints';
import { Badge, Button } from '../components/Common';

interface StoreItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: 'White Noise' | 'Environment' | 'Avatars';
  preview: string;
  subType?: 'Animal' | 'Fruit' | 'Robot' | 'Aether';
}

const STORE_ITEMS: StoreItem[] = [
  // --- Avatars: Animals ---
  { id: 'av_panda', name: 'Chill Panda', desc: 'A peaceful companion for long study sessions.', price: 400, category: 'Avatars', subType: 'Animal', preview: '🐼' },
  { id: 'av_tiger', name: 'Power Tiger', desc: 'Boost your focus with fierce determination.', price: 450, category: 'Avatars', subType: 'Animal', preview: '🐯' },
  { id: 'av_koala', name: 'Lazy Koala', desc: 'Perfect for low-stress reading time.', price: 350, category: 'Avatars', subType: 'Animal', preview: '🐨' },
  
  // --- Avatars: Fruits ---
  { id: 'av_apple', name: 'Smart Apple', desc: 'Stay fresh and crisp while you work.', price: 300, category: 'Avatars', subType: 'Fruit', preview: '🍎' },
  { id: 'av_strawberry', name: 'Sweet Berry', desc: 'Adds a touch of joy to your workspace.', price: 300, category: 'Avatars', subType: 'Fruit', preview: '🍓' },
  { id: 'av_avocado', name: 'Focus Avocado', desc: 'The ultimate productivity superfood.', price: 350, category: 'Avatars', subType: 'Fruit', preview: '🥑' },

  // --- Avatars: Robots ---
  { id: 'av_bot', name: 'Logic Unit 7', desc: 'Precision-based focus for coding and math.', price: 600, category: 'Avatars', subType: 'Robot', preview: '🤖' },
  { id: 'av_alien', name: 'Zen Alien', desc: 'Perspective from another galaxy.', price: 550, category: 'Avatars', subType: 'Robot', preview: '👽' },
  { id: 'av_ufo', name: 'UFO Explorer', desc: 'Always hovering, always focused.', price: 700, category: 'Avatars', subType: 'Robot', preview: '🛸' },

  // --- Ambient & Environments ---
  { id: 'wn_storm', name: 'Thunderstorm', desc: 'Powerful ambient sounds for intense focus.', price: 200, category: 'White Noise', preview: '⚡' },
  { id: 'wn_fire', name: 'Campfire Night', desc: 'Crackling wood and cricket sounds.', price: 150, category: 'White Noise', preview: '🔥' },
  { id: 'bg_arctic', name: 'Arctic Base', desc: 'Cold blue aesthetics with snow effects.', price: 800, category: 'Environment', preview: '❄️' },
  { id: 'bg_cyber', name: 'Cyberpunk Lab', desc: 'Neon lights and digital rain.', price: 1200, category: 'Environment', preview: '🏙️' },
  { id: 'bg_zen', name: 'Zen Garden', desc: 'Pebbles, bamboo and koi pond view.', price: 600, category: 'Environment', preview: '🎋' },
];

export const Store: React.FC = () => {
  const { points, spendPoints } = usePoints();
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

  // Load owned items from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('unlocked_items');
    const baseItems = ['rain', 'waves', 'cafe', 'wind', 'av_fox', 'minimal']; // Default free items
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOwnedIds(new Set([...baseItems, ...parsed]));
      } catch (e) {
        setOwnedIds(new Set(baseItems));
      }
    } else {
      setOwnedIds(new Set(baseItems));
    }
  }, []);

  const handleBuy = (item: StoreItem) => {
    if (ownedIds.has(item.id)) return;
    if (spendPoints(item.price)) {
      const nextOwned = new Set(ownedIds).add(item.id);
      setOwnedIds(nextOwned);
      
      // Update global persistence
      // Fix: Explicitly cast 'nextOwned' to 'Set<string>' to ensure 'id' in filter is correctly typed as 'string' instead of 'unknown'.
      const unlockedArray = Array.from(nextOwned as Set<string>).filter(id => id.startsWith('av_') || id.startsWith('wn_') || id.startsWith('bg_'));
      localStorage.setItem('unlocked_items', JSON.stringify(unlockedArray));
      
      alert(`Successfully Redeemed: ${item.name}! Permanent access granted.`);
    } else {
      alert('Insufficient points. Complete more focus sessions to earn points!');
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Avatars': return 'accent';
      case 'White Noise': return 'success';
      case 'Environment': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-earth-border pb-12">
        <div className="max-w-2xl">
          <h2 className="text-6xl font-black text-earth-text tracking-tighter uppercase mb-4">Scholars Market</h2>
          <p className="text-earth-text-sec text-xl font-medium leading-relaxed opacity-80">
            Exchange your focus effort for permanent workspace upgrades. All items are <span className="text-earth-accent font-bold">Lifetime Access</span>.
          </p>
        </div>
        <div className="bg-white border-2 border-earth-border p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 min-w-[280px]">
          <div className="w-16 h-16 bg-earth-accent/10 rounded-full flex items-center justify-center text-earth-accent ring-8 ring-earth-accent/5">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.5 21L8 14L2 9H9.5L12 2Z"/></svg>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-earth-text-sec tracking-widest mb-1">Available Credits</p>
            <div className="flex items-baseline gap-2">
               <p className="text-5xl font-black text-earth-text tabular-nums">{points.toLocaleString()}</p>
               <span className="text-xs font-black uppercase opacity-40">PTS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {STORE_ITEMS.map(item => (
          <div key={item.id} className="bg-white border border-earth-border rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-700 group relative overflow-hidden flex flex-col">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-earth-accent/5 rounded-full group-hover:scale-[3] transition-transform duration-[2s]"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="w-20 h-20 bg-earth-bg rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-earth-border group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {item.preview}
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Badge color={getCategoryColor(item.category)}>
                     {item.category}
                   </Badge>
                   {item.subType && <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">{item.subType}</span>}
                </div>
              </div>

              <h3 className="text-2xl font-black text-earth-text mb-3 group-hover:text-earth-accent transition-colors tracking-tight">{item.name}</h3>
              <p className="text-sm text-earth-text-sec leading-relaxed flex-1 mb-10 opacity-70 font-medium">{item.desc}</p>

              <div className="flex items-center justify-between pt-8 border-t border-earth-border/50 mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-black ${ownedIds.has(item.id) ? 'text-earth-success opacity-40' : 'text-earth-text'}`}>{item.price}</span>
                  <span className="text-[10px] font-black text-earth-text-sec uppercase tracking-widest">pts</span>
                </div>
                <Button 
                  variant={ownedIds.has(item.id) ? 'ghost' : 'primary'}
                  disabled={ownedIds.has(item.id)}
                  onClick={() => handleBuy(item)}
                  className={`rounded-2xl px-8 h-14 text-xs font-black uppercase tracking-widest shadow-lg ${ownedIds.has(item.id) ? 'bg-earth-success/10 text-earth-success' : ''}`}
                >
                  {ownedIds.has(item.id) ? (
                    <div className="flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4"/></svg>
                       Owned
                    </div>
                  ) : 'Redeem'}
                </Button>
              </div>
              <div className="mt-4 text-center">
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-earth-text/20">Global Permanent Unlock</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
