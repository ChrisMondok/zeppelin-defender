/// <reference path="GameObject.ts"/>

class Hud extends GameObject {
  z = Infinity;

  private dt: number = 0;

  tick(dt: number) {
    this.dt = dt;
  }

  draw(context: CanvasRenderingContext2D) {
    this.drawFPS(context);
    this.drawLives(context);
  }

  private drawLives(context: CanvasRenderingContext2D) {
    for(let i = 0; i < this.game.lives; i++) {
      context.beginPath();
      context.fillStyle = 'red';
      context.arc(24 + 32 * i, 24, 12, 0, 2 * Math.PI, false);
      context.fill();
    }
  }

  private drawFPS(context: CanvasRenderingContext2D) {
    const fps = Math.round(1000 / this.dt);
    context.beginPath();
    context.strokeStyle='black';
    context.strokeText(fps.toString(), 10, context.canvas.height - 10);
  }
}
