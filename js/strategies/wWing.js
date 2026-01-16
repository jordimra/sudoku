import { getAllUnitsFlat, cellsSeeEachOther } from '../utils.js';

export function solveWWing(board, candidates) {
    // 1. Identificar celdas bivalor (tienen exactamente 2 candidatos)
    const bivalueCells = [];
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0 && candidates[i].length === 2) {
            bivalueCells.push({ index: i, cands: candidates[i] });
        }
    }

    // 2. Obtener todas las unidades para buscar Enlaces Fuertes (Strong Links)
    const units = getAllUnitsFlat();

    // 3. Iterar sobre pares de celdas bivalor idénticas
    for (let i = 0; i < bivalueCells.length; i++) {
        for (let j = i + 1; j < bivalueCells.length; j++) {
            const cellA = bivalueCells[i];
            const cellB = bivalueCells[j];

            // Deben tener los MISMOS candidatos (ej: [4,7] y [4,7])
            if (cellA.cands[0] !== cellB.cands[0] || cellA.cands[1] !== cellB.cands[1]) continue;

            // Probamos si están conectadas por el primer candidato (A) o el segundo (B)
            // Si conectamos por A, eliminamos B. Si conectamos por B, eliminamos A.
            const res1 = checkWWingLink(cellA, cellB, cellA.cands[0], cellA.cands[1], units, candidates, board);
            if (res1) return res1;

            const res2 = checkWWingLink(cellA, cellB, cellA.cands[1], cellA.cands[0], units, candidates, board);
            if (res2) return res2;
        }
    }

    return null;
}

function checkWWingLink(cellA, cellB, linkVal, elimVal, units, candidates, board) {
    // Buscamos una unidad donde 'linkVal' aparezca SOLO 2 veces (Strong Link)
    // Y esas 2 veces conecten con cellA y cellB respectivamente.
    
    for (const unit of units) {
        // Encontrar índices en esta unidad que contienen 'linkVal' como candidato
        const indicesWithLink = unit.filter(idx => 
            board[idx] === 0 && candidates[idx].includes(linkVal)
        );

        if (indicesWithLink.length !== 2) continue; // No es un Strong Link

        const bridge1 = indicesWithLink[0];
        const bridge2 = indicesWithLink[1];

        // Verificar topología:
        // (Bridge1 ve a CellA Y Bridge2 ve a CellB) O viceversa
        // IMPORTANTE: Los puentes no pueden ser las propias celdas de inicio/fin
        if (bridge1 === cellA.index || bridge1 === cellB.index || bridge2 === cellA.index || bridge2 === cellB.index) continue;

        let connected = false;
        if (cellsSeeEachOther(cellA.index, bridge1) && cellsSeeEachOther(cellB.index, bridge2)) connected = true;
        else if (cellsSeeEachOther(cellA.index, bridge2) && cellsSeeEachOther(cellB.index, bridge1)) connected = true;

        if (connected) {
            // ¡W-Wing encontrado!
            // Cualquier celda que vea a CellA Y a CellB no puede contener 'elimVal'
            
            // Creamos una copia profunda de los candidatos para el resultado
            let newCandidates = candidates.map(c => [...c]);
            let changesMade = false;

            for (let k = 0; k < 81; k++) {
                if (board[k] === 0 && 
                    k !== cellA.index && k !== cellB.index && // No borrarse a sí mismo
                    newCandidates[k].includes(elimVal) &&
                    cellsSeeEachOther(k, cellA.index) && 
                    cellsSeeEachOther(k, cellB.index)) {
                    
                    newCandidates[k] = newCandidates[k].filter(n => n !== elimVal);
                    changesMade = true;
                }
            }

            if (changesMade) {
                const coordA = getCoord(cellA.index);
                const coordB = getCoord(cellB.index);
                return {
                    type: 'NOTES_UPDATE',
                    candidates: newCandidates,
                    reason: `W-Wing: Celdas ${coordA} y ${coordB} (${linkVal}/${elimVal}) conectadas por enlace fuerte en ${linkVal}. Eliminado ${elimVal}.`
                };
            }
        }
    }
    return null;
}

function getCoord(index) {
    const r = Math.floor(index / 9);
    const c = index % 9;
    return "ABCDEFGHI"[r] + (c + 1);
}