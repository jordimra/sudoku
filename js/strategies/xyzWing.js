import { getAllCandidates } from '../utils.js';

export function solveXYZWing(board, candidates) {
    // 1. Buscar PIVOTES: Celdas con exactamente 3 candidatos [X,Y,Z]
    const pivotCells = [];
    for (let i = 0; i < 81; i++) {
        if (candidates[i].length === 3) pivotCells.push(i);
    }

    for (let pivot of pivotCells) {
        const pCands = candidates[pivot]; // [X,Y,Z]

        // 2. Buscar ALAS: Celdas con 2 candidatos que vean al pivote
        // Deben ser subconjuntos del pivote. Ej: [X,Y], [X,Z] o [Y,Z]
        const wings = [];
        for (let i = 0; i < 81; i++) {
            if (i === pivot) continue;
            if (shareUnit(pivot, i) && candidates[i].length === 2) {
                // Chequear si los candidatos del ala están dentro del pivote
                if (candidates[i].every(val => pCands.includes(val))) {
                    wings.push(i);
                }
            }
        }

        // Necesitamos al menos 2 alas para formar la figura
        if (wings.length < 2) continue;

        // 3. Probar combinaciones de 2 alas
        for (let i = 0; i < wings.length; i++) {
            for (let j = i + 1; j < wings.length; j++) {
                const w1 = wings[i];
                const w2 = wings[j];
                const c1 = candidates[w1];
                const c2 = candidates[w2];

                // REGLA: Entre el pivote y las dos alas, debe haber un candidato Z común a TODOS.
                // Y las alas deben tener la otra parte diferente (X y Y).
                // Ejemplo Pivot: [1,2,5], W1: [1,5], W2: [2,5] -> Común Z=5.
                
                // Intersección de los tres arrays
                const common = pCands.filter(v => c1.includes(v) && c2.includes(v));
                if (common.length !== 1) continue; // Debe haber exactamente 1 número común a los 3 (Z)

                const Z = common[0];

                // Verificar que las alas no sean idénticas (no sea [1,5] y [1,5])
                // Aunque XYZ-Wing permite variantes, lo estándar es que cubran los otros 2 números del pivote
                // Unión de W1 y W2 debe contener a X y Y (los otros del pivote)
                const unionWings = new Set([...c1, ...c2]);
                if (!pCands.every(v => unionWings.has(v))) continue;

                // 4. ELIMINACIÓN
                // Borramos Z de las celdas que ven al PIVOTE, al ALA 1 y al ALA 2 simultáneamente.
                const action = tryEliminateXYZ(candidates, Z, pivot, w1, w2);
                if (action) return action;
            }
        }
    }
    return null;
}

function tryEliminateXYZ(candidates, valZ, pivot, w1, w2) {
    let modified = false;
    let newCandidates = candidates.map(c => [...c]);
    let affectedCells = [];

    for (let i = 0; i < 81; i++) {
        if (i === pivot || i === w1 || i === w2) continue;

        // La celda debe ver a LOS TRES componentes
        if (shareUnit(i, pivot) && shareUnit(i, w1) && shareUnit(i, w2)) {
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
            reason: `XYZ-Wing: Pivote en ${getCoord(pivot)}, Alas ${getCoord(w1)} y ${getCoord(w2)}. Eliminado ${valZ} de ${affectedCells.join(', ')}`
        };
    }
    return null;
}

function shareUnit(idx1, idx2) {
    const r1 = Math.floor(idx1 / 9), c1 = idx1 % 9, b1 = Math.floor(r1/3)*3 + Math.floor(c1/3);
    const r2 = Math.floor(idx2 / 9), c2 = idx2 % 9, b2 = Math.floor(r2/3)*3 + Math.floor(c2/3);
    return r1 === r2 || c1 === c2 || b1 === b2;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}