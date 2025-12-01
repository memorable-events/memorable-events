import React, { useState } from 'react';
import { ArrowRight, Mail, MessageSquare, Sparkles, MapPin } from 'lucide-react';

import { api } from '../services/apiService';

const InquirySection: React.FC = () => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.sendInquiry(formData);
      setStatus('success');
      setFormData({ name: '', email: '', type: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section id="contact" className="mb-24 px-4 md:px-0 relative z-10 max-w-7xl mx-auto">
      <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">

        {/* Abstract Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

        <div className="flex flex-col md:flex-row relative z-10">

          {/* Left Panel: Context & Info */}
          <div className="w-full md:w-5/12 p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950/30">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-8">
                <Sparkles size={12} className="text-brand-primary" />
                Inquiries
              </div>

              <h2 className="text-4xl md:text-5xl font-serif italic text-white mb-6 leading-tight">
                Let's craft your <br /> <span className="text-zinc-600">masterpiece.</span>
              </h2>

              <p className="text-sm text-zinc-400 leading-relaxed mb-12 max-w-xs">
                Whether you're planning an intimate gathering or a grand corporate summit, our planning starts with a simple conversation.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-5 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Email Us</h4>
                  <p className="text-sm text-zinc-300 group-hover:text-white transition-colors font-medium">Tgholap007@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Live Chat</h4>
                  <p className="text-sm text-zinc-300 group-hover:text-white transition-colors font-medium">Available 9am - 6pm EST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="w-full md:w-7/12 p-8 md:p-16 bg-transparent">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${focusedField === 'name' ? 'text-brand-primary' : 'text-zinc-500'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b border-white/10 py-4 text-base md:text-sm text-white placeholder-zinc-800 focus:outline-none focus:border-brand-primary transition-all"
                    required
                  />
                </div>
                <div className="group space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${focusedField === 'email' ? 'text-brand-primary' : 'text-zinc-500'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b border-white/10 py-4 text-base md:text-sm text-white placeholder-zinc-800 focus:outline-none focus:border-brand-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${focusedField === 'type' ? 'text-brand-primary' : 'text-zinc-500'}`}>
                  Event Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('type')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-b border-white/10 py-4 text-base md:text-sm text-white focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                  required
                >
                  <option className="bg-zinc-900" value="">Select an option</option>
                  <option className="bg-zinc-900" value="corporate">Corporate Event</option>
                  <option className="bg-zinc-900" value="wedding">Wedding</option>
                  <option className="bg-zinc-900" value="social">Social Gathering</option>
                  <option className="bg-zinc-900" value="other">Other</option>
                </select>
              </div>

              <div className="group space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${focusedField === 'message' ? 'text-brand-primary' : 'text-zinc-500'}`}>
                  Tell us about your vision
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Estimated guest count, preferred dates, style..."
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-b border-white/10 py-4 text-base md:text-sm text-white placeholder-zinc-800 focus:outline-none focus:border-brand-primary transition-all resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="pt-6">
                <button type="submit" disabled={status === 'sending' || status === 'success'} className={`group relative w-full md:w-auto px-10 py-5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${status === 'success' ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-zinc-200 active:scale-95'}`}>
                  <span>
                    {status === 'sending' ? 'Sending...' : status === 'success' ? 'Inquiry Sent!' : status === 'error' ? 'Failed - Try Again' : 'Send Inquiry'}
                  </span>
                  {status === 'idle' && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl h-[400px] relative z-10 group">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.5692083849617!2d72.8636704749764!3d19.038695382158295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c90f03ca9bd1%3A0x3fc447dd0e976e13!2sMEMORABLE%20PARTY%20ZONE!5e0!3m2!1sen!2sin!4v1764600052225!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale-0 hover:grayscale-0 transition-all duration-700"
        ></iframe>

        {/* Map Overlay */}
        <div className="absolute bottom-6 left-6 z-20">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Mumbai,+Maharashtra"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            <MapPin size={16} className="text-brand-primary" />
            <span>Get Directions</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InquirySection;