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

// ===== Screen 0 -> Screen 1 =====
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

  // Leaflet.draw - rectangle only
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

  // Listen for draw start
  map.on('draw:drawstart', function () {
    advanceGuide(2);
  });

  map.on(L.Draw.Event.CREATED, function (e) {
    if (drawnRect) drawnItems.removeLayer(drawnRect);
    drawnRect = e.layer;
    drawnItems.addLayer(drawnRect);
    clearGuideUI();
    onAreaSelected();
  });

  // Task 50: Panel resize handle
  initPanelResize();

  // Show guide step 1
  setTimeout(() => advanceGuide(1), 600);
}

// ===== Task 50: Panel Resize Handle =====
function initPanelResize() {
  const handle = document.getElementById('panel-resize-handle');
  const panel = document.getElementById('side-panel');
  const mapEl = document.getElementById('map');
  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  function updateHandlePosition() {
    const w = panel.offsetWidth;
    handle.style.right = w + 'px';
  }

  // Position handle initially and on panel width changes
  const observer = new MutationObserver(() => updateHandlePosition());
  observer.observe(panel, { attributes: true, attributeFilter: ['style'] });
  setTimeout(updateHandlePosition, 100);

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startWidth = panel.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    const newWidth = Math.min(700, Math.max(350, startWidth + diff));
    panel.style.width = newWidth + 'px';
    mapEl.style.right = newWidth + 'px';
    updateHandlePosition();
    if (map) map.invalidateSize();
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    if (map) map.invalidateSize();
  });
}

// ===== Task 51: 14-step Guide System =====
let guideSkipped = false;

function clearGuideUI() {
  if (guideOverlay) { guideOverlay.remove(); guideOverlay = null; }
  if (pulseCircle) { map.removeLayer(pulseCircle); pulseCircle = null; }
  if (dataAreaRect) { map.removeLayer(dataAreaRect); dataAreaRect = null; }
  document.querySelectorAll('.shake-btn').forEach(el => el.classList.remove('shake-btn'));
  document.querySelectorAll('.guide-shake').forEach(el => el.classList.remove('guide-shake'));
  document.querySelectorAll('.guide-pulse').forEach(el => el.classList.remove('guide-pulse'));
}

function skipGuide() {
  guideSkipped = true;
  clearGuideUI();
}

function showGuideBubble(msg, targetEl, position) {
  clearGuideUI();
  if (guideSkipped) return;
  const bubble = document.createElement('div');
  bubble.className = 'guide-bubble-box';
  if (position === 'right') bubble.classList.add('arrow-left');
  else if (position === 'below') bubble.classList.add('arrow-top');
  else if (position === 'above') bubble.classList.add('arrow-bottom');
  bubble.innerHTML = `<p style="margin:0 0 4px">${msg}</p><a class="guide-skip" onclick="skipGuide()">ガイドをスキップ</a>`;

  if (targetEl && position !== 'center') {
    const rect = targetEl.getBoundingClientRect();
    const mapRect = document.getElementById('screen-map').getBoundingClientRect();
    if (position === 'right') {
      bubble.style.left = (rect.right - mapRect.left + 12) + 'px';
      bubble.style.top = (rect.top - mapRect.top) + 'px';
    } else if (position === 'below') {
      bubble.style.left = (rect.left - mapRect.left) + 'px';
      bubble.style.top = (rect.bottom - mapRect.top + 8) + 'px';
    } else {
      bubble.style.left = (rect.left - mapRect.left) + 'px';
      bubble.style.top = (rect.top - mapRect.top - 60) + 'px';
    }
  } else {
    bubble.style.top = '80px';
    bubble.style.left = '80px';
  }
  document.getElementById('screen-map').appendChild(bubble);
  guideOverlay = bubble;
}

