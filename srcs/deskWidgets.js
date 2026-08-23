import * as THREE from 'three';

// 7-segment digital alarm clock rendered onto the desk box face (HH:MM format)
export function createDigitalClock({ boxMesh, scene }) {
	const canvas = document.createElement('canvas');
	canvas.width = 1024;
	canvas.height = 256;
	const context = canvas.getContext('2d');

	const texture = new THREE.CanvasTexture(canvas);
	const material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: 0.98,
		depthWrite: false,
		side: THREE.DoubleSide,
	});

	// The box face is 4.2 wide x 1.08 tall — this geometry keeps it subtle and proportionate
	const geometry = new THREE.PlaneGeometry(1.9, 0.58);
	const timeMesh = new THREE.Mesh(geometry, material);

	// Flush on the front face of Plane003 (+X face)
	timeMesh.position.set(2.105, 0.543, 0.45);
	timeMesh.rotation.set(0, Math.PI / 2, 0);

	if (boxMesh) {
		boxMesh.add(timeMesh);
	} else if (scene) {
		scene.add(timeMesh);
	}

	// Segment bitmask for digits 0–9 (a, b, c, d, e, f, g)
	const segmentMap = {
		'0': [1, 1, 1, 1, 1, 1, 0],
		'1': [0, 1, 1, 0, 0, 0, 0],
		'2': [1, 1, 0, 1, 1, 0, 1],
		'3': [1, 1, 1, 1, 0, 0, 1],
		'4': [0, 1, 1, 0, 0, 1, 1],
		'5': [1, 0, 1, 1, 0, 1, 1],
		'6': [1, 0, 1, 1, 1, 1, 1],
		'7': [1, 1, 1, 0, 0, 0, 0],
		'8': [1, 1, 1, 1, 1, 1, 1],
		'9': [1, 1, 1, 1, 0, 1, 1],
		' ': [0, 0, 0, 0, 0, 0, 0]
	};

	const draw7Segment = (char, x, y, w, h, t, b, italicSkew = -0.08) => {
		const mask = segmentMap[char] || segmentMap[' '];

		const segments = [
			[[b, 0], [w - b, 0], [w - t, t], [t, t]],
			[[w, b], [w, h / 2 - b], [w - t, h / 2 - t / 2], [w - t, t]],
			[[w, h / 2 + b], [w, h - b], [w - t, h - t], [w - t, h / 2 + t / 2]],
			[[t, h - t], [w - t, h - t], [w - b, h], [b, h]],
			[[0, h / 2 + b], [t, h / 2 + t / 2], [t, h - t], [0, h - b]],
			[[0, b], [t, t], [t, h / 2 - t / 2], [0, h / 2 - b]],
			[[t, h / 2 - t / 2], [w - t, h / 2 - t / 2], [w - b, h / 2], [w - t, h / 2 + t / 2], [t, h / 2 + t / 2], [b, h / 2]]
		];

		context.save();
		context.translate(x, y);
		context.transform(1, 0, italicSkew, 1, 0, 0);

		for (let i = 0; i < 7; i++) {
			const poly = segments[i];
			const isLit = mask[i] === 1;

			context.beginPath();
			context.moveTo(poly[0][0], poly[0][1]);
			for (let j = 1; j < poly.length; j++) {
				context.lineTo(poly[j][0], poly[j][1]);
			}
			context.closePath();

			if (isLit) {
				context.fillStyle = '#ffffff';
				context.shadowColor = 'rgba(255, 255, 255, 0.8)';
				context.shadowBlur = 8;
				context.fill();
				context.shadowBlur = 0;
			} else {
				// Faint ghost segment — realistic LCD/LED look
				context.fillStyle = 'rgba(255, 255, 255, 0.05)';
				context.fill();
			}
		}

		context.restore();
	};

	const drawColon = (x, y, h, dotSize = 16, italicSkew = -0.08) => {
		context.save();
		context.translate(x, y);
		context.transform(1, 0, italicSkew, 1, 0, 0);

		context.fillStyle = '#ffffff';
		context.shadowColor = 'rgba(255, 255, 255, 0.8)';
		context.shadowBlur = 8;

		context.fillRect(0, h * 0.32 - dotSize / 2, dotSize, dotSize);
		context.fillRect(0, h * 0.68 - dotSize / 2, dotSize, dotSize);

		context.shadowBlur = 0;
		context.restore();
	};

	const updateTime = () => {
		const date = new Date();
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');

		context.clearRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = '#000000';
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.strokeStyle = 'rgba(255, 255, 255, 0.25)';
		context.lineWidth = 3;
		context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

		const digitW = 108;
		const digitH = 176;
		const segThick = 20;
		const segBevel = 4;
		const digitGap = 24;
		const colonW = 44;

		let curX = Math.round((canvas.width - 572) / 2);
		const curY = Math.round((canvas.height - digitH) / 2);

		draw7Segment(hours[0], curX, curY, digitW, digitH, segThick, segBevel);
		curX += digitW + digitGap;
		draw7Segment(hours[1], curX, curY, digitW, digitH, segThick, segBevel);
		curX += digitW + digitGap;

		drawColon(curX + 12, curY, digitH, 16);
		curX += colonW + digitGap;

		draw7Segment(minutes[0], curX, curY, digitW, digitH, segThick, segBevel);
		curX += digitW + digitGap;
		draw7Segment(minutes[1], curX, curY, digitW, digitH, segThick, segBevel);

		texture.needsUpdate = true;
	};

	updateTime();
	const intervalId = setInterval(updateTime, 1000);

	return {
		mesh: timeMesh,
		intervalId,
		destroy() {
			clearInterval(intervalId);
			material.dispose();
			texture.dispose();
			geometry.dispose();
		}
	};
}

