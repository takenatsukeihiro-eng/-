

// 勝浦東急ゴルフコース ホールデータ (Regular Green A & B)
export const HOLE_DATA = [
  { number: 1, par: 4, yardageA: 343, yardageB: 310, desc: "打ち下ろしのミドルホール。ティーショットはセンター狙い。右のクロスバンカーに気をつければパーの狙えるホール。" },
  { number: 2, par: 3, yardageA: 146, yardageB: 126, desc: "一見やさしそうなショートホールですが、グリーンまわりのバンカーに注意。" },
  { number: 3, par: 4, yardageA: 396, yardageB: 355, desc: "距離のあるミドルホール。左右のOBに注意。見通しの良さに油断は大敵、距離感とガードバンカーに注意。" },
  { number: 4, par: 5, yardageA: 480, yardageB: 478, desc: "豪快な打下ろしのロングホール。ティーショットでスライスは禁物。クリーン手前のバンカーに注意。" },
  { number: 5, par: 4, yardageA: 349, yardageB: 320, desc: "広々としたフェアウエイのミドルホール。ティーショットはフェアウェイセンター狙い。" },
  { number: 6, par: 4, yardageA: 364, yardageB: 324, desc: "フラットなミドルホール。ティーショットは右バンカー左狙い。グリーン上からは勝浦湾が一望できます。" },
  { number: 7, par: 4, yardageA: 394, yardageB: 354, desc: "2打目が池越えとなるメンタルなミドルホール。1打目の落し所により2打目の距離が変わってきます。" },
  { number: 8, par: 3, yardageA: 151, yardageB: 136, desc: "ティーグラウンド下の右に迫り出した自然樹がティーショットにメンタルなプレッシャーを感じるショートホールです。" },
  { number: 9, par: 5, yardageA: 482, yardageB: 445, desc: "やや左ドッグレッグのロングホール。左右のOBに注意。ティショットはフェアウェイセンターへ正確なショットを。" },
  { number: 10, par: 5, yardageA: 477, yardageB: 457, desc: "広いフェアウェイで緩い打下ろしのロングホール。2打目はフェアウェイ中央タブの木に注意。" },
  { number: 11, par: 4, yardageA: 392, yardageB: 356, desc: "ティーショットはティーグランドから左下に見える大きな池が気になりますが、落下地点のフェアウェイは広い。" },
  { number: 12, par: 3, yardageA: 167, yardageB: 137, desc: "フラットなショートホールを難しくしているのはグリーン周りのバンカー。距離感に注意。" },
  { number: 13, par: 4, yardageA: 343, yardageB: 314, desc: "ティーグランド前とグリーン手前までくい込んだ池が戦略性を要求するミドルホール。" },
  { number: 14, par: 4, yardageA: 360, yardageB: 333, desc: "まっすぐでフラットなミドルホール。フェアウェイ右側に沿った池に注意。" },
  { number: 15, par: 5, yardageA: 472, yardageB: 457, desc: "距離的に短めのロングホール。ティーショットは大きなクロスバンカー2つに注意し確実にフェアウェイキープ。" },
  { number: 16, par: 3, yardageA: 155, yardageB: 118, desc: "池越えのショートホール。風の計算と距離感に注意し、気持ちを楽にしてショットすることが肝要。" },
  { number: 17, par: 4, yardageA: 366, yardageB: 332, desc: "ティーショットは打ち下ろし、2打目は打上げになり距離感が問題。またグリーンは2段になっているので要注意。" },
  { number: 18, par: 4, yardageA: 403, yardageB: 381, desc: "左ドッグレッグのミドルホール。ティーショットが飛びすぎると前下がりになり2打目が難しくなる。" }
].map(hole => {
  // AとBの初期グリーンを生成
  const generatePoints = (seed) => {
    const centerX = 250;
    const centerY = 250;
    const points = [];
    const segments = 12;
    for (let s = 0; s < segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const r = 100 + (Math.sin(angle * seed) * 20);
      points.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r
      });
    }
    return points;
  };
  return { 
    ...hole, 
    pointsA: generatePoints(3), 
    pointsB: generatePoints(4), // Bは少し形を変える
    centerX: 250, 
    centerY: 250 
  };
});

const STORAGE_KEY = 'green_master_history';
const GREEN_POINTS_KEY = 'green_master_points';

// グリーンの座標を保存 (A/B対応)
export function saveGreenPoints(holeNumber, greenType, points) {
  const allPoints = getAllGreenPoints();
  if (!allPoints[holeNumber]) allPoints[holeNumber] = {};
  allPoints[holeNumber][greenType] = points;
  localStorage.setItem(GREEN_POINTS_KEY, JSON.stringify(allPoints));
  

}

// 全ホールのグリーン座標を取得
export function getAllGreenPoints() {
  const data = localStorage.getItem(GREEN_POINTS_KEY);
  return data ? JSON.parse(data) : {};
}

// 指定ホールの現在の座標を取得
export function getCurrentGreenPoints(hole, greenType) {
  const allPoints = getAllGreenPoints();
  const holePoints = allPoints[hole.number];
  if (holePoints && holePoints[greenType]) return holePoints[greenType];
  return greenType === 'A' ? hole.pointsA : hole.pointsB;
}

export function savePinPosition(holeNumber, date, data) {
  const history = getAllHistory();
  if (!history[date]) history[date] = {};
  history[date][holeNumber] = data; // { greenType, position }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  

}

export function deletePinPosition(holeNumber, date) {
  const history = getAllHistory();
  if (history[date] && history[date][holeNumber]) {
    delete history[date][holeNumber];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function getPinPosition(holeNumber, date) {
  const history = getAllHistory();
  return history[date] ? history[date][holeNumber] : null;
}

export function getAllHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function clearAllHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getFormattedDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdaysDate(currentDateStr) {
  const d = new Date(currentDateStr);
  d.setDate(d.getDate() - 1);
  return getFormattedDate(d);
}

// リアルタイム同期のスタブ（Firebase削除に伴い何もしない）
export function startSync(onUpdate) {
  // Local only
}
