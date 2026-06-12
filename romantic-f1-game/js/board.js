import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { scene } from './scene.js';

export const positions3D = [];
export const tilesList = [];
export const boardSpacesCount = 50;
export const lightPoles = [];

// Generates the 50 Board Space Tiles following a heart shape spline
export function generateHeartTrack() {
    const totalPoints = boardSpacesCount;
    
    // Create spline point array forming a beautiful central 3D heart path
    const points = [];
    for (let i = 0; i < totalPoints; i++) {
        const theta = (i / totalPoints) * Math.PI * 2;
        
        // Classic parametric heart formulas:
        const x = 16 * Math.sin(theta) ** 3;
        // Flip y representation down to the flat Z plane inside 3D
        const z = -(13 * Math.cos(theta) - 5 * Math.cos(2*theta) - 2 * Math.cos(3*theta) - Math.cos(4*theta));
        const y = 0.2; // Baseline flat track height
        
        // Add a gentle, cozy roller-coaster height style sway
        const ySway = Math.sin(theta * 2) * 2.0;

        points.push(new THREE.Vector3(x * 2.0, y + ySway, z * 2.0));
    }
    
    // Setup CatmullRomCurve3 for extremely smooth vehicle driving loops
    const heartSpline = new THREE.CatmullRomCurve3(points);
    heartSpline.closed = true;
    
    const samplePositions = heartSpline.getPoints(totalPoints - 1);
    samplePositions.forEach(p => positions3D.push(p));
    
    // Create visual racetrack meshes along those coordinates
    for (let i = 0; i < totalPoints; i++) {
        let isSpecialLine = (i === 0 || i === totalPoints - 1);
        let colorIndex = i % 4;
        let tileColorHex = isSpecialLine ? 0xdddddd : (colorIndex === 0 ? 0xff3344 : (colorIndex === 1 ? 0xffcc00 : (colorIndex === 2 ? 0x0088ff : 0xaf40ff)));
        
        // 1. Core road tiles (Grey Asphalt look)
        const tileGeo = new THREE.BoxGeometry(3.5, 0.12, 3.5);
        const tileMat = new THREE.MeshStandardMaterial({
            color: 0x221a2c, // Moody slate gray tarmac
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });
        const tileMesh = new THREE.Mesh(tileGeo, tileMat);
        tileMesh.position.copy(positions3D[i]);
        tileMesh.position.y -= 0.12; // Put slightly lower than cars
        tileMesh.receiveShadow = true;
        
        // Rotate tiles according to path tangents
        let nextIndex = (i + 1) % totalPoints;
        let tangent = new THREE.Vector3().subVectors(positions3D[nextIndex], positions3D[i]).normalize();
        let angle = Math.atan2(tangent.x, tangent.z);
        tileMesh.rotation.y = angle;
        
        scene.add(tileMesh);
        tilesList.push(tileMesh);

        // Add visual realistic central road dashes (White lines)
        const dashGeo = new THREE.BoxGeometry(0.12, 0.05, 1.2);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.position.copy(positions3D[i]);
        dash.position.y += 0.01; // Placed right on road surface
        dash.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(positions3D[i], positions3D[nextIndex], new THREE.Vector3(0,1,0)));
        scene.add(dash);

        // Add visual borders/curbs (White & Pink alternating) to the sides
        const curbGeo = new THREE.BoxGeometry(0.5, 0.4, 3.5);
        const curbMat = new THREE.MeshBasicMaterial({
            color: (i % 2 === 0) ? 0xff2d55 : 0xffffff // Alternating Neon Pink and Crisp White curbs
        });
        
        let normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Right curb
        const rCurb = new THREE.Mesh(curbGeo, curbMat);
        rCurb.position.copy(positions3D[i]).add(normal.clone().multiplyScalar(2.0));
        rCurb.rotation.y = angle;
        scene.add(rCurb);

        // Left curb
        const lCurb = rCurb.clone();
        lCurb.position.copy(positions3D[i]).add(normal.clone().multiplyScalar(-2.0));
        scene.add(lCurb);
    }

    // Add neon sign poles to give a grand stadium VR aesthetic
    addNeonStadiumPoles();
}

function addNeonStadiumPoles() {
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 6, 5);
    const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 6);
    const bulbGeo = new THREE.SphereGeometry(0.35, 6, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3d2b4f, roughness: 0.5 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1d122a, roughness: 0.2 });
    
    // Distribute poles every 6 spaces
    for (let i = 4; i < boardSpacesCount; i += 6) {
        let tilePos = positions3D[i].clone();
        let nextIndex = (i + 1) % boardSpacesCount;
        let tangent = new THREE.Vector3().subVectors(positions3D[nextIndex], positions3D[i]).normalize();
        let normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        
        let side = (i % 2 === 0) ? -1 : 1;
        let polePos = tilePos.clone().add(normal.clone().multiplyScalar(side * 3.3));
        polePos.y += 0.1;
        
        const poleGroup = new THREE.Group();
        poleGroup.position.copy(polePos);
        
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.3;
        poleGroup.add(base);
        
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 3;
        poleGroup.add(pole);
        
        let isPink = (i % 2 === 0);
        const bulbMat = new THREE.MeshBasicMaterial({ color: isPink ? 0xff00cc : 0x00ffff });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.y = 6;
        poleGroup.add(bulb);
        
        // Adding Point Light logic to brighten coordinates
        const pLight = new THREE.PointLight(isPink ? 0xff00cc : 0x00ffff, 0.9, 14);
        pLight.position.set(0, 6, 0);
        poleGroup.add(pLight);
        
        scene.add(poleGroup);
        lightPoles.push(poleGroup);
    }
}