// Desk lamp toggle button — a simple clickable circle near the lamp
export function createLightSwitch({ scene, raycaster }) {
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
	const switchMesh = new THREE.Mesh(geometry, material);

	switchMesh.position.set(45, 20, -40);
	switchMesh.rotation.y = Math.PI * 0.25;

	if (scene) {
		scene.add(switchMesh);
	}

	const updateSwitch = (isOn, isHovered = false) => {
		context.clearRect(0, 0, canvas.width, canvas.height);

		context.beginPath();
		context.arc(64, 64, isHovered ? 58 : 50, 0, Math.PI * 2);
		context.fillStyle = '#ffffff';
		context.fill();

		texture.needsUpdate = true;
	};

	updateSwitch(true);

	let isHovered = false;
	switchMesh.onBeforeRender = () => {
		if (!raycaster) return;
		const intersects = raycaster.intersectObject(switchMesh);
		if (intersects.length > 0 && !isHovered) {
			isHovered = true;
			updateSwitch(true, true);
			document.body.style.cursor = 'pointer';
		} else if (intersects.length === 0 && isHovered) {
			isHovered = false;
			updateSwitch(true, false);
			document.body.style.cursor = 'default';
		}
	};

	return {
		mesh: switchMesh,
		updateSwitch,
		destroy() {
			material.dispose();
			texture.dispose();
			geometry.dispose();
		}
	};
}

// Sound mute/unmute button on the base box face
export function createSoundSwitch({ boxMesh, scene, raycaster, soundManager }) {
	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 256;
	const context = canvas.getContext('2d');

	const texture = new THREE.CanvasTexture(canvas);
	const material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: 0.95,
		depthWrite: false,
		side: THREE.DoubleSide,
	});

	const geometry = new THREE.CircleGeometry(0.18, 32);
	const soundMesh = new THREE.Mesh(geometry, material);

	soundMesh.position.set(2.106, 0.543, -1.15);
	soundMesh.rotation.set(0, Math.PI / 2, 0);

	if (boxMesh) {
		boxMesh.add(soundMesh);
	} else if (scene) {
		scene.add(soundMesh);
	}

	const updateSoundSwitch = (isMuted, isHovered = false) => {
		context.clearRect(0, 0, canvas.width, canvas.height);

		context.beginPath();
		context.arc(128, 128, isHovered ? 122 : 112, 0, Math.PI * 2);
		context.fillStyle = '#000000';
		context.fill();

		context.lineWidth = isHovered ? 8 : 5;
		context.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
		if (isHovered) {
			context.shadowColor = '#ffffff';
			context.shadowBlur = 8;
		}
		context.stroke();
		context.shadowBlur = 0;

		const iconColor = isMuted ? '#a1a1aa' : '#ffffff';
		context.fillStyle = iconColor;
		context.strokeStyle = iconColor;
		context.lineWidth = 7;
		context.lineCap = 'round';
		context.lineJoin = 'round';

		context.beginPath();
		context.rect(66, 106, 26, 44);
		context.fill();

		context.beginPath();
		context.moveTo(92, 106);
		context.lineTo(132, 74);
		context.lineTo(132, 182);
		context.lineTo(92, 150);
		context.closePath();
		context.fill();

		if (!isMuted) {
			context.beginPath();
			context.arc(126, 128, 32, -Math.PI * 0.28, Math.PI * 0.28, false);
			context.stroke();

			context.beginPath();
			context.arc(126, 128, 56, -Math.PI * 0.28, Math.PI * 0.28, false);
			context.stroke();
		} else {
			context.strokeStyle = '#ef4444';
			context.lineWidth = 9;
			context.beginPath();
			context.moveTo(56, 56);
			context.lineTo(200, 200);
			context.stroke();
		}

		texture.needsUpdate = true;
	};

	updateSoundSwitch(soundManager ? soundManager.isMuted : false);

	let isHovered = false;
	soundMesh.onBeforeRender = () => {
		if (!raycaster) return;
		const intersects = raycaster.intersectObject(soundMesh);
		if (intersects.length > 0 && !isHovered) {
			isHovered = true;
			updateSoundSwitch(soundManager ? soundManager.isMuted : false, true);
			document.body.style.cursor = 'pointer';
		} else if (intersects.length === 0 && isHovered) {
			isHovered = false;
			updateSoundSwitch(soundManager ? soundManager.isMuted : false, false);
			document.body.style.cursor = 'default';
		}
	};

	return {
		mesh: soundMesh,
		updateSoundSwitch,
		destroy() {
			material.dispose();
			texture.dispose();
			geometry.dispose();
		}
	};
}
