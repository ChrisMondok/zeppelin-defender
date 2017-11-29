/// <reference path="Game.ts"/>
/// <reference path="GameObject.ts"/>

@queryable
class Cable extends GameObject {
  radius = 8;

  readonly snapSound: AudioBufferSourceNode;

  constructor(readonly platform: Platform, readonly offset: Point) {
    super(platform.game);
    this.snapSound = audioContext.createBufferSource();
    this.snapSound.buffer = Cable.snapSoundBuffer;
    this.snapSound.connect(audioContext.destination);
  }

  tick() {
    this.x = this.platform.x + this.offset.x;
    this.y = this.platform.y + this.offset.y;

    for(const projectile of this.game.getObjectsOfType(Projectile)) {
      if(distanceSquared(this, projectile) < Math.pow(this.radius, 2)) {
        this.platform.velocity.x += projectile.speed * Math.cos(projectile.direction) / 2;
        this.platform.velocity.y += projectile.speed * Math.sin(projectile.direction) / 2;
        this.destroy();
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.game.center.x, this.game.center.y);
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x - this.game.center.x, this.y - this.game.center.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.x - this.game.center.x, this.y - this.game.center.y);
    ctx.scale(5, 5);
    ctx.lineTo(
      this.platform.center.x + this.offset.x - this.game.center.x,
      this.platform.center.y + this.offset.y - this.game.center.y);
    ctx.stroke();
  }

  destroy() {
    super.destroy();
    this.snapSound.start(0);
  }

  @fillWithAudioBuffer('sounds/snap.ogg')
  private static snapSoundBuffer: AudioBuffer;
}
