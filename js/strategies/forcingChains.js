// js/strategies/forcingChains.js

export function solveForcingChains(board, candidates) {
    // Buscar celdas bivalor para iniciar la cadena
    const bivalueCells = [];
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0 && candidates[i].length === 2) {
            bivalueCells.push(i);
        }
    }

    for (let cell of bivalueCells) {
        const valA = candidates[cell][0];
        const valB = candidates[cell][1];

        // Propagar asumiendo A
        const resultA = propagate(board, candidates, cell, valA);
        // Propagar asumiendo B
        const resultB = propagate(board, candidates, cell, valB);

        // Si alguna asumpción lleva a una contradicción, la otra es verdadera
        if (resultA.contradiction && !resultB.contradiction) {
            return {
                index: cell,
                value: valB,
                reason: `Forcing Chain: Asumir ${valA} en ${getCoord(cell)} lleva a una contradicción. Debe ser ${valB}.`
            };
        }
        if (resultB.contradiction && !resultA.contradiction) {
            return {
                index: cell,
                value: valA,
                reason: `Forcing Chain: Asumir ${valB} en ${getCoord(cell)} lleva a una contradicción. Debe ser ${valA}.`
            };
        }

        // Intersección de resultados
        if (!resultA.contradiction && !resultB.contradiction) {
            // Verificar si ambas cadenas llegan a la misma conclusión de asignar un valor a una celda
            for (let i = 0; i < 81; i++) {
                if (board[i] === 0 && resultA.board[i] !== 0 && resultA.board[i] === resultB.board[i]) {
                    return {
                        index: i,
                        value: resultA.board[i],
                        reason: `Forcing Chain: Tanto ${valA} como ${valB} en ${getCoord(cell)} fuerzan a que ${getCoord(i)} sea ${resultA.board[i]}.`
                    };
                }
            }

            // Verificar si ambas cadenas coinciden en eliminar un candidato específico
            let modified = false;
            let newCandidates = candidates.map(c => [...c]);
            let affected = [];
            
            for (let i = 0; i < 81; i++) {
                if (board[i] === 0 && resultA.board[i] === 0 && resultB.board[i] === 0) {
                    const cA = resultA.candidates[i];
                    const cB = resultB.candidates[i];
                    
                    for (let n of candidates[i]) {
                        if (!cA.includes(n) && !cB.includes(n)) {
                            newCandidates[i] = newCandidates[i].filter(v => v !== n);
                            modified = true;
                            if (!affected.includes(getCoord(i))) affected.push(getCoord(i));
                        }
                    }
                }
            }

            if (modified) {
                return {
                    type: 'NOTES_UPDATE',
                    candidates: newCandidates,
                    reason: `Forcing Chain: Tanto ${valA} como ${valB} en ${getCoord(cell)} eliminan candidatos de ${affected.join(', ')}.`
                };
            }
        }
    }
    return null;
}

function propagate(board, candidates, startCell, startValue) {
    let tempBoard = [...board];
    let tempCands = candidates.map(c => [...c]);
    let queue = [{ cell: startCell, val: startValue }];
    
    while (queue.length > 0) {
        let current = queue.shift();
        const cell = current.cell;
        const val = current.val;

        if (tempBoard[cell] !== 0) {
            if (tempBoard[cell] !== val) return { contradiction: true };
            continue;
        }

        tempBoard[cell] = val;
        tempCands[cell] = [];

        // Eliminar val de los vecinos
        const neighbors = getNeighbors(cell);
        for (let n of neighbors) {
            if (tempBoard[n] === 0 && tempCands[n].includes(val)) {
                tempCands[n] = tempCands[n].filter(v => v !== val);
                if (tempCands[n].length === 0) {
                    return { contradiction: true }; // Se vació una celda
                }
                if (tempCands[n].length === 1) {
                    queue.push({ cell: n, val: tempCands[n][0] });
                }
            }
        }
    }
    return { contradiction: false, board: tempBoard, candidates: tempCands };
}

function getNeighbors(index) {
    const r = Math.floor(index / 9);
    const c = index % 9;
    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    
    let neighbors = new Set();
    for (let i = 0; i < 9; i++) {
        neighbors.add(r * 9 + i);
        neighbors.add(i * 9 + c);
    }
    const startR = Math.floor(r / 3) * 3;
    const startC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            neighbors.add((startR + i) * 9 + (startC + j));
        }
    }
    neighbors.delete(index);
    return Array.from(neighbors);
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}