function advanceGuide(step) {
  if (guideSkipped) return;
  guideStep = step;

  switch (step) {
    case 1: { // Click draw button
      const drawBtn = document.querySelector('.leaflet-draw-draw-rectangle');
      if (drawBtn) {
        drawBtn.classList.add('shake-btn');
        showGuideBubble('① まず選択ツールをクリックしてください', drawBtn, 'below');
      }
      break;
    }
    case 2: { // Draw area
      clearGuideUI();
      guideStep = 2;
      const center = DATA_BOUNDS.getCenter();
      pulseCircle = L.circle(center, { radius: 150, color: '#1565c0', weight: 3, fill: false, className: 'pulse-circle' }).addTo(map);
      dataAreaRect = L.rectangle(DATA_BOUNDS, { color: '#1565c0', weight: 2, dashArray: '6 4', fillColor: '#1565c0', fillOpacity: 0.05, interactive: false }).addTo(map);
      showGuideBubble('② 点線の範囲をドラッグで囲んでください', null, 'center');
      break;
    }
    case 3: { // Click rank-1 parcel
      clearGuideUI();
      guideStep = 3;
      setTimeout(() => {
        if (guideSkipped) return;
        const firstRow = document.querySelector('.ranking-item');
        if (firstRow) {
          firstRow.classList.add('guide-shake');
          showGuideBubble('③ 最高スコアの筆をクリックして詳細を確認しましょう', firstRow, 'above');
        }
      }, 500);
      break;
    }
    case 4: { // Click scenario button
      clearGuideUI();
      guideStep = 4;
      setTimeout(() => {
        if (guideSkipped) return;
        const btn = document.querySelector('.scenario-proceed-btn');
        if (btn) {
          btn.classList.add('guide-pulse');
          showGuideBubble('④ 開発シナリオを検討して施設タイプ・延床面積を設定します', btn, 'above');
        }
      }, 500);
      break;
    }
    case 5: { // Change facility type dropdown
      clearGuideUI();
      guideStep = 5;
      const sel = document.getElementById('scenario-facility-type');
      if (sel) {
        sel.classList.add('guide-shake');
        showGuideBubble('⑤ 施設タイプを変更してシナリオを調整できます', sel, 'below');
      }
      break;
    }
    case 6: { // Click confirm button
      clearGuideUI();
      guideStep = 6;
      setTimeout(() => {
        if (guideSkipped) return;
        const btn = document.querySelector('.scenario-confirm-btn');
        if (btn) {
          btn.classList.add('guide-pulse');
          showGuideBubble('⑥ シナリオを確定して分析結果を表示します', btn, 'above');
        }
      }, 1000);
      break;
    }
    case 7: { // Volume check tab shown (auto 3s)
      clearGuideUI();
      guideStep = 7;
      showGuideBubble('⑦ ボリュームチェック結果を確認しています...', null, 'center');
      setTimeout(() => {
        if (guideSkipped) return;
        advanceGuide(8);
      }, 3000);
      break;
    }
    case 8: { // Click finance tab
      clearGuideUI();
      guideStep = 8;
      const finTab = document.querySelector('.analysis-tab[data-tab="finance"]');
      if (finTab) {
        finTab.classList.add('guide-pulse');
        showGuideBubble('⑧ 事業収支タブでNOI利回り・IRR・プロフォーマを確認できます', finTab, 'below');
      }
      break;
    }
    case 9: { // Click impact tab
      clearGuideUI();
      guideStep = 9;
      setTimeout(() => {
        if (guideSkipped) return;
        const impTab = document.querySelector('.analysis-tab[data-tab="impact"]');
        if (impTab) {
          impTab.classList.add('guide-pulse');
          showGuideBubble('⑨ インパクト推計タブで周辺への影響を確認できます', impTab, 'below');
        }
      }, 3000);
      break;
    }
    case 10: { // Click target button
      clearGuideUI();
      guideStep = 10;
      setTimeout(() => {
        if (guideSkipped) return;
        const btn = document.querySelector('.analysis-fixed-footer .acq-proceed-btn');
        if (btn) {
          btn.classList.add('guide-pulse');
          showGuideBubble('⑩ ターゲット候補の選定に進みます', btn, 'above');
        }
      }, 3000);
      break;
    }
    case 11: { // Loading (hidden, auto-advance)
      clearGuideUI();
      guideStep = 11;
      break;
    }
    case 12: { // Target list shown (auto 3s)
      clearGuideUI();
      guideStep = 12;
      showGuideBubble('⑫ ターゲットリストが生成されました。CSVエクスポートも可能です', null, 'center');
      setTimeout(() => {
        if (guideSkipped) return;
        advanceGuide(13);
      }, 3000);
      break;
    }
    case 13: { // Click alternative area button
      clearGuideUI();
      guideStep = 13;
      setTimeout(() => {
        if (guideSkipped) return;
        const btn = document.querySelector('.alt-card .alt-explore-btn');
        if (btn) {
          const card = btn.closest('.alt-card');
          if (card) card.classList.add('guide-shake');
          showGuideBubble('⑬ 近隣により有望なエリアが見つかりました。詳細を調査しましょう', btn, 'above');
        }
      }, 1000);
      break;
    }
    case 14: { // Alternative area (auto 5s, end)
      clearGuideUI();
      guideStep = 14;
      setTimeout(() => {
        if (guideSkipped) return;
        showGuideBubble('AI推奨エリアに移動しました。同じように筆の詳細確認・シナリオ分析が可能です', null, 'center');
        setTimeout(() => clearGuideUI(), 5000);
      }, 2000);
      break;
    }
  }
}

