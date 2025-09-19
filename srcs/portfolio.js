import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import JEASINGS from 'jeasings'

export class Portfolio{
	constructor(){
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

	}

	// debugInteractions() {
	// 	this.renderer.domElement.addEventListener('click', (event) => {
	// 		const rect = this.renderer.domElement.getBoundingClientRect();
	// 		const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	// 		const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			
	// 		this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
			
	// 		if (this.screenMesh) {
	// 			const intersects = this.raycaster.intersectObject(this.screenMesh);
				
	// 			if (intersects.length > 0) {
	// 				const uv = intersects[0].uv;
	// 				const x = Math.floor(uv.x * 1024);
	// 				const y = Math.floor(uv.y * 768); // Remove the 1 - uv.y transformation
					
	// 				console.log('Click detected:');
	// 				console.log(`navig statue = ${this.isNavigating}`)
	// 				console.log(`Mouse coords: (${event.clientX}, ${event.clientY})`);
	// 				console.log(`Screen UV: (${uv.x.toFixed(3)}, ${uv.y.toFixed(3)})`);
	// 				console.log(`Screen Pixels: (${x}, ${y})`);
					
	// 				// Store original styles
	// 				const originalStyle = this.portfolioContent.style.cssText;
					
	// 				// Move content temporarily for hit testing
	// 				this.portfolioContent.style.cssText = `
	// 					position: fixed;
	// 					left: 0;
	// 					top: 0;
	// 					visibility: visible;
	// 					pointer-events: auto;
	// 					transform: none;
	// 				`;
					
	// 				// Try to find element at position
	// 				const element = document.elementFromPoint(x, y);
	// 				console.log('Raw element at point:', element?.tagName, element?.className);
					
	// 				if (element) {
	// 					// Look for navigation buttons in parent elements
	// 					const navButton = element.closest('[data-section]');
	// 					console.log('Navigation button found:', navButton?.dataset?.section);
						
	// 					// Additional debugging
	// 					if (!navButton) {
	// 						console.log('Parent elements:', element.parentElement?.className);
	// 						const allButtons = this.portfolioContent.querySelectorAll('[data-section]');
	// 						console.log('Available nav buttons:', Array.from(allButtons).map(b => b.dataset.section));
	// 					}
	// 				}
					
	// 				// Restore original position
	// 				this.portfolioContent.style.cssText = originalStyle;
	// 			}
	// 		}
	// 	});
	// }

	createScreenTexture() {
		this.portfolioContent = document.getElementById('portfolioContent');
		
		if (!this.portfolioContent) {
			console.error('Portfolio content element not found');
			return;
		}

		const options = {
			scale: 2,
			useCORS: true,
			backgroundColor: null,
			width: 1024,
			height: 768,
			logging: true
		};

		html2canvas(this.portfolioContent, options).then(canvas => {
			if (this.portfolioTexture) {
				this.portfolioTexture.dispose();
			}

			this.portfolioTexture = new THREE.CanvasTexture(canvas);
			this.portfolioTexture.encoding = THREE.sRGBEncoding;
			this.portfolioTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
			this.portfolioTexture.needsUpdate = true;
			
			if (this.screenMesh) {
				const screenMaterial = new THREE.MeshStandardMaterial({
					map: this.portfolioTexture,
					emissive: 0xffffff,
					emissiveMap: this.portfolioTexture,
					emissiveIntensity: 0.5
				});
				
				this.screenMesh.material = screenMaterial;
			}
		}).catch(error => {
			console.error('Error creating screen texture:', error);
		});
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
			context.fillText(time, canvas.width/2, canvas.height/2);
			
			context.front = 'bold 72px "Press Start 2P", "Courier New", monospace';
			context.fillText('ISSAM ZITOUNI', canvas.width * 1/2, canvas.height * 3/4);
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
	}

