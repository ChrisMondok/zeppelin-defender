interface Function {
  name?: string;
}

interface GameObject {
  x: number;
  y: number;

  tick(ts: number): void;
  draw(context: CanvasRenderingContext2D): void;
}
