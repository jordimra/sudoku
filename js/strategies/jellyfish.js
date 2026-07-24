// js/strategies/jellyfish.js

export function solveJellyfish(board, candidates) {
    for (let num = 1; num <= 9; num++) {
        // --- BASE FILAS (Eliminar en Columnas) ---
        let possibleRows = [];
        for (let r = 0; r < 9; r++) {
            let cols = [];
            for (let c = 0; c < 9; c++) {
                if (candidates[r * 9 + c].includes(num)) cols.push(c);
            }
            if (cols.length >= 2 && cols.length <= 4) {
                possibleRows.push({ rowIndex: r, colIndices: cols });
            }
        }

        if (possibleRows.length >= 4) {
            for (let i = 0; i < possibleRows.length; i++) {
                for (let j = i + 1; j < possibleRows.length; j++) {
                    for (let k = j + 1; k < possibleRows.length; k++) {
                        for (let l = k + 1; l < possibleRows.length; l++) {
                            const r1 = possibleRows[i], r2 = possibleRows[j], r3 = possibleRows[k], r4 = possibleRows[l];
                            const unionCols = new Set([...r1.colIndices, ...r2.colIndices, ...r3.colIndices, ...r4.colIndices]);
                            
                            if (unionCols.size === 4) {
                                const targetCols = [...unionCols];
                                const baseRows = [r1.rowIndex, r2.rowIndex, r3.rowIndex, r4.rowIndex];
                                const action = tryEliminateJellyfish(candidates, num, targetCols, baseRows, 'col');
                                if (action) return action;
                            }
                        }
                    }
                }
            }
        }

        // --- BASE COLUMNAS (Eliminar en Filas) ---
        let possibleCols = [];
        for (let c = 0; c < 9; c++) {
            let rows = [];
            for (let r = 0; r < 9; r++) {
                if (candidates[r * 9 + c].includes(num)) rows.push(r);
            }
            if (rows.length >= 2 && rows.length <= 4) {
                possibleCols.push({ colIndex: c, rowIndices: rows });
            }
        }

        if (possibleCols.length >= 4) {
            for (let i = 0; i < possibleCols.length; i++) {
                for (let j = i + 1; j < possibleCols.length; j++) {
                    for (let k = j + 1; k < possibleCols.length; k++) {
                        for (let l = k + 1; l < possibleCols.length; l++) {
                            const c1 = possibleCols[i], c2 = possibleCols[j], c3 = possibleCols[k], c4 = possibleCols[l];
                            const unionRows = new Set([...c1.rowIndices, ...c2.rowIndices, ...c3.rowIndices, ...c4.rowIndices]);
                            
                            if (unionRows.size === 4) {
                                const targetRows = [...unionRows];
                                const baseCols = [c1.colIndex, c2.colIndex, c3.colIndex, c4.colIndex];
                                const action = tryEliminateJellyfish(candidates, num, targetRows, baseCols, 'row');
                                if (action) return action;
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}

function tryEliminateJellyfish(candidates, num, targetUnits, safeIndices, unitType) {
    let modified = false;
    let newCandidates = candidates.map(c => [...c]);
    let affectedCells = [];

    for (let unitIdx of targetUnits) {
        for (let i = 0; i < 9; i++) {
            if (safeIndices.includes(i)) continue;

            let idx;
            if (unitType === 'col') idx = i * 9 + unitIdx;
            else idx = unitIdx * 9 + i;

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
            reason: `Jellyfish (${base}): Patrón del ${num}. Se elimina de: ${affectedCells.join(', ')}`
        };
    }
    return null;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}
