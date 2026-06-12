/**
 * CORRIDA DO AMOR - VALENTINE'S DAY F1 3D BOARD GAME
 * Developed with Three.js (WebGL) + HTML5 + CSS + Web Audio API
 * 
 * DESIGN ARCHITECTURE:
 * - 3D Engine: Low Poly procedural graphics using cylinders, cubes, spheres.
 * - Map Design: 50 board spaces forming a gorgeous HEART-shape in 3D.
 * - Cars: Procedural 3D F1 low-poly vehicles (Red and Passion Pink).
 * - Celebrations: Canvas-confetti + 3D particle fireworks + camera focus on a customized F1 podium.
 * - Portability: Self-contained Web Audio API synthesizer for zero-dependency sounds.
 * - Extensibility: Comments inside the code teach how to insert external .gltf/.obj models if desired!
 */

// --- 1. GAME DATA STATE ---
const GAME_STATE = {
    players: [
        { id: 1, name: "Anny", pos: 0, color: '#ff3344', colorHex: 0xff3344, mesh: null, index: 1 },
        { id: 2, name: "Gabriel", pos: 0, color: '#ff85a2', colorHex: 0xff85a2, mesh: null, index: 2 }
    ],
    activePlayerIndex: 0, // 0 = Player 1, 1 = Player 2
    boardSpacesCount: 50,
    isDiceRolling: false,
    cameraMode: 'follow', // follow, orbital, podium
    audioEnabled: true,
    positions3D: [], // Storing actual 3D coordinates of board space tiles
    tilesMeshes: []  // Storing Three.js tile meshes
};

// Color Categories & Events mapping
const TILE_TYPES = {
    RED: { color: 0xff3344, label: 'História do Casal', icon: 'fa-history', styleClass: 'card-class-red' },
    YELLOW: { color: 0xffcc00, label: 'Pit Stop (Prenda)', icon: 'fa-tools', styleClass: 'card-class-yellow' },
    BLUE: { color: 0x0088ff, label: 'Rádio da Equipe', icon: 'fa-walkie-talkie', styleClass: 'card-class-blue' },
    PURPLE: { color: 0xaf40ff, label: 'DRS Ativado (Futuro)', icon: 'fa-forward-fast', styleClass: 'card-class-purple' }
};

