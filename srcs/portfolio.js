import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import JEASINGS from 'jeasings';
import { soundManager } from './audioManager';
import { createDigitalClock, createLightSwitch, createSoundSwitch } from './deskWidgets';
import { setupLighting } from './lightingManager';
import { captureScreenTexture } from './screenManager';

export class Portfolio {
	constructor() {
		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.controls = null;
		this.floor = null;
		this.justEntered = true;

		// 3D model and screen state
		this.computerModel = null;
		this.screenMesh = null;
		this.boxMesh = null;
		this.screenMaterial = null;
		this.portfolioTexture = null;
		this.portfolioContent = null;
		this.screenLight = null;

		this.clockWidget = null;
		this.lightSwitchWidget = null;
		this.soundSwitchWidget = null;
		this.isLightOn = true;

		// Mouse raycaster for picking objects in the scene
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		// Two camera positions: the starting overview and the zoomed-in CRT view
		this.initialCameraPosition = new THREE.Vector3(140, 30, 56);
		this.zoomedCameraPosition = new THREE.Vector3(60, 25, 28);
		this.isZoomed = false;

		// Viewport dimensions, updated on window resize
		this.pageWidth = window.innerWidth;
		this.pageHeight = window.innerHeight;

		// Runtime flags and texture update queue
		this.isDestroyed = false;
		this.isEntranceComplete = false;
		this.isUpdatingTexture = false;
		this.textureUpdateTimeout = null;
		this.currentSection = 'home';
		this.screenOverlay = null;

		// Bind methods so they work correctly as event listeners
		this.onWindowResize = this.onWindowResize.bind(this);
		this.animate = this.animate.bind(this);
		this.handleHover = this.handleHover.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.destroy = this.destroy.bind(this);
	}

