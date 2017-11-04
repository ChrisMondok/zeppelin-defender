window.addEventListener('load', function() {
  let game = new Game();

  game.spawn(Player);

  requestAnimationFrame(() => game.draw());
});

interface GameObject {
  draw(): void;
}

class Game {
  readonly context: CanvasRenderingContext2D;

  private readonly drawables: GameObject[] = [];

  constructor () {
    const canvas = document.querySelector('canvas')!;
    this.context = canvas.getContext('2d')!;
  }

  spawn(thing: {new(game: Game): GameObject}) {
    const x = new thing(this);
    this.drawables.push(x);
  }

  draw() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    for(let i = 0; i < this.drawables.length; i++) {
      this.drawables[i].draw();
    }
  }
}

class Player implements GameObject {
  x = 128;
  y = 128;

  constructor(readonly game: Game) {}

  draw() {
    this.game.context.beginPath();
    this.game.context.fillStyle = 'red';
    this.game.context.arc(this.x, this.y, 12, 0, 2 * Math.PI);
    this.game.context.fill();
  }
}
