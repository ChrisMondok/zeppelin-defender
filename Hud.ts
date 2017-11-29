/// <reference path="GameObject.ts"/>

class Hud extends GameObject {
  z = Infinity;

  scoreDigits: Digit[] = [];

  readonly padding = 24;

  private dt: number = 0;

  tick(dt: number) {
    this.dt = dt;

    this.updateScore();
  }

  draw(context: CanvasRenderingContext2D) {
    this.drawFPS(context);
    this.drawLives(context);
    this.drawScore(context);
  }

  private updateScore() {
    while(Math.max(3, Math.floor(Math.log10(this.game.score) + 1)) > this.scoreDigits.length) {
      const d = new Digit(this.game)
      this.scoreDigits.push(d);
      d.x = this.game.context.canvas.width - this.padding - this.scoreDigits.length * Digit.width;
      d.y = this.padding;
    }

    for(let i = 0; i < this.scoreDigits.length; i++) {
      const d = this.scoreDigits[i];
      d.number = Math.floor(this.game.score / Math.pow(10, i)) % 10;
    }
  }

  private drawScore(context: CanvasRenderingContext2D) {
  }

  private drawFPS(context: CanvasRenderingContext2D) {
    const fps = Math.round(1000 / this.dt);
    context.font = "12px 'Poiret One'";
    context.beginPath();
    context.strokeStyle='black';
    context.strokeText(fps.toString(), 10, context.canvas.height - 10);
  }

  private drawLives(context: CanvasRenderingContext2D) {
    for(let i = 0; i < this.game.lives; i++) {
      context.beginPath();
      context.fillStyle = 'red';
      context.arc(this.padding + 32 * i, this.padding, 12, 0, 2 * Math.PI, false);
      context.fill();
    }
  }
}

class Digit extends GameObject {
  number = 0;

  z = Infinity;

  static readonly height = 48;
  static readonly width = 42;

  private static textHeight = 32;

  private offset = 0;

  tick(dt: number) {
    const targetOffset = Digit.textHeight * this.number;
    while(this.offset > targetOffset) this.offset -= Digit.textHeight * 10;
    this.offset = (10 * this.offset + targetOffset)/11;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = this.getGradient(ctx);

    ctx.beginPath();
    ctx.rect(0, 0, Digit.width, Digit.height);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.clip();
    ctx.font = Digit.textHeight + "px 'Poiret One'";
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for(let i = -10; i < 10; i++) {
      ctx.fillText(((i + 10)%10).toString(), Digit.width/2, i * Digit.textHeight + Digit.height/2 - this.offset);
    }
    ctx.restore();
  }

  private getGradient(ctx: CanvasRenderingContext2D) {
    if(!Digit.gradient) {
      const g = Digit.gradient = ctx.createLinearGradient(0, 0, 0, Digit.height);
      g.addColorStop(0, '#333');
      g.addColorStop(0.5, 'white');
      g.addColorStop(1, '#333');
    }
    return Digit.gradient;
  }

  private static gradient: CanvasGradient;
}
