// ===== State =====
let map;
let parcelsData = [];
let parcelLayers = {};
let selectedParcelId = null;
let currentScreen = 0; // 0=landing, 1=map, 2=ranking, 3=detail, 4=impact
let displayMode = 'score'; // 'score' or 'roi'
let drawnRect = null;
let impactCircles = [];

// ===== Grade helpers =====
function getGrade(score) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}
function gradeColor(grade) {
  return { A: '#2e7d32', B: '#00897b', C: '#ff8f00', D: '#e53935' }[grade];
}
function gradeFill(grade) {
  return { A: '#a5d6a7', B: '#80cbc4', C: '#ffe082', D: '#ef9a9a' }[grade];
}

// ===== Screen 0 → Screen 1 =====
function startDemo() {
  document.getElementById('screen0').style.display = 'none';
  document.getElementById('screen-map').style.display = 'block';
  initMap();
}

// ===== Map Init (Screen 1) =====
function initMap() {
  map = L.map('map', { zoomControl: true }).setView([35.6555, 139.7570], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Leaflet.draw – rectangle only
  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  const drawControl = new L.Control.Draw({
    draw: {
      polygon: false, polyline: false, circle: false,
      circlemarker: false, marker: false,
      rectangle: { shapeOptions: { color: '#1565c0', weight: 2, fillOpacity: 0.1 } }
    },
    edit: { featureGroup: drawnItems, remove: false, edit: false }
  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (e) {
    if (drawnRect) drawnItems.removeLayer(drawnRect);
    drawnRect = e.layer;
    drawnItems.addLayer(drawnRect);
    onAreaSelected();
  });
}

// ===== Screen 2: Area Selected =====
async function onAreaSelected() {
  document.getElementById('guide-text').textContent = '分析中…';
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('show');

  // Load parcels
  if (parcelsData.length === 0) {
    try {
      const resp = await fetch('data/parcels.json');
      parcelsData = await resp.json();
    } catch (e) {
      // Fallback: inline data if fetch fails (file:// protocol)
      console.warn('Fetch failed, using inline data');
      parcelsData = await loadInlineData();
    }
  }

  setTimeout(() => {
    overlay.classList.remove('show');
    document.getElementById('guide-text').textContent = 'エリア内の筆を評価しました';
    drawParcels();
    showRankingPanel();
    currentScreen = 2;
  }, 500);
}

// Fallback inline data loader
async function loadInlineData() {
  return [
    {"id":"P001","name":"浜松町1-1","lat":35.6560,"lng":139.7565,"polygon":[[35.6563,139.7561],[35.6563,139.7569],[35.6557,139.7569],[35.6557,139.7561]],"zone":"商業地域","far":800,"score":92,"roi":7.8,"rent":28000,"area":1200,"vacancy":2.1,"floors":14,"units":120,"cost":4800,"landPrice":950},
    {"id":"P002","name":"浜松町2-3","lat":35.6552,"lng":139.7558,"polygon":[[35.6555,139.7554],[35.6555,139.7562],[35.6549,139.7562],[35.6549,139.7554]],"zone":"商業地域","far":700,"score":85,"roi":7.2,"rent":26000,"area":980,"vacancy":3.0,"floors":12,"units":96,"cost":3900,"landPrice":880},
    {"id":"P003","name":"芝大門1-5","lat":35.6575,"lng":139.7555,"polygon":[[35.6578,139.7551],[35.6578,139.7559],[35.6572,139.7559],[35.6572,139.7551]],"zone":"商業地域","far":600,"score":81,"roi":6.9,"rent":25000,"area":850,"vacancy":3.5,"floors":10,"units":80,"cost":3200,"landPrice":820},
    {"id":"P004","name":"海岸1-2","lat":35.6545,"lng":139.7590,"polygon":[[35.6548,139.7586],[35.6548,139.7594],[35.6542,139.7594],[35.6542,139.7586]],"zone":"準工業地域","far":500,"score":74,"roi":6.1,"rent":22000,"area":1500,"vacancy":4.2,"floors":8,"units":64,"cost":3600,"landPrice":650},
    {"id":"P005","name":"芝大門2-1","lat":35.6568,"lng":139.7545,"polygon":[[35.6571,139.7541],[35.6571,139.7549],[35.6565,139.7549],[35.6565,139.7541]],"zone":"商業地域","far":600,"score":71,"roi":5.8,"rent":21000,"area":720,"vacancy":4.8,"floors":9,"units":54,"cost":2700,"landPrice":780},
    {"id":"P006","name":"浜松町1-8","lat":35.6558,"lng":139.7578,"polygon":[[35.6561,139.7574],[35.6561,139.7582],[35.6555,139.7582],[35.6555,139.7574]],"zone":"商業地域","far":700,"score":67,"roi":5.5,"rent":20000,"area":680,"vacancy":5.1,"floors":10,"units":70,"cost":2800,"landPrice":750},
    {"id":"P007","name":"芝公園3-4","lat":35.6583,"lng":139.7535,"polygon":[[35.6586,139.7531],[35.6586,139.7539],[35.6580,139.7539],[35.6580,139.7531]],"zone":"第二種住居地域","far":400,"score":62,"roi":5.2,"rent":19000,"area":600,"vacancy":5.5,"floors":7,"units":42,"cost":2100,"landPrice":700},
    {"id":"P008","name":"海岸2-5","lat":35.6535,"lng":139.7600,"polygon":[[35.6538,139.7596],[35.6538,139.7604],[35.6532,139.7604],[35.6532,139.7596]],"zone":"準工業地域","far":400,"score":53,"roi":4.5,"rent":16000,"area":2000,"vacancy":6.8,"floors":6,"units":48,"cost":3000,"landPrice":520},
    {"id":"P009","name":"芝1-7","lat":35.6590,"lng":139.7525,"polygon":[[35.6593,139.7521],[35.6593,139.7529],[35.6587,139.7529],[35.6587,139.7521]],"zone":"第一種住居地域","far":300,"score":48,"roi":4.1,"rent":15000,"area":550,"vacancy":7.2,"floors":5,"units":30,"cost":1500,"landPrice":620},
    {"id":"P010","name":"大門1-3","lat":35.6570,"lng":139.7570,"polygon":[[35.6573,139.7566],[35.6573,139.7574],[35.6567,139.7574],[35.6567,139.7566]],"zone":"商業地域","far":500,"score":44,"roi":3.8,"rent":14500,"area":480,"vacancy":7.8,"floors":7,"units":35,"cost":1800,"landPrice":690},
    {"id":"P011","name":"海岸3-1","lat":35.6528,"lng":139.7610,"polygon":[[35.6531,139.7606],[35.6531,139.7614],[35.6525,139.7614],[35.6525,139.7606]],"zone":"準工業地域","far":300,"score":35,"roi":3.2,"rent":12000,"area":1800,"vacancy":9.5,"floors":4,"units":24,"cost":2200,"landPrice":380},
    {"id":"P012","name":"芝5-2","lat":35.6598,"lng":139.7518,"polygon":[[35.6601,139.7514],[35.6601,139.7522],[35.6595,139.7522],[35.6595,139.7514]],"zone":"第一種住居地域","far":200,"score":28,"roi":2.5,"rent":11000,"area":420,"vacancy":11.0,"floors":3,"units":12,"cost":800,"landPrice":450}
  ];
}

// ===== Draw parcels on map =====
function drawParcels() {
  // Clear existing
  Object.values(parcelLayers).forEach(l => map.removeLayer(l));
  parcelLayers = {};

  parcelsData.forEach(p => {
    const grade = getGrade(p.score);
    const latlngs = p.polygon.map(c => [c[0], c[1]]);
    const layer = L.polygon(latlngs, {
      color: gradeColor(grade),
      fillColor: gradeFill(grade),
      fillOpacity: 0.6,
      weight: 2
    }).addTo(map);

    // Tooltip
    layer.bindTooltip(`${p.name}<br>${displayMode === 'score' ? 'スコア: ' + p.score : 'ROI: ' + p.roi + '%'}`, {
      direction: 'top', className: '', offset: [0, -5]
    });

    // Click → highlight
    layer.on('click', () => selectParcel(p.id));
    // Double click → detail
    layer.on('dblclick', (e) => {
      L.DomEvent.stopPropagation(e);
      showDetailPanel(p.id);
    });

    parcelLayers[p.id] = layer;
  });
}

// ===== Update polygon styles =====
function updateParcelStyles() {
  parcelsData.forEach(p => {
    const layer = parcelLayers[p.id];
    if (!layer) return;
    const grade = getGrade(p.score);
    const isSelected = p.id === selectedParcelId;
    layer.setStyle({
      color: gradeColor(grade),
      fillColor: gradeFill(grade),
      fillOpacity: isSelected ? 0.85 : (selectedParcelId ? 0.25 : 0.6),
      weight: isSelected ? 4 : 2
    });
    // Update tooltip
    layer.unbindTooltip();
    layer.bindTooltip(`${p.name}<br>${displayMode === 'score' ? 'スコア: ' + p.score : 'ROI: ' + p.roi + '%'}`, {
      direction: 'top', offset: [0, -5]
    });
  });
}

// ===== Select parcel =====
function selectParcel(id) {
  selectedParcelId = id;
  updateParcelStyles();
  highlightRankingItem(id);
}

// ===== Show Ranking Panel (Screen 2) =====
function showRankingPanel() {
  currentScreen = 2;
  selectedParcelId = null;
  clearImpactOverlay();

  const sorted = [...parcelsData].sort((a, b) =>
    displayMode === 'score' ? b.score - a.score : b.roi - a.roi
  );
  const avgScore = (parcelsData.reduce((s, p) => s + p.score, 0) / parcelsData.length).toFixed(1);
  const maxRoi = Math.max(...parcelsData.map(p => p.roi)).toFixed(1);
  const aCount = parcelsData.filter(p => p.score >= 80).length;

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="panel-header"><h3>筆評価ランキング</h3></div>
    <div class="summary-bar">
      <div class="summary-item"><div class="label">候補筆数</div><div class="value">${parcelsData.length}</div></div>
      <div class="summary-item"><div class="label">平均スコア</div><div class="value">${avgScore}</div></div>
      <div class="summary-item"><div class="label">最高ROI</div><div class="value">${maxRoi}%</div></div>
      <div class="summary-item"><div class="label">Aランク</div><div class="value">${aCount}件</div></div>
    </div>
    <div class="toggle-bar">
      <button class="toggle-btn ${displayMode === 'score' ? 'active' : ''}" onclick="setDisplayMode('score')">スコア表示</button>
      <button class="toggle-btn ${displayMode === 'roi' ? 'active' : ''}" onclick="setDisplayMode('roi')">ROI表示</button>
    </div>
    <div class="ranking-list">
      ${sorted.map((p, i) => {
        const grade = getGrade(p.score);
        return `<div class="ranking-item" id="rank-${p.id}" onclick="onRankClick('${p.id}')" ondblclick="showDetailPanel('${p.id}')">
          <div class="rank-num rank-${grade}">${i + 1}</div>
          <div class="rank-info">
            <div class="rank-name">${p.name}</div>
            <div class="rank-sub">${displayMode === 'score' ? 'スコア: ' + p.score : 'ROI: ' + p.roi + '%'} / ${p.zone}</div>
          </div>
          <div class="rank-badge grade-${grade}">${grade}</div>
        </div>`;
      }).join('')}
    </div>
  `;

  updateParcelStyles();
}

function setDisplayMode(mode) {
  displayMode = mode;
  showRankingPanel();
  updateParcelStyles();
}

function onRankClick(id) {
  if (selectedParcelId === id) {
    showDetailPanel(id);
  } else {
    selectParcel(id);
  }
}

function highlightRankingItem(id) {
  document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('rank-' + id);
  if (el) {
    el.classList.add('active');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ===== Screen 3: Detail Panel =====
function showDetailPanel(id) {
  currentScreen = 3;
  selectedParcelId = id;
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;
  const grade = getGrade(p.score);

  // Center map on parcel
  map.panTo([p.lat, p.lng]);
  updateParcelStyles();

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="detail-panel">
      <div class="detail-actions">
        <button class="back-btn" onclick="showRankingPanel()">← 一覧に戻る</button>
        <button class="impact-btn" onclick="showImpactPanel('${p.id}')">インパクト推計 →</button>
      </div>
      <div class="detail-header">
        <h3>${p.name}</h3>
        <div class="rank-badge grade-${grade}" style="font-size:14px; padding:4px 14px;">${grade}</div>
      </div>
      <div class="detail-metrics">
        <div class="metric-card">
          <div class="metric-label">ROI</div>
          <div class="metric-value">${p.roi}<span class="metric-unit">%</span></div>
        </div>
        <div class="metric-card">
          <div class="metric-label">想定賃料</div>
          <div class="metric-value">${(p.rent / 1000).toFixed(0)}<span class="metric-unit">千円/m²</span></div>
        </div>
        <div class="metric-card">
          <div class="metric-label">空室率予測</div>
          <div class="metric-value">${p.vacancy}<span class="metric-unit">%</span></div>
        </div>
        <div class="metric-card">
          <div class="metric-label">概算建築費</div>
          <div class="metric-value">${p.cost}<span class="metric-unit">百万円</span></div>
        </div>
      </div>
      <table class="detail-table">
        <tr><td>魅力度スコア</td><td>${p.score}</td></tr>
        <tr><td>用途地域</td><td>${p.zone}</td></tr>
        <tr><td>容積率</td><td>${p.far}%</td></tr>
        <tr><td>敷地面積</td><td>${p.area.toLocaleString()} m²</td></tr>
        <tr><td>想定階数</td><td>${p.floors}階</td></tr>
        <tr><td>想定戸数</td><td>${p.units}戸</td></tr>
        <tr><td>想定土地代</td><td>${p.landPrice}万円/m²</td></tr>
      </table>
    </div>
  `;
}

// ===== Screen 4: Impact Panel =====
function showImpactPanel(id) {
  currentScreen = 4;
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;

  renderImpactUI(p, 'large-sc', 20000);
}

function renderImpactUI(p, facilityType, floorArea) {
  clearImpactOverlay();

  // Dummy impact calculations
  const facilityMultiplier = { 'large-sc': 1.0, 'office': 0.7, 'tower-mansion': 0.5 }[facilityType] || 1.0;
  const areaMultiplier = floorArea / 20000;
  const base200 = 12 * facilityMultiplier * areaMultiplier;
  const base500 = 6 * facilityMultiplier * areaMultiplier;
  const base1000 = 2 * facilityMultiplier * areaMultiplier;
  const visitors = Math.round(5000 * facilityMultiplier * areaMultiplier);
  const vacancyChange = -(2.5 * facilityMultiplier * areaMultiplier);
  const capRateChange = -(0.3 * facilityMultiplier * areaMultiplier);

  // Draw concentric circles
  const colors = ['rgba(21,101,192,0.25)', 'rgba(21,101,192,0.15)', 'rgba(21,101,192,0.08)'];
  const radii = [200, 500, 1000];
  radii.forEach((r, i) => {
    const circle = L.circle([p.lat, p.lng], {
      radius: r,
      color: '#1565c0',
      weight: 1,
      fillColor: colors[i],
      fillOpacity: 1,
      dashArray: '4 4'
    }).addTo(map);
    circle.bindTooltip(`${r}m圏`, { permanent: true, direction: 'center', className: '' });
    impactCircles.push(circle);
  });

  const facilityLabels = { 'large-sc': '大型SC', 'office': 'オフィスビル', 'tower-mansion': 'タワーマンション' };

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="impact-panel">
      <h3>開発インパクト推計</h3>
      <div class="impact-control">
        <label>施設タイプ</label>
        <select id="facility-type" onchange="onImpactChange('${p.id}')">
          <option value="large-sc" ${facilityType === 'large-sc' ? 'selected' : ''}>大型SC</option>
          <option value="office" ${facilityType === 'office' ? 'selected' : ''}>オフィスビル</option>
          <option value="tower-mansion" ${facilityType === 'tower-mansion' ? 'selected' : ''}>タワーマンション</option>
        </select>
      </div>
      <div class="impact-control">
        <label>延床面積</label>
        <input type="range" id="floor-area" min="5000" max="50000" step="1000" value="${floorArea}" oninput="onImpactChange('${p.id}')">
        <div class="impact-range-val" id="floor-area-val">${floorArea.toLocaleString()} m²</div>
      </div>

      <div class="impact-results">
        <h4>距離帯別 賃料変化率</h4>
        <div class="impact-row"><span class="ir-label">200m圏</span><span class="ir-value positive">+${base200.toFixed(1)}%</span></div>
        <div class="impact-row"><span class="ir-label">500m圏</span><span class="ir-value positive">+${base500.toFixed(1)}%</span></div>
        <div class="impact-row"><span class="ir-label">1km圏</span><span class="ir-value positive">+${base1000.toFixed(1)}%</span></div>

        <h4 style="margin-top:16px">その他推計</h4>
        <div class="impact-row"><span class="ir-label">来訪者増加</span><span class="ir-value positive">+${visitors.toLocaleString()} 人/日</span></div>
        <div class="impact-row"><span class="ir-label">空室率変化</span><span class="ir-value positive">${vacancyChange.toFixed(1)}%</span></div>
        <div class="impact-row"><span class="ir-label">Cap Rate変化</span><span class="ir-value positive">${capRateChange.toFixed(2)}%</span></div>
      </div>

      <button class="impact-back-btn" onclick="showDetailPanel('${p.id}')">← 詳細に戻る</button>
    </div>
  `;
}

function onImpactChange(id) {
  const ft = document.getElementById('facility-type').value;
  const fa = parseInt(document.getElementById('floor-area').value);
  document.getElementById('floor-area-val').textContent = fa.toLocaleString() + ' m²';
  const p = parcelsData.find(d => d.id === id);
  if (p) renderImpactUI(p, ft, fa);
}

function clearImpactOverlay() {
  impactCircles.forEach(c => map.removeLayer(c));
  impactCircles = [];
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start').addEventListener('click', startDemo);
});
