function distanceSquared(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.pow(dx, 2) + Math.pow(dy, 2);
}

function direction(a: Point, b: Point) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}
