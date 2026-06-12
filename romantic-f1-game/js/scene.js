import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';

export let scene, camera, renderer, clock;
export let cloudsGroup = [];
export let starsMesh;

// Sound synthesizer for real F1 game sound effects on Web with zero-dependencies
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.audioEnabled = true;
    }
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    playTone(freq, dur, type = "triangle", delay = 0) {
        if (!this.audioEnabled) return;
        this.init();
        setTimeout(() => {
            try {
                let osc = this.ctx.createOscillator();
                let gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + dur);
            } catch(e) { console.log("Audio play err", e); }
        }, delay * 1000);
    }

    playEngineStart() {
        this.playTone(150, 0.4, "sawtooth");
        this.playTone(220, 0.3, "sawtooth", 0.2);
        this.playTone(330, 0.6, "sawtooth", 0.4);
    }
    
    playDiceRoll() {
        for (let i = 0; i < 6; i++) {
            this.playTone(200 + i * 100, 0.1, "sine", i * 0.1);
        }
    }
    
    playStep() {
        this.playTone(440, 0.15, "triangle");
    }
    
    playError() {
        this.playTone(180, 0.3, "square");
        this.playTone(130, 0.4, "square", 0.15);
    }

    playSuccess() {
        this.playTone(523.25, 0.1, "sine"); // C5
        this.playTone(659.25, 0.1, "sine", 0.1); // E5
        this.playTone(783.99, 0.15, "sine", 0.2); // G5
        this.playTone(1046.50, 0.3, "sine", 0.3); // C6
    }
    
    playVictoryMelody() {
        let notes = [523, 587, 659, 698, 783, 880, 987, 1046];
        notes.forEach((freq, idx) => {
            this.playTone(freq, 0.25, "triangle", idx * 0.22);
        });
        setTimeout(() => {
            this.playTone(1046, 0.8, "sawtooth", 0);
            this.playTone(1318, 0.8, "sawtooth", 0.1);
        }, 1800);
    }
}

export const AudioPlayer = new SoundSynth();

export function init3DScene() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // A. Setup Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07040d); // Cozy dark night
    scene.fog = new THREE.FogExp2(0x07040d, 0.012);

    // B. Setup Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 65);
    camera.lookAt(0, 0, 0);

    // C. Setup WebGL Renderer with High Quality & Shadows
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // D. Soft Lights (Sunset Neon Glow Theme)
    const ambientLight = new THREE.AmbientLight(0xffe6f0, 0.55);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff99bb, 0.85);
    dirLight.position.set(-20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Accent Point light for racetrack contrast
    const pointLight = new THREE.PointLight(0xff1450, 1.5, 120);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // E. Add Environment Elements: Stars & Clouds in Background
    createStarsSky();
    createCloudsBackground();

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function createStarsSky() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const positions = [];
    const colors = [];
    for(let i = 0; i < starCount; i++) {
        positions.push(
            Math.random() * 240 - 120,
            35 + Math.random() * 65,
            Math.random() * 240 - 120
        );
        // Sweet romantic pink & soft turquoise colors
        colors.push(Math.random() * 0.4 + 0.6, Math.random() * 0.3 + 0.5, 1.0);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const starMat = new THREE.PointsMaterial({
        size: 0.9,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
    });
    starsMesh = new THREE.Points(starGeo, starMat);
    scene.add(starsMesh);
}

function createCloudsBackground() {
    const cloudGeo = new THREE.DodecahedronGeometry(2.2, 1);
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffe6f3, transparent: true, opacity: 0.75 });
    
    for(let i = 0; i < 16; i++) {
        const cloudGroup = new THREE.Group();
        const numParts = 3 + Math.floor(Math.random() * 3);
        for(let j = 0; j < numParts; j++) {
            const mesh = new THREE.Mesh(cloudGeo, cloudMat);
            mesh.scale.set(1 + Math.random(), 1 + Math.random(), 1 + Math.random());
            mesh.position.set(j * 1.5 - 1.5, Math.random() * 0.5, Math.random() * 1.5 - 0.75);
            cloudGroup.add(mesh);
        }
        cloudGroup.position.set(
            Math.random() * 140 - 70,
            24 + Math.random() * 12,
            Math.random() * 140 - 70
        );
        cloudGroup.velocityYRate = 0.015 + Math.random() * 0.02;
        scene.add(cloudGroup);
        cloudsGroup.push(cloudGroup);
    }
}
