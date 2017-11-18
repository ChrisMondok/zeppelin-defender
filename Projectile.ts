@queryable
class Projectile extends GameObject {
  z = 0;
  lifetime = 20;
  speed = 20;

  team: 'PLAYER' | 'ENEMY' = 'ENEMY';

  constructor(readonly game: Game, public x: number, public y: number, public direction: number) {
    super(game);
  }

  tick(dt: number) {
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;
    this.lifetime--;
    if(this.lifetime < 0) {
      this.game.remove(this);
    }
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = 'black';
    context.arc(this.x, this.y, 2, 0, 2 * Math.PI);
    context.fill();
  }
}
