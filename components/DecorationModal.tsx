
import React from 'react';
import { X, Check, Maximize2 } from 'lucide-react';
import { Service, SetupImage, Plan } from '../types';

interface DecorationModalProps {
  isOpen: boolean;
  onClose: () => void;
  decoration: Service | null;
  setupImages: SetupImage[];
  plans: Plan[];
  onPlanSelect: (plan: Plan, setup: SetupImage | null) => void;
}

const DecorationModal: React.FC<DecorationModalProps> = ({ isOpen, onClose, decoration, setupImages, plans, onPlanSelect }) => {
  const [selectedSetup, setSelectedSetup] = React.useState<SetupImage | null>(null);
  const [fullScreenItem, setFullScreenItem] = React.useState<SetupImage | null>(null);

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

        <div className="overflow-y-auto p-8 md:p-12 custom-scrollbar">
          {/* Scrollable Setups */}
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">1. Choose a Setup Style</h3>
          {setupImages && setupImages.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
              {setupImages.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSetup(item)}
                  className={`flex-none w-48 md:w-56 group relative rounded-2xl overflow-hidden bg-zinc-900 border cursor-pointer transition-all duration-300 snap-center ${selectedSetup?.id === item.id ? 'border-brand-primary ring-2 ring-brand-primary/50' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="aspect-[4/5] relative">
                    {item.src.match(/\.(mp4|webm)$/i) ? (
                      <video src={item.src} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                    ) : (
                      <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="text-lg font-serif text-white leading-tight">{item.title}</h3>
                          {item.price && <p className="text-sm font-bold text-brand-secondary mt-1">{item.price}</p>}
                        </div>
                        {selectedSetup?.id === item.id && (
                          <div className="bg-brand-primary text-black p-1 rounded-full"><Check size={16} /></div>
                        )}
                      </div>
                    </div>

                    {/* Maximize Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenItem(item);
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="View Full Screen"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl mb-8">
              <p className="text-zinc-500">No specific setups found. You can proceed with a general theme.</p>
            </div>
          )}

          {/* Plans Selection */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">2. Select a Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-brand-primary/50 transition-colors flex flex-col">
                  <h4 className="text-2xl font-serif italic text-white mb-2">{plan.name}</h4>
                  <p className="text-brand-secondary font-bold text-lg mb-4">{plan.price}</p>
                  <p className="text-zinc-400 text-sm mb-6 flex-grow">{plan.description}</p>
                  <ul className="space-y-2 mb-8">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="text-brand-primary">•</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onPlanSelect(plan, selectedSetup)}
                    className="w-full py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center pb-8">
            <p className="text-zinc-500 text-xs">Contact us for custom designs.</p>
          </div>
        </div>
      </div>

      {/* Full Screen Overlay */}
      {fullScreenItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setFullScreenItem(null)}
            className="fixed top-8 right-8 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5"
          >
            <X size={24} />
          </button>

          <div className="max-w-[90vw] max-h-[90vh] relative">
            {fullScreenItem.src.match(/\.(mp4|webm)$/i) ? (
              <video
                src={fullScreenItem.src}
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <img
                src={fullScreenItem.src}
                alt={fullScreenItem.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-serif text-white">{fullScreenItem.title}</h3>
              {fullScreenItem.price && <p className="text-brand-secondary font-bold text-lg">{fullScreenItem.price}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecorationModal;