import React from 'react';

interface TimePickerProps {
    label: string;
    value: string; // Format: "HH:MM AM/PM" or empty
    onChange: (value: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange }) => {
    // Parse current value
    const parseTime = (val: string) => {
        if (!val) return { hour: '12', minute: '00', ampm: 'AM' };
        const [time, ampm] = val.split(' ');
        const [hour, minute] = time.split(':');
        return { hour, minute, ampm };
    };

    const { hour, minute, ampm } = parseTime(value);

    const handleChange = (type: 'hour' | 'minute' | 'ampm', newVal: string) => {
        let newHour = hour;
        let newMinute = minute;
        let newAmpm = ampm;

        if (type === 'hour') newHour = newVal;
        if (type === 'minute') newMinute = newVal;
        if (type === 'ampm') newAmpm = newVal;

        onChange(`${newHour}:${newMinute} ${newAmpm}`);
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">{label}</label>
            <div className="flex gap-2">
                <select
                    value={hour}
                    onChange={(e) => handleChange('hour', e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-sm focus:border-brand-primary outline-none appearance-none text-center w-16"
                >
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-zinc-500 self-center font-bold">:</span>
                <select
                    value={minute}
                    onChange={(e) => handleChange('minute', e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-sm focus:border-brand-primary outline-none appearance-none text-center w-16"
                >
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                    value={ampm}
                    onChange={(e) => handleChange('ampm', e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-sm focus:border-brand-primary outline-none appearance-none text-center w-16"
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
    );
};

export default TimePicker;
