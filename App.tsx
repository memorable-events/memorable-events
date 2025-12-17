import React, { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventSlider from './components/EventSlider';
import CakeSection from './components/CakeSection';
import PricingSection from './components/PricingSection';
import EventGallery from './components/EventGallery';
import InquirySection from './components/InquirySection';
import LoginModal from './components/LoginModal';
import CreateEventModal from './components/CreateEventModal';
import PortfolioModal from './components/PortfolioModal';
import MenuSection from './components/MenuSection';
import ModeSelectionScreen from './components/ModeSelectionScreen';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanel from './components/AdminPanel';
import BookingModal from './components/BookingModal';
import DecorationModal from './components/DecorationModal';

import RealReelsSection from './components/RealReelsSection';
import { ModalType, ServiceMode, Service, Plan, Cake, GalleryItem, RealReel, SetupImage, AddOn } from './types';
import {
  DEFAULT_INDOOR_DECORATIONS, DEFAULT_OUTDOOR_DECORATIONS,
  DEFAULT_INDOOR_PLANS, DEFAULT_OUTDOOR_PLANS,
  DEFAULT_CAKES, DEFAULT_GALLERY_ITEMS,
  INDOOR_SETUP_IMAGES, OUTDOOR_SETUP_IMAGES,
  REAL_REELS_DATA, DEFAULT_ADDONS
} from './data';
// ...
import { ArrowRight } from 'lucide-react';
import { api } from './services/apiService';

function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [mode, setMode] = useState<ServiceMode | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDecoration, setSelectedDecoration] = useState<Service | null>(null);
  const [bookingSelection, setBookingSelection] = useState<{ decoration: Service, setup: SetupImage | null, plan: Plan, mode: 'INDOOR' | 'OUTDOOR' } | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Content State
  const [indoorDecorations, setIndoorDecorations] = useState<Service[]>(DEFAULT_INDOOR_DECORATIONS);
  const [outdoorDecorations, setOutdoorDecorations] = useState<Service[]>(DEFAULT_OUTDOOR_DECORATIONS);
  const [indoorPlans, setIndoorPlans] = useState<Plan[]>(DEFAULT_INDOOR_PLANS);
  const [outdoorPlans, setOutdoorPlans] = useState<Plan[]>(DEFAULT_OUTDOOR_PLANS);
  const [cakes, setCakes] = useState<Cake[]>(DEFAULT_CAKES);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [reels, setReels] = useState<RealReel[]>([]);
  const [addons, setAddons] = useState<AddOn[]>(DEFAULT_ADDONS);

  const [settings, setSettings] = useState<{ heroVideoUrl?: string }>({});

  const handlePlanSelect = (plan: Plan, setup: SetupImage | null) => {
    if (selectedDecoration && mode) {
      setBookingSelection({
        decoration: selectedDecoration,
        setup,
        plan,
        mode
      });
      setActiveModal(ModalType.BOOKING);
    }
  };

  // Check for admin session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  // Fetch content on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const content = await api.getContent();
        // If backend returns data, use it. Otherwise, defaults remain.
        if (content.indoorDecorations && content.indoorDecorations.length > 0) setIndoorDecorations(content.indoorDecorations);
        if (content.outdoorDecorations && content.outdoorDecorations.length > 0) setOutdoorDecorations(content.outdoorDecorations);
        if (content.indoorPlans && content.indoorPlans.length > 0) setIndoorPlans(content.indoorPlans);
        if (content.outdoorPlans && content.outdoorPlans.length > 0) setOutdoorPlans(content.outdoorPlans);
        if (content.cakes && content.cakes.length > 0) setCakes(content.cakes);
        if (content.galleryItems && content.galleryItems.length > 0) setGalleryItems(content.galleryItems);
        if (content.settings) setSettings(content.settings);
        if (content.addons && content.addons.length > 0) setAddons(content.addons);

        if (content.settings) setSettings(content.settings);
        if (content.addons && content.addons.length > 0) setAddons(content.addons);

        // For reels, we now strictly trust the backend. If it returns [], we show [].
        // This prevents "Zombie Reels" from defaults appearing after deletion.
        if (content.reels) {
          setReels(content.reels);
        } else {
          setReels([]);
        }
      } catch (error) {
        console.log("Backend not connected, using default data.");
        // Only use defaults if connection FAILED completely
        // ... (existing default fallback logic for connection error) ...
        // Flatten default reels data if backend fails
        const defaultReels = [...(REAL_REELS_DATA.INDOOR || []), ...(REAL_REELS_DATA.OUTDOOR || [])].map(r => ({
          ...r,
          category: (REAL_REELS_DATA.INDOOR?.find(ir => ir.id === r.id) ? 'INDOOR' : 'OUTDOOR') as 'INDOOR' | 'OUTDOOR'
        }));
        setReels(defaultReels);
      }
    };
    fetchContent();
  }, []);

  const closeModal = () => {
    setActiveModal(ModalType.NONE);
    setSelectedDecoration(null);
  };

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.defaultMuted = true;
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(error => {
        console.warn("Hero video autoplay failed:", error);
      });
    }
  }, [settings.heroVideoUrl]); // Re-run when video URL changes

  const scrollToInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAdminLogin = async (password: string) => {
    try {
      const response = await api.login(password);
      sessionStorage.setItem('admin_token', response.token);
      setIsAdmin(true);
      closeModal();
    } catch (error) {
      // Fallback for demo without backend
      if (password === 'admin123' || password === 'admin') {
        setIsAdmin(true);
        closeModal();
        return;
      }
      alert('Incorrect password');
    }
  };

  // CRUD Handlers passed to AdminPanel
  // CRUD Handlers passed to AdminPanel
  const handleCreateItem = async (resource: string, item: any) => {
    try {
      const newItem = await api.createItem(resource, item);

      switch (resource) {
        case 'indoor-decorations': setIndoorDecorations([...indoorDecorations, newItem]); break;
        case 'outdoor-decorations': setOutdoorDecorations([...outdoorDecorations, newItem]); break;
        case 'indoor-plans': setIndoorPlans([...indoorPlans, newItem]); break;
        case 'outdoor-plans': setOutdoorPlans([...outdoorPlans, newItem]); break;
        case 'cakes': setCakes([...cakes, newItem]); break;
        case 'gallery': setGalleryItems([...galleryItems, newItem]); break;
        case 'reels': setReels([...reels, newItem]); break;
        case 'addons': setAddons([...addons, newItem]); break;
      }
    } catch (e: any) {
      console.error("Create failed", e);
      alert(`Failed to create item: ${e.message}`);
    }
  };

  const handleUpdateItem = async (resource: string, id: number, item: any) => {
    try {
      await api.updateItem(resource, id, item);
      const updateList = (list: any[]) => list.map(i => i.id === id ? { ...item, id } : i);

      switch (resource) {
        case 'indoor-decorations': setIndoorDecorations(updateList(indoorDecorations)); break;
        case 'outdoor-decorations': setOutdoorDecorations(updateList(outdoorDecorations)); break;
        case 'indoor-plans': setIndoorPlans(updateList(indoorPlans)); break;
        case 'outdoor-plans': setOutdoorPlans(updateList(outdoorPlans)); break;
        case 'cakes': setCakes(updateList(cakes)); break;
        case 'gallery': setGalleryItems(updateList(galleryItems)); break;
        case 'reels': setReels(updateList(reels)); break;
        case 'addons': setAddons(updateList(addons)); break;
      }
    } catch (e: any) {
      console.error("Update failed", e);
      alert(`Failed to update item: ${e.message}`);
    }
  };

  const handleDeleteItem = async (resource: string, id: number) => {
    try {
      await api.deleteItem(resource, id);
      const filterList = (list: any[]) => list.filter(i => i.id !== id);

      switch (resource) {
        case 'indoor-decorations': setIndoorDecorations(filterList(indoorDecorations)); break;
        case 'outdoor-decorations': setOutdoorDecorations(filterList(outdoorDecorations)); break;
        case 'indoor-plans': setIndoorPlans(filterList(indoorPlans)); break;
        case 'outdoor-plans': setOutdoorPlans(filterList(outdoorPlans)); break;
        case 'cakes': setCakes(filterList(cakes)); break;
        case 'gallery': setGalleryItems(filterList(galleryItems)); break;
        case 'reels': setReels(filterList(reels)); break;
        case 'addons': setAddons(filterList(addons)); break;
      }
    } catch (e: any) {
      console.error("Delete failed", e);
      alert(`Failed to delete item: ${e.message}`);
    }
  };

