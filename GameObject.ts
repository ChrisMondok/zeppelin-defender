abstract class GameObject {
  x = 0;
  y = 0;
  z = 0;
  destroyed = false;

  constructor(readonly game: Game) {
    game.add(this);
  }

  abstract tick(dt: number): void;
  abstract draw(context: CanvasRenderingContext2D): void;

  destroy() {
    this.game.remove(this);
    this.destroyed = true;
  }
}

type GameObjectType<T> = {new(...args: any[]): T};
