import React from 'react';

export const LogoIcon = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left Parallelogram Stripe */}
    <polygon
      points="14,35 40,35 26,65 0,65"
      fill="url(#logo-gradient)"
    />
    {/* Right Geometric Arrowhead / Extended Polygon */}
    <polygon
      points="65,0 100,65 64,65 50,100 20,100 42,35 26,35 38,10"
      fill="url(#logo-gradient)"
    />
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
  </svg>
);

export const Logo = ({ className = "w-8 h-8", textClassName = "text-xl font-black tracking-tight text-slate-900", showText = true }) => {
  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon className={className} />
      {showText && (
        <span className={textClassName}>
          Skill<span className="text-indigo-600">Bridge</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