// Backward compat aliases
function showGuideStep1() { advanceGuide(1); }
function showGuideStep2() { advanceGuide(2); }
function showGuideStep3() { advanceGuide(3); }
function hideGuide() { clearGuideUI(); }

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
    // Guide step 3
    advanceGuide(3);
  }, 500);
}

// Fallback inline data loader
async function loadInlineData() {
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

  // Task 44: Highlight top-scoring parcel
  const topParcel = [...parcelsData].sort((a, b) => b.score - a.score)[0];
  if (topParcel && parcelLayers[topParcel.id]) {
    const topLayer = parcelLayers[topParcel.id];
    topLayer.setStyle({ weight: 4, dashArray: '8 4' });
    const topCenter = topLayer.getBounds().getCenter();
    const topLabel = L.tooltip({ permanent: true, direction: 'top', className: 'top-score-label', offset: [0, -10] })
      .setLatLng(topCenter).setContent('最高スコア').addTo(map);
    parcelTooltips[topParcel.id + '_top'] = topLabel;
  }
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
  if (targetId) showScenarioPanel(targetId);
}

// ===== Show Ranking Panel (Screen 2) =====
function showRankingPanel() {
  currentScreen = 2;
  selectedParcelId = null;
  clearImpactOverlay();

  // Reset panel width to default
  setPanelWidth(400);

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
        return `<div class="ranking-item ${i === 0 ? 'rank-top' : ''}" id="rank-${p.id}" onclick="onRankClick('${p.id}')" ondblclick="showDetailPanel('${p.id}')">
          ${i === 0 ? '<span class="recommend-badge">推奨</span>' : ''}
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

// ===== Helper: Set panel width =====
function setPanelWidth(w) {
  const panel = document.getElementById('side-panel');
  const mapEl = document.getElementById('map');
  panel.style.width = w + 'px';
  mapEl.style.right = w + 'px';
  setTimeout(() => { if (map) map.invalidateSize(); }, 50);
}

// ===== Screen 3: Simplified Detail Panel (Task 49) =====
function showDetailPanel(id) {
  currentScreen = 3;
  selectedParcelId = id;
  clearImpactOverlay();
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;
  const grade = getGrade(p.score);

  // Keep panel at 400px for detail
  setPanelWidth(400);
  map.panTo([p.lat, p.lng]);
  updateParcelStyles();

  const riskColors = { '低': '#2d8a4e', '中': '#c4840a', 'なし': '#2d8a4e', '適合': '#2d8a4e', '問題なし': '#2d8a4e', '要調査': '#c0392b', '包蔵地隣接': '#c4840a' };
  const risks = p.risks || {};
  const riskItems = [
    { key: 'flood', label: '洪水' },
    { key: 'soil', label: '土壌汚染' },
    { key: 'cultural', label: '埋蔵文化財' },
    { key: 'liquefaction', label: '液状化' },
    { key: 'road', label: '接道' },
    { key: 'adjacentUse', label: '隣接施設' }
  ];

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
      <div style="flex:1;overflow-y:auto;padding:0 16px 16px">
        <!-- Overview metrics -->
        <div class="detail-grid-6">
          <div class="metric-card"><div class="metric-label">スコア</div><div class="metric-value">${p.score}</div></div>
          <div class="metric-card"><div class="metric-label">NOI利回り</div><div class="metric-value">${p.noiYield}<span class="metric-unit">%</span></div></div>
          <div class="metric-card"><div class="metric-label">Cap Rate</div><div class="metric-value">${p.capRate}<span class="metric-unit">%</span></div></div>
        </div>
        <!-- Basic info table -->
        <div style="margin-top:8px">
          <div class="detail-row"><div class="detail-row-header"><span class="dr-label">用途地域</span><span class="dr-value">${p.zone}</span></div></div>
          <div class="detail-row"><div class="detail-row-header"><span class="dr-label">容積率</span><span class="dr-value">${p.far}%</span></div></div>
          <div class="detail-row"><div class="detail-row-header"><span class="dr-label">敷地面積</span><span class="dr-value">${p.area.toLocaleString()} m²</span></div></div>
          <div class="detail-row"><div class="detail-row-header"><span class="dr-label">想定階数</span><span class="dr-value">${p.floors}階</span></div></div>
          <div class="detail-row"><div class="detail-row-header"><span class="dr-label">土地単価</span><span class="dr-value">${p.landPrice}万円/m²</span></div></div>
        </div>
        <!-- Risk summary -->
        <h4 style="font-size:13px;color:#888;margin:16px 0 8px;font-weight:600">リスクサマリー</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${riskItems.map(item => {
            const val = risks[item.key] || 'なし';
            const color = riskColors[val] || '#888';
            return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;padding:4px 8px;background:#f7f8fa;border-radius:4px">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
              ${item.label}: ${val}
            </span>`;
          }).join('')}
        </div>
      </div>
      <div class="detail-fixed-footer">
        <button class="scenario-proceed-btn" onclick="showScenarioPanel('${p.id}')" style="width:100%;height:44px;background:#185FA5;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">開発シナリオを検討 →</button>
        <div style="text-align:center;margin-top:8px">
          <a href="javascript:void(0)" onclick="closeDetailPanel()" style="font-size:12px;color:#888;text-decoration:underline">一覧に戻る</a>
          <span style="margin:0 8px;color:#ddd">|</span>
          <a href="javascript:void(0)" onclick="downloadEvalReport('${p.id}')" style="font-size:12px;color:#888;text-decoration:underline">評価書DL</a>
        </div>
      </div>
    </div>
  `;

  // Guide: after detail panel opens, show step 4
  if (guideStep === 3) setTimeout(() => advanceGuide(4), 500);
}

function closeDetailPanel() {
  setPanelWidth(400);
  showRankingPanel();
}

// ===== Screen 4: Scenario Selection Panel (Task 49) =====
function showScenarioPanel(id) {
  currentScreen = 4;
  clearGuideUI();
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;
  const grade = getGrade(p.score);

  setPanelWidth(400);

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div class="scenario-panel">
      <button class="impact-back-btn" onclick="showDetailPanel('${p.id}')" style="margin-bottom:12px;margin-top:0;width:auto;display:inline-block">← 詳細に戻る</button>
      <h3>開発シナリオ選択</h3>
      <div style="background:#f7f8fa;border-radius:8px;padding:12px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <span style="font-size:14px;font-weight:600">${p.name}</span>
          <span class="rank-badge grade-${grade}" style="font-size:11px">${grade}</span>
        </div>
        <div style="font-size:12px;color:#888">${p.zone} / ${p.area.toLocaleString()}m² / 容積率${p.far}%</div>
      </div>
      <div class="scenario-control">
        <label>施設タイプ</label>
        <select id="scenario-facility-type" onchange="onScenarioChange('${p.id}')">
          <option value="large-sc">大型ショッピングセンター</option>
          <option value="office">オフィスビル</option>
          <option value="tower-mansion">タワーマンション</option>
          <option value="complex">複合施設</option>
        </select>
      </div>
      <div class="scenario-control">
        <label>延床面積</label>
        <input type="range" id="scenario-floor-area" min="5000" max="50000" step="1000" value="20000" oninput="onScenarioSliderChange('${p.id}')">
        <div class="scenario-range-val" id="scenario-floor-area-val">20,000 m²</div>
      </div>
      <div id="scenario-bim-preview" style="margin-top:16px"></div>
      <button class="scenario-confirm-btn" onclick="confirmScenario('${p.id}')">シナリオを確定して分析開始 →</button>
    </div>
  `;

  // Render initial BIM preview
  updateScenarioBimPreview(p.id);

  // Guide
  if (guideStep === 4) setTimeout(() => advanceGuide(5), 500);
}

