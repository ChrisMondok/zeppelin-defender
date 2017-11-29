function distanceSquared(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.pow(dx, 2) + Math.pow(dy, 2);
}

function direction(a: Point, b: Point) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function magnitude(x: number, y: number) {
  return Math.sqrt((x*x) + (y*y));
}

function clamp(number: number, min: number, max: number) {
  return Math.max(min, Math.min(number, max));
}

function clampVector(vector: Point, maxMag: number): void {
  const m = magnitude(vector.x, vector.y);
  const ratio = Math.max(1, m / maxMag);
  vector.x /= ratio;
  vector.y /= ratio;
}
