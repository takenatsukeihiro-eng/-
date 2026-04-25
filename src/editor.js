import { saveGreenPoints, getCurrentGreenPoints } from './data.js';

export function initEditor(hole, greenType, onSave) {
  const modal = document.getElementById('editor-modal');
  const container = document.getElementById('editor-container');
  const closeBtn = document.getElementById('close-editor');
  const saveBtn = document.getElementById('save-green');
  const resetBtn = document.getElementById('reset-green');

  let points = [...getCurrentGreenPoints(hole, greenType)];
  let draggingIndex = -1;

  function render() {
    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
    
    let handles = points.map((p, i) => `
      <circle cx="${p.x}" cy="${p.y}" r="8" class="edit-handle" data-index="${i}" />
    `).join('');

    container.innerHTML = `
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        <polygon points="${polygonPoints}" fill="#a7f3d0" stroke="#059669" stroke-width="2" />
        ${handles}
      </svg>
    `;

    // イベントアタッチ
    const svg = container.querySelector('svg');
    svg.onmousedown = handleMouseDown;
    svg.onmousemove = handleMouseMove;
    svg.onmouseup = handleMouseUp;
    svg.onmouseleave = handleMouseUp;
    
    // タッチ対応
    svg.ontouchstart = (e) => handleMouseDown(e.touches[0]);
    svg.ontouchmove = (e) => {
      e.preventDefault();
      handleMouseMove(e.touches[0]);
    };
    svg.ontouchend = handleMouseUp;
  }

  function handleMouseDown(e) {
    if (e.target.dataset.index !== undefined) {
      draggingIndex = parseInt(e.target.dataset.index);
    }
  }

  function handleMouseMove(e) {
    if (draggingIndex === -1) return;
    
    const rect = container.querySelector('svg').getBoundingClientRect();
    const scale = 500 / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    
    points[draggingIndex] = { x, y };
    render();
  }

  function handleMouseUp() {
    draggingIndex = -1;
  }

  closeBtn.onclick = () => {
    modal.classList.remove('show');
  };

  saveBtn.onclick = () => {
    saveGreenPoints(hole.number, greenType, points);
    onSave(points);
    modal.classList.remove('show');
  };

  resetBtn.onclick = () => {
    if (confirm(`このホールの${greenType}グリーン形状を初期状態に戻しますか？`)) {
      points = [...(greenType === 'A' ? hole.pointsA : hole.pointsB)];
      render();
    }
  };

  modal.classList.add('show');
  render();
}
