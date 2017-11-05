interface Function {
  name?: string;
}

interface GameObject {
  x: number;
  y: number;
  z: number;

  tick(dt: number): void;
  draw(context: CanvasRenderingContext2D): void;
}

interface Point {
  x: number;
  y: number;
}
