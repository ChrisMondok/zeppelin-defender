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
  private hasStarted = false;
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
  constructor(readonly owner: GameObject, public time: number, readonly target: string) {
    super(owner, time);
  }

  step(dt: number) {
    const directive = super.step(dt);
    directive.aimTarget = this.getAimTarget();
    return directive;
  }

  private getAimTarget() : Point|undefined {
    switch (this.target) {
      case 'player':
        const player = this.owner.game.getObjectsOfType(Player)[0];
        return player ? { x: player.x, y: player.y } : undefined;
      default:
        return undefined;
    }
  }

}

class FireMove implements Move {
  public isComplete = false;
  constructor(readonly owner : GameObject) {}

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
