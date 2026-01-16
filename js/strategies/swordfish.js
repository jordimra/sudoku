export function solveSwordfish(board, candidates) {
    for (let num = 1; num <= 9; num++) {
        // --- BASE FILAS (Eliminar en Columnas) ---
        // 1. Identificar filas donde el número aparece 2 o 3 veces
        let possibleRows = [];
        for (let r = 0; r < 9; r++) {
            let cols = [];
            for (let c = 0; c < 9; c++) {
                if (candidates[r * 9 + c].includes(num)) cols.push(c);
            }
            if (cols.length >= 2 && cols.length <= 3) {
                possibleRows.push({ rowIndex: r, colIndices: cols });
            }
        }

        // 2. Buscar tríos de filas que compartan un set de 3 columnas
        if (possibleRows.length >= 3) {
            for (let i = 0; i < possibleRows.length; i++) {
                for (let j = i + 1; j < possibleRows.length; j++) {
                    for (let k = j + 1; k < possibleRows.length; k++) {
                        const r1 = possibleRows[i], r2 = possibleRows[j], r3 = possibleRows[k];
                        
                        // Unión de todas las columnas involucradas
                        const unionCols = new Set([...r1.colIndices, ...r2.colIndices, ...r3.colIndices]);
                        
                        if (unionCols.size === 3) {
                            // ¡SWORDFISH ENCONTRADO!
                            // Eliminamos 'num' de esas 3 columnas en TODAS las demás filas
                            const targetCols = [...unionCols];
                            const baseRows = [r1.rowIndex, r2.rowIndex, r3.rowIndex];
                            
                            const action = tryEliminateSwordfish(candidates, num, targetCols, baseRows, 'col');
                            if (action) return action;
                        }
                    }
                }
            }
        }

        // --- BASE COLUMNAS (Eliminar en Filas) - Lógica inversa ---
        let possibleCols = [];
        for (let c = 0; c < 9; c++) {
            let rows = [];
            for (let r = 0; r < 9; r++) {
                if (candidates[r * 9 + c].includes(num)) rows.push(r);
            }
            if (rows.length >= 2 && rows.length <= 3) {
                possibleCols.push({ colIndex: c, rowIndices: rows });
            }
        }

        if (possibleCols.length >= 3) {
            for (let i = 0; i < possibleCols.length; i++) {
                for (let j = i + 1; j < possibleCols.length; j++) {
                    for (let k = j + 1; k < possibleCols.length; k++) {
                        const c1 = possibleCols[i], c2 = possibleCols[j], c3 = possibleCols[k];
                        const unionRows = new Set([...c1.rowIndices, ...c2.rowIndices, ...c3.rowIndices]);
                        
                        if (unionRows.size === 3) {
                            const targetRows = [...unionRows];
                            const baseCols = [c1.colIndex, c2.colIndex, c3.colIndex];
                            
                            const action = tryEliminateSwordfish(candidates, num, targetRows, baseCols, 'row');
                            if (action) return action;
                        }
                    }
                }
            }
        }
    }
    return null;
}

function tryEliminateSwordfish(candidates, num, targetUnits, safeIndices, unitType) {
    let modified = false;
    let newCandidates = candidates.map(c => [...c]);
    let affectedCells = [];

    // unitType 'col' -> targetUnits son columnas, safeIndices son filas
    for (let unitIdx of targetUnits) {
        for (let i = 0; i < 9; i++) {
            if (safeIndices.includes(i)) continue; // No tocar las celdas que forman el patrón

            let idx;
            if (unitType === 'col') idx = i * 9 + unitIdx; // i es fila
            else idx = unitIdx * 9 + i; // i es columna

            if (newCandidates[idx].includes(num)) {
                newCandidates[idx] = newCandidates[idx].filter(n => n !== num);
                modified = true;
                affectedCells.push(getCoord(idx));
            }
        }
    }

    if (modified) {
        const base = unitType === 'col' ? 'Filas' : 'Columnas';
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `Swordfish (${base}): Patrón del ${num}. Se elimina de: ${affectedCells.join(', ')}`
        };
    }
    return null;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}