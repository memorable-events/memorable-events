
import React, { useState } from 'react';
import { Leaf, Drumstick } from 'lucide-react';

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

const MenuSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VEG' | 'NON-VEG'>('VEG');

  const menuToDisplay = activeTab === 'VEG' ? VEG_MENU : NON_VEG_MENU;

  return (
    <section id="canteen-menu" className="mb-24 md:mb-32 px-4 md:px-0 relative z-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-3">
          Canteen Menu
        </h2>
        <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-medium">
          Prabhat Ki Rasoi - A taste of tradition
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full mx-auto bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Header with Tabs */}
        <div className="p-8 border-b border-white/5 flex-shrink-0 bg-zinc-950/30 backdrop-blur-md z-10">
            <div className="flex items-center p-1 bg-black/20 rounded-full border border-white/5 w-min mx-auto">
                <button 
                    onClick={() => setActiveTab('VEG')}
                    className={`px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'VEG' ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-zinc-400 hover:text-white'}`}
                >
                    <Leaf size={14} /> Veg
                </button>
                <button 
                    onClick={() => setActiveTab('NON-VEG')}
                    className={`px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${activeTab === 'NON-VEG' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-zinc-400 hover:text-white'}`}
                >
                    <Drumstick size={14} /> Non-Veg
                </button>
            </div>
        </div>

        {/* Menu Grid */}
        <div className="p-8 md:p-12">
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
    </section>
  );
};

export default MenuSection;
