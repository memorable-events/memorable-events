import React from 'react';

export const CircleWireframe: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" stroke="url(#circleGrad)" strokeWidth="0.5" />
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" strokeDasharray="4 4" />
      <ellipse cx="100" cy="100" rx="90" ry="30" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" transform="rotate(45 100 100)" />
      <ellipse cx="100" cy="100" rx="90" ry="30" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" transform="rotate(-45 100 100)" />
      <circle cx="100" cy="100" r="2" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
};

export const DotGrid: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg width="200" height="200" className={className}>
      <defs>
        <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="text-zinc-700" fill="currentColor" fillOpacity="0.4" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#dot-pattern)" />
    </svg>
  );
};

export const ConcentricArcs: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor">
            <path d="M 10 190 A 180 180 0 0 1 190 10" strokeOpacity="0.05" strokeWidth="0.5" />
            <path d="M 40 190 A 150 150 0 0 1 190 40" strokeOpacity="0.1" strokeWidth="0.5" strokeDasharray="2 4" />
            <path d="M 70 190 A 120 120 0 0 1 190 70" strokeOpacity="0.15" strokeWidth="0.5" />
            <path d="M 100 190 A 90 90 0 0 1 190 100" strokeOpacity="0.1" strokeWidth="0.5" />
        </svg>
    )
}