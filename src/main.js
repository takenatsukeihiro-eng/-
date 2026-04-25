import { HOLE_DATA, savePinPosition, getPinPosition, getFormattedDate, getYesterdaysDate, getCurrentGreenPoints, clearAllHistory, deletePinPosition, getAllHistory, getAllGreenPoints } from './data.js';
import { generateValidPin } from './logic.js';
import { initEditor } from './editor.js';

let currentHole = HOLE_DATA[0];
let selectedDate = getFormattedDate();
let currentGreenType = 'A'; // 'A' or 'B'

// DOM要素
const holeListEl = document.getElementById('hole-list');
const currentHoleTitleEl = document.getElementById('current-hole-title');
const currentHoleParEl = document.getElementById('current-hole-par');
const currentHoleYardEl = document.getElementById('current-hole-yard');
const selectGreenABtn = document.getElementById('select-green-a');
const selectGreenBBtn = document.getElementById('select-green-b');
const holeDescEl = document.getElementById('hole-desc');
const mapContainerEl = document.getElementById('map-container');
const generateBtn = document.getElementById('generate-pin');
const resetPinBtn = document.getElementById('reset-pin');
const editGreenBtn = document.getElementById('edit-green');
const valXEl = document.getElementById('val-x');
const valYEl = document.getElementById('val-y');
const calendarContainerEl = document.getElementById('calendar-container');
const printOutBtn = document.getElementById('print-out');
const printInBtn = document.getElementById('print-in');
const printAreaEl = document.getElementById('print-area');

// 初期化
function init() {
  renderHoleList();
  renderMap();
  renderCalendar();
  updateUI();
  
  // Lucideアイコンの初期化
  lucide.createIcons();

  // グリーン選択
  selectGreenABtn.onclick = () => switchGreen('A');
  selectGreenBBtn.onclick = () => switchGreen('B');
}

function switchGreen(type) {
  currentGreenType = type;
  selectGreenABtn.classList.toggle('active', type === 'A');
  selectGreenBBtn.classList.toggle('active', type === 'B');
  renderMap();
  updateUI();
}

// ホールリストの描画
function renderHoleList() {
  holeListEl.innerHTML = '';
  HOLE_DATA.forEach(hole => {
    const li = document.createElement('li');
    li.className = `hole-item ${currentHole.number === hole.number ? 'active' : ''}`;
    li.innerHTML = `
      <span>第${hole.number}ホール</span>
      <span class="par-badge">P${hole.par}</span>
    `;
    li.onclick = () => {
      currentHole = hole;
      // ピンポジションがある方のグリーンを自動選択（なければ現在のを維持）
      const pinData = getPinPosition(currentHole.number, selectedDate);
      if (pinData) {
        currentGreenType = pinData.greenType;
        selectGreenABtn.classList.toggle('active', currentGreenType === 'A');
        selectGreenBBtn.classList.toggle('active', currentGreenType === 'B');
      }
      renderHoleList();
      renderMap();
      updateUI();
    };
    holeListEl.appendChild(li);
  });
}

// データの更新
function updateUI() {
  currentHoleTitleEl.textContent = `第${currentHole.number}ホール`;
  currentHoleParEl.textContent = `PAR ${currentHole.par}`;
  currentHoleYardEl.textContent = `${currentGreenType === 'A' ? currentHole.yardageA : currentHole.yardageB} YDS`;
  holeDescEl.textContent = currentHole.desc;

  const pinData = getPinPosition(currentHole.number, selectedDate);
  const pin = (pinData && pinData.greenType === currentGreenType) ? pinData.position : null;
  
  if (pin) {
    const relY = Math.round(250 - pin.y);
    const relX = Math.round(pin.x - 250);
    valYEl.textContent = relY > 0 ? `+${relY}` : relY;
    valXEl.textContent = relX > 0 ? `+${relX}` : relX;
  } else {
    valXEl.textContent = '--';
    valYEl.textContent = '--';
  }

  document.getElementById('current-date-display').textContent = selectedDate.replace(/-/g, '/');
}

