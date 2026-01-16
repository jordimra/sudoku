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