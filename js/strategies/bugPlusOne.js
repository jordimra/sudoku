// js/strategies/bugPlusOne.js

export function solveBugPlusOne(board, candidates) {
    let bivalueCount = 0;
    let trivalueCells = [];
    let emptyCount = 0;

    for (let i = 0; i < 81; i++) {
        if (board[i] === 0) {
            emptyCount++;
            if (candidates[i].length === 2) bivalueCount++;
            else if (candidates[i].length === 3) trivalueCells.push(i);
        }
    }

    // BUG+1 requiere que todas las celdas vacías sean bivalor EXCEPTO una trivalor
    if (trivalueCells.length === 1 && bivalueCount === emptyCount - 1) {
        const targetCell = trivalueCells[0];
        const cands = candidates[targetCell];
        
        // El candidato correcto es el que aparece 3 veces en su fila, columna o caja.
        for (let num of cands) {
            if (countCandidateInUnit(candidates, targetCell, num, 'row') === 3 ||
                countCandidateInUnit(candidates, targetCell, num, 'col') === 3 ||
                countCandidateInUnit(candidates, targetCell, num, 'box') === 3) {
                
                return {
                    index: targetCell,
                    value: num,
                    reason: `BUG+1: Patrón de Unicidad Grave detectado. El único escape es el candidato ${num}.`
                };
            }
        }
    }
    return null;
}

function countCandidateInUnit(candidates, cellIndex, num, type) {
    let count = 0;
    let indices = [];
    const r = Math.floor(cellIndex / 9);
    const c = cellIndex % 9;
    
    if (type === 'row') {
        for (let i = 0; i < 9; i++) indices.push(r * 9 + i);
    } else if (type === 'col') {
        for (let i = 0; i < 9; i++) indices.push(i * 9 + c);
    } else {
        const startR = Math.floor(r / 3) * 3;
        const startC = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) indices.push((startR + i) * 9 + (startC + j));
        }
    }

    for (let idx of indices) {
        if (candidates[idx].length > 0 && candidates[idx].includes(num)) {
            count++;
        }
    }
    return count;
}
