class AI {
  private timeToNextMove: number;
  private destination: Point;
  private target: Point
  private currentMove: Move;

  constructor(readonly game: Game, readonly owner: GameObject, public moveList: Array<Move>) {}

  findPlayerPosition(): Point {
    const player = this.game.getObjectsOfType(Player)[0];
    return { x: player.x, y: player.y };
  }

  step(dt: number) {
    if(!this.currentMove) {
        this.loadMove();
    }

    const directive = this.currentMove.step(dt);

    if(this.currentMove.isComplete) {
      this.loadMove();
    }
    return directive;
  }

  loadMove() {
    this.currentMove = this.moveList.shift() ||  new ExitMove(this.owner, this.game);
  }
   
}
  
interface Move {
  step(dt: number) : AIDirective;
  isComplete : boolean;
}

class WaitMove implements Move {
  public isComplete = false;
  hasStarted = false;
  private waitSpot: Point;
  constructor(readonly owner: GameObject, public time: number) {
  }

  init() {
    this.hasStarted = true;
    this.waitSpot = { x: this.owner.x, y: this.owner.y };
  }

  step(dt: number) : AIDirective {
    if(!this.hasStarted)
      this.init();

    this.time -= dt;
    if(this.time < 0)
      this.isComplete = true;

    return { destination: { x: this.waitSpot.x, y: this.waitSpot.y } };
  }
}

class DestinationMove implements Move {
  public isComplete = false;
  constructor(readonly owner: GameObject, readonly destination: Point) {}

  step(dt: number): AIDirective {
    if(magnitude(this.owner.x - this.destination.x, this.owner.y - this.destination.y) < 5) {
      this.isComplete = true;
    }
    return { destination: this.destination };
  }
}

class ExitMove extends DestinationMove {
  hasStarted = false;

  private static readonly destroyDirective = { shouldDestroy: true };

  constructor(owner: GameObject, readonly game: Game) {
    super(owner, {x: 100, y: 100});
  }

  init() {
    const centerOfGame = {x: this.game.context.canvas.width/2, y: this.game.context.canvas.height/2};
    const dir = direction(centerOfGame, this.owner);
    this.destination.x = this.game.center.y + Math.cos(dir) * this.game.diagonalSize;
    this.destination.y = this.game.center.x + Math.sin(dir) * this.game.diagonalSize;
    this.hasStarted = true;
  }

  step(dt: number) {
    if(!this.hasStarted) this.init();
    const dest = super.step(dt);
    if(this.isComplete) {
      this.isComplete = false;
      return ExitMove.destroyDirective;
    }
    else return dest;
  }
}

class AimMove extends WaitMove {
  aimTarget?: GameObject;
  constructor(readonly owner: GameObject, public time: number, readonly target: GameObjectType<GameObject>) {
    super(owner, time);
  }

  step(dt: number) {
    if(!this.hasStarted) this.init();

    const directive = super.step(dt);

    if(this.aimTarget && this.aimTarget.destroyed) this.aimTarget = this.getAimTarget();

    if(this.aimTarget) directive.aimTarget = {x: this.aimTarget.x, y: this.aimTarget.y};

    return directive;
  }

  init() {
    super.init();
    this.aimTarget = this.getAimTarget();
  }

  private getAimTarget() : GameObject|undefined {
    return this.owner.game.getObjectsOfType(this.target).sort((a, b) => distanceSquared(this.owner, a) - distanceSquared(this.owner, b))[0];
  }

}

class FireMove implements Move {
  public isComplete = false;
  constructor(readonly owner : SlidingThrowingEnemy) {}

  step(dt : number) {
    this.isComplete = true;
    return { aimTarget: this.owner.currentAimTarget, shouldFire: true }
  }
}

interface AIDirective {
  destination? : Point;
  aimTarget? : Point;
  shouldFire? : boolean;
  shouldDestroy? : boolean;
}
