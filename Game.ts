/// <reference path="GameObject.ts"/>

class Game {
  static queryableTypes: QueryableType[] = [];

  readonly context: CanvasRenderingContext2D;

  readonly center: Point;

  readonly diagonalSize: number;

  wave: Wave;

  lives = 3;

  score = 0;

  paused = false;

  private readonly objects: GameObject[] = [];

  private readonly objectsByType: {[key: number]: GameObject[]} = {};

  private lastTick: number|null = null;

  private readonly gamepadInput = new GamepadInput(0);

  private timeSpentWithNoPlayers = 0;

  @fillWithAudioBuffer('sounds/wind.ogg')
  private static windSoundBuffer: AudioBuffer;

  constructor () {
    for(const type of Game.queryableTypes) this.objectsByType[(type as any).__queryKey] = [];

    const canvas = document.querySelector('canvas')!;
    this.context = canvas.getContext('2d')!;
    this.center = {x: canvas.width / 2, y: canvas.height / 2}
    this.diagonalSize = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));

    const sound = audioContext.createBufferSource();
    sound.buffer = Game.windSoundBuffer;
    sound.connect(audioContext.destination);
    sound.start(0);

    window.addEventListener('blur', () => this.paused = true);
    window.addEventListener('focus', () => this.paused = false);

    this.reset();
  }

  reset() {
    while(this.objects.length) {
      const o = this.objects.pop()!;
      console.log("Removing "+o.constructor.name);
      o.destroy();
    }

    new Hud(this);
    new Background(this);

    this.score = 0;

    new Platform(this, {x: this.center.x - 200, y: this.center.y});
    new Platform(this, {x: this.center.x + 200, y: this.center.y});

    this.wave = new Wave(this, 1);
  }

  getObjectsOfType<T extends GameObject>(type: GameObjectType<T>) {
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
    if(index === -1) return;
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

    if(!this.paused) {
      this.gamepadInput.tick();

      for(let o of this.objects) {
        if(hasBindings(o)) o.doAxisBindings(this.gamepadInput);
        o.tick(dt);
        if(hasBindings(o)) o.doButtonBindings(this.gamepadInput);
      }

      if(!this.getObjectsOfType(Player).length) this.timeSpentWithNoPlayers+=dt;
      else this.timeSpentWithNoPlayers = 0;

      if(this.timeSpentWithNoPlayers > 1000 && this.canSpawnPlayer()) {
        this.spawnPlayer();
      }

      this.wave.tick(dt);

      if(this.wave.isComplete() && this.getObjectsOfType(Projectile).length === 0) {
        for(const cable of this.getObjectsOfType(Cable)) this.addScore(10, cable);
        this.wave = new Wave(this, this.wave.number + 1);
        for(const player of this.getObjectsOfType(Player)) player.ammo = 6;
      }
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

  addScore(deltaScore: number, where?: Point) {
    if(this.isOver()) return;
    this.score += deltaScore;
    if(where) new ScoreParticles(this, deltaScore, where);
  }

  isOver() {
    if(this.getObjectsOfType(Player).length > 0) return false;

    return !this.canSpawnPlayer();

  }

  playSound(buffer: AudioBuffer) {
    if (this.paused) return;
    const sound = audioContext.createBufferSource();
    sound.buffer = buffer;
    sound.connect(audioContext.destination);
    sound.start(0);
  }
    

  private canSpawnPlayer() {
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
