/// <reference path="GameObject.ts"/>

@queryable
class Platform extends GameObject {
  readonly velocity = {x: 0, y: 0, z: 0};
  z = -1;
  scale = 1;
  isCutLoose: boolean;

  springConstant = 0.1;
  damping = 0.01;

  width = 300;
  height = 400;

  readonly contents: GameObject[] = [];

  readonly cables: Cable[] = [];

  @fillWithImage('images/platform.jpeg')
  private platformTexture : HTMLImageElement;

  constructor(game: Game, readonly center: Point) {
    super(game);
    this.x = this.center.x - 10;
    this.y = this.center.y - 20;

    this.cables.push(new Cable(this, {x: this.width * -0.2, y: this.height * -0.2}));
    this.cables.push(new Cable(this, {x: this.width * 0.2, y: this.height * -0.2}));
    this.cables.push(new Cable(this, {x: this.width * -0.2, y: this.height * 0.2}));
    this.cables.push(new Cable(this, {x: this.width * 0.2, y: this.height * 0.2}));
  }

  draw(context: CanvasRenderingContext2D) {
    context.translate(this.x, this.y - this.z/2);
    context.scale(this.scale, this.scale);
    context.fillStyle = context.createPattern(this.platformTexture, 'repeat');
    context.strokeStyle = 'black';
    context.fillRect(0 - this.width/2, 0 - this.height/2, this.width, this.height);
    context.strokeRect(0 - this.width/2, 0 - this.height/2, this.width, this.height);
  }

  addContents(c: GameObject) {
    this.contents.push(c);
  }

  removeContents(c: GameObject) {
    this.contents.splice(this.contents.indexOf(c), 1);
  }

  occludes(point: Point|Point3D) {
    const occludesXY = Math.abs(this.x - point.x) < (this.width/2 * this.scale) && Math.abs(this.y - point.y) < (this.height/2 * this.scale);
    if(!occludesXY) return false;

    if(!isPoint3D(point)) return true;

    const thickness = 10;
    
    return Math.abs(point.z - (this.z + 1 - thickness)) <= thickness;
  }

  tick(ts: number) {
    const magnitude = distanceSquared(this, this.center) * this.springConstant;
    const dir = direction(this, this.center);

    this.scale = Math.max(0, 1 + this.z/200);

    this.velocity.x += magnitude * Math.cos(dir) * ts/1000;
    this.velocity.y += magnitude * Math.sin(dir) * ts/1000;

    this.velocity.x *= 1-this.damping;
    this.velocity.y *= 1-this.damping;

    if(!this.isCutLoose) {
      if(this.cables.filter(c => !c.destroyed).length > 0) {
        this.velocity.z = 0;
      } else {
        this.velocity.z -= 9.8;
        this.isCutLoose = true;
      }
    } else {
      this.velocity.z -= 9.8;
    }

    const oldX = this.x;
    const oldY = this.y;

    this.x += this.velocity.x * ts/1000;
    this.y += this.velocity.y * ts/1000;
    this.z += this.velocity.z * ts/1000;

    for(const c of this.contents) {
      c.x += (this.x - oldX);
      c.y += (this.y - oldY);
    }

    if(this.z < -200) {
      this.destroy();
    }
  }
}
