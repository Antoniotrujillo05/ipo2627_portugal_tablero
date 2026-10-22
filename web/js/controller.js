const MIME_TYPE = "application/json";

export class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.selectedIndex = null;
    this.draggedIndex = null;
    this.isFinished = false;
    this.dimensionInput = document.querySelector("#dimension");
    this.bindEvents();
    this.maxDimension = this.view.getMaximumDimension();
    this.startGame();
  }

  bindEvents() {
    document.querySelector("#new-game").addEventListener("click", () => this.startGame());
    document.querySelector("#settings-form").addEventListener("change", (event) => this.handleSettingsChange(event));
    this.dimensionInput.addEventListener("change", () => this.handleDimensionChange());
    this.dimensionInput.addEventListener("input", () => {
      const value = Number(this.dimensionInput.value);
      if (Number.isInteger(value) && value > this.maxDimension) {
        this.dimensionInput.value = String(this.maxDimension);
      }
    });
    window.addEventListener("resize", () => this.handleViewportResize());

    this.view.board.addEventListener("click", (event) => {
      const cell = event.target.closest("[data-cell-index]");
      if (cell) this.handleCellSelection(Number(cell.dataset.cellIndex));
    });
    this.view.board.addEventListener("dragstart", (event) => this.handleDragStart(event));
    this.view.board.addEventListener("dragend", (event) => event.target.closest("[data-cell-index]")?.classList.remove("cell--dragging"));
    this.view.board.addEventListener("dragover", (event) => this.handleDragOver(event));
    this.view.board.addEventListener("dragleave", (event) => event.target.closest("[data-cell-index]")?.classList.remove("cell--drop-target"));
    this.view.board.addEventListener("drop", (event) => this.handleDrop(event));
  }

  startGame(statusMessage = "Partida nueva. ¡Encuentra el orden!") {
    this.refreshDimensionLimit();
    const dimension = this.readDimension();
    if (dimension === null) return;
    this.isFinished = false;
    this.model.startNewGame(dimension);
    this.selectedIndex = null;
    this.view.renderBoard(this.model.cells, dimension);
    this.view.setBoardFinished(false);
    this.view.setWinState(false);
    this.view.setStatus(statusMessage);
    this.view.setHint("Selecciona dos fichas o arrastra una.");
  }

  refreshDimensionLimit() {
    this.maxDimension = this.view.getMaximumDimension();
    this.view.setDimensionLimit(this.maxDimension);
  }

  readDimension() {
    const dimension = Number(this.dimensionInput.value);
    if (!Number.isInteger(dimension) || dimension < 3 || dimension > this.maxDimension) {
      this.view.setInputError(`Introduce un número entero entre 3 y ${this.maxDimension}, según el espacio y tamaño actuales.`);
      return null;
    }
    this.dimensionInput.setCustomValidity("");
    return dimension;
  }

  handleDimensionChange() {
    if (this.readDimension() !== null) this.startGame();
  }

  handleSettingsChange(event) {
    if (event.target.name === "dimension") return;
    let statusMessage = "Partida nueva. ¡Encuentra el orden!";
    if (event.target.name === "piece-size") {
      this.view.setSize(event.target.value);
      this.refreshDimensionLimit();
      if (Number(this.dimensionInput.value) > this.maxDimension) {
        this.dimensionInput.value = String(this.maxDimension);
        statusMessage = `Se ajustó el tablero a ${this.maxDimension} × ${this.maxDimension} para que quepa.`;
      }
    }
    if (event.target.name === "palette") this.view.setPalette(event.target.value);
    if (event.target.name === "shape-set") this.view.setShapeSet(event.target.value);
    this.startGame(statusMessage);
  }

  handleViewportResize() {
    this.refreshDimensionLimit();
    if (Number(this.dimensionInput.value) > this.maxDimension) {
      this.dimensionInput.value = String(this.maxDimension);
      this.startGame(`El tablero se ajustó a ${this.maxDimension} × ${this.maxDimension} para que quepa en pantalla.`);
    }
  }

  handleCellSelection(index) {
    if (this.isFinished) return;

    if (this.selectedIndex === null) {
      this.selectedIndex = index;
      this.view.renderBoard(this.model.cells, this.model.dimension, index);
      this.view.setStatus("Primera ficha seleccionada. Elige otra para intercambiar.");
      this.focusCell(index);
      return;
    }

    if (this.selectedIndex === index) {
      this.selectedIndex = null;
      this.view.renderBoard(this.model.cells, this.model.dimension);
      this.view.setStatus("Selección cancelada.");
      this.focusCell(index);
      return;
    }

    this.swapAndRender(this.selectedIndex, index);
  }

  handleDragStart(event) {
    if (this.isFinished) {
      event.preventDefault();
      return;
    }

    const cell = event.target.closest("[data-cell-index]");
    if (!cell) return;
    this.draggedIndex = Number(cell.dataset.cellIndex);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(MIME_TYPE, JSON.stringify({ index: this.draggedIndex }));
    cell.classList.add("cell--dragging");
  }

  handleDragOver(event) {
    if (this.isFinished) return;

    const cell = event.target.closest("[data-cell-index]");
    if (!cell) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    cell.classList.add("cell--drop-target");
  }

  handleDrop(event) {
    if (this.isFinished) {
      event.preventDefault();
      return;
    }

    const targetCell = event.target.closest("[data-cell-index]");
    if (!targetCell) return;
    event.preventDefault();
    targetCell.classList.remove("cell--drop-target");

    try {
      const payload = JSON.parse(event.dataTransfer.getData(MIME_TYPE));
      const sourceIndex = payload.index;
      const targetIndex = Number(targetCell.dataset.cellIndex);
      if (Number.isInteger(sourceIndex)) this.swapAndRender(sourceIndex, targetIndex);
    } catch {
      this.view.setStatus("No se pudo realizar el intercambio. Prueba de nuevo.");
    }
    this.draggedIndex = null;
  }

  swapAndRender(firstIndex, secondIndex) {
    if (this.isFinished || !this.model.swap(firstIndex, secondIndex)) return;
    this.selectedIndex = null;
    this.view.renderBoard(this.model.cells, this.model.dimension);
    this.focusCell(secondIndex);

    if (this.model.isComplete()) {
      this.isFinished = true;
      this.view.setBoardFinished(true);
      this.view.setWinState(true);
      this.view.setStatus("¡Lo has conseguido! Cada fila está completa. El tablero queda bloqueado.", true);
      this.view.board.querySelectorAll(".cell").forEach((cell) => {
        cell.classList.add("cell--win");
      });
    } else {
      this.view.setStatus("Intercambio hecho. Sigue buscando el orden.");
    }
  }

  focusCell(index) {
    this.view.board.querySelector(`[data-cell-index="${index}"]`)?.focus();
  }
}
