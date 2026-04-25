// ピン配置の計算ロジック
// スケール定義: 1px = 0.2m (500px = 100m)
const PIXELS_PER_METER = 5;
const YARDS_TO_PIXELS = 0.9144 * PIXELS_PER_METER; // 1ヤード = 0.9144m

export const CONSTRAINTS = {
  MIN_EDGE_DIST: 4 * YARDS_TO_PIXELS, // 4ヤード
  MIN_PREV_DIST: 5 * PIXELS_PER_METER,  // 5メートル
};

// 指定した点が多角形内にあるか判定 (Ray-casting algorithm)
export function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// 点からエッジまでの最短距離を計算
export function getMinDistanceToEdge(point, polygon) {
  let minPrevDist = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const d = distToSegment(point, polygon[i], polygon[j]);
    if (d < minPrevDist) minPrevDist = d;
  }
  return minPrevDist;
}

function distToSegment(p, v, w) {
  const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
  if (l2 === 0) return distBetween(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distBetween(p, {
    x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y)
  });
}

export function distBetween(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// 新しいピンポジションを生成
export function generateValidPin(hole, previousPin = null) {
  const points = hole.points;
  
  // バウンディングボックスの取得
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  let attempts = 0;
  const MAX_ATTEMPTS = 500;

  while (attempts < MAX_ATTEMPTS) {
    const testPoint = {
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY)
    };

    // 条件1: ポリゴン内にあること
    if (isPointInPolygon(testPoint, points)) {
      // 条件2: エッジから4ヤード以上
      const edgeDist = getMinDistanceToEdge(testPoint, points);
      if (edgeDist >= CONSTRAINTS.MIN_EDGE_DIST) {
        // 条件3: 前日位置から5m以上（指定があれば）
        if (!previousPin || distBetween(testPoint, previousPin) >= CONSTRAINTS.MIN_PREV_DIST) {
          return {
            ...testPoint,
            edgeDist: (edgeDist / PIXELS_PER_METER).toFixed(1),
            prevDist: previousPin ? (distBetween(testPoint, previousPin) / PIXELS_PER_METER).toFixed(1) : null
          };
        }
      }
    }
    attempts++;
  }

  // 見つからなかった場合（極端に狭いグリーンなど）
  return null;
}
