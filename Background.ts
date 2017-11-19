/// <reference path="GameObject.ts"/>

class Background extends GameObject {
  z = -200;

  readonly pattern: CanvasPattern;

  constructor(game: Game) {
    super(game);
  
    this.pattern = game.context.createPattern(this.backgroundImage, 'repeat');
  }

  @fillWithImage('grass.jpeg')
  private backgroundImage: HTMLImageElement;

  tick(dt: number) {
    this.x -= this.backgroundImage.width * dt / (1000 * 25);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.pattern;
    ctx.translate(this.x, this.y);
    ctx.fillRect(-this.x, -this.y, ctx.canvas.width, ctx.canvas.height);
  }
}
