const rx = 103.5;
const ry = 119;
const cx = 250;
const cy = 250;
const points = [];
const numPoints = 16;

for (let i = 0; i < numPoints; i++) {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numPoints;
  const x = Math.round(cx + rx * Math.cos(angle));
  const y = Math.round(cy + ry * Math.sin(angle));
  points.push({ x, y });
}

function catmullRomSpline(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const v0 = (p2.x - p0.x) * 0.5;
  const v1 = (p3.x - p1.x) * 0.5;
  const x = (2 * p1.x - 2 * p2.x + v0 + v1) * t3 + (-3 * p1.x + 3 * p2.x - 2 * v0 - v1) * t2 + v0 * t + p1.x;
  
  const vy0 = (p2.y - p0.y) * 0.5;
  const vy1 = (p3.y - p1.y) * 0.5;
  const y = (2 * p1.y - 2 * p2.y + vy0 + vy1) * t3 + (-3 * p1.y + 3 * p2.y - 2 * vy0 - vy1) * t2 + vy0 * t + p1.y;
  
  return { x: Math.round(x), y: Math.round(y) };
}

const result = [];
const stepsPerSegment = 2; 

for (let i = 0; i < points.length; i++) {
  const p0 = points[(i - 1 + points.length) % points.length];
  const p1 = points[i];
  const p2 = points[(i + 1) % points.length];
  const p3 = points[(i + 2) % points.length];
  
  for (let j = 0; j < stepsPerSegment; j++) {
    const t = j / stepsPerSegment;
    result.push(catmullRomSpline(p0, p1, p2, p3, t));
  }
}

console.log(JSON.stringify(result));
