import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(32);

  useEffect(() => {
    if (isOpen && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm mx-4">
        {/* Close Button Outside */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-12 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        {/* Modal Content */}
        <div className="bg-[#080808] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute left-1/2 -top-20 -translate-x-1/2 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 text-center">
             <h2 className="text-2xl font-serif italic text-white mb-2">Welcome Back</h2>
             <p className="text-xs text-zinc-500 mb-8 uppercase tracking-widest">Sign in to continue</p>

            <div className="space-y-6 text-left">
              {/* Phone Input */}
              <div className="group">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 block ml-1">Mobile Number</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-brand-primary/50 focus-within:bg-white/10 transition-all">
                  <span className="text-zinc-400 text-sm mr-3 font-mono">+91</span>
                  <div className="w-px h-4 bg-white/10 mr-3"></div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="bg-transparent border-none outline-none text-white w-full placeholder-zinc-700 font-medium tracking-wide"
                  />
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3 block ml-1">Verification Code</label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-white text-xl focus:border-brand-primary/50 focus:bg-white/10 focus:outline-none transition-all"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                  <span className="text-[10px] text-zinc-600">Didn't receive code?</span>
                  <div className="text-[10px] font-mono text-brand-primary">
                    {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : <span className="cursor-pointer hover:underline">Resend</span>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-white text-black font-semibold py-4 rounded-2xl mt-4 hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
                <span>Access Account</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;