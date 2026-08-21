import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import JEASINGS from 'jeasings'
import { TechnicolorShader } from 'three/examples/jsm/Addons.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { viewport } from 'three/tsl';
import html2canvas from 'html2canvas';

export class Portfolio {
	constructor() {
		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.DirecLight = null;
		this.hemisphereLight = null;
		this.floor = null;
		this.light = null;
		this.justEntered = true;

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.portfolioContent = null;
		this.screenMesh = null;
		this.portfolioTexture = null;

		this.initialCameraPosition = new THREE.Vector3(140, 30, 56);
		this.zoomedCameraPosition = new THREE.Vector3(60, 25, 28);
		this.startZoomposition = new THREE.Vector3(80, 30, 40);

		this.isZoomed = false;
		this.controls = null;

		this.pageWidth = window.innerWidth;
		this.pageHeight = window.innerHeight;

		this.onWindowResize = this.onWindowResize.bind(this);
		this.animate = this.animate.bind(this);
		this.handleHover = this.handleHover.bind(this);

		this.clock = new THREE.Clock();
		this.timeText = null;
		this.computerModel = null;

		this.handleClick = this.handleClick.bind(this);
		this.bulbLight = null;

		this.messageListeners = new Set();
		this.isDestroyed = false;
		this.cleanupPromises = [];
		this.destroy = this.destroy.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleHover = this.handleHover.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		this.animate = this.animate.bind(this);

		this.isNavigating = false;
		this.lastNavigationTime = 0;
		this.textureUpdateTimeout = null;
		this.screenMaterial = null;

		this.isUpdatingTexture = false;
		this.resizeTimeout = null;

	}

