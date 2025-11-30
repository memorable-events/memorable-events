
import React, { useState } from 'react';
import { Github, Menu, X, ArrowRight, Warehouse, Tent, Shield } from 'lucide-react';
import { ServiceMode } from '../types';

interface NavbarProps {
  onLoginClick: () => void;
  currentMode: ServiceMode;
  onModeSwitch: (mode: ServiceMode) => void;
  isAdmin: boolean;
  onAdminPanelClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, currentMode, onModeSwitch, isAdmin, onAdminPanelClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Services', href: '#services' },
    { name: 'Plans', href: '#pricing' },
    { name: 'Cakes', href: '#cakes' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <>
      <nav 
        className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 border rounded-full flex items-center bg-white/5 backdrop-blur-2xl border-white/10 shadow-lg shadow-black/20 py-4 px-6 md:px-8"
      >
        {/* Left Column - Logo */}
        <div className="flex-1 flex justify-start">
            <div className="flex items-center gap-3 cursor-pointer group">
                <div className="rounded-full flex items-center justify-center border w-10 h-10 bg-zinc-900 border-white/10 shadow-inner">
                    <Github size={18} className="text-white" />
                </div>
                {/* Text hidden on tablet/laptop to save space, visible on xl desktops */}
                <span className="font-serif italic tracking-wide text-zinc-200 group-hover:text-white transition-colors hidden xl:inline text-lg">
                    Event.me
                </span>
            </div>
        </div>

        {/* Center Column - Navigation Links (Visible on md+) */}
        <div className="flex-none hidden md:flex items-center justify-center gap-4 lg:gap-6">
            {navItems.map((item) => (
                <a key={item.name} href={item.href} className="text-[10px] font-bold text-zinc-300 hover:text-white transition-colors uppercase tracking-wider py-2 relative group whitespace-nowrap">
                    {item.name}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-brand-primary transition-all duration-300 group-hover:w-full opacity-60"></span>
                </a>
            ))}
            <button onClick={onLoginClick} className="text-[10px] font-bold text-zinc-300 hover:text-white transition-colors uppercase tracking-wider py-2 relative group whitespace-nowrap">
                Login
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-brand-primary transition-all duration-300 group-hover:w-full opacity-60"></span>
            </button>
        </div>

        {/* Right Column - Buttons & Mobile Menu Toggle */}
        <div className="flex-1 flex justify-end">
             <div className="flex items-center gap-4">
                {isAdmin && (
                    <button onClick={onAdminPanelClick} className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20 text-xs font-bold hover:bg-yellow-500/20 transition-colors whitespace-nowrap">
                        <Shield size={14} /> <span className="hidden lg:inline">Admin Panel</span><span className="lg:hidden">Admin</span>
                    </button>
                )}
                
                {/* Mode Switcher - Visible on Tablet & Desktop */}
                <div className="hidden md:flex items-center p-1 bg-white/5 rounded-full border border-white/10">
                    <button onClick={() => onModeSwitch('INDOOR')} className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${currentMode === 'INDOOR' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                        <Warehouse size={12} /> <span>Room</span>
                    </button>
                    <button onClick={() => onModeSwitch('OUTDOOR')} className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${currentMode === 'OUTDOOR' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                        <Tent size={12} /> <span>Outdoor</span>
                    </button>
                </div>

                {/* Mobile Menu Button - Visible below md */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
                        <Menu size={20} />
                    </button>
                </div>
            </div>
        </div>
      </nav>

      {/* Mobile Full Screen Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#030303]/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-300">
             <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/5">
                <X size={24} />
             </button>
             <nav className="flex flex-col gap-6 text-center w-full px-8 max-h-[80vh] overflow-y-auto">
                {isAdmin && (
                    <button onClick={() => { onAdminPanelClick(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-3 text-lg font-medium text-yellow-400 bg-yellow-500/10 py-4 px-8 rounded-full border border-yellow-500/20 mb-4">
                        <Shield size={16} /> Admin Panel
                    </button>
                )}
                
                {/* Mode Switcher for Mobile */}
                <div className="flex md:hidden items-center justify-center p-1 bg-white/5 rounded-full border border-white/10 mb-4 self-center">
                    <button onClick={() => { onModeSwitch('INDOOR'); setIsMobileMenuOpen(false); }} className={`px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${currentMode === 'INDOOR' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                        <Warehouse size={14} /> <span>Room</span>
                    </button>
                    <button onClick={() => { onModeSwitch('OUTDOOR'); setIsMobileMenuOpen(false); }} className={`px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${currentMode === 'OUTDOOR' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                        <Tent size={14} /> <span>Outdoor</span>
                    </button>
                </div>

                {navItems.map((item, idx) => (
                    <a key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif italic text-zinc-400 hover:text-white transition-colors animate-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        {item.name}
                    </a>
                ))}
                <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-3 text-lg font-medium text-brand-primary bg-brand-primary/10 py-4 px-8 rounded-full border border-brand-primary/20 mt-4">
                    Client Login <ArrowRight size={16} />
                </button>
             </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
