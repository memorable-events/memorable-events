
import React, { useState } from 'react';
import { X, Plus, Trash2, Edit, Save } from 'lucide-react';
import { Service, Plan, Cake, GalleryItem, RealReel, SetupImage } from '../types';
import { api } from '../services/apiService';

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
        settings?: { heroVideoUrl?: string };
    };
    actions: {
        onCreate: (resource: string, item: any) => Promise<void>;
        onUpdate: (resource: string, id: number, item: any) => Promise<void>;
        onDelete: (resource: string, id: number) => Promise<void>;
        onUpdateSettings: (settings: any) => Promise<void>;
    };
}

type Tab = 'decorations' | 'plans' | 'cakes' | 'gallery' | 'reels' | 'general';

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, content, actions }) => {
    const [activeTab, setActiveTab] = useState<Tab>('decorations');
    const [editingItem, setEditingItem] = useState<{ resource: string, item: any } | null>(null);
    const [isCreating, setIsCreating] = useState<string | null>(null);

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

    const EditForm = ({ resource, item, onSave, onCancel }: { resource: string, item: any, onSave: (item: any) => void, onCancel: () => void }) => {
        const [formData, setFormData] = useState(item);
        const [uploading, setUploading] = useState(false);
        const [newSetup, setNewSetup] = useState<Partial<SetupImage>>({});
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
                    // If editing a reel, we might be uploading a thumbnail
                    // Actually, let's just assume the file input is next to the image/thumbnail field
                    const targetField = resource === 'reels' ? 'thumbnail' : 'image';
                    setFormData({ ...formData, [targetField]: url });
                } catch (error) {
                    alert("Upload failed. Check API key or network.");
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

            // Try to extract Reel ID and auto-fill thumbnail
            try {
                // Matches /reel/ID/ or /p/ID/
                const match = url.match(/\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    const reelId = match[1];
                    // Auto-generate thumbnail URL (Note: This is a best-effort public URL, might require upload if it fails)
                    if (!formData.thumbnail) {
                        setFormData(prev => ({
                            ...prev,
                            embedUrl: url,
                            thumbnail: `https://www.instagram.com/p/${reelId}/media/?size=l`
                        }));
                    }

                    // Trigger backend fetch to get video file
                    setUploading(true);
                    try {
                        const result = await api.fetchReel(url);
                        if (result.url) {
                            setFormData(prev => ({
                                ...prev,
                                embedUrl: result.url, // Use local URL for playback
                                thumbnail: result.thumbnail || prev.thumbnail, // Use generated thumbnail
                                originalUrl: url // Keep original for reference
                            }));
                        }
                    } catch (err) {
                        console.error("Failed to fetch reel video", err);
                        alert("Could not download reel video. Autoplay might not work.");
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
                                            {uploading && <span className="text-xs text-yellow-500">Uploading...</span>}
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
                                ) : key === 'embedUrl' && resource === 'reels' ? (
                                    <input
                                        type="text"
                                        name={key}
                                        value={formData[key] || ''}
                                        onChange={handleReelLinkPaste}
                                        className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
                                        placeholder="Paste Instagram Reel Link here..."
                                    />
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
                        {/* Setups Management Section */}
                        {(resource === 'indoor-decorations' || resource === 'outdoor-decorations') && (
                            <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                                <h4 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider">Setup Variations</h4>

                                {/* List Existing Setups */}
                                <div className="space-y-2 mb-4">
                                    {formData.setups?.map((setup: SetupImage, index: number) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-zinc-900 rounded border border-zinc-800">
                                            <img src={setup.src} alt="" className="w-10 h-10 rounded object-cover" />
                                            <div className="flex-grow">
                                                <div className="text-xs font-bold text-zinc-200">{setup.title}</div>
                                                <div className="text-[10px] text-zinc-500">{setup.price}</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newSetups = [...(formData.setups || [])];
                                                    newSetups.splice(index, 1);
                                                    setFormData({ ...formData, setups: newSetups });
                                                }}
                                                className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.setups || formData.setups.length === 0) && (
                                        <div className="text-xs text-zinc-500 italic">No setups added yet.</div>
                                    )}
                                </div>

                                {/* Add New Setup */}
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
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        try {
                                                            const url = await api.uploadFile(e.target.files[0]);
                                                            setNewSetup(prev => ({ ...prev, src: url }));
                                                        } catch (err) { alert("Upload failed"); }
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <button
                                        className="col-span-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 p-2 rounded text-xs font-bold uppercase tracking-wider"
                                        onClick={() => {
                                            if (newSetup.title && newSetup.src) {
                                                const setupToAdd = { ...newSetup, id: Date.now() } as SetupImage;
                                                setFormData({ ...formData, setups: [...(formData.setups || []), setupToAdd] });
                                                setNewSetup({});
                                            } else {
                                                alert("Title and Image are required");
                                            }
                                        }}
                                    >
                                        Add Setup
                                    </button>
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
        )
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
                        {(['decorations', 'plans', 'cakes', 'gallery', 'reels', 'general'] as Tab[]).map(tab => (
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
                                <button onClick={() => handleCreateStart('reels')} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40"><Plus size={16} /></button>
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
                                            <button onClick={() => actions.onDelete('reels', item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
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
                                                <label className="flex items-center justify-center gap-2 w-full p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded cursor-pointer transition-colors group">
                                                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Choose Video File</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="video/*"
                                                        onChange={async (e) => {
                                                            if (e.target.files?.[0]) {
                                                                const btn = e.target.parentElement;
                                                                if (btn) btn.innerHTML = '<span class="text-sm text-yellow-500">Uploading... Please wait</span>';
                                                                try {
                                                                    const url = await api.uploadFile(e.target.files[0]);
                                                                    await actions.onUpdateSettings({ heroVideoUrl: url });
                                                                    alert("Video uploaded and updated successfully!");
                                                                } catch (err) {
                                                                    alert("Upload failed");
                                                                } finally {
                                                                    if (btn) btn.innerHTML = '<span class="text-sm font-medium text-zinc-300 group-hover:text-white">Choose Video File</span>';
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
