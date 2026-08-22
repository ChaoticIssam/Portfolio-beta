import { soundManager } from './audioManager';

export class BIOSLoading {
	constructor() {
		this.biosMessagesElement = document.getElementById("biosMessages");
		this.progressBarElement = document.getElementById("progressBar");
		this.biosScreen = document.getElementById("biosScreen");
		this.biosPrompt = document.getElementById("biosPrompt");
		
		this.isSkipped = false;
		this.isFinished = false;
		this.resolveStart = null;
		this.keyListener = null;
		this.clickListener = null;

		// Detect visitor telemetry dynamically
		this.telemetry = this.getVisitorTelemetry();
		
		this.messages = [
			`[SYS_BOOT] ISSAM WORKSPACE ARCHITECTURE v2.4 (ROM 2026-RELEASE)`,
			`[TELEMETRY] INCOMING VISITOR DETECTED: ${this.telemetry.os} / ${this.telemetry.browser}`,
			`[GRAPHICS]  GPU ACCELERATOR   : ${this.telemetry.gpu}`,
			`[DISPLAY]   VIEWPORT CONFIG   : ${this.telemetry.resolution} (${this.telemetry.cores})`,
			`[LOCATION]  CLIENT TIMEZONE   : ${this.telemetry.timeZone}`,
			`[SECURITY]  CLEARANCE LEVEL   : GUEST_LEVEL_1 [ACCESS GRANTED]`,
			`[SUBSYSTEM] 3D ENVIRONMENT    : GLTF ENGINE COMPILED (100% OK)`,
			`[AUDIO]     SPATIAL ENGINE    : 24-BIT WEB AUDIO SYNTHESIZER READY`,
			`[STATUS]    INITIALIZATION COMPLETE. READY TO LAUNCH.`
		];
	}

	getVisitorTelemetry() {
		const ua = navigator.userAgent || '';
		let os = 'DESKTOP';
		if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
		else if (/Windows NT/i.test(ua)) os = 'WINDOWS';
		else if (/Linux/i.test(ua)) os = 'LINUX';
		else if (/Android/i.test(ua)) os = 'ANDROID';
		else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';

		let browser = 'WEB BROWSER';
		if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'CHROME';
		else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'SAFARI';
		else if (/Firefox/i.test(ua)) browser = 'FIREFOX';
		else if (/Edg/i.test(ua)) browser = 'EDGE';

		let gpu = 'WEBGL ACCELERATOR';
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (gl) {
				const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
				if (debugInfo) {
					const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
					if (renderer) {
						gpu = renderer.replace(/ANGLE \((.*)\)/, '$1').replace(/Direct3D.*|vs_\d+.*|\(TM\)|\(R\)/gi, '').trim();
						if (gpu.length > 28) gpu = gpu.substring(0, 28) + '...';
					}
				}
			}
		} catch (_) {}

		const resolution = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
		const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} CORES` : 'MULTI-CORE';

		return { os, browser, gpu, resolution, timeZone, cores };
	}

	formatTimestamp() {
		const d = new Date();
		return "> " + String(d.getHours()).padStart(2, "0") + ":" 
			+ String(d.getMinutes()).padStart(2, "0") + ":" 
			+ String(d.getSeconds()).padStart(2, "0");
	}

	displayMessage(message, speed = 8) {
		return new Promise((resolve) => {
			if (this.isSkipped) {
				if (this.biosMessagesElement) {
					this.biosMessagesElement.textContent += `${this.formatTimestamp()} : ${message}\n`;
				}
				return resolve();
			}

			let i = 0;
			const fullLine = `${this.formatTimestamp()} : ${message}`;
			
			const interval = setInterval(() => {
				if (this.isSkipped) {
					clearInterval(interval);
					if (this.biosMessagesElement) {
						this.biosMessagesElement.textContent += fullLine.slice(i) + "\n";
					}
					return resolve();
				}

				if (this.biosMessagesElement) {
					this.biosMessagesElement.textContent += fullLine[i];
				}
				i++;

				if (i >= fullLine.length) {
					clearInterval(interval);
					if (this.biosMessagesElement) {
						this.biosMessagesElement.textContent += "\n";
					}
					resolve();
				}
			}, speed);
		});
	}

	skipLoading() {
		if (this.isFinished) return;
		this.isSkipped = true;

		// Audio unlock and click response
		soundManager.resumeContext();
		soundManager.playClick();

		if (this.biosPrompt) {
			this.biosPrompt.textContent = "[ FAST-BOOT ACTIVE: LAUNCHING 3D WORKSPACE... ]";
			this.biosPrompt.classList.add("text-white");
		}
	}

	cleanupListeners() {
		if (this.keyListener) {
			window.removeEventListener('keydown', this.keyListener);
			this.keyListener = null;
		}
		if (this.clickListener && this.biosScreen) {
			this.biosScreen.removeEventListener('click', this.clickListener);
			this.clickListener = null;
		}
	}

	async start() {
		return new Promise(async (resolve) => {
			this.resolveStart = resolve;

			// Attach fast-boot click & key handlers
			this.keyListener = (e) => {
				this.skipLoading();
			};
			this.clickListener = () => {
				this.skipLoading();
			};

			window.addEventListener('keydown', this.keyListener);
			if (this.biosScreen) {
				this.biosScreen.addEventListener('click', this.clickListener);
			}

			// Sequential telemetry typeout
			for (const message of this.messages) {
				await this.displayMessage(message, 7);
				if (!this.isSkipped) {
					await new Promise(r => setTimeout(r, 45));
				}
			}

			// Finish prompt
			if (this.biosPrompt) {
				this.biosPrompt.textContent = "[ READY: CLICK ANYWHERE OR PRESS ANY KEY TO ENTER ]";
			}

			// Brief pause before smooth cinematic CRT warp
			await new Promise(r => setTimeout(r, this.isSkipped ? 250 : 700));
			this.isFinished = true;
			this.cleanupListeners();

			// Cinematic CRT screen warp & fade-out
			if (this.biosScreen) {
				this.biosScreen.style.transition = 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), filter 0.75s ease';
				this.biosScreen.style.opacity = '0';
				this.biosScreen.style.filter = 'blur(8px) brightness(1.8)';
				this.biosScreen.style.transform = 'scale(1.04)';
				this.biosScreen.style.pointerEvents = 'none';
				setTimeout(() => {
					this.biosScreen.style.display = 'none';
				}, 800);
			}

			setTimeout(() => {
				resolve();
			}, 200);
		});
	}
}