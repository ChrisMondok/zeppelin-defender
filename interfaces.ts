interface Function {
  name?: string;
}

interface GameObject {
  tick(ts: number): void;
  draw(): void;
}
