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
let gifInterval = null;

// Data bounds (Task 14: narrowed to ~300m around Hamamatsucho)
const DATA_BOUNDS = { south: 35.6538, north: 35.6572, west: 139.7545, east: 139.7585 };

// ===== Task 11: Login =====
const VALID_ID = 'rwai';
const VALID_PASS = 'rwai123!';

function handleLogin() {
  const id = document.getElementById('login-id').value;
  const pass = document.getElementById('login-pass').value;
  const errorEl = document.getElementById('login-error');
  if (id === VALID_ID && pass === VALID_PASS) {
    errorEl.textContent = '';
    document.getElementById('screen-login').style.display = 'none';
    document.getElementById('screen0').style.display = 'flex';
    startGifSlideshow();
  } else {
    errorEl.textContent = 'IDまたはパスワードが正しくありません';
  }
}

// ===== Task 12: GIF Slideshow =====
const gifTexts = [
  'エリアを指定するだけで、全筆の開発ポテンシャルを瞬時に評価',
  '施設建設が周辺の賃料・空室率に与える影響を定量シミュレーション',
  '地権者情報の特定からターゲットリスト生成まで一気通貫',
  '既存ツールでは実現できない、探索→評価→推計→取得の統合ワークフロー'
];
let gifTextIndex = 0;

function startGifSlideshow() {
  // Try to load demo.gif
  const display = document.getElementById('gif-display');
  const img = new Image();
  img.onload = function () {
    display.innerHTML = '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    display.appendChild(img);
  };
  img.src = 'data/demo.gif';

  // Start text rotation
  const textEl = document.getElementById('gif-text');
  textEl.textContent = gifTexts[0];
  textEl.classList.add('fade-in');
  gifInterval = setInterval(() => {
    textEl.classList.remove('fade-in');
    textEl.classList.add('fade-out');
    setTimeout(() => {
      gifTextIndex = (gifTextIndex + 1) % gifTexts.length;
      textEl.textContent = gifTexts[gifTextIndex];
      textEl.classList.remove('fade-out');
      textEl.classList.add('fade-in');
    }, 300);
  }, 4000);
}

// ===== Task 19: Comparison tab switch =====
function switchCompTab(tab) {
  document.querySelectorAll('.comp-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('comp-existing').style.display = tab === 'existing' ? 'block' : 'none';
  document.getElementById('comp-rwai').style.display = tab === 'rwai' ? 'block' : 'none';
  event.target.classList.add('active');
}

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
  if (gifInterval) { clearInterval(gifInterval); gifInterval = null; }
  document.getElementById('screen0').style.display = 'none';
  document.getElementById('screen-map').style.display = 'block';
  initMap();
}

