class Projectile implements GameObject {
  lifetime = 20;
  constructor(readonly game: Game, public x: number, public y: number, public dir: number) {}

  tick() {
    this.x += Math.sin(this.dir) * 20;
    this.y += Math.cos(this.dir) * 20;
    this.lifetime--;
    if(this.lifetime < 0) {
      this.game.remove(this);
    }
  }

  draw() {
    this.game.context.beginPath();
    this.game.context.fillStyle = 'black';
    this.game.context.arc(this.x, this.y, 2, 0, 2 * Math.PI);
    this.game.context.fill();
  }
}