// Pre-populated Romantic Event Card Database
const CHALLENGE_CARDS = {
    RED: [
        { id: 1, question: "Onde foi o primeiro beijo do casal? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 2, question: "Qual é a data exata em que vocês começaram a namorar ou se conheceram? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 3, question: "Quem disse 'Eu te amo' primeiro? Qual foi a reação da outra pessoa? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 4, question: "Qual foi a primeira viagem (ou passeio memorável) que fizeram juntos? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 5, question: "Qual é o prato de comida favorito que vocês adoram comer juntos em encontros? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 6, question: "Qual roupa ou detalhe visual seu parceiro usou no primeiro encontro de vocês? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 7, question: "Quem é mais propenso a dormir no meio de um filme ou série? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 8, question: "Qual foi o primeiro presente que vocês deram um ao outro? Se errar, recue 1 casa!", penalty: "Recue 1 casa" }
    ],
    YELLOW: [
        { id: 1, question: "Faça uma massagem rápida de 1 minuto nos ombros do seu amor! Se não fizer, recue 1 casa!", penalty: "Não cumpriu: Recue 1 casa" },
        { id: 2, question: "Imite o seu amor em uma situação engraçada (ex: com ciúmes, com preguiça ou com fome). Se falhar, recue 1 casa!", penalty: "Não cumpriu: Recue 1 casa" },
        { id: 3, question: "Fale 3 qualidades que fazem você se apaixonar todos os dias pelo outro piloto. Se esquecer uma, recue! ❤️", penalty: "Ficou sem palavras: Recue 1 casa" },
        { id: 4, question: "Segure a mão do seu co-piloto até o final da sua próxima jogada! Se soltar antes, recue 1 casa!", penalty: "Soltou: Recue 1 casa" },
        { id: 5, question: "Faça uma declaração dramática estilo novela mexicana romântica improvisando agora! Se falhar, recue!", penalty: "Sem drama: Recue 1 casa" },
        { id: 6, question: "Encha as bochechas do seu amor com 5 beijos estalados e barulhentos! Se não fizer, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 7, question: "Imite o som exato de um motor de Fórmula 1 acelerando e termine com uma declaração fofa!", penalty: "Sem motor: Recue 1 casa" }
    ],
    BLUE: [
        { id: 1, question: "Cante o refrão de uma música que lembra instantaneamente o seu parceiro! Se travar, recue 1 casa!", penalty: "Saiu do tom: Recue 1 casa" },
        { id: 2, question: "Piloto no Rádio! Com chiados de rádio na boca, diga: 'Box, Box! Equipe, informo que amo o piloto do carro ao lado!'", penalty: "Mensagem cortada: Recue 1 casa" },
        { id: 3, question: "Fale cochichando no ouvido do seu parceiro algo romântico que você adora que ele(a) faça por você.", penalty: "Ficou tímido: Recue 1 casa" },
        { id: 4, question: "Imite uma dancinha de vitória engraçada celebrando o amor de vocês! Se recusar, recue 1 casa!", penalty: "Piloto sério: Recue 1 casa" },
        { id: 5, question: "Fale 5 apelidos carinhosos bobos que vocês usam (ou poderiam usar) em menos de 10 segundos!", penalty: "Estourou o tempo: Recue 1 casa" }
    ],
    DRS: [ // Purple Cards (DRS)
        { id: 1, question: "Se vocês pudessem viajar amanhã para qualquer lugar do planeta juntos, qual seria o destino? Se não entrarem em acordo, recue!", penalty: "Sem sintonia: Recue 1 casa" },
        { id: 2, question: "Qual é o maior sonho conjunto de longo prazo que vocês pretendem realizar juntos?", penalty: "Sem DRS: Recue 1 casa" },
        { id: 3, question: "Como você imagina a rotina de vocês daqui a 10 anos? Descreva um detalhe fofo do dia-a-dia.", penalty: "Sem visão: Recue 1 casa" },
        { id: 4, question: "Se vocês tivessem um cachorrinho ou gatinho no futuro, qual seria o nome engraçado que gostariam de dar?", penalty: "Sem pets: Recue 1 casa" },
        { id: 5, question: "Qual hábito fofo ou piada interna de vocês você quer que continue igual mesmo quando estiverem velhinhos?", penalty: "Recue 1 casa" }
    ]
};


// --- 2. SOUND SYNTHESIZER (WEB AUDIO API) ---
class SoundSynth {
    constructor() {
        this.ctx = null;
    }
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    playTone(freq, dur, type = "triangle", delay = 0) {
        if (!GAME_STATE.audioEnabled) return;
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
        // Sound of F1 Engine starting up
        this.playTone(150, 0.4, "sawtooth");
        this.playTone(220, 0.3, "sawtooth", 0.2);
        this.playTone(330, 0.6, "sawtooth", 0.4);
    }
    
    playDiceRoll() {
        // Speed roll sound
        for (let i = 0; i < 6; i++) {
            this.playTone(200 + i * 100, 0.1, "sine", i * 0.1);
        }
    }
    
    playStep() {
        // Light jump sound
        this.playTone(440, 0.15, "triangle");
    }
    
    playError() {
        // Failure beep
        this.playTone(180, 0.3, "square");
        this.playTone(130, 0.4, "square", 0.15);
    }

    playSuccess() {
        // Sparkly success chime
        this.playTone(523.25, 0.1, "sine"); // C5
        this.playTone(659.25, 0.1, "sine", 0.1); // E5
        this.playTone(783.99, 0.15, "sine", 0.2); // G5
        this.playTone(1046.50, 0.3, "sine", 0.3); // C6
    }
    
    playVictoryMelody() {
        // High-pitched glorious celebratory melody
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

const AudioPlayer = new SoundSynth();


// --- 3. THREE.JS 3D ENGINE & SCENE GENERATION ---
let scene, camera, renderer, diceMesh, mainHeart;
let starsMesh, finishArchGroup;
let cloudsGroup = [];
let lightPoles = [];
let animationFrameId;

function init3D() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // A. Create Scene & Colors
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0614); // Celestial deep space dark violet
    scene.fog = new THREE.FogExp2(0x0a0614, 0.012);

    // B. Setup Responsive Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Position camera far up and looking diagnostic
    camera.position.set(0, 45, 65);
    camera.lookAt(0, 0, 0);

    // C. Setup WebGL Renderer with High Quality & Antialiasing
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // D. Add Gentle Illumination (Sunset / Neon vibe)
    const ambientLight = new THREE.AmbientLight(0xffe6f0, 0.55); // Pinkish tint
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff99bb, 0.85);
    dirLight.position.set(-20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Neon highlight light
    const pointLight = new THREE.PointLight(0xff1450, 1.4, 120);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // E. Generate Stadium / Ground environment
    createGround();

    // F. Build Heart Racetrack (board path of 50 spaces)
    generateHeartTrack();

    // G. Create 3D Dice Mesh (Faceted)
    createDice();

    // H. Spawn Player F1 Cars (Procedural Low-Poly design)
    spawnCars();

    // I. Rich VR Details: Stars, Clouds, Stadium items
    createCosmicStars();
    createClouds();
    addNeonLightPoles();
    createFinishLineArch();

    // J. Setup Raycaster for Tap Dice interaction
    setupDiceRaycaster();

    // K. Window Resize Handling
    window.addEventListener('resize', onWindowResize);
}

// Generate the beautiful isometric sunset ground and low poly styling
function createGround() {
    // 1. Huge Grid base representing romantic landscape
    const groundGeo = new THREE.PlaneGeometry(150, 150, 16, 16);
    // Manipulate vertices to make subtle romantic low-poly hills!
    const pos = groundGeo.attributes.position;
    for(let i=0; i<pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        // Do not warp center where track is placed
        let dist = Math.sqrt(x*x + y*y);
        if (dist > 30) {
            let heightShift = Math.sin(x*0.1) * Math.cos(y*0.1) * 3 + Math.sin(dist*0.05)*2;
            pos.setZ(i, heightShift);
        }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x221330, // Purple fields
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // 2. Center Rotating 3D Glowing Heart
    const heartGroup = new THREE.Group();
    // Build a solid heart via block primitives
    const boxMat = new THREE.MeshStandardMaterial({
        color: 0xff3355, 
        emissive: 0xff1133, 
        emissiveIntensity: 0.3,
        roughness: 0.2, 
        metalness: 0.8
    });
    
    // Low poly heart built of styled stacked boxes
    const cube1 = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), boxMat);
    cube1.rotation.y = Math.PI/4;
    cube1.position.set(0, 3, 0);
    heartGroup.add(cube1);

    const leftHe = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), boxMat);
    leftHe.position.set(-1.8, 4.2, 0);
    leftHe.rotation.y = Math.PI/4;
    heartGroup.add(leftHe);

    const rightHe = leftHe.clone();
    rightHe.position.set(1.8, 4.2, 0);
    heartGroup.add(rightHe);

    mainHeart = heartGroup;
    mainHeart.position.set(0, 1, 0);
    scene.add(mainHeart);

    // 3. Decorate fields with Cherry-Blossom Trees (Procedural Low Poly)
    for (let i = 0; i < 40; i++) {
        // Pick random hills positioning outside central stadium
        let angle = Math.random() * Math.PI * 2;
        let radius = 35 + Math.random() * 30;
        let pX = Math.cos(angle) * radius;
        let pZ = Math.sin(angle) * radius;

        spawnLowPolyTree(pX, pZ);
    }
}