function onScenarioChange(id) {
  updateScenarioBimPreview(id);
  if (guideStep === 5) setTimeout(() => advanceGuide(6), 500);
}

function onScenarioSliderChange(id) {
  const fa = parseInt(document.getElementById('scenario-floor-area').value);
  document.getElementById('scenario-floor-area-val').textContent = fa.toLocaleString() + ' m²';
  updateScenarioBimPreview(id);
}

function updateScenarioBimPreview(id) {
  const ft = document.getElementById('scenario-facility-type').value;
  const fa = parseInt(document.getElementById('scenario-floor-area').value);
  const preview = document.getElementById('scenario-bim-preview');
  if (!preview) return;
  preview.innerHTML = getBimHTML(ft, fa);
  setTimeout(() => renderBim3D(), 100);
}

function confirmScenario(id) {
  const ft = document.getElementById('scenario-facility-type').value;
  const fa = parseInt(document.getElementById('scenario-floor-area').value);
  showAnalysisResults(id, ft, fa);
  if (guideStep === 6) setTimeout(() => advanceGuide(7), 500);
}

// ===== Three.js 3D Building Renderer =====
function create3DBuilding(container, p, w, h) {
  if (typeof THREE === 'undefined') { container.innerHTML = '<p style="color:#888;font-size:12px;text-align:center;padding:20px">3D表示を読み込み中...</p>'; return; }
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f4f8);
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Ground plane
  const groundSize = Math.sqrt(p.area) * 0.08;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(groundSize * 1.5, groundSize * 1.5),
    new THREE.MeshLambertMaterial({ color: 0xcccccc })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);

  // Building dimensions
  const bldgArea = p.area * 0.6;
  const bw = Math.sqrt(bldgArea) * 0.05;
  const bd = bw * 0.8;
  const commFloors = Math.min(2, p.floors);
  const floorH = 0.3;

  // Commercial floors (green)
  if (commFloors > 0) {
    const commH = commFloors * floorH;
    const comm = new THREE.Mesh(
      new THREE.BoxGeometry(bw, commH, bd),
      new THREE.MeshLambertMaterial({ color: 0x44aa66, transparent: true, opacity: 0.7 })
    );
    comm.position.y = commH / 2;
    scene.add(comm);
  }

  // Residential floors (blue)
  const resFloors = p.floors - commFloors;
  if (resFloors > 0) {
    const resH = resFloors * floorH;
    const res = new THREE.Mesh(
      new THREE.BoxGeometry(bw * 0.95, resH, bd * 0.95),
      new THREE.MeshLambertMaterial({ color: 0x4488cc, transparent: true, opacity: 0.6 })
    );
    res.position.y = commFloors * floorH + resH / 2;
    scene.add(res);
  }

  // Floor lines
  for (let i = 1; i <= p.floors; i++) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-bw/2, i * floorH, bd/2),
      new THREE.Vector3(bw/2, i * floorH, bd/2),
      new THREE.Vector3(bw/2, i * floorH, -bd/2),
      new THREE.Vector3(-bw/2, i * floorH, -bd/2),
      new THREE.Vector3(-bw/2, i * floorH, bd/2)
    ]);
    scene.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })));
  }

  // Setback line (diagonal)
  const totalH = p.floors * floorH;
  const setbackGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-bw, 0, bd/2 + 0.3),
    new THREE.Vector3(bw * 0.5, totalH * 1.2, bd/2 + 0.3)
  ]);
  scene.add(new THREE.Line(setbackGeo, new THREE.LineDashedMaterial({ color: 0xff4444, dashSize: 0.2, gapSize: 0.1 })));

  // Camera position
  camera.position.set(bw * 2.5, totalH * 1.2, bd * 3);
  camera.lookAt(0, totalH * 0.4, 0);

  // Simple mouse drag rotation
  let isDragging = false, prevX = 0;
  let angle = 0;
  renderer.domElement.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; });
  renderer.domElement.addEventListener('mousemove', e => {
    if (!isDragging) return;
    angle += (e.clientX - prevX) * 0.01;
    prevX = e.clientX;
    const r = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
    camera.position.x = r * Math.sin(angle);
    camera.position.z = r * Math.cos(angle);
    camera.lookAt(0, totalH * 0.4, 0);
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  renderer.render(scene, camera);
  // Animate
  function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }
  animate();
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
  const floorCount = Math.round(cfg.floors * scale);
  const unitCount = cfg.tenants ? Math.round(floorArea / 200) : Math.round(floorArea / 80);
  const unitLabel = cfg.tenants ? 'テナント数' : '想定戸数';

  // Store for 3D rendering after DOM insertion
  window._bimRenderData = { facilityType, floorArea, floorCount };

  return `
    <div class="bim-section">
      <div id="three-bim" style="width:280px;height:200px;border-radius:8px;overflow:hidden;margin:0 auto"></div>
      <div class="bim-info-block" style="margin-top:12px">
        <div><span class="bim-stat">${cfg.label}</span></div>
        <div>延床面積: <span class="bim-stat">${floorArea.toLocaleString()} m²</span></div>
        <div>階数: <span class="bim-stat">${floorCount}階</span></div>
        <div>${unitLabel}: <span class="bim-stat">${unitCount}</span></div>
      </div>
    </div>`;
}

