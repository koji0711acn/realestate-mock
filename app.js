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
let originalParcelsData = null;
let currentAreaLabel = null;

// Task 40: Alternative area data
const alternativeAreas = [
  {
    areaId: 'alt1', areaName: '芝大門二丁目北エリア', center: [35.6620, 139.7545],
    parcels: [
      {"id":"A001","name":"芝大門2-8","lat":35.6618,"lng":139.7540,"polygon":[[35.6616,139.7537],[35.6616,139.7543],[35.6620,139.7543],[35.6620,139.7537]],"zone":"商業地域","far":700,"score":88,"noiYield":4.5,"irr":11.0,"rent":6800,"area":600,"vacancy":3.5,"floors":10,"units":48,"cost":2058,"landPrice":650,"grossMargin":20,"dscr":1.5,"capRate":3.8,"buildableArea":3906,"rentableRatio":74,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"A002","name":"芝大門2-11","lat":35.6622,"lng":139.7548,"polygon":[[35.6620,139.7545],[35.6620,139.7551],[35.6624,139.7551],[35.6624,139.7545]],"zone":"商業地域","far":600,"score":75,"noiYield":3.8,"irr":10.2,"rent":6500,"area":450,"vacancy":4.0,"floors":8,"units":32,"cost":1580,"landPrice":600,"grossMargin":18,"dscr":1.4,"capRate":3.6,"buildableArea":2520,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"A003","name":"芝大門2-14","lat":35.6615,"lng":139.7550,"polygon":[[35.6613,139.7547],[35.6613,139.7553],[35.6617,139.7553],[35.6617,139.7547]],"zone":"商業地域","far":600,"score":78,"noiYield":4.0,"irr":10.5,"rent":6600,"area":520,"vacancy":3.8,"floors":9,"units":38,"cost":1744,"landPrice":620,"grossMargin":19,"dscr":1.45,"capRate":3.7,"buildableArea":2902,"rentableRatio":73,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"A004","name":"芝大門2-16","lat":35.6625,"lng":139.7542,"polygon":[[35.6623,139.7539],[35.6623,139.7545],[35.6627,139.7545],[35.6627,139.7539]],"zone":"近隣商業地域","far":400,"score":68,"noiYield":3.6,"irr":9.0,"rent":6200,"area":380,"vacancy":4.5,"floors":6,"units":22,"cost":888,"landPrice":580,"grossMargin":17,"dscr":1.35,"capRate":4.0,"buildableArea":1413,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"A005","name":"芝大門2-19","lat":35.6618,"lng":139.7555,"polygon":[[35.6616,139.7552],[35.6616,139.7558],[35.6620,139.7558],[35.6620,139.7552]],"zone":"商業地域","far":600,"score":72,"noiYield":3.7,"irr":9.5,"rent":6400,"area":400,"vacancy":4.2,"floors":8,"units":28,"cost":1368,"landPrice":610,"grossMargin":18,"dscr":1.38,"capRate":3.9,"buildableArea":2232,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"A006","name":"芝大門2-22","lat":35.6623,"lng":139.7538,"polygon":[[35.6621,139.7535],[35.6621,139.7541],[35.6625,139.7541],[35.6625,139.7535]],"zone":"商業地域","far":700,"score":65,"noiYield":3.5,"irr":8.8,"rent":6100,"area":350,"vacancy":5.0,"floors":9,"units":25,"cost":1200,"landPrice":590,"grossMargin":17,"dscr":1.3,"capRate":4.1,"buildableArea":2282,"rentableRatio":71,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}}
    ]
  },
  {
    areaId: 'alt2', areaName: '芝大門二丁目南エリア', center: [35.6570, 139.7555],
    parcels: [
      {"id":"B001","name":"芝大門2-31","lat":35.6572,"lng":139.7552,"polygon":[[35.6570,139.7549],[35.6570,139.7555],[35.6574,139.7555],[35.6574,139.7549]],"zone":"商業地域","far":700,"score":85,"noiYield":4.3,"irr":11.5,"rent":7000,"area":550,"vacancy":3.2,"floors":10,"units":42,"cost":1890,"landPrice":680,"grossMargin":21,"dscr":1.55,"capRate":3.5,"buildableArea":3581,"rentableRatio":75,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B002","name":"芝大門2-33","lat":35.6568,"lng":139.7558,"polygon":[[35.6566,139.7555],[35.6566,139.7561],[35.6570,139.7561],[35.6570,139.7555]],"zone":"商業地域","far":600,"score":79,"noiYield":4.0,"irr":10.8,"rent":6700,"area":480,"vacancy":3.8,"floors":8,"units":34,"cost":1640,"landPrice":640,"grossMargin":19,"dscr":1.45,"capRate":3.7,"buildableArea":2678,"rentableRatio":73,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B003","name":"芝大門2-35","lat":35.6574,"lng":139.7548,"polygon":[[35.6572,139.7545],[35.6572,139.7551],[35.6576,139.7551],[35.6576,139.7545]],"zone":"商業地域","far":600,"score":73,"noiYield":3.8,"irr":9.8,"rent":6400,"area":420,"vacancy":4.2,"floors":7,"units":28,"cost":1410,"landPrice":610,"grossMargin":18,"dscr":1.38,"capRate":3.9,"buildableArea":2344,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B004","name":"芝大門2-37","lat":35.6566,"lng":139.7550,"polygon":[[35.6564,139.7547],[35.6564,139.7553],[35.6568,139.7553],[35.6568,139.7547]],"zone":"近隣商業地域","far":400,"score":68,"noiYield":3.6,"irr":9.0,"rent":6100,"area":380,"vacancy":4.8,"floors":5,"units":20,"cost":850,"landPrice":580,"grossMargin":17,"dscr":1.32,"capRate":4.0,"buildableArea":1413,"rentableRatio":71,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B005","name":"芝大門2-39","lat":35.6571,"lng":139.7560,"polygon":[[35.6569,139.7557],[35.6569,139.7563],[35.6573,139.7563],[35.6573,139.7557]],"zone":"商業地域","far":600,"score":64,"noiYield":3.5,"irr":8.5,"rent":5900,"area":350,"vacancy":5.2,"floors":7,"units":22,"cost":1180,"landPrice":560,"grossMargin":16,"dscr":1.28,"capRate":4.2,"buildableArea":1953,"rentableRatio":71,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B006","name":"芝大門2-41","lat":35.6575,"lng":139.7555,"polygon":[[35.6573,139.7552],[35.6573,139.7558],[35.6577,139.7558],[35.6577,139.7552]],"zone":"商業地域","far":600,"score":60,"noiYield":3.3,"irr":8.0,"rent":5800,"area":300,"vacancy":5.5,"floors":6,"units":18,"cost":1010,"landPrice":540,"grossMargin":15,"dscr":1.25,"capRate":4.3,"buildableArea":1674,"rentableRatio":70,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}}
    ]
  }
];

