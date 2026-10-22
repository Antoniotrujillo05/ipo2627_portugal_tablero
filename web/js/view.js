(() => {
  const TYPE_LABELS = { one: "Tipo uno", two: "Tipo dos", three: "Tipo tres" };

  class GameView {
    constructor() {
      this.board = document.querySelector("#board");
      this.boardCard = document.querySelector(".board-card");
      this.status = document.querySelector("#game-status");
      this.boardSize = document.querySelector("#board-size");
      this.boardHint = document.querySelector("#board-hint");
      this.dimensionInput = document.querySelector("#dimension");
      this.dimensionLimit = document.querySelector("#dimension-limit");
      this.shapeSet = "classic";
      this.dimensionInput.setCustomValidity("");
    }

    renderBoard(cells, dimension, selectedIndex = null) {
      const fragment = document.createDocumentFragment();
      this.board.style.setProperty("--board-dimension", dimension);
      this.boardSize.textContent = `${dimension} × ${dimension}`;
      this.board.setAttribute("aria-label", `Tablero de ${dimension} por ${dimension}`);

      cells.forEach((type, index) => {
        const cell = document.createElement("button");
        const row = Math.floor(index / dimension) + 1;
        const column = (index % dimension) + 1;
        const piece = document.createElement("span");

        cell.type = "button";
        cell.className = "cell";
        cell.dataset.cellIndex = String(index);
        cell.draggable = true;
        cell.setAttribute("aria-label", `${TYPE_LABELS[type]}, fila ${row}, columna ${column}`);
        cell.setAttribute("aria-pressed", String(selectedIndex === index));
        if (selectedIndex === index) cell.classList.add("cell--selected");

        piece.className = `piece piece--${type} piece--${this.shapeSet}`;
        piece.setAttribute("aria-hidden", "true");
        cell.append(piece);
        fragment.append(cell);
      });

      this.board.replaceChildren(fragment);
    }

    setStatus(message) {
      this.status.textContent = message;
    }

    setWinState(active) {
      this.boardCard.classList.toggle("board-card--won", active);
      this.boardHint.textContent = active
        ? "Tablero completado. Pulsa Nueva partida para volver a jugar."
        : "Selecciona dos fichas o arrastra una.";
    }

    setBoardFinished(finished) {
      this.board.setAttribute("aria-disabled", String(finished));
      this.board.querySelectorAll(".cell").forEach((cell) => {
        cell.disabled = finished;
      });
    }

    setHint(message) {
      this.boardHint.textContent = message;
    }

    getMaximumDimension() {
      const styles = getComputedStyle(this.board);
      const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const minCellSize = Number.parseFloat(styles.getPropertyValue("--cell-min-size")) * rootFontSize;
      const gap = Number.parseFloat(styles.columnGap);
      const horizontalPadding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const usableWidth = this.board.clientWidth - horizontalPadding;
      const columnsThatFit = Math.floor((usableWidth + gap) / (minCellSize + gap));

      return Math.min(12, Math.max(3, columnsThatFit));
    }

    setDimensionLimit(maximum) {
      this.dimensionInput.max = String(maximum);
      this.dimensionLimit.textContent = `máximo ${maximum}`;
    }

    setSize(size) {
      document.body.dataset.size = size;
    }

    setPalette(palette) {
      document.body.dataset.palette = palette;
    }

    setShapeSet(shapeSet) {
      this.shapeSet = shapeSet;
      document.querySelectorAll(".piece").forEach((piece) => {
        piece.classList.remove("piece--classic", "piece--orbit", "piece--soft");
        piece.classList.add(`piece--${shapeSet}`);
      });
    }

    setInputError(message) {
      this.dimensionInput.setCustomValidity(message);
      this.dimensionInput.reportValidity();
    }
  }

  window.EnFila = window.EnFila || {};
  window.EnFila.GameView = GameView;

})();
