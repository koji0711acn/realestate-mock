// ===== State =====
let map;
let parcelsData = [];
let parcelLayers = {};
let parcelTooltips = {};
let selectedParcelId = null;
let currentScreen = 0;
let displayMode = 'score';
let drawnRect = null;
let impactCircles = [];
let guideStep = 0;
let guideOverlay = null;
let dataAreaRect = null;
let pulseCircle = null;

// Data bounds (for guide guardrail)
const DATA_BOUNDS = { south: 35.6520, north: 35.6610, west: 139.7510, east: 139.7620 };

// ===== Grade helpers (Task 2 colors) =====
function getGrade(score) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}
function gradeColor(grade) {
  return { A: '#2d8a4e', B: '#1a7a6d', C: '#c4840a', D: '#c0392b' }[grade];
}
function gradeFill(grade) {
  return { A: '#5cb87a', B: '#4db6a0', C: '#e8a830', D: '#e57373' }[grade];
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

  // Task 1: Carto Positron tile
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
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

  // Task 5: Add label to draw button
  setTimeout(() => {
    const drawBtn = document.querySelector('.leaflet-draw-draw-rectangle');
    if (drawBtn) {
      drawBtn.title = 'クリックしてエリア選択を開始';
    }
  }, 100);

  // Task 5: Guide text
  document.getElementById('guide-text').innerHTML =
    '<b>① </b>左上の「エリア選択」をクリック → <b>② </b>地図上でドラッグ → <b>③ </b>エリア内の全筆を自動評価';

  // Listen for draw start (Task 4: step 2)
  map.on('draw:drawstart', function () {
    showGuideStep2();
  });

  map.on(L.Draw.Event.CREATED, function (e) {
    if (drawnRect) drawnItems.removeLayer(drawnRect);
    drawnRect = e.layer;
    drawnItems.addLayer(drawnRect);
    hideGuide();
    onAreaSelected();
  });

  // Task 4: Show guide step 1
  setTimeout(() => showGuideStep1(), 600);
}

// ===== Task 4: Demo Guide =====
function showGuideStep1() {
  guideStep = 1;
  // Show pulse circle at data center
  pulseCircle = L.circle([35.6565, 139.7565], {
    radius: 600,
    color: '#1565c0',
    weight: 3,
    fill: false,
    className: 'pulse-circle'
  }).addTo(map);

  // Show data area hint
  dataAreaRect = L.rectangle(
    [[DATA_BOUNDS.south, DATA_BOUNDS.west], [DATA_BOUNDS.north, DATA_BOUNDS.east]],
    { color: '#1565c0', weight: 2, dashArray: '6 4', fillColor: '#1565c0', fillOpacity: 0.05, interactive: false }
  ).addTo(map);

  showGuideOverlay(
    '浜松町エリアにスタブデータが用意されています。<br>左上の選択ツール（□）をクリックし、ハイライトされた範囲を囲んでください。',
    'OK'
  );
}

function showGuideStep2() {
  guideStep = 2;
  hideGuide();
  if (pulseCircle) { map.removeLayer(pulseCircle); pulseCircle = null; }

  showGuideOverlay(
    '地図上をドラッグして、評価したいエリアを選択してください',
    null
  );
  // Auto dismiss after 2s
  setTimeout(() => { if (guideStep === 2) hideGuide(); }, 2000);
}

function showGuideStep3() {
  guideStep = 3;
  showGuideOverlay(
    '12件の候補筆が見つかりました。<br>筆をクリックして詳細を確認できます。',
    null
  );
  setTimeout(() => { if (guideStep === 3) hideGuide(); }, 3000);
}

function showGuideOverlay(message, btnText) {
  hideGuide();
  const el = document.createElement('div');
  el.className = 'guide-overlay' + (btnText ? ' clickable' : '');
  el.innerHTML = `
    <div class="guide-message">
      <p>${message}</p>
      ${btnText ? `<button class="guide-dismiss" onclick="hideGuide()">${btnText}</button>` : ''}
    </div>
  `;
  if (!btnText) {
    el.addEventListener('click', () => hideGuide());
  }
  document.getElementById('screen-map').appendChild(el);
  guideOverlay = el;
}

