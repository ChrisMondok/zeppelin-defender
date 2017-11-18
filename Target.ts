@queryable
class Target implements GameObject {
  readonly velocity = {x: 0, y: .5};
  readonly width = 20;
  readonly height = 20;
  z = 0;
  hit = false;

  constructor(readonly game : Game, public x: number, public y: number){}

  tick(dt: number) {
    var bullets = this.game.getObjectsOfType(Projectile);
    bullets.forEach(element => {
      if((element.x >= this.x && element.x <= (this.x + this.width)) && (element.y >= this.y && element.y <= (this.y + this.height))){
        this.hit = true;
      }
    });
    if(this.hit){
      this.game.remove(this);
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = 'blue';
    context.rect(this.x, this.y, this.width, this.height);
    context.fill();
  }
}
