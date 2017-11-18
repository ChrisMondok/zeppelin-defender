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
    this.currentMove = this.moveList.shift() ||  new WaitMove(this.owner, 999999999);
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

  step(dt: number) {
    if(magnitude(this.owner.x - this.destination.x, this.owner.y - this.destination.y) < 5) {
      this.isComplete = true;
    }
    return { destination: this.destination };
  }
}

class AimMove extends WaitMove {
  aimTarget?: GameObject;
  constructor(readonly owner: GameObject, public time: number, readonly target: string) {
    super(owner, time);
  }

  step(dt: number) {
    if(!this.hasStarted)
      this.init();
    const directive = super.step(dt);
    if(this.aimTarget)
      directive.aimTarget = {x: this.aimTarget.x, y: this.aimTarget.y};
    return directive;
  }

  init() {
    super.init();
    this.aimTarget = this.getAimTarget();
  }

  private getAimTarget() : GameObject|undefined {
    switch (this.target) {
      case 'player':
        return this.owner.game.getObjectsOfType(Player)[0];
      case 'cable':
        const cables = this.owner.game.getObjectsOfType(Cable);
        const closestCable = cables.sort((a, b) => distanceSquared(this.owner, a) - distanceSquared(this.owner, b))[0];
        return closestCable || undefined;
      default:
        return undefined;
    }
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
}