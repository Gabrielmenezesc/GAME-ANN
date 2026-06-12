import { playersList, repositionCars } from './players.js';
import { CHALLENGE_CARDS, TILE_TYPES } from './cards.js';
import { AudioPlayer, camera } from './scene.js';
import { diceMesh, simulateDiceRoll } from './physics.js';
import { positions3D } from './board.js';
import { triggerFinalCutscene } from './cutscene.js';

export const GAME_STATE = {
    activePlayerIndex: 0,
    isDiceRolling: false,
    cameraMode: 'follow', // follow, orbital, podium
    currentTurnPenalty: ""
};

export function setupUIHandlers() {
    const startBtn = document.getElementById('start-game-btn');
    const rollBtn = document.getElementById('rollDice');
    
    const cardModal = document.getElementById('challengeModal');
    const btnSuccess = document.getElementById('btn-challenge-success');
    const btnFail = document.getElementById('btn-challenge-fail');
    const restartBtn = document.getElementById('btn-restart-game');
    const audioBtn = document.getElementById('btn-audio-toggle');
    const cameraBtn = document.getElementById('btn-camera-toggle');

    // 1. Game Onboarding Starts
    startBtn.addEventListener('click', () => {
        let n1 = document.getElementById('p1-name').value.trim();
        let n2 = document.getElementById('p2-name').value.trim();

        if (n1) playersList[0].name = n1;
        if (n2) playersList[1].name = n2;

        document.getElementById('hud-p1-name').innerText = playersList[0].name;
        document.getElementById('hud-p2-name').innerText = playersList[1].name;
        document.getElementById('current-player-name').innerText = playersList[0].name;

        document.getElementById('intro-screen').classList.remove('active');
        document.getElementById('loading-screen').classList.remove('active');

        AudioPlayer.playEngineStart();
        updateTurnHUD();
    });

    // 2. Roll Dice Execution Trigger
    rollBtn.addEventListener('click', () => {
        if (GAME_STATE.isDiceRolling) return;
        
        GAME_STATE.isDiceRolling = true;
        rollBtn.disabled = true;

        const activePlayer = playersList[GAME_STATE.activePlayerIndex];
        const carPos = activePlayer.mesh.position;
        
        const rolledSteps = Math.floor(Math.random() * 6) + 1;

        simulateDiceRoll(rolledSteps, carPos, (steps) => {
            // Dice settling aftermath: move the active car!
            moveActivePlayer(steps);
        });
    });

    // 3. Challenge success validation
    btnSuccess.addEventListener('click', () => {
        cardModal.classList.remove('active');
        AudioPlayer.playSuccess();
        triggerConfettiSplashes(0.15);
        passTurn();
    });

    // 4. Challenge failure validation
    btnFail.addEventListener('click', () => {
        cardModal.classList.remove('active');
        AudioPlayer.playError();
        
        // Execute card penalty movement
        const activePlayer = playersList[GAME_STATE.activePlayerIndex];
        let originalPos = activePlayer.pos;
        
        let targetPos = Math.max(0, originalPos - 1);
        activePlayer.pos = targetPos;
        repositionCars(false);
        
        document.getElementById(`p${activePlayer.id}-pos`).innerText = targetPos + 1;
        
        passTurn();
    });

    // 5. Camera follow mode toggle
    cameraBtn.addEventListener('click', () => {
        if (GAME_STATE.cameraMode === 'follow') {
            GAME_STATE.cameraMode = 'orbital';
            AudioPlayer.playStep();
        } else {
            GAME_STATE.cameraMode = 'follow';
            AudioPlayer.playStep();
        }
    });

    // 6. Sound active Mute toggler
    audioBtn.addEventListener('click', () => {
        AudioPlayer.audioEnabled = !AudioPlayer.audioEnabled;
        const icon = audioBtn.querySelector('i');
        if (AudioPlayer.audioEnabled) {
            icon.className = "fa-solid fa-volume-up";
            AudioPlayer.playStep();
        } else {
            icon.className = "fa-solid fa-volume-mute";
        }
    });

    // 7. Play again restart loop
    restartBtn.addEventListener('click', () => {
        location.reload();
    });

    setupRaycasterTapDice();
}

