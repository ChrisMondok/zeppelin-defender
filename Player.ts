class Player implements GameObject {
  x = 128;
  y = 128;
  z = 0;
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

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(this.x, this.y, 12, 0, 2 * Math.PI);
    context.fill();

    context.beginPath();
    context.strokeStyle = 'black';
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + (Math.sin(this.dir) * 12), this.y + (Math.cos(this.dir) * 12))
    context.stroke()
  }

  fireProjectile() {
    this.game.add(new Projectile(this.game, this.x, this.y, this.dir));
  }
}

function isDeadZone(x: number, y: number) {
  return Math.abs(x)<0.2 && Math.abs(y)<0.2;
}
