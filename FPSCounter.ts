/// <reference path="GameObject.ts"/>

class FPSCounter extends GameObject {
  x = 10;
  y = 10;
  z = Infinity;

  private dt: number = 0;

  tick(dt: number) {
    this.dt = dt;
  }

  draw(context: CanvasRenderingContext2D) {
    const fps = Math.round(1000 / this.dt);
    context.beginPath();
    context.strokeStyle='black';
    context.strokeText(fps.toString(), this.x, this.y);
  }
}