// Spawns a beautiful, romantic cherry-blossom tree
function spawnLowPolyTree(x, z) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 3, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x472d1a, flatShading: true });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    treeGroup.add(trunk);

    // Leaves / Cherry Blossoms (Pink/Lavender clustered boxes/spheres)
    const clusterMat = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.4 ? 0xff7fb3 : 0xffa3c4,
        roughness: 0.8,
        flatShading: true
    });

    const leaves1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 5, 5), clusterMat);
    leaves1.position.set(0, 3, 0);
    treeGroup.add(leaves1);

    const leaves2 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 4, 4), clusterMat);
    leaves2.position.set(-1, 3.4, 0.5);
    treeGroup.add(leaves2);

    const leaves3 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 4, 4), clusterMat);
    leaves3.position.set(0.8, 2.6, -0.6);
    treeGroup.add(leaves3);

    // Random scale variance
    const randScale = 0.7 + Math.random() * 0.6;
    treeGroup.scale.set(randScale, randScale, randScale);

    scene.add(treeGroup);
}

// Procedural Cosmic starry particle system
function createCosmicStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const positions = [];
    const colors = [];
    for(let i = 0; i < starCount; i++) {
        positions.push(
            Math.random() * 220 - 110,
            40 + Math.random() * 60,
            Math.random() * 220 - 110
        );
        // Soft romantic pink/pastel colors
        colors.push(Math.random() * 0.4 + 0.6, Math.random() * 0.4 + 0.4, 1.0);
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

// Procedural beautiful floating clouds
function createClouds() {
    const cloudGeo = new THREE.DodecahedronGeometry(2, 1);
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffe6f5, transparent: true, opacity: 0.8 });
    
    for(let i=0; i<15; i++) {
        const cloudGroup = new THREE.Group();
        const numParts = 3 + Math.floor(Math.random() * 3);
        for(let j=0; j<numParts; j++) {
            const mesh = new THREE.Mesh(cloudGeo, cloudMat);
            mesh.scale.set(1 + Math.random(), 1 + Math.random(), 1 + Math.random());
            mesh.position.set(j * 1.5 - 1.5, Math.random() * 0.5, Math.random() * 1.5 - 0.75);
            cloudGroup.add(mesh);
        }
        cloudGroup.position.set(
            Math.random() * 140 - 70,
            20 + Math.random() * 14,
            Math.random() * 140 - 70
        );
        cloudGroup.velocity = 0.015 + Math.random() * 0.025;
        scene.add(cloudGroup);
        cloudsGroup.push(cloudGroup);
    }
}

// Neon Light Poles along the Heart track to illuminate specific regions (Amazing VR aesthetic)
function addNeonLightPoles() {
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 6, 5);
    const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 6);
    const bulbGeo = new THREE.SphereGeometry(0.35, 6, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3d2b4f, roughness: 0.5 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1d122a, roughness: 0.2 });
    
    // Distribute poles every 6 spaces
    for (let i = 4; i < GAME_STATE.boardSpacesCount; i += 6) {
        let tilePos = GAME_STATE.positions3D[i].clone();
        let nextIndex = (i + 1) % GAME_STATE.boardSpacesCount;
        let tangent = new THREE.Vector3().subVectors(GAME_STATE.positions3D[nextIndex], GAME_STATE.positions3D[i]).normalize();
        let normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        
        let side = (i % 2 === 0) ? -1 : 1;
        let polePos = tilePos.clone().add(normal.clone().multiplyScalar(side * 3.3));
        polePos.y = 0.1;
        
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
        
        // Point lighting
        const pLight = new THREE.PointLight(isPink ? 0xff00cc : 0x00ffff, 0.9, 14);
        pLight.position.set(0, 6, 0);
        poleGroup.add(pLight);
        
        scene.add(poleGroup);
        lightPoles.push(poleGroup);
    }
}

// Magnificent checkered F1 Start & Finish Line Arch (Pórtico)
function createFinishLineArch() {
    finishArchGroup = new THREE.Group();
    const finishPos = GAME_STATE.positions3D[GAME_STATE.boardSpacesCount - 1].clone();
    finishArchGroup.position.copy(finishPos);
    
    let nextIndex = 0;
    let tangent = new THREE.Vector3().subVectors(GAME_STATE.positions3D[nextIndex], finishPos).normalize();
    let angle = Math.atan2(tangent.x, tangent.z);
    finishArchGroup.rotation.y = angle + Math.PI/2;
    
    const colMat = new THREE.MeshStandardMaterial({ color: 0x3d2b4f, roughness: 0.1, flatShading: true });
    
    // Pillars
    const leftCol = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 9, 6), colMat);
    leftCol.position.set(-4.5, 4.5, 0);
    finishArchGroup.add(leftCol);
    
    const rightCol = leftCol.clone();
    rightCol.position.set(4.5, 4.5, 0);
    finishArchGroup.add(rightCol);
    
    // Checkered banner
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x1d122a, roughness: 0.4, flatShading: true });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 1.5), beamMat);
    beam.position.set(0, 9, 0);
    finishArchGroup.add(beam);
    
    // Heart Shield on beam
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0xff0052 });
    const badgeBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 1.8), badgeMat);
    badgeBox.position.set(0, 9, 0);
    badgeBox.rotation.y = Math.PI/4;
    finishArchGroup.add(badgeBox);
    
    // Neon borders on Arch
    const neonBeamGeo = new THREE.BoxGeometry(10.2, 0.14, 1.6);
    const neonBeamMat = new THREE.MeshBasicMaterial({ color: 0xff0066 });
    const neonB1 = new THREE.Mesh(neonBeamGeo, neonBeamMat);
    neonB1.position.set(0, 8.35, 0);
    finishArchGroup.add(neonB1);
    
    const neonB2 = neonB1.clone();
    neonB2.position.set(0, 9.65, 0);
    finishArchGroup.add(neonB2);
    
    scene.add(finishArchGroup);
}

// Setup dedicated Raycaster for Direct Tap Dice Rolling integration
let raycaster, mouse;
function setupDiceRaycaster() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    const handleTrigger = (clientX, clientY) => {
        if (document.getElementById('card-modal').classList.contains('active')) return;
        if (GAME_STATE.isDiceRolling) return;
        
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(diceMesh);
        
        if (intersects.length > 0) {
            document.getElementById('roll-dice-btn').click();
        }
    };
    
    window.addEventListener('click', (e) => handleTrigger(e.clientX, e.clientY), false);
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            handleTrigger(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, false);
}

