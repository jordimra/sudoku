import { getAllCandidates } from '../utils.js';

export function solveHiddenPairs(board, candidates) {
    const units = ['row', 'col', 'box'];

    for (let type of units) {
        for (let i = 0; i < 9; i++) {
            const cellsInUnit = getCellsInUnit(type, i);
            
            // Mapeamos: Número -> [Lista de celdas donde aparece]
            const mapNumToCells = {};
            for (let num = 1; num <= 9; num++) {
                mapNumToCells[num] = [];
            }

            for (let idx of cellsInUnit) {
                const cands = candidates[idx];
                for (let num of cands) {
                    mapNumToCells[num].push(idx);
                }
            }

            // Buscamos números que aparezcan exactamente 2 veces en la unidad
            const potentialNumbers = [];
            for (let num = 1; num <= 9; num++) {
                if (mapNumToCells[num].length === 2) {
                    potentialNumbers.push(num);
                }
            }

            // Buscamos parejas de números que compartan LAS MISMAS 2 celdas
            for (let a = 0; a < potentialNumbers.length; a++) {
                for (let b = a + 1; b < potentialNumbers.length; b++) {
                    const numA = potentialNumbers[a];
                    const numB = potentialNumbers[b];
                    
                    const cellsA = mapNumToCells[numA]; // Ej: [4, 8]
                    const cellsB = mapNumToCells[numB]; // Ej: [4, 8]

                    if (JSON.stringify(cellsA) === JSON.stringify(cellsB)) {
                        // ¡ENCONTRADO HIDDEN PAIR!
                        // Los números numA y numB SOLO pueden ir en cellsA[0] y cellsA[1].
                        // Por tanto, podemos borrar CUALQUIER OTRO candidato de esas dos celdas.
                        
                        const idx1 = cellsA[0];
                        const idx2 = cellsA[1];
                        
                        // Acción: Limpiar "ruido" en esas celdas
                        const action = tryCleanNoise(candidates, [numA, numB], [idx1, idx2], type, i);
                        if (action) return action;
                    }
                }
            }
        }
    }
    return null;
}

function tryCleanNoise(allCandidates, keepValues, scopeCells, unitType, unitIndex) {
    let modified = false;
    let newCandidates = allCandidates.map(c => [...c]);
    let affectedCells = [];

    for (let idx of scopeCells) {
        const currentNotes = newCandidates[idx];
        // Filtramos: Nos quedamos SOLO con los valores de la pareja oculta
        const filteredNotes = currentNotes.filter(n => keepValues.includes(n));
        
        // Si al filtrar, la longitud cambia, es que hemos borrado basura
        if (filteredNotes.length !== currentNotes.length) {
            newCandidates[idx] = filteredNotes;
            modified = true;
            affectedCells.push(getCoord(idx));
        }
    }

    if (modified) {
        const unitNames = { 'row': 'Fila', 'col': 'Columna', 'box': 'Caja' };
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `Hidden Pair (${unitNames[unitType]}): Pareja oculta [${keepValues.join(',')}] en ${affectedCells.join(' y ')}. Se eliminan los demás candidatos.`
        };
    }
    return null;
}

function getCellsInUnit(type, index) {
    let cells = [];
    if (type === 'row') for(let c=0; c<9; c++) cells.push(index * 9 + c);
    else if (type === 'col') for(let r=0; r<9; r++) cells.push(r * 9 + index);
    else {
        let startRow = Math.floor(index / 3) * 3;
        let startCol = (index % 3) * 3;
        for(let r=0; r<3; r++) for(let c=0; c<3; c++) cells.push((startRow + r) * 9 + (startCol + c));
    }
    return cells;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}