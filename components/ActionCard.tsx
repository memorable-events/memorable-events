import React from 'react';
import { CircleWireframe } from './WireframeGraphics';
import { ArrowUpRight } from 'lucide-react';

interface ActionCardProps {
  title: string;
  onClick: () => void;
  delay?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, onClick, delay = 0 }) => {
  return (
    <button 
      onClick={onClick}
      className={`group relative w-full aspect-square bg-brand-surface border border-brand-border rounded-[2rem] overflow-hidden hover:border-zinc-700 transition-all duration-500 flex flex-col justify-between p-8 text-left animate-in fade-in slide-in-from-bottom-8 shadow-lg hover:shadow-2xl`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
        {/* Subtle dot grid in background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
        
        {/* Wireframe Graphic */}
        <div className="absolute right-[-20%] bottom-[-20%] w-[140%] h-[140%] flex items-center justify-center text-zinc-800 group-hover:text-brand-primary/20 transition-colors duration-500 pointer-events-none">
             <CircleWireframe className="w-full h-full opacity-30 group-hover:scale-110 group-hover:rotate-45 transition-transform duration-1000 ease-out" />
        </div>

        {/* Top Icon */}
        <div className="relative z-10 w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
            <ArrowUpRight size={18} />
        </div>

        {/* Text */}
        <h3 className="relative z-10 text-3xl font-serif italic text-zinc-300 group-hover:text-white transition-colors duration-300">
            {title}
        </h3>
    </button>
  );
};

export default ActionCard;