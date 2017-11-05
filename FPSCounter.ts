class FPSCounter implements GameObject {
  x = 10;
  y = 10;
  z = Infinity;

  private dt: number = 0;

  constructor(readonly game: Game){}
  
  tick(dt: number) {
    this.dt = dt;
  }

  draw(context: CanvasRenderingContext2D) {
    const fps = Math.round(this.dt * (3600 / 1000));
    context.beginPath();
    context.strokeStyle='black';
    context.strokeText(fps.toString(), this.x, this.y);
  }
}
