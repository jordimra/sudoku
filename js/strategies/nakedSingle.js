export function solveNakedSingle(board, candidates) {
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0 && candidates[i].length === 1) {
            return {
                index: i,
                value: candidates[i][0],
                reason: `Naked Single: Único candidato posible es ${candidates[i][0]}`
            };
        }
    }
    return null;
}