// Generate the 50 Board Space Tiles following a heart shape spline
function generateHeartTrack() {
    GAME_STATE.positions3D = [];
    GAME_STATE.tilesMeshes = [];

    // Parametric coordinates of a Heart Curve in 3D:
    // x = 16 * sin^3(t)
    // z = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
    const totalPoints = GAME_STATE.boardSpacesCount;
    
    for (let i = 0; i < totalPoints; i++) {
        // From t = 0 to t = 2*PI, distribute tiles evenly
        let t = (i / totalPoints) * Math.PI * 2;
        
        let x = 16 * Math.pow(Math.sin(t), 3);
        // We flip z to ensure standard camera view looks at the front of heart properly
        let z = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        // Scale and shift track coordinates slightly to fit viewport nicely
        let scaleFactor = 1.4;
        let posX = x * scaleFactor;
        let posZ = z * scaleFactor;
        let posY = 0.1; // Flat track

        GAME_STATE.positions3D.push(new THREE.Vector3(posX, posY, posZ));
    }

    // Now instantiate Board Tiles along coordinates
    const tileGeo = new THREE.BoxGeometry(3.5, 0.3, 3.5);

    // Color Cycle array: RED, YELLOW, BLUE, PURPLE (mapping to 4 event categories)
    const cycle = ['RED', 'YELLOW', 'BLUE', 'PURPLE'];

    for (let i = 0; i < totalPoints; i++) {
        let categoryKey = cycle[i % cycle.length];
        // Ensure starting tile is distinctive (White/Chequered checkered flag)
        let isStart = (i === 0);
        let isFinish = (i === totalPoints - 1);

        let colorValHex = TILE_TYPES[categoryKey].color;
        
        // Create checkered flags texture or color for starting grid
        if (isStart) {
            colorValHex = 0xffffff; // White Start gate
        } else if (isFinish) {
            colorValHex = 0x39ff14; // Neon Green finish line
        }

        const tileMat = new THREE.MeshStandardMaterial({
            color: colorValHex,
            roughness: 0.4,
            metalness: 0.3,
            flatShading: true
        });

        const tileMesh = new THREE.Mesh(tileGeo, tileMat);
        tileMesh.position.copy(GAME_STATE.positions3D[i]);
        tileMesh.receiveShadow = true;
        scene.add(tileMesh);
        GAME_STATE.tilesMeshes.push(tileMesh);

        // Add visual realistic central road dashes (White lines)
        let nextIndex = (i + 1) % totalPoints;
        const dashGeo = new THREE.BoxGeometry(0.12, 0.05, 1.2);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.position.copy(GAME_STATE.positions3D[i]);
        dash.position.y = 0.26; // Placed right on road surface
        dash.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(GAME_STATE.positions3D[i], GAME_STATE.positions3D[nextIndex], new THREE.Vector3(0,1,0)));
        scene.add(dash);

        // Add visual borders/curbs (White & Pink alternating) to the sides
        const curbGeo = new THREE.BoxGeometry(0.5, 0.4, 3.5);
        const curbMat = new THREE.MeshBasicMaterial({
            color: (i % 2 === 0) ? 0xffffff : 0xff66cc
        });
        
        // Calculate tangent vector for curb alignment
        let tangent = new THREE.Vector3().subVectors(GAME_STATE.positions3D[nextIndex], GAME_STATE.positions3D[i]).normalize();
        let normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Right curb
        const rCurb = new THREE.Mesh(curbGeo, curbMat);
        rCurb.position.copy(GAME_STATE.positions3D[i]).add(normal.clone().multiplyScalar(2.0));
        rCurb.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(GAME_STATE.positions3D[i], GAME_STATE.positions3D[nextIndex], new THREE.Vector3(0,1,0)));
        scene.add(rCurb);

        // Left curb
        const lCurb = rCurb.clone();
        lCurb.position.copy(GAME_STATE.positions3D[i]).add(normal.clone().multiplyScalar(-2.0));
        scene.add(lCurb);
    }
}

