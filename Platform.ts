@queryable
class Platform implements GameObject {
  x: number;
  y: number;
  readonly velocity = {x: 0, y: 0};
  z = -1;

  springConstant = 0.1;
  damping = 0.01;

  width = 200;
  height = 200;

  readonly contents: GameObject[] = [];

  constructor(readonly game: Game, readonly center: Point) {
    this.x = this.center.x - 10;
    this.y = this.center.y - 20;
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = '#ccc';
    context.strokeStyle = 'black';
    context.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    context.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
  }

  addContents(c: GameObject) {
    this.contents.push(c);
  }

  removeContents(c: GameObject) {
    this.contents.splice(this.contents.indexOf(c), 1);
  }

  occludes(point: Point|Point3D) {
    const occludesXY = Math.abs(this.x - point.x) < this.width/2 && Math.abs(this.y - point.y) < this.height/2;
    if(!occludesXY) return false;

    if(!isPoint3D(point)) return true;

    const thickness = 50;
    
    return Math.abs(point.z - (this.z + 1 - thickness)) <= thickness;
  }

  tick(ts: number) {
    const magnitude = distanceSquared(this, this.center) * this.springConstant;
    const dir = direction(this, this.center);

    this.velocity.x += magnitude * Math.cos(dir) * ts/1000;
    this.velocity.y += magnitude * Math.sin(dir) * ts/1000;

    this.velocity.x *= 1-this.damping;
    this.velocity.y *= 1-this.damping;

    const oldX = this.x;
    const oldY = this.y;

    this.x += this.velocity.x * ts/1000;
    this.y += this.velocity.y * ts/1000;

    for(const c of this.contents) {
      c.x += (this.x - oldX);
      c.y += (this.y - oldY);
    }
  }
}
