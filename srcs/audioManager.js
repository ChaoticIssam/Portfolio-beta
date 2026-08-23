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

    // Authentic computer mouse microswitch click (ultra-crisp physical click waveform)
    playClick() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx || this.ctx.state === 'suspended') return;

        try {
            const sampleRate = this.ctx.sampleRate || 44100;
            const length = Math.floor(sampleRate * 0.007); // 7ms physical click duration
            const buffer = this.ctx.createBuffer(1, length, sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                const decay = Math.exp(-t * 1400);
                const clickWave = Math.sin(2 * Math.PI * 3800 * t) * 0.7 +
                                  Math.sin(2 * Math.PI * 1600 * t) * 0.4 +
                                  (Math.random() * 2 - 1) * 0.25;
                data[i] = clickWave * decay;
            }

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
            filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            source.start(this.ctx.currentTime);
        } catch (_) {}
    }

    // Heavy mechanical rocker / toggle switch sound for the desk lamp
    playLightSwitch(isOn) {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx || this.ctx.state === 'suspended') return;

        try {
            const now = this.ctx.currentTime;

            // 1. First mechanical latch "clack"
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            const filter1 = this.ctx.createBiquadFilter();

            osc1.type = 'square';
            const baseFreq = isOn ? 720 : 850;
            osc1.frequency.setValueAtTime(baseFreq, now);
            osc1.frequency.exponentialRampToValueAtTime(180, now + 0.025);

            filter1.type = 'lowpass';
            filter1.frequency.setValueAtTime(1800, now);
            filter1.Q.setValueAtTime(3.0, now);

            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

            osc1.connect(filter1);
            filter1.connect(gain1);
            gain1.connect(this.ctx.destination);

            osc1.start(now);
            osc1.stop(now + 0.03);

            // 2. Secondary rocker bounce click (~8ms later)
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            const filter2 = this.ctx.createBiquadFilter();

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(isOn ? 1100 : 1300, now + 0.008);
            osc2.frequency.exponentialRampToValueAtTime(300, now + 0.032);

            filter2.type = 'bandpass';
            filter2.frequency.setValueAtTime(1400, now + 0.008);

            gain2.gain.setValueAtTime(0.2, now + 0.008);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

            osc2.connect(filter2);
            filter2.connect(gain2);
            gain2.connect(this.ctx.destination);

            osc2.start(now + 0.008);
            osc2.stop(now + 0.035);

            // 3. Low-end enclosure thud (rocker housing)
            const bodyOsc = this.ctx.createOscillator();
            const bodyGain = this.ctx.createGain();

            bodyOsc.type = 'sine';
            bodyOsc.frequency.setValueAtTime(isOn ? 180 : 210, now);
            bodyOsc.frequency.exponentialRampToValueAtTime(50, now + 0.035);

            bodyGain.gain.setValueAtTime(0.25, now);
            bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

            bodyOsc.connect(bodyGain);
            bodyGain.connect(this.ctx.destination);

            bodyOsc.start(now);
            bodyOsc.stop(now + 0.04);
        } catch (_) {}
    }

    // Navigation click — plays crisp physical mouse click when navigating sections
    playSectionSwitch() {
        this.playClick();
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