// Generate procedurally built F1 Low Poly meshes with stylized 3D driver avatars (bonecos)
function createF1Car(bodyColor, playerIndex) {
    const carGroup = new THREE.Group();

    // 1. Core Chassis / Body
    const coreMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.2, metalness: 0.7, flatShading: true });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.8), coreMat);
    chassis.position.y = 0.3;
    chassis.castShadow = true;
    carGroup.add(chassis);

    // 2. Driver cockpit + custom driver avatar (boneco)
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.5), coreMat);
    cockpit.position.set(-0.1, 0.45, 0);
    carGroup.add(cockpit);

    // Torso of Boneco avatar
    const suitColor = (playerIndex === 0) ? 0xee2233 : 0xee55aa;
    const torsoMat = new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.6 });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 5), torsoMat);
    torso.position.set(-0.1, 0.55, 0);
    carGroup.add(torso);

    // Cute small steering wheel!
    const wheelRimMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 5, 10), wheelRimMat);
    wheelRim.position.set(0.18, 0.6, 0);
    wheelRim.rotation.y = Math.PI/2;
    carGroup.add(wheelRim);

    // Little arm low poly limbs holding steering wheel!
    const armMat = new THREE.MeshStandardMaterial({ color: suitColor, flatShading: true });
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.07), armMat);
    lArm.position.set(0.05, 0.58, 0.12);
    lArm.rotation.y = -0.4;
    carGroup.add(lArm);

    const rArm = lArm.clone();
    rArm.position.set(0.05, 0.58, -0.12);
    rArm.rotation.y = 0.4;
    carGroup.add(rArm);

    // Custom helmet based on playerIndex
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

    // Helmet customization (Ribbons for Anny, cool ears for Gabriel)
    const decoMat = new THREE.MeshStandardMaterial({ color: (playerIndex === 0) ? 0xff1493 : 0x00ffff });
    if (playerIndex === 0) {
        // Cute pink hair cones/bows
        const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4), decoMat);
        bowL.position.set(-0.24, 0.96, 0.12);
        bowL.rotation.z = -1;
        carGroup.add(bowL);
        const bowR = bowL.clone();
        bowR.position.set(-0.24, 0.96, -0.12);
        carGroup.add(bowR);
    } else {
        // Cool high poly ears on helmet
        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), decoMat);
        earL.position.set(-0.1, 1.04, 0.1);
        earL.rotation.z = -0.2;
        carGroup.add(earL);
        const earR = earL.clone();
        earR.position.set(-0.1, 1.04, -0.1);
        carGroup.add(earR);
    }

    // 3. Front Wing & Nose cone
    const wingGeo = new THREE.BoxGeometry(0.4, 0.1, 1.4);
    const wing = new THREE.Mesh(wingGeo, coreMat);
    wing.position.set(0.9, 0.15, 0);
    carGroup.add(wing);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.5), coreMat);
    nose.position.set(0.5, 0.3, 0);
    carGroup.add(nose);

    // 4. Rear Wing / Spoiler (Racing F1 look!)
    const spoilerStruts = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.6), coreMat);
    spoilerStruts.position.set(-0.7, 0.45, 0);
    carGroup.add(spoilerStruts);

    const spoilerPlank = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 1.3), coreMat);
    spoilerPlank.position.set(-0.7, 0.7, 0);
    carGroup.add(spoilerPlank);

    // 5. Wheels (Black textured cylinders)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, flatShading: true });
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.38, 8);
    wheelGeo.rotateX(Math.PI / 2);

    const wheelPositions = [
        { x: 0.6, z: 0.55 },  // Front Right
        { x: 0.6, z: -0.55 }, // Front Left
        { x: -0.5, z: 0.55 }, // Back Right
        { x: -0.5, z: -0.55 } // Back Left
    ];

    wheelPositions.forEach(pos => {
        const mw = new THREE.Mesh(wheelGeo, wheelMat);
        mw.position.set(pos.x, 0.25, pos.z);
        mw.castShadow = true;
        carGroup.add(mw);
    });

    // 6. Glowing Floating Heart Above Selection
    const heartIndicator = new THREE.Group();
    const indMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), indMat);
    h1.rotation.set(Math.PI/4, Math.PI/4, 0);
    heartIndicator.add(h1);
    heartIndicator.position.set(0, 1.8, 0);
    carGroup.add(heartIndicator);
    
    // Hold reference to floating indicator for animation later
    carGroup.heartIndicator = heartIndicator;

    // Scale down tiny F1 design
    carGroup.scale.set(1.2, 1.2, 1.2);

    return carGroup;
}

// Spawns the cars on starting grid tile 0
function spawnCars() {
    // Player 1 Engine (Anny index 0)
    GAME_STATE.players[0].mesh = createF1Car(0xff3344, 0); // Passion Scarlet Red
    scene.add(GAME_STATE.players[0].mesh);

    // Player 2 Engine (Gabriel index 1)
    GAME_STATE.players[1].mesh = createF1Car(0xff77bb, 1); // Cute Pastel Pink
    scene.add(GAME_STATE.players[1].mesh);

    // Initialize positions side-by-side on start tile (0)
    repositionCars3D(true); // Instant snap
}

// Adjust 3D coordinates based on board indices smoothly
function repositionCars3D(snapInstant = false) {
    const offsetSide = 1.0; // Avoid car overlapping each other by placing side-by-side
    
    GAME_STATE.players.forEach(p => {
        let currentTileIndex = p.pos;
        let tilePos = GAME_STATE.positions3D[currentTileIndex].clone();

        // Calculate tangent vector along paths to rotate cars correctly facing forwards
        let nextIndex = (currentTileIndex + 1) % GAME_STATE.positions3D.length;
        let nextPos = GAME_STATE.positions3D[nextIndex].clone();
        
        let forward = new THREE.Vector3().subVectors(nextPos, tilePos).normalize();
        let right = new THREE.Vector3(-forward.z, 0, forward.x).normalize();

        // Side shift based on player index
        let multiplier = (p.id === 1) ? -offsetSide : offsetSide;
        let targetPos = tilePos.clone().add(right.clone().multiplyScalar(multiplier * 0.7));
        targetPos.y += 0.2; // Hover slightly above tile

        if (snapInstant) {
            p.mesh.position.copy(targetPos);
            // Face forward along board trajectory
            let lookAtTarget = p.mesh.position.clone().add(forward);
            p.mesh.lookAt(lookAtTarget);
        } else {
            // Animate coordinate transitions smoothly in requestAnimationFrame loop
            p.mesh.targetPos3D = targetPos;
            p.mesh.targetForward3D = forward;
        }
    });
}

// Create 3D Dice Mesh
function createDice() {
    // Cut a low poly 3D cube for the rolling dice
    const diceGeo = new THREE.BoxGeometry(2, 2, 2);
    
    // Standard white dice numbering materials
    const faceColors = [
        0xff3344, // 1: Red
        0xffcc00, // 2: Yellow
        0x0088ff, // 3: Blue
        0xaf40ff, // 4: Purple
        0xff007f, // 5: Pink
        0x39ff14  // 6: Green
    ];
    
    const mats = faceColors.map(color => {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.2,
            metalness: 0.4,
            flatShading: true
        });
    });

    diceMesh = new THREE.Mesh(diceGeo, mats);
    // Position dice in a neat visual bay in local coordinates initially
    diceMesh.position.set(0, 1.5, 0); // Center initially
    diceMesh.castShadow = true;
    scene.add(diceMesh);
}

// Window Responsive resizing
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}


// --- 4. GAME ACTION LOGIC & MOVEMENT ---

// Start button click - transition intro screen away
document.getElementById('start-game-btn').addEventListener('click', () => {
    // Read user custom names
    let n1 = document.getElementById('p1-name').value.trim();
    let n2 = document.getElementById('p2-name').value.trim();

    if (n1) GAME_STATE.players[0].name = n1;
    if (n2) GAME_STATE.players[1].name = n2;

    // Refresh HUD
    document.getElementById('hud-p1-name').innerText = GAME_STATE.players[0].name;
    document.getElementById('hud-p2-name').innerText = GAME_STATE.players[1].name;
    document.getElementById('current-player-name').innerText = GAME_STATE.players[0].name;

    // Hide intro
    document.getElementById('intro-screen').classList.remove('active');
    // Active gameplay hud
    document.getElementById('game-ui').classList.add('active');

    // Play happy engine roar
    AudioPlayer.playEngineStart();
    
    // Set first turn
    updateTurnHUD();
});