// ===== Map Init (Screen 1) =====
function initMap() {
  map = L.map('map', { zoomControl: true }).setView([35.6555, 139.7565], 17);

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
  pulseCircle = L.circle([35.6555, 139.7565], {
    radius: 250,
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
    {"id":"P001","name":"浜松町1-1","lat":35.65555,"lng":139.75680,"polygon":[[35.65575,139.75660],[35.65575,139.75700],[35.65535,139.75700],[35.65535,139.75660]],"zone":"商業地域","far":800,"score":92,"roi":7.8,"rent":28000,"area":1200,"vacancy":2.1,"floors":14,"units":120,"cost":4800,"landPrice":950},
    {"id":"P002","name":"浜松町2-3","lat":35.65510,"lng":139.75620,"polygon":[[35.65525,139.75600],[35.65525,139.75640],[35.65495,139.75640],[35.65495,139.75600]],"zone":"商業地域","far":700,"score":85,"roi":7.2,"rent":26000,"area":980,"vacancy":3.0,"floors":12,"units":96,"cost":3900,"landPrice":880},
    {"id":"P003","name":"芝大門1-5","lat":35.65620,"lng":139.75580,"polygon":[[35.65640,139.75560],[35.65640,139.75600],[35.65600,139.75600],[35.65600,139.75560]],"zone":"商業地域","far":600,"score":81,"roi":6.9,"rent":25000,"area":850,"vacancy":3.5,"floors":10,"units":80,"cost":3200,"landPrice":820},
    {"id":"P004","name":"海岸1-2","lat":35.65470,"lng":139.75750,"polygon":[[35.65500,139.75720],[35.65500,139.75780],[35.65440,139.75780],[35.65440,139.75720]],"zone":"準工業地域","far":500,"score":74,"roi":6.1,"rent":22000,"area":1500,"vacancy":4.2,"floors":8,"units":64,"cost":3600,"landPrice":650},
    {"id":"P005","name":"芝大門2-1","lat":35.65600,"lng":139.75520,"polygon":[[35.65615,139.75505],[35.65615,139.75535],[35.65585,139.75535],[35.65585,139.75505]],"zone":"商業地域","far":600,"score":71,"roi":5.8,"rent":21000,"area":400,"vacancy":4.8,"floors":9,"units":54,"cost":2700,"landPrice":780},
    {"id":"P006","name":"浜松町1-8","lat":35.65530,"lng":139.75740,"polygon":[[35.65545,139.75720],[35.65545,139.75760],[35.65515,139.75760],[35.65515,139.75720]],"zone":"商業地域","far":700,"score":67,"roi":5.5,"rent":20000,"area":480,"vacancy":5.1,"floors":10,"units":70,"cost":2800,"landPrice":750},
    {"id":"P007","name":"芝公園3-4","lat":35.65650,"lng":139.75640,"polygon":[[35.65665,139.75620],[35.65665,139.75660],[35.65635,139.75660],[35.65635,139.75620]],"zone":"第二種住居地域","far":400,"score":62,"roi":5.2,"rent":19000,"area":480,"vacancy":5.5,"floors":7,"units":42,"cost":2100,"landPrice":700},
    {"id":"P008","name":"海岸2-5","lat":35.65440,"lng":139.75690,"polygon":[[35.65460,139.75670],[35.65460,139.75710],[35.65420,139.75710],[35.65420,139.75670]],"zone":"準工業地域","far":400,"score":53,"roi":4.5,"rent":16000,"area":500,"vacancy":6.8,"floors":6,"units":48,"cost":3000,"landPrice":520},
    {"id":"P009","name":"芝1-7","lat":35.65670,"lng":139.75550,"polygon":[[35.65685,139.75535],[35.65685,139.75565],[35.65655,139.75565],[35.65655,139.75535]],"zone":"第一種住居地域","far":300,"score":48,"roi":4.1,"rent":15000,"area":350,"vacancy":7.2,"floors":5,"units":30,"cost":1500,"landPrice":620},
    {"id":"P010","name":"大門1-3","lat":35.65580,"lng":139.75700,"polygon":[[35.65595,139.75685],[35.65595,139.75715],[35.65565,139.75715],[35.65565,139.75685]],"zone":"商業地域","far":500,"score":44,"roi":3.8,"rent":14500,"area":320,"vacancy":7.8,"floors":7,"units":35,"cost":1800,"landPrice":690},
    {"id":"P011","name":"海岸3-1","lat":35.65420,"lng":139.75780,"polygon":[[35.65440,139.75760],[35.65440,139.75800],[35.65400,139.75800],[35.65400,139.75760]],"zone":"準工業地域","far":300,"score":35,"roi":3.2,"rent":12000,"area":500,"vacancy":9.5,"floors":4,"units":24,"cost":2200,"landPrice":380},
    {"id":"P012","name":"芝5-2","lat":35.65690,"lng":139.75500,"polygon":[[35.65705,139.75485],[35.65705,139.75515],[35.65675,139.75515],[35.65675,139.75485]],"zone":"第一種住居地域","far":200,"score":28,"roi":2.5,"rent":11000,"area":280,"vacancy":11.0,"floors":3,"units":12,"cost":800,"landPrice":450}
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

// ===== Task 15: Mode descriptions =====
const modeDescriptions = {
  score: '法規制・交通利便性・周辺賃料・開発余地・ハザードリスクの5要素を統合した総合評価指標です。スコアが高いほど開発ポテンシャルが高い土地を示します。',
  roi: '想定賃料収入と開発コストから算出した投資利回りです。周辺相場・空室率予測・建築費概算に基づく推計値で、値が高いほど収益性の高い土地を示します。'
};

function goToImpactFromRanking() {
  const targetId = selectedParcelId || [...parcelsData].sort((a, b) => b.score - a.score)[0]?.id;
  if (targetId) showImpactPanel(targetId);
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
    <div style="padding:8px 12px;">
      <button class="impact-top-btn" onclick="goToImpactFromRanking()" id="impact-top-btn">開発インパクト推計</button>
    </div>
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
    <div class="mode-desc">${modeDescriptions[displayMode]}</div>
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
        <button class="impact-btn" onclick="startAcquisitionLoading('${p.id}')" style="width:100%;text-align:center;">用地取得を検討 →</button>
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
  const scale = Math.max(0.5, Math.min(1.5, floorArea / 20000)) * 0.8; // Task 16: 20% smaller
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
    <div class="bim-section">
      <div class="bim-visual">${bimBlocks}</div>
      <div class="bim-info-block">
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
      <div class="impact-section-scenario">
        <button class="impact-back-btn" onclick="showDetailPanel('${p.id}')" style="margin-bottom:12px;margin-top:0">← 戻る</button>
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
      </div>
      ${getBimHTML(facilityType, floorArea)}
      <div class="impact-section-results">
        <h4>距離帯別 賃料変化率</h4>
        <div class="impact-row"><span class="ir-label">200m圏</span><span class="ir-value positive">+${base200.toFixed(1)}%</span></div>
        <div class="impact-row"><span class="ir-label">500m圏</span><span class="ir-value positive">+${base500.toFixed(1)}%</span></div>
        <div class="impact-row"><span class="ir-label">1km圏</span><span class="ir-value positive">+${base1000.toFixed(1)}%</span></div>
        <h4 style="margin-top:16px">その他推計</h4>
        <div class="impact-row"><span class="ir-label">来訪者増加</span><span class="ir-value positive">+${visitors.toLocaleString()} 人/日</span></div>
        <div class="impact-row"><span class="ir-label">空室率変化</span><span class="ir-value positive">${vacancyChange.toFixed(1)}%</span></div>
        <div class="impact-row"><span class="ir-label">Cap Rate変化</span><span class="ir-value positive">${capRateChange.toFixed(2)}%</span></div>
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
      </div>
      <div class="impact-section-action">
        <button class="acq-proceed-btn" onclick="startAcquisitionLoading('${p.id}')">用地取得プロセスへ進む →</button>
        <p style="font-size:12px;color:#888;margin-top:8px;text-align:center">地権者情報の確認とターゲットリスト生成に進みます</p>
      </div>
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
          <button class="acq-btn primary" onclick="downloadTargetCSV()">ターゲットリストをCSV出力</button>
          <button class="acq-btn" onclick="showToast('評価書生成機能は製品版で提供予定です')">評価書一括生成</button>
        </div>
      </div>

      <button class="acq-back-btn" onclick="showDetailPanel('${p.id}')">← 詳細に戻る</button>
    </div>
  `;
}

// ===== Task 17: Acquisition Loading Animation =====
const loadingSteps = [
  { text: '土地の権利情報を確認中...', sub: '登記所備え付け地図データベースを照合' },
  { text: '登記簿情報を取得中...', sub: '法務局登記情報システムにアクセス' },
  { text: '不動産売買情報を確認中...', sub: 'REINS・公示価格データベースを検索' },
  { text: '地権者情報を分析中...', sub: 'AIによる売却意向推定モデルを実行' },
  { text: 'ターゲットリストを生成中...', sub: '優先順位付けアルゴリズムを適用' }
];

function startAcquisitionLoading(parcelId) {
  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="loading-acq">
      <div class="loading-progress-bar"><div class="loading-progress-fill" id="loading-fill"></div></div>
      <div class="loading-steps" id="loading-steps">
        ${loadingSteps.map((s, i) => `
          <div class="loading-step" id="lstep-${i}">
            <div class="loading-step-icon"><div class="mini-spinner" id="licon-${i}"></div></div>
            <div class="loading-step-content">
              <div class="loading-step-text">${s.text}</div>
              <div class="loading-step-sub">${s.sub}</div>
            </div>
            <div class="loading-step-img" id="limg-${i}"><span>参照中...</span></div>
          </div>
        `).join('')}
      </div>
      <div class="loading-complete" id="loading-complete" style="display:none">
        <div style="font-size:16px;font-weight:600;color:#2d8a4e;text-align:center">分析完了</div>
      </div>
    </div>
  `;

  // Try loading images
  loadingSteps.forEach((_, i) => {
    const imgEl = document.getElementById('limg-' + i);
    const img = new Image();
    img.onload = function() {
      imgEl.innerHTML = '';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '4px';
      imgEl.appendChild(img);
    };
    img.src = `data/loading-${i + 1}.png`;
  });

  let step = 0;
  const fill = document.getElementById('loading-fill');

  function advanceStep() {
    if (step > 0) {
      const prev = document.getElementById('lstep-' + (step - 1));
      const prevIcon = document.getElementById('licon-' + (step - 1));
      prev.classList.add('done');
      prevIcon.classList.remove('mini-spinner');
      prevIcon.textContent = '✓';
      prevIcon.classList.add('check-icon');
    }
    if (step < loadingSteps.length) {
      const cur = document.getElementById('lstep-' + step);
      cur.classList.add('active');
      fill.style.width = ((step + 1) / loadingSteps.length * 100) + '%';
      step++;
      setTimeout(advanceStep, 1500);
    } else {
      // All done
      setTimeout(() => {
        document.getElementById('loading-complete').style.display = 'block';
        setTimeout(() => showAcquisitionPanel(parcelId), 1000);
      }, 500);
    }
  }
  advanceStep();
}

// ===== Task 18: CSV Download =====
function downloadTargetCSV() {
  const targets = parcelsData
    .filter(p => p.score >= 60)
    .sort((a, b) => b.score - a.score);

  const bom = '\uFEFF';
  const header = '優先順位,所在地,魅力度スコア,ランク,想定ROI(%),想定賃料(円/m²),空室率予測(%),用途地域,容積率(%),敷地面積(m²),地権者,地権者種別,保有期間,推定売却意向,推奨アプローチ';
  const rows = targets.map((p, i) => {
    const grade = getGrade(p.score);
    const oi = getOwnerInfo(p.id);
    const owner = oi.owners[0];
    return [
      i + 1, p.name, p.score, grade, p.roi, p.rent, p.vacancy, p.zone, p.far, p.area,
      owner.name, owner.type, owner.years + '年', owner.intent,
      getApproach(oi.ownerCount, owner.intent)
    ].join(',');
  });

  const csv = bom + header + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date();
  const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
  a.href = url;
  a.download = `target_list_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSVファイルをダウンロードしました');
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  // Login
  document.getElementById('btn-login').addEventListener('click', handleLogin);
  document.getElementById('login-id').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('login-pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  // Demo start
  document.getElementById('btn-start').addEventListener('click', startDemo);
});