// Data bounds (Task 30: Shibadaimon 1-chome NW, away from tracks)
const DATA_BOUNDS = L.latLngBounds([35.6588, 139.7538], [35.6605, 139.7558]);

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

// ===== Task 32: Image Slideshow =====
const slideImages = ['data/slide-1.png', 'data/slide-2.png', 'data/slide-3.png'];
const slideTexts = [
  'エリアを指定するだけで、全筆の開発ポテンシャルを瞬時にランキング',
  '施設建設が周辺の賃料・不動産価値に与える影響を定量シミュレーション',
  '地権者分析からアタックリスト生成まで、一気通貫で支援'
];
let slideIndex = 0;

function startGifSlideshow() {
  const display = document.getElementById('gif-display');
  const textEl = document.getElementById('gif-text');

  function showSlide(idx) {
    // Fade out
    display.style.opacity = '0';
    textEl.classList.remove('fade-in');
    textEl.classList.add('fade-out');

    setTimeout(() => {
      // Try loading image
      const img = new Image();
      img.onload = function() {
        display.innerHTML = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        display.appendChild(img);
      };
      img.onerror = function() {
        const fallbacks = [
          { bg: 'linear-gradient(135deg, #e8f0fe 0%, #c5d9f7 100%)', num: '01', title: 'エリア一括評価' },
          { bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', num: '02', title: 'インパクト推計' },
          { bg: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', num: '03', title: 'ターゲット候補選定' }
        ];
        const fb = fallbacks[idx];
        display.innerHTML = `<div class="slide-fallback" style="background:${fb.bg}"><div class="slide-number">${fb.num}</div><div class="slide-title">${fb.title}</div></div>`;
      };
      img.src = slideImages[idx];

      textEl.textContent = slideTexts[idx];
      // Fade in
      display.style.opacity = '1';
      textEl.classList.remove('fade-out');
      textEl.classList.add('fade-in');
    }, 500);
  }

  showSlide(0);
  gifInterval = setInterval(() => {
    slideIndex = (slideIndex + 1) % slideImages.length;
    showSlide(slideIndex);
  }, 3000);
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
  map = L.map('map', { zoomControl: true }).setView([35.6596, 139.7548], 16);

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
  // Task 21: Stage 1 - highlight the draw button
  // Add shake animation to draw button
  const drawBtn = document.querySelector('.leaflet-draw-draw-rectangle');
  if (drawBtn) drawBtn.classList.add('shake-btn');

  showGuideOverlay(
    'まず左上の選択ツールをクリックしてください',
    'OK'
  );
}

function showGuideStep2() {
  guideStep = 2;
  hideGuide();
  // Task 21: Stop shake, Stage 2 - show pulse on target area
  const drawBtn = document.querySelector('.leaflet-draw-draw-rectangle');
  if (drawBtn) drawBtn.classList.remove('shake-btn');

  // Show pulse circle at data area center
  const center = DATA_BOUNDS.getCenter();
  pulseCircle = L.circle(center, {
    radius: 150,
    color: '#1565c0',
    weight: 3,
    fill: false,
    className: 'pulse-circle'
  }).addTo(map);

  // Show data area hint
  dataAreaRect = L.rectangle(DATA_BOUNDS, {
    color: '#1565c0', weight: 2, dashArray: '6 4',
    fillColor: '#1565c0', fillOpacity: 0.05, interactive: false
  }).addTo(map);

  showGuideOverlay(
    '青い円の中にあるエリアにズームインし、点線の範囲を囲んでください',
    null
  );
  setTimeout(() => { if (guideStep === 2) hideGuide(); }, 3000);
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
    const intersects = DATA_BOUNDS.intersects(bounds);
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
  // Inline fallback matches parcels.json - fetch preferred
  return [];
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
      tooltip.setContent(displayMode === 'score' ? String(p.score) : p.noiYield + '%');
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
  roi: 'NOI（営業純利益）を総投資額で割った利回り。周辺相場・空室率予測・建築費概算に基づく推計値で、値が高いほど収益性の高い土地を示します。'
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
    displayMode === 'score' ? b.score - a.score : b.noiYield - a.noiYield
  );
  const avgScore = (parcelsData.reduce((s, p) => s + p.score, 0) / parcelsData.length).toFixed(1);
  const maxYield = Math.max(...parcelsData.map(p => p.noiYield)).toFixed(1);
  const aCount = parcelsData.filter(p => p.score >= 80).length;

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="panel-header">
      <h3>筆評価ランキング</h3>
      ${currentAreaLabel ? `<div style="margin-top:6px"><span style="background:#185FA5;color:#fff;font-size:11px;padding:3px 10px;border-radius:4px;font-weight:600">${currentAreaLabel}（AI推奨）</span></div>` : ''}
    </div>
    ${currentAreaLabel ? '<div style="padding:8px 12px"><button class="back-btn" onclick="returnToOriginalArea()" style="width:100%;text-align:center">← 元のエリアに戻る</button></div>' : ''}
    <div style="padding:8px 12px;">
      <button class="impact-top-btn" onclick="goToImpactFromRanking()" id="impact-top-btn">開発インパクト推計</button>
    </div>
    <div class="summary-bar">
      <div class="summary-item"><div class="label">候補筆数</div><div class="value">${parcelsData.length}</div></div>
      <div class="summary-item"><div class="label">平均スコア</div><div class="value">${avgScore}</div></div>
      <div class="summary-item"><div class="label">最高利回り</div><div class="value">${maxYield}%</div></div>
      <div class="summary-item"><div class="label">Aランク</div><div class="value">${aCount}件</div></div>
    </div>
    <div class="toggle-bar">
      <button class="toggle-btn ${displayMode === 'score' ? 'active' : ''}" onclick="setDisplayMode('score')">スコア表示</button>
      <button class="toggle-btn ${displayMode === 'roi' ? 'active' : ''}" onclick="setDisplayMode('roi')">利回り表示</button>
    </div>
    <div class="mode-desc">${modeDescriptions[displayMode]}</div>
    <div class="ranking-list">
      ${sorted.map((p, i) => {
        const grade = getGrade(p.score);
        const valueText = displayMode === 'score' ? p.score : p.noiYield + '%';
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
  'NOI利回り': 'NOI（営業純利益）を総投資額で割った利回り。周辺相場と空室率予測に基づく推計値',
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

// ===== Screen 3: Detail Panel (Task 39: 4-tab layout) =====
let detailOverlay = null;
function removeDetailOverlay() {
  if (detailOverlay) { detailOverlay.remove(); detailOverlay = null; }
}

function switchDetailTab(tab, parcelId) {
  document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.dtab[data-tab="${tab}"]`).classList.add('active');
  removeDetailOverlay();
  const p = parcelsData.find(d => d.id === parcelId);
  if (!p) return;

  // Show tab content
  document.querySelectorAll('.dtab-content').forEach(c => c.style.display = 'none');
  const el = document.getElementById('dtab-' + tab);
  if (el) el.style.display = 'block';

  // Overlay tabs
  if (tab === 'volume') showVolumeOverlay(p);
  if (tab === 'finance') showFinanceOverlay(p);
  if (tab === 'risk') showRiskOverlay(p);

  // Expand panel for tabs 2-4
  const sidePanel = document.getElementById('side-panel');
  const mapEl = document.getElementById('map');
  if (tab === 'overview') {
    sidePanel.style.width = '500px';
    mapEl.style.right = '500px';
  } else {
    sidePanel.style.width = '500px';
    mapEl.style.right = '500px';
  }
  map.invalidateSize();
}

function showDetailPanel(id) {
  currentScreen = 3;
  selectedParcelId = id;
  clearImpactOverlay();
  removeDetailOverlay();
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;
  const grade = getGrade(p.score);

  // Expand side panel
  document.getElementById('side-panel').style.width = '500px';
  document.getElementById('map').style.right = '500px';
  map.panTo([p.lat, p.lng]);
  setTimeout(() => map.invalidateSize(), 50);
  updateParcelStyles();

  const tsuboRent = Math.round(p.rent * 3.30579 / 1000 * 10) / 10;
  const riskColors = { '低': '#2d8a4e', '中': '#c4840a', 'なし': '#2d8a4e', '適合': '#2d8a4e', '問題なし': '#2d8a4e', '要調査': '#c0392b', '包蔵地隣接': '#c4840a' };

  // Finance calculations
  const landCost = Math.round(p.landPrice * p.area / 100); // 百万円
  const designFee = Math.round(p.cost * 0.08);
  const expenses = Math.round(p.cost * 0.05);
  const contingency = Math.round(p.cost * 0.10);
  const totalInvest = landCost + p.cost + designFee + expenses + contingency;
  const annualRent = Math.round(p.rent * (p.buildableArea || p.area * p.far / 100 * 0.93) * (p.rentableRatio || 73) / 100 * 12 / 1000000);
  const commonFee = Math.round(annualRent * 0.1);
  const opex = Math.round(annualRent * 0.2);
  const noi = annualRent + commonFee - opex;
  const loanAmount = Math.round(totalInvest * 0.7);
  const annualDebt = Math.round(loanAmount * 0.02 / (1 - Math.pow(1.02, -30)) * 10) / 10;
  const preTaxCF = Math.round((noi - annualDebt) * 10) / 10;

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="detail-panel" style="display:flex;flex-direction:column;height:100%">
      <div class="detail-actions">
        <button class="back-btn" onclick="closeDetailPanel()">← 一覧に戻る</button>
      </div>
      <div class="detail-header">
        <h3>${p.name}</h3>
        <div class="rank-badge grade-${grade}" style="font-size:14px;padding:4px 14px;">${grade}</div>
      </div>
      <div class="dtab-bar">
        <button class="dtab active" data-tab="overview" onclick="switchDetailTab('overview','${p.id}')">概要</button>
        <button class="dtab" data-tab="volume" onclick="switchDetailTab('volume','${p.id}')">ボリューム</button>
        <button class="dtab" data-tab="finance" onclick="switchDetailTab('finance','${p.id}')">事業収支</button>
        <button class="dtab" data-tab="risk" onclick="switchDetailTab('risk','${p.id}')">リスク</button>
      </div>
      <div style="flex:1;overflow-y:auto">
        <!-- Tab 1: Overview -->
        <div id="dtab-overview" class="dtab-content">
          <div class="detail-grid-6">
            <div class="metric-card"><div class="metric-label">NOI利回り</div><div class="metric-value">${p.noiYield}<span class="metric-unit">%</span></div></div>
            <div class="metric-card"><div class="metric-label">想定賃料</div><div class="metric-value">${tsuboRent}<span class="metric-unit">千円/坪月</span></div></div>
            <div class="metric-card"><div class="metric-label">空室率予測</div><div class="metric-value">${p.vacancy}<span class="metric-unit">%</span></div></div>
            <div class="metric-card"><div class="metric-label">概算建築費</div><div class="metric-value">${p.cost}<span class="metric-unit">百万円</span></div></div>
            <div class="metric-card"><div class="metric-label">Cap Rate</div><div class="metric-value">${p.capRate}<span class="metric-unit">%</span></div></div>
            <div class="metric-card"><div class="metric-label">想定IRR</div><div class="metric-value">${p.irr}<span class="metric-unit">%</span></div></div>
          </div>
          <div style="margin-top:12px">
            <div class="detail-row"><div class="detail-row-header"><span class="dr-label">魅力度スコア</span><span class="dr-value">${p.score}</span></div></div>
            <div class="detail-row"><div class="detail-row-header"><span class="dr-label">用途地域</span><span class="dr-value">${p.zone}</span></div></div>
            <div class="detail-row"><div class="detail-row-header"><span class="dr-label">容積率</span><span class="dr-value">${p.far}%</span></div></div>
            <div class="detail-row"><div class="detail-row-header"><span class="dr-label">敷地面積</span><span class="dr-value">${p.area.toLocaleString()} m²</span></div></div>
            <div class="detail-row"><div class="detail-row-header"><span class="dr-label">想定階数</span><span class="dr-value">${p.floors}階</span></div></div>
            <div class="detail-row"><div class="detail-row-header"><span class="dr-label">想定戸数</span><span class="dr-value">${p.units}戸</span></div></div>
            <div class="detail-row"><div class="detail-row-header"><span class="dr-label">土地単価</span><span class="dr-value">${p.landPrice}万円/m²</span></div></div>
          </div>
        </div>
        <!-- Tab 2: Volume (overlay triggered) -->
        <div id="dtab-volume" class="dtab-content" style="display:none"><p style="padding:16px;color:#888;font-size:13px">地図上にボリュームチェックを表示中</p></div>
        <!-- Tab 3: Finance (overlay triggered) -->
        <div id="dtab-finance" class="dtab-content" style="display:none"><p style="padding:16px;color:#888;font-size:13px">地図上に事業収支を表示中</p></div>
        <!-- Tab 4: Risk (overlay triggered) -->
        <div id="dtab-risk" class="dtab-content" style="display:none"><p style="padding:16px;color:#888;font-size:13px">地図上にリスク評価を表示中</p></div>
      </div>
      <div class="detail-fixed-footer">
        <div style="display:flex;gap:6px">
          <button class="impact-btn" onclick="showImpactPanel('${p.id}')" style="flex:1;text-align:center;font-size:12px">インパクト推計</button>
          <button class="impact-btn" onclick="startAcquisitionLoading('${p.id}')" style="flex:1;text-align:center;font-size:12px">ターゲット選定</button>
          <button class="back-btn" onclick="downloadEvalReport('${p.id}')" style="flex:1;text-align:center;font-size:12px">評価書</button>
        </div>
      </div>
    </div>
  `;
}

function closeDetailPanel() {
  removeDetailOverlay();
  document.getElementById('side-panel').style.width = '350px';
  document.getElementById('map').style.right = '350px';
  setTimeout(() => map.invalidateSize(), 50);
  showRankingPanel();
}

// Volume overlay
function showVolumeOverlay(p) {
  removeDetailOverlay();
  const ba = p.buildableArea || Math.round(p.area * p.far / 100 * 0.93);
  const bldgArea = Math.round(p.area * 0.6);
  const bldgH = p.floors * 3.5;
  const volRate = Math.round(ba / p.area * 100);
  const rentableArea = Math.round(ba * (p.rentableRatio || 73) / 100);
  const commFloors = Math.min(2, p.floors);
  const resFloors = p.floors - commFloors;

  const el = document.createElement('div');
  el.className = 'map-overlay-panel';
  el.innerHTML = `
    <div class="overlay-inner">
      <div style="display:flex;gap:24px">
        <div style="flex:0 0 200px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:300px;position:relative">
          <div style="position:absolute;top:10px;right:0;border-left:2px dashed #c4840a;height:${Math.min(280, p.floors*18)}px;transform:rotate(-15deg);transform-origin:bottom right;opacity:0.5"></div>
          <div style="font-size:10px;color:#888;position:absolute;top:0;right:5px">斜線制限</div>
          ${Array.from({length: p.floors}, (_, i) => {
            const isComm = i < commFloors;
            const color = isComm ? '#a5d6a7' : '#90caf9';
            const label = isComm ? '商業' : '住居';
            return `<div style="width:${Math.min(160, bldgArea/4)}px;height:16px;background:${color};border:1px solid rgba(0,0,0,0.1);font-size:9px;text-align:center;line-height:16px;color:#555">${p.floors-i}F ${label}</div>`;
          }).reverse().join('')}
          <div style="width:180px;height:3px;background:#666;margin-top:2px"></div>
          <div style="font-size:10px;color:#888;margin-top:4px">GL</div>
        </div>
        <div style="flex:1;font-size:13px">
          <table class="detail-table">
            <tr><td>敷地面積</td><td>${p.area.toLocaleString()} m²</td></tr>
            <tr><td>建築面積</td><td>${bldgArea.toLocaleString()} m²</td></tr>
            <tr><td>延床面積</td><td>${ba.toLocaleString()} m²</td></tr>
            <tr><td>容積消化率</td><td><div style="background:#eee;border-radius:4px;height:14px;width:100%"><div style="background:#185FA5;height:14px;border-radius:4px;width:${Math.min(100,volRate)}%;font-size:10px;color:#fff;text-align:center;line-height:14px">${volRate}%</div></div></td></tr>
            <tr><td>階数</td><td>${p.floors}階</td></tr>
            <tr><td>建物高さ</td><td>約${bldgH.toFixed(0)}m</td></tr>
            <tr><td>レンタブル比</td><td><div style="background:#eee;border-radius:4px;height:14px;width:100%"><div style="background:#2d8a4e;height:14px;border-radius:4px;width:${p.rentableRatio||73}%;font-size:10px;color:#fff;text-align:center;line-height:14px">${p.rentableRatio||73}%</div></div></td></tr>
            <tr><td>想定住戸数</td><td>${p.units}戸</td></tr>
          </table>
          <p style="font-size:10px;color:#999;margin-top:12px">※斜線制限・天空率は概算反映。詳細は設計事務所による検証が必要です</p>
        </div>
      </div>
    </div>
  `;
  document.getElementById('screen-map').appendChild(el);
  detailOverlay = el;
}

// Finance overlay
function showFinanceOverlay(p) {
  removeDetailOverlay();
  const ba = p.buildableArea || Math.round(p.area * p.far / 100 * 0.93);
  const rr = (p.rentableRatio || 73) / 100;
  const landCost = Math.round(p.landPrice * p.area / 100);
  const designFee = Math.round(p.cost * 0.08);
  const expenses = Math.round(p.cost * 0.05);
  const contingency = Math.round(p.cost * 0.10);
  const totalInvest = landCost + p.cost + designFee + expenses + contingency;
  const annualRent = Math.round(p.rent * ba * rr * 12 / 1000000);
  const commonFee = Math.round(annualRent * 0.1);
  const opex = Math.round(annualRent * 0.2);
  const noi = annualRent + commonFee - opex;
  const loanAmt = Math.round(totalInvest * 0.7);
  const annualDebt = Math.round(loanAmt * 0.02 / (1 - Math.pow(1.02, -30)));
  const preTaxCF = noi - annualDebt;
  const dscrVal = annualDebt > 0 ? (noi / annualDebt).toFixed(2) : 'N/A';
  const dscrColor = parseFloat(dscrVal) >= 1.3 ? '#2d8a4e' : '#c0392b';

  // CF projection
  const cfData = [];
  let cumCF = -totalInvest;
  for (let y = 1; y <= 10; y++) {
    cumCF += preTaxCF;
    cfData.push(cumCF);
  }
  const breakEvenYear = cfData.findIndex(v => v >= 0) + 1;

  const el = document.createElement('div');
  el.className = 'map-overlay-panel';
  el.innerHTML = `
    <div class="overlay-inner">
      <div class="detail-grid-4" style="margin-bottom:16px">
        <div class="metric-card"><div class="metric-label">NOI利回り</div><div class="metric-value">${p.noiYield}%</div></div>
        <div class="metric-card"><div class="metric-label">想定IRR</div><div class="metric-value">${p.irr}%</div></div>
        <div class="metric-card"><div class="metric-label">粗利率</div><div class="metric-value">${p.grossMargin}%</div></div>
        <div class="metric-card"><div class="metric-label">DSCR</div><div class="metric-value" style="color:${dscrColor}">${dscrVal}</div></div>
      </div>
      <div style="display:flex;gap:20px">
        <div style="flex:1;font-size:12px">
          <h4 style="font-size:13px;color:#888;margin-bottom:8px">初期投資</h4>
          <table class="detail-table">
            <tr><td>土地取得費</td><td>${landCost.toLocaleString()}百万円</td></tr>
            <tr><td>建築工事費</td><td>${p.cost.toLocaleString()}百万円</td></tr>
            <tr><td>設計・監理費</td><td>${designFee}百万円</td></tr>
            <tr><td>諸経費</td><td>${expenses}百万円</td></tr>
            <tr><td>予備費</td><td>${contingency}百万円</td></tr>
            <tr style="font-weight:700;border-top:2px solid #333"><td>合計</td><td>${totalInvest.toLocaleString()}百万円</td></tr>
          </table>
          <h4 style="font-size:13px;color:#888;margin:12px 0 8px">年間収支（安定稼働時）</h4>
          <table class="detail-table">
            <tr><td>賃料収入</td><td>${annualRent}百万円</td></tr>
            <tr><td>共益費収入</td><td>${commonFee}百万円</td></tr>
            <tr><td>運営費</td><td>-${opex}百万円</td></tr>
            <tr style="font-weight:700"><td>NOI</td><td>${noi}百万円</td></tr>
            <tr><td>借入金返済</td><td>-${annualDebt}百万円</td></tr>
            <tr style="font-weight:700;border-top:2px solid #333"><td>税前CF</td><td>${preTaxCF}百万円</td></tr>
          </table>
        </div>
        <div style="flex:1">
          <h4 style="font-size:13px;color:#888;margin-bottom:8px">累積CF推移</h4>
          <canvas id="cf-chart" width="280" height="200"></canvas>
          ${breakEvenYear > 0 ? `<p style="font-size:11px;color:#2d8a4e;margin-top:4px;text-align:center">投資回収: ${breakEvenYear}年目</p>` : '<p style="font-size:11px;color:#c0392b;margin-top:4px;text-align:center">10年以内の回収困難</p>'}
        </div>
      </div>
    </div>
  `;
  document.getElementById('screen-map').appendChild(el);
  detailOverlay = el;

  // Render chart
  setTimeout(() => {
    const ctx = document.getElementById('cf-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({length:10}, (_,i) => `${i+1}年`),
          datasets: [{
            data: cfData,
            backgroundColor: cfData.map(v => v >= 0 ? 'rgba(45,138,78,0.7)' : 'rgba(192,57,43,0.5)'),
            borderRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { callback: v => v.toLocaleString() + '百万' }, grid: { color: '#f0f0f0' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }, 100);
}

// Risk overlay
function showRiskOverlay(p) {
  removeDetailOverlay();
  const risks = p.risks || {};
  const items = [
    { key: 'flood', label: '洪水リスク', desc: { '低': '浸水想定区域外', '中': '0.5m未満の浸水想定あり', '高': '1m以上の浸水想定' } },
    { key: 'soil', label: '土壌汚染', desc: { 'なし': '地歴上のリスクなし', '要調査': '過去の土地利用歴から調査推奨' } },
    { key: 'cultural', label: '埋蔵文化財', desc: { 'なし': '包蔵地外', '包蔵地隣接': '隣接地が包蔵地。試掘調査の可能性あり' } },
    { key: 'liquefaction', label: '液状化', desc: { '低': '液状化の可能性が低い地域' } },
    { key: 'road', label: '接道条件', desc: { '適合': '幅員6m以上、建基法42条1項適合' } },
    { key: 'adjacentUse', label: '隣接施設', desc: { '問題なし': '嫌悪施設等の立地なし' } }
  ];
  const colorMap = { '低': '#2d8a4e', 'なし': '#2d8a4e', '適合': '#2d8a4e', '問題なし': '#2d8a4e', '中': '#c4840a', '包蔵地隣接': '#c4840a', '要調査': '#c0392b', '高': '#c0392b' };
  const soilCost = risks.soil === '要調査' ? Math.round(5 * p.area * 3) : 0; // 5万/m³ × 想定3m深

  const el = document.createElement('div');
  el.className = 'map-overlay-panel';
  el.innerHTML = `
    <div class="overlay-inner">
      <h4 style="font-size:15px;font-weight:600;margin-bottom:16px">リスク評価 — ${p.name}</h4>
      ${items.map(item => {
        const val = risks[item.key] || 'なし';
        const color = colorMap[val] || '#888';
        const desc = item.desc[val] || val;
        return `<div class="risk-item" onclick="this.classList.toggle('expanded')">
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;cursor:pointer">
            <div style="width:12px;height:12px;border-radius:50%;background:${color};flex-shrink:0"></div>
            <span style="font-size:13px;font-weight:600;flex:1">${item.label}</span>
            <span style="font-size:12px;color:${color};font-weight:600">${val}</span>
            <span class="dr-arrow" style="font-size:10px;color:#bbb">▼</span>
          </div>
          <div class="risk-detail"><div style="padding:4px 0 8px 22px;font-size:12px;color:#666">${desc}</div></div>
        </div>`;
      }).join('')}
      ${soilCost > 0 ? `<div style="margin-top:16px;padding:12px;background:#fce4ec;border-radius:8px;font-size:12px;color:#c0392b"><strong>リスク概算コスト:</strong> 土壌汚染対策 約${(soilCost/100).toFixed(0)}百万円（5万円/m³ × 想定${p.area*3}m³）</div>` : ''}
    </div>
  `;
  document.getElementById('screen-map').appendChild(el);
  detailOverlay = el;
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

  // Task 31: Use polygon centroid for circles
  const parcelLayer = parcelLayers[p.id];
  const centerLatLng = parcelLayer ? parcelLayer.getBounds().getCenter() : L.latLng(p.lat, p.lng);

  // Highlight selected parcel polygon
  if (parcelLayer) {
    parcelLayer.setStyle({ weight: 4, color: '#185FA5', fillOpacity: 0.7 });
  }

  // Task 33: Resize original drawn rect to represent dev area
  if (drawnRect) {
    const devSize = Math.sqrt(floorArea) * 0.00001;
    const newBounds = L.latLngBounds(
      [centerLatLng.lat - devSize/2, centerLatLng.lng - devSize/2],
      [centerLatLng.lat + devSize/2, centerLatLng.lng + devSize/2]
    );
    drawnRect.setBounds(newBounds);
    drawnRect.setStyle({ color: '#185FA5', weight: 3, fillColor: '#185FA5', fillOpacity: 0.15 });
    drawnRect.unbindTooltip();
    drawnRect.bindTooltip(`開発予定地 ${floorArea.toLocaleString()}m²`, { permanent: true, direction: 'center', className: '' });
  }

  const colors = ['rgba(21,101,192,0.25)', 'rgba(21,101,192,0.15)', 'rgba(21,101,192,0.08)'];
  const radii = [200, 500, 1000];
  radii.forEach((r, i) => {
    const circle = L.circle(centerLatLng, {
      radius: r, color: '#1565c0', weight: 1,
      fillColor: colors[i], fillOpacity: 1, dashArray: '4 4'
    }).addTo(map);
    circle.bindTooltip(`${r}m圏`, { permanent: true, direction: 'center', className: '' });
    impactCircles.push(circle);
  });

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="impact-panel-scroll">
      <div class="impact-section-scenario">
        <button class="impact-back-btn" onclick="showDetailPanel('${p.id}')" style="margin-bottom:12px;margin-top:0">← 戻る</button>
        <h3 style="font-size:15px;font-weight:700;margin-bottom:16px">開発インパクト推計</h3>
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
    </div>
    <div class="impact-fixed-footer">
      <button class="acq-proceed-btn" onclick="startAcquisitionLoading('${p.id}')">ターゲット候補の選定へ →</button>
      <p style="font-size:12px;color:#888;margin-top:8px;text-align:center">地権者情報の確認とターゲットリスト生成に進みます</p>
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
      <h3>ターゲット候補選定 — ${p.name}</h3>

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
            <tr><th>#</th><th>所在地</th><th>スコア</th><th>NOI利回り</th><th>地権者</th><th>意向</th><th>推奨</th></tr>
          </thead>
          <tbody>
            ${targets.map(t => `
              <tr>
                <td>${t.rank}</td>
                <td>${t.parcel.name}</td>
                <td>${t.parcel.score}</td>
                <td>${t.parcel.noiYield}%</td>
                <td>${t.owner.name.slice(0, 6)}…</td>
                <td><span class="intent-badge ${intentClass(t.owner.intent)}">${t.owner.intent}</span></td>
                <td style="font-size:10px">${getApproach(t.ownerCount, t.owner.intent)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="acq-btn-group">
          <button class="acq-btn primary" onclick="downloadTargetCSV()">ターゲットリストをCSV出力</button>
          <button class="acq-btn" onclick="downloadBatchEvalReports()">評価書一括生成</button>
        </div>
      </div>

      <div id="alt-recommend" style="display:none;margin-top:20px">
        <h4 style="font-size:16px;font-weight:600;color:#1a1a2e;margin-bottom:12px">AI推奨: 近隣の開発ポテンシャルが高いエリア</h4>
        <div class="alt-card" style="border-left-color:#2d8a4e">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:14px">芝大門二丁目北エリア</strong>
            <span style="background:#e8f5e9;color:#2d8a4e;font-size:11px;padding:3px 8px;border-radius:4px;font-weight:600">合筆による大規模開発が可能</span>
          </div>
          <p style="font-size:12px;color:#666;margin-bottom:8px">推奨理由: 土壌汚染リスクなし・単独所有率が多く権利整理が容易・接道条件良好</p>
          <div style="font-size:13px;margin-bottom:8px"><span style="color:#888">推定スコア:</span> <strong>82</strong> / <span style="color:#888">推定NOI利回り:</span> <strong>8.2%</strong></div>
          <button class="acq-btn primary" onclick="exploreAlternativeArea('alt1')">このエリアを調査</button>
        </div>
        <div class="alt-card" style="border-left-color:#185FA5">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:14px">芝大門二丁目南エリア</strong>
            <span style="background:#e3f2fd;color:#185FA5;font-size:11px;padding:3px 8px;border-radius:4px;font-weight:600">用地取得の難易度が低い</span>
          </div>
          <p style="font-size:12px;color:#666;margin-bottom:8px">推奨理由: 土壌汚染リスクなし・単独所有率が多く権利整理が容易・接道条件良好</p>
          <div style="font-size:13px;margin-bottom:8px"><span style="color:#888">推定スコア:</span> <strong>82</strong> / <span style="color:#888">推定NOI利回り:</span> <strong>7.5%</strong></div>
          <button class="acq-btn primary" onclick="exploreAlternativeArea('alt2')">このエリアを調査</button>
        </div>
      </div>

      <button class="acq-back-btn" onclick="showDetailPanel('${p.id}')">← 詳細に戻る</button>
    </div>
  `;

  // Task 35: delayed AI recommendation
  setTimeout(() => {
    const altEl = document.getElementById('alt-recommend');
    if (altEl) {
      altEl.style.display = 'block';
      altEl.style.opacity = '0';
      altEl.style.transition = 'opacity 0.5s';
      setTimeout(() => { altEl.style.opacity = '1'; }, 50);
    }
  }, 3000);
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

  // Task 23: Load images with error fallback
  const loadingImages = ['data/loading-1.png','data/loading-2.png','data/loading-3.png','data/loading-4.png','data/loading-5.png'];
  loadingImages.forEach((src, i) => {
    const imgEl = document.getElementById('limg-' + i);
    const img = new Image();
    img.onload = function() {
      imgEl.innerHTML = '';
      img.style.width = '200px';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
      imgEl.appendChild(img);
    };
    img.onerror = function() {
      imgEl.innerHTML = '<span>参照中...</span>';
    };
    img.src = src;
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
  const header = '優先順位,所在地,魅力度スコア,ランク,NOI利回り(%),想定賃料(円/m²),空室率予測(%),用途地域,容積率(%),敷地面積(m²),地権者,地権者種別,保有期間,推定売却意向,推奨アプローチ';
  const rows = targets.map((p, i) => {
    const grade = getGrade(p.score);
    const oi = getOwnerInfo(p.id);
    const owner = oi.owners[0];
    return [
      i + 1, p.name, p.score, grade, p.noiYield, p.rent, p.vacancy, p.zone, p.far, p.area,
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

// ===== Task 40: Explore alternative area =====
function exploreAlternativeArea(areaId) {
  const area = alternativeAreas.find(a => a.areaId === areaId);
  if (!area) return;

  // Save original data
  if (!originalParcelsData) {
    originalParcelsData = [...parcelsData];
  }

  // Switch to new parcels
  parcelsData = area.parcels;
  currentAreaLabel = area.areaName;

  // Clear existing and fly to new area
  Object.values(parcelLayers).forEach(l => map.removeLayer(l));
  Object.values(parcelTooltips).forEach(t => map.removeLayer(t));
  parcelLayers = {};
  parcelTooltips = {};

  map.flyTo(area.center, 17, { duration: 1.5 });

  setTimeout(() => {
    drawParcels();
    showRankingPanel();
    currentScreen = 2;
  }, 1600);
}

function returnToOriginalArea() {
  if (!originalParcelsData) return;
  parcelsData = originalParcelsData;
  originalParcelsData = null;
  currentAreaLabel = null;

  Object.values(parcelLayers).forEach(l => map.removeLayer(l));
  Object.values(parcelTooltips).forEach(t => map.removeLayer(t));
  parcelLayers = {};
  parcelTooltips = {};

  const center = DATA_BOUNDS.getCenter();
  map.flyTo(center, 16, { duration: 1.5 });

  setTimeout(() => {
    drawParcels();
    showRankingPanel();
    currentScreen = 2;
  }, 1600);
}

// ===== Task 24: Evaluation Report Generation =====
function getDateStr() {
  const d = new Date();
  return d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
}

function generateReportHTML(p) {
  const grade = getGrade(p.score);
  const now = new Date().toLocaleString('ja-JP');
  const scores = [
    { name: '法規制適合性', val: Math.round(p.score * 0.22) },
    { name: '交通利便性', val: Math.round(p.score * 0.25) },
    { name: '周辺賃料水準', val: Math.round(p.score * 0.20) },
    { name: '開発余地', val: Math.round(p.score * 0.18) },
    { name: 'ハザードリスク', val: Math.round(p.score * 0.15) }
  ];
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>用地評価書 - ${p.name}</title>
<style>body{font-family:'Noto Sans JP',sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#333}
h1{font-size:22px;border-bottom:2px solid #185FA5;padding-bottom:12px;color:#185FA5}
h2{font-size:16px;color:#185FA5;margin-top:24px;margin-bottom:12px}
.meta{font-size:13px;color:#888;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #eee;font-size:14px}
th{background:#f7f8fa;color:#888;font-weight:600;width:40%}
td{font-weight:500}
.badge{display:inline-block;padding:3px 12px;border-radius:12px;font-weight:700;font-size:13px}
.badge-A{background:#E8F5E9;color:#2d8a4e}.badge-B{background:#E0F2F1;color:#1a7a6d}
.badge-C{background:#FFF8E1;color:#c4840a}.badge-D{background:#FCE4EC;color:#c0392b}
.bar-wrap{background:#eee;border-radius:4px;height:16px;margin-top:4px}
.bar{background:#185FA5;height:16px;border-radius:4px}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999;line-height:1.6}
</style></head><body>
<h1>用地評価書（簡易版）</h1>
<div class="meta">生成日時: ${now} | 対象地: ${p.name}</div>
<h2>物件概要</h2>
<table><tr><th>所在地</th><td>${p.name}</td></tr>
<tr><th>用途地域</th><td>${p.zone}</td></tr>
<tr><th>容積率</th><td>${p.far}%</td></tr>
<tr><th>敷地面積</th><td>${p.area.toLocaleString()} m²</td></tr></table>
<h2>事業性評価</h2>
<table><tr><th>魅力度スコア</th><td>${p.score} <span class="badge badge-${grade}">${grade}</span></td></tr>
<tr><th>NOI利回り</th><td>${p.noiYield}%</td></tr>
<tr><th>想定賃料</th><td>${p.rent.toLocaleString()} 円/m²</td></tr>
<tr><th>空室率予測</th><td>${p.vacancy}%</td></tr>
<tr><th>想定階数</th><td>${p.floors}階</td></tr>
<tr><th>想定戸数</th><td>${p.units}戸</td></tr>
<tr><th>概算建築費</th><td>${p.cost}百万円</td></tr></table>
<h2>スコアリング根拠</h2>
<table>${scores.map(s => `<tr><th>${s.name}</th><td><div class="bar-wrap"><div class="bar" style="width:${s.val}%"></div></div>${s.val}/100</td></tr>`).join('')}</table>
<div class="footer">本評価書はReal World AIによる自動生成です。投資判断にあたっては追加のデューデリジェンスを推奨します。</div>
</body></html>`;
}

function downloadEvalReport(parcelId) {
  const p = parcelsData.find(d => d.id === parcelId);
  if (!p) return;
  const html = generateReportHTML(p);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evaluation_report_${p.name}_${getDateStr()}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('評価書をダウンロードしました');
}

function downloadBatchEvalReports() {
  const targets = parcelsData.filter(p => p.score >= 60).sort((a, b) => b.score - a.score);
  const pages = targets.map(p => generateReportHTML(p)
    .replace('<!DOCTYPE html><html lang="ja"><head>', '')
    .replace('</head><body>', '')
    .replace('</body></html>', '<hr style="margin:60px 0;border:2px solid #185FA5">')
  );
  const combined = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>用地評価書一括</title></head><body>
${pages.join('\n')}
</body></html>`;
  const blob = new Blob([combined], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evaluation_reports_batch_${getDateStr()}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`${targets.length}件の評価書を一括ダウンロードしました`);
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
