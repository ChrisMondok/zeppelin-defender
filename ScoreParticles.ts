class ScoreParticles extends GameObject {
  ttl = ScoreParticles.ttl;

  z = 10000;

  private static readonly ttl = 1000;

  readonly deltaScore: string;

  constructor(game: Game, deltaScore: number, position: Point) {
    super(game);
    this.x = position.x;
    this.y = position.y;
    this.deltaScore = `+ ${deltaScore.toString()}`;
  }

  tick(dt: number) {
    this.ttl -= dt;
    this.y -= dt/16;
    if(this.ttl < 0) this.destroy();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "14px 'Poiret One'";
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.strokeText(this.deltaScore, this.x, this.y);
    ctx.fillText(this.deltaScore, this.x, this.y);
  }
}