// Coordinate 3D raycasting taps on the dice mesh to roll it immediately (VR feeling!)
function setupRaycasterTapDice() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const tryTap = (cx, cy) => {
        if (document.getElementById('challengeModal').classList.contains('active')) return;
        if (GAME_STATE.isDiceRolling) return;
        
        mouse.x = (cx / window.innerWidth) * 2 - 1;
        mouse.y = -(cy / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(diceMesh);
        
        if (intersects.length > 0) {
            document.getElementById('rollDice').click();
        }
    };

    window.addEventListener('click', (e) => tryTap(e.clientX, e.clientY));
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            tryTap(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
}

// Incremental steps animator for independent car progression along spline track
function moveActivePlayer(steps) {
    const activePlayer = playersList[GAME_STATE.activePlayerIndex];
    let spacesLeft = steps;
    
    function singleJumpStep() {
        if (spacesLeft <= 0) {
            onReachDestination();
            return;
        }
        
        activePlayer.pos = Math.min(positions3D.length - 1, activePlayer.pos + 1);
        document.getElementById(`p${activePlayer.id}-pos`).innerText = activePlayer.pos + 1;
        
        AudioPlayer.playStep();
        repositionCars(false);
        spacesLeft--;

        // Check if crossed the line!
        if (activePlayer.pos >= positions3D.length - 1) {
            triggerFinalCelebration();
            return;
        }

        setTimeout(singleJumpStep, 250); // Jump cadence
    }
    
    singleJumpStep();
}

function onReachDestination() {
    // Reveal challenge details!
    const activePlayer = playersList[GAME_STATE.activePlayerIndex];
    const curIndex = activePlayer.pos;
    
    // Check if on start
    if (curIndex === 0) {
        GAME_STATE.isDiceRolling = false;
        document.getElementById('rollDice').disabled = false;
        return;
    }

    // Determine category based on tile index map
    const tileTypeIdx = curIndex % 4;
    const info = TILE_TYPES[tileTypeIdx];
    
    // Choose random challenge card from chosen array category
    const list = CHALLENGE_CARDS[info.cat];
    const pickedCard = list[Math.floor(Math.random() * list.length)];

    // Open Modal HUD
    const modal = document.getElementById('challengeModal');
    const header = document.getElementById('modal-header-banner');
    const icon = document.getElementById('challenge-icon');
    const title = document.getElementById('challenge-title');
    const nameLabel = document.getElementById('modal-player-name');
    const textPrompt = document.getElementById('challengeText');
    const penaltyLabel = document.getElementById('penalty-text');

    header.className = `modal-header ${info.styleClass}`;
    icon.className = `fa-solid ${info.icon}`;
    title.innerText = info.label;
    
    nameLabel.innerText = activePlayer.name;
    nameLabel.style.backgroundColor = activePlayer.color;
    
    textPrompt.innerText = pickedCard.question;
    penaltyLabel.innerText = pickedCard.penalty;

    modal.classList.add('active');

    // Hologram projection sync!
    document.getElementById('holo-title').innerText = info.label;
    document.getElementById('holo-txt').innerText = pickedCard.question;
}

function passTurn() {
    // Next player turn alternating rotation
    GAME_STATE.activePlayerIndex = (GAME_STATE.activePlayerIndex + 1) % playersList.length;
    updateTurnHUD();
    
    GAME_STATE.isDiceRolling = false;
    document.getElementById('rollDice').disabled = false;
}

function updateTurnHUD() {
    const activePlayer = playersList[GAME_STATE.activePlayerIndex];
    
    const display = document.getElementById('current-player-name');
    display.innerText = activePlayer.name;
    display.style.color = activePlayer.color;

    const cardsRow1 = document.querySelector('.p1-row');
    const cardsRow2 = document.querySelector('.p2-row');
    if (GAME_STATE.activePlayerIndex === 0) {
        cardsRow1.classList.add('active-border');
        cardsRow2.classList.remove('active-border');
    } else {
        cardsRow2.classList.add('active-border');
        cardsRow1.classList.remove('active-border');
    }
}

function triggerFinalCelebration() {
    // Disable HUD
    document.getElementById('ui').style.display = 'none';
    GAME_STATE.cameraMode = 'podium';
    triggerFinalCutscene();
}

function triggerConfettiSplashes(ratio = 0.25) {
    confetti({
        particleCount: Math.floor(100 * ratio),
        spread: 70,
        origin: { y: 0.6 }
    });
}
