import { getAllCandidates } from '../utils.js';

export function solveNoteCleaner(board, currentCandidates) {
    const realCandidates = getAllCandidates(board); // Matemáticamente posibles
    let modified = false;
    let newCandidates = currentCandidates.map(c => [...c]); // Copia profunda
    let changes = [];
    let isInitialization = false;

    for (let i = 0; i < 81; i++) {
        // Si la celda ya tiene un número puesto (es pista o resuelta), la ignoramos
        if (board[i] !== 0) continue;

        const currentNotes = newCandidates[i];
        const validNotes = realCandidates[i];

        // CASO A: INICIALIZACIÓN
        // Si la celda está vacía y NO TIENE NOTAS, asumimos que el juego acaba de empezar
        // o que necesitamos rellenar candidatos para que la IA pueda pensar.
        if (currentNotes.length === 0) {
            if (validNotes.length > 0) {
                newCandidates[i] = validNotes;
                modified = true;
                isInitialization = true;
            }
        } 
        // CASO B: LIMPIEZA SUSTRACTIVA
        // Si YA TIENE NOTAS, solo borramos las que se han vuelto imposibles.
        // Nunca añadimos nada nuevo para respetar la lógica manual del usuario.
        else {
            const filteredNotes = currentNotes.filter(note => validNotes.includes(note));
            
            if (filteredNotes.length !== currentNotes.length) {
                newCandidates[i] = filteredNotes;
                modified = true;
                changes.push({
                    index: i,
                    oldVal: 0,
                    newVal: 0,
                    oldNotes: currentNotes,
                    newNotes: filteredNotes
                });
            }
        }
    }

    if (modified) {
        if (isInitialization) {
            return {
                type: 'NOTES_UPDATE',
                candidates: newCandidates,
                reason: "Calculados candidatos iniciales"
            };
        } else {
            return {
                type: 'NOTES_UPDATE',
                candidates: newCandidates,
                reason: "Limpieza: Se borraron notas que entraban en conflicto"
            };
        }
    }
    return null;
}