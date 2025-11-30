
import React, { useState } from 'react';
import { X, Key, LogIn } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => Promise<void>;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onLogin(password);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-xs mx-4">
        {/* Close Button Outside */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        <div className="bg-[#080808] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute left-1/2 -top-20 -translate-x-1/2 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
             <h2 className="text-2xl font-serif italic text-white mb-2">Admin Access</h2>
             <p className="text-xs text-zinc-500 mb-8 uppercase tracking-widest">Enter password to manage content</p>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 block ml-1">Password</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-yellow-500/50 transition-all">
                  <Key size={14} className="text-zinc-500 mr-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full placeholder-zinc-700"
                  />
                </div>
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl hover:bg-yellow-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50">
                <span>{isLoading ? 'Verifying...' : 'Login'}</span>
                <LogIn size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
