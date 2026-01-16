export function solveUniqueRectangle(board, candidates) {
    // Buscamos rectángulos formados por 2 filas y 2 columnas
    // Donde 3 esquinas tengan exactamente 2 candidatos iguales [A,B]
    // Y la 4ª esquina tenga [A,B + extras]
    
    // Primero, encontramos todas las celdas con 2 candidatos
    const pairs = [];
    for(let i=0; i<81; i++) {
        if (candidates[i].length === 2) pairs.push(i);
    }

    for (let i = 0; i < pairs.length; i++) {
        for (let j = i + 1; j < pairs.length; j++) {
            const idx1 = pairs[i];
            const idx2 = pairs[j];

            const r1 = Math.floor(idx1 / 9);
            const c1 = idx1 % 9;
            const r2 = Math.floor(idx2 / 9);
            const c2 = idx2 % 9;

            // Deben estar en la misma fila O misma columna para formar un lado
            if (r1 !== r2 && c1 !== c2) {
                // Son esquinas opuestas de un posible rectángulo.
                // Verificamos si forman rectángulo válido (mismo box no suele contar para UR tipo 1, pero simplifiquemos)
                const corner3 = r1 * 9 + c2;
                const corner4 = r2 * 9 + c1;

                // Verificamos candidatos
                const cands1 = candidates[idx1];
                const cands2 = candidates[idx2];
                
                // Deben ser idénticos [A,B]
                if (JSON.stringify(cands1) !== JSON.stringify(cands2)) continue;

                // Revisamos las otras dos esquinas
                const cands3 = candidates[corner3];
                const cands4 = candidates[corner4];
                const valA = cands1[0];
                const valB = cands1[1];

                // Caso Tipo 1: 3 esquinas son [A,B], la cuarta es el objetivo
                let target = null;
                
                if (hasOnly(cands3, valA, valB)) {
                    // 1, 2 y 3 son pares. 4 es el target.
                    if (cands4.includes(valA) && cands4.includes(valB)) target = corner4;
                } else if (hasOnly(cands4, valA, valB)) {
                    // 1, 2 y 4 son pares. 3 es el target.
                    if (cands3.includes(valA) && cands3.includes(valB)) target = corner3;
                }

                if (target !== null) {
                    // ELIMINAMOS A y B del target para evitar el "Deadly Pattern"
                    // (Si quedaran solo A y B, habría 2 soluciones, lo cual es ilegal en Sudoku)
                    let newCands = candidates.map(c => [...c]);
                    const oldLen = newCands[target].length;
                    newCands[target] = newCands[target].filter(v => v !== valA && v !== valB);

                    if (newCands[target].length < oldLen && newCands[target].length > 0) {
                         return {
                            type: 'NOTES_UPDATE',
                            candidates: newCands,
                            reason: `Unique Rectangle: Evitado patrón mortal en ${getCoord(idx1)}, ${getCoord(idx2)}, ... Eliminado [${valA},${valB}] de ${getCoord(target)}`
                        };
                    }
                }
            }
        }
    }
    return null;
}

function hasOnly(arr, v1, v2) {
    return arr.length === 2 && arr.includes(v1) && arr.includes(v2);
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}