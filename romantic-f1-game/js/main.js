import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { 
    scene, camera, renderer, clock, init3DScene, cloudsGroup, starsMesh 
} from './scene.js';
import { generateHeartTrack, positions3D, boardSpacesCount } from './board.js';
import { spawnPlayers, playersList, repositionCars } from './players.js';
import { createDiceMesh, diceMesh } from './physics.js';
import { GAME_STATE, setupUIHandlers } from './ui.js';
import { animateVictoryHearts, isCutsceneRunning } from './cutscene.js';

window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize core scene configuration
    init3DScene();

    // 2. Build 3D heart-shaped race spline track
    generateHeartTrack();

    // 3. Spawns Gabriel and Anny's Formula 1 cars with customized avatars (bonecos)
    spawnPlayers();

    // 4. Construct 3D tumbling dice
    createDiceMesh();

    // 5. Connect UI handlers and direct dice raycasting triggers
    setupUIHandlers();

    // Remove fallback loading page visual when setup complete
    document.getElementById('loading-screen').classList.add('scale-out');

    // 6. Launch high-FPS rendering loop
    animate();
});

// Helper to project 3D coordinate space to 2D screen coordinate pixels (VR hologram look)
function toScreenPosition(obj, cameraArg) {
    let vector = new THREE.Vector3();
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    
    // Offset slightly above the mesh center
    vector.y += 3.2;

    vector.project(cameraArg);

    let width = renderer.domElement.clientWidth;
    let height = renderer.domElement.clientHeight;

    let x = (vector.x * 0.5 + 0.5) * width;
    let y = (vector.y * -0.5 + 0.5) * height;

    return { x: x, y: y, z: vector.z };
}

let timeClock = 0;

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    timeClock += delta;

    // Drifting background sky clouds
    cloudsGroup.forEach(c => {
        c.position.x += c.velocityYRate;
        if (c.position.x > 85) {
            c.position.x = -85;
        }
    });

    // Gentle rotation of the customized background cosmic star system
    if (starsMesh) {
        starsMesh.rotation.y += 0.0006;
    }

    // Car vibration + coordinates LERP movement
    playersList.forEach(p => {
        if(p.mesh && p.mesh.heartIndicator) {
            p.mesh.heartIndicator.rotation.y += 0.02;
            p.mesh.heartIndicator.position.y = 1.8 + Math.sin(timeClock * 4 + p.id) * 0.15;
        }

        if (p.mesh && p.mesh.targetPos3D) {
            // Smooth LERP transition
            p.mesh.position.lerp(p.mesh.targetPos3D, 0.15);
            
            // Look forward softly along route path vectors
            let lookAtTarget = p.mesh.position.clone().add(p.mesh.targetForward3D);
            p.mesh.lookAt(lookAtTarget);

            // Jumping bobble effect during movement steps
            let dist = p.mesh.position.distanceTo(p.mesh.targetPos3D);
            if (dist > 0.1) {
                p.mesh.position.y = 0.2 + Math.sin((dist / 3.5) * Math.PI) * 1.2;
            }
        } else if (p.mesh) {
            // Cute idle engine vibration/shake
            p.mesh.position.y = 0.22 + Math.sin(timeClock * 15 + p.id) * 0.016;
        }
    });

    // Hologram Projection overlay sync above active car
    const activeCar = playersList[GAME_STATE.activePlayerIndex].mesh;
    const holoDiv = document.getElementById('spatial-hologram');
    const modalDiv = document.getElementById('challengeModal');
    
    if (activeCar && modalDiv.classList.contains('active')) {
        let pos2D = toScreenPosition(activeCar, camera);
        holoDiv.style.left = `${pos2D.x}px`;
        holoDiv.style.top = `${pos2D.y}px`;
        holoDiv.classList.add('active');
    } else {
        holoDiv.classList.remove('active');
    }

    // Floating Virtual Tap Dice prompt projection above dice mesh
    const dicePromptDiv = document.getElementById('dice-tap-prompt');
    const rollBtn = document.getElementById('rollDice');
    if (diceMesh && !GAME_STATE.isDiceRolling && !rollBtn.disabled && !modalDiv.classList.contains('active')) {
        let dice2D = toScreenPosition(diceMesh, camera);
        dicePromptDiv.style.left = `${dice2D.x}px`;
        dicePromptDiv.style.top = `${dice2D.y - 15}px`;
        dicePromptDiv.style.display = 'block';
    } else {
        dicePromptDiv.style.display = 'none';
    }

    // Camera follow lerps
    if (GAME_STATE.cameraMode === 'follow') {
        const curCar = playersList[GAME_STATE.activePlayerIndex].mesh;
        if (curCar) {
            // Soft cinematic follow vectors
            const targetCamPos = curCar.position.clone().add(new THREE.Vector3(0, 16, 26));
            camera.position.lerp(targetCamPos, 0.06);
            camera.lookAt(curCar.position.x, curCar.position.y + 1, curCar.position.z);
        }
    } else if (GAME_STATE.cameraMode === 'orbital') {
        // Soft constant rotatory panorama around heart track center (0, 0, 0)
        camera.position.x = 42 * Math.sin(timeClock * 0.12);
        camera.position.z = 42 * Math.cos(timeClock * 0.12);
        camera.position.y = 28;
        camera.lookAt(0, 0, 0);
    } else if (GAME_STATE.cameraMode === 'podium') {
        // Dramatic direct close-up onto finish line winners
        const finishPos = positions3D[boardSpacesCount - 1].clone();
        const winCamPos = finishPos.clone().add(new THREE.Vector3(
            6 * Math.sin(timeClock * 0.25),
            3.5 + Math.sin(timeClock * 0.5) * 0.5,
            12 * Math.cos(timeClock * 0.25)
        ));
        camera.position.copy(winCamPos);
        camera.lookAt(finishPos.x, finishPos.y + 1.2, finishPos.z);
    }

    // Animate custom 3D victory heart particles
    if (isCutsceneRunning) {
        animateVictoryHearts(timeClock);
    }

    renderer.render(scene, camera);
}