function hideGuide() {
  if (guideOverlay) {
    guideOverlay.remove();
    guideOverlay = null;
  }
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.getElementById('screen-map').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== Screen 2: Area Selected =====
async function onAreaSelected() {
  // Task 4: Check if within data bounds
  if (drawnRect) {
    const bounds = drawnRect.getBounds();
    const intersects = bounds.getSouth() < DATA_BOUNDS.north &&
      bounds.getNorth() > DATA_BOUNDS.south &&
      bounds.getWest() < DATA_BOUNDS.east &&
      bounds.getEast() > DATA_BOUNDS.west;
    if (!intersects) {
      showToast('デモ版のため、浜松町エリアのデータのみ利用可能です。ハイライトされた範囲を選択してください。');
      return;
    }
  }

  if (dataAreaRect) { map.removeLayer(dataAreaRect); dataAreaRect = null; }
  if (pulseCircle) { map.removeLayer(pulseCircle); pulseCircle = null; }

  document.getElementById('guide-text').textContent = '分析中…';
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('show');

  if (parcelsData.length === 0) {
    try {
      const resp = await fetch('data/parcels.json');
      parcelsData = await resp.json();
    } catch (e) {
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
    // Task 4: Step 3
    showGuideStep3();
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

// ===== Draw parcels on map (Task 2) =====
function drawParcels() {
  Object.values(parcelLayers).forEach(l => map.removeLayer(l));
  Object.values(parcelTooltips).forEach(t => map.removeLayer(t));
  parcelLayers = {};
  parcelTooltips = {};

  parcelsData.forEach(p => {
    const grade = getGrade(p.score);
    const latlngs = p.polygon.map(c => [c[0], c[1]]);
    const layer = L.polygon(latlngs, {
      color: gradeColor(grade),
      fillColor: gradeFill(grade),
      fillOpacity: 0.6,
      weight: 2
    }).addTo(map);

    // Task 2: Permanent score tooltip at center
    const center = layer.getBounds().getCenter();
    const scoreLabel = L.tooltip({
      permanent: true,
      direction: 'center',
      className: 'score-tooltip',
      offset: [0, 0]
    }).setLatLng(center).setContent(String(p.score)).addTo(map);
    parcelTooltips[p.id] = scoreLabel;

    // Task 2: Hover effects
    layer.on('mouseover', () => {
      if (p.id !== selectedParcelId) {
        layer.setStyle({ fillOpacity: 0.8, weight: 3 });
      }
    });
    layer.on('mouseout', () => {
      if (p.id !== selectedParcelId) {
        const isAnySelected = selectedParcelId !== null;
        layer.setStyle({
          fillOpacity: isAnySelected ? 0.25 : 0.6,
          weight: 2
        });
      }
    });

    layer.on('click', () => selectParcel(p.id));
    layer.on('dblclick', (e) => {
      L.DomEvent.stopPropagation(e);
      showDetailPanel(p.id);
    });

    parcelLayers[p.id] = layer;
  });
}

// ===== Update polygon styles (Task 2) =====
function updateParcelStyles() {
  parcelsData.forEach(p => {
    const layer = parcelLayers[p.id];
    if (!layer) return;
    const grade = getGrade(p.score);
    const isSelected = p.id === selectedParcelId;
    layer.setStyle({
      color: isSelected ? '#ffffff' : gradeColor(grade),
      fillColor: gradeFill(grade),
      fillOpacity: isSelected ? 0.85 : (selectedParcelId ? 0.25 : 0.6),
      weight: isSelected ? 3 : 2
    });

    // Update score tooltip content for display mode
    const tooltip = parcelTooltips[p.id];
    if (tooltip) {
      tooltip.setContent(displayMode === 'score' ? String(p.score) : p.roi + '%');
    }
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
        const valueText = displayMode === 'score' ? p.score : p.roi + '%';
        return `<div class="ranking-item" id="rank-${p.id}" onclick="onRankClick('${p.id}')" ondblclick="showDetailPanel('${p.id}')">
          <div class="rank-num rank-${grade}">${i + 1}</div>
          <div class="rank-info">
            <div class="rank-name">${p.name}</div>
            <div class="rank-sub">${p.zone}</div>
          </div>
          <span class="rank-score">${valueText}</span>
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

// ===== Task 6: Metric descriptions =====
const metricDescriptions = {
  'ROI': '想定賃料収入から建築費・土地取得費・管理費等を差し引いた年間純収益を、総投資額で割った値。周辺相場と空室率予測に基づく推計値',
  '想定賃料': '周辺500m圏内の成約賃料実績と、築年数・階数・用途を考慮した回帰モデルによる推計値（円/m²）',
  '空室率予測': '同一用途地域・同一駅圏の直近3年間の平均空室率に、新規供給予測を加味した予測値',
  '概算建築費': '用途・構造・階数に基づく建築工事費の概算。杭工事・外構・設計監理費を含む',
  '魅力度スコア': '法規制適合性、交通利便性、周辺賃料水準、開発余地、ハザードリスクの5要素を重み付けして算出した総合指標（0-100）'
};

function toggleMetricDetail(el) {
  const detail = el.nextElementSibling;
  if (!detail) return;
  el.classList.toggle('expanded');
  detail.classList.toggle('open');
}

function toggleDetailRow(el) {
  el.classList.toggle('expanded');
}

// ===== Screen 3: Detail Panel (Task 6 + Task 10) =====
function showDetailPanel(id) {
  currentScreen = 3;
  selectedParcelId = id;
  clearImpactOverlay();
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;
  const grade = getGrade(p.score);

  map.panTo([p.lat, p.lng]);
  updateParcelStyles();

  const metrics = [
    { label: 'ROI', value: p.roi, unit: '%' },
    { label: '想定賃料', value: (p.rent / 1000).toFixed(0), unit: '千円/m²' },
    { label: '空室率予測', value: p.vacancy, unit: '%' },
    { label: '概算建築費', value: p.cost, unit: '百万円' }
  ];

  const detailRows = [
    { label: '魅力度スコア', value: p.score, desc: metricDescriptions['魅力度スコア'] },
    { label: '用途地域', value: p.zone },
    { label: '容積率', value: p.far + '%' },
    { label: '敷地面積', value: p.area.toLocaleString() + ' m²' },
    { label: '想定階数', value: p.floors + '階' },
    { label: '想定戸数', value: p.units + '戸' },
    { label: '想定土地代', value: p.landPrice + '万円/m²' }
  ];

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
      ${metrics.map(m => `
        <div class="metric-card" onclick="toggleMetricDetail(this)">
          <span class="expand-icon">▼</span>
          <div class="metric-label">${m.label}</div>
          <div class="metric-value">${m.value}<span class="metric-unit">${m.unit}</span></div>
        </div>
        <div class="metric-detail">
          <div class="metric-detail-content">${metricDescriptions[m.label] || ''}</div>
        </div>
      `).join('')}
      <div style="margin-top:12px">
        ${detailRows.map(r => {
          if (r.desc) {
            return `<div class="detail-row" onclick="toggleDetailRow(this)">
              <div class="detail-row-header">
                <span class="dr-label">${r.label}</span>
                <span><span class="dr-value">${r.value}</span><span class="dr-arrow">▼</span></span>
              </div>
              <div class="detail-row-body">
                <div class="detail-row-desc">${r.desc}</div>
              </div>
            </div>`;
          }
          return `<div class="detail-row">
            <div class="detail-row-header">
              <span class="dr-label">${r.label}</span>
              <span class="dr-value">${r.value}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:16px">
        <button class="impact-btn" onclick="showAcquisitionPanel('${p.id}')" style="width:100%;text-align:center;">用地取得を検討 →</button>
      </div>
    </div>
  `;
}

// ===== Task 8: BIM Model helpers =====
const facilityConfig = {
  'large-sc': { label: '大型ショッピングセンター', floors: 3, w: 100, h: 30, tenants: true },
  'office': { label: 'オフィスビル', floors: 10, w: 50, h: 80, tenants: true },
  'tower-mansion': { label: 'タワーマンション', floors: 25, w: 35, h: 140, tenants: false },
  'complex': { label: '複合施設', floors: 15, w: 60, h: 100, tenants: true }
};

function getBimHTML(facilityType, floorArea) {
  const cfg = facilityConfig[facilityType] || facilityConfig['large-sc'];
  const scale = Math.max(0.5, Math.min(1.5, floorArea / 20000));
  const w = Math.round(cfg.w * scale);
  const h = Math.round(cfg.h * scale);
  const skewH = Math.round(h * 0.3);
  const skewW = Math.round(w * 0.3);
  const floorCount = Math.round(cfg.floors * scale);
  const unitCount = cfg.tenants
    ? Math.round(floorArea / 200)
    : Math.round(floorArea / 80);
  const unitLabel = cfg.tenants ? 'テナント数' : '想定戸数';

  let bimBlocks = '';
  if (facilityType === 'complex') {
    // Low + High blocks
    const lowW = Math.round(w * 0.7);
    const lowH = Math.round(h * 0.3);
    const hiW = Math.round(w * 0.4);
    const hiH = Math.round(h * 0.8);
    bimBlocks = `
      <div class="bim-block" style="display:flex;align-items:flex-end;gap:4px;">
        <div style="position:relative">
          <div class="bim-front" style="width:${lowW}px;height:${lowH}px;"></div>
          <div class="bim-top" style="width:${lowW}px;height:${Math.round(lowH*0.3)}px;top:-${Math.round(lowH*0.3)}px;left:0;"></div>
          <div class="bim-side" style="width:${Math.round(lowW*0.3)}px;height:${lowH}px;top:-${Math.round(lowH*0.3)}px;left:${lowW}px;"></div>
        </div>
        <div style="position:relative">
          <div class="bim-front" style="width:${hiW}px;height:${hiH}px;"></div>
          <div class="bim-top" style="width:${hiW}px;height:${Math.round(hiH*0.15)}px;top:-${Math.round(hiH*0.15)}px;left:0;"></div>
          <div class="bim-side" style="width:${Math.round(hiW*0.3)}px;height:${hiH}px;top:-${Math.round(hiH*0.15)}px;left:${hiW}px;"></div>
        </div>
      </div>`;
  } else {
    bimBlocks = `
      <div class="bim-block" style="position:relative">
        <div class="bim-front" style="width:${w}px;height:${h}px;"></div>
        <div class="bim-top" style="width:${w}px;height:${skewH}px;top:-${skewH}px;left:0;"></div>
        <div class="bim-side" style="width:${skewW}px;height:${h}px;top:-${skewH}px;left:${w}px;"></div>
      </div>`;
  }

  return `
    <div class="bim-container">
      ${bimBlocks}
      <div class="bim-info">
        <div><span class="bim-stat">${cfg.label}</span></div>
        <div>延床面積: <span class="bim-stat">${floorArea.toLocaleString()} m²</span></div>
        <div>階数: <span class="bim-stat">${floorCount}階</span></div>
        <div>${unitLabel}: <span class="bim-stat">${unitCount}</span></div>
      </div>
    </div>`;
}

function toggleImpactCollapse(el) {
  el.closest('.impact-collapse').classList.toggle('open');
}

// ===== Screen 4: Impact Panel (Task 8) =====
function showImpactPanel(id) {
  currentScreen = 4;
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;
  renderImpactUI(p, 'large-sc', 20000);
}

function renderImpactUI(p, facilityType, floorArea) {
  clearImpactOverlay();

  const facilityMultiplier = { 'large-sc': 1.0, 'office': 0.7, 'tower-mansion': 0.5, 'complex': 0.85 }[facilityType] || 1.0;
  const areaMultiplier = floorArea / 20000;
  const base200 = 12 * facilityMultiplier * areaMultiplier;
  const base500 = 6 * facilityMultiplier * areaMultiplier;
  const base1000 = 2 * facilityMultiplier * areaMultiplier;
  const visitors = Math.round(5000 * facilityMultiplier * areaMultiplier);
  const vacancyChange = -(2.5 * facilityMultiplier * areaMultiplier);
  const capRateChange = -(0.3 * facilityMultiplier * areaMultiplier);

  const colors = ['rgba(21,101,192,0.25)', 'rgba(21,101,192,0.15)', 'rgba(21,101,192,0.08)'];
  const radii = [200, 500, 1000];
  radii.forEach((r, i) => {
    const circle = L.circle([p.lat, p.lng], {
      radius: r, color: '#1565c0', weight: 1,
      fillColor: colors[i], fillOpacity: 1, dashArray: '4 4'
    }).addTo(map);
    circle.bindTooltip(`${r}m圏`, { permanent: true, direction: 'center', className: '' });
    impactCircles.push(circle);
  });

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="impact-panel">
      <h3>開発インパクト推計</h3>
      <div class="impact-control">
        <label>施設タイプ</label>
        <select id="facility-type" onchange="onImpactChange('${p.id}')">
          <option value="large-sc" ${facilityType === 'large-sc' ? 'selected' : ''}>大型ショッピングセンター</option>
          <option value="office" ${facilityType === 'office' ? 'selected' : ''}>オフィスビル</option>
          <option value="tower-mansion" ${facilityType === 'tower-mansion' ? 'selected' : ''}>タワーマンション</option>
          <option value="complex" ${facilityType === 'complex' ? 'selected' : ''}>複合施設</option>
        </select>
      </div>
      <div class="impact-control">
        <label>延床面積</label>
        <input type="range" id="floor-area" min="5000" max="50000" step="1000" value="${floorArea}" oninput="onImpactChange('${p.id}')">
        <div class="impact-range-val" id="floor-area-val">${floorArea.toLocaleString()} m²</div>
      </div>
      ${getBimHTML(facilityType, floorArea)}
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
      <div class="impact-collapse" onclick="toggleImpactCollapse(this)">
        <div class="impact-collapse-header">推計ロジック <span class="ic-arrow">▼</span></div>
        <div class="impact-collapse-body">
          <div class="impact-collapse-content">半径Xm圏内の類似開発事例N件の実績に基づく回帰推計。説明変数: 施設延床面積、用途、最寄駅距離、既存商業集積度</div>
        </div>
      </div>
      <div class="impact-collapse" onclick="toggleImpactCollapse(this)">
        <div class="impact-collapse-header">前提条件 <span class="ic-arrow">▼</span></div>
        <div class="impact-collapse-body">
          <div class="impact-collapse-content">開業時期: 着工から36ヶ月後 / 稼働率想定: 初年度85%、3年目以降95% / テナント構成: 物販40%・飲食30%・サービス30%</div>
        </div>
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

// ===== Task 9: Screen 5 — Land Acquisition Panel =====
const ownerData = {
  P001: { ownership: '所有権', ownerCount: 1, registry: '令和4年8月 所有権移転（売買）', mortgage: 'あり（みずほ銀行）', planning: '特になし',
    owners: [{ name: '株式会社港南不動産', type: '法人', years: 8, intent: '中', reason: '相続発生後5年経過' }] },
  P002: { ownership: '所有権', ownerCount: 2, registry: '令和3年3月 所有権移転（相続）', mortgage: 'なし', planning: '地区計画あり',
    owners: [{ name: '田中太郎', type: '個人', years: 15, intent: '高', reason: '高齢・後継者不在' }, { name: '田中花子', type: '個人', years: 15, intent: '高', reason: '共有持分整理希望' }] },
  P003: { ownership: '借地権', ownerCount: 1, registry: '令和5年1月 賃借権設定', mortgage: 'なし', planning: '特になし',
    owners: [{ name: '芝大門ビルディング株式会社', type: '法人', years: 5, intent: '低', reason: '自社利用中' }] },
  P004: { ownership: '所有権', ownerCount: 3, registry: '平成30年6月 所有権移転（売買）', mortgage: 'あり（三井住友銀行）', planning: '特になし',
    owners: [{ name: '海岸開発合同会社', type: '法人', years: 12, intent: '中', reason: '事業再編検討中' }, { name: '株式会社MKホールディングス', type: '法人', years: 12, intent: '低', reason: '安定運用方針' }, { name: '佐藤次郎', type: '個人', years: 8, intent: '高', reason: '資金需要あり' }] },
  P005: { ownership: '所有権', ownerCount: 1, registry: '令和2年11月 所有権移転（売買）', mortgage: 'あり（りそな銀行）', planning: '特になし',
    owners: [{ name: '株式会社芝大門プロパティ', type: '法人', years: 6, intent: '中', reason: 'ポートフォリオ入替検討' }] },
};

function getOwnerInfo(parcelId) {
  if (ownerData[parcelId]) return ownerData[parcelId];
  // Generate dummy for other parcels
  return {
    ownership: '所有権', ownerCount: 1,
    registry: '令和4年4月 所有権移転（売買）', mortgage: 'なし', planning: '特になし',
    owners: [{ name: '不動産管理株式会社', type: '法人', years: 10, intent: '中', reason: '保有期間長期化' }]
  };
}

function intentClass(intent) {
  return { '高': 'intent-high', '中': 'intent-mid', '低': 'intent-low' }[intent] || 'intent-mid';
}

function getApproach(ownerCount, intent) {
  if (ownerCount === 1 && intent === '高') return '直接交渉（単独所有・売却意向高）';
  if (ownerCount > 1) return '仲介経由（共有・権利整理型）';
  if (intent === '低') return '情報収集継続（売却意向低）';
  return '直接交渉（条件提示型）';
}

function showAcquisitionPanel(id) {
  currentScreen = 5;
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;
  const info = getOwnerInfo(p.id);

  // Generate target list: A/B parcels
  const targets = parcelsData
    .filter(pp => pp.score >= 60)
    .sort((a, b) => b.score - a.score)
    .map((pp, i) => {
      const oi = getOwnerInfo(pp.id);
      const mainOwner = oi.owners[0];
      return { rank: i + 1, parcel: pp, owner: mainOwner, ownerCount: oi.ownerCount };
    });

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="acquisition-panel">
      <h3>用地取得プロセス — ${p.name}</h3>

      <div class="acq-section">
        <h4>権利構造</h4>
        <div class="acq-card">
          <div class="acq-card-row"><span class="acq-label">所有形態</span><span class="acq-value">${info.ownership}</span></div>
          <div class="acq-card-row"><span class="acq-label">地権者数</span><span class="acq-value">${info.ownerCount}名${info.ownerCount > 1 ? '（共有）' : ''}</span></div>
          <div class="acq-card-row"><span class="acq-label">登記情報</span><span class="acq-value">${info.registry}</span></div>
          <div class="acq-card-row"><span class="acq-label">抵当権</span><span class="acq-value">${info.mortgage}</span></div>
          <div class="acq-card-row"><span class="acq-label">都市計画制限</span><span class="acq-value">${info.planning}</span></div>
        </div>
      </div>

      <div class="acq-section">
        <h4>地権者情報</h4>
        ${info.owners.map(o => `
          <div class="owner-card">
            <div class="owner-name">${o.name} <span style="font-size:11px;color:#888;font-weight:400">(${o.type})</span></div>
            <div class="acq-card-row"><span class="acq-label">保有期間</span><span class="acq-value">${o.years}年</span></div>
            <div class="acq-card-row"><span class="acq-label">推定売却意向</span><span class="acq-value"><span class="intent-badge ${intentClass(o.intent)}">${o.intent}</span> ${o.reason}</span></div>
          </div>
        `).join('')}
      </div>

      <div class="acq-section">
        <h4>ターゲットリスト（A/Bランク筆）</h4>
        <table class="target-table">
          <thead>
            <tr><th>#</th><th>所在地</th><th>スコア</th><th>ROI</th><th>地権者</th><th>意向</th><th>推奨</th></tr>
          </thead>
          <tbody>
            ${targets.map(t => `
              <tr>
                <td>${t.rank}</td>
                <td>${t.parcel.name}</td>
                <td>${t.parcel.score}</td>
                <td>${t.parcel.roi}%</td>
                <td>${t.owner.name.slice(0, 6)}…</td>
                <td><span class="intent-badge ${intentClass(t.owner.intent)}">${t.owner.intent}</span></td>
                <td style="font-size:10px">${getApproach(t.ownerCount, t.owner.intent)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="acq-btn-group">
          <button class="acq-btn" onclick="showToast('CSV出力機能は製品版で提供予定です')">ターゲットリストをCSV出力</button>
          <button class="acq-btn" onclick="showToast('評価書生成機能は製品版で提供予定です')">評価書一括生成</button>
        </div>
      </div>

      <button class="acq-back-btn" onclick="showDetailPanel('${p.id}')">← 詳細に戻る</button>
    </div>
  `;
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start').addEventListener('click', startDemo);
});
