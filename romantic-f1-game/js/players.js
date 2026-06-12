import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { scene } from './scene.js';
import { positions3D } from './board.js';

export const playersList = [
    { id: 1, name: "Anny", pos: 0, color: '#ff3344', colorHex: 0xff3344, mesh: null },
    { id: 2, name: "Gabriel", pos: 0, color: '#ff85a2', colorHex: 0xff85a2, mesh: null }
];

export function spawnPlayers() {
    // Player 1 (Anny) - Passion Pink Crimson F1 Car
    playersList[0].mesh = createProceduralCar(0xff3344, 0);
    scene.add(playersList[0].mesh);

    // Player 2 (Gabriel) - Pastel Neon Pink Car 
    playersList[1].mesh = createProceduralCar(0xff77bb, 1);
    scene.add(playersList[1].mesh);

    // Initial position snap side-by-side
    repositionCars(true);
}

/**
 * Procedural low poly F1 racing car mesh generator with customized avatars (bonecos)
 * 
 * COMENTÁRIO PARA O GABRIEL:
 * Quando você decidir integrar os seus modelos 3D (.glb), basta substituir este método
 * ou usar o Three.js GLTFLoader aqui para ler 'assets/models/carro_anny.glb' e 'carro_gabriel.glb'.
 * Por exemplo:
 * 
 * const loader = new GLTFLoader();
 * loader.load('assets/models/carro_gabriel.glb', (gltf) => {
 *     const customCar = gltf.scene;
 *     customCar.scale.set(3, 3, 3);
 *     ...
 * });
 */
function createProceduralCar(bodyColor, playerIndex) {
    const carGroup = new THREE.Group();

    // 1. Chassis
    const coreMat = new THREE.MeshStandardMaterial({ 
        color: bodyColor, 
        roughness: 0.25, 
        metalness: 0.6, 
        flatShading: true 
    });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.8), coreMat);
    chassis.position.y = 0.3;
    chassis.castShadow = true;
    carGroup.add(chassis);

    // 2. Cockpit
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.5), coreMat);
    cockpit.position.set(-0.1, 0.45, 0);
    carGroup.add(cockpit);

    // 3. Stylized Driver Avatar (Boneco 3D) Torso
    const suitColor = (playerIndex === 0) ? 0xee2233 : 0xee55aa;
    const torsoMat = new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.6 });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 5), torsoMat);
    torso.position.set(-0.1, 0.55, 0);
    carGroup.add(torso);

    // Cute Steering Wheel
    const wheelRimMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 5, 10), wheelRimMat);
    wheelRim.position.set(0.18, 0.6, 0);
    wheelRim.rotation.y = Math.PI / 2;
    carGroup.add(wheelRim);

    // Arm attachments driving
    const armMat = new THREE.MeshStandardMaterial({ color: suitColor, flatShading: true });
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.07), armMat);
    lArm.position.set(0.05, 0.58, 0.12);
    lArm.rotation.y = -0.4;
    carGroup.add(lArm);

    const rArm = lArm.clone();
    rArm.position.set(0.05, 0.58, -0.12);
    rArm.rotation.y = 0.4;
    carGroup.add(rArm);

    // Customized Helmet on Avatar matching character index
    const helmetColor = (playerIndex === 0) ? 0xffffff : 0xffdd44;
    const helmetMat = new THREE.MeshStandardMaterial({ color: helmetColor, roughness: 0.1 });
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.24, 7, 7), helmetMat);
    helmet.position.set(-0.1, 0.85, 0);
    carGroup.add(helmet);

    // Visor
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.11, 0.3), visorMat);
    visor.position.set(0.1, 0.85, 0);
    carGroup.add(visor);

    // Ribbons for Anny (Cute bows / hair cones) vs Gabriel (Cool headphone-like helmet ears)
    const decoMat = new THREE.MeshStandardMaterial({ color: (playerIndex === 0) ? 0xff1493 : 0x00ffff });
    if (playerIndex === 0) {
        const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4), decoMat);
        bowL.position.set(-0.24, 0.96, 0.12);
        bowL.rotation.z = -1;
        carGroup.add(bowL);
        const bowR = bowL.clone();
        bowR.position.set(-0.24, 0.96, -0.12);
        carGroup.add(bowR);
    } else {
        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), decoMat);
        earL.position.set(-0.1, 1.04, 0.1);
        earL.rotation.z = -0.2;
        carGroup.add(earL);
        const earR = earL.clone();
        earR.position.set(-0.1, 1.04, -0.1);
        carGroup.add(earR);
    }

    // 4. Wings & Spoilers
    const wingGeo = new THREE.BoxGeometry(0.4, 0.1, 1.4);
    const wing = new THREE.Mesh(wingGeo, coreMat);
    wing.position.set(0.9, 0.15, 0);
    carGroup.add(wing);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.5), coreMat);
    nose.position.set(0.5, 0.3, 0);
    carGroup.add(nose);

    const spoilerStruts = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.6), coreMat);
    spoilerStruts.position.set(-0.7, 0.45, 0);
    carGroup.add(spoilerStruts);

    const spoilerPlank = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 1.3), coreMat);
    spoilerPlank.position.set(-0.7, 0.7, 0);
    carGroup.add(spoilerPlank);

    // 5. Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, flatShading: true });
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.38, 8);
    wheelGeo.rotateX(Math.PI / 2);

    const wheelPositions = [
        { x: 0.6, z: 0.55 },
        { x: 0.6, z: -0.55 },
        { x: -0.5, z: 0.55 },
        { x: -0.5, z: -0.55 }
    ];

    wheelPositions.forEach(pos => {
        const mw = new THREE.Mesh(wheelGeo, wheelMat);
        mw.position.set(pos.x, 0.25, pos.z);
        mw.castShadow = true;
        carGroup.add(mw);
    });

    // 6. Floating Heart Selector Indicator
    const heartIndicator = new THREE.Group();
    const indMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), indMat);
    h1.rotation.set(Math.PI/4, Math.PI/4, 0);
    heartIndicator.add(h1);
    heartIndicator.position.set(0, 1.8, 0);
    carGroup.add(heartIndicator);
    
    carGroup.heartIndicator = heartIndicator;
    carGroup.scale.set(1.2, 1.2, 1.2);

    return carGroup;
}

// Relocate cars to side-by-side positions to prevent them from sitting directly on top of each other
export function repositionCars(snapInstant = false) {
    const offsetSide = 1.0; 
    
    playersList.forEach(p => {
        const currentTileIndex = p.pos;
        const tilePos = positions3D[currentTileIndex].clone();

        const nextIndex = (currentTileIndex + 1) % positions3D.length;
        const nextPos = positions3D[nextIndex].clone();
        
        const forward = new THREE.Vector3().subVectors(nextPos, tilePos).normalize();
        const right = new THREE.Vector3(-forward.z, 0, forward.x).normalize();

        const multiplier = (p.id === 1) ? -offsetSide : offsetSide;
        const targetPos = tilePos.clone().add(right.clone().multiplyScalar(multiplier * 0.7));
        targetPos.y += 0.2; 

        if (snapInstant) {
            p.mesh.position.copy(targetPos);
            const lookAtTarget = p.mesh.position.clone().add(forward);
            p.mesh.lookAt(lookAtTarget);
        } else {
            p.mesh.targetPos3D = targetPos;
            p.mesh.targetForward3D = forward;
        }
    });
}
