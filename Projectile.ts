@queryable
class Projectile extends GameObject {
  z = 0;
  speed = 200;

  team: 'PLAYER' | 'ENEMY' = 'ENEMY';

  constructor(readonly game: Game, public x: number, public y: number, public direction: number) {
    super(game);
    const sound = audioContext.createBufferSource();
    sound.buffer = this.fireSoundBuffer;
    sound.connect(audioContext.destination);
    sound.start(0);
  }

  tick(dt: number) {
    this.x += Math.cos(this.direction) * this.speed * dt / 1000;
    this.y += Math.sin(this.direction) * this.speed * dt / 1000;

    if(!this.game.isInBounds(this)) this.destroy();
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = 'black';
    context.arc(this.x, this.y, 2, 0, 2 * Math.PI);
    context.fill();
  }

  @fillWithAudioBuffer('sounds/pew.wav')
  protected fireSoundBuffer: AudioBuffer;
}

@queryable
class Buzzsaw extends Projectile {
  readonly HEIGHT = 20;
  readonly WIDTH = 20;

  @fillWithImage('images/buzzsaw.png')
  private static buzzsawImage : HTMLImageElement;

  @fillWithAudioBuffer('sounds/buzz.wav')
  protected fireSoundBuffer: AudioBuffer;

  draw(context: CanvasRenderingContext2D) {
    context.drawImage(
      Buzzsaw.buzzsawImage, 
      this.x - (this.WIDTH / 2), 
      this.y - (this.HEIGHT / 2), 
      this.WIDTH, 
      this.HEIGHT
    );
  }
}

