/// <reference path="GameObject.ts"/>

@queryable
class SlidingThrowingEnemy extends GameObject {
  xpid: PID;
  ypid: PID;
  target: Point;
  currentDestination?: Point;
  currentAimTarget?: Point;
  ai: AI;
  private readonly velocity = {x:0, y:0};
  private readonly acceleration = {x:0, y:0};
  readonly MAX_VELOCITY = 10;
  readonly MAX_ACCELERATION = 0.25;
  z = 2;
  radius = 25;

  private ambientSound: AudioBufferSourceNode;
  private panNode: PannerNode;

  @fillWithAudioBuffer('sounds/boom.ogg')
  private static boomSoundBuffer: AudioBuffer;

  @fillWithAudioBuffer('sounds/chopper.ogg')
  private ambientSoundBuffer: AudioBuffer;

  @fillWithImage('images/enemy/prop1.png')
  private barberProp : HTMLImageElement;

  @fillWithImage('images/enemy/prop2.png')
  private holeyProp : HTMLImageElement;

  @fillWithImage('images/enemy/prop3.png')
  private camoProp : HTMLImageElement;

  @fillWithImage('images/enemy/prop4.png')
  private rainbowProp : HTMLImageElement;

  private propellors = [this.barberProp, this.holeyProp, this.camoProp, this.rainbowProp];
  private selectedProp: HTMLImageElement;
  private numberOfProps: number;
  private propRotation = 0;

  constructor(game: Game, spawnPoint: Point) {
    super(game);
    this.x = spawnPoint.x;
    this.y = spawnPoint.y;
    this.xpid = new PID(1, 0.00003, 200);
    this.ypid = new PID(1, 0.00003, 200);
    this.ai = new AI(this.game, this, Array.from(this.generateMoveList()));
    this.selectedProp = this.propellors[Math.floor(Math.random() * 4)];
    this.numberOfProps = Math.floor(Math.random() * 5) + 2;

    this.panNode = audioContext.createPanner();

    this.ambientSound = audioContext.createBufferSource();
    this.ambientSound.buffer = this.ambientSoundBuffer;
    this.ambientSound.loop = true;
    this.ambientSound.playbackRate.value = 0.75 + Math.random() * 0.5;
    this.ambientSound.connect(this.panNode);
    this.panNode.connect(audioContext.destination);
    this.ambientSound.start(0);
  }

  tick(dt: number) {
    this.panNode.setPosition((this.x - this.game.center.x) / this.game.diagonalSize, (this.y - this.game.center.y) / this.game.diagonalSize, 1);
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

    this.propRotation += .15 + (Math.random() * 0.1);
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.fillStyle = 'purple';
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();

    if(this.currentAimTarget) {
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(this.currentAimTarget.x, this.currentAimTarget.y);
      context.strokeStyle = 'purple';
      context.stroke();
    }

    context.translate(this.x, this.y)
    for(let i=0; i<this.numberOfProps; i++) {
      context.save();
      context.rotate(this.propRotation + (2 * i * (Math.PI / this.numberOfProps)));
      context.drawImage(this.selectedProp, -10, -50, 20, 50)
      context.restore();
    }
  }

  destroy() {
    this.ambientSound.stop();
    this.panNode.disconnect();
    super.destroy();
  }

  private *generateMoveList() {
    const directionFromCenter = direction(this.game.center, this);
    const aimTime = {easy: 3000, medium: 2000, hard: 1000}[this.game.wave.getDifficulty()];
    const shotsToFire = {easy: 3, medium: 5, hard: 10}[this.game.wave.getDifficulty()];

    const center = {
      x: this.game.center.x + this.game.context.canvas.width * 0.3 * Math.cos(directionFromCenter),
      y: this.game.center.y + this.game.context.canvas.height * 0.3 * Math.sin(directionFromCenter)
    }

    // first, move into view.
    yield new DestinationMove(this, center);

    for(let shots = 0; shots < shotsToFire; shots++) {
      yield* this.generatePassiveMoves(Math.floor(Math.random() * 3), center);
      yield new AimMove(this, aimTime, Math.random() < 0.5 ? Player : Cable);
      yield new FireMove(this);
    }

    yield new WaitMove(this, 500);
  }

  private *generatePassiveMoves(count: number, center: Point) {
    const maxDeviationFromCenter = 500;

    for(let i = 0; i < count; i++) {
      if(Math.random() < 0.5) {
        const dir = Math.random() * Math.PI * 2;
        const dist = Math.random() * maxDeviationFromCenter;

        const destination = {
          x: clamp(center.x + Math.cos(dir) * dist, this.radius, this.game.context.canvas.width - this.radius),
          y: clamp(center.y + Math.sin(dir) * dist, this.radius, this.game.context.canvas.height - this.radius)
        };

        yield new DestinationMove(this, destination);
      } else yield new WaitMove(this, 500);
    }
  }

  private applyAccelerationAndVelocity() {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    clampVector(this.velocity, this.MAX_VELOCITY);
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  private findTarget() {
    this.currentDestination = Object.create(this.target);
  }

  private seekTarget(target: Point, dt: number) {
    let dx = target.x - this.x;
    let dy = target.y - this.y;
    this.acceleration.x = this.xpid.step(dt, dx)
    this.acceleration.y = this.ypid.step(dt, dy);
    clampVector(this.acceleration, this.MAX_ACCELERATION);
  }

  private fire() {
    if(this.currentAimTarget)
      new Buzzsaw(this.game, this.x, this.y, direction(this, this.currentAimTarget));
  }

  private doProjectileInteraction() {
    for(const projectile of this.game.getObjectsOfType(Projectile)) {
      if(projectile.team === 'ENEMY') continue;
      if(distanceSquared(this, projectile) < Math.pow(this.radius, 2)) {
        this.game.playSound(SlidingThrowingEnemy.boomSoundBuffer);
        this.destroy();
        this.game.addScore((projectile instanceof Buzzsaw) ? 150 : 100, this);
      }
    }
  }
}
