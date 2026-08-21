/**
 * Web Audio API Sound & Voice Synthesizer Engine
 * High-performance, zero-latency, zero-dependency audio engine for 3D Portfolio.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isInitialized = false;
        this.ambientGain = null;
        this.ambientOsc1 = null;
        this.ambientOsc2 = null;
        this.ambientFilter = null;
        this.isAmbientPlaying = false;
        this.voiceEnabled = true;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    resumeContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Start background ambient futuristic drone / terminal room tone
     */
    startAmbient() {
        if (this.isMuted || this.isAmbientPlaying) return;
        this.resumeContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // Master ambient gain node
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.setValueAtTime(0.001, now);
            this.ambientGain.gain.exponentialRampToValueAtTime(0.035, now + 3.0); // Gentle background volume

            // Filter for warm, deep analog tone
            this.ambientFilter = this.ctx.createBiquadFilter();
            this.ambientFilter.type = 'lowpass';
            this.ambientFilter.frequency.setValueAtTime(160, now);
            this.ambientFilter.Q.setValueAtTime(2.0, now);

            // Sub-harmonic oscillator 1 (55 Hz A1)
            this.ambientOsc1 = this.ctx.createOscillator();
            this.ambientOsc1.type = 'sine';
            this.ambientOsc1.frequency.setValueAtTime(55, now);

            // Sub-harmonic oscillator 2 (detuned slightly for chorus warmth)
            this.ambientOsc2 = this.ctx.createOscillator();
            this.ambientOsc2.type = 'sawtooth';
            this.ambientOsc2.frequency.setValueAtTime(55.4, now);

            // Low frequency oscillator for slow breathing filter sweep
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(0.15, now); // 0.15 Hz slow breath
            lfoGain.gain.setValueAtTime(40, now);
            lfo.connect(lfoGain);
            lfoGain.connect(this.ambientFilter.frequency);
            lfo.start(now);

            // Connect graph
            this.ambientOsc1.connect(this.ambientFilter);
            this.ambientOsc2.connect(this.ambientFilter);
            this.ambientFilter.connect(this.ambientGain);
            this.ambientGain.connect(this.ctx.destination);

            this.ambientOsc1.start(now);
            this.ambientOsc2.start(now);
            this.isAmbientPlaying = true;
        } catch (e) {
            console.warn('Ambient audio error:', e);
        }
    }

    stopAmbient() {
        if (!this.isAmbientPlaying || !this.ambientGain || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
            this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
            setTimeout(() => {
                try {
                    if (this.ambientOsc1) this.ambientOsc1.stop();
                    if (this.ambientOsc2) this.ambientOsc2.stop();
                } catch (_) {}
                this.isAmbientPlaying = false;
            }, 550);
        } catch (e) {
            console.warn('Stop ambient error:', e);
        }
    }

    /**
     * Tactile sci-fi mechanical click sound
     */
    playClick() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2400, now);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (_) {}
    }

    /**
     * Cybernetic section transition whoosh & CRT frequency sweep
     */
    playSectionSwitch() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // Dual tone frequency sweep
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(320, now);
            osc1.frequency.exponentialRampToValueAtTime(780, now + 0.12);
            osc1.frequency.exponentialRampToValueAtTime(220, now + 0.28);

            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(160, now);
            osc2.frequency.exponentialRampToValueAtTime(440, now + 0.14);
            osc2.frequency.exponentialRampToValueAtTime(110, now + 0.28);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(600, now);
            filter.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
            filter.frequency.exponentialRampToValueAtTime(400, now + 0.28);
            filter.Q.setValueAtTime(3.5, now);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.3);
            osc2.stop(now + 0.3);
        } catch (_) {}
    }

    /**
     * Gentle button hover frequency blip
     */
    playHover() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(720, now + 0.025);

            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.03);
        } catch (_) {}
    }

    /**
     * Action success chime (e.g. email copied)
     */
    playSuccess() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const noteTime = now + i * 0.07;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.12, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.22);
            });
        } catch (_) {}
    }

    /**
     * Synthesizes futuristic robotic voice greeting
     */
    speakWelcome() {
        if (this.isMuted || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const text = "System initialized. Welcome to Issam Zitouni's interactive workspace.";
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.05;
            utterance.pitch = 0.9;
            utterance.volume = 0.85;

            // Pick an English voice if available
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Natural')));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('Speech synthesis error:', e);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAmbient();
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        } else {
            this.startAmbient();
        }
        return this.isMuted;
    }
}

export const soundManager = new SoundEngine();
