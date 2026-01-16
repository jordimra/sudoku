import { isValid, getAllCandidates } from './utils.js';

// ESTRATEGIAS
import { solveNoteCleaner } from './strategies/noteCleaner.js';
import { solveNakedSingle } from './strategies/nakedSingle.js';
import { solveHiddenSingle } from './strategies/hiddenSingle.js';
import { solveIntersectionRemoval } from './strategies/intersectionRemoval.js';
import { solveNakedPairs } from './strategies/nakedPairs.js';
import { solveHiddenPairs } from './strategies/hiddenPairs.js';
import { solveNakedTriples } from './strategies/nakedTriples.js';
import { solveNakedQuads } from './strategies/nakedQuads.js';
import { solveXYWing } from './strategies/xyWing.js';
import { solveXYZWing } from './strategies/xyzWing.js';
import { solveSkyscraper } from './strategies/skyscraper.js';
import { solveXWing } from './strategies/xWing.js';
import { solveSwordfish } from './strategies/swordfish.js';
import { solveUniqueRectangle } from './strategies/uniqueRectangle.js';
import { solveBacktracking, hasUniqueSolution } from './strategies/backtracking.js';

// --- ESTADO ---
let board = Array(81).fill(0);
let initialBoard = Array(81).fill(0);
let globalCandidates = Array(81).fill().map(() => []);
let historyStack = [];
let selectedCellIndex = null;
let noteMode = false;
let isGameWon = false;

const strategies = [
    { name: "Limpieza de Notas", fn: solveNoteCleaner },
    { name: "Naked Single", fn: solveNakedSingle },
    { name: "Hidden Single", fn: solveHiddenSingle },
    { name: "Intersección", fn: solveIntersectionRemoval },
    { name: "Naked Pair", fn: solveNakedPairs },
    { name: "Hidden Pair", fn: solveHiddenPairs },
    { name: "Naked Triple", fn: solveNakedTriples },
    { name: "Naked Quad", fn: solveNakedQuads },
    { name: "Rascacielos", fn: solveSkyscraper },
    { name: "XY-Wing", fn: solveXYWing },
    { name: "XYZ-Wing", fn: solveXYZWing },
    { name: "X-Wing", fn: solveXWing },
    { name: "Swordfish", fn: solveSwordfish },
    { name: "Unique Rectangle", fn: solveUniqueRectangle }
];

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    generateSudoku();
});

function setupEventListeners() {
    document.getElementById('btn-new').onclick = generateSudoku;
    // NUEVO LISTENER REINICIAR
    document.getElementById('btn-reset').onclick = resetGame;
    
    document.getElementById('btn-step').onclick = solveStepByStep;
    document.getElementById('btn-auto').onclick = solveInstant;
    document.getElementById('btn-calc-notes').onclick = forceRecalculateNotes;
    document.getElementById('btn-undo').onclick = undoLastStep;
    document.getElementById('btn-notes').onclick = toggleNoteMode;

    document.getElementById('btn-export').onclick = exportGame;
    document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = handleFileUpload;

    document.addEventListener('keydown', (e) => {
        if (selectedCellIndex === null) return;
        if (e.key >= '1' && e.key <= '9') inputNumber(parseInt(e.key));
        if (e.key === 'Backspace' || e.key === 'Delete') inputNumber(0);
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') undoLastStep();
    });

    window.selectCell = selectCell;
    window.inputNumber = inputNumber;
}

// --- LÓGICA DE REINICIO ---
function resetGame() {
    if (!confirm("¿Estás seguro de que quieres reiniciar este tablero? Perderás todo el progreso actual.")) {
        return;
    }

    // 1. Restaurar tablero al estado inicial (copia profunda)
    board = [...initialBoard];
    
    // 2. Limpiar notas y estados
    globalCandidates = Array(81).fill().map(() => []);
    historyStack = []; // Vaciamos historial porque empezamos de cero
    isGameWon = false;
    
    // 3. Restaurar UI
    document.getElementById('board').classList.remove('game-won');
    toggleSolverButtons(true); // Reactivar botones si estaban bloqueados
    clearHighlights();
    
    // 4. Repintar
    restoreVisuals();
    renderHistory(); // Esto mostrará "Historial vacío"
    
    // 5. Registrar acción inicial
    recordAction('algo', 'Tablero Reiniciado', []);
}

// ... (RESTO DEL CÓDIGO IGUAL: inputNumber, updateBoardValidation, checkWinCondition, etc.) ...

