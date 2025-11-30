
import React, { useState } from 'react';
import { X, Leaf, Drumstick } from 'lucide-react';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VEG_MENU = {
    "VEG. SOUPS": [ { name: "Manchow Soup", price: "100.00" }, { name: "Clear Soup", price: "100.00" }, { name: "Hot & Sour Soup", price: "100.00" }, { name: "Noodles Soup", price: "100.00" }, { name: "Mushroom Soup", price: "100.00" } ],
    "VEG. STARTERS": [ { name: "Aloo Chat", price: "100.00" }, { name: "Aloo Fingers", price: "100.00" }, { name: "Paneer Chilly", price: "180.00" }, { name: "Paneer Crispy", price: "180.00" }, { name: "Veg. Manchurian", price: "160.00" }, { name: "Mushroom Chilly Dry", price: "160.00" }, { name: "Paneer Tikka", price: "180.00" } ],
    "VEG. MAIN COURSE": [ { name: "Veg. Rangeela", price: "160.00" }, { name: "Paneer Hyderabadi Masala", price: "200.00" }, { name: "Paneer Tikka Masala", price: "180.00" }, { name: "Paneer Butter Masala", price: "200.00" }, { name: "Mix Vegetable", price: "160.00" }, { name: "Dal Fry", price: "100.00" }, { name: "Dal Tadka", price: "140.00" } ],
    "VEG. CHINESE RICE": [ { name: "Veg. Fried Rice", price: "120.00/80.00" }, { name: "Veg. Schezwan Rice", price: "140.00/90.00" }, { name: "Veg. Triple Rice", price: "180.00/100.00" } ],
    "BREAD/ROTI/NAAN": [ { name: "Tandoori Roti", price: "15.00" }, { name: "Butter Roti", price: "20.00" }, { name: "Naan", price: "25.00" }, { name: "Butter Naan", price: "30.00" }, { name: "Garlic Naan", price: "70.00" } ]
};

const NON_VEG_MENU = {
    "NON-VEG. SOUPS": [ { name: "Chicken Manchow Soup", price: "110.00" }, { name: "Chicken Clear Soup", price: "110.00" }, { name: "Chicken Hot & Sour Soup", price: "110.00" } ],
    "NON-VEG. STARTERS": [ { name: "Pota/Kaleji Fry", price: "150.00" }, { name: "Chicken Tandoori (Half/Full)", price: "200.00/350.00" }, { name: "Chicken Lollypop Dry (06 Pcs.)", price: "180.00" }, { name: "Chicken Chilly", price: "180.00" }, { name: "Chicken 65", price: "180.00" }, { name: "Chicken Tikka", price: "200.00" } ],
    "SEA FOOD STARTERS": [ { name: "Prawns Koliwada", price: "200.00" }, { name: "Prawns 65", price: "200.00" }, { name: "Bangda Fry", price: "120.00" } ],
    "NON-VEG. MAIN COURSE": [ { name: "Chicken Kadai", price: "160.00" }, { name: "Butter Chicken (Half/Full)", price: "220.00/380.00" }, { name: "Chicken Tikka Masala", price: "180.00" }, { name: "Egg Masala", price: "120.00" } ],
    "NON-VEG. CHINESE RICE": [ { name: "Chicken Fried Rice", price: "140.00/90.00" }, { name: "Egg Fried Rice", price: "120.00/80.00" }, { name: "Prawns Fried Rice", price: "200.00/120.00" } ],
    "NON-VEG. BASMATI": [ { name: "Chicken Biryani", price: "160.00" }, { name: "Chicken Dum Biryani", price: "180.00" }, { name: "Chicken Tandoori Biryani", price: "200.00" } ]
};

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'VEG' | 'NON-VEG'>('VEG');

  if (!isOpen) return null;

  const menuToDisplay = activeTab === 'VEG' ? VEG_MENU : NON_VEG_MENU;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in duration-300 p-4 md:p-8">
      <button 
        onClick={onClose}
        className="fixed top-8 right-8 z-[80] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5 backdrop-blur-md"
      >
        <X size={24} />
      </button>

      <div className="w-full h-full max-w-4xl mx-auto bg-[#080808]/90 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl animate-zoom-in">
        <div className="p-8 md:p-12 border-b border-white/5 flex-shrink-0 bg-white/5 backdrop-blur-md z-10">
            <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-2">Canteen Menu</h2>
            <p className="text-zinc-400 text-sm uppercase tracking-widest">Prabhat Ki Rasoi</p>
            
            {/* Tabs */}
            <div className="mt-6 flex items-center p-1 bg-black/20 rounded-full border border-white/5 w-min">
                <button 
                    onClick={() => setActiveTab('VEG')}
                    className={`px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'VEG' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
                >
                    <Leaf size={14} /> Veg
                </button>
                <button 
                    onClick={() => setActiveTab('NON-VEG')}
                    className={`px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'NON-VEG' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
                >
                    <Drumstick size={14} /> Non-Veg
                </button>
            </div>
        </div>

        <div className="overflow-y-auto p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {Object.entries(menuToDisplay).map(([category, items]) => (
                    <div key={category}>
                        <h3 className="text-sm font-bold text-brand-primary uppercase tracking-widest mb-4 border-b border-brand-primary/20 pb-2">{category}</h3>
                        <div className="space-y-3">
                            {(items as {name: string, price: string}[]).map(item => (
                                <div key={item.name} className="flex justify-between items-baseline text-zinc-300">
                                    <p className="text-sm">{item.name}</p>
                                    <div className="flex-grow border-b border-dotted border-zinc-700 mx-2"></div>
                                    <p className="text-sm font-mono font-semibold text-zinc-100">₹{item.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