function renderBim3D() {
  const container = document.getElementById('three-bim');
  if (!container || typeof THREE === 'undefined') return;
  const data = window._bimRenderData;
  if (!data) return;

  const fakeParcel = {
    area: data.floorArea / 3,
    floors: data.floorCount
  };
  create3DBuilding(container, fakeParcel, 280, 200);
}

function toggleImpactCollapse(el) {
  el.closest('.impact-collapse').classList.toggle('open');
}

// ===== Screen 5: Analysis Results (Task 49) =====
// 3 tabs: volume / finance / impact — all in the side panel
function showAnalysisResults(id, facilityType, floorArea) {
  currentScreen = 5;
  clearImpactOverlay();
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;

  // Expand panel to 500px
  setPanelWidth(500);
  map.panTo([p.lat, p.lng]);

  // Render impact circles on map
  renderImpactCirclesOnMap(p, facilityType, floorArea);

  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:12px 16px;border-bottom:1px solid #e0e0e0;background:#fafafa">
        <button class="impact-back-btn" onclick="showScenarioPanel('${p.id}')" style="margin:0 0 8px;width:auto;display:inline-block">← シナリオに戻る</button>
        <h3 style="font-size:15px;font-weight:700;margin:0">${p.name} — 分析結果</h3>
        <div style="font-size:12px;color:#888;margin-top:4px">${facilityConfig[facilityType]?.label || facilityType} / ${floorArea.toLocaleString()}m²</div>
      </div>
      <div class="analysis-tab-bar">
        <button class="analysis-tab active" data-tab="volume" onclick="switchAnalysisTab('volume','${p.id}','${facilityType}',${floorArea})">ボリューム</button>
        <button class="analysis-tab" data-tab="finance" onclick="switchAnalysisTab('finance','${p.id}','${facilityType}',${floorArea})">事業収支</button>
        <button class="analysis-tab" data-tab="impact" onclick="switchAnalysisTab('impact','${p.id}','${facilityType}',${floorArea})">インパクト</button>
      </div>
      <div class="analysis-content" id="analysis-content">
        ${getVolumeTabContent(p, facilityType, floorArea)}
      </div>
      <div class="analysis-fixed-footer">
        <button class="acq-proceed-btn" onclick="startAcquisitionLoading('${p.id}')">ターゲット候補の選定へ →</button>
        <p style="font-size:12px;color:#888;margin-top:6px;text-align:center">地権者情報の確認とターゲットリスト生成に進みます</p>
      </div>
    </div>
  `;

  // Render 3D after DOM is ready
  setTimeout(() => {
    const container = document.getElementById('three-analysis-volume');
    if (container) create3DBuilding(container, p, 350, 250);
  }, 100);
}

function switchAnalysisTab(tab, parcelId, facilityType, floorArea) {
  document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.analysis-tab[data-tab="${tab}"]`).classList.add('active');

  const content = document.getElementById('analysis-content');
  const p = parcelsData.find(d => d.id === parcelId);
  if (!p) return;

  if (tab === 'volume') {
    content.innerHTML = getVolumeTabContent(p, facilityType, floorArea);
    setTimeout(() => {
      const container = document.getElementById('three-analysis-volume');
      if (container) create3DBuilding(container, p, 350, 250);
    }, 100);
  } else if (tab === 'finance') {
    content.innerHTML = getFinanceTabContent(p, facilityType, floorArea);
    setTimeout(() => renderCFChart(p, facilityType, floorArea), 100);
  } else if (tab === 'impact') {
    content.innerHTML = getImpactTabContent(p, facilityType, floorArea);
  }

  // Guide transitions
  if (tab === 'finance' && guideStep === 8) advanceGuide(9);
  if (tab === 'impact' && guideStep === 9) advanceGuide(10);
}

