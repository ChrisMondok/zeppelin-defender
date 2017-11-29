class Game {
  static queryableTypes: QueryableType[] = [];

  readonly context: CanvasRenderingContext2D;

  readonly center: Point;

  readonly diagonalSize: number;

  wave: Wave;

  lives = 3;

  score = 0;

  private readonly objects: GameObject[] = [];

  private readonly objectsByType: {[key: number]: GameObject[]} = {};

  private lastTick: number|null = null;

  private readonly gamepadInput = new GamepadInput(0);

  private timeSpentWithNoPlayers = 0;

  @fillWithAudioBuffer('sounds/wind.ogg')
  private static windSoundBuffer: AudioBuffer;

  constructor () {
    for(const type of Game.queryableTypes) this.objectsByType[(type as any).__queryKey] = [];

    new Hud(this);

    const canvas = document.querySelector('canvas')!;
    this.context = canvas.getContext('2d')!;
    this.center = {x: canvas.width / 2, y: canvas.height / 2}
    this.diagonalSize = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));

    new Background(this);
    new Platform(this, {x: canvas.width / 2 - 200, y: canvas.height/2});
    new Platform(this, {x: canvas.width / 2 + 200, y: canvas.height/2});
    new Target(this, (canvas.width / 2), (canvas.height/2));

    this.wave = this.getNextWave(0);

    const sound = audioContext.createBufferSource();
    sound.buffer = Game.windSoundBuffer;
    sound.connect(audioContext.destination);
    sound.start(0);
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

    if(this.timeSpentWithNoPlayers > 1000 && this.canSpawnPlayer()) {
      this.spawnPlayer();
    }

    this.wave.tick(dt);

    if(this.wave.isComplete()) {
      this.score += this.getObjectsOfType(Cable).length * 10;
      this.wave = this.getNextWave(this.wave.number + 1);
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

  private getNextWave(number: number) {
    console.log(`Wave ${number}`);
    const instructions: SpawnInstruction[] = [];
    const minimumSpawnDelay = 1000;
    const maximumSpawnDelay = 3000;
    const numberOfEnemies = 5;

    let spawnTime = 1000;

    while(instructions.length < numberOfEnemies) {
      instructions.push({ enemyType: SlidingThrowingEnemy, numberOfMoves: 10, spawnTime: spawnTime });
      spawnTime += minimumSpawnDelay + Math.random() * (maximumSpawnDelay - minimumSpawnDelay);
    }

    return new Wave(this, number, instructions);
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
