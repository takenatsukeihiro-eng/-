const points = [
  {x: 250, y: 133}, // Top
  {x: 290, y: 145}, // Top-right
  {x: 340, y: 195}, // Upper-right
  {x: 345, y: 250}, // Right-middle
  {x: 335, y: 310}, // Lower-right
  {x: 295, y: 360}, // Bottom-right
  {x: 250, y: 367}, // Bottom
  {x: 205, y: 360}, // Bottom-left
  {x: 165, y: 310}, // Lower-left
  {x: 154, y: 250}, // Left-middle
  {x: 165, y: 195}, // Upper-left
  {x: 210, y: 145}  // Top-left
];

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
const numPoints = points.length;
const stepsPerSegment = 3;

for (let i = 0; i < numPoints; i++) {
  const p0 = points[(i - 1 + numPoints) % numPoints];
  const p1 = points[i];
  const p2 = points[(i + 1) % numPoints];
  const p3 = points[(i + 2) % numPoints];
  
  for (let j = 0; j < stepsPerSegment; j++) {
    const t = j / stepsPerSegment;
    result.push(catmullRomSpline(p0, p1, p2, p3, t));
  }
}

console.log(JSON.stringify(result));
