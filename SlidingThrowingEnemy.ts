@queryable
class SlidingThrowingEnemy implements GameObject {
  x: number;
  y: number;
  xpid: PID;
  ypid: PID;
  target: Point;
  private velocity = {x:0, y:0};
  private acceleration = {x:0, y:0};
  readonly MAX_VELOCITY = 5;
  readonly MAX_ACCELERATION = 2;
  z = 2;
  
  constructor(readonly game: Game, readonly center: Point) {
    this.x = this.center.x;
    this.y = this.center.y;
    this.xpid = new PID(0.05,0.0001,1);
    this.ypid = new PID(0.05,0.0001,1);
  }

  tick(dt: number) {
    this.findTarget();
    if(this.target) {
      this.seekTarget(this.target, dt)
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
    this.target = {x: 500, y: 250};
  }

  private seekTarget(target: Point, dt: number) {
    let dx = target.x - this.x;
    let dy = target.y - this.y;
    let accx = this.xpid.step(dt, dx)
    let accy = this.ypid.step(dt, dy);

    this.acceleration = clamp({x:accx, y:accy}, this.MAX_ACCELERATION);
  }

}