	init() {
		return new Promise((resolve) => {
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				powerPreference: "high-performance",
				stencil: false,
				depth: true
			});

			this.renderer.setSize(this.pageWidth, this.pageHeight);
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			this.renderer.outputColorSpace = THREE.SRGBColorSpace;
			this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
			this.renderer.toneMappingExposure = 1.0;

			this.scene = new THREE.Scene();

			this.camera = new THREE.PerspectiveCamera(60, this.pageWidth / this.pageHeight, 4, 1000);
			this.camera.position.copy(this.initialCameraPosition);

			const screenCenter = new THREE.Vector3(5, 15, 5);
			this.camera.lookAt(screenCenter);

			// Wire up scene lighting
			const lights = setupLighting({ scene: this.scene });
			this.ambientLight = lights.ambientLight;
			this.bulbLight = lights.bulbLight;

			// Create the desk lamp toggle button (hidden until entrance animation completes)
			this.lightSwitchWidget = createLightSwitch({
				scene: this.scene,
				raycaster: this.raycaster
			});
			if (this.lightSwitchWidget?.mesh) {
				this.lightSwitchWidget.mesh.visible = false;
			}

			// Orbit controls — no zoom or pan, just rotation with damping
			this.controls = new OrbitControls(this.camera, this.renderer.domElement);
			this.controls.target.set(5, 0, 5);
			this.controls.enableDamping = true;
			this.controls.enableZoom = false;
			this.controls.enableRotate = true;
			this.controls.maxTargetRadius = 100;
			this.controls.maxPolarAngle = Math.PI / 2;
			this.controls.enablePan = false;

			// Wire up mouse, touch, and hover event listeners
			this.renderer.domElement.addEventListener('click', this.handleClick);
			this.renderer.domElement.addEventListener('mousemove', this.handleHover);
			this.renderer.domElement.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
			this.renderer.domElement.addEventListener('touchmove', (e) => {
				if (e.cancelable) e.preventDefault();
			}, { passive: false });

			document.body.appendChild(this.renderer.domElement);
			window.addEventListener('resize', this.onWindowResize);

			// Stream in the 3D desk scene (41 MB GLTF)
			const loader = new GLTFLoader();
			const loadTimeout = setTimeout(() => {
				console.warn('Model loading timeout');
				this.setupEntranceAnimation();
				this.animate();
				resolve();
			}, 20000);

			loader.load(
				'/models/wholeEnviroment.glb',
				(gltf) => {
					clearTimeout(loadTimeout);
					try {
						gltf.scene.traverse((child) => {
							if (child.isMesh) {
								child.castShadow = true;
								if (child.name === "Plane001_2") {
									this.screenMesh = child;
									this.screenMesh.visible = true;

									// Initialize with pure black unlit screen until entrance animation completes
									this.screenMaterial = new THREE.MeshBasicMaterial({
										color: 0x000000,
										side: THREE.DoubleSide
									});
									this.screenMesh.material = this.screenMaterial;

									const box = new THREE.Box3().setFromObject(child);
									const center = box.getCenter(new THREE.Vector3());
									this.controls.target.copy(center);
									this.camera.lookAt(center);

									// Spotlight for the CRT screen glow (starts at intensity 0)
									const screenLight = new THREE.SpotLight(0xffffff, 0, 50, Math.PI / 4, 0.5, 1);
									screenLight.position.set(
										this.screenMesh.position.x,
										this.screenMesh.position.y + 10,
										this.screenMesh.position.z + 15
									);
									screenLight.target = this.screenMesh;
									screenLight.castShadow = false;
									this.scene.add(screenLight);
									this.screenLight = screenLight;

									this.createScreenOverlay();
								} else if (child.name === "Plane003") {
									this.boxMesh = child;
								}
							}
						});

						this.computerModel = gltf.scene;
						gltf.scene.position.set(5, -15, 5);
						gltf.scene.scale.set(10, 10, 10);
						this.scene.add(gltf.scene);

						// Attach clock and sound switches (hidden until entrance animation completes)
						this.clockWidget = createDigitalClock({
							boxMesh: this.boxMesh,
							scene: this.scene
						});
						if (this.clockWidget?.mesh) {
							this.clockWidget.mesh.visible = false;
						}

						this.soundSwitchWidget = createSoundSwitch({
							boxMesh: this.boxMesh,
							scene: this.scene,
							raycaster: this.raycaster,
							soundManager: soundManager
						});
						if (this.soundSwitchWidget?.mesh) {
							this.soundSwitchWidget.mesh.visible = false;
						}

						this.setupEntranceAnimation();
						this.animate();
						resolve();
					} catch (err) {
						console.error('Error processing 3D scene:', err);
						this.setupEntranceAnimation();
						this.animate();
						resolve();
					}
				},
				null,
				(error) => {
					clearTimeout(loadTimeout);
					console.error('Model load error:', error);
					this.setupEntranceAnimation();
					this.animate();
					resolve();
				}
			);
		});
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
				if (this.renderer?.domElement && this.screenMesh && this.camera) {
					const rect = this.renderer.domElement.getBoundingClientRect();
					this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
					this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
					this.raycaster.setFromCamera(this.mouse, this.camera);
					const intersects = this.raycaster.intersectObject(this.screenMesh);
					if (intersects.length > 0) {
						const uv = intersects[0].uv;
						this.dispatchDOMClick(Math.floor(uv.x * 1024), Math.floor(uv.y * 768));
						return;
					}
				}

				const rect = overlay.getBoundingClientRect();
				if (rect.width <= 0 || rect.height <= 0) return;
				const domX = Math.max(0, Math.min(1024, ((e.clientX - rect.left) / rect.width) * 1024));
				const domY = Math.max(0, Math.min(768, ((e.clientY - rect.top) / rect.height) * 768));
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
				overlay.style.cursor = 'default';
			});

			overlay.addEventListener('mouseenter', () => {
				if (this.isEntranceComplete && !this.isZoomed) this.zoomToScreen();
			});

			overlay.addEventListener('mouseleave', (e) => {
				if (this.isEntranceComplete && this.isZoomed && (!e.relatedTarget || !overlay.contains(e.relatedTarget))) {
					this.zoomOutFromScreen();
				}
			});
		}
		this.screenOverlay = overlay;
	}

	updateScreenOverlayPosition() {
		if (!this.isEntranceComplete || !this.screenOverlay || !this.screenMesh || !this.camera) {
			if (this.screenOverlay) this.screenOverlay.style.display = 'none';
			return;
		}

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

	zoomToScreen() {
		if (!this.isEntranceComplete || this.isZoomed || !this.screenMesh || !this.camera || !this.controls) return;
		this.isZoomed = true;

		const box = new THREE.Box3().setFromObject(this.screenMesh);
		const screenCenter = box.getCenter(new THREE.Vector3());

		new JEASINGS.JEasing(this.camera.position)
			.to({
				x: this.zoomedCameraPosition.x,
				y: this.zoomedCameraPosition.y,
				z: this.zoomedCameraPosition.z
			}, 700)
			.start();

		new JEASINGS.JEasing(this.controls.target)
			.to({
				x: screenCenter.x,
				y: screenCenter.y,
				z: screenCenter.z
			}, 700)
			.start();
	}

	zoomOutFromScreen() {
		if (!this.isEntranceComplete || !this.isZoomed || !this.camera || !this.controls) return;
		this.isZoomed = false;

		const targetPosition = new THREE.Vector3(5, 0, 5);

		new JEASINGS.JEasing(this.camera.position)
			.to({
				x: this.initialCameraPosition.x,
				y: this.initialCameraPosition.y,
				z: this.initialCameraPosition.z
			}, 700)
			.start();

		new JEASINGS.JEasing(this.controls.target)
			.to({
				x: targetPosition.x,
				y: targetPosition.y,
				z: targetPosition.z
			}, 700)
			.start();
	}

	dispatchDOMClick(domX, domY) {
		if (!this.portfolioContent) return;

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
			this.navigateToSection(targetSection);
		} else if (clickedElement) {
			clickedElement.click();
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
		return false;
	}

	navigateToSection(section) {
		this.currentSection = section;
		if (window.handlePortfolioNavigation) {
			window.handlePortfolioNavigation(section);
		}
		setTimeout(() => {
			this.updateScreenDisplay({ recreateMaterial: false, force: true });
		}, 100);
	}

	updateCurrentSection(section) {
		this.currentSection = section;
		if (this.screenMaterial) {
			this.screenMaterial.color.setHex(0x38bdf8);
			if (this.screenLight) {
				this.screenLight.intensity = 3.5;
				setTimeout(() => {
					if (this.screenLight) this.screenLight.intensity = 1.5;
				}, 160);
			}

			setTimeout(() => {
				if (this.screenMaterial) {
					new JEASINGS.JEasing(this.screenMaterial.color)
						.to({ r: 1, g: 1, b: 1 }, 220)
						.start();
				}
			}, 80);
		}

		if (this.portfolioContent) {
			setTimeout(() => this.updateScreenDisplay({ recreateMaterial: false }), 30);
			setTimeout(() => this.updateScreenDisplay({ recreateMaterial: false }), 140);
			setTimeout(() => this.updateScreenDisplay({ recreateMaterial: false }), 320);
		}
	}

	async updateScreenDisplay(options = {}) {
		if (!this.portfolioContent) {
			this.portfolioContent = document.getElementById('portfolioContent');
			if (!this.portfolioContent) return;
		}

		if (!this.screenMesh || (this.isUpdatingTexture && !options.force)) return;

		this.isUpdatingTexture = true;

		try {
			const canvas = await captureScreenTexture(this.portfolioContent, this.isMobile);
			if (!canvas) {
				this.isUpdatingTexture = false;
				return;
			}

			if (this.portfolioTexture) {
				this.portfolioTexture.dispose();
			}

			this.portfolioTexture = new THREE.CanvasTexture(canvas);
			this.portfolioTexture.flipY = false;
			this.portfolioTexture.minFilter = THREE.LinearFilter;
			this.portfolioTexture.magFilter = THREE.LinearFilter;
			this.portfolioTexture.generateMipmaps = false;
			this.portfolioTexture.colorSpace = THREE.SRGBColorSpace;
			this.portfolioTexture.anisotropy = 8;
			this.portfolioTexture.needsUpdate = true;

			if (!this.screenMaterial || options.recreateMaterial) {
				this.screenMaterial = new THREE.MeshBasicMaterial({
					map: this.portfolioTexture,
					side: THREE.DoubleSide
				});
				this.screenMesh.material = this.screenMaterial;
			} else {
				this.screenMaterial.map = this.portfolioTexture;
				this.screenMaterial.needsUpdate = true;
			}
		} catch (e) {
			console.warn('Screen texture render error:', e);
		} finally {
			this.isUpdatingTexture = false;
		}
	}

	handleClick(event) {
		if (this.isDestroyed || !this.isEntranceComplete || !this.screenMesh) return;

		const rect = this.renderer.domElement.getBoundingClientRect();
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		this.raycaster.setFromCamera(this.mouse, this.camera);

		// Lamp switch click
		if (this.lightSwitchWidget?.mesh) {
			const hits = this.raycaster.intersectObject(this.lightSwitchWidget.mesh);
			if (hits.length > 0) {
				this.isLightOn = !this.isLightOn;
				this.lightSwitchWidget.updateSwitch(this.isLightOn);
				soundManager.playLightSwitch(this.isLightOn);
				if (this.bulbLight) {
					new JEASINGS.JEasing(this.bulbLight)
						.to({ intensity: this.isLightOn ? 200 : 0 }, 500)
						.start();
				}
				return;
			}
		}

		// Sound mute toggle click
		if (this.soundSwitchWidget?.mesh) {
			const hits = this.raycaster.intersectObject(this.soundSwitchWidget.mesh);
			if (hits.length > 0) {
				const isMuted = soundManager.toggleMute();
				soundManager.playClick();
				if (this.soundSwitchWidget.updateSoundSwitch) {
					this.soundSwitchWidget.updateSoundSwitch(isMuted, true);
				}
				return;
			}
		}

		// Click on the CRT screen itself — convert UV to DOM coords and dispatch a click
		const screenHits = this.raycaster.intersectObject(this.screenMesh);
		if (screenHits.length > 0) {
			const uv = screenHits[0].uv;
			this.dispatchDOMClick(Math.floor(uv.x * 1024), Math.floor(uv.y * 768));
		}
	}

	handleHover(event) {
		if (this.isDestroyed || !this.isEntranceComplete || !this.camera) return;

		const rect = this.renderer.domElement.getBoundingClientRect();
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		this.raycaster.setFromCamera(this.mouse, this.camera);

		if (this.lightSwitchWidget?.mesh && this.raycaster.intersectObject(this.lightSwitchWidget.mesh).length > 0) {
			document.body.style.cursor = 'pointer';
			return;
		}

		if (this.soundSwitchWidget?.mesh && this.raycaster.intersectObject(this.soundSwitchWidget.mesh).length > 0) {
			document.body.style.cursor = 'pointer';
			return;
		}

		if (this.screenMesh && this.portfolioContent) {
			const hits = this.raycaster.intersectObject(this.screenMesh);
			if (hits.length > 0) {
				if (!this.isZoomed) this.zoomToScreen();
				const uv = hits[0].uv;
				document.body.style.cursor = this.isCoordinateInteractive(uv.x * 1024, uv.y * 768) ? 'pointer' : 'default';
				return;
			}
		}

		document.body.style.cursor = 'default';
	}

	handleTouch(event) {
		if (event.touches.length === 1) {
			const touch = event.touches[0];
			this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
		}
	}

	setupEntranceAnimation() {
		if (!this.camera || !this.controls) return;
		this.camera.position.set(210, 110, 180);
		const targetPosition = new THREE.Vector3(5, 0, 5);
		this.camera.lookAt(targetPosition);
		if (this.controls) {
			this.controls.target.copy(targetPosition);
		}
	}

	startCinematicEntrance() {
		if (!this.camera || !this.controls) return;

		this.isEntranceComplete = false;

		this.camera.position.set(210, 110, 180);
		const targetPosition = new THREE.Vector3(5, 0, 5);
		this.camera.lookAt(targetPosition);
		this.controls.target.copy(targetPosition);

		if (this.computerModel) {
			this.computerModel.position.set(5, -28, 5);
			new JEASINGS.JEasing(this.computerModel.position)
				.to({ x: 5, y: -15, z: 5 }, 2600)
				.start();
		}

		new JEASINGS.JEasing(this.camera.position)
			.to({
				x: this.initialCameraPosition.x,
				y: this.initialCameraPosition.y,
				z: this.initialCameraPosition.z
			}, 3200)
			.start();

		new JEASINGS.JEasing(this.controls.target)
			.to({
				x: targetPosition.x,
				y: targetPosition.y,
				z: targetPosition.z
			}, 3200)
			.start();

		// Screen, clock, buttons, and lamp reveal ONLY after entrance animation lands at the desk (~2400ms)
		setTimeout(() => {
			if (this.isDestroyed) return;

			// 1. Reveal desk widgets (clock, sound switch, lamp button)
			if (this.clockWidget?.mesh) this.clockWidget.mesh.visible = true;
			if (this.soundSwitchWidget?.mesh) this.soundSwitchWidget.mesh.visible = true;
			if (this.lightSwitchWidget?.mesh) this.lightSwitchWidget.mesh.visible = true;

			// 2. Power on CRT screen with cinematic ignition flash
			this.updateScreenDisplay({ recreateMaterial: true });
			if (this.screenMaterial) {
				this.screenMaterial.color.setHex(0x67e8f9);
				if (this.screenLight) this.screenLight.intensity = 4.0;
				setTimeout(() => {
					if (this.screenMaterial) {
						new JEASINGS.JEasing(this.screenMaterial.color)
							.to({ r: 1, g: 1, b: 1 }, 700)
							.start();
					}
					if (this.screenLight) {
						new JEASINGS.JEasing(this.screenLight)
							.to({ intensity: 1.5 }, 700)
							.start();
					}
				}, 220);
			}

			// 3. Desk lamp warm-up flicker
			if (this.bulbLight && this.isLightOn) {
				this.bulbLight.intensity = 0;
				setTimeout(() => { if (this.bulbLight) this.bulbLight.intensity = 140; }, 150);
				setTimeout(() => { if (this.bulbLight) this.bulbLight.intensity = 30;  }, 280);
				setTimeout(() => { if (this.bulbLight) this.bulbLight.intensity = 240; }, 420);
				setTimeout(() => {
					if (this.bulbLight) {
						new JEASINGS.JEasing(this.bulbLight)
							.to({ intensity: 200 }, 600)
							.start();
					}
				}, 560);
			}
		}, 2400);

		// Complete entrance sequence and unlock full interactions
		setTimeout(() => {
			if (this.isDestroyed) return;
			this.isEntranceComplete = true;
			this.updateScreenOverlayPosition();
		}, 3200);
	}

	animate() {
		if (this.isDestroyed) return;
		requestAnimationFrame(this.animate);

		JEASINGS.update();

		if (this.controls) {
			this.controls.update();
		}

		this.updateScreenOverlayPosition();

		if (this.renderer && this.scene && this.camera) {
			this.renderer.render(this.scene, this.camera);
		}
	}

	onWindowResize() {
		this.pageWidth = window.innerWidth;
		this.pageHeight = window.innerHeight;
		if (this.camera) {
			this.camera.aspect = this.pageWidth / this.pageHeight;
			this.camera.updateProjectionMatrix();
		}
		if (this.renderer) {
			this.renderer.setSize(this.pageWidth, this.pageHeight);
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		}
	}

	destroy() {
		return new Promise((resolve) => {
			this.isDestroyed = true;

			if (this.clockWidget) this.clockWidget.destroy();
			if (this.lightSwitchWidget) this.lightSwitchWidget.destroy();
			if (this.soundSwitchWidget) this.soundSwitchWidget.destroy();

			window.removeEventListener('resize', this.onWindowResize);

			if (this.renderer?.domElement) {
				this.renderer.domElement.removeEventListener('mousemove', this.handleHover);
				this.renderer.domElement.removeEventListener('click', this.handleClick);
			}

			if (this.portfolioTexture) {
				this.portfolioTexture.dispose();
			}

			JEASINGS.removeAll();

			if (this.renderer) {
				this.renderer.dispose();
				if (this.renderer.domElement?.parentNode) {
					this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
				}
			}

			this.camera = null;
			this.scene = null;
			this.renderer = null;
			this.controls = null;
			this.screenMesh = null;
			this.boxMesh = null;
			this.portfolioContent = null;
			this.portfolioTexture = null;

			resolve();
		});
	}
}