function updateTurnHUD() {
    const activePlayer = GAME_STATE.players[GAME_STATE.activePlayerIndex];
    
    // Heading color indicator change
    const nameSpan = document.getElementById('current-player-name');
    nameSpan.innerText = activePlayer.name;
    nameSpan.style.color = activePlayer.color;

    // Left visual avatar turn card change
    const avatar = document.getElementById('next-turn-avatar');
    if (GAME_STATE.activePlayerIndex === 0) {
        avatar.className = 'turn-avatar p1-active';
    } else {
        avatar.className = 'turn-avatar p2-active';
    }

    // Border highlights on HUD scoreboard
    const rows = document.querySelectorAll('.score-row');
    rows.forEach((r, idx) => {
        if(idx === GAME_STATE.activePlayerIndex) {
            r.classList.add('active-border');
        } else {
            r.classList.remove('active-border');
        }
    });

    document.getElementById('turn-announcement').innerText = "Role o Dado!";
}

// Triggering Dice Roll & Physics Animation Simulation
document.getElementById('roll-dice-btn').addEventListener('click', () => {
    if (GAME_STATE.isDiceRolling) return;
    
    GAME_STATE.isDiceRolling = true;
    document.getElementById('roll-dice-btn').disabled = true;
    
    // Play SFX
    AudioPlayer.playDiceRoll();

    // Randomize Dice roll index (1 to 6)
    const stepsToMove = Math.floor(Math.random() * 6) + 1;
    
    // Set 3D Animation variables
    let totalRollDuration = 1800; // ms
    let startTime = Date.now();
    
    let activePlayer = GAME_STATE.players[GAME_STATE.activePlayerIndex];
    let carPos = activePlayer.mesh.position;
    
    // Toss dice near active car
    diceMesh.position.set(carPos.x, carPos.y + 4.0, carPos.z);

    function animateRoll() {
        let elapsed = Date.now() - startTime;
        let t = elapsed / totalRollDuration;
        
        if (t < 1) {
            // Physics simulation of elastic bouncing: dampens on successive bounces
            let bounceHeight = Math.abs(Math.cos(t * Math.PI * 2.5)) * (4.5 * (1 - t));
            diceMesh.position.y = (carPos.y + 0.3) + bounceHeight;
            
            // Speed roll rotation along multiple axes
            diceMesh.rotation.x += 0.45 * (1 - t * 0.45);
            diceMesh.rotation.y += 0.35 * (1 - t * 0.45);
            diceMesh.rotation.z += 0.25 * (1 - t * 0.45);
            
            // Realist squash/stretch on bounce compression impact!
            let squashAmt = 1.0 + Math.sin(t * Math.PI * 5) * 0.16 * (1 - t);
            let checkScale = 1.0 / Math.sqrt(squashAmt);
            diceMesh.scale.set(checkScale, squashAmt, checkScale);
            
            requestAnimationFrame(animateRoll);
        } else {
            // Settle on floor, reset squash
            diceMesh.scale.set(1.1, 1.1, 1.1);
            
            // Dice lands. Snap exact rotation faces based on rolled value (1 to 6)
            snapDiceRotation(stepsToMove);
            diceMesh.position.y = carPos.y + 0.3; // settles near car
            
            // Impact sound
            AudioPlayer.playStep();
            
            // Visual indicators in 2D
            const tagVis = document.getElementById('dice-result-visual');
            const tagNum = document.getElementById('dice-result-num');
            tagNum.innerText = stepsToMove;
            tagVis.classList.remove('scale-out');
            tagVis.classList.add('scale-in');

            // Move the car step-by-step
            setTimeout(() => {
                moveActivePlayer(stepsToMove);
                tagVis.classList.remove('scale-in');
                tagVis.classList.add('scale-out');
            }, 1200);
        }
    }
    
    animateRoll();
});

// Clean mathematical orientations mapping numbers 1-6 skyward
function snapDiceRotation(number) {
    diceMesh.rotation.set(0, 0, 0);
    switch(number) {
        case 1: // Top is red face
            diceMesh.rotation.set(0, 0, 0);
            break;
        case 6: // Bottom is green face
            diceMesh.rotation.set(Math.PI, 0, 0);
            break;
        case 2: // Side Yellow
            diceMesh.rotation.set(Math.PI/2, 0, 0);
            break;
        case 5: // Side Pink
            diceMesh.rotation.set(-Math.PI/2, 0, 0);
            break;
        case 3: // Side Blue
            diceMesh.rotation.set(0, 0, -Math.PI/2);
            break;
        case 4: // Side Purple
            diceMesh.rotation.set(0, 0, Math.PI/2);
            break;
    }
}

// Sequence of hopped steps along the heart track
function moveActivePlayer(totalSteps) {
    let p = GAME_STATE.players[GAME_STATE.activePlayerIndex];
    let stepsTaken = 0;

    function doHop() {
        if (stepsTaken < totalSteps) {
            p.pos++;
            stepsTaken++;

            // Play light landing tone
            AudioPlayer.playStep();

            // Check boundaries
            if (p.pos >= GAME_STATE.boardSpacesCount - 1) {
                p.pos = GAME_STATE.boardSpacesCount - 1; // Cap at end
                repositionCars3D(false);
                triggerVictoryCutscene(p);
                return;
            }

            repositionCars3D(false);
            
            // Schedule next hop
            setTimeout(doHop, 280);
        } else {
            // Movement sequence complete, update positions on scoreboard view
            document.getElementById('p1-pos').innerText = (GAME_STATE.players[0].pos + 1);
            document.getElementById('p2-pos').innerText = (GAME_STATE.players[1].pos + 1);

            // Pop modal event card based on tile category
            setTimeout(() => {
                triggerEventCardModal(p);
            }, 500);
        }
    }

    doHop();
}

