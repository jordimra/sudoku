<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Sudoku Final</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="main-container">
    <h1>Sudoku Master</h1>
    
    <div class="top-controls">
        
        <div class="control-group-game">
            <label for="difficulty-selector">Dificultad:</label>
            <select id="difficulty-selector">
                <option value="25">Muy fácil</option>
                <option value="32">Fácil</option>
                <option value="40" selected>Moderado</option>
                <option value="46">Desafiante</option>
                <option value="50">Complicado</option>
                <option value="54">Difícil</option>
                <option value="57">Muy difícil</option>
                <option value="60">Extremo</option>
                <option value="64">Ultra extremo</option>
            </select>
            <button id="btn-new">Nuevo Juego</button>
            <button id="btn-reset" class="btn-warning" title="Borrar progreso y empezar este mismo tablero">Reiniciar</button>
        </div>

        <div class="control-group-file">
            <div class="file-buttons">
                <button id="btn-export" style="background-color: #17a2b8;">Guardar</button>
                <button id="btn-import" style="background-color: #17a2b8;">Cargar</button>
            </div>
            
            <div class="file-options">
                <label title="Incluir los números que has escrito tú">
                    <input type="checkbox" id="chk-save-values" checked> Valores
                </label>
                
                <label title="Incluir notas (lápiz)">
                    <input type="checkbox" id="chk-save-notes" checked> Notas
                </label>
                <label title="Incluir el historial de pasos">
                    <input type="checkbox" id="chk-save-history" checked> Historial
                </label>
            </div>
        </div>

        <input type="file" id="file-input" accept=".json" style="display: none;">
    </div>

    <div class="game-area">
        
        <div class="board-wrapper">
            <div class="label-corner"></div>
            <div class="col-labels">
                <?php for($i=1; $i<=9; $i++) echo "<div>$i</div>"; ?>
            </div>
            <div class="row-labels">
                <?php foreach(range('A', 'I') as $letter) echo "<div>$letter</div>"; ?>
            </div>
            <div class="sudoku-board" id="board">
                <?php
                for ($i = 0; $i < 81; $i++) {
                    $row = floor($i / 9);
                    $col = $i % 9;
                    echo "<div class='cell' data-index='$i' data-row='$row' data-col='$col' onclick='selectCell(this)'>";
                    echo "<span class='value'></span><div class='notes'></div>";
                    echo "</div>";
                }
                ?>
            </div>
        </div>

        <div class="sidebar">
            <div class="sidebar-header">Historial</div>
            <div id="sudoku-history-log">
                <div class="history-item empty">Historial vacío</div>
            </div>
            <div class="sidebar-footer">
                <button id="btn-undo" class="btn-warning">Deshacer Último Paso</button>
            </div>
        </div>

    </div>

    <div class="resolution-area">
        <span class="zone-label">Ayudas:</span>
        <button id="btn-calc-notes" class="btn-solve" style="background:#6c757d;">Recalcular Notas</button>
        <button id="btn-step" class="btn-solve">Paso a Paso</button>
        <button id="btn-auto" class="btn-solve">Resolver Auto</button>
    </div>

    <div class="bottom-area">
        <div class="tools-left">
            <button id="btn-notes" class="btn-big">Modo Notas: OFF</button>
        </div>

        <div class="numpad">
            <?php for($i=1; $i<=9; $i++) echo "<button onclick='inputNumber($i)'>$i</button>"; ?>
            <button class="btn-delete" onclick="inputNumber(0)" title="Borrar">🗑️</button>        </div>
    </div>

</div>

<script type="module" src="js/main.js"></script>
</body>
</html>