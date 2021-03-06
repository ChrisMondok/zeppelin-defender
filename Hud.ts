/// <reference path="GameObject.ts"/>

class Hud extends GameObject {
  z = 999999;

  scoreDigits: Digit[] = [];

  readonly padding = 24;

  private dt: number = 0;

  private readonly messageGradient: CanvasGradient;

  @fillWithImage('images/title.png')
  private titleImage : HTMLImageElement;

  @fillWithImage(navigator.userAgent.indexOf('Xbox') === -1 ? 'images/title2.png' : 'images/titlex.png')
  private titleImageWithPressStart : HTMLImageElement;

  constructor(game: Game) {
    super(game);
    const g = this.messageGradient = game.context.createLinearGradient(0, 0, 0, game.context.canvas.height);
    g.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    g.addColorStop(0.25, 'transparent');
    g.addColorStop(0.75, 'transparent');
    g.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  }

  tick(dt: number) {
    this.dt = dt;

    this.updateScore();
  }

  draw(context: CanvasRenderingContext2D) {
    //this.drawFPS(context);
    this.drawLives(context);
    this.drawAmmo(context);

    if(this.game.paused) this.drawMessage(context, 'Paused');
    else if(this.game.isOver()) this.drawGameOver(context);
    else if(this.game.wave.duration < Wave.initialDelay) this.drawMessage(context, 'Wave', this.game.wave.number.toString());
  }

  private updateScore() {
    const score = this.shouldShowHighScore() ? Game.highScore : this.game.score;
    while(Math.max(5, Math.floor(Math.log10(score) + 1)) > this.scoreDigits.length) {
      const d = new Digit(this.game)
      this.scoreDigits.push(d);
      d.x = this.game.context.canvas.width - this.padding - this.scoreDigits.length * Digit.width;
      d.y = this.padding;
    }

    for(let i = 0; i < this.scoreDigits.length; i++) {
      const d = this.scoreDigits[i];
      d.number = Math.floor(score / Math.pow(10, i)) % 10;
    }
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

  private drawAmmo(context: CanvasRenderingContext2D) {
    const player: Player|undefined = this.game.getObjectsOfType(Player)[0];
    if(!player) return;

    context.save();

    const rotation = clamp((player.fireCooldown / (Player.reloadTime / 3)), 0, 1) * Math.PI / 3;

    const radius = 32;
    context.translate(this.padding + radius, context.canvas.height - this.padding - radius);
    context.rotate(rotation - Math.PI / 2);
    context.beginPath();

    context.fillStyle = 'silver';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    for(let i = 0; i < 6; i++) {
      const x = Math.cos(Math.PI * i/3) * radius/2;
      const y = Math.sin(Math.PI * i/3) * radius/2;
      context.arc(x, y, radius/2, 0, 2 * Math.PI);
    }

    context.stroke();
    context.fill();

    for(let i = 0; i < 6 ; i++) {
      context.beginPath();
      const x = Math.cos(Math.PI * i/3) * radius/1.8;
      const y = Math.sin(Math.PI * i/3) * radius/1.8;
      context.arc(x, y, radius/5, 0, 2 * Math.PI);
      context.fillStyle = i < player.ammo ? 'gold' : 'black';
      context.fill();
      context.stroke();
    }

    context.restore();
  }

  private drawGameOver(context: CanvasRenderingContext2D) {
    if(this.game.hasPlayed) {
      this.drawMessage(context, 'Game Over');
      if(Math.floor(this.game.timeSpentWithNoPlayers / 1000) % 2) {
        context.font = "24px 'Poiret One'";
        context.fillStyle = 'white';
        const message2 = navigator.userAgent.indexOf('Xbox') === -1 ? 'Press Start or Space' : 'Press A';
        drawTextOutlined(context, message2, this.game.center.x, this.game.center.y + 24);
      }
    } else {
      if(Math.floor(this.game.timeSpentWithNoPlayers / 1000) % 2) {
        context.drawImage(this.titleImage, 50,25, 640, 480);
      } else {
        context.drawImage(this.titleImageWithPressStart, 50,25, 640, 480);
      }
    }

    const scoreMessage = this.shouldShowHighScore() ? 'High Score' : 'Your Score';
    context.font = "24px 'Poiret One'";
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    const x = this.scoreDigits.map(d => d.x).reduce((a, b) => Math.min(a, b)) - this.padding;
    drawTextOutlined(context, scoreMessage, x, this.padding + Digit.height / 2);
  }

  private shouldShowHighScore() {
    if(!this.game.isOver()) return false;
    if(!this.game.hasPlayed) return true;
    return Math.floor(this.game.timeSpentWithNoPlayers / 3000) % 2 == 1;
  }

  private drawMessage(context: CanvasRenderingContext2D, ...lines: string[]) {
    const lineHeight = 72;
    context.fillStyle = this.messageGradient;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = lineHeight+"px 'Poiret One'";
    context.fillStyle = 'white';
    context.strokeStyle = 'black';

    for(let i = 0; i < lines.length; i++) {
      const yOffset = lines.length * lineHeight / -2 + lineHeight * i;
      drawTextOutlined(context, lines[i], context.canvas.width/2, context.canvas.height/2 + yOffset);
    }
  }
}

function drawTextOutlined(context: CanvasRenderingContext2D, text: string, x: number, y: number) {
  context.lineWidth = 2;
  context.strokeText(text, x, y);
  context.fillText(text, x, y);
}

class Digit extends GameObject {
  number = 0;

  z = Infinity;

  static readonly height = 36;
  static readonly width = 32;

  private static textHeight = 24;

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
