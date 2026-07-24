// js/strategies/hiddenTriples.js

export function solveHiddenTriples(board, candidates) {
    const units = ['row', 'col', 'box'];

    for (let type of units) {
        for (let i = 0; i < 9; i++) {
            const cellsInUnit = getCellsInUnit(type, i);
            
            const mapNumToCells = {};
            for (let num = 1; num <= 9; num++) {
                mapNumToCells[num] = [];
            }

            for (let idx of cellsInUnit) {
                if (board[idx] === 0) {
                    const cands = candidates[idx];
                    for (let num of cands) {
                        mapNumToCells[num].push(idx);
                    }
                }
            }

            const potentialNumbers = [];
            for (let num = 1; num <= 9; num++) {
                if (mapNumToCells[num].length >= 2 && mapNumToCells[num].length <= 3) {
                    potentialNumbers.push(num);
                }
            }

            for (let a = 0; a < potentialNumbers.length; a++) {
                for (let b = a + 1; b < potentialNumbers.length; b++) {
                    for (let c = b + 1; c < potentialNumbers.length; c++) {
                        const numA = potentialNumbers[a];
                        const numB = potentialNumbers[b];
                        const numC = potentialNumbers[c];

                        const unionCells = new Set([...mapNumToCells[numA], ...mapNumToCells[numB], ...mapNumToCells[numC]]);
                        
                        if (unionCells.size === 3) {
                            const action = tryCleanNoise(candidates, [numA, numB, numC], Array.from(unionCells), type, i);
                            if (action) return action;
                        }
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
        const filteredNotes = currentNotes.filter(n => keepValues.includes(n));
        
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
            reason: `Hidden Triple (${unitNames[unitType]}): Trío oculto [${keepValues.join(',')}] en ${affectedCells.join(', ')}. Se eliminan los demás candidatos.`
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
