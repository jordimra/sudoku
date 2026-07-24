// js/strategies/finnedFish.js

export function solveFinnedFish(board, candidates) {
    // Para simplificar, implementamos N=2 (Finned X-Wing) y N=3 (Finned Swordfish)
    for (let num = 1; num <= 9; num++) {
        // Base Filas (Eliminar en Columnas)
        let rowCands = [];
        for (let r = 0; r < 9; r++) {
            let cols = [];
            for (let c = 0; c < 9; c++) if (candidates[r * 9 + c].includes(num)) cols.push(c);
            if (cols.length > 0) rowCands.push({ r, cols });
        }

        let res = findFinnedFish(candidates, num, rowCands, 2, 'row');
        if (res) return res;

        res = findFinnedFish(candidates, num, rowCands, 3, 'row');
        if (res) return res;

        // Base Columnas (Eliminar en Filas)
        let colCands = [];
        for (let c = 0; c < 9; c++) {
            let rows = [];
            for (let r = 0; r < 9; r++) if (candidates[r * 9 + c].includes(num)) rows.push(r);
            if (rows.length > 0) colCands.push({ c, rows });
        }

        res = findFinnedFish(candidates, num, colCands, 2, 'col');
        if (res) return res;

        res = findFinnedFish(candidates, num, colCands, 3, 'col');
        if (res) return res;
    }
    return null;
}

function findFinnedFish(candidates, num, unitsData, N, baseType) {
    if (unitsData.length < N) return null;
    
    // Combinaciones de N unidades base
    const combs = getCombinations(unitsData, N);
    for (let comb of combs) {
        const baseIndices = comb.map(u => baseType === 'row' ? u.r : u.c);
        
        const allCoverIndicesSet = new Set();
        comb.forEach(u => {
            const covers = baseType === 'row' ? u.cols : u.rows;
            covers.forEach(val => allCoverIndicesSet.add(val));
        });
        
        const allCoverIndices = Array.from(allCoverIndicesSet);
        if (allCoverIndices.length <= N) continue; // Un pez normal no es un finned fish

        const coverCombs = getCombinations(allCoverIndices, N);
        for (let coverComb of coverCombs) {
            let finCells = [];
            for (let u of comb) {
                const baseIdx = baseType === 'row' ? u.r : u.c;
                const covers = baseType === 'row' ? u.cols : u.rows;
                for (let cv of covers) {
                    if (!coverComb.includes(cv)) {
                        let cellIdx = baseType === 'row' ? (baseIdx * 9 + cv) : (cv * 9 + baseIdx);
                        finCells.push(cellIdx);
                    }
                }
            }
            
            if (finCells.length === 0) continue;
            
            const boxes = new Set(finCells.map(idx => getBoxIndex(idx)));
            if (boxes.size === 1) {
                const finBox = [...boxes][0];
                
                let targetCells = [];
                for (let cv of coverComb) {
                    for (let i = 0; i < 9; i++) {
                        if (baseIndices.includes(i)) continue;
                        
                        let cellIdx = baseType === 'row' ? (i * 9 + cv) : (cv * 9 + i);
                        if (getBoxIndex(cellIdx) === finBox) {
                            if (candidates[cellIdx].includes(num)) {
                                targetCells.push(cellIdx);
                            }
                        }
                    }
                }
                
                if (targetCells.length > 0) {
                    return executeElimination(candidates, num, targetCells, N, baseType, finCells);
                }
            }
        }
    }
    return null;
}

function getCombinations(array, k) {
    const result = [];
    function backtrack(start, combo) {
        if (combo.length === k) {
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

function executeElimination(candidates, num, targetCells, N, baseType, finCells) {
    let newCandidates = candidates.map(c => [...c]);
    let affected = [];
    for (let idx of targetCells) {
        newCandidates[idx] = newCandidates[idx].filter(n => n !== num);
        affected.push(getCoord(idx));
    }
    
    // Sashimi es cuando una de las bases no tiene candidatos en una cover comb. 
    // Por simplicidad en la UI lo llamamos Sashimi/Finned genérico según N.
    const fishName = N === 2 ? 'Finned/Sashimi X-Wing' : 'Finned/Sashimi Swordfish';
    const baseStr = baseType === 'row' ? 'Filas' : 'Columnas';
    const finStr = finCells.map(i => getCoord(i)).join(', ');
    
    return {
        type: 'NOTES_UPDATE',
        candidates: newCandidates,
        reason: `${fishName} (${baseStr}) del ${num}. Aleta en ${finStr}. Eliminado de: ${affected.join(', ')}`
    };
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}
