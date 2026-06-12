import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { scene, AudioPlayer } from './scene.js';
import { positions3D } from './board.js';

export let isCutsceneRunning = false;
export let victoryGroup;

export function triggerFinalCutscene() {
    isCutsceneRunning = true;
    AudioPlayer.playVictoryMelody();

    // 1. Alter lighting to high contrast cinematic evening pink
    const cozySpot = new THREE.PointLight(0xff0066, 3, 40);
    cozySpot.position.copy(positions3D[positions3D.length - 1]).add(new THREE.Vector3(0, 4, 0));
    scene.add(cozySpot);

    // Fade the rest of scene lighting down to dramatic focus
    scene.fog.color.setHex(0x05010a);
    scene.fog.density = 0.035;

    // 2. Generate victory surrounding floating heart particles
    createHeartParticles();

    // 3. Reveal overlays with exact neon messages
    const finishedOverlay = document.getElementById('finalMessage');
    setTimeout(() => {
        finishedOverlay.classList.add('active');
        // Spray multiple rounds of colorful celebratory confetti
        let confettiTimes = 5;
        let cInterval = setInterval(() => {
            if (confettiTimes <= 0) {
                clearInterval(cInterval);
                return;
            }
            confetti({
                particleCount: 120,
                spread: 90,
                origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.4 + 0.3 }
            });
            confettiTimes--;
        }, 1000);
    }, 1500);
}

// Sparkle sweet red and rose 3D hearts surrounding the finish gate area
function createHeartParticles() {
    victoryGroup = new THREE.Group();
    const finishPos = positions3D[positions3D.length - 1];
    victoryGroup.position.copy(finishPos);

    const heartGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0xff1493 }),
        new THREE.MeshBasicMaterial({ color: 0xff0055 }),
        new THREE.MeshBasicMaterial({ color: 0xffaaec })
    ];

    for (let i = 0; i < 40; i++) {
        const mat = materials[Math.floor(Math.random() * materials.length)];
        const mesh = new THREE.Mesh(heartGeo, mat);
        
        // Random shell distributions
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.5 + Math.random() * 8;
        mesh.position.set(
            Math.cos(angle) * radius,
            0.5 + Math.random() * 9,
            Math.sin(angle) * radius
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        
        // Custom bounce velocity tag
        mesh.floatSpeed = 0.02 + Math.random() * 0.04;
        mesh.floatAngleOffset = Math.random() * 50;

        victoryGroup.add(mesh);
    }

    scene.add(victoryGroup);
}

export function animateVictoryHearts(time) {
    if (!victoryGroup) return;
    
    victoryGroup.children.forEach(h => {
        h.rotation.y += h.floatSpeed;
        h.rotation.z += 0.01;
        h.position.y += Math.sin(time * 2 + h.floatAngleOffset) * 0.02;
    });
}
