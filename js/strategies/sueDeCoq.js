// js/strategies/sueDeCoq.js

export function solveSueDeCoq(board, candidates) {
    const lines = [
        ...Array.from({length: 9}, (_, i) => ({ type: 'row', index: i })),
        ...Array.from({length: 9}, (_, i) => ({ type: 'col', index: i }))
    ];

    for (let line of lines) {
        const lineCells = line.type === 'row' ? getCellsInRow(line.index) : getCellsInCol(line.index);
        
        // Una línea cruza 3 cajas
        const boxesInLine = [...new Set(lineCells.map(getBoxIndex))];

        for (let box of boxesInLine) {
            const boxCells = getCellsInBox(box);
            const intersection = lineCells.filter(c => boxCells.includes(c)).filter(c => candidates[c].length > 0);
            
            if (intersection.length < 2) continue; // Necesitamos al menos 2 celdas en la intersección
            
            // Combinaciones de la intersección (tamaño 2 o 3)
            const iCombs = getCombinations(intersection);
            
            for (let I of iCombs) {
                if (I.length < 2) continue;
                
                const cI = getCandidatesUnion(candidates, I);
                const k = cI.length - I.length; // Celdas extra necesarias
                
                if (k < 2) continue; // Debe haber al menos 1 celda en B y 1 en L

                const otherBoxCells = boxCells.filter(c => !lineCells.includes(c) && candidates[c].length > 0);
                const otherLineCells = lineCells.filter(c => !boxCells.includes(c) && candidates[c].length > 0);

                for (let bSize = 1; bSize <= k - 1; bSize++) {
                    const lSize = k - bSize;
                    
                    const bCombs = getCombinationsOfSize(otherBoxCells, bSize);
                    const lCombs = getCombinationsOfSize(otherLineCells, lSize);

                    for (let B of bCombs) {
                        const cB = getCandidatesUnion(candidates, B);
                        if (!isSubset(cB, cI)) continue;

                        for (let L of lCombs) {
                            const cL = getCandidatesUnion(candidates, L);
                            if (!isSubset(cL, cI)) continue;

                            if (areDisjoint(cB, cL)) {
                                // ¡Sue de Coq Encontrado!
                                const action = executeSueDeCoq(candidates, I, B, L, cI, cB, cL, boxCells, lineCells, line.type, line.index, box);
                                if (action) return action;
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}

function executeSueDeCoq(candidates, I, B, L, cI, cB, cL, boxCells, lineCells, lineType, lineIdx, boxIdx) {
    let modified = false;
    let newCandidates = candidates.map(c => [...c]);
    let affected = [];

    // Candidatos que pertenecen estrictamente a la caja (no a la línea)
    const boxElims = cI.filter(c => !cL.includes(c));
    // Candidatos que pertenecen estrictamente a la línea (no a la caja)
    const lineElims = cI.filter(c => !cB.includes(c));

    // Eliminar de la caja (fuera de I y B)
    for (let cell of boxCells) {
        if (!I.includes(cell) && !B.includes(cell)) {
            for (let num of boxElims) {
                if (newCandidates[cell].includes(num)) {
                    newCandidates[cell] = newCandidates[cell].filter(n => n !== num);
                    modified = true;
                    if (!affected.includes(getCoord(cell))) affected.push(getCoord(cell));
                }
            }
        }
    }

    // Eliminar de la línea (fuera de I y L)
    for (let cell of lineCells) {
        if (!I.includes(cell) && !L.includes(cell)) {
            for (let num of lineElims) {
                if (newCandidates[cell].includes(num)) {
                    newCandidates[cell] = newCandidates[cell].filter(n => n !== num);
                    modified = true;
                    if (!affected.includes(getCoord(cell))) affected.push(getCoord(cell));
                }
            }
        }
    }

    if (modified) {
        const typeStr = lineType === 'row' ? 'Fila' : 'Columna';
        return {
            type: 'NOTES_UPDATE',
            candidates: newCandidates,
            reason: `Sue de Coq: Intersección en Caja ${boxIdx+1} y ${typeStr} ${lineIdx+1}. Eliminados candidatos de ${affected.join(', ')}.`
        };
    }
    return null;
}

function getCandidatesUnion(candidates, cells) {
    const union = new Set();
    for (let cell of cells) {
        candidates[cell].forEach(c => union.add(c));
    }
    return Array.from(union);
}

function isSubset(subset, set) {
    return subset.every(val => set.includes(val));
}

function areDisjoint(set1, set2) {
    return set1.every(val => !set2.includes(val));
}

function getCombinations(array) {
    const result = [];
    const f = function(prefix, array) {
        for (let i = 0; i < array.length; i++) {
            result.push([...prefix, array[i]]);
            f([...prefix, array[i]], array.slice(i + 1));
        }
    }
    f([], array);
    return result;
}

function getCombinationsOfSize(array, size) {
    const result = [];
    function backtrack(start, combo) {
        if (combo.length === size) {
            result.push([...combo]);
            return;
        }
        for (let i = start; i < array.length; i++) {
            combo.push(array[i]);
            backtrack(i + 1, combo);
            combo.pop();
        }
    }
    backtrack(0, []);
    return result;
}

function getBoxIndex(index) {
    const r = Math.floor(index / 9);
    const c = index % 9;
    return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

function getCellsInBox(box) {
    let cells = [];
    let startRow = Math.floor(box / 3) * 3;
    let startCol = (box % 3) * 3;
    for(let r=0; r<3; r++) for(let c=0; c<3; c++) cells.push((startRow + r) * 9 + (startCol + c));
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
