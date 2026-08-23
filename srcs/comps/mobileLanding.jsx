import React, { useState } from 'react';
import { projectsList, skillCategories } from './portfolioData';
import { soundManager } from '../audioManager';

export const MobileLanding = ({ onLaunch3D }) => {
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [formSent, setFormSent] = useState(false);

    const copyEmail = () => {
        soundManager?.playSuccess?.();
        navigator.clipboard.writeText('issamzitouni257@gmail.com');
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2500);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        soundManager?.playClick?.();
        const subject = encodeURIComponent(`Portfolio Inquiry from ${contactForm.name || 'Mobile Visitor'}`);
        const body = encodeURIComponent(`${contactForm.message}\n\nFrom: ${contactForm.name} (${contactForm.email})`);
        window.location.href = `mailto:issamzitouni257@gmail.com?subject=${subject}&body=${body}`;
        setFormSent(true);
        setTimeout(() => setFormSent(false), 4000);
    };

    return (
        <div className="min-h-screen w-full bg-[#07090e] text-neutral-200 font-sans p-4 sm:p-6 flex flex-col justify-between select-none relative overflow-y-auto">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Main Terminal Window Card */}
            <div className="w-full max-w-lg mx-auto bg-[#0d1117]/95 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden relative z-10 my-auto">
                {/* iTerm macOS Window Header */}
                <div className="h-10 px-4 bg-[#161b22] border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm"></span>
                        <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm"></span>
                        <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm"></span>
                    </div>
                    <span className="text-xs font-mono text-neutral-400 font-medium">issam@mobile: ~ (zsh)</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">ONLINE</span>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-6">
                    {/* Notice Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-neutral-900 border border-cyan-800/50 relative overflow-hidden">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl pt-0.5">🖥️</span>
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 block">
                                    OPTIMIZED MOBILE EXPERIENCE
                                </span>
                                <h2 className="text-sm font-bold text-white leading-snug">
                                    For the interactive 3D studio experience, please visit on your computer!
                                </h2>
                                <p className="text-xs text-neutral-400 leading-relaxed font-sans pt-1">
                                    The full 3D interactive CRT monitor, spatial lighting, and desk widgets run best on desktop browsers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Developer Identity */}
                    <div className="space-y-1.5 border-b border-neutral-800/80 pb-4">
                        <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
                            FULL STACK & 3D DEVELOPER
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            ISSAM ZITOUNI
                        </h1>
                        <p className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                            <span>📍 Benguerir & Casablanca, MA</span>
                            <span>•</span>
                            <span className="text-emerald-400">Open to opportunities</span>
                        </p>
                    </div>

                    {/* Quick Action Buttons Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="/Issam_Zitouni_Resume.pdf"
                            download="Issam_Zitouni_Resume.pdf"
                            onClick={() => soundManager?.playClick?.()}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold tracking-wide transition-all shadow-lg active:scale-95"
                        >
                            <span>📄</span>
                            <span>Download CV</span>
                        </a>

                        <button
                            onClick={() => {
                                soundManager?.playClick?.();
                                setActiveTab(activeTab === 'message' ? 'overview' : 'message');
                            }}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-mono text-xs font-bold tracking-wide transition-all shadow-lg active:scale-95"
                        >
                            <span>✉️</span>
                            <span>{activeTab === 'message' ? 'Close Form' : 'Message Me'}</span>
                        </button>
                    </div>

                    {/* Expandable Direct Message Form */}
                    {activeTab === 'message' && (
                        <form onSubmit={handleSendMessage} className="p-4 rounded-xl bg-[#161b22] border border-cyan-800/60 space-y-3 animate-fadeIn">
                            <span className="text-xs font-mono font-bold text-cyan-400 block">SEND A DIRECT MESSAGE</span>
                            <input
                                type="text"
                                placeholder="Your Name"
                                required
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                required
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                            />
                            <textarea
                                placeholder="Your Message..."
                                rows="3"
                                required
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono resize-none"
                            ></textarea>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-bold text-xs rounded-lg transition-colors shadow-md"
                            >
                                {formSent ? '✓ Opening Email Client...' : '→ Send Message via Mail'}
                            </button>
                        </form>
                    )}

                    {/* Social & Professional Connect Links */}
                    <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                            PROFESSIONAL & SOCIAL CHANNELS
                        </span>

                        <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                            <a
                                href="https://linkedin.com/in/issam-zitouni/"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => soundManager?.playClick?.()}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#161b22] border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-800/80 transition-all text-neutral-300 hover:text-white"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-cyan-400 font-bold">in</span>
                                    <span>linkedin.com/in/issam-zitouni</span>
                                </div>
                                <span className="text-neutral-500 text-sm">&rarr;</span>
                            </a>

                            <a
                                href="https://github.com/ChaoticIssam"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => soundManager?.playClick?.()}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#161b22] border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-800/80 transition-all text-neutral-300 hover:text-white"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-bold">gh</span>
                                    <span>github.com/ChaoticIssam</span>
                                </div>
                                <span className="text-neutral-500 text-sm">&rarr;</span>
                            </a>

                            <a
                                href="https://wa.me/212707927704"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => soundManager?.playClick?.()}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#161b22] border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-800/80 transition-all text-neutral-300 hover:text-white"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-emerald-400 font-bold">wa</span>
                                    <span>+212 7 07927704 (WhatsApp)</span>
                                </div>
                                <span className="text-neutral-500 text-sm">&rarr;</span>
                            </a>

                            <button
                                onClick={copyEmail}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#161b22] border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-800/80 transition-all text-neutral-300 hover:text-white text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-cyan-400 font-bold">@</span>
                                    <span className="truncate">issamzitouni257@gmail.com</span>
                                </div>
                                <span className="text-[11px] text-cyan-400 font-semibold whitespace-nowrap">
                                    {copiedEmail ? '✓ Copied' : 'Copy'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Projects / Skills Preview */}
                    <div className="space-y-3 pt-2 border-t border-neutral-800/80">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                            KEY HIGHLIGHTS & ARCHITECTURES
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="p-2.5 rounded-lg bg-[#161b22] border border-neutral-800">
                                <span className="text-cyan-400 font-bold block">3D WebGL Studio</span>
                                <span className="text-neutral-400 text-[10px]">Three.js • React 19 • CRT</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#161b22] border border-neutral-800">
                                <span className="text-cyan-400 font-bold block">Vita Platform</span>
                                <span className="text-neutral-400 text-[10px]">FastAPI • Electron • Next.js</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#161b22] border border-neutral-800">
                                <span className="text-cyan-400 font-bold block">AITTC Farm Digitization</span>
                                <span className="text-neutral-400 text-[10px]">Django REST • Docker • PG</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#161b22] border border-neutral-800">
                                <span className="text-cyan-400 font-bold block">Key System Platform</span>
                                <span className="text-neutral-400 text-[10px]">React • TypeScript • Nginx</span>
                            </div>
                        </div>
                    </div>

                    {/* Force 3D Mode Option */}
                    {onLaunch3D && (
                        <div className="pt-2 text-center">
                            <button
                                onClick={() => {
                                    soundManager?.playClick?.();
                                    onLaunch3D();
                                }}
                                className="text-[11px] font-mono text-neutral-500 hover:text-cyan-400 tracking-wider transition-colors uppercase underline underline-offset-4"
                            >
                                Launch 3D Studio Anyway (Experimental) &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Telemetry */}
            <div className="text-center text-[10px] font-mono text-neutral-600 py-4 relative z-10">
                <span>© {new Date().getFullYear()} ISSAM ZITOUNI • ALL RIGHTS RESERVED</span>
            </div>
        </div>
    );
};

export default MobileLanding;