function triggerEventCardModal(player) {
    let currentTileIndex = player.pos;
    
    // Avoid modal pop if landing on start
    if (currentTileIndex === 0) {
        passTurn();
        return;
    }

    // Determine card category by tile index
    const cycle = ['RED', 'YELLOW', 'BLUE', 'PURPLE'];
    let categoryKey = cycle[currentTileIndex % cycle.length];
    
    // Select randomized question item
    let db = CHALLENGE_CARDS[categoryKey];
    if (categoryKey === 'PURPLE') db = CHALLENGE_CARDS.DRS; // DRS remapping

    let randomIndex = Math.floor(Math.random() * db.length);
    let selectedCard = db[randomIndex];

    // Set layout elements based on categorical colors
    const modal = document.getElementById('card-modal');
    modal.className = 'modal-overlay active'; // Show overlay
    
    // Clean styling triggers
    const modalContent = modal.querySelector('.card-modal-content');
    modalContent.className = 'card-modal-content'; // reset
    
    let styleClass = 'card-class-red';
    let catTitle = 'História do Casal';
    let catIcon = 'fa-history';

    if (categoryKey === 'YELLOW') {
        styleClass = 'card-class-yellow';
        catTitle = 'Pit Stop (Prenda Romântica)';
        catIcon = 'fa-toolbox';
    } else if (categoryKey === 'BLUE') {
        styleClass = 'card-class-blue';
        catTitle = 'Rádio da Equipe (Declaração)';
        catIcon = 'fa-walkie-talkie';
    } else if (categoryKey === 'PURPLE') {
        styleClass = 'card-class-purple';
        catTitle = 'DRS Ativado (Nosso Futuro)';
        catIcon = 'fa-forward-fast';
    }

    modalContent.classList.add(styleClass);
    document.getElementById('card-category-title').innerText = catTitle;
    document.getElementById('card-class-icon').className = 'fa-solid ' + catIcon;

    // Fill contextual text
    document.getElementById('modal-player-name').innerText = player.name;
    document.getElementById('modal-player-name').className = 'micro-player ' + (player.id === 1 ? 'bg-red' : 'bg-pink');
    document.getElementById('card-prompt-text').innerText = selectedCard.question;
    document.getElementById('card-consequence-text').innerText = selectedCard.penalty;

    // Direct Sync for VR floating billing hologram Card
    document.getElementById('holo-title').innerText = catTitle;
    document.getElementById('holo-txt').innerText = selectedCard.question;

    // Store turn variables for retrieval on confirmation clicks
    GAME_STATE.currentTurnPenalty = selectedCard.penalty;
}

// Card action handlers
document.getElementById('card-action-success').addEventListener('click', () => {
    // Play sound of chime success
    AudioPlayer.playSuccess();
    
    // Direct exit
    closeEventCardModal();
    passTurn();
});

document.getElementById('card-action-fail').addEventListener('click', () => {
    // Play buzzer sad tone
    AudioPlayer.playError();
    
    // Retreat active player by 1 tile!
    closeEventCardModal();
    
    let p = GAME_STATE.players[GAME_STATE.activePlayerIndex];
    if (p.pos > 0) {
        p.pos--;
        repositionCars3D(false);
        // Sync scoreboard
        document.getElementById('p1-pos').innerText = (GAME_STATE.players[0].pos + 1);
        document.getElementById('p2-pos').innerText = (GAME_STATE.players[1].pos + 1);
    }
    
    passTurn();
});

function closeEventCardModal() {
    document.getElementById('card-modal').classList.remove('active');
}

function passTurn() {
    // Switch turn
    GAME_STATE.activePlayerIndex = (GAME_STATE.activePlayerIndex === 0) ? 1 : 0;
    
    // Reset roll button interactivity
    document.getElementById('roll-dice-btn').disabled = false;
    GAME_STATE.isDiceRolling = false;
    
    updateTurnHUD();
}


// --- 5. VICTORY CUTSCENE GRAND FINALE ---
function triggerVictoryCutscene(winner) {
    GAME_STATE.cameraMode = 'podium';
    AudioPlayer.playVictoryMelody();

    // 1. Particle Confetti showers in 2D
    let duration = 6 * 1000;
    let end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    // 2. 3D celebratory elements
    create3DPodiumCelebration();

    // 3. Display glowing neon texts overlay exactly
    setTimeout(() => {
        document.getElementById('podium-screen').classList.add('active');
    }, 1500);
}

// Build a beautiful 3D podium stadium visually at the center
function create3DPodiumCelebration() {
    // Elevate giant heart in center
    if(mainHeart) {
        mainHeart.position.set(0, 4, 0);
        mainHeart.scale.set(1.8, 1.8, 1.8);
    }

    // Put winning car right underneath glowing heart center area
    let activeCar = GAME_STATE.players[GAME_STATE.activePlayerIndex].mesh;
    activeCar.position.set(0, 1.0, 4);
    activeCar.scale.set(2, 2, 2);
    activeCar.rotation.set(0, Math.PI, 0); // Face camera
}

// Restart Game
document.getElementById('btn-restart-game').addEventListener('click', () => {
    // Reset positions
    GAME_STATE.players.forEach(p => {
        p.pos = 0;
    });
    
    document.getElementById('p1-pos').innerText = "1";
    document.getElementById('p2-pos').innerText = "1";
    
    repositionCars3D(true);
    
    GAME_STATE.activePlayerIndex = 0;
    GAME_STATE.isDiceRolling = false;
    GAME_STATE.cameraMode = 'follow';

    // Hide victory
    document.getElementById('podium-screen').classList.remove('active');
    document.getElementById('roll-dice-btn').disabled = false;

    // Restart central stats
    if(mainHeart) {
         mainHeart.position.set(0, 1, 0);
         mainHeart.scale.set(1,1,1);
    }
    
    updateTurnHUD();
});


