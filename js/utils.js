export function isValid(board, index, num) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    // Fila
    for (let c = 0; c < 9; c++) if (board[row * 9 + c] === num) return false;
    // Columna
    for (let r = 0; r < 9; r++) if (board[r * 9 + col] === num) return false;
    // Caja
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (board[r * 9 + c] === num) return false;
        }
    }
    return true;
}

export function getAllCandidates(board) {
    let candidates = [];
    for (let i = 0; i < 81; i++) {
        if (board[i] !== 0) {
            candidates[i] = [];
        } else {
            let options = [];
            for (let num = 1; num <= 9; num++) {
                if (isValid(board, i, num)) {
                    options.push(num);
                }
            }
            candidates[i] = options;
        }
    }
    return candidates;
}

// Verifica si dos índices (0-80) se ven entre sí
export function cellsSeeEachOther(idx1, idx2) {
    if (idx1 === idx2) return false;
    
    const r1 = Math.floor(idx1 / 9), c1 = idx1 % 9;
    const r2 = Math.floor(idx2 / 9), c2 = idx2 % 9;
    
    // Misma fila o misma columna
    if (r1 === r2 || c1 === c2) return true;
    
    // Misma caja
    const b1 = Math.floor(r1 / 3) * 3 + Math.floor(c1 / 3);
    const b2 = Math.floor(r2 / 3) * 3 + Math.floor(c2 / 3);
    return b1 === b2;
}

// Devuelve un array con todas las unidades (filas, columnas, cajas) como arrays de índices
export function getAllUnitsFlat() {
    const units = [];
    // Filas
    for (let r = 0; r < 9; r++) {
        let row = [];
        for (let c = 0; c < 9; c++) row.push(r * 9 + c);
        units.push(row);
    }
    // Columnas
    for (let c = 0; c < 9; c++) {
        let col = [];
        for (let r = 0; r < 9; r++) col.push(r * 9 + c);
        units.push(col);
    }
    // Cajas
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            let box = [];
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    box.push((br * 3 + r) * 9 + (bc * 3 + c));
                }
            }
            units.push(box);
        }
    }
    return units;
}