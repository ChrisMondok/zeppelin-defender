interface Function {
  name?: string;
}

interface GameObject {
  x: number;
  y: number;
  depth: number;

  tick(ts: number): void;
  draw(context: CanvasRenderingContext2D): void;
}