// --- 6. GLOBAL SOUND TOGGLE ---
document.getElementById('btn-audio-toggle').addEventListener('click', () => {
    GAME_STATE.audioEnabled = !GAME_STATE.audioEnabled;
    const btn = document.getElementById('btn-audio-toggle');
    if (GAME_STATE.audioEnabled) {
        btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        btn.style.background = 'rgba(12, 9, 16, 0.85)';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        btn.style.background = '#ff3344';
    }
});

// Camera orientation changes for visual diagnostic
document.getElementById('btn-camera-toggle').addEventListener('click', () => {
    if (GAME_STATE.cameraMode === 'follow') {
        GAME_STATE.cameraMode = 'orbital';
    } else {
        GAME_STATE.cameraMode = 'follow';
    }
});


// --- 7. MAIN ANIMATION LOOP (LERPING MODIFIERS WITH REAL-TIME VR SCREEN SPACE PROJECTIONS) ---
let timeClock = 0;

// Helper to project 3D coordinate space to 2D screen coordinate pixels
function toScreenPosition(obj, camera, renderer) {
    let vector = new THREE.Vector3();
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    
    // Offset slightly above the mesh center
    vector.y += 3.2;

    vector.project(camera);

    let width = renderer.domElement.clientWidth;
    let height = renderer.domElement.clientHeight;

    let x = (vector.x * 0.5 + 0.5) * width;
    let y = (vector.y * -0.5 + 0.5) * height;

    return { x: x, y: y, z: vector.z };
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    timeClock += 0.015;

    // Core heart spins and floats gracefully
    if (mainHeart) {
        mainHeart.rotation.y += 0.015;
        mainHeart.position.y = 1.0 + Math.sin(timeClock*1.5) * 0.4;
    }

    // Drifting skybox clouds
    cloudsGroup.forEach(c => {
        c.position.x += c.velocity;
        if (c.position.x > 85) {
            c.position.x = -85;
        }
    });

    // Cosmic starry backdrop rotation
    if (starsMesh) {
        starsMesh.rotation.y += 0.0006;
    }

    // Car physical-like floating heart indicator bobbing + engine vibration shake
    GAME_STATE.players.forEach(p => {
        if(p.mesh && p.mesh.heartIndicator) {
            p.mesh.heartIndicator.rotation.y += 0.02;
            p.mesh.heartIndicator.position.y = 1.8 + Math.sin(timeClock*4 + p.id) * 0.15;
        }

        // Smoothly interpolate car positions (movement LERP!)
        if (p.mesh && p.mesh.targetPos3D) {
            p.mesh.position.lerp(p.mesh.targetPos3D, 0.15);
            
            // Interpolate forward angles
            let lookAtTarget = p.mesh.position.clone().add(p.mesh.targetForward3D);
            p.mesh.lookAt(lookAtTarget);

            // Give a cute jump bobble during movement jumps!
            let dist = p.mesh.position.distanceTo(p.mesh.targetPos3D);
            if (dist > 0.1) {
                p.mesh.position.y = 0.2 + Math.sin((dist / 3.5) * Math.PI) * 1.2;
            }
        } else if (p.mesh) {
            // Cute idle engine vibration/shake
            p.mesh.position.y = 0.22 + Math.sin(timeClock * 15 + p.id) * 0.018;
        }
    });

    // Project spatial VR hologram above active car on screen in real-time!
    let activeCar = GAME_STATE.players[GAME_STATE.activePlayerIndex].mesh;
    const holoDiv = document.getElementById('spatial-hologram');
    const modalDiv = document.getElementById('card-modal');
    
    if (activeCar && modalDiv.classList.contains('active')) {
        let pos2D = toScreenPosition(activeCar, camera, renderer);
        holoDiv.style.left = `${pos2D.x}px`;
        holoDiv.style.top = `${pos2D.y}px`;
        holoDiv.classList.add('active');
    } else {
        holoDiv.classList.remove('active');
    }

    // Project Virtual Tap Dice prompts right above the dice when it is ready to roll
    const dicePromptDiv = document.getElementById('dice-tap-prompt');
    const rollBtn = document.getElementById('roll-dice-btn');
    if (diceMesh && !GAME_STATE.isDiceRolling && !rollBtn.disabled && !modalDiv.classList.contains('active')) {
        let dice2D = toScreenPosition(diceMesh, camera, renderer);
        dicePromptDiv.style.left = `${dice2D.x}px`;
        dicePromptDiv.style.top = `${dice2D.y - 15}px`;
        dicePromptDiv.style.display = 'block';
    } else {
        dicePromptDiv.style.display = 'none';
    }

    // Camera follow algorithm (Lerp)
    if (GAME_STATE.cameraMode === 'follow') {
        // Track midpoint or active car
        let curCar = GAME_STATE.players[GAME_STATE.activePlayerIndex].mesh;
        if(curCar) {
            let targetCamPos = new THREE.Vector3(
                curCar.position.x - 12,
                14,
                curCar.position.z + 18
            );
            camera.position.lerp(targetCamPos, 0.05);
            
            // Soft direct focus onto active car
            let targetLook = curCar.position;
            camera.lookAt(targetLook.x, targetLook.y + 1, targetLook.z);
        }
    } else if (GAME_STATE.cameraMode === 'orbital') {
        // Automatically cinematic rotate around racetrack centers
        let lookTarget = new THREE.Vector3(0, 0, 0);
        camera.position.x = Math.sin(timeClock * 0.3) * 45;
        camera.position.z = Math.cos(timeClock * 0.3) * 45;
        camera.position.y = 25;
        camera.lookAt(lookTarget);
    } else if (GAME_STATE.cameraMode === 'podium') {
        // Close tight focus looking upward to winning car in center stadium
        let podiumTarget = new THREE.Vector3(0, 1.2, 4);
        camera.position.lerp(new THREE.Vector3(0, 4.5, 12), 0.04);
        camera.lookAt(podiumTarget);
    }

    renderer.render(scene, camera);
}

// Launch engine!
window.onload = () => {
    // Kill loading overlay
    document.getElementById('loading-screen').classList.remove('active');
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 500);

    // Bootstrap 3D Universe
    init3D();
    
    // Start main animations
    animate();
};
