// js/strategies/simpleColors.js

export function solveSimpleColors(board, candidates) {
    for (let num = 1; num <= 9; num++) {
        // Encontrar todos los enlaces fuertes (Strong Links) para el número
        const strongLinks = getStrongLinks(candidates, num);
        if (strongLinks.length === 0) continue;

        // Construir grafo y encontrar clusters conexos
        const clusters = buildColorClusters(strongLinks);

        for (let cluster of clusters) {
            // Un cluster es un array de nodos { cell, color: 1 o 2 }
            
            // Regla 1: Dos celdas del mismo color se ven -> Ese color es falso
            const color1 = cluster.filter(n => n.color === 1).map(n => n.cell);
            const color2 = cluster.filter(n => n.color === 2).map(n => n.cell);

            if (checkColorConflict(color1)) {
                const action = eliminateColor(candidates, num, color1, '1');
                if (action) return action;
            }
            if (checkColorConflict(color2)) {
                const action = eliminateColor(candidates, num, color2, '2');
                if (action) return action;
            }

            // Regla 2: Una celda externa ve a un color 1 y a un color 2 del mismo cluster
            let targetCells = [];
            for (let i = 0; i < 81; i++) {
                if (candidates[i].includes(num) && !color1.includes(i) && !color2.includes(i)) {
                    if (seesAny(i, color1) && seesAny(i, color2)) {
                        targetCells.push(i);
                    }
                }
            }

            if (targetCells.length > 0) {
                let newCandidates = candidates.map(c => [...c]);
                let affected = [];
                for (let t of targetCells) {
                    newCandidates[t] = newCandidates[t].filter(n => n !== num);
                    affected.push(getCoord(t));
                }
                return {
                    type: 'NOTES_UPDATE',
                    candidates: newCandidates,
                    reason: `Simple Colors: El candidato ${num} en ${affected.join(', ')} ve a ambos colores de una cadena. Eliminado.`
                };
            }
        }
    }
    return null;
}

function getStrongLinks(candidates, num) {
    const links = [];
    const units = ['row', 'col', 'box'];
    
    for (let type of units) {
        for (let i = 0; i < 9; i++) {
            let cells = getCellsInUnit(type, i);
            let candsInUnit = cells.filter(c => candidates[c].includes(num));
            if (candsInUnit.length === 2) {
                links.push([candsInUnit[0], candsInUnit[1]]);
            }
        }
    }
    return links;
}

function buildColorClusters(links) {
    const clusters = [];
    const visited = new Set();
    const adj = {};

    for (let [u, v] of links) {
        if (!adj[u]) adj[u] = [];
        if (!adj[v]) adj[v] = [];
        adj[u].push(v);
        adj[v].push(u);
    }

    for (let node in adj) {
        let n = parseInt(node);
        if (!visited.has(n)) {
            let cluster = [];
            let queue = [{ cell: n, color: 1 }];
            visited.add(n);
            
            // BFS para colorear alternamente
            while (queue.length > 0) {
                let current = queue.shift();
                cluster.push(current);
                
                for (let neighbor of adj[current.cell]) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push({ cell: neighbor, color: current.color === 1 ? 2 : 1 });
                    }
                }
            }
            if (cluster.length > 2) clusters.push(cluster);
        }
    }
    return clusters;
}

function checkColorConflict(colorCells) {
    for (let i = 0; i < colorCells.length; i++) {
        for (let j = i + 1; j < colorCells.length; j++) {
            if (cellsSeeEachOther(colorCells[i], colorCells[j])) {
                return true;
            }
        }
    }
    return false;
}

function eliminateColor(candidates, num, colorCells, colorName) {
    let newCandidates = candidates.map(c => [...c]);
    let affected = [];
    for (let cell of colorCells) {
        newCandidates[cell] = newCandidates[cell].filter(n => n !== num);
        affected.push(getCoord(cell));
    }
    return {
        type: 'NOTES_UPDATE',
        candidates: newCandidates,
        reason: `Simple Colors: Conflicto en el color ${colorName} del número ${num}. Eliminado de: ${affected.join(', ')}`
    };
}

function seesAny(cell, group) {
    return group.some(g => cellsSeeEachOther(cell, g));
}

function cellsSeeEachOther(idx1, idx2) {
    if (idx1 === idx2) return false;
    const r1 = Math.floor(idx1 / 9), c1 = idx1 % 9;
    const r2 = Math.floor(idx2 / 9), c2 = idx2 % 9;
    const b1 = Math.floor(r1 / 3) * 3 + Math.floor(c1 / 3);
    const b2 = Math.floor(r2 / 3) * 3 + Math.floor(c2 / 3);
    return r1 === r2 || c1 === c2 || b1 === b2;
}

function getCellsInUnit(type, index) {
    let cells = [];
    if (type === 'row') for(let c=0; c<9; c++) cells.push(index * 9 + c);
    else if (type === 'col') for(let r=0; r<9; r++) cells.push(r * 9 + index);
    else {
        let startRow = Math.floor(index / 3) * 3;
        let startCol = (index % 3) * 3;
        for(let r=0; r<3; r++) for(let c=0; c<3; c++) cells.push((startRow + r) * 9 + (startCol + c));
    }
    return cells;
}

function getCoord(index) {
    return "ABCDEFGHI"[Math.floor(index / 9)] + (index % 9 + 1);
}
