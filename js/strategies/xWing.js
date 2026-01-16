export function solveXWing(board, candidates) {
    // Probamos X-Wing para cada número del 1 al 9
    for (let num = 1; num <= 9; num++) {
        // 1. Buscamos X-Wing en FILAS (para eliminar en columnas)
        const rowsWithTwo = [];
        for (let r = 0; r < 9; r++) {
            const cols = [];
            for (let c = 0; c < 9; c++) {
                if (candidates[r * 9 + c].includes(num)) cols.push(c);
            }
            if (cols.length === 2) rowsWithTwo.push({ row: r, cols: cols });
        }

        // Buscamos dos filas que compartan las MISMAS columnas
        for (let i = 0; i < rowsWithTwo.length; i++) {
            for (let j = i + 1; j < rowsWithTwo.length; j++) {
                const r1 = rowsWithTwo[i];
                const r2 = rowsWithTwo[j];
                
                if (r1.cols[0] === r2.cols[0] && r1.cols[1] === r2.cols[1]) {
                    // ¡X-WING ENCONTRADO (Base Filas)!
                    // El número 'num' TIENE que estar en (r1,c1 y r2,c2) O en (r1,c2 y r2,c1).
                    // En cualquier caso, ocupa esas dos columnas.
                    // Eliminamos 'num' del resto de esas columnas.
                    const c1 = r1.cols[0];
                    const c2 = r1.cols[1];
                    const action = tryEliminateXWing(candidates, num, [c1, c2], [r1.row, r2.row], 'col');
                    if (action) return action;
                }
            }
        }

        // 2. Buscamos X-Wing en COLUMNAS (para eliminar en filas) - Misma lógica rotada
        const colsWithTwo = [];
        for (let c = 0; c < 9; c++) {
            const rows = [];
            for (let r = 0; r < 9; r++) {
                if (candidates[r * 9 + c].includes(num)) rows.push(r);
            }
            if (rows.length === 2) colsWithTwo.push({ col: c, rows: rows });
        }

        for (let i = 0; i < colsWithTwo.length; i++) {
            for (let j = i + 1; j < colsWithTwo.length; j++) {
                const c1 = colsWithTwo[i];
                const c2 = colsWithTwo[j];

                if (c1.rows[0] === c2.rows[0] && c1.rows[1] === c2.rows[1]) {
                    // ¡X-WING ENCONTRADO (Base Columnas)!
                    const r1 = c1.rows[0];
                    const r2 = c1.rows[1];
                    const action = tryEliminateXWing(candidates, num, [r1, r2], [c1.col, c2.col], 'row');
                    if (action) return action;
                }
            }
        }
    }
    return null;
}

function tryEliminateXWing(candidates, num, targetUnits, safeIndices, unitType) {
    let modified = false;
    let newCandidates = candidates.map(c => [...c]);
    let affectedCells = [];

    // Si unitType es 'col', targetUnits son los índices de las columnas a limpiar
    // safeIndices son las filas que forman el X-Wing (NO TOCAR)
    
    for (let unitIdx of targetUnits) {
        for (let i = 0; i < 9; i++) {
            // Si es una de las filas/cols seguras, saltar
            if (safeIndices.includes(i)) continue;

            let cellIdx;
            if (unitType === 'col') cellIdx = i * 9 + unitIdx; // i es row
            else cellIdx = unitIdx * 9 + i; // i es col, unitIdx es row

            if (newCandidates[cellIdx].includes(num)) {
                newCandidates[cellIdx] = newCandidates[cellIdx].filter(n => n !== num);
                modified = true;
                affectedCells.push(getCoord(cellIdx));
            }
        }
    }

    if (modified) {
        const baseType = unitType === 'col' ? 'Filas' : 'Columnas'; // La base es lo contrario a lo que limpiamos
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `X-Wing: Patrón del número ${num} en ${baseType}. Eliminado ${num} de: ${affectedCells.join(', ')}`
        };
    }
    return null;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}