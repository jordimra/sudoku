export function solveSkyscraper(board, candidates) {
    for (let num = 1; num <= 9; num++) {
        
        // --- BASE FILAS (Puntas en Columnas) ---
        // 1. Buscar filas donde 'num' aparezca exactamente 2 veces
        let rowsWithTwo = [];
        for (let r = 0; r < 9; r++) {
            let cols = [];
            for (let c = 0; c < 9; c++) {
                if (candidates[r * 9 + c].includes(num)) cols.push(c);
            }
            if (cols.length === 2) rowsWithTwo.push({ r: r, cols: cols });
        }

        // 2. Buscar parejas de filas
        for (let i = 0; i < rowsWithTwo.length; i++) {
            for (let j = i + 1; j < rowsWithTwo.length; j++) {
                const r1 = rowsWithTwo[i];
                const r2 = rowsWithTwo[j];

                // Chequear si comparten UNA columna (La Base)
                // Posibles casos de coincidencia: (c0==c0), (c0==c1), (c1==c0), (c1==c1)
                let baseCol = -1;
                let topCol1 = -1, topCol2 = -1; // Las columnas de las "puntas"

                if (r1.cols[0] === r2.cols[0]) { baseCol = r1.cols[0]; topCol1 = r1.cols[1]; topCol2 = r2.cols[1]; }
                else if (r1.cols[0] === r2.cols[1]) { baseCol = r1.cols[0]; topCol1 = r1.cols[1]; topCol2 = r2.cols[0]; }
                else if (r1.cols[1] === r2.cols[0]) { baseCol = r1.cols[1]; topCol1 = r1.cols[0]; topCol2 = r2.cols[1]; }
                else if (r1.cols[1] === r2.cols[1]) { baseCol = r1.cols[1]; topCol1 = r1.cols[0]; topCol2 = r2.cols[0]; }

                if (baseCol !== -1) {
                    // Tenemos un Skyscraper.
                    // Las celdas "Techo" son (r1.r, topCol1) y (r2.r, topCol2).
                    // Eliminamos 'num' de cualquier celda que vea a AMBOS techos.
                    const top1Idx = r1.r * 9 + topCol1;
                    const top2Idx = r2.r * 9 + topCol2;
                    
                    const action = tryEliminateSkyscraper(candidates, num, top1Idx, top2Idx, "Filas");
                    if (action) return action;
                }
            }
        }

        // --- BASE COLUMNAS (Puntas en Filas) ---
        // Misma lógica pero rotada
        let colsWithTwo = [];
        for (let c = 0; c < 9; c++) {
            let rows = [];
            for (let r = 0; r < 9; r++) {
                if (candidates[r * 9 + c].includes(num)) rows.push(r);
            }
            if (rows.length === 2) colsWithTwo.push({ c: c, rows: rows });
        }

        for (let i = 0; i < colsWithTwo.length; i++) {
            for (let j = i + 1; j < colsWithTwo.length; j++) {
                const c1 = colsWithTwo[i];
                const c2 = colsWithTwo[j];

                let baseRow = -1;
                let topRow1 = -1, topRow2 = -1;

                if (c1.rows[0] === c2.rows[0]) { baseRow = c1.rows[0]; topRow1 = c1.rows[1]; topRow2 = c2.rows[1]; }
                else if (c1.rows[0] === c2.rows[1]) { baseRow = c1.rows[0]; topRow1 = c1.rows[1]; topRow2 = c2.rows[0]; }
                else if (c1.rows[1] === c2.rows[0]) { baseRow = c1.rows[1]; topRow1 = c1.rows[0]; topRow2 = c2.rows[1]; }
                else if (c1.rows[1] === c2.rows[1]) { baseRow = c1.rows[1]; topRow1 = c1.rows[0]; topRow2 = c2.rows[0]; }

                if (baseRow !== -1) {
                    const top1Idx = topRow1 * 9 + c1.c;
                    const top2Idx = topRow2 * 9 + c2.c;
                    
                    const action = tryEliminateSkyscraper(candidates, num, top1Idx, top2Idx, "Columnas");
                    if (action) return action;
                }
            }
        }
    }
    return null;
}

function tryEliminateSkyscraper(candidates, num, idx1, idx2, baseType) {
    let modified = false;
    let newCandidates = candidates.map(c => [...c]);
    let affectedCells = [];

    for (let i = 0; i < 81; i++) {
        if (i === idx1 || i === idx2) continue;

        // La celda víctima debe ver a AMBOS techos
        if (shareUnit(i, idx1) && shareUnit(i, idx2)) {
            if (newCandidates[i].includes(num)) {
                newCandidates[i] = newCandidates[i].filter(v => v !== num);
                modified = true;
                affectedCells.push(getCoord(i));
            }
        }
    }

    if (modified) {
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `Skyscraper (${baseType}): Puntas en ${getCoord(idx1)} y ${getCoord(idx2)}. Eliminado ${num} de ${affectedCells.join(', ')}`
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