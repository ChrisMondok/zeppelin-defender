/// <reference path="GameObject.ts"/>

@queryable
class SlidingThrowingEnemy extends GameObject {
  xpid: PID;
  ypid: PID;
  target = {x:300, y:200};
  currentTarget: Point;
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
  }

  tick(dt: number) {
    this.findTarget();
    if(this.currentTarget) {
      this.seekTarget(this.currentTarget, dt)
    }
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.velocity = clamp(this.velocity, this.MAX_VELOCITY);
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = 'green';
    context.arc(this.x, this.y, 25, 0, 2 * Math.PI);
    context.fill();
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