const handleUpdateSettings = async (newSettings: any) => {
  try {
    const updated = await api.updateSettings(newSettings);
    setSettings(prev => ({ ...prev, ...updated }));
  } catch (e) {
    console.error("Settings update failed", e);
    alert("Failed to update settings");
  }
};

const handleDecorationClick = (decoration: Service) => {
  setSelectedDecoration(decoration);
  setActiveModal(ModalType.DECORATION);
};

if (!mode) {
  return <ModeSelectionScreen onSelect={(selectedMode) => setMode(selectedMode)} />;
}

const setupImagesForModal = selectedDecoration?.setups || [];

return (
  <div className="min-h-screen bg-brand-bg text-white relative selection:bg-brand-primary/30 animate-in fade-in duration-700">
    <Navbar
      onLoginClick={() => setActiveModal(ModalType.LOGIN)}
      currentMode={mode}
      onModeSwitch={setMode}
      isAdmin={isAdmin}
      onAdminPanelClick={() => setActiveModal(ModalType.ADMIN_PANEL)}
    />

    <main className="max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20 relative z-10">

      <div className="relative w-full max-w-7xl mx-auto rounded-[2.5rem] p-6 md:p-12 mb-24 overflow-hidden min-h-[500px] md:min-h-[420px] flex flex-col justify-end border border-white/5 bg-zinc-900/20 shadow-2xl isolate group">
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover transition-opacity duration-1000"
            key={settings.heroVideoUrl || 'default'}
          >
            <source src={settings.heroVideoUrl || "/hero.mp4"} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-20 max-w-4xl">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
              {mode === 'INDOOR' ? 'Premium Party Rooms' : 'Outdoor Event Logistics'}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white opacity-95">
            {mode === 'INDOOR' ? 'Venue Atmosphere' : 'To Your Doorstep'}
          </h1>
          <p className="mt-8 text-zinc-300 max-w-lg text-base leading-relaxed">
            {mode === 'INDOOR'
              ? "Step into our exclusive soundproof party suites equipped with high-fidelity audio, dynamic lighting, and private bar service."
              : "From backyard gatherings to large-scale festivals, we provide the tents, power, and logistics to make any location perfect."}
          </p>
          <div className="mt-8">
            <a href="#contact" onClick={scrollToInquiry} className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-lg group">
              Inquire Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      <EventSlider
        services={mode === 'INDOOR' ? indoorDecorations : outdoorDecorations}
        onCardClick={handleDecorationClick}
      />
      <PricingSection plans={mode === 'INDOOR' ? indoorPlans : outdoorPlans} mode={mode} />
      <RealReelsSection mode={mode} reels={reels.filter(r => r.category === mode)} />
      <CakeSection cakes={cakes} />
      <EventGallery galleryItems={galleryItems} onViewMore={() => setActiveModal(ModalType.PORTFOLIO)} />
      {mode === 'INDOOR' && <MenuSection />}
      <InquirySection />

    </main>

    <footer className="w-full border-t border-white/5 bg-zinc-950 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h3 className="font-serif italic text-2xl text-white mb-6">Memorable Event</h3>
        <div className="flex justify-center gap-8 mb-8 text-xs text-zinc-500 uppercase tracking-widest">
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <a href="#pricing" className="hover:text-white transition-colors">Plans</a>
          <a href="#cakes" className="hover:text-white transition-colors">Cakes</a>
          <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="text-zinc-700 text-[10px] uppercase tracking-widest">
          Memorable Event © 2025 · Designed by <a href="https://github.com/Jaybhatt-Github">Jay</a> · <button onClick={() => setActiveModal(ModalType.ADMIN_LOGIN)} className="hover:text-white transition-colors">Admin</button>
        </p>
      </div>
    </footer>

    <LoginModal isOpen={activeModal === ModalType.LOGIN} onClose={closeModal} />
    <CreateEventModal isOpen={activeModal === ModalType.CREATE_EVENT} onClose={closeModal} />
    <PortfolioModal isOpen={activeModal === ModalType.PORTFOLIO} onClose={closeModal} />
    <DecorationModal
      isOpen={activeModal === ModalType.DECORATION}
      onClose={closeModal}
      decoration={selectedDecoration}
      setupImages={setupImagesForModal}
      plans={mode === 'INDOOR' ? indoorPlans : outdoorPlans}
      onPlanSelect={handlePlanSelect}
    />
    {bookingSelection && (
      <BookingModal
        isOpen={activeModal === ModalType.BOOKING}
        onClose={closeModal}
        selection={bookingSelection}
        addons={addons}
      />
    )}
    <AdminLoginModal isOpen={activeModal === ModalType.ADMIN_LOGIN} onClose={closeModal} onLogin={handleAdminLogin} />
    {isAdmin && (
      <AdminPanel
        isOpen={activeModal === ModalType.ADMIN_PANEL}
        onClose={closeModal}
        content={{ indoorDecorations, outdoorDecorations, indoorPlans, outdoorPlans, cakes, galleryItems, reels, settings, addons }}
        actions={{ onCreate: handleCreateItem, onUpdate: handleUpdateItem, onDelete: handleDeleteItem, onUpdateSettings: handleUpdateSettings }}
      />
    )}

    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-float opacity-50 mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-fuchsia-600/20 rounded-full blur-[100px] animate-pulse-slow opacity-40 mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-purple-500/20 rounded-full blur-[140px] animate-float opacity-40 mix-blend-screen" style={{ animationDelay: '2s' }} />
    </div>

  </div>
);
}

export default App;
