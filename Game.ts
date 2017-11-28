class Game {
  static queryableTypes: QueryableType[] = [];

  readonly context: CanvasRenderingContext2D;

  lives = 3;

  score = 0;

  private readonly objects: GameObject[] = [];

  private readonly objectsByType: {[key: number]: GameObject[]} = {};

  private lastTick: number|null = null;

  private readonly gamepadInput = new GamepadInput(0);

  private timeSpentWithNoPlayers = 0;

  @fillWithAudioBuffer('sounds/wind.ogg')
  private static windSoundBuffer: AudioBuffer;

  @fillWithAudioBuffer('sounds/gymnopedies 1.ogg')
  private static musicSoundBuffer: AudioBuffer;

  constructor () {
    for(const type of Game.queryableTypes) this.objectsByType[(type as any).__queryKey] = [];

    new Hud(this);

    const canvas = document.querySelector('canvas')!;
    this.context = canvas.getContext('2d')!;
    new Background(this);
    new Platform(this, {x: canvas.width / 2 - 200, y: canvas.height/2});
    new Platform(this, {x: canvas.width / 2 + 200, y: canvas.height/2});
    new SlidingThrowingEnemy(this, {x: 300, y: 50});
    new Target(this, (canvas.width / 2), (canvas.height/2));

    const sound = audioContext.createBufferSource();
    sound.buffer = Game.windSoundBuffer;
    sound.connect(audioContext.destination);
    sound.loop = true;
    sound.start(0);

    const music = audioContext.createBufferSource();
    music.buffer = Game.musicSoundBuffer;
    music.connect(audioContext.destination);
    music.loop = true;
    music.start(0);
  }

  getObjectsOfType<T extends GameObject>(type: {new(...args: any[]): T}) {
    if(!isQueryable(type)) throw new Error(`Type ${type.name} is not queryable. Add @queryable to its declaration.`);
    return this.objectsByType[type.__queryKey] as T[];
  }

  add(thing: GameObject) {
    this.objects.push(thing);

    if(isQueryable(thing.constructor)) {
      for(const queryableType of Game.queryableTypes) {
        if(thing instanceof queryableType)
          this.objectsByType[queryableType.__queryKey].push(thing);
      }
    }
  }

  remove(thing: GameObject) {
    const index = this.objects.indexOf(thing);
    if(index === -1) {
      console.error("Trying to remove a thing we don't know about!");
      return;
    }
    this.objects.splice(index, 1);

    if(isQueryable(thing.constructor)) {
      for(const queryableType of Game.queryableTypes) {
        if(!(thing instanceof queryableType)) continue;

        const queryList = this.objectsByType[queryableType.__queryKey];

        const index = queryList.indexOf(thing);
        if(index === -1) {
          console.error("Trying to remove a thing from a query list it's not in!");
          return;
        }
        queryList.splice(index, 1);
      }
    }
  }

  tick(ts: number) {
    const dt = this.lastTick === null ? 0 : ts - this.lastTick;

    this.gamepadInput.tick();

    for(let o of this.objects) {
      if(hasBindings(o)) o.doAxisBindings(this.gamepadInput);
      o.tick(dt);
      if(hasBindings(o)) o.doButtonBindings(this.gamepadInput);
    }

    if(!this.getObjectsOfType(Player).length) this.timeSpentWithNoPlayers+=dt;
    else this.timeSpentWithNoPlayers = 0;

    if(this.timeSpentWithNoPlayers > 1000 && this.canSpawn()) {
      this.spawnPlayer();
    }

    this.lastTick = ts;
  }

  draw() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    this.objects.sort((a, b) => a.z - b.z);

    for(let o of this.objects) {
      this.context.save();
      o.draw(this.context);
      this.context.restore();
    }
  }

  isInBounds(point: Point) {
    return point.x >= 0 && point.y >= 0 && point.x <= this.context.canvas.width && point.y <= this.context.canvas.height;
  }

  private canSpawn() {
    return this.lives > 0 && this.getObjectsOfType(Platform).length > 0;
  }

  private spawnPlayer() {
    this.lives--;
    const p = new Player(this);
    const platform = this.getObjectsOfType(Platform)[0];
    p.x = platform.center.x;
    p.y = platform.center.y;
  }
}

let __nextQueryKey = 0;

type QueryableType = Function&{__queryKey: number};

function queryable(constructor: Function) {
  (constructor as QueryableType).__queryKey = __nextQueryKey++;
  Game.queryableTypes.push(constructor as QueryableType);
}

function isQueryable(type: Function): type is Function&{__queryKey: number} {
  return '__queryKey' in type;
}