function getVolumeTabContent(p, facilityType, floorArea) {
  const ba = p.buildableArea || Math.round(p.area * p.far / 100 * 0.93);
  const bldgArea = Math.round(p.area * 0.6);
  const bldgH = p.floors * 3.5;
  const volRate = Math.round(ba / p.area * 100);

  return `
    <div id="three-analysis-volume" style="width:100%;height:250px;border-radius:8px;overflow:hidden;margin-bottom:16px;position:relative">
      <div style="position:absolute;top:8px;left:8px;background:rgba(255,255,255,0.85);padding:4px 10px;border-radius:4px;font-size:11px;color:#555;z-index:1">${p.floors}階 / 延床${ba.toLocaleString()}m²</div>
    </div>
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
  `;
}

function getFinanceTabContent(p, facilityType, floorArea) {
  const ba = p.buildableArea || Math.round(p.area * p.far / 100 * 0.93);
  const rr = (p.rentableRatio || 73) / 100;
  const landCost = Math.round(p.landPrice * p.area / 100);
  const designFee = Math.round(p.cost * 0.08);
  const expenses = Math.round(p.cost * 0.05);
  const contingency = Math.round(p.cost * 0.10);
  const totalInvest = landCost + p.cost + designFee + expenses + contingency;
  const grossRent = Math.round(p.rent * ba * rr * 12 / 1000000);
  const annualRent = Math.round(grossRent * (1 - p.vacancy / 100));
  const commonFee = Math.round(annualRent * 0.1);
  const opex = Math.round(annualRent * 0.2);
  const noi = annualRent + commonFee - opex;
  const loanAmt = Math.round(totalInvest * 0.7);
  const annualDebt = Math.round(loanAmt * 0.02 / (1 - Math.pow(1.02, -30)));
  const preTaxCF = noi - annualDebt;
  const dscrVal = annualDebt > 0 ? (noi / annualDebt).toFixed(2) : 'N/A';
  const dscrColor = parseFloat(dscrVal) >= 1.3 ? '#2d8a4e' : '#c0392b';

  return `
    <div class="detail-grid-4" style="margin-bottom:16px">
      <div class="metric-card"><div class="metric-label">NOI利回り</div><div class="metric-value" style="font-size:16px">${p.noiYield}%</div></div>
      <div class="metric-card"><div class="metric-label">想定IRR</div><div class="metric-value" style="font-size:16px">${p.irr}%</div></div>
      <div class="metric-card"><div class="metric-label">粗利率</div><div class="metric-value" style="font-size:16px">${p.grossMargin}%</div></div>
      <div class="metric-card"><div class="metric-label">DSCR</div><div class="metric-value" style="font-size:16px;color:${dscrColor}">${dscrVal}</div></div>
    </div>
    <h4 style="font-size:13px;color:#888;margin-bottom:8px">初期投資</h4>
    <table class="detail-table" style="margin-bottom:12px">
      <tr><td>土地取得費</td><td>${landCost.toLocaleString()}百万円</td></tr>
      <tr><td>建築工事費</td><td>${p.cost.toLocaleString()}百万円</td></tr>
      <tr><td>設計・監理費</td><td>${designFee}百万円</td></tr>
      <tr><td>諸経費</td><td>${expenses}百万円</td></tr>
      <tr><td>予備費</td><td>${contingency}百万円</td></tr>
      <tr style="font-weight:700;border-top:2px solid #333"><td>合計</td><td>${totalInvest.toLocaleString()}百万円</td></tr>
    </table>
    <h4 style="font-size:13px;color:#888;margin:12px 0 8px">年間収支（安定稼働時）</h4>
    <table class="detail-table" style="margin-bottom:12px">
      <tr><td>賃料収入</td><td>${annualRent}百万円</td></tr>
      <tr><td>共益費収入</td><td>${commonFee}百万円</td></tr>
      <tr><td>運営費</td><td>-${opex}百万円</td></tr>
      <tr style="font-weight:700"><td>NOI</td><td>${noi}百万円</td></tr>
      <tr><td>借入金返済</td><td>-${annualDebt}百万円</td></tr>
      <tr style="font-weight:700;border-top:2px solid #333"><td>税前CF</td><td>${preTaxCF}百万円</td></tr>
    </table>
    <h4 style="font-size:13px;color:#888;margin-bottom:8px">累積CF推移</h4>
    <canvas id="cf-chart" width="400" height="220"></canvas>
  `;
}

