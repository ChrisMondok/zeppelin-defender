window.addEventListener('load', function() {
  let game = new Game();

  if(navigator.getGamepads()[0]) {
    game.add(new Player(game, 0));
    game.add(new FPSCounter(game));
  }

  window.addEventListener('gamepadconnected', (e: Event&{gamepad: Gamepad}) => {
    game.add(new Player(game, e.gamepad.index));
  });

  requestAnimationFrame(draw);

  function draw(ts: number) {
    game.tick(ts);
    game.draw();
    requestAnimationFrame(draw);
  }
});

