import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class BIOSLoading {
	constructor(){
		this.messages = [
			"Issam Released: 07/25/2001",
			"Studying Software Engineering 2022-2024 at LEET aka 1337",
			"Checking For Potato PCs: 14000 OK",
			"Ready To Load Portfolio",
			"LOADING RESOURCES...",
			"Loading 3D Models... 53%",
			"Loading Textures... 67%",
			"Loading Sounds... 71%",
			"Loading Images... 89%",
			"Loading Fonts... 92%",
			"Loading Scripts... 100%",
			"All Resources Loaded Successfully.",
		];
		this.currentMessageIndex = 0;
		this.biosMessagesElement = document.getElementById("biosMessages");
		this.progressBarElement = document.getElementById("progressBar");
	}
	displayMessage(message){
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
	async start(){
		for (const message of this.messages) {
			await this.displayMessage(message);
		}
		setTimeout(() => {
			document.getElementById('biosScreen').style.display = 'none';
		}, 2000);
	}
}

class Portfolio{
	constructor(){
		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.DirecLight = null;
		this.hemisphereLight = null;
		this.floor = null;
		
		this.pageWidth = window.innerWidth;
		this.pageHeight = window.innerHeight;

		this.onWindowResize = this.onWindowResize.bind(this);
        this.animate = this.animate.bind(this);

	}
	init(){
		this.scene = new THREE.Scene();
		// this.scene.background = new THREE.Color(0x2a204f);

		// this.scene.fog = new THREE.Fog(new THREE.Color(0x2b0052), 100, 1000);

		this.camera = new THREE.PerspectiveCamera(60, this.pageWidth / this.pageHeight, 4, 1000);
		this.camera.position.set(140, 26, -38);

		const bluesideLight = new THREE.DirectionalLight(0x0000ff, 6);
		bluesideLight.position.set(-10, 10, -5);
		bluesideLight.castShadow = true;
		bluesideLight.shadow.mapSize.width = 1024;
		bluesideLight.shadow.mapSize.height = 1024;
		bluesideLight.shadow.camera.left = -50;
		bluesideLight.shadow.camera.right = 50;
		bluesideLight.shadow.camera.top = 50;
		bluesideLight.shadow.camera.bottom = -50;
		// this.scene.add(bluesideLight);

		const whitesideLight = new THREE.DirectionalLight(0xffffff, 6);
		whitesideLight.position.set(15, 10, 10);
		whitesideLight.castShadow = true;
		whitesideLight.shadow.mapSize.width = 1024;
		whitesideLight.shadow.mapSize.height = 1024;
		whitesideLight.shadow.camera.left = -50;
		whitesideLight.shadow.camera.right = 50;
		whitesideLight.shadow.camera.top = 50;
		whitesideLight.shadow.camera.bottom = -50;
		// this.scene.add(whitesideLight);

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
				}
			});
			gltf.scene.castShadow = true;
			gltf.scene.position.set(5, -15, 5);
			gltf.scene.scale.set(10, 10, 10);
			this.scene.add(gltf.scene);
		});


		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.pageWidth, this.pageHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		const controls = new OrbitControls(this.camera, this.renderer.domElement);
		controls.minDistance = 150;
		controls.maxDistance = 200;
		controls.enablePan = false;
		// controls.enableRotate = false;
		controls.maxTargetRadius = 100;
		controls.maxPolarAngle = Math.PI / 2;
		document.body.appendChild(this.renderer.domElement);
		window.addEventListener('resize', this.onWindowResize);
	}
	onWindowResize(){
		this.camera.aspect = this.pageWidth / this.pageHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.pageWidth, this.pageHeight);
	}
	animate(){
		requestAnimationFrame(this.animate);
		this.renderer.render(this.scene, this.camera);
		console.log(this.camera.position);
	}
}
const biosLoading = new BIOSLoading();
biosLoading.start();

const portfolio = new Portfolio();
portfolio.init();
portfolio.animate();