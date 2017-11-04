window.addEventListener('load', function() {
  let game = new Game();

  if(navigator.getGamepads()[0]) {
    game.add(new Player(game, 0));
  }

  window.addEventListener('gamepadconnected', (e: any) => {
    console.log('got a gamepad');
    game.add(new Player(game, e.gamepad));
  });

  requestAnimationFrame(draw);

  function draw() {
    game.tick();
    game.draw();
    requestAnimationFrame(draw);
  }
});

interface GameObject {
  tick(): void;
  draw(): void;
}

class Game {
  readonly context: CanvasRenderingContext2D;

  private readonly objects: GameObject[] = [];

  constructor () {
    const canvas = document.querySelector('canvas')!;
    this.context = canvas.getContext('2d')!;
  }

  add(thing: GameObject) {
    console.log('adding thing');
    this.objects.push(thing);
  }

  tick() {
    for(let o of this.objects) o.tick();
  }

  draw() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    for(let o of this.objects) o.draw();
  }
}

class Player implements GameObject {
  x = 128;
  y = 128;
  gamepadNumber;

  constructor(readonly game: Game, readonly gamepadNumber: number) {}

  tick() {
	this.gamepad = navigator.getGamepads()[this.gamepadNumber];
    this.x += this.gamepad.axes[0] * 10;
    this.y += this.gamepad.axes[1] * 10;
  }

  draw() {
    this.game.context.beginPath();
    this.game.context.fillStyle = 'red';
    this.game.context.arc(this.x, this.y, 12, 0, 2 * Math.PI);
    this.game.context.fill();
  }
}
