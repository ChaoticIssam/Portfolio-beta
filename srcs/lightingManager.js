import * as THREE from 'three';

/**
 * Initializes all scene lighting including ambient, directional, spot, and desk lamp lights
 */
export function setupLighting({ scene }) {
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
	directionalLight.position.set(20, 40, 20);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.width = 2048;
	directionalLight.shadow.mapSize.height = 2048;
	directionalLight.shadow.camera.near = 0.5;
	directionalLight.shadow.camera.far = 500;
	directionalLight.shadow.bias = -0.0001;
	scene.add(directionalLight);

	// Blue side ambient bounce light
	const bluesideLight = new THREE.PointLight(0x06b6d4, 1.2, 80, 2);
	bluesideLight.position.set(-20, 10, -10);
	scene.add(bluesideLight);

	// White side fill light
	const whitesideLight = new THREE.PointLight(0xffffff, 0.8, 100, 2);
	whitesideLight.position.set(10, 20, 30);
	scene.add(whitesideLight);

	// Desk lamp bulb light (warm incandescent glow)
	const bulbLight = new THREE.PointLight(0xffee88, 200, 300, 1);
	bulbLight.castShadow = true;
	bulbLight.shadow.mapSize.width = 2048;
	bulbLight.shadow.mapSize.height = 2048;
	bulbLight.shadow.camera.left = -50;
	bulbLight.shadow.camera.right = 50;
	bulbLight.shadow.camera.top = 50;
	bulbLight.shadow.camera.bottom = -50;
	bulbLight.position.set(45, 20, -50);
	scene.add(bulbLight);

	return {
		ambientLight,
		directionalLight,
		bluesideLight,
		whitesideLight,
		bulbLight
	};
}
