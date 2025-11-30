
import React from 'react';
import { Camera, ArrowUpRight } from 'lucide-react';
import { GalleryItem } from '../types';

interface EventGalleryProps {
    galleryItems: GalleryItem[];
    onViewMore?: () => void;
}

const EventGallery: React.FC<EventGalleryProps> = ({ galleryItems, onViewMore }) => {
  return (
    <section id="gallery" className="mb-24 md:mb-32 px-4 md:px-0 relative z-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-3 flex items-center gap-4">
            <Camera className="text-zinc-600" size={32} strokeWidth={1.5} />
            Captured Moments
          </h2>
          <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-medium">
            Visual stories from our recent events
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400 font-medium bg-white/5 border border-white/5 px-4 py-2 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          Live Gallery Feed
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
        {galleryItems.map((item) => (
          <div key={item.id} className={`group relative rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 hover:border-white/10 transition-all duration-500 ${item.className}`}>
            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-2 block">{item.category}</span>
                  <h3 className="text-2xl font-serif text-white leading-none">{item.title}</h3>
                </div>
                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"><ArrowUpRight size={20} /></button>
              </div>
            </div>
            <div className="absolute bottom-8 left-8 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
               <h3 className="text-xl font-serif italic text-zinc-200">{item.title}</h3>
            </div>
          </div>
        ))}
        <div onClick={onViewMore} className="rounded-[2.5rem] bg-zinc-900/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center p-10 group hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer md:col-span-1 md:row-span-1 min-h-[250px]">
            <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4 group-hover:text-white group-hover:border-white/50 group-hover:bg-white/5 transition-all"><ArrowUpRight size={24} /></div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">View Full Portfolio</span>
        </div>
      </div>
    </section>
  );
};

export default EventGallery;
