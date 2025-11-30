
import React, { useState, useEffect } from 'react';
import { Instagram, Heart, MessageCircle, Send, Volume2, VolumeX } from 'lucide-react';
import { ServiceMode, RealReel } from '../types';


interface RealReelsSectionProps {
  mode: ServiceMode;
  reels: RealReel[];
}

const RealReelsSection: React.FC<RealReelsSectionProps> = ({ mode, reels }) => {
  const [activeReel, setActiveReel] = useState<RealReel | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const profileLink = "https://www.instagram.com/memorablepartyzone";
  const profileName = "@memorablepartyzone";

  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Reset active reel when mode changes or reels update
    if (reels.length > 0) {
      setActiveReel(reels[0]);
    } else {
      setActiveReel(null);
    }
  }, [mode, reels]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay prevented:", error);
        });
      }
    }
  }, [activeReel]);

  if (!activeReel) return null;

  return (
    <section className="mb-24 md:mb-32 relative z-10 max-w-7xl mx-auto px-4 md:px-0">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-3 flex items-center justify-center gap-3">
          <Instagram className="text-brand-secondary" strokeWidth={1.5} size={32} />
          On The Feed
        </h2>
        <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-medium">
          Follow <a href={profileLink} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-primary underline transition-colors">{profileName}</a>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Player */}
        <div className="lg:col-span-8 flex justify-center bg-zinc-900/30 rounded-[2.5rem] border border-white/5 p-4 md:p-8 shadow-2xl backdrop-blur-sm">
          <div className="w-full max-w-[350px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-black relative group">
            {/* Autoplay enabled via script or interaction usually, but for embed we try adding params if supported */}
            {activeReel.embedUrl.includes('cloudinary.com') || activeReel.embedUrl.startsWith('/static/') || activeReel.embedUrl.endsWith('.mp4') ? (
              <>
                <video
                  ref={videoRef}
                  src={`${activeReel.embedUrl}`}
                  className="w-full aspect-[9/16] object-cover cursor-pointer"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={() => setIsMuted(!isMuted)}
                />

                {/* Mute Indicator */}
                <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-sm z-30 cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                  {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
                </div>

                {/* Instagram Icon Watermark */}
                <div className="absolute top-4 left-4 z-30">
                  <Instagram className="text-white drop-shadow-md" size={24} />
                </div>

                {/* Bottom Gradient Overlay (Optional - kept minimal for visibility if needed, but removing as per request for "just mark") */}
                {/* <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" /> */}
              </>
            ) : (
              <iframe
                src={`${activeReel.embedUrl.split('?')[0].replace(/\/$/, '')}/embed/captioned/?autoplay=1&muted=1&playsinline=1`}
                className="w-full aspect-[9/16]"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                title="Instagram Reel"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
            <h3 className="text-lg font-serif italic text-white mb-4">Latest Reels</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setActiveReel(reel)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 border ${activeReel.id === reel.id ? 'bg-white/10 border-brand-primary/50' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`}
                >
                  <img src={reel.thumbnail} alt="Reel Thumbnail" className="w-16 h-16 rounded-lg object-cover bg-zinc-800" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">{reel.caption}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Watch Now</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a
            href={profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 text-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all"
          >
            View Full Profile
          </a>
        </div>
      </div>
    </section >
  );
};

export default RealReelsSection;
