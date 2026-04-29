const points = [
  {x: 250, y: 110},
  {x: 280, y: 114},
  {x: 310, y: 125},
  {x: 335, y: 160},
  {x: 345, y: 200},
  {x: 349, y: 250},
  {x: 340, y: 300},
  {x: 325, y: 340},
  {x: 300, y: 375},
  {x: 250, y: 389},
  {x: 200, y: 375},
  {x: 175, y: 340},
  {x: 160, y: 300},
  {x: 151, y: 250},
  {x: 155, y: 200},
  {x: 170, y: 160},
  {x: 190, y: 125},
  {x: 220, y: 114}
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
const stepsPerSegment = 2; // will double the number of points

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
