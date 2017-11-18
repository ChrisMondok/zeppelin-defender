window.addEventListener('load', function() {
  let game = (window as any).game = new Game();

  const counter = new FPSCounter(game);

  requestAnimationFrame(draw);

  function draw(ts: number) {
    game.tick(ts);
    game.draw();
    requestAnimationFrame(draw);
  }
});