function renderCFChart(p, facilityType, floorArea) {
  const ba = p.buildableArea || Math.round(p.area * p.far / 100 * 0.93);
  const rr = (p.rentableRatio || 73) / 100;
  const landCost = Math.round(p.landPrice * p.area / 100);
  const designFee = Math.round(p.cost * 0.08);
  const expenses = Math.round(p.cost * 0.05);
  const contingency = Math.round(p.cost * 0.10);
  const totalInvest = landCost + p.cost + designFee + expenses + contingency;
  const grossRent = Math.round(p.rent * ba * rr * 12 / 1000000);
  const annualRent = Math.round(grossRent * (1 - p.vacancy / 100));
  const commonFee = Math.round(annualRent * 0.1);
  const opex = Math.round(annualRent * 0.2);
  const noi = annualRent + commonFee - opex;
  const loanAmt = Math.round(totalInvest * 0.7);
  const annualDebt = Math.round(loanAmt * 0.02 / (1 - Math.pow(1.02, -30)));
  const preTaxCF = noi - annualDebt;

  const cfData = [-totalInvest];
  let cumCF = -totalInvest;
  for (let y = 1; y <= 10; y++) {
    cumCF += preTaxCF;
    cfData.push(Math.round(cumCF));
  }
  const breakEvenYear = cfData.findIndex(v => v >= 0);

  const ctx = document.getElementById('cf-chart');
  if (ctx && typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({length:11}, (_,i) => `${i}年目`),
        datasets: [{
          data: cfData,
          backgroundColor: cfData.map(v => v >= 0 ? 'rgba(45,138,78,0.7)' : 'rgba(192,57,43,0.5)'),
          borderColor: cfData.map((v,i) => i === breakEvenYear && breakEvenYear > 0 ? '#2d8a4e' : 'transparent'),
          borderWidth: cfData.map((v,i) => i === breakEvenYear && breakEvenYear > 0 ? 3 : 0),
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: { callback: v => Math.round(v).toLocaleString() + '百万' },
            grid: { color: '#f0f0f0' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

function getImpactTabContent(p, facilityType, floorArea) {
  const facilityMultiplier = { 'large-sc': 1.0, 'office': 0.7, 'tower-mansion': 0.5, 'complex': 0.85 }[facilityType] || 1.0;
  const areaMultiplier = floorArea / 20000;
  const base200 = 12 * facilityMultiplier * areaMultiplier;
  const base500 = 6 * facilityMultiplier * areaMultiplier;
  const base1000 = 2 * facilityMultiplier * areaMultiplier;
  const visitors = Math.round(5000 * facilityMultiplier * areaMultiplier);
  const vacancyChange = -(2.5 * facilityMultiplier * areaMultiplier);
  const capRateChange = -(0.3 * facilityMultiplier * areaMultiplier);

  return `
    <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">距離帯別 賃料変化率</h4>
    <div class="impact-row"><span class="ir-label">200m圏</span><span class="ir-value positive">+${base200.toFixed(1)}%</span></div>
    <div class="impact-row"><span class="ir-label">500m圏</span><span class="ir-value positive">+${base500.toFixed(1)}%</span></div>
    <div class="impact-row"><span class="ir-label">1km圏</span><span class="ir-value positive">+${base1000.toFixed(1)}%</span></div>
    <h4 style="font-size:14px;font-weight:600;margin:16px 0 12px">その他推計</h4>
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
  `;
}

function renderImpactCirclesOnMap(p, facilityType, floorArea) {
  clearImpactOverlay();

  const parcelLayer = parcelLayers[p.id];
  const centerLatLng = parcelLayer ? parcelLayer.getBounds().getCenter() : L.latLng(p.lat, p.lng);

  // Highlight selected parcel polygon
  if (parcelLayer) {
    parcelLayer.setStyle({ weight: 4, color: '#185FA5', fillOpacity: 0.7 });
  }

  // Resize drawn rect
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
}

function clearImpactOverlay() {
  impactCircles.forEach(c => map.removeLayer(c));
  impactCircles = [];
}

// ===== Task 9: Screen 6 -- Land Acquisition Panel =====
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
  currentScreen = 6;
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

      <div id="alt-recommend" style="display:none">
        <div class="alt-header">
          <span class="alt-star">★</span>
          <span>AI分析結果: より有望な近隣エリアが見つかりました</span>
        </div>
        <div class="alt-card" style="border-left-color:#2d8a4e">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:14px">芝大門二丁目北エリア</strong>
            <span style="background:#e8f5e9;color:#2d8a4e;font-size:11px;padding:3px 8px;border-radius:4px;font-weight:600">合筆による大規模開発が可能</span>
          </div>
          <p style="font-size:12px;color:#666;margin-bottom:8px">推奨理由: 土壌汚染リスクなし・単独所有率が多く権利整理が容易・接道条件良好</p>
          <div style="font-size:13px;margin-bottom:10px"><span style="color:#888">推定スコア:</span> <strong>82</strong> / <span style="color:#888">推定NOI利回り:</span> <strong>8.2%</strong></div>
          <button class="alt-explore-btn" onclick="exploreAlternativeArea('alt1')">このエリアを調査</button>
        </div>
        <div class="alt-card" style="border-left-color:#185FA5">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:14px">芝大門二丁目南エリア</strong>
            <span style="background:#e3f2fd;color:#185FA5;font-size:11px;padding:3px 8px;border-radius:4px;font-weight:600">用地取得の難易度が低い</span>
          </div>
          <p style="font-size:12px;color:#666;margin-bottom:8px">推奨理由: 土壌汚染リスクなし・単独所有率が多く権利整理が容易・接道条件良好</p>
          <div style="font-size:13px;margin-bottom:10px"><span style="color:#888">推定スコア:</span> <strong>82</strong> / <span style="color:#888">推定NOI利回り:</span> <strong>7.5%</strong></div>
          <button class="alt-explore-btn" onclick="exploreAlternativeArea('alt2')">このエリアを調査</button>
        </div>
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

      <button class="acq-back-btn" onclick="showDetailPanel('${p.id}')">← 詳細に戻る</button>
    </div>
  `;

  // Delayed AI recommendation + guide
  setTimeout(() => {
    const altEl = document.getElementById('alt-recommend');
    if (altEl) {
      altEl.style.display = 'block';
      altEl.style.opacity = '0';
      altEl.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        altEl.style.opacity = '1';
        if (guideStep === 12) advanceGuide(13);
      }, 50);
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
  clearGuideUI();
  advanceGuide(11);
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
      prevIcon.textContent = '\u2713';
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
        setTimeout(() => {
          showAcquisitionPanel(parcelId);
          if (guideStep === 11) advanceGuide(12);
        }, 1000);
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

  clearGuideUI();
  setTimeout(() => {
    drawParcels();
    showRankingPanel();
    currentScreen = 2;
    if (guideStep === 13) advanceGuide(14);
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
