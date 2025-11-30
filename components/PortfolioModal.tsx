import React from 'react';
import { X, ArrowUpRight } from 'lucide-react';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PORTFOLIO_ITEMS = [
  { id: 1, src: "https://images.unsplash.com/photo-1519671482538-518b5c2a9d22?q=80&w=800&auto=format&fit=crop", title: "Gala Dinner", category: "Corporate" },
  { id: 2, src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop", title: "Summer Wedding", category: "Wedding" },
  { id: 3, src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop", title: "Music Festival", category: "Public" },
  { id: 4, src: "https://images.unsplash.com/photo-1505373877841-8d43f703fb1e?q=80&w=800&auto=format&fit=crop", title: "Tech Launch", category: "Product" },
  { id: 5, src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop", title: "DJ Night", category: "Party" },
  { id: 6, src: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop", title: "Conference", category: "Corporate" },
  { id: 7, src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop", title: "Private Party", category: "Social" },
  { id: 8, src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop", title: "Art Exhibition", category: "Cultural" },
  { id: 9, src: "https://images.unsplash.com/photo-1514525253440-b3933365609b?q=80&w=800&auto=format&fit=crop", title: "Fashion Show", category: "Runway" },
];

const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in duration-300 p-4 md:p-8">
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="fixed top-8 right-8 z-[80] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5 backdrop-blur-md animate-fade-in"
      >
        <X size={24} />
      </button>

      {/* Content Container - Animate Scale Up */}
      <div className="w-full h-full max-w-7xl mx-auto bg-[#080808]/90 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl animate-zoom-in">
        
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-white/5 flex-shrink-0 bg-white/5 backdrop-blur-md z-10">
            <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-2">Full Portfolio</h2>
            <p className="text-zinc-400 text-sm uppercase tracking-widest">Selected works 2023-2024</p>
        </div>

        {/* Scrollable Grid */}
        <div className="overflow-y-auto p-8 md:p-12 custom-scrollbar">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {PORTFOLIO_ITEMS.map((item) => (
                    <div 
                        key={item.id} 
                        className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer"
                    >
                        <img 
                            src={item.src} 
                            alt={item.title} 
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1 block">{item.category}</span>
                            <h3 className="text-xl font-serif text-white">{item.title}</h3>
                        </div>

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                                <ArrowUpRight size={18} />
                             </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Footer in modal */}
            <div className="mt-16 text-center pb-8">
                <p className="text-zinc-500 text-xs">More projects available upon request.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;