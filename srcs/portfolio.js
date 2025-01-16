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

		this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.portfolioContent = null;
        this.screenMesh = null;
        this.portfolioTexture = null;

		this.initialCameraPosition = new THREE.Vector3(140, 50, 38);
        this.zoomedCameraPosition = new THREE.Vector3(80, 35, 38);
        this.isZoomed = false;
        this.controls = null;
		
		this.pageWidth = window.innerWidth;
		this.pageHeight = window.innerHeight;

        this.onWindowResize = this.onWindowResize.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
		this.handleHover = this.handleHover.bind(this);

	}

    createScreenTexture() {
        this.portfolioContent = document.getElementById('portfolioContent');
        html2canvas(this.portfolioContent).then(canvas => {
            this.portfolioTexture = new THREE.CanvasTexture(canvas);
            this.portfolioTexture.needsUpdate = true;
			this.portfolioTexture.wrapS = THREE.RepeatWrapping;
			this.portfolioTexture.wrapT = THREE.RepeatWrapping;
			this.portfolioTexture.repeat.set(1, -1);
            
            if (this.screenMesh) {
                const screenMaterial = new THREE.MeshStandardMaterial({
                    map: this.portfolioTexture,
                    emissive: 0xffffff,
                    emissiveMap: this.portfolioTexture,
                    emissiveIntensity: 0.8,
                    metalness: 0.5,
                    roughness: 0.1
                });
                
                this.screenMesh.material = screenMaterial;
            }
        });
    }

	onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for intersections with the screen mesh
        if (this.screenMesh) {
            const intersects = this.raycaster.intersectObject(this.screenMesh);
            
            if (intersects.length > 0) {
                const intersect = intersects[0];
                const uv = intersect.uv;
                
                // Convert UV coordinates to content coordinates
                const x = uv.x * this.portfolioContent.offsetWidth;
                const y = (1 - uv.y) * this.portfolioContent.offsetHeight;

                // Find element at these coordinates in the hidden content
                const element = document.elementFromPoint(
                    x + this.portfolioContent.offsetLeft,
                    y + this.portfolioContent.offsetTop
                );

                // Update cursor style based on hoverable elements
                if (element && (element.tagName === 'A' || element.onclick)) {
                    document.body.style.cursor = 'pointer';
                } else {
                    document.body.style.cursor = 'default';
                }
            } else {
                document.body.style.cursor = 'default';
            }
        }
    }


    onClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        if (this.screenMesh) {
            const intersects = this.raycaster.intersectObject(this.screenMesh);
            
            if (intersects.length > 0) {
                const intersect = intersects[0];
                const uv = intersect.uv;
                
                // Convert UV coordinates to content coordinates
                const x = uv.x * this.portfolioContent.offsetWidth;
                const y = (1 - uv.y) * this.portfolioContent.offsetHeight;

                // Find and trigger click on element
                const element = document.elementFromPoint(
                    x + this.portfolioContent.offsetLeft,
                    y + this.portfolioContent.offsetTop
                );

                if (element) {
                    element.click();
                }
            }
        }
    }

	updateTexture() {
        if (this.portfolioTexture) {
            html2canvas(this.portfolioContent).then(canvas => {
                this.portfolioTexture.image = canvas;
                this.portfolioTexture.needsUpdate = true;
            });
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

    async start() {
        for (const message of this.messages) {
            await this.displayMessage(message);
        }
        setTimeout(() => {
            document.getElementById('biosScreen').style.display = 'none';
        }, 2000);
    }
	
	init(){
		this.scene = new THREE.Scene();
		// this.scene.background = new THREE.Color(0x2a204f);

		// this.scene.fog = new THREE.Fog(new THREE.Color(0x2b0052), 100, 1000);

		this.camera = new THREE.PerspectiveCamera(60, this.pageWidth / this.pageHeight, 4, 1000);
		this.camera.position.set(140, 30, 56);

		const bluesideLight = new THREE.DirectionalLight(0x0000ff, 0.5);
		bluesideLight.position.set(-10, 10, -5);
		bluesideLight.castShadow = true;
		bluesideLight.shadow.mapSize.width = 1024;
		bluesideLight.shadow.mapSize.height = 1024;
		bluesideLight.shadow.camera.left = -50;
		bluesideLight.shadow.camera.right = 50;
		bluesideLight.shadow.camera.top = 50;
		bluesideLight.shadow.camera.bottom = -50;
		this.scene.add(bluesideLight);

		const whitesideLight = new THREE.DirectionalLight(0xffffff, 0.1);
		whitesideLight.position.set(15, 10, 10);
		whitesideLight.castShadow = true;
		whitesideLight.shadow.mapSize.width = 1024;
		whitesideLight.shadow.mapSize.height = 1024;
		whitesideLight.shadow.camera.left = -50;
		whitesideLight.shadow.camera.right = 50;
		whitesideLight.shadow.camera.top = 50;
		whitesideLight.shadow.camera.bottom = -50;
		this.scene.add(whitesideLight);

		const bulbLight = new THREE.PointLight(0xffee88, 200, 300, 1);
		bulbLight.position.set(45, 20, -50);
		bulbLight.castShadow = true;
		this.scene.add(bulbLight);
		

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

                        this.createScreenTexture();
                    }
                }
            });
            
            gltf.scene.position.set(5, -15, 5);
            gltf.scene.scale.set(10, 10, 10);
            this.scene.add(gltf.scene);
        });


		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.pageWidth, this.pageHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.toneMapping = THREE.ReinhardToneMapping;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.enableZoom = false;
		this.controls.enableRotate = false;
		this.controls.maxTargetRadius = 100;
		this.controls.maxPolarAngle = Math.PI / 2;
		document.body.appendChild(this.renderer.domElement);
		window.addEventListener('resize', this.onWindowResize);
		this.renderer.domElement.addEventListener('mousemove', this.handleHover);

		this.renderer.domElement.addEventListener('click', (event) => {
			console.log('Canvas clicked');
			const rect = this.renderer.domElement.getBoundingClientRect();
			this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		});
	
		this.renderer.domElement.addEventListener('mousemove', (event) => {
			const rect = this.renderer.domElement.getBoundingClientRect();
			this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		});

		this.portfolioContent = document.getElementById('portfolioContent');
		window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('click', this.onClick);
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
        
        if (this.screenMesh) {
            const intersects = this.raycaster.intersectObject(this.screenMesh);
            
            if (intersects.length > 0 && !this.isZoomed) {
                this.isZoomed = true;
                this.controls.enabled = false;

                // Animate camera position
                new JEASINGS.JEasing(this.camera.position)
                    .to({
                        x: this.zoomedCameraPosition.x,
                        y: this.zoomedCameraPosition.y,
                        z: this.zoomedCameraPosition.z
                    }, 500)
                    .start();

                // Animate controls target
                new JEASINGS.JEasing(this.controls.target)
                    .to({
                        x: 0,
                        y: 0,
                        z: 0
                    }, 500)
                    .start();

            } else if (intersects.length === 0 && this.isZoomed) {
                this.isZoomed = false;
                
                // Return to initial position
                new JEASINGS.JEasing(this.camera.position)
                    .to({
                        x: this.initialCameraPosition.x,
                        y: this.initialCameraPosition.y,
                        z: this.initialCameraPosition.z
                    }, 500)
                    .start();

                // Reset controls target
                new JEASINGS.JEasing(this.controls.target)
                    .to({
                        x: 0,
                        y: 0,
                        z: 0
                    }, 500)
                    .onComplete(() => {
                        this.controls.enabled = true;
                    })
                    .start();
            }
        }
    }

	animate(){
		requestAnimationFrame(this.animate);

		this.camera.lookAt(this.scene.position);
		JEASINGS.update();

		if (this.controls) {
            this.controls.update();
        }
		console.log(this.camera.position);

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

				// Update cursor style based on hoverable elements
				if (element && (element.tagName === 'BUTTON' || element.tagName === 'A')) {
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
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('click', this.onClick);
        window.removeEventListener('resize', this.onWindowResize);
        
        // Clean up Three.js resources
        if (this.portfolioTexture) {
            this.portfolioTexture.dispose();
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
		this.renderer.domElement.removeEventListener('mousemove', this.handleHover);
		// JEASINGS.removeAll();
    }
}
