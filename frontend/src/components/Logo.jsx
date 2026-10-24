import React from 'react';

export const Logo = ({
  size = 'md',
  variant = 'color',
  showText = true,
  className = '',
  badge,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl',
  };

  const pinFill = variant === 'dark' ? '#084C61' : variant === 'light' ? '#FFFFFF' : '#084C61';
  const innerColor = variant === 'light' ? '#084C61' : '#FFFFFF';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* SVG Map Pin with Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Teardrop Pin Shape */}
          <path
            d="M50 0C22.3858 0 0 22.3858 0 50C0 73.2 32.5 106.8 46.2 117.8C48.4 119.5 51.6 119.5 53.8 117.8C67.5 106.8 100 73.2 100 50C100 22.3858 77.6142 0 50 0Z"
            fill={pinFill}
          />
          {/* Inner Circle Cutout */}
          <circle cx="50" cy="48" r="32" fill={innerColor} />
          
          {/* Inner Stupa / Lighthouse / Compass Emblem */}
          <path
            d="M50 25L53 36C56 37 59 39 61 42L72 38L66 48C67 51 67 55 66 58L76 63L65 67C63 70 60 72 57 74L58 85L50 78L42 85L43 74C40 72 37 70 35 67L24 63L34 58C33 55 33 51 34 48L28 38L39 42C41 39 44 37 47 36L50 25Z"
            fill={pinFill}
            opacity="0.15"
          />
          {/* Central Dome / Needle Landmark Graphic */}
          <path
            d="M50 27V42M50 42C45 42 41 46 41 51C41 54 43 57 46 59L43 69H57L54 59C57 57 59 54 59 51C59 46 55 42 50 42Z"
            fill={pinFill}
          />
          <circle cx="50" cy="30" r="2.5" fill={pinFill} />
          {/* Mountain / Sun Base */}
          <path
            d="M36 67L44 58L48 62L52 57L60 67H36Z"
            fill={pinFill}
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span
              className={`font-heading font-black tracking-tight ${textSizes[size]} ${
                variant === 'light' ? 'text-white' : 'text-[#084C61]'
              }`}
            >
              DAY<span className={variant === 'light' ? 'text-[#E27D60]' : 'text-[#E27D60]'}>SPIRE</span>
            </span>
            {badge && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded-full bg-[#F2EDE4] text-[#E27D60] border border-[#E8E2D9]">
                {badge}
              </span>
            )}
          </div>
          <span
            className={`text-[9px] sm:text-[10px] uppercase tracking-widest font-bold ${
              variant === 'light' ? 'text-slate-300' : 'text-[#7D7D7D]'
            }`}
          >
            Akkaraipattu Day Tour
          </span>
        </div>
      )}
    </div>
  );
};
