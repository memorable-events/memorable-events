import React, { useState } from 'react';
import { X, ArrowRight, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Service, Plan, SetupImage, AddOn } from '../types';
import { api } from '../services/apiService';
import TimePicker from './TimePicker';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selection: {
        decoration: Service;
        setup: SetupImage | null;
        plan: Plan;
        mode: 'INDOOR' | 'OUTDOOR';
    };
    addons: AddOn[];
}

const CheckIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, selection, addons }) => {
    const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});
    const [step, setStep] = useState<'addons' | 'schedule' | 'details'>('addons');
    const [userDetails, setUserDetails] = useState({ name: '', phone: '', date: '' });
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    React.useEffect(() => {
        if (selectedDate) {
            api.fetchBookings(selectedDate).then(bookings => {
                setBlockedSlots(bookings.map((b: any) => b.time_slot));
            }).catch(console.error);
        }
    }, [selectedDate]);

    if (!isOpen) return null;

    // Filter add-ons: exclude if already in plan features
    const filteredAddons = addons.filter(addon => {
        const planFeatures = selection.plan.features.map(f => f.toLowerCase());
        return !planFeatures.some(f => f.includes(addon.name.toLowerCase()));
    });

    const handleAddonChange = (addon: AddOn, value: number) => {
        setSelectedAddons(prev => {
            const next = { ...prev };
            if (value <= 0) delete next[addon.id];
            else next[addon.id] = value;
            return next;
        });
    };

    const parseTime = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    const isOverlapping = (start1: number, end1: number, start2: number, end2: number) => {
        return Math.max(start1, start2) < Math.min(end1, end2);
    };

    const checkOverlap = () => {
        if (!selectedTime || !selectedTime.includes(' - ')) return false;
        const [startStr, endStr] = selectedTime.split(' - ');
        if (!startStr || !endStr) return false;

        const start = parseTime(startStr);
        const end = parseTime(endStr);

        return blockedSlots.some(slot => {
            const [sStr, eStr] = slot.split(' - ');
            const s = parseTime(sStr);
            const e = parseTime(eStr);
            return isOverlapping(start, end, s, e);
        });
    };

    const checkInvalidRange = () => {
        if (!selectedTime || !selectedTime.includes(' - ')) return false;
        const [startStr, endStr] = selectedTime.split(' - ');
        if (!startStr || !endStr) return false;

        const start = parseTime(startStr);
        const end = parseTime(endStr);

        return start >= end;
    };

    const hasOverlap = checkOverlap();
    const isInvalidRange = checkInvalidRange();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasOverlap) {
            alert("The selected time slot overlaps with an existing booking. Please choose a different time.");
            return;
        }
        if (isInvalidRange) {
            alert("End time must be after start time.");
            return;
        }
        setSubmitting(true);

        const addonSummary = Object.entries(selectedAddons).map(([id, qty]) => {
            const addon = addons.find(a => a.id === Number(id));
            return addon ? `${addon.name} ${addon.type === 'quantity' ? `(x${qty})` : ''}` : '';
        }).join(', ');

        const message = `
*New Booking Inquiry*
*Type:* ${selection.mode}
*Decoration:* ${selection.decoration.title}
*Setup:* ${selection.setup?.title || 'General'}
*Plan:* ${selection.plan.name}
*Add-ons:* ${addonSummary || 'None'}
*Date:* ${selectedDate}
*Time Slot:* ${selectedTime}

*Customer Details:*
Name: ${userDetails.name}
Phone: ${userDetails.phone}
    `.trim();

        try {
            await api.sendInquiry({
                name: userDetails.name,
                email: userDetails.phone, // Using phone as identifier for now or add phone field to API
                type: 'Booking',
                message: message
            });
            alert("Quotation request sent successfully! We will contact you shortly.");
            onClose();
        } catch (error) {
            alert("Failed to send request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const generateCalendar = () => {
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
                    disabled={isPast}
                    onClick={() => { setSelectedDate(dateString); setSelectedTime(''); }}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-brand-primary text-black' : isPast ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-300 hover:bg-zinc-800'}`}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4">
            <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-zoom-in max-h-[90vh]">

                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-serif italic text-white">
                            {step === 'addons' ? 'Customize Your Package' : step === 'schedule' ? 'Select Date & Time' : 'Finalize Booking'}
                        </h2>
                        <p className="text-zinc-400 text-xs uppercase tracking-widest">
                            {selection.decoration.title} • {selection.plan.name}
                        </p>
                    </div >
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><X size={20} /></button>
                </div >

                <div className="overflow-y-auto p-6 custom-scrollbar flex-grow">
                    {step === 'addons' && (
                        <div className="space-y-4">
                            <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl mb-6">
                                <h4 className="text-brand-primary font-bold text-sm uppercase tracking-wider mb-2">Included in Plan</h4>
                                <ul className="grid grid-cols-2 gap-2">
                                    {selection.plan.features.map((f, i) => (
                                        <li key={i} className="text-xs text-zinc-300 flex items-center gap-2"><CheckIcon /> {f}</li>
                                    ))}
                                </ul>
                            </div>

                            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Available Add-ons</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {filteredAddons.map(addon => (
                                    <div key={addon.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                                        <div>
                                            <p className="font-bold text-zinc-200">{addon.name}</p>
                                            <p className="text-xs text-brand-secondary">{addon.price}</p>
                                        </div>

                                        {addon.type === 'checkbox' ? (
                                            <button
                                                onClick={() => handleAddonChange(addon, selectedAddons[addon.id] ? 0 : 1)}
                                                className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${selectedAddons[addon.id] ? 'bg-brand-primary border-brand-primary text-black' : 'border-zinc-600 text-transparent'}`}
                                            >
                                                <CheckIcon size={14} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3 bg-zinc-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => handleAddonChange(addon, (selectedAddons[addon.id] || 0) - 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
                                                    disabled={!selectedAddons[addon.id]}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{selectedAddons[addon.id] || 0}</span>
                                                <button
                                                    onClick={() => handleAddonChange(addon, (selectedAddons[addon.id] || 0) + 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'schedule' && (
                        <div className="space-y-6">
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
                                    {generateCalendar()}
                                </div>
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div className="animate-fade-in space-y-4">
                                    <h4 className="text-white font-bold text-sm uppercase tracking-wider">Select Time</h4>

                                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
                                        <div className="flex gap-4 justify-center">
                                            <TimePicker
                                                label="Start Time"
                                                value={selectedTime.split(' - ')[0] || '10:00 AM'}
                                                onChange={(val) => {
                                                    const end = selectedTime.split(' - ')[1] || '01:00 PM';
                                                    setSelectedTime(`${val} - ${end}`);
                                                }}
                                            />
                                            <TimePicker
                                                label="End Time"
                                                value={selectedTime.split(' - ')[1] || '01:00 PM'}
                                                onChange={(val) => {
                                                    const start = selectedTime.split(' - ')[0] || '10:00 AM';
                                                    setSelectedTime(`${start} - ${val}`);
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-500 italic text-center">
                                            Selected: <span className={`font-bold ${hasOverlap || isInvalidRange ? 'text-red-500' : 'text-brand-primary'}`}>
                                                {selectedTime || 'Incomplete'}
                                            </span>
                                            {hasOverlap && <span className="block text-red-500 font-bold mt-1">⚠️ Time slot overlaps with an existing booking</span>}
                                            {isInvalidRange && <span className="block text-red-500 font-bold mt-1">⚠️ End time must be after start time</span>}
                                        </p>

                                        {blockedSlots.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                                <p className="text-xs text-red-400 font-bold mb-2">Unavailable Slots:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {blockedSlots.map(slot => (
                                                        <span key={slot} className="px-2 py-1 bg-red-900/20 text-red-400 text-xs rounded border border-red-900/30">{slot}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    )}

                    {
                        step === 'details' && (
                            <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                                    <h4 className="text-zinc-400 text-xs uppercase font-bold">Order Summary</h4>
                                    <div className="flex justify-between text-sm text-zinc-200">
                                        <span>{selection.plan.name}</span>
                                        <span>{selection.plan.price}</span>
                                    </div>
                                    {Object.entries(selectedAddons).map(([id, qty]) => {
                                        const addon = addons.find(a => a.id === Number(id));
                                        if (!addon) return null;
                                        return (
                                            <div key={id} className="flex justify-between text-sm text-zinc-400">
                                                <span>{addon.name} {addon.type === 'quantity' && `x${qty}`}</span>
                                                <span>{addon.price}</span>
                                            </div>
                                        );
                                    })}
                                    <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between text-sm text-brand-primary font-bold">
                                        <span>Date & Time</span>
                                        <span>{selectedDate} | {selectedTime}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={userDetails.name}
                                            onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={userDetails.phone}
                                            onChange={e => setUserDetails({ ...userDetails, phone: e.target.value })}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>
                            </form>
                        )
                    }
                </div >

                <div className="p-6 border-t border-white/5 bg-zinc-950">
                    <div className="flex gap-4">
                        {step !== 'addons' && (
                            <button
                                onClick={() => setStep(step === 'details' ? 'schedule' : 'addons')}
                                className="px-6 py-4 rounded-full bg-zinc-800 text-white font-bold text-sm uppercase tracking-wider hover:bg-zinc-700 transition-colors"
                            >
                                Back
                            </button>
                        )}

                        {step === 'addons' ? (
                            <button
                                onClick={() => setStep('schedule')}
                                className="w-full py-4 rounded-full bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                            >
                                Next: Select Date <ArrowRight size={16} />
                            </button>
                        ) : step === 'schedule' ? (
                            <button
                                disabled={!selectedDate || !selectedTime || hasOverlap || isInvalidRange}
                                onClick={() => setStep('details')}
                                className="flex-grow py-4 rounded-full bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next: Details <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                form="booking-form"
                                type="submit"
                                disabled={submitting}
                                className="flex-grow py-4 rounded-full bg-brand-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Sending...' : 'Get Quotation'} <ShoppingCart size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
};

export default BookingModal;