// SVGマップの描画
function renderMap() {
  const pinData = getPinPosition(currentHole.number, selectedDate);
  const points = getCurrentGreenPoints(currentHole, currentGreenType);
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  
  // 過去1週間の履歴を取得 (同じグリーンタイプのみ表示)
  let historySvg = '';
  for (let i = 1; i <= 7; i++) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - i);
    const dateStr = getFormattedDate(d);
    const prevPinData = getPinPosition(currentHole.number, dateStr);
    if (prevPinData && prevPinData.greenType === currentGreenType) {
      const prevPin = prevPinData.position;
      historySvg += `<circle cx="${prevPin.x}" cy="${prevPin.y}" r="4" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.3)" stroke-width="1" />`;
    }
  }

  let pinSvg = '';
  if (pinData && pinData.greenType === currentGreenType) {
    const pin = pinData.position;
    pinSvg = `
      <g id="pin-marker" class="pin-marker-group" style="cursor: move;">
        <line x1="${pin.x}" y1="${pin.y}" x2="${pin.x}" y2="${pin.y - 40}" class="pin-flag" />
        <rect x="${pin.x}" y="${pin.y - 40}" width="25" height="15" fill="#ef4444" />
        <circle cx="${pin.x}" cy="${pin.y}" r="6" class="pin-marker" fill="#fff" stroke="#ef4444" stroke-width="2" />
      </g>
    `;
  }

  mapContainerEl.innerHTML = `
    <svg id="green-svg" viewBox="0 0 500 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="touch-action: none;">
      <defs>
        <radialGradient id="greenGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style="stop-color:#a7f3d0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </radialGradient>
      </defs>
      <polygon id="green-poly" points="${polygonPoints}" fill="url(#greenGradient)" class="green-boundary" stroke="#064e3b" stroke-width="2" style="cursor: crosshair;" />
      <text x="20" y="45" font-size="32" font-weight="900" fill="rgba(6, 78, 59, 0.2)" style="pointer-events: none; font-family: 'Outfit', sans-serif;">${currentGreenType}G</text>
      ${historySvg}
      ${pinSvg}
    </svg>
  `;

  attachMapListeners();
}

let isDraggingPin = false;

function attachMapListeners() {
  const svg = document.getElementById('green-svg');
  const poly = document.getElementById('green-poly');
  const pin = document.getElementById('pin-marker');

  const getCoords = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const rect = svg.getBoundingClientRect();
    const scale = 500 / rect.width;
    return {
      x: (clientX - rect.left) * scale,
      y: (clientY - rect.top) * scale
    };
  };

  const updatePin = (e) => {
    const coords = getCoords(e);
    savePinPosition(currentHole.number, selectedDate, { greenType: currentGreenType, position: coords });
    renderMap();
    updateUI();
  };

  // グリーンクリックで配置
  poly.onclick = (e) => {
    if (isDraggingPin) return;
    updatePin(e);
  };

  // ピンのドラッグ
  if (pin) {
    const startDrag = (e) => {
      isDraggingPin = true;
      e.stopPropagation();
    };

    const doDrag = (e) => {
      if (!isDraggingPin) return;
      updatePin(e);
    };

    const stopDrag = () => {
      isDraggingPin = false;
    };

    pin.onmousedown = startDrag;
    window.onmousemove = doDrag;
    window.onmouseup = stopDrag;

    pin.ontouchstart = startDrag;
    window.ontouchmove = doDrag;
    window.ontouchend = stopDrag;
  }
}

// カレンダーの簡易描画
function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let html = '<div class="calendar-grid">';
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  days.forEach(d => html += `<div class="calendar-header-day" style="font-size: 0.7rem; color: #6b7280; text-align: center;">${d}</div>`);
  
  for (let i = 0; i < firstDay; i++) {
    html += '<div></div>';
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isActive = dateStr === selectedDate;
    html += `<div class="calendar-day ${isActive ? 'active' : ''}" onclick="selectDate('${dateStr}')">${d}</div>`;
  }
  
  html += '</div>';
  calendarContainerEl.innerHTML = html;
}

// 日付選択
window.selectDate = (dateStr) => {
  selectedDate = dateStr;
  renderCalendar();
  renderMap();
  updateUI();
};

// ピン生成
generateBtn.onclick = () => {
  const yesterday = getYesterdaysDate(selectedDate);
  const prevPinData = getPinPosition(currentHole.number, yesterday);
  const prevPin = (prevPinData && prevPinData.greenType === currentGreenType) ? prevPinData.position : null;
  
  // 現在のグリーン座標を使用
  const currentHoleWithPoints = { ...currentHole, points: getCurrentGreenPoints(currentHole, currentGreenType) };
  const newPin = generateValidPin(currentHoleWithPoints, prevPin);
  
  if (newPin) {
    savePinPosition(currentHole.number, selectedDate, { greenType: currentGreenType, position: newPin });
    renderMap();
    updateUI();
    generateBtn.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ], { duration: 300 });
  } else {
    alert('制約条件を満たすピンポジションが見つかりませんでした。グリーンの形状を確認してください。');
  }
};

