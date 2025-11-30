
import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Volume2, VolumeX, Instagram, ExternalLink, Play } from 'lucide-react';
import { ServiceMode } from '../types';

const PROFILES = {
  INDOOR: {
    username: "memorablepartyzone",
    link: "https://www.instagram.com/memorablepartyzone"
  },
  OUTDOOR: {
    username: "memorable_events4u",
    link: "https://www.instagram.com/memorable_events4u"
  }
};

const REELS_DATA = {
  INDOOR: [
    { id: 1, url: "https://videos.pexels.com/video-files/3196024/3196024-hd_1080_1920_25fps.mp4", likes: "1.2k", comments: "45", caption: "Making memories that last a lifetime! ✨ #EventMe #Party" },
    { id: 2, url: "https://videos.pexels.com/video-files/4919713/4919713-hd_1080_1920_25fps.mp4", likes: "2.5k", comments: "112", caption: "The dance floor was on fire last night! 🔥💃" }
  ],
  OUTDOOR: [
    { id: 3, url: "https://videos.pexels.com/video-files/4106579/4106579-hd_1080_1920_25fps.mp4", likes: "856", comments: "23", caption: "Elegant outdoor service for your special night. 🥂" },
    { id: 4, url: "https://videos.pexels.com/video-files/3191929/3191929-hd_1080_1920_25fps.mp4", likes: "940", comments: "18", caption: "Cheers to new beginnings under the stars. 💍" }
  ]
};

interface ReelCardProps {
  reel: { id: number; url: string; likes: string; comments: string; caption: string; };
  profile: { username: string; link: string; };
  isGlobalMuted: boolean;
  toggleGlobalMute: () => void;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, profile, isGlobalMuted, toggleGlobalMute }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.defaultMuted = true;
    video.muted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          video.muted = true; // Re-assert mute for browser compliance
          const playPromise = video.play();
          if (playPromise) {
            playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [reel.id]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isGlobalMuted;
  }, [isGlobalMuted]);

  const handleManualPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true));
    }
  };

  return (
    <div 
        ref={containerRef}
        className="relative flex-none w-[260px] md:w-[280px] aspect-[9/16] rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 snap-center group shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-white/10"
        onClick={handleManualPlay}
    >
      <video ref={videoRef} src={reel.url} preload="auto" className="w-full h-full object-cover bg-zinc-900" loop playsInline muted />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-5">
        <div className="flex justify-end pointer-events-auto">
           <button onClick={(e) => { e.stopPropagation(); toggleGlobalMute(); }} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10">
              {isGlobalMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
           </button>
        </div>
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center pl-1">
                <Play className="fill-white text-white" size={28} />
            </div>
        </div>
        <div className="space-y-3 pointer-events-none">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/90"><Heart size={18} className="fill-white/10" /><span className="text-xs font-bold tracking-wide">{reel.likes}</span></div>
              <div className="flex items-center gap-1.5 text-white/90"><MessageCircle size={18} /><span className="text-xs font-bold tracking-wide">{reel.comments}</span></div>
           </div>
           <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed text-shadow-sm"><span className="font-bold text-white mr-1 drop-shadow-md">{profile.username}</span>{reel.caption}</p>
        </div>
      </div>
      <a href={profile.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label="View on Instagram" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: isPlaying ? 'auto' : 'none' }} />
    </div>
  );
};

interface ReelsSectionProps {
  mode: ServiceMode;
}

const ReelsSection: React.FC<ReelsSectionProps> = ({ mode }) => {
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const profile = PROFILES[mode];
  const reels = REELS_DATA[mode];

  return (
    <section className="mb-24 md:mb-32 relative z-10 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end px-4 mb-10 gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-3 flex items-center gap-3"><Instagram className="text-brand-secondary" strokeWidth={1.5} size={32} />Latest Moments</h2>
          <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-medium">Follow <a href={profile.link} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-primary underline transition-colors">@{profile.username}</a></p>
        </div>
        <a href={profile.link} target="_blank" rel="noopener noreferrer" className="glass-panel px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all group border-white/10 hover:border-white/20">
          <span>View All Reels</span><ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
      <div className="flex overflow-x-auto gap-6 px-4 pb-12 snap-x snap-mandatory scrollbar-hide">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} profile={profile} isGlobalMuted={isGlobalMuted} toggleGlobalMute={() => setIsGlobalMuted(!isGlobalMuted)} />
        ))}
        <div className="flex-none w-[260px] md:w-[280px] aspect-[9/16] rounded-[2rem] overflow-hidden bg-zinc-900/50 border border-dashed border-zinc-800 snap-center flex flex-col items-center justify-center text-center p-6 group hover:bg-zinc-900 hover:border-zinc-700 transition-all">
             <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 p-[2px] mb-5 group-hover:scale-110 transition-transform shadow-xl">
                <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center"><Instagram className="text-white" size={28} /></div>
             </div>
             <h3 className="text-xl font-serif italic text-white mb-2">See More</h3>
             <p className="text-xs text-zinc-500 mb-8 px-4 leading-relaxed">Visit our official Instagram page for the latest updates.</p>
             <a href={profile.link} target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">@{profile.username}</a>
        </div>
      </div>
    </section>
  );
};

export default ReelsSection;