	createDateNameDisplay() {
		//SES warning expected
		const canvas = document.createElement('canvas');
		canvas.width = 600;
		canvas.height = 256;
		const context = canvas.getContext('2d');

		const texture = new THREE.CanvasTexture(canvas);
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			opacity: 0.9,
			// side: THREE.DoubleSide
		});

		const geometry = new THREE.PlaneGeometry(12, 6);
		this.timeText = new THREE.Mesh(geometry, material);
		this.timeText.position.set(10, 20, 50);
		this.timeText.rotation.y = Math.PI * 0.5;
		this.scene.add(this.timeText);

		// Function to update time
		const updateTime = () => {
			const date = new Date();
			const time = date.toLocaleTimeString();

			// Clear canvas
			context.clearRect(0, 0, canvas.width, canvas.height);

			// Draw time
			context.fillStyle = '#ffffff';
			context.font = 'bold 72px "Press Start 2P", "Courier New", monospace';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(time, canvas.width / 2, canvas.height / 2);

			context.front = 'bold 72px "Press Start 2P", "Courier New", monospace';
			context.fillText('ISSAM ZITOUNI', canvas.width * 1 / 2, canvas.height * 3 / 4);
			// Update texture
			texture.needsUpdate = true;
		}

		// Update time every second
		setInterval(updateTime, 1000);
	}

	createLightSwitch() {
		const canvas = document.createElement('canvas');
		canvas.width = 128;
		canvas.height = 128;
		const context = canvas.getContext('2d');

		const texture = new THREE.CanvasTexture(canvas);
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			opacity: 0.9,
		});

		const geometry = new THREE.CircleGeometry(2, 32);
		this.lightSwitch = new THREE.Mesh(geometry, material);

		// Position near the lamp
		this.lightSwitch.position.set(45, 20, -40);
		this.lightSwitch.rotation.y = Math.PI * 0.25;

		this.scene.add(this.lightSwitch);

		// Draw the switch
		const updateSwitch = (isOn, isHovered = false) => {
			context.clearRect(0, 0, canvas.width, canvas.height);

			context.beginPath();
			context.arc(64, 64, isHovered ? 58 : 50, 0, Math.PI * 2);
			context.fillStyle = '#ffffff';
			context.fill();

			texture.needsUpdate = true;
		}

		this.isLightOn = true;
		updateSwitch(this.isLightOn);

		this.updateSwitch = updateSwitch;

		let isHovered = false;
		this.lightSwitch.onBeforeRender = () => {
			const intersects = this.raycaster.intersectObject(this.lightSwitch);
			if (intersects.length > 0 && !isHovered) {
				isHovered = true;
				updateSwitch(this.isLightOn, true);
				document.body.style.cursor = 'pointer';
			} else if (intersects.length === 0 && isHovered) {
				isHovered = false;
				updateSwitch(this.isLightOn, false);
				document.body.style.cursor = 'default';
			}
		};
	}

	updateCurrentSection(section) {
		this.currentSection = section;
		if (this.portfolioContent) {
			setTimeout(() => {
				this.renderPortfolioContent({ recreateMaterial: false });
			}, 60);
			setTimeout(() => {
				this.renderPortfolioContent({ recreateMaterial: false });
			}, 340);
		}
	}

	handleClick(event) {
		if (this.isDestroyed || !this.screenMesh || !this.portfolioContent) return;

		const rect = this.renderer.domElement.getBoundingClientRect();
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		this.raycaster.setFromCamera(this.mouse, this.camera);

		// Light switch handling
		if (this.lightSwitch) {
			const lightSwitchIntersects = this.raycaster.intersectObject(this.lightSwitch);
			if (lightSwitchIntersects.length > 0) {
				this.isLightOn = !this.isLightOn;
				this.updateSwitch(this.isLightOn);

				if (this.bulbLight) {
					new JEASINGS.JEasing(this.bulbLight)
						.to({ intensity: this.isLightOn ? 200 : 0 }, 500)
						.start();
				}
				return;
			}
		}

		// Screen content click via 3D raycast
		const intersects = this.raycaster.intersectObject(this.screenMesh);
		if (intersects.length > 0) {
			const uv = intersects[0].uv;
			const x = Math.floor(uv.x * 1024);
			const y = Math.floor(uv.y * 768);
			this.dispatchDOMClick(x, y);
		}
	}

	createScreenOverlay() {
		let overlay = document.getElementById('screenHitOverlay');
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.id = 'screenHitOverlay';
			overlay.style.cssText = `
				position: fixed;
				display: none;
				z-index: 40;
				pointer-events: auto;
				cursor: default;
				user-select: none;
				touch-action: none;
				border-radius: 4px;
			`;
			document.body.appendChild(overlay);

			overlay.addEventListener('click', (e) => {
				// Precision 3D raycast first
				if (this.renderer?.domElement && this.screenMesh && this.camera) {
					const rect = this.renderer.domElement.getBoundingClientRect();
					this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
					this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
					this.raycaster.setFromCamera(this.mouse, this.camera);
					const intersects = this.raycaster.intersectObject(this.screenMesh);
					if (intersects.length > 0) {
						const uv = intersects[0].uv;
						const domX = Math.floor(uv.x * 1024);
						const domY = Math.floor(uv.y * 768);
						this.dispatchDOMClick(domX, domY);
						return;
					}
				}

				// Fallback normalized ratio
				const rect = overlay.getBoundingClientRect();
				if (rect.width <= 0 || rect.height <= 0) return;
				const normX = (e.clientX - rect.left) / rect.width;
				const normY = (e.clientY - rect.top) / rect.height;
				const domX = Math.max(0, Math.min(1024, normX * 1024));
				const domY = Math.max(0, Math.min(768, normY * 768));
				this.dispatchDOMClick(domX, domY);
			});

			overlay.addEventListener('mousemove', (e) => {
				if (this.renderer?.domElement && this.screenMesh && this.camera) {
					const rect = this.renderer.domElement.getBoundingClientRect();
					this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
					this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
					this.raycaster.setFromCamera(this.mouse, this.camera);
					const intersects = this.raycaster.intersectObject(this.screenMesh);
					if (intersects.length > 0) {
						const uv = intersects[0].uv;
						const domX = Math.floor(uv.x * 1024);
						const domY = Math.floor(uv.y * 768);
						overlay.style.cursor = this.isCoordinateInteractive(domX, domY) ? 'pointer' : 'default';
						return;
					}
				}

				const rect = overlay.getBoundingClientRect();
				if (rect.width <= 0 || rect.height <= 0) return;
				const normX = (e.clientX - rect.left) / rect.width;
				const normY = (e.clientY - rect.top) / rect.height;
				const domX = normX * 1024;
				const domY = normY * 768;
				overlay.style.cursor = this.isCoordinateInteractive(domX, domY) ? 'pointer' : 'default';
			});

			overlay.addEventListener('mouseenter', () => {
				if (!this.isZoomed) this.zoomToScreen();
			});

			overlay.addEventListener('mouseleave', (e) => {
				if (this.isZoomed && (!e.relatedTarget || !overlay.contains(e.relatedTarget))) {
					this.zoomOutFromScreen();
				}
			});
		}
		this.screenOverlay = overlay;
	}

	zoomToScreen() {
		if (this.isZoomed || !this.screenMesh || !this.camera || !this.controls) return;
		this.isZoomed = true;

		const box = new THREE.Box3().setFromObject(this.screenMesh);
		const screenCenter = box.getCenter(new THREE.Vector3());

		this.cameraTween = new JEASINGS.JEasing(this.camera.position)
			.to({
				x: this.zoomedCameraPosition.x,
				y: this.zoomedCameraPosition.y,
				z: this.zoomedCameraPosition.z
			}, 700)
			.start();

		this.targetTween = new JEASINGS.JEasing(this.controls.target)
			.to({
				x: screenCenter.x,
				y: screenCenter.y,
				z: screenCenter.z
			}, 700)
			.start();
	}

	zoomOutFromScreen() {
		if (!this.isZoomed || !this.camera || !this.controls) return;
		this.isZoomed = false;

		const targetPosition = new THREE.Vector3(5, 0, 5);

		this.cameraTween = new JEASINGS.JEasing(this.camera.position)
			.to({
				x: this.initialCameraPosition.x,
				y: this.initialCameraPosition.y,
				z: this.initialCameraPosition.z
			}, 700)
			.start();

		this.targetTween = new JEASINGS.JEasing(this.controls.target)
			.to({
				x: targetPosition.x,
				y: targetPosition.y,
				z: targetPosition.z
			}, 700)
			.start();
	}

	updateScreenOverlayPosition() {
		if (!this.screenOverlay || !this.screenMesh || !this.camera) return;

		try {
			if (!this.screenMesh.geometry.boundingBox) {
				this.screenMesh.geometry.computeBoundingBox();
			}
			const bbox = this.screenMesh.geometry.boundingBox;
			if (!bbox) return;

			const corners = [
				new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
				new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.max.z),
				new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z),
				new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.max.z),
				new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z),
				new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z),
				new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.min.z),
				new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z),
			];

			let minX = window.innerWidth, minY = window.innerHeight, maxX = 0, maxY = 0;

			corners.forEach(corner => {
				const v = corner.clone().applyMatrix4(this.screenMesh.matrixWorld);
				v.project(this.camera);
				const sx = ((v.x + 1) / 2) * window.innerWidth;
				const sy = ((-v.y + 1) / 2) * window.innerHeight;
				minX = Math.min(minX, sx);
				maxX = Math.max(maxX, sx);
				minY = Math.min(minY, sy);
				maxY = Math.max(maxY, sy);
			});

			const width = maxX - minX;
			const height = maxY - minY;

			if (width > 60 && height > 45 && minX < window.innerWidth && maxX > 0 && minY < window.innerHeight && maxY > 0) {
				this.screenOverlay.style.left = `${Math.max(0, minX)}px`;
				this.screenOverlay.style.top = `${Math.max(0, minY)}px`;
				this.screenOverlay.style.width = `${width}px`;
				this.screenOverlay.style.height = `${height}px`;
				this.screenOverlay.style.display = 'block';
			} else {
				this.screenOverlay.style.display = 'none';
			}
		} catch (e) {}
	}

	dispatchDOMClick(domX, domY) {
		if (!this.portfolioContent) return;

		console.log(`[Interaction] Click at DOM (${domX.toFixed(0)}, ${domY.toFixed(0)})`);

		let clickedElement = null;
		const parentRect = this.portfolioContent.getBoundingClientRect();
		const clickables = Array.from(
			this.portfolioContent.querySelectorAll('button, a, input, textarea, [data-nav="true"], [data-section]')
		);

		for (const el of clickables) {
			const elRect = el.getBoundingClientRect();
			const left = elRect.left - parentRect.left;
			const top = elRect.top - parentRect.top;
			const right = left + elRect.width;
			const bottom = top + elRect.height;

			if (domX >= left - 10 && domX <= right + 10 && domY >= top - 10 && domY <= bottom + 10) {
				clickedElement = el;
			}
		}

		const navButton = clickedElement?.closest('[data-nav="true"]') || clickedElement?.closest('[data-section]');
		const targetSection = navButton?.dataset?.section || clickedElement?.dataset?.section;

		if (targetSection) {
			console.log('Navigating to section:', targetSection);
			this.navigateToSection(targetSection);
			return;
		} else if (clickedElement) {
			clickedElement.click();
			return;
		}

		// Fallback geometric zones
		if (this.currentSection === 'home') {
			if (domY >= 0 && domY <= 140) {
				if (domX >= 180 && domX < 420) { this.navigateToSection('about'); return; }
				if (domX >= 420 && domX <= 620) { this.navigateToSection('projects'); return; }
				if (domX > 620 && domX <= 840) { this.navigateToSection('contact'); return; }
			}
			if (domY >= 300 && domY <= 480) {
				if (domX >= 260 && domX <= 500) { this.navigateToSection('projects'); return; }
				if (domX > 500 && domX <= 740) { this.navigateToSection('about'); return; }
			}
		} else {
			if (domY >= 0 && domY <= 100) {
				if (domX <= 220) { this.navigateToSection('home'); return; }
				if (domX >= 640 && domX < 770) { this.navigateToSection('about'); return; }
				if (domX >= 770 && domX < 890) { this.navigateToSection('projects'); return; }
				if (domX >= 890) { this.navigateToSection('contact'); return; }
			}
		}
	}

	isCoordinateInteractive(domX, domY) {
		if (!this.portfolioContent) return false;
		const parentRect = this.portfolioContent.getBoundingClientRect();
		const clickables = this.portfolioContent.querySelectorAll('button, a, [data-nav="true"], [data-section]');
		for (const el of clickables) {
			const elRect = el.getBoundingClientRect();
			const left = elRect.left - parentRect.left;
			const top = elRect.top - parentRect.top;
			if (domX >= left - 8 && domX <= left + elRect.width + 8 && domY >= top - 8 && domY <= top + elRect.height + 8) {
				return true;
			}
		}
		if (this.currentSection === 'home') {
			if (domY >= 0 && domY <= 140 && domX >= 180 && domX <= 840) return true;
			if (domY >= 300 && domY <= 480 && domX >= 260 && domX <= 740) return true;
		} else {
			if (domY >= 0 && domY <= 100) return true;
		}
		return false;
	}

	navigateToSection(section) {
		console.log(`Navigating to section: ${section}`);
		this.currentSection = section;

		if (window.handlePortfolioNavigation) {
			window.handlePortfolioNavigation(section);
		}

		setTimeout(() => {
			this.updateScreenDisplay({ recreateMaterial: false, force: true });
		}, 100);
	}

	async updateScreenDisplay(options = {}) {
		if (!this.portfolioContent) {
			this.portfolioContent = document.getElementById('portfolioContent');
			if (!this.portfolioContent) {
				console.warn('Portfolio content element not found, retrying...');
				// Retry after a short delay
				setTimeout(() => {
					this.updateScreenDisplay(options);
				}, 100);
				return;
			}
		}

		if (!this.screenMesh) {
			console.warn('Screen mesh not found');
			return;
		}

		// Prevent concurrent updates (from Phase 2)
		if (this.isUpdatingTexture && !options.force) {
			return;
		}

		this.isUpdatingTexture = true;

		try {
			const html2canvasOptions = {
				scale: this.isMobile ? 1.2 : 1.5,
				useCORS: true,
				backgroundColor: '#0a0a0a',
				width: 1024,
				height: 768,
				logging: false,
				removeContainer: false,
				foreignObjectRendering: false,
				allowTaint: true,
				imageTimeout: 3000,
				// Only ignore truly unrenderable elements — NOT transition-all (that breaks index mapping)
				ignoreElements: (element) => {
					return element.tagName === 'VIDEO' ||
						element.tagName === 'IFRAME' ||
						element.classList.contains('skip-capture');
				},
				onclone: (clonedDoc) => {
					// Canvas-based color resolver (resolves oklch/color-mix to rgba via browser's 2D canvas engine)
					const tmpCanvas = document.createElement('canvas');
					tmpCanvas.width = 1; tmpCanvas.height = 1;
					const ctx2d = tmpCanvas.getContext('2d');

					const resolveColor = (colorStr) => {
						if (!colorStr) return colorStr;
						try {
							ctx2d.clearRect(0, 0, 1, 1);
							ctx2d.fillStyle = colorStr;
							ctx2d.fillRect(0, 0, 1, 1);
							const [r, g, b, a] = ctx2d.getImageData(0, 0, 1, 1).data;
							if (a === 0) return 'rgba(0,0,0,0)';
							return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
						} catch (e) {
							return 'rgb(10,10,10)';
						}
					};

					// Balanced-parentheses text patcher: replaces all modern color fns in any CSS text
					const patchCssText = (cssText) => {
						if (!cssText || typeof cssText !== 'string' || !/oklch|oklab|color-mix|light-dark/i.test(cssText)) return cssText;
						const targets = ['oklch(', 'oklab(', 'color-mix(', 'light-dark('];
						let result = '';
						let i = 0;
						while (i < cssText.length) {
							let matched = null;
							for (const t of targets) {
								if (cssText.substring(i, i + t.length).toLowerCase() === t) {
									matched = t; break;
								}
							}
							if (matched) {
								let depth = 1, start = i;
								i += matched.length;
								while (i < cssText.length && depth > 0) {
									if (cssText[i] === '(') depth++;
									else if (cssText[i] === ')') depth--;
									i++;
								}
								result += resolveColor(cssText.substring(start, i));
							} else {
								result += cssText[i++];
							}
						}
						return result;
					};

					// 1 — Replace local <link stylesheet> in the clone with a patched <style> tag (preserving Google Fonts)
					Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]')).forEach(link => {
						if (link.href && (link.href.includes('fonts.googleapis.com') || link.href.includes('fonts.gstatic.com'))) {
							// Keep font link untouched in the clone
							return;
						}
						try {
							const sheet = Array.from(document.styleSheets).find(s => s.href === link.href);
							if (sheet && sheet.cssRules) {
								let cssText = '';
								for (let j = 0; j < sheet.cssRules.length; j++) {
									cssText += sheet.cssRules[j].cssText + '\n';
								}
								const style = clonedDoc.createElement('style');
								style.textContent = patchCssText(cssText);
								link.parentNode.replaceChild(style, link);
							}
						} catch (e) {}
					});

					// 2 — Patch any inline <style> tags
					Array.from(clonedDoc.querySelectorAll('style')).forEach(s => {
						s.textContent = patchCssText(s.textContent || '');
					});

					// 3 — Intercept getComputedStyle in the cloned document so html2canvas never sees oklch
					if (clonedDoc.defaultView && clonedDoc.defaultView.getComputedStyle) {
						const origGetComputedStyle = clonedDoc.defaultView.getComputedStyle.bind(clonedDoc.defaultView);
						clonedDoc.defaultView.getComputedStyle = function(el, pseudo) {
							const style = origGetComputedStyle(el, pseudo);
							return new Proxy(style, {
								get(target, prop) {
									if (prop === 'getPropertyValue') {
										return function(p) {
											const val = target.getPropertyValue(p);
											return patchCssText(val);
										};
									}
									const val = target[prop];
									if (typeof val === 'string') {
										return patchCssText(val);
									}
									if (typeof val === 'function') {
										return function(...args) {
											const res = val.apply(target, args);
											if (typeof res === 'string') return patchCssText(res);
											return res;
										};
									}
									return val;
								}
							});
						};
					}

					// 4 — Fix portfolioContent position
					const clonedContent = clonedDoc.getElementById('portfolioContent');
					if (!clonedContent) return;
					clonedContent.style.position  = 'absolute';
					clonedContent.style.left       = '0';
					clonedContent.style.top        = '0';
					clonedContent.style.transform  = 'none';
					clonedContent.style.visibility = 'visible';
					clonedContent.style.opacity    = '1';

					// 5 — Patch computed color properties per element
					const origEls  = Array.from(this.portfolioContent.querySelectorAll('*'));
					const cloneEls = Array.from(clonedContent.querySelectorAll('*'));
					const colorProps = [
						'color', 'backgroundColor',
						'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
						'outlineColor', 'boxShadow', 'textShadow',
					];

					cloneEls.forEach((cloneEl, idx) => {
						const orig = origEls[idx];
						if (!orig) return;
						try {
							const comp = window.getComputedStyle(orig);
							for (const prop of colorProps) {
								const raw = comp[prop];
								if (!raw || raw === 'transparent' || raw === '') continue;
								const resolved = patchCssText(raw);
								if (resolved && resolved !== raw) cloneEl.style[prop] = resolved;
							}
							cloneEl.style.transition = 'none';
							cloneEl.style.animation  = 'none';
							cloneEl.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
							cloneEl.style.letterSpacing = '0.02em';
						} catch (e) {}
					});
				}
			};

			const rawCanvas = await html2canvas(this.portfolioContent, html2canvasOptions);

			// Boost brightness slightly
			const rawCtx = rawCanvas.getContext('2d');
			const imageData = rawCtx.getImageData(0, 0, rawCanvas.width, rawCanvas.height);
			const data = imageData.data;
			for (let i = 0; i < data.length; i += 4) {
				data[i]     = Math.min(255, data[i]     * 1.15);
				data[i + 1] = Math.min(255, data[i + 1] * 1.15);
				data[i + 2] = Math.min(255, data[i + 2] * 1.15);
			}
			rawCtx.putImageData(imageData, 0, 0);

			// Dispose old texture
			if (this.portfolioTexture) {
				this.portfolioTexture.dispose();
			}

			// flipY = false: this mesh has inverted UV coordinates, so no flip gives correct orientation
			this.portfolioTexture = new THREE.CanvasTexture(rawCanvas);
			this.portfolioTexture.colorSpace = THREE.SRGBColorSpace;
			this.portfolioTexture.anisotropy = 8;
			this.portfolioTexture.flipY = false;
			this.portfolioTexture.generateMipmaps = false;
			this.portfolioTexture.minFilter = THREE.LinearFilter;
			this.portfolioTexture.magFilter = THREE.LinearFilter;
			this.portfolioTexture.needsUpdate = true;

			// Create or update material
			if (!this.screenMaterial || options.recreateMaterial) {
				if (this.screenMaterial) {
					this.screenMaterial.dispose();
				}

				this.screenMaterial = new THREE.MeshBasicMaterial({
					map: this.portfolioTexture,
					color: 0xffffff,
					transparent: false,
					alphaTest: 0.1,
					side: THREE.FrontSide
				});

				this.screenMesh.material = this.screenMaterial;
				console.log('Screen material recreated');
			} else {
				// Just update existing material
				this.screenMaterial.map = this.portfolioTexture;
				this.screenMaterial.needsUpdate = true;
				console.log('Screen texture updated');
			}

			// Force render
			this.renderer.render(this.scene, this.camera);

		} catch (error) {
			console.error('Error updating screen display:', error);
		} finally {
			this.isUpdatingTexture = false;
		}
	}

	displayMessage(message) {
		return new Promise((resolve) => {
			let i = 0;
			const interval = setInterval(() => {
				this.biosMessagesElement.textContent += message[i];
				i++;
				if (i === message.length) {
					clearInterval(interval);
					this.biosMessagesElement.textContent += "\n";
					resolve();
				}
			}, 10);
		});
	}

	init() {
		return new Promise((resolve) => {
			this.renderer = new THREE.WebGLRenderer({ antialias: true });
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.shadowMap.enabled = true;
			this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Match your texture colorSpace
			this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better tone mapping
			this.renderer.toneMappingExposure = 1.0; // Adjust if needed
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
			this.isMobile = isMobile || isTouch;

			if (this.isMobile) {
				console.log('mobile device detected');
			}

			this.renderer.domElement.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false })
			this.renderer.domElement.addEventListener('touchmove', (e) => {
				if (e.cancelable) e.preventDefault();
			}, { passive: false });

			this.scene = new THREE.Scene();
			// this.scene.background = new THREE.Color(0x2a204f);

			// this.scene.fog = new THREE.Fog(new THREE.Color(0x2b0052), 100, 1000);

			this.camera = new THREE.PerspectiveCamera(60, this.pageWidth / this.pageHeight, 4, 1000);

			this.camera.position.set(140, 30, 56);

			const screenCenter = new THREE.Vector3(5, -15, 5); // Model position
			screenCenter.add(new THREE.Vector3(0, 30, 0));

			this.camera.lookAt(screenCenter);

			// const cameraHelper = new THREE.CameraHelper(this.camera);
			// this.scene.add(cameraHelper);

			const bluesideLight = new THREE.DirectionalLight(0x0000ff, 0.5);
			bluesideLight.position.set(-10, 10, -5);
			bluesideLight.castShadow = true;
			bluesideLight.shadow.mapSize.width = 2048;
			bluesideLight.shadow.mapSize.height = 2048;
			bluesideLight.shadow.camera.left = -50;
			bluesideLight.shadow.camera.right = 50;
			bluesideLight.shadow.camera.top = 50;
			bluesideLight.shadow.camera.bottom = -50;
			this.scene.add(bluesideLight);

			const whitesideLight = new THREE.DirectionalLight(0xffffff, 0.1);
			whitesideLight.position.set(15, 10, 10);
			whitesideLight.castShadow = true;
			whitesideLight.shadow.mapSize.width = 2048;
			whitesideLight.shadow.mapSize.height = 2048;
			whitesideLight.shadow.camera.left = -50;
			whitesideLight.shadow.camera.right = 50;
			whitesideLight.shadow.camera.top = 50;
			whitesideLight.shadow.camera.bottom = -50;
			this.scene.add(whitesideLight);

			const bulbLight = new THREE.PointLight(0xffee88, 200, 300, 1);
			bulbLight.castShadow = true;
			bulbLight.shadow.mapSize.width = 2048;
			bulbLight.shadow.mapSize.height = 2048;
			bulbLight.shadow.camera.left = -50;
			bulbLight.shadow.camera.right = 50;
			bulbLight.shadow.camera.top = 50;
			bulbLight.shadow.camera.bottom = -50;
			bulbLight.castShadow = true;
			bulbLight.position.set(45, 20, -50);
			this.scene.add(bulbLight);
			this.bulbLight = bulbLight;

			this.createLightSwitch();
			this.renderer.domElement.addEventListener('click', this.handleClick);


			this.floor = new THREE.Mesh(
				new THREE.CircleGeometry(1024, 1024),
				new THREE.MeshStandardMaterial({
					color: 0xffffff,
					metalness: 0.5,
					roughness: 0.5
				})
			);
			this.floor.rotation.x = -Math.PI / 2;
			this.floor.position.y = -14.9;
			this.floor.receiveShadow = true;
			// this.scene.add(this.floor);
			this.controls = new OrbitControls(this.camera, this.renderer.domElement);
			this.controls.target.copy(screenCenter);
			this.controls.enableDamping = true;
			this.controls.enableZoom = false;
			this.controls.enableRotate = true;
			this.controls.maxTargetRadius = 100;
			this.controls.maxPolarAngle = Math.PI / 2;

			this.controls.touches = {
				ONE: THREE.TOUCH.ROTATE,
				TWO: THREE.TOUCH.DOLLY_PAN
			};
			this.controls.enablePan = false;

			const initialTarget = new THREE.Vector3(5, 0, 5);
			this.controls.target.copy(initialTarget);

			const loader = new GLTFLoader();

			// Add timeout for model loading
			const loadTimeout = setTimeout(() => {
				console.error('Model loading timeout - took too long');
				// Hide BIOS screen on timeout
				const biosScreen = document.getElementById('biosScreen');
				if (biosScreen) biosScreen.style.display = 'none';
				this.createDateNameDisplay();
				this.setupEntranceAnimation();
				this.animate();
				resolve(); // Resolve promise even on timeout
			}, 20000); // 20 second timeout

			loader.load(
				'/models/wholeEnviroment.glb',
				(gltf) => {
					clearTimeout(loadTimeout); // Clear timeout on success
					try {
						gltf.scene.traverse((child) => {
							if (child.isMesh) {
								child.castShadow = true;
								if (child.name === "Plane001_2") {
									this.screenMesh = child;

									this.screenMesh.visible = true;

									// Get screen properties for camera targeting
									const box = new THREE.Box3().setFromObject(child);
									const screenCenter = box.getCenter(new THREE.Vector3());

									// Update controls target
									this.controls.target.copy(screenCenter);
									this.camera.lookAt(screenCenter);

									// Create screen texture — wait for React DOM to fully paint before capturing
									const tryRenderScreen = (delay, attempts = 0) => {
										setTimeout(() => {
											this.portfolioContent = document.getElementById('portfolioContent');
											if (this.portfolioContent) {
												this.updateScreenDisplay({ recreateMaterial: true });
												// Second render after 500ms to catch any late paints
												setTimeout(() => this.updateScreenDisplay({ recreateMaterial: false }), 500);
											} else if (attempts < 10) {
												console.warn(`portfolioContent not ready, attempt ${attempts + 1}`);
												tryRenderScreen(200, attempts + 1);
											}
										}, delay);
									};
									tryRenderScreen(800);

									// Add screen light for better visibility
									const screenLight = new THREE.SpotLight(0xffffff, 3, 50, Math.PI / 4, 0.5, 1);
									screenLight.position.set(
										this.screenMesh.position.x,
										this.screenMesh.position.y + 10,
										this.screenMesh.position.z + 15
									);
									screenLight.target = this.screenMesh;
									screenLight.castShadow = false;
									this.scene.add(screenLight);
									this.screenLight = screenLight;

									// Initialize 2D Screen Overlay for reliable interaction
									this.createScreenOverlay();
								}
							}
						});
						this.computerModel = gltf.scene;
						gltf.scene.position.set(5, -15, 5);
						gltf.scene.scale.set(10, 10, 10);
						this.scene.add(gltf.scene);

						this.createDateNameDisplay();

						// Hide BIOS screen when model is successfully loaded
						const biosScreen = document.getElementById('biosScreen');
						if (biosScreen && biosScreen.style.display !== 'none') {
							biosScreen.style.display = 'none';
						}

						this.setupEntranceAnimation();
						this.animate();
						resolve(); // Resolve promise when model loads
					} catch (error) {
						console.error('Error processing model:', error);
						// Hide BIOS screen even on error
						const biosScreen = document.getElementById('biosScreen');
						if (biosScreen) biosScreen.style.display = 'none';
						this.createDateNameDisplay();
						this.setupEntranceAnimation();
						this.animate();
						resolve(); // Resolve promise even on error
					}
				},
				(progress) => {
					// Loading progress
					// console.log('Model loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
				},
				(error) => {
					// Error handler
					clearTimeout(loadTimeout);
					console.error('Model loading error:', error);
					// Hide BIOS screen on error
					const biosScreen = document.getElementById('biosScreen');
					if (biosScreen) biosScreen.style.display = 'none';
					this.createDateNameDisplay();
					this.setupEntranceAnimation();
					this.animate();
					resolve(); // Resolve promise on error
				}
			);

			document.body.appendChild(this.renderer.domElement);
			window.addEventListener('resize', this.onWindowResize);

			this.renderer.domElement.addEventListener('mousemove', this.handleHover);

			this.portfolioContent = document.getElementById('portfolioContent');
		});
	}

	handleTouch(event) {
		// Prevent default only if needed
		if (event.cancelable) {
			event.preventDefault();
		}

		if (event.touches.length === 1) {
			const touch = event.touches[0];
			this.handleClick({
				clientX: touch.clientX,
				clientY: touch.clientY
			});
		}
	}

	onWindowResize() {
		this.pageWidth = window.innerWidth;
		this.pageHeight = window.innerHeight;

		this.camera.aspect = this.pageWidth / this.pageHeight;
		this.camera.updateProjectionMatrix();

		// Update both renderers
		this.renderer.setSize(this.pageWidth, this.pageHeight);

		// Computer model scaling (keep existing)
		const viewportScale = Math.min(
			window.innerWidth / 1200,
			window.innerHeight / 800
		) * (this.isMobile ? 0.75 : 0.85);

		if (this.computerModel) {
			const originalScale = 10;
			this.computerModel.scale.set(
				originalScale * viewportScale,
				originalScale * viewportScale,
				originalScale * viewportScale
			);
		}

		// CHANGE: Add debouncing instead of immediate recreation
		if (this.resizeTimeout) {
			clearTimeout(this.resizeTimeout);
		}

		this.resizeTimeout = setTimeout(() => {
			this.updateScreenDisplay({ recreateMaterial: false });
		}, 150); // Wait 250ms after resize stops
	}

	handleHover(event) {
		const rect = this.renderer.domElement.getBoundingClientRect();
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		this.raycaster.setFromCamera(this.mouse, this.camera);

		// Light switch hover check
		if (this.lightSwitch) {
			const lightSwitchIntersects = this.raycaster.intersectObject(this.lightSwitch);
			if (lightSwitchIntersects.length > 0) {
				document.body.style.cursor = 'pointer';
				return;
			}
		}

		// Screen mesh hover check
		if (this.screenMesh && this.portfolioContent) {
			const intersects = this.raycaster.intersectObject(this.screenMesh);

			if (intersects.length > 0) {
				if (!this.isZoomed) {
					this.zoomToScreen();
				}

				const uv = intersects[0].uv;
				const x = uv.x * 1024;
				const y = uv.y * 768;

				const isInteractive = this.isCoordinateInteractive(x, y);
				document.body.style.cursor = isInteractive ? 'pointer' : 'default';
				return;
			} else if (this.isZoomed) {
				// Zoom out when cursor is off the screen
				this.zoomOutFromScreen();
			}
		}

		document.body.style.cursor = 'default';
	}

	setupEntranceAnimation() {
		if (!this.camera || !this.controls) return;
		this.camera.position.set(160, 70, 140);

		if (this.timeText?.material) {
			this.timeText.material.opacity = 0;
			new JEASINGS.JEasing(this.timeText.material)
				.to({ opacity: 0.8 }, 1000)
				.delay(2000)
				.start();
		}

		if (this.lightSwitch?.material) {
			this.lightSwitch.material.opacity = 0;
			new JEASINGS.JEasing(this.lightSwitch.material)
				.to({ opacity: 0.9 }, 1000)
				.delay(2500)
				.start();
		}

		new JEASINGS.JEasing(this.camera.position)
			.to({
				x: this.initialCameraPosition.x,
				y: this.initialCameraPosition.y,
				z: this.initialCameraPosition.z
			}, 2500)
			.start();

		const targetPosition = new THREE.Vector3(5, 0, 5);
		this.camera.lookAt(targetPosition);

		new JEASINGS.JEasing(this.controls.target)
			.to({
				x: targetPosition.x,
				y: targetPosition.y,
				z: targetPosition.z
			}, 2500)
			.start();
	}

	animate() {
		if (this.isDestroyed) return;
		requestAnimationFrame(this.animate);

		JEASINGS.update();

		if (this.controls) {
			this.controls.update();
		}

		if (this.screenMesh && this.camera) {
			this.updateScreenOverlayPosition();
		}

		const isMobile = this.isMobile;
		const isLowEnd = navigator.hardwareConcurrency <= 4;

		this.renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

		if (isMobile && isLowEnd) {
			this._frameCount = (this._frameCount || 0) + 1;
			if (this._frameCount % 2 !== 0) {
				return;
			}
		}

		this.renderer.render(this.scene, this.camera);
	}
	destroy() {
		return new Promise(resolve => {
			this.isDestroyed = true;

			if (this.screenOverlay?.parentNode) {
				this.screenOverlay.parentNode.removeChild(this.screenOverlay);
				this.screenOverlay = null;
			}

			// Clean up message listeners first
			if (this.messageListeners) {
				this.messageListeners.forEach(listener => {
					if (typeof listener.cleanup === 'function') {
						try {
							listener.cleanup();
						} catch (e) {
							console.warn('Error cleaning up listener:', e);
						}
					}
				});
				this.messageListeners.clear();
			}

			// Remove event listeners
			window.removeEventListener('resize', this.onWindowResize);

			// Clean up renderer events
			if (this.renderer?.domElement) {
				this.renderer.domElement.removeEventListener('mousemove', this.handleHover);
				this.renderer.domElement.removeEventListener('click', this.handleClick);
			}

			if (this.textureUpdateTimeout) {
				clearTimeout(this.textureUpdateTimeout);
				this.textureUpdateTimeout = null;
			}

			// Clean up Three.js resources
			if (this.portfolioTexture) {
				this.portfolioTexture.dispose();
			}

			// Clean up animations
			JEASINGS.removeAll();

			// Clean up both renderers
			if (this.renderer) {
				this.renderer.dispose();
				if (this.renderer.domElement?.parentNode) {
					this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
				}
			}

			// Ensure all references are cleared
			this.camera = null;
			this.scene = null;
			this.renderer = null;
			this.controls = null;
			this.screenMesh = null;
			this.portfolioContent = null;
			this.portfolioTexture = null;
			this.timeText = null;
			this.lightSwitch = null;
			this.bulbLight = null;

			// Resolve cleanup
			resolve();
		});
	}
}
