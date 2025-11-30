import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, AlignLeft, Sparkles, ArrowRight } from 'lucide-react';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
    });
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerateDescription = async () => {
        if (!formData.title) return;
        setIsGenerating(true);
        // Mock generation since AI is removed
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                description: `Join us for ${formData.title}! It's going to be an amazing event with great company and memories to last a lifetime.`
            }));
            setIsGenerating(false);
        }, 1000);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, title: e.target.value }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, description: e.target.value }));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
            <div className="glass-panel w-full max-w-3xl rounded-[2.5rem] p-0 relative shadow-2xl overflow-hidden flex flex-col md:flex-row mx-4">

                {/* Left Panel - Visual/Decor */}
                <div className="w-full md:w-1/3 bg-zinc-900/50 p-8 flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-primary/5 opacity-50"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                            <Sparkles className="text-brand-primary" size={20} />
                        </div>
                        <h3 className="text-2xl font-serif italic text-white mb-2">Create Experience</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">Craft the perfect narrative for your event.</p>
                    </div>
                    <div className="relative z-10 mt-12 md:mt-0">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Powered by</div>
                        <div className="font-semibold text-zinc-400">Event.me</div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full md:w-2/3 p-8 bg-[#080808]">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-medium text-white">Event Details</h2>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Event Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="e.g., Midnight Jazz Gala"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-primary/50 focus:bg-white/10 focus:outline-none transition-all placeholder-zinc-700"
                            />
                        </div>

                        {/* Description with AI */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Description</label>
                                <button
                                    onClick={handleGenerateDescription}
                                    disabled={!formData.title || isGenerating}
                                    className="text-[10px] px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                                >
                                    <Sparkles size={10} />
                                    {isGenerating ? 'Dreaming...' : 'Auto-Generate'}
                                </button>
                            </div>
                            <textarea
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                rows={4}
                                placeholder="Describe your event..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-primary/50 focus:bg-white/10 focus:outline-none transition-all resize-none placeholder-zinc-700 leading-relaxed text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Date</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-brand-primary/50 focus:bg-white/10 focus:outline-none transition-all [color-scheme:dark] text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Location</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Venue"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-brand-primary/50 focus:bg-white/10 focus:outline-none transition-all text-sm placeholder-zinc-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-4 rounded-xl mt-4 shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                            <span>Publish Event</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEventModal;