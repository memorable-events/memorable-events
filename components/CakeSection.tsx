
import React from 'react';
import { Cake } from '../types';

interface CakeSectionProps {
  cakes: Cake[];
}

const CakeSection: React.FC<CakeSectionProps> = ({ cakes }) => {
  return (
    <section id="cakes" className="mb-24 md:mb-32 relative z-10 max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-3">
          Memorable Bakery
        </h2>
        <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-medium">
          Handcrafted confections for your special day
        </p>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {cakes.map((cake) => (
          <div key={cake.id} className="flex-none w-[280px] md:w-[300px] snap-center group flex flex-col items-center text-center p-4 cursor-pointer">
            <div className="h-[280px] w-full flex items-center justify-center mb-6 relative transition-transform duration-500 group-hover:-translate-y-2">
              <img src={cake.image} alt={cake.name} className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)]" />
            </div>
            <div className="w-full">
              <h3 className="text-xl font-serif text-white mb-1">{cake.name}</h3>
              <p className="text-zinc-400 text-xs mb-3">{cake.flavor}</p>
              <span className="text-lg font-bold text-white tracking-wider">{cake.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CakeSection;
