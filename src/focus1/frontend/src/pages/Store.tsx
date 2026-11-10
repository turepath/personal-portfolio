
import React, { useState } from 'react';
import { usePoints } from '../hooks/usePoints';
import { Badge, Button } from '../components/Common';

interface StoreItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: 'White Noise' | 'Chat Bubble' | 'Avatar Frame';
  preview: string;
}

const STORE_ITEMS: StoreItem[] = [
  { id: 'wn1', name: 'Thunderstorm', desc: 'Powerful ambient sounds for intense focus.', price: 150, category: 'White Noise', preview: '⚡' },
  { id: 'wn2', name: 'Forest Library', desc: 'Soft leaves and distant birds.', price: 100, category: 'White Noise', preview: '🌿' },
  { id: 'cb1', name: 'Golden Glow', desc: 'A warm chat bubble for premium scholars.', price: 500, category: 'Chat Bubble', preview: '✨' },
  { id: 'cb2', name: 'Mint Dream', desc: 'Fresh mint-colored chat aesthetics.', price: 200, category: 'Chat Bubble', preview: '🍃' },
  { id: 'af1', name: 'Focus ring', desc: 'A rotating neon ring around your avatar.', price: 1200, category: 'Avatar Frame', preview: '⭕' },
];

export const Store: React.FC = () => {
  const { points, spendPoints } = usePoints();
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set(['rain', 'waves', 'cafe', 'wind'])); // Default noise owned

  const handleBuy = (item: StoreItem) => {
    if (ownedIds.has(item.id)) return;
    if (spendPoints(item.price)) {
      setOwnedIds(prev => new Set(prev).add(item.id));
      alert(`Successfully redeemed: ${item.name}!`);
    } else {
      alert('Insufficient points. Keep focusing to earn more!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-5xl font-black text-earth-text tracking-tighter uppercase mb-2">Points Store</h2>
          <p className="text-earth-text-sec text-lg font-medium">Exchange your focus for exclusive aesthetics.</p>
        </div>
        <div className="bg-white border border-earth-border px-8 py-4 rounded-[2rem] shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-earth-accent/10 rounded-full flex items-center justify-center text-earth-accent">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest">Your Balance</p>
            <p className="text-3xl font-black text-earth-text">{points.toLocaleString()} <span className="text-xs uppercase opacity-40">pts</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {STORE_ITEMS.map(item => (
          <div key={item.id} className="bg-white border border-earth-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-earth-accent/5 rounded-full group-hover:scale-[3] transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-earth-bg rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-earth-border">
                  {item.preview}
                </div>
                <Badge color={item.category === 'White Noise' ? 'success' : 'accent'}>{item.category}</Badge>
              </div>

              <h3 className="text-xl font-black text-earth-text mb-2">{item.name}</h3>
              <p className="text-sm text-earth-text-sec leading-relaxed flex-1 mb-8">{item.desc}</p>

              <div className="flex items-center justify-between pt-6 border-t border-earth-border">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-earth-text">{item.price}</span>
                  <span className="text-[10px] font-bold text-earth-text-sec uppercase tracking-widest">pts</span>
                </div>
                <Button 
                  variant={ownedIds.has(item.id) ? 'ghost' : 'primary'}
                  disabled={ownedIds.has(item.id)}
                  onClick={() => handleBuy(item)}
                  className="rounded-2xl px-8 h-12 text-xs font-black uppercase tracking-widest"
                >
                  {ownedIds.has(item.id) ? 'Unlocked' : 'Redeem'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
