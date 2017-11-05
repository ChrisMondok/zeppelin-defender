class FPSCounter implements GameObject {
  x = 10;
  y = 10;
  prevTs = 0;
  ts = 0;

  constructor(readonly game: Game){}
  
  tick(ts: number) {
    this.prevTs = this.ts;
    this.ts = ts;
  }

  draw(context: CanvasRenderingContext2D) {
    const fps = Math.round((this.ts - this.prevTs) * (3600 / 1000));
    context.beginPath();
    context.strokeStyle='black';
    context.strokeText(fps.toString(), this.x, this.y);
  }
}
