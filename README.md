# 🧩 Sudoku Master - Web & Solver

![Estado](https://img.shields.io/badge/Estado-Terminado-success)
![Tecnología](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JS-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-orange)

**Sudoku Master** es una aplicación web moderna diseñada no solo para jugar, sino para enseñar y resolver Sudokus utilizando lógica humana avanzada. A diferencia de los solucionadores básicos que solo usan fuerza bruta, este proyecto implementa estrategias complejas paso a paso.

## ✨ Características Principales

### 🎮 Experiencia de Juego
* **Diseño 100% Responsivo:** Interfaz optimizada para Escritorio, Tablet y Móvil (tanto en vertical como en horizontal).
* **Entrada Flexible:** Juega usando el teclado físico o el panel numérico táctil en pantalla.
* **Ayudas Visuales:**
    * Detección de errores en tiempo real (Rojo intenso).
    * Resaltado de números iguales y celdas relacionadas.
    * Efecto visual de selección ("Marching Ants").
* **Gestión de Estado:** Sistema robusto de Deshacer (Undo), Reiniciar tablero y Modo Notas.

### 🧠 Motor de Lógica (Solver IA)
El núcleo del proyecto es un algoritmo híbrido capaz de resolver niveles "Ultra Extremos" explicando el razonamiento lógico.

**Estrategias implementadas:**
- [x] **Básicas:** Naked/Hidden Singles.
- [x] **Intermedias:** Naked Pairs/Triples/Quads, Hidden Pairs/Triples/Quads, Intersection Removal (incluye Box Line Reduction).
- [x] **Avanzadas:** X-Wing, XY-Wing, XYZ-Wing, W-Wing, Simple Colors.
- [x] **Expertas:** Swordfish, Jellyfish, Finned/Sashimi Fish, Skyscraper, Empty Rectangle, Sue de Coq, Unique Rectangles (Tipos 1,2,4), BUG+1.
- [x] **Maestras (Cadenas):** Forcing Chains (cubre universalmente X-Cycles, AIC y 3D Medusa).
- [x] **Backtracking:** Para generación de tableros y validación instantánea.

### 💾 Persistencia de Datos
* **Guardar/Cargar:** Exportación e importación de partidas en formato `.json` (incluye tablero, notas e historial).
* **Validación de Archivos:** Chequeo de integridad al cargar partidas externas.

## 🚀 Instalación y Uso

Este proyecto es una aplicación **Frontend**, por lo que no requiere instalación de dependencias complejas.

### Opción 1: Ejecutar localmente
1. Clona este repositorio:
   `git clone https://github.com/jordimra/sudoku`
2. Navega a la carpeta del proyecto.
3. Abre el archivo `index.php` (o `index.html`) en tu navegador favorito.

### Opción 2: Servidor Local (Recomendado)
Para una mejor experiencia con los módulos de JavaScript, usa una extensión como **Live Server** en VS Code o levanta un servidor simple:

`python -m http.server 8000`

## 📂 Estructura del Proyecto
```
sudoku-master/
├── index.php              # Estructura HTML principal
├── style.css              # Estilos con CSS Grid y Media Queries
├── js/
│   ├── main.js            # Controlador principal (Eventos, UI)
│   ├── utils.js           # Funciones de ayuda (Validaciones)
│   └── strategies/        # Algoritmos de resolución modulares
│       ├── backtracking.js
│       ├── hiddenPairs.js
│       ├── skyscraper.js
│       ├── swordfish.js
│       └── ... (otras estrategias)
└── README.md              # Documentación
```
## 🛠 Tecnologías

* **HTML5:** Semántica y estructura.
* **CSS3:** Variables CSS, Grid Layout, Flexbox y Animaciones.
* **JavaScript (ES6+):** Módulos nativos (`import/export`) para una arquitectura limpia sin dependencias externas.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si quieres añadir una nueva estrategia de resolución (como *Jellyfish* o *AIC*):

1. Haz un Fork del repositorio.
2. Crea una rama para tu feature (`git checkout -b feature/NuevaEstrategia`).
3. Haz Commit de tus cambios (`git commit -m 'Add NuevaEstrategia'`).
4. Haz Push a la rama (`git push origin feature/NuevaEstrategia`).
5. Abre un Pull Request.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
