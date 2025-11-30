

import React from 'react';
import { X } from 'lucide-react';
import { Service, SetupImage } from '../types';

interface DecorationModalProps {
  isOpen: boolean;
  onClose: () => void;
  decoration: Service | null;
  setupImages: SetupImage[];
}

const DecorationModal: React.FC<DecorationModalProps> = ({ isOpen, onClose, decoration, setupImages }) => {
  if (!isOpen || !decoration) return null;

  const title = `${decoration.title} Setups`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in duration-300 p-4 md:p-8">
      
      <button 
        onClick={onClose}
        className="fixed top-8 right-8 z-[80] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5 backdrop-blur-md animate-fade-in"
      >
        <X size={24} />
      </button>

      <div className="w-full h-full max-w-7xl mx-auto bg-[#080808]/90 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl animate-zoom-in">
        
        <div className="p-8 md:p-12 border-b border-white/5 flex-shrink-0 bg-white/5 backdrop-blur-md z-10">
            <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-2">{title}</h2>
            <p className="text-zinc-400 text-sm uppercase tracking-widest">{decoration.category}</p>
        </div>

        <div className="overflow-y-auto p-8 md:p-12">
            {setupImages && setupImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {setupImages.map((item) => (
                        <div 
                            key={item.id} 
                            className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 aspect-w-3 aspect-h-4"
                        >
                            <img 
                                src={item.src} 
                                alt={item.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 p-4">
                                <h3 className="text-lg font-serif text-white leading-tight">{item.title}</h3>
                                {item.price && (
                                    <p className="text-sm font-bold text-brand-secondary mt-1">{item.price}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-zinc-500">No specific setups found for this category.</p>
                </div>
            )}
            
            <div className="mt-16 text-center pb-8">
                <p className="text-zinc-500 text-xs">Contact us for custom designs.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DecorationModal;