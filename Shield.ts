class Shield extends GameObject {
  direction = 0;
  x = 0;
  y = 0;
  z = 0;
  width = 48;
  thickness = 16;

  static MaxPower = 125;

  power = Shield.MaxPower;

  tick(dt: number) {
    this.power = Math.max(0, this.power - dt);
    for(const projectile of this.game.getObjectsOfType(Projectile)) {
      if(projectile.team != 'PLAYER' && this.occludes(projectile)) {
        this.deflect(projectile);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.x, this.y);
    ctx.rotate(this.direction);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = this.power ? 'red' : 'grey';
    ctx.fillRect(-this.thickness/2, -this.width/2, this.thickness, this.width);
    ctx.strokeRect(-this.thickness/2, -this.width/2, this.thickness, this.width);
  }

  occludes(point: Point) {
    const dist = Math.sqrt(distanceSquared(this, point));
    const dir = direction(this, point) - this.direction;
    const localX = Math.cos(dir) * dist;
    const localY = Math.sin(dir) * dist;
    return Math.abs(localX) < this.thickness/2 && Math.abs(localY) < this.width/2;
  }

  private deflect(projectile: Projectile) {
    if(this.power) {
      projectile.team = 'PLAYER';
      projectile.direction = this.direction;
      projectile.speed *= 2;
    }
    else projectile.destroy();
  }
}
