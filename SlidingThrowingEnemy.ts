/// <reference path="GameObject.ts"/>

@queryable
class SlidingThrowingEnemy extends GameObject {
  xpid: PID;
  ypid: PID;
  target: Point;
  currentDestination?: Point;
  currentAimTarget?: Point;
  ai: AI;
  private velocity = {x:0, y:0};
  private acceleration = {x:0, y:0};
  readonly MAX_VELOCITY = 10;
  readonly MAX_ACCELERATION = 0.25;
  z = 2;
  radius = 25;

  constructor(game: Game, readonly center: Point) {
    super(game);
    this.x = this.center.x;
    this.y = this.center.y;
    this.xpid = new PID(1, 0.00003, 200);
    this.ypid = new PID(1, 0.00003, 200);
    this.ai = new AI(this.game, this, [
      new WaitMove(this, 500),
      new DestinationMove(this, { x: 100, y: 100 }),
      new WaitMove(this, 500),
      new AimMove(this, 3000, 'player'),
      new FireMove(this),
      new WaitMove(this, 2000),
      new DestinationMove(this, { x: 50, y: 400 }),
      new AimMove(this, 1000, 'cable'),
      new FireMove(this),
      new WaitMove(this, 2000),
    ]);
  }

  tick(dt: number) {
    const directive = this.ai.step(dt);
    this.currentDestination = directive.destination;
    if(this.currentDestination) {
      this.seekTarget(this.currentDestination, dt)
    }
    this.applyAccelerationAndVelocity();

    this.currentAimTarget = directive.aimTarget || this.currentAimTarget;
    if(directive.shouldFire) {
      this.fire();
      this.currentAimTarget = undefined;
    }

    if(directive.shouldDestroy) this.destroy();

    this.doProjectileInteraction();
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = 'purple';
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();

    if(this.currentAimTarget) {
      context.moveTo(this.x, this.y);
      context.lineTo(this.currentAimTarget.x, this.currentAimTarget.y);
      context.strokeStyle = 'purple';
      context.stroke();
    }
  }

  private applyAccelerationAndVelocity() {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.velocity = clamp(this.velocity, this.MAX_VELOCITY);
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  private findTarget() {
    this.currentDestination = Object.create(this.target);
  }

  private seekTarget(target: Point, dt: number) {
    let dx = target.x - this.x;
    let dy = target.y - this.y;
    let accx = this.xpid.step(dt, dx)
    let accy = this.ypid.step(dt, dy);

    this.acceleration = clamp({x:accx, y:accy}, this.MAX_ACCELERATION);
  }

  private fire() {
    if(this.currentAimTarget)
      new Buzzsaw(this.game, this.x, this.y, direction(this, this.currentAimTarget));
  }

  private doProjectileInteraction() {
    for(const projectile of this.game.getObjectsOfType(Projectile)) {
      if(projectile.team === 'ENEMY') continue;
      if(distanceSquared(this, projectile) < Math.pow(this.radius, 2)) {
        this.destroy();
        this.game.score += (projectile instanceof Buzzsaw) ? 500 : 100;
      }
    }
  }
}
