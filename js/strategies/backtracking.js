import { isValid } from '../utils.js';

// Resuelve y devuelve true si encuentra UNA solución (se detiene a la primera)
export function solveBacktracking(board) {
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0) {
            for (let num = 1; num <= 9; num++) {
                if (isValid(board, i, num)) {
                    board[i] = num;
                    if (solveBacktracking(board)) return true;
                    board[i] = 0;
                }
            }
            return false;
        }
    }
    return true;
}

// NUEVO: Verifica si el tablero tiene EXACTAMENTE una solución única
export function hasUniqueSolution(board) {
    let solutions = 0;
    
    // Función recursiva interna que no modifica el tablero original visual
    // Trabajamos sobre una copia o nos aseguramos de deshacer cambios
    function countSolutions(bd) {
        // Optimización: Si ya encontramos más de 1, paramos (tablero inválido)
        if (solutions > 1) return;

        let index = -1;
        for (let i = 0; i < 81; i++) {
            if (bd[i] === 0) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            solutions++;
            return;
        }

        for (let num = 1; num <= 9; num++) {
            if (isValid(bd, index, num)) {
                bd[index] = num;
                countSolutions(bd);
                bd[index] = 0;
                if (solutions > 1) return; // Salida rápida
            }
        }
    }

    // Trabajamos sobre una copia para no romper el juego en curso
    countSolutions([...board]);
    return solutions === 1;
}