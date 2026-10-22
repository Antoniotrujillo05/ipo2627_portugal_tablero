(() => {
  const { GameModel, GameView, GameController } = window.EnFila;

  const model = new GameModel();
  const view = new GameView();
  new GameController(model, view);

})();
