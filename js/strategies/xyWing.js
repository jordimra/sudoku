import { getAllCandidates } from '../utils.js';

export function solveXYWing(board, candidates) {
    // Buscamos celdas con exactamente 2 candidatos (Bivalues)
    const bivalueCells = [];
    for (let i = 0; i < 81; i++) {
        if (candidates[i].length === 2) bivalueCells.push(i);
    }

    // PIVOTE: Probamos cada celda bivalue como posible centro
    for (let pivot of bivalueCells) {
        const [X, Y] = candidates[pivot];

        // ALAS: Buscamos celdas que vean al pivote y compartan un número
        // Ala 1 debe tener [X, Z]
        // Ala 2 debe tener [Y, Z]
        const potentialWings = bivalueCells.filter(cell => cell !== pivot && shareUnit(cell, pivot));

        for (let wing1 of potentialWings) {
            // Chequeamos si wing1 comparte X o Y
            const cands1 = candidates[wing1];
            let Z = null;
            let sharedWithPivot = null;

            if (cands1.includes(X) && !cands1.includes(Y)) { sharedWithPivot = X; Z = cands1.find(v => v !== X); }
            else if (cands1.includes(Y) && !cands1.includes(X)) { sharedWithPivot = Y; Z = cands1.find(v => v !== Y); }
            else continue; // No sirve como ala

            // Ahora buscamos el Ala 2
            // Debe compartir el OTRO número del pivote, y tener Z
            const otherPivotVal = (sharedWithPivot === X) ? Y : X;

            for (let wing2 of potentialWings) {
                if (wing2 === wing1) continue;
                const cands2 = candidates[wing2];

                // Debe tener [otherPivotVal, Z]
                if (cands2.includes(otherPivotVal) && cands2.includes(Z) && cands2.length === 2) {
                    
                    // ¡XY-WING ENCONTRADO! 
                    // Pivot: [X,Y], Wing1: [X,Z], Wing2: [Y,Z]
                    // El número Z puede ser eliminado de cualquier celda que vea a AMBAS alas.
                    const action = tryEliminate(candidates, Z, wing1, wing2, pivot);
                    if (action) return action;
                }
            }
        }
    }
    return null;
}

function tryEliminate(candidates, valZ, wing1, wing2, pivot) {
    let modified = false;
    let newCandidates = candidates.map(c => [...c]);
    let affectedCells = [];

    // Buscamos celdas que ven a Wing1 Y a Wing2
    for (let i = 0; i < 81; i++) {
        if (i === pivot || i === wing1 || i === wing2) continue;
        
        if (shareUnit(i, wing1) && shareUnit(i, wing2)) {
            if (newCandidates[i].includes(valZ)) {
                newCandidates[i] = newCandidates[i].filter(v => v !== valZ);
                modified = true;
                affectedCells.push(getCoord(i));
            }
        }
    }

    if (modified) {
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `XY-Wing: Pivote en ${getCoord(pivot)}, Alas en ${getCoord(wing1)} y ${getCoord(wing2)}. Elimina ${valZ} de: ${affectedCells.join(', ')}`
        };
    }
    return null;
}

// Utilidades internas
function shareUnit(idx1, idx2) {
    const r1 = Math.floor(idx1 / 9), c1 = idx1 % 9, b1 = Math.floor(r1/3)*3 + Math.floor(c1/3);
    const r2 = Math.floor(idx2 / 9), c2 = idx2 % 9, b2 = Math.floor(r2/3)*3 + Math.floor(c2/3);
    return r1 === r2 || c1 === c2 || b1 === b2;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}