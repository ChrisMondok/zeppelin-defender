interface Point {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function isPoint3D(point: Point): point is Point3D {
  return 'z' in point;
}
