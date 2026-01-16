export function solveNakedTriples(board, candidates) {
    const units = ['row', 'col', 'box'];

    for (let type of units) {
        for (let i = 0; i < 9; i++) {
            const cellsInUnit = getCellsInUnit(type, i);
            
            // Solo celdas con 2 o 3 candidatos
            const potentialCells = cellsInUnit.filter(idx => {
                const len = candidates[idx].length;
                return len === 2 || len === 3;
            });

            if (potentialCells.length < 3) continue;

            for (let a = 0; a < potentialCells.length; a++) {
                for (let b = a + 1; b < potentialCells.length; b++) {
                    for (let c = b + 1; c < potentialCells.length; c++) {
                        const idxA = potentialCells[a];
                        const idxB = potentialCells[b];
                        const idxC = potentialCells[c];

                        const union = new Set([
                            ...candidates[idxA], 
                            ...candidates[idxB], 
                            ...candidates[idxC]
                        ]);

                        if (union.size === 3) {
                            const values = [...union].sort((x,y)=>x-y);
                            const action = tryEliminate(candidates, values, cellsInUnit, [idxA, idxB, idxC], type, i);
                            if (action) {
                                console.log(`💡 NAKED TRIPLE encontrado en ${type} ${i}:`, values);
                                return action;
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}

function tryEliminate(allCandidates, valuesToRemove, scopeCells, protectCells, unitType, unitIndex) {
    let modified = false;
    let newCandidates = allCandidates.map(c => [...c]);
    let affectedCells = [];

    for (let idx of scopeCells) {
        if (!protectCells.includes(idx)) {
            const originalNotes = newCandidates[idx];
            const filteredNotes = originalNotes.filter(n => !valuesToRemove.includes(n));
            
            if (filteredNotes.length !== originalNotes.length) {
                newCandidates[idx] = filteredNotes;
                modified = true;
                affectedCells.push(getCoord(idx));
            }
        }
    }

    if (modified) {
        const unitNames = { 'row': 'Fila', 'col': 'Columna', 'box': 'Caja' };
        const coords = protectCells.map(getCoord).join(', ');
        const vals = valuesToRemove.join(',');
        
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `Naked Triple (${unitNames[unitType]}): Trío [${vals}] en ${coords}. Se eliminan de: ${affectedCells.join(', ')}`
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
    const row = Math.floor(index / 9);
    const col = index % 9;
    return "ABCDEFGHI"[row] + (col + 1);
}