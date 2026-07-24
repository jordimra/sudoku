// js/strategies/intersectionRemoval.js

export function solveIntersectionRemoval(board, candidates) {
    // Necesitamos trabajar con una copia para no modificar el original si no encontramos nada
    // Pero como devolveremos un array nuevo modificado, podemos clonar al encontrar la acción.
    
    // Iteramos por cada número (1-9)
    for (let num = 1; num <= 9; num++) {
        
        // --- CASO 1: POINTING (De Caja a Línea) ---
        // Miramos cada CAJA
        for (let box = 0; box < 9; box++) {
            const cellsInBox = getCellsInBox(box);
            const candidatesInBox = cellsInBox.filter(idx => candidates[idx].includes(num));
            
            // Si hay candidatos del número en esta caja (mínimo 2, si es 1 sería un Hidden Single)
            if (candidatesInBox.length > 1) {
                
                // Chequear si todos están en la misma FILA
                const rows = new Set(candidatesInBox.map(idx => Math.floor(idx / 9)));
                if (rows.size === 1) {
                    const row = [...rows][0];
                    // Si encontramos eliminaciones fuera de la caja en esta fila...
                    const action = tryEliminate(candidates, num, getCellsInRow(row), cellsInBox, "Pointing Pair (Fila)");
                    if (action) return action;
                }

                // Chequear si todos están en la misma COLUMNA
                const cols = new Set(candidatesInBox.map(idx => idx % 9));
                if (cols.size === 1) {
                    const col = [...cols][0];
                    const action = tryEliminate(candidates, num, getCellsInCol(col), cellsInBox, "Pointing Pair (Columna)");
                    if (action) return action;
                }
            }
        }

        // --- CASO 2: CLAIMING / BOX-LINE REDUCTION (De Línea a Caja) ---
        
        // Miramos cada FILA
        for (let r = 0; r < 9; r++) {
            const cellsInRow = getCellsInRow(r);
            const candidatesInRow = cellsInRow.filter(idx => candidates[idx].includes(num));
            
            if (candidatesInRow.length > 1) {
                // Chequear si todos están en la misma CAJA
                const boxes = new Set(candidatesInRow.map(idx => getBoxIndex(idx)));
                if (boxes.size === 1) {
                    const box = [...boxes][0];
                    // Eliminamos el número del resto de la CAJA
                    const action = tryEliminate(candidates, num, getCellsInBox(box), cellsInRow, "Box/Line Reduction (Fila)");
                    if (action) return action;
                }
            }
        }

        // Miramos cada COLUMNA
        for (let c = 0; c < 9; c++) {
            const cellsInCol = getCellsInCol(c);
            const candidatesInCol = cellsInCol.filter(idx => candidates[idx].includes(num));
            
            if (candidatesInCol.length > 1) {
                const boxes = new Set(candidatesInCol.map(idx => getBoxIndex(idx)));
                if (boxes.size === 1) {
                    const box = [...boxes][0];
                    const action = tryEliminate(candidates, num, getCellsInBox(box), cellsInCol, "Box/Line Reduction (Columna)");
                    if (action) return action;
                }
            }
        }
    }

    return null;
}

// --- FUNCIONES AUXILIARES INTERNAS ---

function tryEliminate(allCandidates, num, scopeCells, protectCells, typeName) {
    let modified = false;
    // Clonamos los candidatos para preparar el resultado
    let newCandidates = allCandidates.map(c => [...c]); 
    let affectedCells = [];

    // Recorremos las celdas del ámbito (ej: toda la fila)
    for (let idx of scopeCells) {
        // Si la celda NO es una de las que causan el bloqueo (protectCells)
        // Y la celda tiene el número candidato...
        if (!protectCells.includes(idx) && newCandidates[idx].includes(num)) {
            // ... LO BORRAMOS
            newCandidates[idx] = newCandidates[idx].filter(n => n !== num);
            modified = true;
            affectedCells.push(idx);
        }
    }

    if (modified) {
        // Convertimos índices a coordenadas para el mensaje (ej: C4)
        const coords = affectedCells.map(i => getCoord(i)).join(", ");
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `${typeName}: El número ${num} está bloqueado, se elimina de: ${coords}`
        };
    }
    return null;
}

// Helpers de geometría
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

function getBoxIndex(index) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function getCoord(index) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    return "ABCDEFGHI"[row] + (col + 1);
}