// ピン位置クリア
resetPinBtn.onclick = () => {
  deletePinPosition(currentHole.number, selectedDate);
  renderMap();
  updateUI();
};

// グリーン編集
editGreenBtn.onclick = () => {
  initEditor(currentHole, currentGreenType, (newPoints) => {
    renderMap();
  });
};

// 印刷機能
function preparePrint(holes) {
  const cardsHtml = holes.map(hole => {
    const pinData = getPinPosition(hole.number, selectedDate);
    if (!pinData) {
      return `
        <div class="print-hole-card empty">
          <div class="hole-header">Hole ${hole.number}</div>
          <div class="no-data">未設定</div>
        </div>
      `;
    }
    
    const { greenType, position: pin } = pinData;
    const points = getCurrentGreenPoints(hole, greenType);
    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
    
    const relY = Math.round(250 - pin.y);
    const relX = Math.round(pin.x - 250);
    const yardage = greenType === 'A' ? hole.yardageA : hole.yardageB;
    
    return `
      <div class="print-hole-card">
        <div class="hole-header">
          <span class="hole-num">Hole ${hole.number}</span>
          <span class="hole-par">Par ${hole.par}</span>
          <span class="hole-green">${greenType}G</span>
          <span class="hole-yard">${yardage}Y</span>
        </div>
        <div class="print-svg-container">
          <svg viewBox="0 0 500 500">
            <!-- グリーン形状 -->
            <polygon points="${polygonPoints}" fill="#f0fdf4" stroke="#064e3b" stroke-width="4" />
            
            <!-- センターライン (目安) -->
            <line x1="250" y1="0" x2="250" y2="500" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="8,8" />
            <line x1="0" y1="250" x2="500" y2="250" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="8,8" />
            
            <!-- ピンポジション -->
            <g>
              <line x1="${pin.x}" y1="${pin.y}" x2="${pin.x}" y2="${pin.y - 80}" stroke="#000" stroke-width="3" />
              <rect x="${pin.x}" y="${pin.y - 80}" width="40" height="25" fill="#ef4444" />
              <circle cx="${pin.x}" cy="${pin.y}" r="10" fill="#fff" stroke="#ef4444" stroke-width="4" />
            </g>
          </svg>
        </div>
        <div class="hole-coords">
          <div class="coord-row">手前/奥: <span>${relY > 0 ? '+' + relY : relY}</span></div>
          <div class="coord-row">左/右: <span>${relX > 0 ? '+' + relX : relX}</span></div>
        </div>
      </div>
    `;
  }).join('');

  const typeName = holes[0].number === 1 ? 'OUT (1-9)' : 'IN (10-18)';

  printAreaEl.innerHTML = `
    <div class="print-page">
      <div class="print-header">
        <h1>Pin Position - ${typeName}</h1>
        <div class="print-meta">
          <span>勝浦東急ゴルフコース</span>
          <span class="print-date">${selectedDate.replace(/-/g, '/')}</span>
        </div>
      </div>
      
      <div class="print-grid">
        ${cardsHtml}
      </div>
      
      <div class="print-footer">
        Generated by Green Master
      </div>
    </div>
  `;

  window.print();
}

printOutBtn.onclick = () => preparePrint(HOLE_DATA.slice(0, 9));
printInBtn.onclick = () => preparePrint(HOLE_DATA.slice(9, 18));

// 履歴削除
document.getElementById('clear-history').onclick = () => {
  if (confirm('すべてのピンポジション履歴を削除してもよろしいですか？（この操作は取り消せません）')) {
    clearAllHistory();
    renderMap();
    updateUI();
    alert('履歴をすべて削除しました。');
  }
};

// データ保存 (Export)
document.getElementById('export-data').onclick = () => {
  const data = {
    history: getAllHistory(),
    greenPoints: getAllGreenPoints()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `green-master-data-${getFormattedDate()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// データ復元 (Import)
const importBtn = document.getElementById('import-data');
const importFile = document.getElementById('import-file');

importBtn.onclick = () => importFile.click();

importFile.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.history) localStorage.setItem('green_master_history', JSON.stringify(data.history));
      if (data.greenPoints) localStorage.setItem('green_master_points', JSON.stringify(data.greenPoints));
      
      alert('データを復元しました。ページを更新します。');
      window.location.reload();
    } catch (err) {
      alert('データの読み込みに失敗しました。ファイル形式を確認してください。');
    }
  };
  reader.readAsText(file);
};

init();
