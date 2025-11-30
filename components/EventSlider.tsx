
import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Service } from '../types';

interface EventSliderProps {
  services: Service[];
  onCardClick: (service: Service) => void;
}

const EventSlider: React.FC<EventSliderProps> = ({ services, onCardClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isJumpingRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cardWidth, setCardWidth] = useState(320);
  const GAP = 24;

  const ITEM_WIDTH = cardWidth + GAP;
  const extendedServices = [...services, ...services, ...services, ...services];
  const SET_SIZE = services.length;
  const SET_WIDTH = SET_SIZE * ITEM_WIDTH;

  useEffect(() => {
    setIsInitialized(false);
  }, [services]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!scrollRef.current) return;
      const newWidth = window.innerWidth < 768 ? 280 : 320;
      setCardWidth(newWidth);

      const newSetWidth = services.length * (newWidth + GAP);
      scrollRef.current.style.scrollBehavior = 'auto'; // Ensure instant jump on resize
      scrollRef.current.scrollLeft = newSetWidth;
      // Do not force smooth behavior globally
    };
    handleResize();

    const scroller = scrollRef.current;
    if (scroller) {
      scroller.style.scrollBehavior = 'auto';
      scroller.scrollLeft = SET_WIDTH;
      Promise.resolve().then(() => {
        // scroller.style.scrollBehavior = 'smooth'; // REMOVED: interfering with touch
        setIsInitialized(true);
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [SET_WIDTH, services.length]);

  const handleScroll = () => {
    if (!scrollRef.current || isJumpingRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const resetNeeded = scrollLeft >= SET_WIDTH * 2 || scrollLeft < SET_WIDTH;
    if (resetNeeded) {
      isJumpingRef.current = true;
      scrollRef.current.style.scrollBehavior = 'auto'; // Force instant jump
      scrollRef.current.scrollLeft += (scrollLeft >= SET_WIDTH * 2 ? -SET_WIDTH : SET_WIDTH);
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          // scrollRef.current.style.scrollBehavior = 'smooth'; // REMOVED
          isJumpingRef.current = false;
        }
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && !isPaused && isInitialized) {
        scrollRef.current.scrollBy({ left: ITEM_WIDTH, behavior: 'smooth' });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isPaused, ITEM_WIDTH, isInitialized]);

  const manualScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -ITEM_WIDTH : ITEM_WIDTH, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="mb-24 md:mb-32 animate-slide-up duration-1000 fill-mode-both relative max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 px-4">
        <div className="w-full md:w-auto text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-serif italic text-zinc-100 mb-3">
            Decoration Setups
          </h2>
          <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-medium">
            Explore Our Signature Designs
          </p>
        </div>
      </div>
      <div className="relative">
        <button onClick={() => manualScroll('left')} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-zinc-900/50 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-2xl hidden md:flex"><ChevronLeft size={24} /></button>
        <button onClick={() => manualScroll('right')} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-zinc-900/50 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-2xl hidden md:flex"><ChevronRight size={24} /></button>
        <div ref={scrollRef} onScroll={handleScroll} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} className={`flex gap-6 overflow-x-auto py-8 snap-x snap-mandatory scrollbar-hide transition-opacity duration-500 ${isInitialized ? 'opacity-100' : 'opacity-0'}`} style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
          {extendedServices.map((service, index) => (
            <div
              key={`${service.id}-${index}`}
              onClick={() => onCardClick(service)}
              className="flex-none snap-start group/card relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-700 hover:shadow-2xl bg-zinc-900"
              style={{ width: `${cardWidth}px` }}
            >
              <div className="absolute inset-0 bg-zinc-900"><img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110 opacity-70 group-hover/card:opacity-60" /></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start"><span className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">{service.category}</span></div>
                <div className="transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500 ease-out">
                  <h3 className="text-3xl font-serif italic text-white mb-4 leading-none">{service.title}</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-6 border-l-2 border-brand-primary/50 pl-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-75 transform translate-y-4 group-hover/card:translate-y-0">{service.description}</p>
                  <div className="opacity-0 group-hover/card:opacity-100 transition-all duration-500 delay-150 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest translate-y-4 group-hover/card:translate-y-0"><span className="border-b border-white/30 pb-1">View Setups</span><ArrowRight size={14} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventSlider;
