/// <reference path="Game.ts"/>
/// <reference path="GameObject.ts"/>

@queryable
class Cable extends GameObject {
  radius = 8;

  destroyed = false;

  constructor(readonly platform: Platform, readonly offset: Point) {
    super(platform.game);
  }

  tick() {
    this.x = this.platform.x + this.offset.x;
    this.y = this.platform.y + this.offset.y;

    for(const projectile of this.game.getObjectsOfType(Projectile)) {
      if(distanceSquared(this, projectile) < Math.pow(this.radius, 2)) {
        this.platform.velocity.x += projectile.speed * Math.cos(projectile.direction) / 2;
        this.platform.velocity.y += projectile.speed * Math.sin(projectile.direction) / 2;
        this.destroy();
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const canvasCenterX = ctx.canvas.width / 2;
    const canvasCenterY = ctx.canvas.height / 2;

    ctx.translate(canvasCenterX, canvasCenterY);
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(this.x - canvasCenterX, this.y - canvasCenterY, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.x - canvasCenterX, this.y - canvasCenterY);
    ctx.scale(5, 5);
    ctx.lineTo(
      this.platform.center.x + this.offset.x - canvasCenterX,
      this.platform.center.y + this.offset.y - canvasCenterY);
    ctx.stroke();
  }

  destroy() {
    super.destroy();
    this.destroyed = true;
  }
}