	handleClick(event) {
		if (this.isDestroyed || !this.screenMesh || !this.portfolioContent) return;
		
		console.log('Click detected:', event.clientX, event.clientY);
		console.log('navig statue =', this.isNavigating);
		
		const rect = this.renderer.domElement.getBoundingClientRect();
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		
		this.raycaster.setFromCamera(this.mouse, this.camera);
		
		// Light switch handling (unchanged)
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
		
		// Screen content click
		const intersects = this.raycaster.intersectObject(this.screenMesh);
		if (intersects.length > 0) {
			const uv = intersects[0].uv;
			const x = Math.floor(uv.x * 1024);
			
			// Add this line to fix the error - store original style
			const originalStyle = this.portfolioContent.style.cssText;
			
			// Fixed Y coordinate calculation
			let y = 0;
			if (this.currentSection === 'home') {
				// For home section, the Y coordinate needs special handling
				y = Math.floor((1 - uv.y) * 768);
				console.log('Home section click detected at:', x, y);
				
				// *** FIXED HOME SECTION NAVIGATION ***
				// Now use more appropriate coordinate ranges based on the log output
				if (y >= 650 && y <= 750) { // Adjusted for observed values ~700
					// Check X coordinate ranges for the three buttons
					if (x >= 320 && x <= 400) {
						console.log('Home section ABOUT button clicked');
						this.navigateToSection('about');
						return;
					} else if (x >= 480 && x <= 560) {
						console.log('Home section PROJECTS button clicked');
						this.navigateToSection('projects');
						return;
					} else if (x >= 640 && x <= 720) {
						console.log('Home section CONTACT button clicked');
						this.navigateToSection('contact');
						return;
					}
				}
			} else {
				// For other sections, use standard calculation
				y = Math.floor((1 - uv.y) * 768);
				
				// FOR NON-HOME SECTIONS: Check if we're clicking in the top navigation area
				if (y < 80) {
					console.log('Click in top nav area of non-home section');
					// Home button is on the left
					if (x < 100) {
						console.log('Home button area clicked');
						this.navigateToSection('home');
						return;
					}
					
					// Other nav buttons are on the right side
					if (x > 800 && x < 880) {
						const sections = ['about', 'projects', 'contact'].filter(s => s !== this.currentSection);
						if (sections.length > 0) {
							console.log('First nav button area clicked:', sections[0]);
							this.navigateToSection(sections[0]);
						}
						return;
					}
					
					if (x > 880 && x < 960) {
						const sections = ['about', 'projects', 'contact'].filter(s => s !== this.currentSection);
						if (sections.length > 1) {
							console.log('Second nav button area clicked:', sections[1]);
							this.navigateToSection(sections[1]);
						}
						return;
					}
				}
			}
			
			// Standard detection for all sections
			this.portfolioContent.style.cssText = `
				position: fixed;
				left: 0;
				top: 0;
				visibility: visible;
				pointer-events: auto;
				transform: ${this.currentSection !== 'home' ? 'scaleY(-1)' : 'none'};
				width: 1024px;
				height: 768px;
				z-index: 9999;
			`;
			
			const element = document.elementFromPoint(x, y);
			console.log('Raw element at point:', element?.tagName, element?.className);
			
			// Try both data-nav and data-section for maximum compatibility
			let navButton = element?.closest('[data-nav="true"]');
			if (!navButton) {
				navButton = element?.closest('[data-section]');
			}
			
			console.log('Navigation button found:', navButton?.dataset.section);
			
			this.portfolioContent.style.cssText = originalStyle;
			
			if (navButton?.dataset.section && window.handlePortfolioNavigation && !this.isNavigating) {
				this.navigateToSection(navButton.dataset.section);
			}
		}
	}

	// Add a helper method for navigation
	navigateToSection(section) {
		console.log(`Navigating to section: ${section}`);
		
		// Force reset if navigation is stuck
		if (this.isNavigating && Date.now() - (this.lastNavigationTime || 0) > 2000) {
			console.log('Forcing navigation reset after timeout');
			this.isNavigating = false;
		}
		
		if (!this.isNavigating && window.handlePortfolioNavigation) {
			// Set navigation state properly
			this.isNavigating = true;
			this.lastNavigationTime = Date.now();
			
			// Update section and handle navigation
			this.currentSection = section;
			
			try {
				window.handlePortfolioNavigation(section);
				
				const updateTextures = async () => {
					try {
						await this.updateTexture();
						setTimeout(async () => {
							await this.updateTexture();
						}, 300);
					} catch (error) {
						console.error('Error updating texture:', error);
					} finally {
						// Always reset navigation state
						setTimeout(() => {
							this.isNavigating = false;
							console.log('Navigation state reset');
						}, 500);
					}
				};
				
				updateTextures();
			} catch (error) {
				console.error(`Navigation error: `, error);
				this.isNavigating = false;
			}
		}
	}

