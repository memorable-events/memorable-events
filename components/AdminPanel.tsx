import React, { useState } from 'react';
import { X, Plus, Trash2, Edit, Save, Minus, Loader } from 'lucide-react';
import { Service, Plan, Cake, GalleryItem, RealReel, SetupImage, AddOn } from '../types';
import { api } from '../services/apiService';
import TimePicker from './TimePicker';

interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
    content: {
        indoorDecorations: Service[];
        outdoorDecorations: Service[];
        indoorPlans: Plan[];
        outdoorPlans: Plan[];
        cakes: Cake[];
        galleryItems: GalleryItem[];
        reels: RealReel[];
        addons?: AddOn[];
        settings?: { heroVideoUrl?: string };
    };
    actions: {
        onCreate: (resource: string, item: any) => Promise<void>;
        onUpdate: (resource: string, id: number, item: any) => Promise<void>;
        onDelete: (resource: string, id: number) => Promise<void>;
        onUpdateSettings: (settings: any) => Promise<void>;
    };
}

type Tab = 'decorations' | 'plans' | 'cakes' | 'gallery' | 'reels' | 'addons' | 'bookings' | 'general';

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, content, actions }) => {
    const [activeTab, setActiveTab] = useState<Tab>('decorations');
    const [editingItem, setEditingItem] = useState<{ resource: string, item: any } | null>(null);
    const [isCreating, setIsCreating] = useState<string | null>(null);

    // Booking State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [customStart, setCustomStart] = useState<string>('');
    const [customEnd, setCustomEnd] = useState<string>('');

    React.useEffect(() => {
        if (selectedDate && activeTab === 'bookings') {
            api.fetchBookings(selectedDate).then(setBookings).catch(console.error);
        }
    }, [selectedDate, activeTab]);

    const handleToggleSlot = async (slot: string) => {
        if (!selectedDate) return;
        const booking = bookings.find(b => b.time_slot === slot);
        try {
            if (booking) {
                await api.deleteBooking(booking.id);
            } else {
                await api.createBooking(selectedDate, slot);
            }
            // Refresh
            const updated = await api.fetchBookings(selectedDate);
            setBookings(updated);
        } catch (error) {
            alert("Failed to update slot");
        }
    };

    if (!isOpen) return null;

    const handleEdit = (resource: string, item: any) => {
        setEditingItem({ resource, item });
    };

    const getFieldsForResource = (resource: string) => {
        if (resource.includes('decorations')) return ['title', 'category', 'description', 'image'];
        if (resource.includes('plans')) return ['name', 'price', 'description', 'hours', 'features', 'extras', 'image'];
        if (resource === 'cakes') return ['name', 'price', 'flavor', 'image'];
        if (resource === 'gallery') return ['title', 'category', 'image', 'className'];
        if (resource === 'reels') return ['caption', 'embedUrl', 'category'];
        if (resource === 'addons') return ['name', 'price', 'type'];
        return [];
    };

    const handleCreateStart = (resource: string) => {
        const fields = getFieldsForResource(resource);
        const emptyItem: any = {};
        fields.forEach(f => {
            if (f === 'features' || f === 'extras') emptyItem[f] = [];
            else emptyItem[f] = '';
        });
        setEditingItem({ resource, item: emptyItem });
        setIsCreating(resource);
    };

    const handleSave = async (data: any) => {
        if (!editingItem) return;
        if (isCreating) {
            await actions.onCreate(editingItem.resource, data);
        } else {
            await actions.onUpdate(editingItem.resource, data.id, data);
        }
        setEditingItem(null);
        setIsCreating(null);
    };

    const EditForm = ({ resource, item, onSave, onCancel }: { resource: string, item: any, onSave: (item: any) => void, onCancel: () => void }) => {
        const [formData, setFormData] = useState(item);
        const [uploading, setUploading] = useState(false);
        const [newSetup, setNewSetup] = useState<Partial<SetupImage>>({});
        const [editingSetupIndex, setEditingSetupIndex] = useState<number | null>(null);
        const [uploadingSetup, setUploadingSetup] = useState(false);
        const fields = getFieldsForResource(resource);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            if (name === 'features' || name === 'extras') {
                setFormData({ ...formData, [name]: value.split(',').map(s => s.trim()) });
            } else {
                setFormData({ ...formData, [name]: value });
            }
        };

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                setUploading(true);
                try {
                    const url = await api.uploadFile(e.target.files[0]);
                    const targetField = resource === 'reels' ? 'thumbnail' : 'image';
                    setFormData({ ...formData, [targetField]: url });
                } catch (error: any) {
                    alert(`Upload failed: ${error.message}`);
                } finally {
                    setUploading(false);
                }
            }
        };

        const handleSubmit = () => {
            onSave(formData);
        };

        const handleReelLinkPaste = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const url = e.target.value;
            setFormData({ ...formData, embedUrl: url });
            try {
                const match = url.match(/\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    const reelId = match[1];
                    if (!formData.thumbnail) {
                        setFormData(prev => ({
                            ...prev,
                            embedUrl: url,
                            thumbnail: `https://www.instagram.com/p/${reelId}/media/?size=l`
                        }));
                    }
                    setUploading(true);
                    try {
                        const result = await api.fetchReel(url);
                        // Case 1: Download Success (url is cloudinary/file)
                        if (result.url && !result.fallback) {
                            setFormData(prev => ({
                                ...prev,
                                embedUrl: result.url,
                                thumbnail: result.thumbnail || prev.thumbnail,
                                originalUrl: url
                            }));
                        }
                        // Case 2: Fallback (Link Only)
                        else if (result.fallback || result.embedUrl) {
                            setFormData(prev => ({
                                ...prev,
                                embedUrl: result.embedUrl || url, // Use the link as the source
                                thumbnail: result.thumbnail || prev.thumbnail,
                                originalUrl: url
                            }));
                            // Optional: Show a toast here that it's using link mode
                        }
                    } catch (err) {
                        console.error("Failed to fetch reel video", err);
                        // API Error? Just use the link we have
                        setFormData(prev => ({
                            ...prev,
                            embedUrl: url,
                            originalUrl: url
                        }));
                    } finally {
                        setUploading(false);
                    }
                }
            } catch (err) {
                console.log("Could not parse Instagram URL");
            }
        };

        return (
            <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg space-y-4 shadow-xl">
                    <h3 className="text-lg font-bold text-white">{isCreating ? 'Create New Item' : 'Edit Item'}</h3>

                    {resource === 'reels' && (
                        <div className="mb-4 p-3 bg-zinc-800/50 rounded border border-zinc-700 flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Need a link?</span>
                            <a
                                href={formData.category === 'OUTDOOR' ? "https://www.instagram.com/memorable_events4u/reels/" : "https://www.instagram.com/memorablepartyzone/reels/"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                {formData.category === 'OUTDOOR' ? 'Browse Outdoor Reels ↗' : 'Browse Indoor Reels ↗'}
                            </a>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {fields.map(key => (
                            <div key={key}>
                                <label className="text-xs uppercase text-zinc-400 font-bold mb-1 block">{key}</label>
                                {key === 'features' || key === 'extras' || key === 'description' ? (
                                    <textarea
                                        name={key}
                                        value={Array.isArray(formData[key]) ? formData[key].join(', ') : (formData[key] || '')}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
                                        rows={key === 'description' ? 3 : 2}
                                        placeholder={Array.isArray(formData[key]) ? "Comma separated values" : ""}
                                    />
                                ) : (key === 'image' || key === 'thumbnail') ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            name={key}
                                            value={formData[key] || ''}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
                                            placeholder="Image URL"
                                        />
                                        <div className="flex items-center gap-2">
                                            <input type="file" onChange={handleFileChange} className="text-xs text-zinc-400" accept="image/*" />
                                            {uploading && <div className="flex items-center gap-2 text-yellow-500 text-xs"><Loader size={14} className="animate-spin" /> Uploading...</div>}
                                        </div>
                                        {formData[key] && <img src={formData[key]} alt="Preview" className="h-20 rounded border border-zinc-700" />}
                                    </div>
                                ) : key === 'category' && resource === 'reels' ? (
                                    <select
                                        name={key}
                                        value={formData[key] || ''}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="INDOOR">INDOOR</option>
                                        <option value="OUTDOOR">OUTDOOR</option>
                                    </select>
                                ) : key === 'type' && resource === 'addons' ? (
                                    <select
                                        name={key}
                                        value={formData[key] || ''}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
                                    >
                                        <option value="checkbox">Checkbox (One-time)</option>
                                        <option value="quantity">Quantity (Countable)</option>
                                    </select>
                                ) : key === 'embedUrl' && resource === 'reels' ? (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name={key}
                                            value={formData[key] || ''}
                                            onChange={handleReelLinkPaste}
                                            className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded text-sm text-white focus:outline-none focus:border-yellow-500 pr-10"
                                            placeholder="Paste Instagram Reel Link here..."
                                        />
                                        {uploading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader size={16} className="text-yellow-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        name={key}
                                        value={formData[key] || ''}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
                                    />
                                )}
                            </div>
                        ))}

                        {(resource === 'indoor-decorations' || resource === 'outdoor-decorations') && (
                            <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                                <h4 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider">Setup Variations</h4>
                                <div className="space-y-2 mb-4">
                                    {formData.setups?.map((setup: SetupImage, index: number) => (
                                        <div key={index} className={`flex items-center gap-3 p-2 rounded border ${editingSetupIndex === index ? 'bg-zinc-800 border-yellow-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                                            {setup.src.match(/\.(mp4|webm)$/i) ? (
                                                <video src={setup.src} className="w-10 h-10 rounded object-cover" muted />
                                            ) : (
                                                <img src={setup.src} alt="" className="w-10 h-10 rounded object-cover" />
                                            )}
                                            <div className="flex-grow">
                                                <div className="text-xs font-bold text-zinc-200">{setup.title}</div>
                                                <div className="text-[10px] text-zinc-500">{setup.price}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setNewSetup(setup);
                                                        setEditingSetupIndex(index);
                                                    }}
                                                    className="p-1 text-blue-400 hover:bg-blue-400/10 rounded"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newSetups = [...(formData.setups || [])];
                                                        newSetups.splice(index, 1);
                                                        setFormData({ ...formData, setups: newSetups });
                                                        if (editingSetupIndex === index) {
                                                            setEditingSetupIndex(null);
                                                            setNewSetup({});
                                                        }
                                                    }}
                                                    className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!formData.setups || formData.setups.length === 0) && (
                                        <div className="text-xs text-zinc-500 italic">No setups added yet.</div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        placeholder="Title"
                                        className="bg-zinc-900 border border-zinc-700 p-2 rounded text-xs text-white focus:outline-none focus:border-yellow-500"
                                        value={newSetup.title || ''}
                                        onChange={e => setNewSetup({ ...newSetup, title: e.target.value })}
                                    />
                                    <input
                                        placeholder="Price (e.g. ₹2,500)"
                                        className="bg-zinc-900 border border-zinc-700 p-2 rounded text-xs text-white focus:outline-none focus:border-yellow-500"
                                        value={newSetup.price || ''}
                                        onChange={e => setNewSetup({ ...newSetup, price: e.target.value })}
                                    />
                                    <div className="col-span-2 flex gap-2">
                                        <input
                                            placeholder="Image URL"
                                            className="flex-grow bg-zinc-900 border border-zinc-700 p-2 rounded text-xs text-white focus:outline-none focus:border-yellow-500"
                                            value={newSetup.src || ''}
                                            onChange={e => setNewSetup({ ...newSetup, src: e.target.value })}
                                        />
                                        <label className="cursor-pointer bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded flex items-center justify-center">
                                            <Plus size={14} />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept={resource === 'indoor-decorations' || resource === 'outdoor-decorations' ? "image/*,video/*" : "image/*"}
                                                onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        setUploadingSetup(true);
                                                        try {
                                                            const url = await api.uploadFile(e.target.files[0]);
                                                            setNewSetup(prev => ({ ...prev, src: url }));
                                                        } catch (err: any) { alert(`Upload failed: ${err.message}`); }
                                                        finally { setUploadingSetup(false); }
                                                    }
                                                }}
                                            />
                                        </label>
                                        {uploadingSetup && <div className="flex items-center justify-center p-2"><Loader size={16} className="text-yellow-500 animate-spin" /></div>}
                                    </div>
                                    <div className="col-span-2 flex gap-2">
                                        {editingSetupIndex !== null && (
                                            <button
                                                className="flex-1 bg-zinc-700 text-white hover:bg-zinc-600 p-2 rounded text-xs font-bold uppercase tracking-wider"
                                                onClick={() => {
                                                    setEditingSetupIndex(null);
                                                    setNewSetup({});
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            className={`flex-1 p-2 rounded text-xs font-bold uppercase tracking-wider ${editingSetupIndex !== null ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'}`}
                                            onClick={() => {
                                                if (newSetup.title && newSetup.src) {
                                                    const updatedSetups = [...(formData.setups || [])];
                                                    if (editingSetupIndex !== null) {
                                                        updatedSetups[editingSetupIndex] = { ...newSetup, id: updatedSetups[editingSetupIndex].id } as SetupImage;
                                                        setEditingSetupIndex(null);
                                                    } else {
                                                        updatedSetups.push({ ...newSetup, id: Date.now() } as SetupImage);
                                                    }
                                                    setFormData({ ...formData, setups: updatedSetups });
                                                    setNewSetup({});
                                                } else {
                                                    alert("Title and Image are required");
                                                }
                                            }}
                                        >
                                            {editingSetupIndex !== null ? 'Update Setup' : 'Add Setup'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                        <button onClick={onCancel} className="px-4 py-2 text-xs font-bold rounded bg-zinc-700 text-white hover:bg-zinc-600">Cancel</button>
                        <button onClick={handleSubmit} disabled={uploading} className="px-4 py-2 text-xs font-bold rounded bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50">Save Changes</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in duration-300 p-4 md:p-8">
            <button onClick={onClose} className="fixed top-8 right-8 z-[80] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5 backdrop-blur-md"><X size={24} /></button>

            <div className="w-full h-full max-w-7xl mx-auto bg-[#080808]/90 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-zoom-in">
                <div className="p-8 border-b border-white/5 flex-shrink-0 bg-white/5 backdrop-blur-md z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-serif italic text-white">Admin Panel</h2>
                        <p className="text-zinc-400 text-sm uppercase tracking-widest">Website Content Management</p>
                    </div>
                    <div className="flex items-center p-1 bg-black/20 rounded-full border border-white/5 overflow-x-auto">
                        {(['decorations', 'plans', 'cakes', 'gallery', 'reels', 'addons', 'bookings', 'general'] as Tab[]).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}>{tab}</button>
                        ))}
                    </div>
                </div>

                <div className="overflow-y-auto p-8 text-sm custom-scrollbar bg-zinc-950/50 flex-grow">
                    {/* Decorations Tab */}
                    {activeTab === 'decorations' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Indoor Decorations</h4>
                                    <button onClick={() => handleCreateStart('indoor-decorations')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
                                </div>
                                <div className="space-y-2">
                                    {content.indoorDecorations.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700">
                                            <span className="font-medium text-zinc-200">{item.title}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit('indoor-decorations', item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} /></button>
                                                <button onClick={() => actions.onDelete('indoor-decorations', item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Outdoor Decorations</h4>
                                    <button onClick={() => handleCreateStart('outdoor-decorations')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
                                </div>
                                <div className="space-y-2">
                                    {content.outdoorDecorations.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700">
                                            <span className="font-medium text-zinc-200">{item.title}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit('outdoor-decorations', item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} /></button>
                                                <button onClick={() => actions.onDelete('outdoor-decorations', item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Plans Tab */}
                    {activeTab === 'plans' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Indoor Plans</h4>
                                    <button onClick={() => handleCreateStart('indoor-plans')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
                                </div>
                                <div className="space-y-2">
                                    {content.indoorPlans.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700">
                                            <span className="font-medium text-zinc-200">{item.name}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit('indoor-plans', item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} /></button>
                                                <button onClick={() => actions.onDelete('indoor-plans', item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Outdoor Plans</h4>
                                    <button onClick={() => handleCreateStart('outdoor-plans')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
                                </div>
                                <div className="space-y-2">
                                    {content.outdoorPlans.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700">
                                            <span className="font-medium text-zinc-200">{item.name}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit('outdoor-plans', item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} /></button>
                                                <button onClick={() => actions.onDelete('outdoor-plans', item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cakes Tab */}
                    {activeTab === 'cakes' && (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Cakes</h4>
                                <button onClick={() => handleCreateStart('cakes')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
                            </div>
                            <div className="space-y-2">
                                {content.cakes.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image} alt="" className="w-8 h-8 rounded object-cover bg-zinc-800" />
                                            <span className="font-medium text-zinc-200">{item.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit('cakes', item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} /></button>
                                            <button onClick={() => actions.onDelete('cakes', item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery Tab */}
                    {activeTab === 'gallery' && (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Gallery Items</h4>
                                <button onClick={() => handleCreateStart('gallery')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
                            </div>
                            <div className="space-y-2">
                                {content.galleryItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image} alt="" className="w-8 h-8 rounded object-cover bg-zinc-800" />
                                            <span className="font-medium text-zinc-200">{item.title}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit('gallery', item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} /></button>
                                            <button onClick={() => actions.onDelete('gallery', item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reels Tab */}
                    {activeTab === 'reels' && (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Instagram Reels</h4>
                                {content.reels.length < 3 && (
                                    <button onClick={() => handleCreateStart('reels')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {content.reels.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700">
                                        <div className="flex items-center gap-3">
                                            <img src={item.thumbnail} alt="" className="w-8 h-8 rounded object-cover bg-zinc-800" />
                                            <div>
                                                <span className="font-medium text-zinc-200 block">{item.caption}</span>
                                                <span className="text-[10px] text-zinc-500 uppercase">{item.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit('reels', item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} /></button>
                                            <button onClick={async () => {
                                                if (!confirm("Are you sure you want to delete this reel?")) return;
                                                try {
                                                    await actions.onDelete('reels', item.id);
                                                } catch (e: any) {
                                                    alert(e.message);
                                                }
                                            }} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Addons Tab */}
                    {activeTab === 'addons' && (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Add-ons</h4>
                                <button onClick={() => handleCreateStart('addons')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
                            </div>
                            <div className="space-y-2">
                                {content.addons?.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center bg-zinc-800 text-zinc-400`}>
                                                {item.type === 'checkbox' ? <span className="text-xs">☑</span> : <span className="text-xs">123</span>}
                                            </div>
                                            <div>
                                                <span className="font-medium text-zinc-200 block">{item.name}</span>
                                                <span className="text-[10px] text-zinc-500">{item.price}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit('addons', item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit size={14} /></button>
                                            <button onClick={() => actions.onDelete('addons', item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-zinc-300 uppercase tracking-wider">Manage Availability</h4>
                                <div className="text-xs text-zinc-500">Block or unblock time slots</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Calendar */}
                                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 text-zinc-400 hover:text-white"><Minus size={16} /></button>
                                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 text-zinc-400 hover:text-white"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                            <div key={d} className="text-xs text-zinc-500 font-bold">{d}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {(() => {
                                            const year = currentMonth.getFullYear();
                                            const month = currentMonth.getMonth();
                                            const firstDay = new Date(year, month, 1);
                                            const lastDay = new Date(year, month + 1, 0);
                                            const daysInMonth = lastDay.getDate();
                                            const startingDay = firstDay.getDay();

                                            const days = [];
                                            for (let i = 0; i < startingDay; i++) {
                                                days.push(<div key={`empty-${i}`} className="p-2"></div>);
                                            }
                                            for (let i = 1; i <= daysInMonth; i++) {
                                                const date = new Date(year, month, i);
                                                const dateString = date.toISOString().split('T')[0];
                                                const isSelected = selectedDate === dateString;
                                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                                                days.push(
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedDate(dateString)}
                                                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-brand-primary text-black' : isPast ? 'text-zinc-600' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                                    >
                                                        {i}
                                                    </button>
                                                );
                                            }
                                            return days;
                                        })()}
                                    </div>
                                </div>

                                {/* Time Slots */}
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">
                                        {selectedDate ? `Slots for ${selectedDate}` : 'Select a date'}
                                    </h4>
                                    {selectedDate ? (
                                        <div className="space-y-6">
                                            {/* Custom Block */}
                                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                                                <h5 className="text-zinc-400 text-xs font-bold uppercase mb-3">Block Custom Range</h5>
                                                <div className="flex gap-2 mb-3">
                                                    <TimePicker
                                                        label="Start Time"
                                                        value={customStart}
                                                        onChange={setCustomStart}
                                                    />
                                                    <TimePicker
                                                        label="End Time"
                                                        value={customEnd}
                                                        onChange={setCustomEnd}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (customStart && customEnd) {
                                                            handleToggleSlot(`${customStart} - ${customEnd}`);
                                                            setCustomStart('');
                                                            setCustomEnd('');
                                                        } else {
                                                            alert("Please select both start and end times");
                                                        }
                                                    }}
                                                    className="w-full py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg text-sm font-bold hover:bg-red-900/50 transition-colors"
                                                >
                                                    Block Range
                                                </button>
                                            </div>

                                            {/* List Blocks */}
                                            <div className="space-y-2">
                                                <h5 className="text-zinc-400 text-xs font-bold uppercase">Blocked Slots</h5>
                                                {bookings.map(b => (
                                                    <div key={b.id} className="flex justify-between items-center p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                                                        <span className="text-red-400 text-sm font-bold">{b.time_slot}</span>
                                                        <button onClick={() => handleToggleSlot(b.time_slot)} className="p-1 text-red-400 hover:text-white"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                                {bookings.length === 0 && (
                                                    <p className="text-zinc-600 text-xs italic">No slots blocked for this date.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-zinc-500 text-sm italic">Select a date to manage slots.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* General Settings Tab */}
                    {activeTab === 'general' && (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-8">
                            <div>
                                <h4 className="font-bold text-zinc-300 uppercase tracking-wider mb-4">Hero Section Video</h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                                        <label className="text-xs uppercase text-zinc-500 font-bold mb-2 block">Current Video URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={content.settings?.heroVideoUrl || ''}
                                                readOnly
                                                className="flex-grow bg-zinc-950 border border-zinc-700 p-3 rounded text-sm text-zinc-300 focus:outline-none"
                                                placeholder="No video set (using default)"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                                        <label className="text-xs uppercase text-zinc-500 font-bold mb-2 block">Update Video</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-zinc-400 mb-2">Option 1: Paste URL</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        id="hero-url-input"
                                                        className="flex-grow bg-zinc-950 border border-zinc-700 p-2 rounded text-sm text-white focus:outline-none focus:border-brand-primary"
                                                        placeholder="https://..."
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const input = document.getElementById('hero-url-input') as HTMLInputElement;
                                                            if (input.value) actions.onUpdateSettings({ heroVideoUrl: input.value });
                                                        }}
                                                        className="bg-white text-black px-4 py-2 rounded font-bold text-xs uppercase hover:bg-zinc-200"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-zinc-400 mb-2">Option 2: Upload Video</p>
                                                <label className={`flex items-center justify-center gap-2 w-full p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded cursor-pointer transition-colors group ${isCreating === 'hero_upload' ? 'pointer-events-none opacity-50' : ''}`}>
                                                    {isCreating === 'hero_upload' ? (
                                                        <>
                                                            <Loader size={16} className="text-yellow-500 animate-spin" />
                                                            <span className="text-sm text-yellow-500">Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Choose Video File</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="video/*"
                                                        disabled={isCreating === 'hero_upload'}
                                                        onChange={async (e) => {
                                                            if (e.target.files?.[0]) {
                                                                setIsCreating('hero_upload'); // Abuse isCreating state temporarily for loading to avoid top-level state pollution if preferred, or add new state.
                                                                // Actually better to add a new state at top level or just use this hack since component is large? 
                                                                // Let's check AdminPanel "isCreating" type. It's string|null.
                                                                // I'll assume we can use it or I should add a dedicated state.
                                                                // Adding dedicated state at top level is cleaner.
                                                                try {
                                                                    const url = await api.uploadFile(e.target.files[0]);
                                                                    await actions.onUpdateSettings({ heroVideoUrl: url });
                                                                    alert("Video uploaded and updated successfully!");
                                                                } catch (err: any) {
                                                                    alert(`Upload failed: ${err.message}`);
                                                                } finally {
                                                                    setIsCreating(null);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {editingItem && (
                <EditForm
                    resource={editingItem.resource}
                    item={editingItem.item}
                    onSave={handleSave}
                    onCancel={() => { setEditingItem(null); setIsCreating(null); }}
                />
            )}
        </div>
    );
};

export default AdminPanel;
