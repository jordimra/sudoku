// js/strategies/emptyRectangle.js

export function solveEmptyRectangle(board, candidates) {
    for (let num = 1; num <= 9; num++) {
        for (let box = 0; box < 9; box++) {
            const boxCells = getCellsInBox(box).filter(idx => candidates[idx].includes(num));
            if (boxCells.length < 2) continue;

            const boxRows = [...new Set(boxCells.map(idx => Math.floor(idx / 9)))];
            const boxCols = [...new Set(boxCells.map(idx => idx % 9))];

            for (let r of boxRows) {
                for (let c of boxCols) {
                    // Verificar si TODAS las celdas de la caja están en 'r' o en 'c'
                    let isER = true;
                    for (let cell of boxCells) {
                        const cr = Math.floor(cell / 9);
                        const cc = cell % 9;
                        if (cr !== r && cc !== c) {
                            isER = false;
                            break;
                        }
                    }

                    // Para que sea un verdadero Empty Rectangle (ER), deben usarse ambos brazos,
                    // de lo contrario sería un simple Pointing Pair (ya gestionado).
                    const inRowOnly = boxCells.every(cell => Math.floor(cell/9) === r);
                    const inColOnly = boxCells.every(cell => cell%9 === c);

                    if (isER && !inRowOnly && !inColOnly) {
                        // Buscar Strong Link en Fila (fuera de esta caja)
                        for (let slRow = 0; slRow < 9; slRow++) {
                            if (Math.floor(slRow/3) === Math.floor(r/3)) continue; // Misma banda de caja

                            const rowCells = getCellsInRow(slRow).filter(idx => candidates[idx].includes(num));
                            if (rowCells.length === 2) {
                                const c1 = rowCells[0] % 9;
                                const c2 = rowCells[1] % 9;

                                let targetCol = -1;
                                if (c1 === c) targetCol = c2;
                                else if (c2 === c) targetCol = c1;

                                if (targetCol !== -1) {
                                    const targetIdx = r * 9 + targetCol;
                                    if (candidates[targetIdx].includes(num)) {
                                        let newCands = candidates.map(cand => [...cand]);
                                        newCands[targetIdx] = newCands[targetIdx].filter(n => n !== num);
                                        return {
                                            type: 'NOTES_UPDATE',
                                            candidates: newCands,
                                            reason: `Empty Rectangle: Caja ${box+1}, ER en (${r+1}, ${c+1}). Enlace Fuerte en fila ${slRow+1}. Eliminado ${num} de ${getCoord(targetIdx)}.`
                                        };
                                    }
                                }
                            }
                        }

                        // Buscar Strong Link en Columna (fuera de esta caja)
                        for (let slCol = 0; slCol < 9; slCol++) {
                            if (Math.floor(slCol/3) === Math.floor(c/3)) continue; // Misma banda de caja

                            const colCells = getCellsInCol(slCol).filter(idx => candidates[idx].includes(num));
                            if (colCells.length === 2) {
                                const r1 = Math.floor(colCells[0] / 9);
                                const r2 = Math.floor(colCells[1] / 9);

                                let targetRow = -1;
                                if (r1 === r) targetRow = r2;
                                else if (r2 === r) targetRow = r1;

                                if (targetRow !== -1) {
                                    const targetIdx = targetRow * 9 + c;
                                    if (candidates[targetIdx].includes(num)) {
                                        let newCands = candidates.map(cand => [...cand]);
                                        newCands[targetIdx] = newCands[targetIdx].filter(n => n !== num);
                                        return {
                                            type: 'NOTES_UPDATE',
                                            candidates: newCands,
                                            reason: `Empty Rectangle: Caja ${box+1}, ER en (${r+1}, ${c+1}). Enlace Fuerte en col ${slCol+1}. Eliminado ${num} de ${getCoord(targetIdx)}.`
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}

function getCellsInBox(box) {
    let cells = [];
    let startRow = Math.floor(box / 3) * 3;
    let startCol = (box % 3) * 3;
    for(let r=0; r<3; r++) {
        for(let c=0; c<3; c++) {
            cells.push( (startRow + r) * 9 + (startCol + c) );
        }
    }
    return cells;
}

function getCellsInRow(row) {
    let cells = [];
    for(let c=0; c<9; c++) cells.push(row * 9 + c);
    return cells;
}

function getCellsInCol(col) {
    let cells = [];
    for(let r=0; r<9; r++) cells.push(r * 9 + col);
    return cells;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}