function inputNumber(num) {
    if (isGameWon) return; 

    if (selectedCellIndex === null) return;
    if (initialBoard[selectedCellIndex] !== 0) {
        highlightSameNumbers(board[selectedCellIndex]);
        return;
    }

    const idx = selectedCellIndex;
    const cellDiv = document.querySelector(`.cell[data-index='${idx}']`);
    const coord = getCoordinate(idx);
    
    const oldVal = board[idx];
    const oldNotes = [...globalCandidates[idx]];
    let newVal = oldVal;
    let newNotes = [...oldNotes];

    if (noteMode) {
        if (num === 0) newNotes = [];
        else {
            if (newNotes.includes(num)) newNotes = newNotes.filter(n => n !== num);
            else { newNotes.push(num); newNotes.sort((a,b)=>a-b); }
        }
        globalCandidates[idx] = newNotes;
        renderCellNotes(cellDiv, newNotes);
        
        recordAction('notes', `Nota manual: ${num===0?'Borrar':num} en ${coord}`, [{index: idx, oldVal: 0, newVal: 0, oldNotes: oldNotes, newNotes: newNotes}]);
        if (num !== 0) highlightSameNumbers(num);

    } else {
        if (oldVal === num) {
            highlightSameNumbers(num);
            return; 
        }

        newVal = num;
        newNotes = [];
        board[idx] = newVal;
        globalCandidates[idx] = newNotes;
        updateCellVisual(cellDiv, newVal);
        
        recordAction('manual', `Manual: ${num} en celda ${coord}`, [{index: idx, oldVal: oldVal, newVal: newVal, oldNotes: oldNotes, newNotes: newNotes}]);
        
        updateBoardValidation();
        checkWinCondition(false); 
        
        if (newVal !== 0) highlightSameNumbers(newVal);
        else clearHighlights();
    }
}

function updateBoardValidation() {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('error'));
    let errors = new Set();
    const units = [];
    for(let i=0; i<9; i++) {
        let indices = []; for(let c=0; c<9; c++) indices.push(i*9 + c);
        units.push(indices);
    }
    for(let i=0; i<9; i++) {
        let indices = []; for(let r=0; r<9; r++) indices.push(r*9 + i);
        units.push(indices);
    }
    for(let b=0; b<9; b++) {
        let indices = [];
        let startR = Math.floor(b/3)*3, startC = (b%3)*3;
        for(let r=0; r<3; r++) for(let c=0; c<3; c++) indices.push((startR+r)*9 + (startC+c));
        units.push(indices);
    }

    units.forEach(unit => {
        let seen = {};
        unit.forEach(idx => {
            let val = board[idx];
            if (val !== 0) {
                if (seen[val]) {
                    errors.add(idx);
                    errors.add(seen[val]);
                } else {
                    seen[val] = idx;
                }
            }
        });
    });

    errors.forEach(idx => {
        const cell = document.querySelector(`.cell[data-index='${idx}']`);
        if (cell) cell.classList.add('error');
    });
}

function toggleSolverButtons(enable) {
    const ids = ['btn-calc-notes', 'btn-step', 'btn-auto'];
    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = !enable;
    });
}

function checkWinCondition(silent = false) {
    if (board.includes(0)) return;
    const errors = document.querySelectorAll('.cell.error');
    if (errors.length > 0) return;

    isGameWon = true;
    const boardDiv = document.getElementById('board');
    boardDiv.classList.add('game-won');
    
    toggleSolverButtons(false); 

    if (!silent) {
        setTimeout(() => alert("¡FELICIDADES! Has completado el Sudoku correctamente."), 100);
    }
}

