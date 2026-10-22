(() => {
  const TYPES = ["one", "two", "three"];

  class GameModel {
    constructor(dimension = 4) {
      this.dimension = dimension;
      this.cells = [];
      this.startNewGame(dimension);
    }

    startNewGame(dimension = this.dimension) {
      this.dimension = dimension;
      const solved = [];

      for (let row = 0; row < dimension; row += 1) {
        const type = TYPES[row % TYPES.length];
        for (let column = 0; column < dimension; column += 1) solved.push(type);
      }

      this.cells = this.#shuffle(solved);
      if (this.isComplete()) {
        const differentTypeIndex = this.cells.findIndex((type, index) => index > 0 && type !== this.cells[0]);
        if (differentTypeIndex > 0) this.#swapValues(0, differentTypeIndex);
      }
      return this.cells;
    }

    swap(firstIndex, secondIndex) {
      if (firstIndex === secondIndex || !this.cells[firstIndex] || !this.cells[secondIndex]) return false;
      this.#swapValues(firstIndex, secondIndex);
      return true;
    }

    isComplete() {
      for (let row = 0; row < this.dimension; row += 1) {
        const firstType = this.cells[row * this.dimension];
        for (let column = 1; column < this.dimension; column += 1) {
          if (this.cells[row * this.dimension + column] !== firstType) return false;
        }
      }
      return true;
    }

    #swapValues(firstIndex, secondIndex) {
      [this.cells[firstIndex], this.cells[secondIndex]] = [this.cells[secondIndex], this.cells[firstIndex]];
    }

    #shuffle(values) {
      const shuffled = [...values];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }
      return shuffled;
    }
  }

  window.EnFila = window.EnFila || {};
  window.EnFila.GameModel = GameModel;

})();
