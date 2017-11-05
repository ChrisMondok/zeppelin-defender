class Game {
  private readonly context: CanvasRenderingContext2D;

  private readonly objects: GameObject[] = [];

  private lastTick: number|null = null;

  constructor () {
    const canvas = document.querySelector('canvas')!;
    this.context = canvas.getContext('2d')!;
  }

  add(thing: GameObject) {
    console.log('adding ' + thing.constructor.name);
    this.objects.push(thing);
  }

  remove(thing: GameObject) {
    console.log('removing ' + thing.constructor.name);
    this.objects.splice(this.objects.indexOf(thing), 1);
  }

  tick(ts: number) {
    const dt = this.lastTick === null ? 0 : ts - this.lastTick;
    for(let o of this.objects) o.tick(dt);
    this.lastTick = ts;
  }

  draw() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    for(let o of this.objects) o.draw(this.context);
  }
}
