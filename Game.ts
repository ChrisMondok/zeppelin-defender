class Game {
  static queryableTypes: QueryableType[] = [];

  private readonly context: CanvasRenderingContext2D;

  private readonly objects: GameObject[] = [];

  private readonly objectsByKey: {[key: number]: GameObject[]} = {};

  private lastTick: number|null = null;

  constructor () {
    for(const type of Game.queryableTypes) this.objectsByKey[(type as any).__queryKey] = [];

    const canvas = document.querySelector('canvas')!;
    this.context = canvas.getContext('2d')!;
    this.add(new Platform(this, {x: canvas.width / 4, y: canvas.height/2}));
    this.add(new Platform(this, {x: canvas.width / 4 + 300, y: canvas.height/2}));
    this.add(new SlidingThrowingEnemy(this, {x: 300, y: 200}));

  }

  getObjectsOfType<T extends GameObject>(type: {new(...args: any[]): T}) {
    if(!isQueryable(type)) throw new Error(`Type ${type.name} is not queryable. Add @queryable to its declaration.`);
    return this.objectsByKey[type.__queryKey] as T[];
  }

  add(thing: GameObject) {
    console.log('adding ' + thing.constructor.name);
    this.objects.push(thing);

    if(isQueryable(thing.constructor)) {
      this.objectsByKey[thing.constructor.__queryKey].push(thing);
    }
  }

  remove(thing: GameObject) {
    console.log('removing ' + thing.constructor.name);
    this.objects.splice(this.objects.indexOf(thing), 1);

    if(isQueryable(thing.constructor)) {
      const queryList = this.objectsByKey[thing.constructor.__queryKey];
      queryList.splice(queryList.indexOf(thing), 1);
    }
  }

  tick(ts: number) {
    const dt = this.lastTick === null ? 0 : ts - this.lastTick;

    for(const gamepad of navigator.getGamepads()) {
      if(gamepad && !this.getObjectsOfType(Player).some(p => p.gamepadNumber == gamepad.index))
        this.add(new Player(this, gamepad.index));
    }

    this.objects.sort((a, b) => a.z - b.z);

    for(let o of this.objects) {
      o.tick(dt);
      if(hasBindings(o)) o.__doBindings();
    }

    this.lastTick = ts;
  }

  draw() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    for(let o of this.objects) {
      this.context.save();
      o.draw(this.context);
      this.context.restore();
    }

  }
}

let __nextQueryKey = 0;

type QueryableType = Function&{__queryKey: number};

function queryable(constructor: Function) {
  console.log('making it queryable');
  (constructor as QueryableType).__queryKey = __nextQueryKey++;
  Game.queryableTypes.push(constructor as QueryableType);
}

function isQueryable(type: Function): type is Function&{__queryKey: number} {
  return '__queryKey' in type;
}
