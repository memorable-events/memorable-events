
import React, { useState } from 'react';
import { Check, Clock, Plus } from 'lucide-react';
import { CircleWireframe } from './WireframeGraphics';
import { ServiceMode, Plan } from '../types';

interface PricingSectionProps {
    plans: Plan[];
    mode: ServiceMode;
}

const PricingSection: React.FC<PricingSectionProps> = ({ plans, mode }) => {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <section id="pricing" className="mb-24 md:mb-32 px-4 md:px-0 relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-3">
                {mode === 'INDOOR' ? 'Party Packages' : 'Outdoor Packages'}
            </h2>
            <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-medium">
              {mode === 'INDOOR' ? 'Venue Timings: 2pm-4pm & 6pm-1am' : 'Select your experience level'}
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch mb-12">
            {plans.map((plan, index) => {
                const isActive = index === activeIndex;
                return (
                    <div key={plan.name} onClick={() => setActiveIndex(index)} className={`relative group p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col cursor-pointer ${isActive ? 'bg-zinc-900 border-brand-primary/50 shadow-2xl shadow-brand-primary/10 scale-100 md:scale-105 z-10' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}>
                        {isActive && <div className="absolute inset-0 bg-brand-primary/5 rounded-[2.5rem] blur-2xl -z-10" />}
                        <div className="mb-8 relative">
                            {isActive && <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap"><Check size={12} strokeWidth={4} /> Selected Plan</div>}
                            <h3 className={`text-2xl font-bold font-serif mb-2 tracking-wide ${isActive ? 'text-white' : 'text-zinc-200'}`}>{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-3"><span className={`text-4xl font-bold tracking-tight ${isActive ? 'text-brand-primary' : 'text-zinc-400'}`}>{plan.price}</span></div>
                            <p className="text-xs text-zinc-500 leading-relaxed min-h-[40px]">{plan.description}</p>
                        </div>
                        <div className="mb-6"><div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : 'bg-white/5 border-white/10 text-zinc-400'}`}><Clock size={12} /><span>{plan.hours} Duration</span></div></div>
                        <div className="flex-grow space-y-4 mb-8">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-brand-primary text-white' : 'bg-zinc-800 text-zinc-500'}`}><Check size={10} strokeWidth={3} /></div>
                                    <span className="opacity-90 leading-tight">{feature}</span>
                                </div>
                            ))}
                            {plan.extras && plan.extras.length > 0 && (
                                 <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Add-ons & Extras</p>
                                    {plan.extras.map((extra) => <div key={extra} className="flex items-start gap-2 text-xs text-zinc-400"><Plus size={12} className="mt-0.5 text-zinc-600" /><span>{extra}</span></div>)}
                                 </div>
                            )}
                        </div>
                        <button className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 ${isActive ? 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20' : 'bg-white/5 hover:bg-white text-white hover:text-black border border-white/10'}`}>
                            {isActive ? (plan.price === 'Custom' ? 'Contact Team' : 'Proceed') : 'Select Plan'}
                        </button>
                    </div>
                );
            })}
        </div>
    </section>
  );
};

export default PricingSection;
