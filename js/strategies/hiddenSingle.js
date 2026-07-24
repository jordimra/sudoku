export function solveHiddenSingle(board, candidates) {
    for (let num = 1; num <= 9; num++) {
        // Filas
        for (let r = 0; r < 9; r++) {
            let possible = [];
            for (let c = 0; c < 9; c++) {
                let idx = r * 9 + c;
                if (board[idx] === 0 && candidates[idx].includes(num)) possible.push(idx);
            }
            if (possible.length === 1) return { index: possible[0], value: num, reason: `Hidden Single en Fila ${r+1}` };
        }
        // Columnas
        for (let c = 0; c < 9; c++) {
            let possible = [];
            for (let r = 0; r < 9; r++) {
                let idx = r * 9 + c;
                if (board[idx] === 0 && candidates[idx].includes(num)) possible.push(idx);
            }
            if (possible.length === 1) return { index: possible[0], value: num, reason: `Hidden Single en Columna ${c+1}` };
        }
        // Cajas
        for (let box = 0; box < 9; box++) {
            let possible = [];
            let startRow = Math.floor(box / 3) * 3;
            let startCol = (box % 3) * 3;
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    let idx = r * 9 + c;
                    if (board[idx] === 0 && candidates[idx].includes(num)) possible.push(idx);
                }
            }
            if (possible.length === 1) return { index: possible[0], value: num, reason: `Hidden Single en Caja ${box+1}` };
        }
    }
    return null;
}