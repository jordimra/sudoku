export function solveNakedPairs(board, candidates) {
    const units = ['row', 'col', 'box'];
    
    for (let type of units) {
        for (let i = 0; i < 9; i++) {
            const cellsInUnit = getCellsInUnit(type, i);
            
            // Filtramos celdas con exactamente 2 candidatos
            const potentialPairs = cellsInUnit.filter(idx => candidates[idx].length === 2);

            for (let a = 0; a < potentialPairs.length; a++) {
                for (let b = a + 1; b < potentialPairs.length; b++) {
                    const idxA = potentialPairs[a];
                    const idxB = potentialPairs[b];

                    // Ordenamos para asegurar que [5,8] sea igual a [8,5]
                    const candsA = [...candidates[idxA]].sort((x, y) => x - y);
                    const candsB = [...candidates[idxB]].sort((x, y) => x - y);

                    if (JSON.stringify(candsA) === JSON.stringify(candsB)) {
                        // Encontrada posible pareja. Verificamos si elimina algo.
                        const action = tryEliminate(candidates, candsA, cellsInUnit, [idxA, idxB], type, i);
                        if (action) {
                            console.log(`💡 NAKED PAIR encontrado en ${type} ${i}:`, candsA);
                            return action;
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
        const coord1 = getCoord(protectCells[0]);
        const coord2 = getCoord(protectCells[1]);
        const vals = valuesToRemove.join(',');
        
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `Naked Pair (${unitNames[unitType]}): Pareja [${vals}] en ${coord1} y ${coord2}. Se eliminan de: ${affectedCells.join(', ')}`
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