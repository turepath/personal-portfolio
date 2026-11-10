
import React from 'react';
import { AvatarConfig } from '../utils/types';

interface AvatarRendererProps {
  config: AvatarConfig;
  className?: string;
  size?: number | string;
}

const BACKGROUNDS = {
  grassland: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=60&w=800",
  sky: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=60&w=800",
  desk: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=60&w=800",
  flowers: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=60&w=800"
};

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({ 
  config, 
  className = "", 
  size = "100%"
}) => {
  const { 
    skinColor, faceShape, eyeStyle, mouthStyle, blush, 
    hairStyle, hairColor, hairGradientColor,
    outfitType, outfitColor,
    headwear, prop,
    expression, backgroundId
  } = config;

  const getTilt = () => {
    if (expression === 'tilt_left') return 'rotate(-8 100 120)';
    if (expression === 'tilt_right') return 'rotate(8 100 120)';
    return '';
  };

  return (
    <div 
      className={`relative rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 ${className}`} 
      style={{ 
        width: size, 
        height: size,
        background: `url(${BACKGROUNDS[backgroundId || 'grassland']}) center/cover no-repeat`
      }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>

      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] animate-float-gentle">
        <defs>
          <radialGradient id="soft3DSkin" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="25%" stopColor={skinColor} />
            <stop offset="100%" stopColor={skinColor} stopOpacity="0.85" />
          </radialGradient>

          <linearGradient id="hairFlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hairColor} />
            <stop offset="100%" stopColor={hairGradientColor} />
          </linearGradient>

          <filter id="stickerStroke" x="-25%" y="-25%" width="150%" height="150%">
            <feMorphology operator="dilate" radius="4" in="SourceAlpha" result="border" />
            <feFlood floodColor="white" result="white" />
            <feComposite in="white" in2="border" operator="in" result="outline" />
            <feMerge>
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#stickerStroke)" transform={getTilt()}>
          {/* Back Hair */}
          {hairStyle === 'long_wavy' && (
            <path d="M35 75 Q 15 130, 35 185 Q 100 210, 165 185 Q 185 130, 165 75 Z" fill={hairColor} opacity="0.95" />
          )}

          {/* Torso */}
          <g>
            <path d="M40 175 Q 100 160, 160 175 L 185 225 L 15 225 Z" fill={outfitColor} />
            {outfitType === 'striped_shirt' && (
              <g stroke="white" strokeWidth="2.5" opacity="0.25" strokeLinecap="round">
                 {[55, 78, 101, 124, 147].map(x => <line key={x} x1={x} y1="168" x2={x} y2="225" />)}
              </g>
            )}
          </g>

          {/* Head Group */}
          <g transform="translate(100, 115)">
            {/* Face Geometry */}
            {faceShape === 'round' && <circle r="68" fill="url(#soft3DSkin)" />}
            {faceShape === 'oval' && <ellipse rx="62" ry="75" fill="url(#soft3DSkin)" />}
            {faceShape === 'heart' && <path d="M-62 -28 C -62 -82, 0 -82, 0 -28 C 0 -82, 62 -82, 62 -28 C 62 35, 0 85, 0 85 C 0 85, -62 35, -62 -28" fill="url(#soft3DSkin)" />}

            {/* Facial Features */}
            <g transform="translate(0, -5)">
              {blush && (
                <g opacity="0.35">
                  <circle cx="-48" cy="22" r="20" fill="#FF9AA2" filter="blur(10px)" />
                  <circle cx="48" cy="22" r="20" fill="#FF9AA2" filter="blur(10px)" />
                </g>
              )}

              {/* Eyes */}
              {eyeStyle === 'sparkle_eye' ? (
                <g>
                  <circle cx="-30" cy="0" r="12" fill="#2D3436" />
                  <circle cx="30" cy="0" r="12" fill="#2D3436" />
                  <circle cx="-35" cy="-5" r="4.5" fill="white" />
                  <circle cx="25" cy="-5" r="4.5" fill="white" />
                  <circle cx="-26" cy="4" r="2.2" fill="white" opacity="0.4" />
                  <circle cx="34" cy="4" r="2.2" fill="white" opacity="0.4" />
                </g>
              ) : (
                <path d="M-42 0 Q -30 -12 -18 0 M 18 0 Q 30 -12 42 0" stroke="#2D3436" strokeWidth="6" strokeLinecap="round" fill="none" />
              )}

              {/* Nose */}
              <circle cx="0" cy="18" r="7" fill={skinColor} filter="brightness(0.88)" />

              {/* Mouth */}
              {mouthStyle === 'soft_smile' && <path d="M-18 42 Q 0 58, 18 42" stroke="#FF4757" strokeWidth="6" strokeLinecap="round" fill="none" />}
              {mouthStyle === 'big_grin' && <path d="M-22 38 Q 0 68, 22 38 Z" fill="#FF4757" />}
            </g>

            {/* Hair Top */}
            <g transform="translate(0, -12)">
               {hairStyle === 'cloud_curls' && (
                 <path d="M-78 25 Q -85 -75, 0 -82 Q 85 -75, 78 25 L 65 45 Q 0 35, -65 45 Z" fill="url(#hairFlow)" />
               )}
               {hairStyle === 'sleek_bob' && (
                 <path d="M-68 35 Q -62 -72, 0 -72 Q 62 -72, 68 35 L 75 65 Q 0 50, -75 65 Z" fill="url(#hairFlow)" />
               )}
            </g>

            {/* Accessories */}
            {headwear === 'baseball_cap' && (
              <g transform="translate(0, -60)">
                <path d="M-65 0 Q 0 -50, 65 0 L 75 12 Q 0 2, -75 12 Z" fill="#EE5253" />
                <path d="M-45 -8 L 45 -8" stroke="white" strokeWidth="2.5" strokeDasharray="5 5" opacity="0.6" />
              </g>
            )}
          </g>

          {/* Prop */}
          {prop === 'backpack' && (
            <g transform="translate(155, 165)">
               <rect width="38" height="48" rx="14" fill="#341F97" />
               <rect x="6" y="12" width="26" height="26" rx="8" fill="white" opacity="0.15" />
            </g>
          )}
        </g>
      </svg>

      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
