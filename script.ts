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
    console.log('adding ' + thing.constructor.name);
    this.objects.push(thing);
  }

  remove(thing: GameObject) {
    console.log('removing ' + thing.constructor.name);
    this.objects.splice(this.objects.indexOf(thing), 1);
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
  dir = 0;
  firing = false;

  constructor(readonly game: Game, readonly gamepadNumber: number) {}

  tick() {
    var gamepad = navigator.getGamepads()[this.gamepadNumber];
    if(!isDeadZone(gamepad.axes[0], gamepad.axes[1])) {
      this.x += gamepad.axes[0] * 10;
      this.y += gamepad.axes[1] * 10;
      this.dir = Math.atan2(gamepad.axes[0],gamepad.axes[1]);
    }
    if(!this.firing && gamepad.buttons[0].pressed) {
      this.fireProjectile();
      this.firing = true;
    }
    if(!gamepad.buttons[0].pressed) {
      this.firing = false;
    }
  }

  draw() {
    this.game.context.beginPath();
    this.game.context.fillStyle = 'red';
    this.game.context.arc(this.x, this.y, 12, 0, 2 * Math.PI);
    this.game.context.fill();

    this.game.context.beginPath();
    this.game.context.strokeStyle = 'black';
    this.game.context.moveTo(this.x, this.y);
    this.game.context.lineTo(this.x + (Math.sin(this.dir) * 12), this.y + (Math.cos(this.dir) * 12))
    this.game.context.stroke()
  }

  fireProjectile() {
    this.game.add(new Projectile(this.game, this.x, this.y, this.dir));
  }
}

function isDeadZone(x: number, y: number) {
  return Math.abs(x)<0.2 && Math.abs(y)<0.2;
}
