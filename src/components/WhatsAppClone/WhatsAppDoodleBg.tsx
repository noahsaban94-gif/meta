import React from 'react';

interface WhatsAppDoodleBgProps {
  isDark: boolean;
}

export const WhatsAppDoodleBg: React.FC<WhatsAppDoodleBgProps> = ({ isDark }) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      style={{
        backgroundColor: isDark ? '#0b141a' : '#efeae2',
        opacity: 1
      }}
    >
      {/* SVG WhatsApp Doodles Tile Pattern */}
      <svg 
        className="w-full h-full"
        style={{
          opacity: isDark ? 0.04 : 0.065,
          mixBlendMode: isDark ? 'screen' : 'multiply'
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern 
            id="wa-doodles-pattern" 
            width="412" 
            height="412" 
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={isDark ? '#e9edef' : '#111b21'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Chat Bubble with dots */}
              <path d="M40 30 h35 a10 10 0 0 1 10 10 v20 a10 10 0 0 1 -10 10 h-25 l-10 8 v-8 h-0 a10 10 0 0 1 -10 -10 v-20 a10 10 0 0 1 10 -10 z" />
              <circle cx="52" cy="50" r="1.5" fill={isDark ? '#e9edef' : '#111b21'} />
              <circle cx="60" cy="50" r="1.5" fill={isDark ? '#e9edef' : '#111b21'} />
              <circle cx="68" cy="50" r="1.5" fill={isDark ? '#e9edef' : '#111b21'} />

              {/* Truck (Mercedes/Isuzu) */}
              <path d="M140 45 h30 v25 h-30 z M170 52 h12 l8 10 v8 h-20 z" />
              <circle cx="150" cy="72" r="5" />
              <circle cx="180" cy="72" r="5" />

              {/* Crane / Hook */}
              <path d="M260 25 l30 20 m0 0 v20 m0 0 c0 5 -8 5 -8 0" />

              {/* Coffee Cup */}
              <path d="M340 50 h20 v15 a10 10 0 0 1 -20 0 z M360 54 h5 a3 3 0 0 1 0 6 h-5" />
              <path d="M345 42 c0 -3 4 -3 4 -6 m6 6 c0 -3 4 -3 4 -6" />

              {/* Waze / Location Pin */}
              <path d="M60 140 c-8 0 -15 6 -15 14 c0 10 15 22 15 22 s15 -12 15 -22 c0 -8 -7 -14 -15 -14 z" />
              <circle cx="60" cy="153" r="4" />

              {/* Telephone Receiver */}
              <path d="M160 145 c3 -5 8 -2 10 2 l4 8 c2 4 -1 7 -4 9 c5 8 12 15 20 20 c2 -3 5 -6 9 -4 l8 4 c4 2 7 7 2 10 c-6 4 -16 2 -27 -9 c-11 -11 -13 -21 -9 -27 z" />

              {/* Building / Warehouse Blocks */}
              <path d="M260 140 h35 v35 h-35 z M272 155 h11 v20 h-11 z M265 145 h6 v6 h-6 z M284 145 h6 v6 h-6 z" />

              {/* Paper Plane */}
              <path d="M350 145 l35 15 l-35 15 l8 -15 z M358 160 l27 0" />

              {/* Clock */}
              <circle cx="50" cy="260" r="14" />
              <path d="M50 252 v8 h6" />

              {/* Star / Sparkle */}
              <path d="M150 250 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" />

              {/* Hammer / Tool */}
              <path d="M240 250 l20 20 m-5 -5 l-4 4 m0 0 l-6 -6 l4 -4 z M265 245 l-10 10 l4 4 l10 -10 z" />

              {/* Double Check V */}
              <path d="M340 260 l5 6 l14 -14 m-7 14 l14 -14" />

              {/* Container / Waste Dumpster */}
              <path d="M40 345 l10 -15 h35 l10 15 z M45 345 v20 h40 v-20" />
              <line x1="55" y1="345" x2="55" y2="365" />
              <line x1="75" y1="345" x2="75" y2="365" />

              {/* Heart */}
              <path d="M160 350 c-4 -6 -12 -6 -15 0 c-4 8 15 18 15 18 s19 -10 15 -18 c-3 -6 -11 -6 -15 0 z" />

              {/* Megaphone */}
              <path d="M260 345 l20 -10 v28 l-20 -10 z M250 350 h10 v8 h-10 z" />

              {/* Smiley */}
              <circle cx="360" cy="355" r="14" />
              <circle cx="355" cy="351" r="1.5" fill={isDark ? '#e9edef' : '#111b21'} />
              <circle cx="365" cy="351" r="1.5" fill={isDark ? '#e9edef' : '#111b21'} />
              <path d="M354 360 c2 4 10 4 12 0" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wa-doodles-pattern)" />
      </svg>
    </div>
  );
};
