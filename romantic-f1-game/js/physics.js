import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { scene, AudioPlayer } from './scene.js';

export let diceMesh;

export function createDiceMesh() {
    const diceGeo = new THREE.BoxGeometry(2, 2, 2);
    
    // Colored faces for each value (1 to 6)
    const faceColors = [
        0xff3344, // 1: Red (História)
        0xffcc00, // 2: Yellow (Pit Stop)
        0x0088ff, // 3: Blue (Rádio)
        0xaf40ff, // 4: Purple (DRS)
        0xff007f, // 5: Pink (Amor)
        0x39ff14  // 6: Green (Sorte)
    ];
    
    const mats = faceColors.map(color => {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.15,
            metalness: 0.45,
            flatShading: true
        });
    });

    diceMesh = new THREE.Mesh(diceGeo, mats);
    diceMesh.position.set(0, 1.5, 0); // Settles near first tile initially
    diceMesh.castShadow = true;
    scene.add(diceMesh);
}

// Simulate physics bounce and squash/stretch on dice rolling
export function simulateDiceRoll(steps, carPos, onComplete) {
    AudioPlayer.playDiceRoll();
    
    const rollDuration = 1800; // ms
    const startTime = Date.now();
    
    // Elevate the dice above active car position and begin tumble
    diceMesh.position.set(carPos.x, carPos.y + 4.0, carPos.z);
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const t = elapsed / rollDuration;
        
        if (t < 1) {
            // Simulated elastic gravity bounces: cosine wave dampened by time factor
            const bounceHeight = Math.abs(Math.cos(t * Math.PI * 2.5)) * (4.5 * (1 - t));
            diceMesh.position.y = (carPos.y + 0.3) + bounceHeight;
            
            // Rapid high-speed rotation
            diceMesh.rotation.x += 0.45 * (1 - t * 0.45);
            diceMesh.rotation.y += 0.35 * (1 - t * 0.45);
            diceMesh.rotation.z += 0.25 * (1 - t * 0.45);
            
            // Squash and stretch simulation
            const squashScale = 1.0 + Math.sin(t * Math.PI * 5) * 0.16 * (1 - t);
            const perpScale = 1.0 / Math.sqrt(squashScale);
            diceMesh.scale.set(perpScale, squashScale, perpScale);
            
            requestAnimationFrame(animate);
        } else {
            // Settle dice, restore scale
            diceMesh.scale.set(1, 1, 1);
            snapDiceFaces(steps);
            diceMesh.position.y = carPos.y + 0.3; // Settle close to tarmac
            
            AudioPlayer.playStep(); // impact sound
            
            if (onComplete) onComplete(steps);
        }
    }
    
    animate();
}

// Snaps the 3D dice rotation to show matching face numbers correctly
function snapDiceFaces(val) {
    // Basic Euler face configurations matching box sides
    switch (val) {
        case 1: // Right face has 1
            diceMesh.rotation.set(0, -Math.PI / 2, 0);
            break;
        case 2: // Left face has 2
            diceMesh.rotation.set(0, Math.PI / 2, 0);
            break;
        case 3: // Top face has 3
            diceMesh.rotation.set(Math.PI / 2, 0, 0);
            break;
        case 4: // Bottom face has 4
            diceMesh.rotation.set(-Math.PI / 2, 0, 0);
            break;
        case 5: // Front face has 5
            diceMesh.rotation.set(0, 0, 0);
            break;
        case 6: // Back face has 6
            diceMesh.rotation.set(0, Math.PI, 0);
            break;
        default:
            diceMesh.rotation.set(0, 0, 0);
    }
}
