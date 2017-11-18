/// <reference path="GameObject.ts"/>

@queryable
class SlidingThrowingEnemy extends GameObject {
  xpid: PID;
  ypid: PID;
  target = {x:300, y:200};
  currentTarget?: Point;
  ai: AI;
  private velocity = {x:0, y:0};
  private acceleration = {x:0, y:0};
  readonly MAX_VELOCITY = 5;
  readonly MAX_ACCELERATION = 2;
  z = 2;
  
  constructor(game: Game, readonly center: Point) {
    super(game);
    this.x = this.center.x;
    this.y = this.center.y;
    this.xpid = new PID(0.12,0.00003,2);
    this.ypid = new PID(0.12,0.00003,2);
    this.ai = new AI(this.game, this, [
      new WaitMove(this, 500),
      new DestinationMove(this, { x: 100, y: 100 }),
      new WaitMove(this, 500),
      new DestinationMove(this, { x: 300, y: 300 }),
    ]);
  }

  tick(dt: number) {
    const directive = this.ai.step(dt);
    this.currentTarget = directive.destination;
    if(this.currentTarget) {
      this.seekTarget(this.currentTarget, dt)
    }
    this.applyAccelerationAndVelocity();
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = 'green';
    context.arc(this.x, this.y, 25, 0, 2 * Math.PI);
    context.fill();
  }

  private applyAccelerationAndVelocity() {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.velocity = clamp(this.velocity, this.MAX_VELOCITY);
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  private findTarget() {
    this.currentTarget = Object.create(this.target);
  }

  private seekTarget(target: Point, dt: number) {
    let dx = target.x - this.x;
    let dy = target.y - this.y;
    let accx = this.xpid.step(dt, dx)
    let accy = this.ypid.step(dt, dy);

    this.acceleration = clamp({x:accx, y:accy}, this.MAX_ACCELERATION);
  }

}
