// Web Audio sound engine — all sounds are synthesized on the fly using the Web Audio API.
// No audio files needed. Respects browser autoplay rules by waiting for the first user gesture.

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
    }

    init() {
        if (this.isInitialized && this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();
            this.isInitialized = true;
        } catch (e) {
            // AudioContext not available
        }
    }

    resumeContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                this.startAmbient();
            }).catch(() => {});
        }
    }

    // Starts a subtle looping ambient drone — gives the room a live, breathing feel
    startAmbient() {
        if (this.isMuted || this.isAmbientPlaying) return;
        this.resumeContext();
        if (!this.ctx || this.ctx.state === 'suspended') return;

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
            lfo.frequency.setValueAtTime(0.15, now);
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
            // Ambient audio skipped
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
            // Stop ambient skipped
        }
    }

    // Authentic physical mechanical mouse click sound (microswitch snap + body resonance)
    playClick() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx || this.ctx.state === 'suspended') return;

        try {
            const now = this.ctx.currentTime;

            // 1. High-frequency microswitch click snap (transient trigger)
            const snapOsc = this.ctx.createOscillator();
            const snapGain = this.ctx.createGain();
            const snapFilter = this.ctx.createBiquadFilter();

            snapOsc.type = 'triangle';
            snapOsc.frequency.setValueAtTime(2400, now);
            snapOsc.frequency.exponentialRampToValueAtTime(700, now + 0.007);

            snapFilter.type = 'highpass';
            snapFilter.frequency.setValueAtTime(1200, now);

            snapGain.gain.setValueAtTime(0.18, now);
            snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.007);

            snapOsc.connect(snapFilter);
            snapFilter.connect(snapGain);
            snapGain.connect(this.ctx.destination);

            snapOsc.start(now);
            snapOsc.stop(now + 0.009);

            // 2. Tactile switch contact resonance
            const tickOsc = this.ctx.createOscillator();
            const tickGain = this.ctx.createGain();
            const tickFilter = this.ctx.createBiquadFilter();

            tickOsc.type = 'square';
            tickOsc.frequency.setValueAtTime(3200, now);
            tickOsc.frequency.exponentialRampToValueAtTime(1000, now + 0.012);

            tickFilter.type = 'bandpass';
            tickFilter.frequency.setValueAtTime(2600, now);
            tickFilter.Q.setValueAtTime(3.2, now);

            tickGain.gain.setValueAtTime(0.09, now);
            tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

            tickOsc.connect(tickFilter);
            tickFilter.connect(tickGain);
            tickGain.connect(this.ctx.destination);

            tickOsc.start(now);
            tickOsc.stop(now + 0.015);

            // 3. Mouse housing plastic body impulse
            const bodyOsc = this.ctx.createOscillator();
            const bodyGain = this.ctx.createGain();

            bodyOsc.type = 'sine';
            bodyOsc.frequency.setValueAtTime(260, now);
            bodyOsc.frequency.exponentialRampToValueAtTime(90, now + 0.015);

            bodyGain.gain.setValueAtTime(0.14, now);
            bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

            bodyOsc.connect(bodyGain);
            bodyGain.connect(this.ctx.destination);

            bodyOsc.start(now);
            bodyOsc.stop(now + 0.018);
        } catch (_) {}
    }

    // Whoosh + frequency sweep — plays when switching between portfolio sections
    playSectionSwitch() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx || this.ctx.state === 'suspended') return;

        try {
            const now = this.ctx.currentTime;

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

    // Quick high-pitched blip on hover
    playHover() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx || this.ctx.state === 'suspended') return;

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

    // Three-note ascending chime — plays on successful actions like copying the email
    playSuccess() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx || this.ctx.state === 'suspended') return;

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

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAmbient();
        } else {
            this.startAmbient();
        }
        return this.isMuted;
    }
}

export const soundManager = new SoundEngine();
