@queryable
class Projectile extends GameObject {
  z = 0;
  speed = 200;

  team: 'PLAYER' | 'ENEMY' = 'ENEMY';

  constructor(readonly game: Game, public x: number, public y: number, public direction: number) {
    super(game);
  }

  tick(dt: number) {
    this.x += Math.cos(this.direction) * this.speed * dt / 1000;
    this.y += Math.sin(this.direction) * this.speed * dt / 1000;

    if(!this.game.isInBounds(this)) this.destroy();
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = 'black';
    context.arc(this.x, this.y, 2, 0, 2 * Math.PI);
    context.fill();
  }
}
