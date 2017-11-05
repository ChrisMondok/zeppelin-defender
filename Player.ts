class Player implements GameObject {
  x: number;
  y: number;
  readonly velocity = {x: 0, y: 0};
  z = 0;
  dir = 0;
  firing = false;

  platform: Platform|null;

  constructor(readonly game: Game, readonly gamepadNumber: number) {
    // Whoa this seems fragile.
    this.platform = game.getObjectsOfType(Platform)[0];
    this.x = this.platform.x;
    this.y = this.platform.y;
    this.platform.addContents(this);
  }

  tick(dt: number) {
    const oldVelocity = {x: this.velocity.x, y: this.velocity.y};

    this.handleInput();

    this.x += this.velocity.x * dt/1000;
    this.y += this.velocity.y * dt/1000;

    const dv = {
      x: this.velocity.x - oldVelocity.x,
      y: this.velocity.y - oldVelocity.y,
    };

    if(this.platform) {
      this.platform.velocity.x += dv.x/-5;
      this.platform.velocity.y += dv.y/-5;
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
    context.lineTo(this.x + (Math.cos(this.dir) * 12), this.y + (Math.sin(this.dir) * 12))
    context.stroke()
  }

  fireProjectile() {
    this.game.add(new Projectile(this.game, this.x, this.y, this.dir));
  }

  private handleInput() {
    const gamepad = navigator.getGamepads()[this.gamepadNumber];
    if(!isDeadZone(gamepad.axes[0], gamepad.axes[1])) {
      this.velocity.x = gamepad.axes[0] * 200;
      this.velocity.y = gamepad.axes[1] * 200;
      this.dir = Math.atan2(this.velocity.y,this.velocity.x);
    }
    else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
    if(!this.firing && gamepad.buttons[0].pressed) {
      this.fireProjectile();
      this.firing = true;
    }
    if(!gamepad.buttons[0].pressed) {
      this.firing = false;
    }
  }
}

function isDeadZone(x: number, y: number) {
  return Math.abs(x)<0.2 && Math.abs(y)<0.2;
}