	// Add a helper method to handle the navigation
	// handleNavigation(section) {
	// 	console.log('Navigating to:', section);
		
	// 	// Force reset if navigation is stuck
	// 	if (this.isNavigating && Date.now() - this.lastNavigationTime > 2000) {
	// 		this.isNavigating = false;
	// 	}
		
	// 	if (!this.isNavigating && window.handlePortfolioNavigation) {
	// 		this.isNavigating = true;
	// 		this.lastNavigationTime = Date.now();
	// 		this.currentSection = section;
			
	// 		window.handlePortfolioNavigation(section);
			
	// 		// Update texture with proper timing
	// 		setTimeout(() => {
	// 			this.updateTexture()
	// 				.then(() => console.log('Texture updated successfully'))
	// 				.finally(() => {
	// 					setTimeout(() => {
	// 						this.isNavigating = false;
	// 						console.log('Navigation complete, state reset');
	// 					}, 500);
	// 				});
	// 		}, 100);
	// 	}
	// }

	updateTexture() {
		if (!this.portfolioContent) return Promise.resolve();
		
		this.isUpdatingTexture = true;
		
		const options = {
			scale: 0.7,
			useCORS: true,
			backgroundColor: null,
			width: 1024,
			height: 768,
			logging: false,
			removeContainer: true,
        	foreignObjectRendering: false,
			onclone: (clonedDoc) => {
				const clonedContent = clonedDoc.getElementById('portfolioContent');
				if (clonedContent) {
					clonedContent.style.transform = 'none';
				}
			}

		};

		return html2canvas(this.portfolioContent, options)
			.then(canvas => {
				if (this.portfolioTexture) {
					this.portfolioTexture.dispose();
				}
				
				this.portfolioTexture = new THREE.CanvasTexture(canvas);
				this.portfolioTexture.encoding = THREE.sRGBEncoding;
				this.portfolioTexture.anisotropy = 1;
				this.portfolioTexture.generateMipmaps = false;
				this.portfolioTexture.flipY = false;
				this.portfolioTexture.needsUpdate = true;

				if (this.screenMesh) {
	                if (!this.screenMaterial) {
						this.screenMaterial = new THREE.MeshStandardMaterial({
							map: this.portfolioTexture,
							emissive: 0xffffff,
							emissiveMap: this.portfolioTexture,
							emissiveIntensity: 0.5
						});
						this.screenMesh.material = this.screenMaterial;
					} else {
						// Update existing material
						this.screenMaterial.map = this.portfolioTexture;
						this.screenMaterial.emissiveMap = this.portfolioTexture;
						this.screenMaterial.needsUpdate = true;
					}
				}
				return canvas;
			})
			.catch(error => {
				console.error('Error creating screen texture:', error);
			})
			.finally(() => {
				this.isUpdatingTexture = false;
			});
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

    // async start() {
    //     for (const message of this.messages) {
    //         await this.displayMessage(message);
    //     }
    //     setTimeout(() => {
    //         document.getElementById('biosScreen').style.display = 'none';
    //     }, 2000);
    // }
	
	init(){
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.toneMapping = THREE.ReinhardToneMapping;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
		
		const loader = new GLTFLoader();
        loader.load('/models/wholeEnviroment.glb', (gltf) => {
			gltf.scene.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = true;
                    if (child.name === "Plane001_2") {
						this.screenMesh = child;
						const box = new THREE.Box3().setFromObject(child);
						const screenCenter = box.getCenter(new THREE.Vector3());

						this.controls.target.copy(screenCenter);
						this.camera.lookAt(screenCenter);

                        this.createScreenTexture();
                    }
                }
            });
            this.computerModel = gltf.scene;
			gltf.scene.position.set(5, -15, 5);
			gltf.scene.scale.set(10, 10, 10);
			this.scene.add(gltf.scene);

			this.createDateNameDisplay();
			// this.debugInteractions();
			this.setupEntranceAnimation();
        });
		
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    	this.controls.target.copy(screenCenter);

		this.controls.enableDamping = true;
		this.controls.enableZoom = false;
		this.controls.enableRotate = true;
		this.controls.maxTargetRadius = 100;
		this.controls.maxPolarAngle = Math.PI / 2;
		document.body.appendChild(this.renderer.domElement);
		window.addEventListener('resize', this.onWindowResize);
		
		this.renderer.domElement.addEventListener('mousemove', this.handleHover);

		this.portfolioContent = document.getElementById('portfolioContent');

	}
	onWindowResize(){
		this.camera.aspect = this.pageWidth / this.pageHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.pageWidth, this.pageHeight);
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
		if (this.screenMesh) {
			const intersects = this.raycaster.intersectObject(this.screenMesh);
			
			if (intersects.length > 0) {
				// Get intersection point for screen coordinates
				const uv = intersects[0].uv;
				const x = uv.x * 1024;
				const y = (1 - uv.y) * 768;

				const originalLeft = this.portfolioContent.style.left;
            	this.portfolioContent.style.left = '0';
				
				// Check for navigation elements
				const element = document.elementFromPoint(x, y);
				const navElement = element?.closest('[data-section]');

				this.portfolioContent.style.left = originalLeft;
				
				if (navElement) {
					document.body.style.cursor = 'pointer';
				} else if (!this.isZoomed) {
					document.body.style.cursor = 'default';
					
					// Only zoom if not already zoomed and not hovering over nav
					if (!this.isZoomed) {
						this.isZoomed = true;
						this.controls.enabled = false;
						
						// Get screen center for zoom target
						const box = new THREE.Box3().setFromObject(this.screenMesh);
						const screenCenter = box.getCenter(new THREE.Vector3());
						
						// Zoom to screen
						new JEASINGS.JEasing(this.camera.position)
							.to({
								x: this.zoomedCameraPosition.x,
								y: this.zoomedCameraPosition.y,
								z: this.zoomedCameraPosition.z
							}, 1000)
							.start();
						
						// Update controls target
						new JEASINGS.JEasing(this.controls.target)
							.to({
								x: screenCenter.x,
								y: screenCenter.y,
								z: screenCenter.z
							}, 1000)
							.start();
					}
				}
			} else if (this.isZoomed) {
				// Zoom out when not hovering over screen
				this.isZoomed = false;
				document.body.style.cursor = 'default';
				
				new JEASINGS.JEasing(this.camera.position)
					.to({
						x: this.initialCameraPosition.x,
						y: this.initialCameraPosition.y,
						z: this.initialCameraPosition.z
					}, 1000)
					.start();
				
				new JEASINGS.JEasing(this.controls.target)
					.to({
						x: 5, // Match your scene center
						y: 0,
						z: 5
					}, 1000)
					.onComplete(() => {
						this.controls.enabled = true;
					})
					.start();
			}
		}
	}

	setupEntranceAnimation() {
		if (!this.camera || !this.controls) return;
		// Start from a slightly closer dramatic angle
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
			}, 2500) // Matching duration for smooth synchronized movement
			.start();
	}
	
	animate(){
		requestAnimationFrame(this.animate);
		
		JEASINGS.update();
		if (this.controls) {
			this.controls.update();
        }

		if (this.screenMesh && this.portfolioContent) {
			this.raycaster.setFromCamera(this.mouse, this.camera);
			const intersects = this.raycaster.intersectObject(this.screenMesh);
	
			if (intersects.length > 0) {
				const intersect = intersects[0];
				const uv = intersect.uv;
				const contentRect = this.portfolioContent.getBoundingClientRect();
				const x = uv.x * contentRect.width;
				const y = (1 - uv.y) * contentRect.height;
	
				// Temporarily move content into view
				const originalLeft = this.portfolioContent.style.left;
				this.portfolioContent.style.left = '0px';
				
				const element = document.elementFromPoint(x, y);

				// Restore original position when hover out the screen
				this.portfolioContent.style.left = originalLeft;

				if (element && (element.tagName === 'P' || element.tagName === 'A')) {
					document.body.style.cursor = 'pointer';
					document.body.style.backgroundColor = 'rgb(1, 0, 0)';
				} else {
					document.body.style.cursor = 'default';
				}
			} else {
				document.body.style.cursor = 'default';
			}
		}
		this.renderer.render(this.scene, this.camera);
		
	}
	destroy() {
		return new Promise(resolve => {
			this.isDestroyed = true;

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

			// Clean up renderer last
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
