import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import indoorLogo from '../logos/memorable_party_zone.png';
import outdoorLogo from '../logos/memorable_events_4u.png';

interface ModeSelectionScreenProps {
  onSelect: (mode: 'INDOOR' | 'OUTDOOR') => void;
}

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ onSelect }) => {
  const [hovered, setHovered] = useState<'INDOOR' | 'OUTDOOR' | null>(null);

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] flex flex-col md:flex-row text-white overflow-hidden animate-in fade-in duration-1000">

      {/* Option 1: Party Room (Indoor) */}
      <div
        onMouseEnter={() => setHovered('INDOOR')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => onSelect('INDOOR')}
        className="relative h-1/2 md:h-full flex-1 border-b md:border-b-0 md:border-r border-white/5 overflow-hidden cursor-pointer group"
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105 opacity-60"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1200&auto=format&fit=crop")' }}
        />
        {/* Overlay - Reveal on hover */}
        <div className={`absolute inset-0 bg-[#030303] transition-opacity duration-500 ${hovered === 'INDOOR' ? 'opacity-40' : 'opacity-90'}`} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 text-center">
          {/* Logo */}
          {/* Logo */}
          <div className={`mb-6 h-56 md:h-72 flex items-center justify-center transition-all duration-500 ${hovered === 'INDOOR' ? 'scale-110 brightness-100' : 'scale-100 brightness-75 grayscale'}`}>
            <img src={indoorLogo} alt="Memorable Party Zone" className="h-full w-full object-contain drop-shadow-2xl" />
          </div>

          <h2 className="text-3xl md:text-5xl font-serif italic mb-3 tracking-tight">
            Memorable Party Room
          </h2>
          <button className={`px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-500 ${hovered === 'INDOOR' ? 'bg-white text-black scale-100' : 'bg-transparent text-zinc-500 border border-zinc-700 scale-90'}`}>
            Book Now
          </button>

          {/* Hover Indicator */}
          <div className={`absolute bottom-12 transition-all duration-500 ${hovered === 'INDOOR' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Option 2: Outdoor Service */}
      <div
        onMouseEnter={() => setHovered('OUTDOOR')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => onSelect('OUTDOOR')}
        className="relative h-1/2 md:h-full flex-1 overflow-hidden cursor-pointer group"
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105 opacity-60"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519225448526-0cbc99b4114d?q=80&w=1200&auto=format&fit=crop")' }}
        />
        {/* Overlay */}
        <div className={`absolute inset-0 bg-[#030303] transition-opacity duration-500 ${hovered === 'OUTDOOR' ? 'opacity-40' : 'opacity-90'}`} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 text-center">
          {/* Logo */}
          <div className={`mb-6 h-56 md:h-72 flex items-center justify-center transition-all duration-500 ${hovered === 'OUTDOOR' ? 'scale-110 brightness-100' : 'scale-100 brightness-75 grayscale'}`}>
            <img src={outdoorLogo} alt="Memorable Events 4U" className="h-full w-full object-contain drop-shadow-2xl" />
          </div>

          <h2 className="text-3xl md:text-5xl font-serif italic mb-3 tracking-tight">
            Outdoor Services
          </h2>
          <button className={`px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-500 ${hovered === 'OUTDOOR' ? 'bg-white text-black scale-100' : 'bg-transparent text-zinc-500 border border-zinc-700 scale-90'}`}>
            Book Now
          </button>

          {/* Hover Indicator */}
          <div className={`absolute bottom-12 transition-all duration-500 ${hovered === 'OUTDOOR' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Divider */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <span className="text-[10px] font-bold text-zinc-600 bg-[#030303] px-3 py-1 rounded-full border border-zinc-800">OR</span>
      </div>

    </div>
  );
};

export default ModeSelectionScreen;