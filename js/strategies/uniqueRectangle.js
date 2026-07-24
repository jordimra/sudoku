// js/strategies/uniqueRectangle.js

export function solveUniqueRectangle(board, candidates) {
    // Buscar pares de candidatos [A, B] presentes en 4 celdas formando rectángulo (en 2 cajas)
    for (let A = 1; A <= 8; A++) {
        for (let B = A + 1; B <= 9; B++) {
            
            // Celdas que contienen A y B
            const abCells = [];
            for (let i = 0; i < 81; i++) {
                if (candidates[i].includes(A) && candidates[i].includes(B)) {
                    abCells.push(i);
                }
            }
            
            // Buscar 4 celdas que formen un rectángulo
            for (let i=0; i<abCells.length; i++) {
                for (let j=i+1; j<abCells.length; j++) {
                    const c1 = abCells[i];
                    const c2 = abCells[j];
                    
                    const r1 = Math.floor(c1/9), col1 = c1%9;
                    const r2 = Math.floor(c2/9), col2 = c2%9;
                    
                    // Aseguramos que están en diagonal para definir el rectángulo
                    if (r1 !== r2 && col1 !== col2) {
                        const c3 = r1 * 9 + col2;
                        const c4 = r2 * 9 + col1;
                        
                        // Verificar que c3 y c4 también contienen A y B
                        if (abCells.includes(c3) && abCells.includes(c4)) {
                            // Verificar que estén en exactamente 2 cajas
                            const boxes = new Set([getBox(c1), getBox(c2), getBox(c3), getBox(c4)]);
                            if (boxes.size === 2) {
                                // TENEMOS UN POSIBLE PATRÓN MORTAL (UR)
                                const rect = [c1, c2, c3, c4];
                                const candSizes = rect.map(idx => candidates[idx].length);
                                
                                // Contar cuántas celdas son bivalor exactas (tienen SOLO A y B)
                                const bivalueCount = candSizes.filter(len => len === 2).length;
                                
                                if (bivalueCount === 3) {
                                    // TYPE 1: 3 celdas bivalor. La 4ta tiene extras.
                                    const targetIdx = rect.find(idx => candidates[idx].length > 2);
                                    if (targetIdx !== undefined) {
                                        return executeURType1(candidates, A, B, targetIdx, rect);
                                    }
                                } 
                                else if (bivalueCount === 2) {
                                    // TYPE 2 o TYPE 4
                                    // Encontrar las dos celdas con extras
                                    const extraCells = rect.filter(idx => candidates[idx].length > 2);
                                    const extra1 = extraCells[0];
                                    const extra2 = extraCells[1];
                                    
                                    // Verificar si comparten la misma fila, columna o caja
                                    if (shareUnit(extra1, extra2)) {
                                        // Obtener los extras combinados
                                        const extras1 = candidates[extra1].filter(n => n !== A && n !== B);
                                        const extras2 = candidates[extra2].filter(n => n !== A && n !== B);
                                        
                                        // TYPE 2: Tienen exactamente el mismo ÚNICO extra
                                        if (extras1.length === 1 && extras2.length === 1 && extras1[0] === extras2[0]) {
                                            const extraNum = extras1[0];
                                            const action = executeURType2(candidates, extraNum, extra1, extra2, rect);
                                            if (action) return action;
                                        }
                                        
                                        // TYPE 4: Uno de los candidatos base (A o B) está restringido en la unidad
                                        const action4 = executeURType4(candidates, A, B, extra1, extra2, rect);
                                        if (action4) return action4;
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

function getBox(index) {
    const r = Math.floor(index / 9);
    const c = index % 9;
    return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

function shareUnit(idx1, idx2) {
    const r1 = Math.floor(idx1 / 9), c1 = idx1 % 9;
    const r2 = Math.floor(idx2 / 9), c2 = idx2 % 9;
    return r1 === r2 || c1 === c2 || getBox(idx1) === getBox(idx2);
}

function executeURType1(candidates, A, B, targetCell, rect) {
    let newCands = candidates.map(c => [...c]);
    newCands[targetCell] = newCands[targetCell].filter(n => n !== A && n !== B);
    
    // Si al quitar A y B nos quedamos sin candidatos, entonces el rectángulo no era válido o hay error, 
    // pero teóricamente debe haber al menos 1 extra.
    if (newCands[targetCell].length === candidates[targetCell].length) return null;
    
    return {
        type: 'NOTES_UPDATE',
        candidates: newCands,
        reason: `Unique Rectangle Tipo 1: Eliminado [${A},${B}] de ${getCoord(targetCell)} para evitar patrón mortal en ${rect.map(getCoord).join(', ')}.`
    };
}

function executeURType2(candidates, extraNum, cell1, cell2, rect) {
    let modified = false;
    let newCands = candidates.map(c => [...c]);
    let affected = [];
    
    for (let i = 0; i < 81; i++) {
        if (i !== cell1 && i !== cell2 && newCands[i].includes(extraNum)) {
            // Si la celda ve a AMBAS cell1 y cell2
            if (cellsSee(i, cell1) && cellsSee(i, cell2)) {
                newCands[i] = newCands[i].filter(n => n !== extraNum);
                modified = true;
                affected.push(getCoord(i));
            }
        }
    }
    
    if (modified) {
        return {
            type: 'NOTES_UPDATE',
            candidates: newCands,
            reason: `Unique Rectangle Tipo 2: Eliminado ${extraNum} de ${affected.join(', ')} (ven a ${getCoord(cell1)} y ${getCoord(cell2)}).`
        };
    }
    return null;
}

function cellsSee(idx1, idx2) {
    if (idx1 === idx2) return false;
    return shareUnit(idx1, idx2);
}

function executeURType4(candidates, A, B, cell1, cell2, rect) {
    // Determinar la unidad compartida (fila o columna)
    const r1 = Math.floor(cell1/9), c1 = cell1%9;
    const r2 = Math.floor(cell2/9), c2 = cell2%9;
    
    let unitCells = [];
    if (r1 === r2) {
        for(let i=0; i<9; i++) unitCells.push(r1 * 9 + i);
    } else if (c1 === c2) {
        for(let i=0; i<9; i++) unitCells.push(i * 9 + c1);
    } else {
        return null; // En UR, siempre comparten fila o columna
    }
    
    // Contar ocurrencias de A y B en la unidad (fuera de cell1 y cell2)
    let countA = 0, countB = 0;
    for (let idx of unitCells) {
        if (idx !== cell1 && idx !== cell2 && candidates[idx].length > 0) {
            if (candidates[idx].includes(A)) countA++;
            if (candidates[idx].includes(B)) countB++;
        }
    }
    
    if (countA === 0 && countB > 0) {
        return eliminateFromCells(candidates, B, [cell1, cell2], `Tipo 4: ${A} restringido. Eliminado ${B} de ${getCoord(cell1)}, ${getCoord(cell2)}`);
    } else if (countB === 0 && countA > 0) {
        return eliminateFromCells(candidates, A, [cell1, cell2], `Tipo 4: ${B} restringido. Eliminado ${A} de ${getCoord(cell1)}, ${getCoord(cell2)}`);
    }
    
    return null;
}

function eliminateFromCells(candidates, num, cells, reasonStr) {
    let modified = false;
    let newCands = candidates.map(c => [...c]);
    
    for (let idx of cells) {
        if (newCands[idx].includes(num)) {
            newCands[idx] = newCands[idx].filter(n => n !== num);
            modified = true;
        }
    }
    
    if (modified) {
        return {
            type: 'NOTES_UPDATE',
            candidates: newCands,
            reason: `Unique Rectangle ${reasonStr}`
        };
    }
    return null;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}