function highlightSameNumbers(number) {
    clearHighlights();
    if (number === 0 || number === null) return;

    document.querySelectorAll('.cell').forEach(cell => {
        const idx = parseInt(cell.dataset.index);
        if (board[idx] === number) {
            cell.classList.add('highlight-val');
        }
        if (board[idx] === 0 && globalCandidates[idx].includes(number)) {
            cell.classList.add('highlight-note');
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('highlight-val', 'highlight-note');
    });
}

function selectCell(element) {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
    selectedCellIndex = parseInt(element.dataset.index);
    element.classList.add('selected');

    const val = board[selectedCellIndex];
    if (val !== 0) {
        highlightSameNumbers(val);
    } else {
        clearHighlights();
    }
}

function toggleNoteMode() {
    noteMode = !noteMode;
    const btn = document.getElementById('btn-notes');
    btn.innerText = `Modo Notas: ${noteMode ? 'ON' : 'OFF'}`;
    btn.classList.toggle('active', noteMode);
}

function undoLastStep() {
    if (historyStack.length === 0) return;
    isGameWon = false;
    document.getElementById('board').classList.remove('game-won');
    toggleSolverButtons(true);

    const lastAction = historyStack.pop();
    lastAction.changes.forEach(change => {
        const { index, oldVal, oldNotes } = change;
        board[index] = oldVal;
        globalCandidates[index] = [...oldNotes];
        const cell = document.querySelector(`.cell[data-index='${index}']`);
        if(cell) {
            updateCellVisual(cell, oldVal);
            renderCellNotes(cell, globalCandidates[index]);
        }
    });
    
    renderHistory();
    updateBoardValidation();
    clearHighlights();
}

function updateCellVisual(cell, value) {
    const span = cell.querySelector('.value');
    span.innerText = value === 0 ? '' : value;
    cell.querySelector('.notes').innerHTML = ''; 
    cell.classList.remove('solved', 'highlight', 'error');
    if (value !== 0 && !cell.classList.contains('initial')) {
        cell.classList.add('solved');
    }
}

function renderCellNotes(cellDiv, candidatesArray) {
    const notesContainer = cellDiv.querySelector('.notes');
    notesContainer.innerHTML = ''; 
    candidatesArray.forEach(num => {
        const span = document.createElement('div');
        span.classList.add('note-item');
        span.innerText = num;
        span.style.gridRow = Math.ceil(num / 3);
        span.style.gridColumn = (num - 1) % 3 + 1;
        notesContainer.appendChild(span);
    });
}

function generateSudoku() {
    isGameWon = false;
    document.getElementById('board').classList.remove('game-won');
    toggleSolverButtons(true); 
    
    board.fill(0);
    initialBoard.fill(0);
    globalCandidates = Array(81).fill().map(() => []);
    historyStack = [];
    renderHistory();
    clearHighlights();

    document.querySelectorAll('.cell').forEach(c => {
        c.querySelector('.value').innerText = '';
        c.classList.remove('initial', 'solved', 'highlight', 'selected', 'error', 'highlight-val', 'highlight-note');
        c.querySelector('.notes').innerHTML = '';
    });

    let firstRow = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
    for(let i=0; i<9; i++) board[i] = firstRow[i];
    solveBacktracking(board); 

    const difficultySelect = document.getElementById('difficulty-selector');
    let holesToDig = parseInt(difficultySelect.value) || 40; 
    let attempts = Array.from({length: 81}, (_, i) => i);
    attempts.sort(() => Math.random() - 0.5);
    let dug = 0;
    
    for (let i of attempts) {
        if (dug >= holesToDig) break;
        let backup = board[i];
        board[i] = 0; 
        if (hasUniqueSolution([...board])) {
            dug++;
        } else {
            board[i] = backup;
        }
    }

    initialBoard = [...board];
    board.forEach((val, idx) => {
        if (val !== 0) {
            const cell = document.querySelector(`.cell[data-index='${idx}']`);
            cell.querySelector('.value').innerText = val;
            cell.classList.add('initial');
        }
    });

    const diffName = difficultySelect.options[difficultySelect.selectedIndex].text;
    const actualHoles = board.filter(x => x===0).length;
    recordAction('algo', `Nuevo Juego (${diffName}). Huecos: ${actualHoles}`, []);
}

function forceRecalculateNotes() {
    const realCandidates = getAllCandidates(board);
    globalCandidates = realCandidates;
    document.querySelectorAll('.cell').forEach(cell => {
        const idx = parseInt(cell.dataset.index);
        if (board[idx] === 0) renderCellNotes(cell, globalCandidates[idx]);
    });
    recordAction('notes', 'Reinicio Manual: Todas las notas recalculadas', []);
}

function solveStepByStep() {
    for (let strat of strategies) {
        const result = strat.fn(board, globalCandidates);
        if (result) {
            applyStep(result, strat.name);
            return; 
        }
    }
    console.log("Ninguna estrategia encontró movimientos.");
}

function applyStep(result, stratName) {
    if (result.type === 'NOTES_UPDATE') {
        let changes = [];
        for(let i=0; i<81; i++) {
            if (JSON.stringify(globalCandidates[i]) !== JSON.stringify(result.candidates[i])) {
                changes.push({
                    index: i, oldVal: board[i], newVal: board[i],
                    oldNotes: [...globalCandidates[i]], newNotes: result.candidates[i]
                });
            }
        }
        globalCandidates = result.candidates;
        changes.forEach(ch => {
            if (board[ch.index] === 0) {
                const cell = document.querySelector(`.cell[data-index='${ch.index}']`);
                if(cell) renderCellNotes(cell, globalCandidates[ch.index]);
            }
        });
        recordAction('notes', `${stratName}: ${result.reason}`, changes);
        return;
    }

    const { index, value, reason } = result;
    const oldNotes = [...globalCandidates[index]];
    const coord = getCoordinate(index);
    board[index] = value;
    globalCandidates[index] = [];
    const cell = document.querySelector(`.cell[data-index='${index}']`);
    if(cell) {
        updateCellVisual(cell, value);
        cell.classList.add('highlight');
    }
    recordAction('algo', `${stratName}: Puesto ${value} en ${coord}. ${reason}`, [{index: index, oldVal: 0, newVal: value, oldNotes: oldNotes, newNotes: []}]);
    
    checkWinCondition(true);
}

function solveInstant() {
    let tempBoard = [...board];
    if (solveBacktracking(tempBoard)) {
        let changes = [];
        for (let i = 0; i < 81; i++) {
            if (board[i] !== tempBoard[i]) {
                changes.push({index: i, oldVal: board[i], newVal: tempBoard[i], oldNotes: [...globalCandidates[i]], newNotes: []});
            }
        }
        board = tempBoard;
        globalCandidates = Array(81).fill().map(() => []);
        board.forEach((val, idx) => {
            const cell = document.querySelector(`.cell[data-index='${idx}']`);
            if (val !== 0) updateCellVisual(cell, val);
        });
        if (changes.length > 0) recordAction('algo', 'Resolución Instantánea', changes);
        checkWinCondition(true);

    } else {
        alert("Sin solución.");
    }
}

function exportGame() {
    const includeValues = document.getElementById('chk-save-values')?.checked ?? true;
    const includeNotes = document.getElementById('chk-save-notes')?.checked ?? true;
    const includeHistory = document.getElementById('chk-save-history')?.checked ?? true;

    const boardToSave = includeValues ? board : [...initialBoard];
    const candidatesToSave = includeNotes ? globalCandidates : Array(81).fill().map(() => []);
    const historyToSave = includeHistory ? historyStack : [];

    const gameState = {
        date: new Date().toISOString(),
        board: boardToSave,
        initialBoard: initialBoard,
        candidates: candidatesToSave,
        history: historyToSave
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    
    const dateStr = new Date().toISOString().slice(0,10);
    const suffix = includeValues ? "" : "_clean";
    downloadAnchorNode.setAttribute("download", `sudoku_${dateStr}${suffix}.json`);
    
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const wantValues = document.getElementById('chk-save-values')?.checked ?? true;
    const wantNotes = document.getElementById('chk-save-notes')?.checked ?? true;
    const wantHistory = document.getElementById('chk-save-history')?.checked ?? true;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const state = JSON.parse(e.target.result);
            if (!state.board || !state.initialBoard || !state.candidates) throw new Error("Formato incorrecto");

            initialBoard = state.initialBoard;
            if (wantValues) board = state.board;
            else board = [...state.initialBoard]; 
            
            if (wantNotes) globalCandidates = state.candidates;
            else globalCandidates = Array(81).fill().map(() => []);

            if (wantHistory) historyStack = state.history || [];
            else historyStack = [];

            restoreVisuals();
            renderHistory();
            
            isGameWon = false;
            document.getElementById('board').classList.remove('game-won');
            toggleSolverButtons(true);

            updateBoardValidation();
            checkWinCondition(true); 
            
            alert("Partida cargada correctamente.");

        } catch (error) {
            alert("Error: " + error.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function restoreVisuals() {
    document.querySelectorAll('.cell').forEach(cell => {
        const idx = parseInt(cell.dataset.index);
        const val = board[idx];
        const isInit = initialBoard[idx] !== 0;

        cell.classList.remove('initial', 'solved', 'highlight', 'selected', 'error', 'highlight-val', 'highlight-note');
        
        const span = cell.querySelector('.value');
        span.innerText = val !== 0 ? val : '';

        if (isInit) cell.classList.add('initial');
        else if (val !== 0) cell.classList.add('solved');

        renderCellNotes(cell, globalCandidates[idx]);
    });
}

function getCoordinate(index) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    return "ABCDEFGHI"[row] + (col + 1);
}

function recordAction(type, description, changes) {
    historyStack.push({ type, description, changes });
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('sudoku-history-log');
    if (!container) return;
    container.innerHTML = ''; 
    if (historyStack.length === 0) {
        container.innerHTML = '<div class="history-item empty">Historial vacío</div>';
        return;
    }
    historyStack.forEach(action => {
        const div = document.createElement('div');
        div.className = `history-item ${action.type}`;
        let title = action.description;
        let desc = "";
        if(action.description.includes(':')) {
            const parts = action.description.split(':');
            title = parts[0];
            desc = parts.slice(1).join(':');
        }
        div.innerHTML = `<strong>${title}</strong><span>${desc}</span>`;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}