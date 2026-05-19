// V4: 大和ハウス向け 業界横断社会資本可視化プラットフォーム
// Built on V3 codebase. Major adaptations in progress:
// - parcelsData → projectsData (案件一覧)
// - developmentPlans → optimizationPlans (最適化プラン)
// - alternativeAreas → vendorRecommendations (業者レコメンド)
// Hardcoded data structures will be updated in subsequent batches.

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
var _guideUpdating = false;
var _panelUpdating = false;
var _lastGuideBubbleTime = 0;

function getParcelCenter(p) {
  var lats = p.polygon.map(function(c){ return c[0]; });
  var lngs = p.polygon.map(function(c){ return c[1]; });
  return [lats.reduce(function(a,b){return a+b},0)/lats.length, lngs.reduce(function(a,b){return a+b},0)/lngs.length];
}

// Task 40: Alternative area data
const alternativeAreas = [
  {
    areaId: 'alt1',
    areaName: '新橋四丁目エリア',
    center: [35.6605, 139.7558],
    parcels: [
      {"id":"A01","name":"新橋4-2","lat":35.6607,"lng":139.7558,"polygon":[[35.660713,139.755777],[35.6606,139.75568],[35.66053,139.755841],[35.660548,139.755868],[35.6605,139.755986],[35.660565,139.756042],[35.6607,139.755793]],"zone":"商業地域","far":700,"score":80,"noiYield":4.0,"irr":10.5,"rent":6600,"area":420,"vacancy":4.0,"floors":10,"units":32,"cost":1370,"landPrice":680,"grossMargin":19,"dscr":1.45,"capRate":3.8,"buildableArea":2730,"rentableRatio":73,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"A02","name":"新橋4-4","lat":35.6604,"lng":139.7557,"polygon":[[35.6606,139.755645],[35.660356,139.755431],[35.660267,139.755565],[35.660291,139.755581],[35.660258,139.75564],[35.660362,139.755742],[35.660299,139.755862],[35.660461,139.755996],[35.660528,139.755878],[35.660504,139.755852],[35.6606,139.755645]],"zone":"商業地域","far":700,"score":75,"noiYield":3.8,"irr":9.8,"rent":6400,"area":520,"vacancy":4.5,"floors":9,"units":36,"cost":1580,"landPrice":650,"grossMargin":18,"dscr":1.4,"capRate":4.0,"buildableArea":3390,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"A03","name":"新橋4-6","lat":35.6603,"lng":139.7558,"polygon":[[35.660343,139.755752],[35.660266,139.755677],[35.660268,139.75581],[35.660299,139.755836],[35.660349,139.755751]],"zone":"商業地域","far":600,"score":68,"noiYield":3.6,"irr":9.0,"rent":6200,"area":280,"vacancy":5.0,"floors":8,"units":20,"cost":780,"landPrice":620,"grossMargin":17,"dscr":1.35,"capRate":4.1,"buildableArea":1560,"rentableRatio":71,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}}
    ]
  },
  {
    areaId: 'alt2',
    areaName: '芝公園三丁目エリア',
    center: [35.6617, 139.7522],
    parcels: [
      {"id":"B01","name":"芝公園3-2","lat":35.6619,"lng":139.7522,"polygon":[[35.661991,139.75215],[35.661888,139.752094],[35.661823,139.752295],[35.661847,139.752308],[35.661777,139.752496],[35.661875,139.752539],[35.661995,139.752153]],"zone":"商業地域","far":700,"score":84,"noiYield":4.5,"irr":11.0,"rent":7200,"area":450,"vacancy":3.5,"floors":11,"units":38,"cost":1460,"landPrice":720,"grossMargin":20,"dscr":1.5,"capRate":3.6,"buildableArea":2930,"rentableRatio":74,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B02","name":"芝公園3-4","lat":35.6618,"lng":139.7521,"polygon":[[35.661879,139.752075],[35.661683,139.751979],[35.661613,139.752201],[35.661807,139.752308],[35.661875,139.752078]],"zone":"商業地域","far":700,"score":78,"noiYield":4.3,"irr":10.2,"rent":6900,"area":380,"vacancy":4.0,"floors":10,"units":30,"cost":1240,"landPrice":680,"grossMargin":19,"dscr":1.45,"capRate":3.8,"buildableArea":2480,"rentableRatio":73,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B03","name":"芝公園3-6","lat":35.6617,"lng":139.7524,"polygon":[[35.661803,139.752359],[35.661725,139.752325],[35.661694,139.752443],[35.661768,139.752477],[35.661807,139.752365]],"zone":"商業地域","far":600,"score":72,"noiYield":3.7,"irr":9.5,"rent":6300,"area":280,"vacancy":4.5,"floors":9,"units":22,"cost":780,"landPrice":650,"grossMargin":18,"dscr":1.4,"capRate":3.9,"buildableArea":1560,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B04","name":"芝公園3-8","lat":35.6616,"lng":139.7523,"polygon":[[35.661705,139.752284],[35.661585,139.752228],[35.661537,139.752389],[35.661672,139.752445],[35.661729,139.752292]],"zone":"商業地域","far":600,"score":70,"noiYield":4.0,"irr":9.2,"rent":6600,"area":320,"vacancy":4.5,"floors":8,"units":24,"cost":890,"landPrice":640,"grossMargin":17,"dscr":1.38,"capRate":4.0,"buildableArea":1790,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B05","name":"芝公園3-10","lat":35.6614,"lng":139.7520,"polygon":[[35.66165,139.751981],[35.661546,139.75193],[35.661485,139.752054],[35.661241,139.751941],[35.661162,139.75219],[35.661522,139.752351],[35.661659,139.751979]],"zone":"商業地域","far":700,"score":76,"noiYield":4.2,"irr":10.0,"rent":6800,"area":580,"vacancy":4.0,"floors":10,"units":42,"cost":1890,"landPrice":660,"grossMargin":18,"dscr":1.42,"capRate":3.9,"buildableArea":3780,"rentableRatio":73,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B06","name":"芝公園3-12","lat":35.6614,"lng":139.7519,"polygon":[[35.661522,139.751901],[35.661302,139.751804],[35.661252,139.751922],[35.661485,139.752038],[35.661515,139.751917]],"zone":"商業地域","far":600,"score":65,"noiYield":3.5,"irr":8.8,"rent":6100,"area":300,"vacancy":5.0,"floors":8,"units":20,"cost":840,"landPrice":620,"grossMargin":17,"dscr":1.35,"capRate":4.1,"buildableArea":1670,"rentableRatio":71,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}}
    ]
  }
];

const developmentPlans = [
  { id: 'planA', name: 'Plan A: 単独開発', parcels: ['P01'], siteArea: 500, floorArea: 3720, floors: 17, badge: '1筆', description: '整形地。単独地権者との交渉のみで取得可能', recommended: false },
  { id: 'planB', name: 'Plan B: 隣接2筆', parcels: ['P01', 'P02'], siteArea: 780, floorArea: 5810, floors: 18, badge: '2筆', description: '北側隣接筆との合筆。接道条件が改善し、容積率の消化効率が向上', recommended: false },
  { id: 'planC', name: 'Plan C: L字型3筆', parcels: ['P01', 'P02', 'P03'], siteArea: 1160, floorArea: 8630, floors: 20, badge: '3筆', description: 'L字型の敷地形状。大門通り沿いのファサードを確保できる配置', recommended: false },
  { id: 'planD', name: 'Plan D: 中規模4筆', parcels: ['P01', 'P02', 'P03', 'P04'], siteArea: 1580, floorArea: 11750, floors: 22, badge: '4筆', description: '敷地規模と取得難易度のバランスが最も良い構成。2方向接道により設計自由度が高い', recommended: true },
  { id: 'planE', name: 'Plan E: 大規模街区', parcels: ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07'], siteArea: 2420, floorArea: 18020, floors: 28, badge: '7筆', description: '街区北側の大半を取得。地権者数が多く交渉に時間を要する可能性。区道の廃道手続きを含む', recommended: false }
];

// Data bounds
const DATA_BOUNDS = L.latLngBounds([35.655950, 139.752840], [35.656940, 139.753740]);

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
    document.getElementById('screen0').style.display = 'block';
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
const preloadedImages = [];

function startGifSlideshow() {
  var display = document.getElementById('gif-display');
  var textEl = document.getElementById('gif-text');
  if (!display || !textEl) return; // V4: landing has no slideshow

  var loadedCount = 0;
  slideImages.forEach(function(src, i) {
    var img = new Image();
    img.onload = function() {
      preloadedImages[i] = img;
      loadedCount++;
      if (loadedCount === 1) showFirstSlide();
    };
    img.onerror = function() {
      preloadedImages[i] = null;
      loadedCount++;
      if (loadedCount === 1) showFirstSlide();
    };
    img.src = src;
  });

  function showFirstSlide() {
    displaySlide(0, false);
    gifInterval = setInterval(function() {
      slideIndex = (slideIndex + 1) % slideImages.length;
      displaySlide(slideIndex, true);
    }, 6000);
  }

  function displaySlide(idx, animate) {
    if (animate) {
      display.style.transition = 'opacity 0.5s ease';
      textEl.style.transition = 'opacity 0.5s ease';
      display.style.opacity = '0';
      textEl.style.opacity = '0';
      setTimeout(function() {
        renderSlide(idx);
        textEl.textContent = slideTexts[idx];
        display.style.opacity = '1';
        textEl.style.opacity = '1';
      }, 500);
    } else {
      display.style.opacity = '1';
      textEl.style.opacity = '1';
      renderSlide(idx);
      textEl.textContent = slideTexts[idx];
    }
  }

  function renderSlide(idx) {
    var cached = preloadedImages[idx];
    if (cached) {
      display.innerHTML = '';
      var imgEl = cached.cloneNode();
      imgEl.style.width = '100%';
      imgEl.style.height = '100%';
      imgEl.style.objectFit = 'cover';
      display.appendChild(imgEl);
    } else {
      var fallbacks = [
        { bg: 'linear-gradient(135deg, #e8f0fe 0%, #c5d9f7 100%)', num: '01', title: 'エリア一括評価' },
        { bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', num: '02', title: 'インパクト推計' },
        { bg: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', num: '03', title: 'ターゲット候補選定' }
      ];
      var fb = fallbacks[idx];
      display.innerHTML = '<div class="slide-fallback" style="background:' + fb.bg + '"><div class="slide-number">' + fb.num + '</div><div class="slide-title">' + fb.title + '</div></div>';
    }
  }
}

// ===== Task 19: Comparison tab switch =====
function switchCompTab(tab) {
  document.querySelectorAll('.comp-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('comp-existing').style.display = tab === 'existing' ? 'block' : 'none';
  document.getElementById('comp-rwai').style.display = tab === 'rwai' ? 'block' : 'none';
  event.target.classList.add('active');
}

function toggleCompDetail(btn) {
  const row = btn.closest('tr');
  const detailRow = row.nextElementSibling;
  if (detailRow && detailRow.classList.contains('comp-detail-row')) {
    const isOpen = detailRow.style.display === 'table-row';
    detailRow.style.display = isOpen ? 'none' : 'table-row';
    btn.textContent = isOpen ? '+' : '−';
  }
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

// ===== Screen 0 -> Project List (V4) =====
function startDemo() {
  if (gifInterval) { clearInterval(gifInterval); gifInterval = null; }
  showProjectListView();
  loadProjectsData();
}

// ===== Map Init (Screen 1) =====
function initMap() {
  map = L.map('map', { zoomControl: true }).setView([35.6565, 139.7533], 18);

  // Task 1: Carto Positron tile
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Task 94: Debug coordinate mode
  if (window.location.search.includes('debug=1')) {
    window.debugCoords = [];
    window.debugMarkers = [];
    var debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = 'position:fixed;bottom:10px;left:10px;background:rgba(0,0,0,0.85);color:#0f0;font-family:monospace;font-size:12px;padding:12px;border-radius:8px;z-index:99999;max-width:400px;max-height:300px;overflow-y:auto';
    var headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'color:#fff;margin-bottom:8px';
    headerDiv.innerHTML = '<b>Debug Mode</b> - Click map to get coordinates';
    var outputDiv = document.createElement('div');
    outputDiv.id = 'debug-output';
    var btnDiv = document.createElement('div');
    btnDiv.style.marginTop = '8px';
    var copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy All';
    copyBtn.style.cssText = 'padding:4px 8px;font-size:11px;cursor:pointer;margin-right:4px';
    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(outputDiv.textContent);
    });
    var clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = 'padding:4px 8px;font-size:11px;cursor:pointer';
    clearBtn.addEventListener('click', function() {
      window.debugCoords = [];
      window.debugMarkers.forEach(function(m) { map.removeLayer(m); });
      window.debugMarkers = [];
      outputDiv.innerHTML = '';
    });
    btnDiv.appendChild(copyBtn);
    btnDiv.appendChild(clearBtn);
    debugPanel.appendChild(headerDiv);
    debugPanel.appendChild(outputDiv);
    debugPanel.appendChild(btnDiv);
    document.body.appendChild(debugPanel);
    map.on('click', function(e) {
      var lat = e.latlng.lat.toFixed(6);
      var lng = e.latlng.lng.toFixed(6);
      window.debugCoords.push([parseFloat(lat), parseFloat(lng)]);
      var marker = L.circleMarker(e.latlng, {radius: 4, color: '#0f0', fillColor: '#0f0', fillOpacity: 1}).addTo(map);
      window.debugMarkers.push(marker);
      outputDiv.innerHTML = '';
      window.debugCoords.forEach(function(c, i) {
        var line = document.createElement('div');
        line.textContent = '[' + c[0] + ',' + c[1] + ']' + (i < window.debugCoords.length - 1 ? ',' : '');
        outputDiv.appendChild(line);
      });
    });
  }

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
    '<b>1. </b>左上の「エリア選択」をクリック → <b>2. </b>地図上でドラッグ → <b>3. </b>エリア内の全筆を自動評価';

  // Listen for draw start
  map.on('draw:drawstart', function () {
    advanceGuide(2);
  });

  map.on(L.Draw.Event.CREATED, function (e) {
    if (drawnRect) drawnItems.removeLayer(drawnRect);
    drawnRect = e.layer;
    drawnItems.addLayer(drawnRect);
    if (window.guideDashedRect) { map.removeLayer(window.guideDashedRect); window.guideDashedRect = null; }
    clearGuideUI();
    onAreaSelected();
  });

  // Task 50/72: Panel resize handle (fixed position)
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

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startWidth = panel.offsetWidth;
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
    document.getElementById('panel-resize-handle').style.right = newWidth + 'px';
    if (map) map.invalidateSize();
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
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
    if (window.guideDashedRect) { map.removeLayer(window.guideDashedRect); window.guideDashedRect = null; }
    if (window.guidePulseMarker) { map.removeLayer(window.guidePulseMarker); window.guidePulseMarker = null; }
    document.querySelectorAll('.shake-btn').forEach(function(el) { el.classList.remove('shake-btn'); });
    document.querySelectorAll('.guide-shake').forEach(function(el) { el.classList.remove('guide-shake'); });
    document.querySelectorAll('.guide-bubble').forEach(function(el) { el.remove(); });
    document.querySelectorAll('.guide-pulse').forEach(function(el) { el.remove(); });
    document.querySelectorAll('.guide-pulse-fixed').forEach(function(el) { el.remove(); });
    if (window._guidePulseScroll) {
        var panel = document.getElementById('side-panel');
        if (panel) panel.removeEventListener('scroll', window._guidePulseScroll);
        window._guidePulseScroll = null;
    }
    if (window._guidePulseResize) {
        window.removeEventListener('resize', window._guidePulseResize);
        window._guidePulseResize = null;
    }
    if (window._guideBubbleScroll) {
        var panel2 = document.getElementById('side-panel');
        if (panel2) panel2.removeEventListener('scroll', window._guideBubbleScroll);
        window._guideBubbleScroll = null;
    }
}

function skipGuide() {
  guideSkipped = true;
  clearGuideUI();
}

function showGuideBubble(targetEl, message) {
    if (_panelUpdating) return;
    var now = Date.now();
    if (now - _lastGuideBubbleTime < 2000) return;
    _lastGuideBubbleTime = now;
    var existing = document.querySelector('.guide-bubble');
    if (existing) existing.remove();
    if (guideSkipped) return;

    var bubble = document.createElement('div');
    bubble.className = 'guide-bubble';
    bubble.innerHTML = '<div class="guide-bubble-close" onclick="skipGuide()">&times;</div><div class="guide-bubble-text">' + message + '</div>';
    document.body.appendChild(bubble);
    guideOverlay = bubble;

    if (!targetEl) {
        bubble.style.left = '80px';
        bubble.style.top = '80px';
        return;
    }

    function updatePos() {
        if (!targetEl || !targetEl.getBoundingClientRect) return;
        var rect = targetEl.getBoundingClientRect();
        var isInPanel = targetEl.closest && targetEl.closest('#side-panel');
        if (isInPanel) {
            bubble.style.left = rect.left + 'px';
            bubble.style.top = (rect.bottom + 8) + 'px';
        } else {
            bubble.style.left = (rect.right + 12) + 'px';
            bubble.style.top = rect.top + 'px';
        }
    }
    updatePos();

    window._guideBubbleScroll = function() { updatePos(); };
    var panel = document.getElementById('side-panel');
    if (panel) panel.addEventListener('scroll', window._guideBubbleScroll);
}

function showGuidePulse(targetEl) {
    var existing = document.querySelector('.guide-pulse-fixed');
    if (existing) existing.remove();
    if (!targetEl) return;

    var pulse = document.createElement('div');
    pulse.className = 'guide-pulse-fixed';
    document.body.appendChild(pulse);

    function updatePos() {
        if (!targetEl || !targetEl.getBoundingClientRect) return;
        var rect = targetEl.getBoundingClientRect();
        pulse.style.left = (rect.left + rect.width / 2 - 25) + 'px';
        pulse.style.top = (rect.top + rect.height / 2 - 25) + 'px';
    }
    updatePos();

    window._guidePulseScroll = function() { updatePos(); };
    window._guidePulseResize = function() { updatePos(); };
    var panel = document.getElementById('side-panel');
    if (panel) panel.addEventListener('scroll', window._guidePulseScroll);
    window.addEventListener('resize', window._guidePulseResize);
}

function applyGuideShake(targetEl) {
    var prev = document.querySelector('.guide-shake');
    if (prev) prev.classList.remove('guide-shake');
    targetEl.classList.add('guide-shake');
}

function advanceGuide(step) {
  if (guideSkipped) return;
  if (_panelUpdating) return;
  if (_guideUpdating) return;
  _guideUpdating = true;
  setTimeout(function() { _guideUpdating = false; }, 300);
  guideStep = step;

  switch (step) {
    case 1: { // Click draw button
      const drawBtn = document.querySelector('.leaflet-draw-draw-rectangle');
      if (drawBtn) {
        drawBtn.classList.add('shake-btn');
        showGuidePulse(drawBtn);
        applyGuideShake(drawBtn);
        showGuideBubble(drawBtn, '1. まず選択ツールをクリックしてください');
      }
      break;
    }
    case 2: { // Draw area
      clearGuideUI();
      guideStep = 2;
      // Show dotted rectangle on map
      window.guideDashedRect = L.rectangle(DATA_BOUNDS, {
        color: '#0067B3', weight: 2, dashArray: '8,6',
        fill: true, fillColor: '#0067B3', fillOpacity: 0.05
      }).addTo(map);
      // Fit map to show the target area
      map.fitBounds(DATA_BOUNDS, { padding: [50, 50] });
      // Show pulse as Leaflet circleMarker
      var boundsCenter = DATA_BOUNDS.getCenter();
      window.guidePulseMarker = L.circleMarker(boundsCenter, {
        radius: 45,
        color: '#0067B3',
        weight: 3,
        fill: false,
        className: 'guide-pulse-leaflet'
      }).addTo(map);
      showGuideBubble(null, '2. 点線の範囲をドラッグで囲んでください');
      break;
    }
    case 3: { // Click rank-1 parcel
      clearGuideUI();
      guideStep = 3;
      setTimeout(() => {
        if (guideSkipped) return;
        var firstRow = document.querySelector('.ranking-item');
        if (firstRow) {
          var badge = firstRow.querySelector('.recommend-badge');
          var pulseTarget = badge || firstRow;
          showGuidePulse(pulseTarget);
          applyGuideShake(firstRow);
          showGuideBubble(firstRow, '3. 最高スコアの筆をクリックして詳細を確認しましょう');
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
          showGuidePulse(btn);
          applyGuideShake(btn);
          showGuideBubble(btn, '4. 開発シナリオを検討して施設タイプ・延床面積を設定します');
        }
      }, 500);
      break;
    }
    case 5: { // Select facility type card
      clearGuideUI();
      guideStep = 5;
      setTimeout(function() {
        if (guideSkipped) return;
        var recCard = document.querySelector('.facility-card[data-type="complex"]');
        if (recCard) {
          showGuidePulse(recCard);
          applyGuideShake(recCard);
          showGuideBubble(recCard, '5. 施設タイプを選択してください');
        }
      }, 500);
      break;
    }
    case 6: { // Click confirm button
      clearGuideUI();
      guideStep = 6;
      setTimeout(function() {
        if (guideSkipped) return;
        var btn = document.getElementById('facility-confirm-btn');
        if (btn) {
          showGuidePulse(btn);
          applyGuideShake(btn);
          showGuideBubble(btn, '6. 分析を開始すると、ボリュームチェック・事業収支・インパクト推計が一括実行されます');
        }
      }, 1000);
      break;
    }
    case 7: { // Volume check tab shown (auto 3s)
      clearGuideUI();
      guideStep = 7;
      showGuideBubble(null, '7. ボリュームチェック結果を確認しています...');
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
        showGuidePulse(finTab);
        applyGuideShake(finTab);
        showGuideBubble(finTab, '8. 事業収支タブでNOI利回り・IRR・プロフォーマを確認できます');
      }
      break;
    }
    case 9: { // Click impact tab
      clearGuideUI();
      guideStep = 9;
      setTimeout(() => {
        if (guideSkipped) return;
        const impTab = document.querySelector('.analysis-tab[data-tab="impact"]');
        const riskTab = document.querySelector('.analysis-tab[data-tab="risk"]');
        const targetTab = impTab || riskTab;
        if (targetTab) {
          showGuidePulse(targetTab);
          applyGuideShake(targetTab);
          showGuideBubble(targetTab, '9. インパクト推計タブで周辺への影響を確認できます');
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
          showGuidePulse(btn);
          applyGuideShake(btn);
          showGuideBubble(btn, '10. ターゲット候補の選定に進みます');
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
      showGuideBubble(null, '12. ターゲットリストが生成されました。CSVエクスポートも可能です');
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
          showGuidePulse(btn);
          applyGuideShake(btn);
          showGuideBubble(btn, '13. AIが推奨する近隣エリアを調査しましょう。権利整理が容易で、大規模開発の余地があるエリアです');
        }
      }, 1000);
      break;
    }
    case 14: { // Alternative area (auto 5s, end)
      clearGuideUI();
      guideStep = 14;
      setTimeout(() => {
        if (guideSkipped) return;
        showGuideBubble(null, 'AI推奨エリアに移動しました。同じように筆の詳細確認・シナリオ分析が可能です');
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

function showToast(message, duration) {
  duration = duration || 3000;

  var existingToast = document.getElementById('v4-toast');
  if (existingToast) existingToast.remove();

  var toast = document.createElement('div');
  toast.id = 'v4-toast';
  toast.style.cssText = 'position:fixed;bottom:40px;left:50%;transform:translateX(-50%);background:rgba(26,54,88,0.95);color:#fff;padding:12px 24px;border-radius:8px;font-size:13px;z-index:100000;box-shadow:0 4px 12px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.3s';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function() { toast.style.opacity = '1'; }, 10);

  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() {
      if (toast.parentNode) toast.remove();
    }, 300);
  }, duration);
}

// ===== Screen 2: Area Selected =====
async function onAreaSelected() {
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
}

// Fallback inline data loader
async function loadInlineData() {
  return [];
}

// ===== Draw parcels on map (Task 2) =====
function drawParcels() {
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
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
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
}

// ===== Task 15: Mode descriptions =====
const modeDescriptions = {
  score: '法規制・交通利便性・周辺賃料・開発余地・ハザードリスクの5要素を統合した総合評価指標です。スコアが高いほど開発ポテンシャルが高い土地を示します。',
  roi: 'NOI（営業純利益）を総投資額で割った利回り。周辺相場・空室率予測・建築費概算に基づく推計値で、値が高いほど収益性の高い土地を示します。'
};

function goToImpactFromRanking() {
  var targetId = selectedParcelId;
  if (!targetId) {
    var sorted = [...parcelsData].sort(function(a, b) { return b.score - a.score; });
    for (var i = 0; i < sorted.length; i++) {
      var inPlan = false;
      developmentPlans.forEach(function(plan) {
        if (plan.parcels.indexOf(sorted[i].id) >= 0) inPlan = true;
      });
      if (inPlan) { targetId = sorted[i].id; break; }
    }
  }
  if (targetId) showScenarioPanel(targetId);
}

// ===== Show Ranking Panel (Screen 2) =====
function showRankingPanel() {
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
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
  const handle = document.getElementById('panel-resize-handle');
  if (handle) handle.style.right = w + 'px';
  setTimeout(() => { if (map) map.invalidateSize(); }, 50);
}

// ===== Screen 3: Simplified Detail Panel (Task 49) =====
function showDetailPanel(id) {
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
}

function closeDetailPanel() {
  setPanelWidth(400);
  showRankingPanel();
}

// ===== Screen 4: Scenario Selection Panel (Task 49) =====
function showScenarioPanel(id) {
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
}

function highlightPlanParcels(planId) {
  // First grey all
  Object.keys(parcelLayers).forEach(function(pid) {
    parcelLayers[pid].setStyle({ fillColor: '#cccccc', fillOpacity: 0.2, weight: 1, color: '#aaaaaa' });
  });
  // Highlight plan parcels in red
  var plan = developmentPlans.find(function(p) { return p.id === planId; });
  if (!plan) return;
  plan.parcels.forEach(function(pid) {
    if (parcelLayers[pid]) {
      parcelLayers[pid].setStyle({ fillColor: '#d94f43', fillOpacity: 0.5, weight: 3, color: '#d94f43' });
    }
  });
}

function clearPlanHighlight() {
  Object.keys(parcelLayers).forEach(function(pid) {
    parcelLayers[pid].setStyle({ fillColor: '#cccccc', fillOpacity: 0.2, weight: 1, color: '#aaaaaa' });
  });
  if (typeof window._expandedPlanParcels !== 'undefined' && window._expandedPlanParcels) {
    window._expandedPlanParcels.forEach(function(pid) {
      if (parcelLayers[pid]) {
        parcelLayers[pid].setStyle({ fillColor: '#d94f43', fillOpacity: 0.6, weight: 3, color: '#d94f43' });
      }
    });
  }
}

function highlightAltArea(areaId) {
  var area = alternativeAreas.find(function(a) { return a.areaId === areaId; });
  if (!area) return;
  map.flyTo(area.center, 17, { duration: 0.5 });
  if (window._altAreaLayers) {
    window._altAreaLayers.forEach(function(l) {
      l.setStyle({ fillOpacity: 0.1, weight: 1, color: '#0067B3' });
    });
  }
  var areaParcelCoords = area.parcels.map(function(p) {
    return p.polygon[0][0].toFixed(4) + ',' + p.polygon[0][1].toFixed(4);
  });
  if (window._altAreaLayers) {
    window._altAreaLayers.forEach(function(l) {
      var latlngs = l.getLatLngs()[0];
      var key = latlngs[0].lat.toFixed(4) + ',' + latlngs[0].lng.toFixed(4);
      if (areaParcelCoords.indexOf(key) >= 0) {
        l.setStyle({ fillColor: '#0067B3', fillOpacity: 0.4, weight: 2.5, color: '#0067B3', dashArray: null });
      }
    });
  }
}

function unhighlightAltAreas() {
  if (window._altAreaLayers) {
    window._altAreaLayers.forEach(function(l) {
      l.setStyle({ fillColor: '#0067B3', fillOpacity: 0.15, weight: 1.5, color: '#0067B3', dashArray: '4,4' });
    });
  }
  if (window._planCenter) {
    var allPoints = [window._planCenter];
    alternativeAreas.forEach(function(area) { allPoints.push(area.center); });
    var bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }
}

// ===== Three.js 3D Building Renderer =====
function create3DBuilding(container, p, containerWidth, containerHeight, facilityType) {
  if (typeof THREE === 'undefined') {
    container.innerHTML = '<p style="color:#888;font-size:12px;text-align:center;padding:20px">3D表示を読み込み中...</p>';
    return;
  }
  container.innerHTML = '';

  var w = containerWidth || container.clientWidth || 350;
  var h = containerHeight || container.clientHeight || 200;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f4f8);

  var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  camera.position.set(25, 20, 25);
  camera.lookAt(0, 6, 0);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  // Ground
  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshLambertMaterial({ color: 0xdde0e4 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  var ft = facilityType || 'complex';

  if (ft === 'office') {
    // Office: rectangular box
    var offBody = new THREE.Mesh(
      new THREE.BoxGeometry(8, 16, 6),
      new THREE.MeshLambertMaterial({ color: 0x4488cc, transparent: true, opacity: 0.7 })
    );
    offBody.position.y = 8;
    scene.add(offBody);
    for (var i = 1; i < 12; i++) {
      var fy = i * 1.4;
      var fg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-4, fy, -3), new THREE.Vector3(4, fy, -3),
        new THREE.Vector3(4, fy, 3), new THREE.Vector3(-4, fy, 3),
        new THREE.Vector3(-4, fy, -3)
      ]);
      scene.add(new THREE.Line(fg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })));
    }
  } else if (ft === 'tower-mansion') {
    // Tower mansion: tall narrow
    var base = new THREE.Mesh(
      new THREE.BoxGeometry(7, 3, 7),
      new THREE.MeshLambertMaterial({ color: 0x888888, transparent: true, opacity: 0.6 })
    );
    base.position.y = 1.5;
    scene.add(base);
    var tower = new THREE.Mesh(
      new THREE.BoxGeometry(5, 22, 5),
      new THREE.MeshLambertMaterial({ color: 0x6699bb, transparent: true, opacity: 0.7 })
    );
    tower.position.y = 14;
    scene.add(tower);
    for (var j = 1; j < 18; j++) {
      var by = 3 + j * 1.2;
      var bg2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.7, by, -2.7), new THREE.Vector3(2.7, by, -2.7),
        new THREE.Vector3(2.7, by, 2.7), new THREE.Vector3(-2.7, by, 2.7),
        new THREE.Vector3(-2.7, by, -2.7)
      ]);
      scene.add(new THREE.Line(bg2, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })));
    }
  } else {
    // Complex: commercial base + office tower
    var comm = new THREE.Mesh(
      new THREE.BoxGeometry(9, 4, 8),
      new THREE.MeshLambertMaterial({ color: 0x44aa66, transparent: true, opacity: 0.7 })
    );
    comm.position.y = 2;
    scene.add(comm);
    var offTower = new THREE.Mesh(
      new THREE.BoxGeometry(7, 14, 6),
      new THREE.MeshLambertMaterial({ color: 0x4488cc, transparent: true, opacity: 0.7 })
    );
    offTower.position.y = 11;
    scene.add(offTower);
    for (var k = 1; k < 10; k++) {
      var cy = 4 + k * 1.4;
      var cg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-3.5, cy, -3), new THREE.Vector3(3.5, cy, -3),
        new THREE.Vector3(3.5, cy, 3), new THREE.Vector3(-3.5, cy, 3),
        new THREE.Vector3(-3.5, cy, -3)
      ]);
      scene.add(new THREE.Line(cg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })));
    }
  }

  // Setback line
  var slGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-10, 0, -8), new THREE.Vector3(0, 20, 0)
  ]);
  scene.add(new THREE.Line(slGeo, new THREE.LineBasicMaterial({ color: 0xff4444 })));

  renderer.render(scene, camera);

  // Mouse rotation
  var isDragging = false;
  var prevX = 0;
  var angle = Math.PI / 4;

  function onMouseDown(e) { isDragging = true; prevX = e.clientX; }
  function onMouseUp() { isDragging = false; }
  function onMouseMove(e) {
    if (!isDragging) return;
    angle += (e.clientX - prevX) * 0.01;
    camera.position.x = 25 * Math.cos(angle);
    camera.position.z = 25 * Math.sin(angle);
    camera.lookAt(0, 6, 0);
    renderer.render(scene, camera);
    prevX = e.clientX;
  }

  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
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
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
}

function switchAnalysisTab(tab, parcelId, facilityType, floorArea) {
  document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.analysis-tab[data-tab="${tab}"]`).classList.add('active');

  const content = document.getElementById('analysis-content');
  const p = parcelsData.find(d => d.id === parcelId);
  if (!p) return;

  if (tab === 'volume') {
    content.innerHTML = getVolumeTabContent(p, facilityType, floorArea);
    setTimeout(function() {
      var container = document.getElementById('three-analysis-volume');
      if (container) create3DBuilding(container, p, 350, 250, facilityType);
    }, 100);
  } else if (tab === 'finance') {
    content.innerHTML = getFinanceTabContent(p, facilityType, floorArea);
    setTimeout(() => initCFChart(p), 100);
  } else if (tab === 'impact') {
    content.innerHTML = getImpactTabContent(p, facilityType, floorArea);
  } else if (tab === 'risk') {
    content.innerHTML = getRiskTabContent(p);
  }

  // Guide transitions
  if (tab === 'finance' && guideStep === 8) advanceGuide(9);
  if (tab === 'impact' && guideStep === 9) advanceGuide(10);
}

function getVolumeTabContent(p, facilityType, floorArea) {
  var dp = window._displayP || p;
  const ba = dp.buildableArea || Math.round(dp.area * p.far / 100 * 0.93);
  const bldgArea = Math.round(dp.area * 0.6);
  const bldgH = dp.floors * 3.5;
  const volRate = Math.round(ba / dp.area * 100);

  return `
    <div id="three-analysis-volume" style="width:100%;height:250px;border-radius:8px;overflow:hidden;margin-bottom:16px;position:relative">
      <div style="position:absolute;top:8px;left:8px;background:rgba(255,255,255,0.85);padding:4px 10px;border-radius:4px;font-size:11px;color:#555;z-index:1">${dp.floors}階 / 延床${ba.toLocaleString()}m²</div>
    </div>
    <table class="detail-table">
      <tr><td>敷地面積</td><td>${dp.area.toLocaleString()} m²</td></tr>
      <tr><td>建築面積</td><td>${bldgArea.toLocaleString()} m²</td></tr>
      <tr><td>延床面積</td><td>${ba.toLocaleString()} m²</td></tr>
      <tr><td>容積消化率</td><td><div style="background:#eee;border-radius:4px;height:14px;width:100%"><div style="background:#185FA5;height:14px;border-radius:4px;width:${Math.min(100,volRate)}%;font-size:10px;color:#fff;text-align:center;line-height:14px">${volRate}%</div></div></td></tr>
      <tr><td>階数</td><td>${dp.floors}階</td></tr>
      <tr><td>建物高さ</td><td>約${bldgH.toFixed(0)}m</td></tr>
      <tr><td>レンタブル比</td><td><div style="background:#eee;border-radius:4px;height:14px;width:100%"><div style="background:#2d8a4e;height:14px;border-radius:4px;width:${dp.rentableRatio||73}%;font-size:10px;color:#fff;text-align:center;line-height:14px">${dp.rentableRatio||73}%</div></div></td></tr>
      <tr><td>想定住戸数</td><td>${dp.units || Math.round(ba * 0.74 / 50)}戸</td></tr>
    </table>
    <p style="font-size:10px;color:#999;margin-top:12px">※斜線制限・天空率は概算反映。詳細は設計事務所による検証が必要です</p>
  `;
}

function getFinanceTabContent(p, facilityType, floorArea) {
  var dp = window._displayP || p;
  var ba = dp.buildableArea || Math.round(dp.area * p.far / 100 * 0.93);
  var rr = (dp.rentableRatio || 73) / 100;
  var landCost = Math.round(p.landPrice * dp.area / 100);
  var buildCost = dp.cost || p.cost;
  var designFee = Math.round(buildCost * 0.08);
  var expenses = Math.round(buildCost * 0.05);
  var contingency = Math.round(buildCost * 0.10);
  var totalInvest = landCost + buildCost + designFee + expenses + contingency;
  var grossRent = Math.round(p.rent * ba * rr * 12 / 1000000);
  var annualRent = Math.round(grossRent * (1 - p.vacancy / 100));
  var commonFee = Math.round(annualRent * 0.1);
  var opex = Math.round(annualRent * 0.2);
  var noi = annualRent + commonFee - opex;
  var loanAmt = Math.round(totalInvest * 0.7);
  var mr = 0.02/12;
  var annualDebt = Math.round(loanAmt * mr * Math.pow(1+mr,360) / (Math.pow(1+mr,360)-1) * 12);
  var preTaxCF = noi - annualDebt;
  var dscrVal = annualDebt > 0 ? (noi / annualDebt).toFixed(2) : 'N/A';
  var dscrColor = parseFloat(dscrVal) >= 1.3 ? '#2d8a4e' : '#c0392b';

  return '<div class="detail-grid-4" style="margin-bottom:16px">' +
    '<div class="metric-card"><div class="metric-label">NOI利回り（開発後推計）</div><div class="metric-value" style="font-size:16px">' + p.noiYield + '%</div></div>' +
    '<div class="metric-card"><div class="metric-label">想定IRR</div><div class="metric-value" style="font-size:16px">' + p.irr + '%</div></div>' +
    '<div class="metric-card"><div class="metric-label">粗利率</div><div class="metric-value" style="font-size:16px">' + p.grossMargin + '%</div></div>' +
    '<div class="metric-card"><div class="metric-label">DSCR</div><div class="metric-value" style="font-size:16px;color:' + dscrColor + '">' + dscrVal + '</div></div>' +
    '</div>' +
    '<h4 style="font-size:13px;color:#888;margin-bottom:8px">初期投資</h4>' +
    '<table class="detail-table" style="margin-bottom:12px">' +
    '<tr><td>土地取得費</td><td>' + landCost.toLocaleString() + '百万円</td></tr>' +
    '<tr><td>建築工事費</td><td>' + buildCost.toLocaleString() + '百万円</td></tr>' +
    '<tr><td>設計・監理費</td><td>' + designFee + '百万円</td></tr>' +
    '<tr><td>諸経費</td><td>' + expenses + '百万円</td></tr>' +
    '<tr><td>予備費</td><td>' + contingency + '百万円</td></tr>' +
    '<tr style="font-weight:700;border-top:2px solid #333"><td>合計</td><td>' + totalInvest.toLocaleString() + '百万円</td></tr>' +
    '</table>' +
    '<h4 style="font-size:13px;color:#888;margin:12px 0 8px">年間収支（安定稼働時）</h4>' +
    '<table class="detail-table" style="margin-bottom:12px">' +
    '<tr><td>賃料収入</td><td>' + annualRent + '百万円</td></tr>' +
    '<tr><td>共益費収入</td><td>' + commonFee + '百万円</td></tr>' +
    '<tr><td>運営費</td><td>-' + opex + '百万円</td></tr>' +
    '<tr style="font-weight:700"><td>NOI</td><td>' + noi + '百万円</td></tr>' +
    '<tr><td>借入金返済</td><td>-' + annualDebt + '百万円</td></tr>' +
    '<tr style="font-weight:700;border-top:2px solid #333"><td>税前CF</td><td>' + preTaxCF + '百万円</td></tr>' +
    '</table>' +
    '<h4 style="font-size:13px;color:#888;margin-bottom:8px">累積CF推移</h4>' +
    '<div style="display:flex;gap:4px;margin-bottom:8px">' +
    '<button class="cf-scenario-tab active" data-scenario="pessimistic" style="flex:1;padding:6px 0;font-size:11px;font-weight:600;border:1px solid #ddd;border-radius:4px;background:#fff;cursor:pointer;font-family:inherit">悲観</button>' +
    '<button class="cf-scenario-tab" data-scenario="base" style="flex:1;padding:6px 0;font-size:11px;font-weight:600;border:1px solid #185FA5;border-radius:4px;background:#185FA5;color:#fff;cursor:pointer;font-family:inherit">基本</button>' +
    '<button class="cf-scenario-tab" data-scenario="optimistic" style="flex:1;padding:6px 0;font-size:11px;font-weight:600;border:1px solid #ddd;border-radius:4px;background:#fff;cursor:pointer;font-family:inherit">楽観</button>' +
    '</div>' +
    '<div id="cfParams" style="font-size:11px;color:#888;margin-bottom:8px"></div>' +
    '<div style="height:250px"><canvas id="cfChart"></canvas></div>' +
    '<div id="cfLegend" style="display:flex;gap:12px;justify-content:center;margin-top:8px;font-size:11px">' +
    '<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:#d94f43;border-radius:2px;display:inline-block"></span>赤字</span>' +
    '<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:#0067B3;border-radius:2px;display:inline-block"></span>黒字</span>' +
    '<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border:2px solid #2d8a4e;border-radius:2px;display:inline-block"></span>回収年</span>' +
    '</div>' +
    '<div id="cfSummary" style="margin-top:12px;background:#f7f8fa;border-radius:6px;padding:10px 12px;font-size:12px;color:#555"></div>';
}

function renderCFChart(p, facilityType, floorArea) {
  initCFChart(p);
}

function initCFChart(parcel) {
    var scenarios = {
        pessimistic: { vacancy: 10, growth: 0, rate: 2.5, opex: 0.25 },
        base: { vacancy: 5, growth: 1.5, rate: 2.0, opex: 0.20 },
        optimistic: { vacancy: 3, growth: 3.0, rate: 1.5, opex: 0.15 }
    };

    var p = parcel;
    var landCost = p.landPrice * p.area / 100;
    var constructionCost = p.cost;
    var designFee = constructionCost * 0.08;
    var miscFee = constructionCost * 0.05;
    var contingency = constructionCost * 0.10;
    var totalInvestment = landCost + constructionCost + designFee + miscFee + contingency;
    var equityAmount = totalInvestment * 0.30;
    var loanAmount = totalInvestment * 0.70;

    var baseAnnualRent = p.rent * p.buildableArea * (p.rentableRatio / 100) * 12 / 1000000;

    function calcCF(s) {
        var mr = s.rate / 100 / 12;
        var np = 360;
        var annualRepay = loanAmount * (mr * Math.pow(1 + mr, np)) / (Math.pow(1 + mr, np) - 1) * 12;
        var data = [];
        var cum = -equityAmount;
        data.push(Math.round(cum));
        for (var y = 1; y <= 30; y++) {
            var rentY = baseAnnualRent * Math.pow(1 + s.growth / 100, y - 1);
            var grossIncome = rentY * (1 - s.vacancy / 100);
            var noi = grossIncome * (1 - s.opex);
            var cf = noi - annualRepay;
            if (y >= 15) {
                cf = noi - annualRepay * 0.4;
            }
            cum = cum + cf;
            data.push(Math.round(cum));
        }
        return data;
    }


    function getColors(data) {
        return data.map(function(v) { return v >= 0 ? '#0067B3' : '#d94f43'; });
    }

    function getPayback(data) {
        for (var i = 1; i < data.length; i++) {
            if (data[i] >= 0 && data[i - 1] < 0) return i;
        }
        return null;
    }

    var labels = [];
    for (var i = 0; i <= 30; i++) labels.push(i % 5 === 0 ? i + '年' : '');

    var canvas = document.getElementById('cfChart');
    if (!canvas) return;
    if (window.cfChartInstance) window.cfChartInstance.destroy();

    var baseData = calcCF(scenarios.base);
    window.cfChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: baseData,
                backgroundColor: getColors(baseData),
                borderRadius: 2,
                barPercentage: 0.85
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(ctx) { return ctx[0].dataIndex + '年目'; },
                        label: function(ctx) { return ctx.parsed.y.toLocaleString() + '百万円'; }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(v) { return v.toLocaleString(); },
                        font: { size: 10 },
                        color: '#999'
                    },
                    grid: { color: 'rgba(0,0,0,0.06)' }
                },
                x: {
                    ticks: {
                        font: { size: 9 },
                        color: '#999',
                        maxRotation: 0
                    },
                    grid: { display: false }
                }
            }
        }
    });

    function updateCFChart(key) {
        var s = scenarios[key];
        var data = calcCF(s);
        window.cfChartInstance.data.datasets[0].data = data;
        window.cfChartInstance.data.datasets[0].backgroundColor = getColors(data);
        window.cfChartInstance.update();

        var paramsEl = document.getElementById('cf-params');
        if (paramsEl) {
            paramsEl.innerHTML = '空室率: <b>' + s.vacancy + '%</b> / 賃料成長率: <b>' + s.growth + '%/年</b> / 借入金利: <b>' + s.rate + '%</b> / 運営費率: <b>' + (s.opex * 100) + '%</b>';
        }

        var pb = getPayback(data);
        var summaryEl = document.getElementById('cf-summary');
        if (summaryEl) {
            var label = key === 'pessimistic' ? '悲観' : key === 'base' ? '基本' : '楽観';
            var pbText = pb ? pb + '年目に回収' : '30年以内に回収不可';
            var cfText = (data[30] >= 0 ? '+' : '') + data[30].toLocaleString() + '百万円';
            var pbText2 = pb ? '<span style="color:#2d8a4e;font-weight:500">' + pb + '年目に投資回収</span>' : '<span style="color:#d94f43">30年以内に回収不可</span>';
            var cfText = '<span style="color:' + (data[30] >= 0 ? '#0067B3' : '#d94f43') + ';font-weight:500">' + (data[30] >= 0 ? '+' : '') + data[30].toLocaleString() + '百万円</span>';
            summaryEl.innerHTML = pbText2 + ' / 30年累積CF: ' + cfText;
        }

        document.querySelectorAll('.cf-scenario-tab').forEach(function(t) {
            if (t.dataset.scenario === key) {
                t.style.background = '#0067B3';
                t.style.color = '#fff';
                t.style.borderColor = '#0067B3';
                t.style.fontWeight = '500';
            } else {
                t.style.background = '#fff';
                t.style.color = '#888';
                t.style.borderColor = '#e0e0e0';
                t.style.fontWeight = '400';
            }
        });
    }

    document.querySelectorAll('.cf-scenario-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            updateCFChart(this.dataset.scenario);
        });
    });

    updateCFChart('base');
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

function getRiskTabContent(p) {
  const risks = p.risks || {};
  const riskItems = [
    { key: 'flood', label: '洪水リスク', detail: '河川氾濫・内水氾濫のリスク評価。ハザードマップに基づく浸水想定区域の確認結果。' },
    { key: 'soil', label: '土壌汚染', detail: '土壌汚染対策法に基づく調査結果。過去の土地利用履歴から推定される汚染可能性の評価。' },
    { key: 'cultural', label: '埋蔵文化財', detail: '文化財保護法に基づく埋蔵文化財包蔵地の確認。試掘調査の要否判定。' },
    { key: 'liquefaction', label: '液状化リスク', detail: '地盤データに基づく液状化危険度の評価。地下水位・地盤構成を考慮した判定。' },
    { key: 'road', label: '接道条件', detail: '建築基準法42条に基づく接道義務の充足状況。前面道路の幅員・種別の確認。' },
    { key: 'adjacentUse', label: '隣接地用途', detail: '隣接する土地の利用状況と将来の開発計画の確認。周辺環境への影響評価。' }
  ];

  function riskColor(val) {
    if (!val) return '#999';
    if (['低', 'なし', '適合', '問題なし'].includes(val)) return '#2d8a4e';
    if (['中', '包蔵地隣接'].includes(val)) return '#c4840a';
    if (val === '要調査') return '#c0392b';
    return '#999';
  }

  return `
    <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">リスク評価</h4>
    ${riskItems.map(item => {
      const val = risks[item.key] || '未評価';
      const color = riskColor(val);
      return `
        <div class="risk-item" onclick="this.classList.toggle('expanded')" style="border:1px solid #e0e0e0;border-radius:8px;padding:12px 14px;margin-bottom:8px;cursor:pointer">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color}"></span>
              <span style="font-size:13px;font-weight:500">${item.label}</span>
            </div>
            <span style="font-size:12px;font-weight:600;color:${color}">${val}</span>
          </div>
          <div class="risk-detail" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease">
            <p style="font-size:12px;color:#666;margin:10px 0 0;line-height:1.6">${item.detail}</p>
          </div>
        </div>`;
    }).join('')}
    <p style="font-size:10px;color:#999;margin-top:12px">※リスク評価は公開データに基づく概算判定です。正式な調査は別途必要です</p>
  `;
}

function renderImpactCirclesOnMap(p, facilityType, floorArea) {
  clearImpactOverlay();

  const parcelLayer = parcelLayers[p.id];
  var ctr = window._planCenter || getParcelCenter(p);
  const centerLatLng = L.latLng(ctr[0], ctr[1]);

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
  P01: { ownership: '所有権', ownerCount: 1, registry: '令和4年8月 所有権移転（売買）', mortgage: 'あり（みずほ銀行）', planning: '特になし',
    owners: [{ name: '株式会社港南不動産', type: '法人', years: 8, intent: '中', reason: '相続発生後5年経過' }] },
  P02: { ownership: '所有権', ownerCount: 2, registry: '令和3年3月 所有権移転（相続）', mortgage: 'なし', planning: '地区計画あり',
    owners: [{ name: '田中太郎', type: '個人', years: 15, intent: '高', reason: '高齢・後継者不在' }, { name: '田中花子', type: '個人', years: 15, intent: '高', reason: '共有持分整理希望' }] },
  P03: { ownership: '共有', ownerCount: 3, registry: '平成28年11月 所有権移転（相続）', mortgage: 'あり（2件：三菱UFJ銀行、りそな銀行）', planning: '特になし',
    owners: [{ name: '山田一郎', type: '個人', years: 18, intent: '低', reason: '居住中・売却拒否' }, { name: '山田次郎', type: '個人', years: 18, intent: '中', reason: '遠方在住・管理負担' }, { name: '山田三郎', type: '個人', years: 18, intent: '高', reason: '資金需要あり・売却希望' }] },
  P04: { ownership: '所有権', ownerCount: 1, registry: '令和5年1月 所有権移転（売買）', mortgage: 'あり（三井住友銀行）', planning: '特になし',
    owners: [{ name: '芝大門開発株式会社', type: '法人', years: 3, intent: '中', reason: '事業再編検討中' }] },
  P05: { ownership: '所有権', ownerCount: 1, registry: '令和2年11月 所有権移転（売買）', mortgage: 'あり（りそな銀行）', planning: '特になし',
    owners: [{ name: '株式会社芝大門プロパティ', type: '法人', years: 6, intent: '中', reason: 'ポートフォリオ入替検討' }] },
};

var altOwnerData = {
  B01: { ownership: '所有権', ownerCount: 1, registry: '令和5年3月 所有権移転（売買）', mortgage: 'なし', planning: '特になし',
    owners: [{ name: '芝公園開発株式会社', type: '法人', years: 3, intent: '高', reason: '事業用地として売却検討中' }] },
  B02: { ownership: '所有権', ownerCount: 1, registry: '令和4年9月 所有権移転（売買）', mortgage: 'あり（三井住友銀行）', planning: '特になし',
    owners: [{ name: '株式会社グリーンプロパティ', type: '法人', years: 4, intent: '中', reason: 'ポートフォリオ入替検討' }] },
  B03: { ownership: '所有権', ownerCount: 1, registry: '令和3年6月 所有権移転（売買）', mortgage: 'なし', planning: '特になし',
    owners: [{ name: '三和不動産株式会社', type: '法人', years: 5, intent: '中', reason: '周辺開発動向を注視' }] },
  B04: { ownership: '所有権', ownerCount: 1, registry: '令和2年12月 所有権移転（売買）', mortgage: 'あり（みずほ銀行）', planning: '特になし',
    owners: [{ name: '株式会社芝パークリアルティ', type: '法人', years: 6, intent: '高', reason: '含み益あり・売却タイミング検討' }] },
  B05: { ownership: '所有権', ownerCount: 1, registry: '令和4年2月 所有権移転（売買）', mortgage: 'なし', planning: '特になし',
    owners: [{ name: '東都建物管理株式会社', type: '法人', years: 4, intent: '中', reason: '管理物件の集約検討' }] },
  B06: { ownership: '所有権', ownerCount: 1, registry: '令和5年7月 所有権移転（売買）', mortgage: 'なし', planning: '特になし',
    owners: [{ name: '株式会社港区アセット', type: '法人', years: 2, intent: '高', reason: '短期保有・売却意向明確' }] }
};

function getOwnerInfo(parcelId) {
  if (window._isAlternativeArea && altOwnerData[parcelId]) return altOwnerData[parcelId];
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
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
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
            <div class="loading-step-img" id="limg-${i}"><img src="data/loading-${i+1}.png" style="width:200px;height:auto;border-radius:8px" onerror="this.parentElement.innerHTML='<span>参照中...</span>'"></div>
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
  var areaName = window._isAlternativeArea ? '芝公園三丁目' : '芝大門一丁目';
  a.href = url;
  a.download = 'target_list_' + areaName + '_' + dateStr + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSVファイルをダウンロードしました');
}

// ===== Task 40: Explore alternative area =====
function exploreAlternativeArea(areaId) {
  console.warn('V4: This function is being redesigned. Original logic disabled.');
  // V4: TBD
}

function returnToOriginalArea() {
  if (!originalParcelsData) return;
  parcelsData = originalParcelsData;
  originalParcelsData = null;
  currentAreaLabel = null;

  // Remove current alternative area layers
  Object.values(parcelLayers).forEach(l => map.removeLayer(l));
  Object.values(parcelTooltips).forEach(t => map.removeLayer(t));
  parcelLayers = {};
  parcelTooltips = {};

  // Remove old greyed-out layers
  if (window.oldParcelLayers) {
    Object.values(window.oldParcelLayers).forEach(l => map.removeLayer(l));
    window.oldParcelLayers = null;
  }
  if (window.oldParcelTooltips) {
    Object.values(window.oldParcelTooltips).forEach(t => map.removeLayer(t));
    window.oldParcelTooltips = null;
  }

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
  var evalAreaName = window._isAlternativeArea ? '芝公園三丁目エリア' : '芝大門一丁目エリア';
  a.href = url;
  a.download = 'evaluation_report_' + evalAreaName + '_' + p.name + '_' + getDateStr() + '.html';
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
  var batchEvalAreaName = window._isAlternativeArea ? '芝公園三丁目エリア' : '芝大門一丁目エリア';
  a.href = url;
  a.download = 'evaluation_reports_batch_' + batchEvalAreaName + '_' + getDateStr() + '.html';
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

// ===== Tab Switching (Task 131) =====
function resetDemo() {
  if (!confirm('デモの最初に戻りますか？')) return;
  window._isAlternativeArea = false;
  window.selectedPlan = null;
  window._selectedFacility = null;
  window._planCenter = null;
  window._expandedPlanParcels = null;
  if (window._altAreaLayers) {
    window._altAreaLayers.forEach(function(l) { map.removeLayer(l); });
    window._altAreaLayers = [];
  }
  Object.values(parcelLayers).forEach(function(l) { map.removeLayer(l); });
  Object.values(parcelTooltips).forEach(function(t) { map.removeLayer(t); });
  parcelLayers = {};
  parcelTooltips = {};
  parcelsData = [];
  selectedParcelId = null;
  currentScreen = 1;
  guideStep = 0;
  clearImpactOverlay();
  clearGuideUI();

  var panel = document.getElementById('side-panel');
  panel.style.display = 'none';
  panel.innerHTML = '';

  map.setView([35.6565, 139.7533], 17);

  if (window.guideDashedRect) map.removeLayer(window.guideDashedRect);
  window.guideDashedRect = L.rectangle(DATA_BOUNDS, {
    color: '#0067B3', weight: 2, dashArray: '8,6',
    fill: true, fillColor: '#0067B3', fillOpacity: 0.05
  }).addTo(map);

  setTimeout(function() { advanceGuide(1); }, 500);
}

function switchAppTab(tab) {
  // V4: 全シーン画面を一旦非表示にする
  ['project-detail-view','analysis-loading-overlay','supply-demand-view','optimization-loading-overlay','optimization-plans-view','vendor-recommendation-view','summary-view'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (tab === 'map') {
    // V4: 案件一覧画面を表示（マップではない）
    var plView = document.getElementById('project-list-view');
    if (plView) plView.style.display = 'block';
    var mapView = document.getElementById('map-view');
    if (mapView) mapView.style.display = 'none';
    var hearingView = document.getElementById('hearing-view');
    if (hearingView) hearingView.style.display = 'none';
    document.getElementById('tab-map').style.borderBottomColor = '#5a8a3c';
    document.getElementById('tab-map').style.color = '#3d6b24';
    document.getElementById('tab-map').style.fontWeight = '500';
    document.getElementById('tab-hearing').style.borderBottomColor = 'transparent';
    document.getElementById('tab-hearing').style.color = '#999';
    document.getElementById('tab-hearing').style.fontWeight = '400';
    if (document.getElementById('hearing-float-btn')) document.getElementById('hearing-float-btn').style.display = 'flex';
    if (document.getElementById('reset-float-btn')) document.getElementById('reset-float-btn').style.display = 'flex';
  } else {
    document.getElementById('map-view').style.display = 'none';
    document.getElementById('hearing-view').style.display = '';
    var plView = document.getElementById('project-list-view');
    if (plView) plView.style.display = 'none';
    document.getElementById('tab-hearing').style.borderBottomColor = '#5a8a3c';
    document.getElementById('tab-hearing').style.color = '#3d6b24';
    document.getElementById('tab-hearing').style.fontWeight = '500';
    document.getElementById('tab-map').style.borderBottomColor = 'transparent';
    document.getElementById('tab-map').style.color = '#999';
    document.getElementById('tab-map').style.fontWeight = '400';
    if (document.getElementById('hearing-float-btn')) document.getElementById('hearing-float-btn').style.display = 'none';
    if (document.getElementById('reset-float-btn')) document.getElementById('reset-float-btn').style.display = 'none';
    var gb2 = document.querySelector('.guide-bubble');
    if (gb2) gb2.style.display = 'none';
    var gpf2 = document.querySelectorAll('.guide-pulse-fixed');
    gpf2.forEach(function(el) { el.style.display = 'none'; });
    if (typeof autoStartHearing === 'function') autoStartHearing();
  }
}

// ===== V4: Project List View =====
var projectsData = [];

async function loadProjectsData() {
  try {
    var response = await fetch('data/projects.json?v=20260514v4');
    projectsData = await response.json();
    renderProjectList();
    setupProjectListFilters();
  } catch (e) {
    console.error('Failed to load projects.json:', e);
  }
}

// ===== V4 Project List Filter & Search =====
var plFilters = { status: 'すべて', type: 'すべて', area: 'すべて', search: '' };

function applyProjectListFilters() {
  return projectsData.filter(function(p) {
    if (plFilters.status !== 'すべて' && p.status !== plFilters.status) return false;
    if (plFilters.type !== 'すべて' && p.type !== plFilters.type) return false;
    if (plFilters.area !== 'すべて') {
      if (plFilters.area === '仙台市内' && p.location.indexOf('仙台市') < 0) return false;
      if (plFilters.area === '宮城県内' && p.location.indexOf('宮城県') < 0 && p.location.indexOf('仙台市') < 0) return false;
      if (plFilters.area === '山形県' && p.location.indexOf('山形県') < 0) return false;
      if (plFilters.area === '福島県' && p.location.indexOf('福島県') < 0) return false;
    }
    if (plFilters.search) {
      var s = plFilters.search.toLowerCase();
      if (p.name.toLowerCase().indexOf(s) < 0 && p.id.toLowerCase().indexOf(s) < 0) return false;
    }
    return true;
  });
}

function setupProjectListFilters() {
  var selects = document.querySelectorAll('.pl-filter-select');
  if (selects.length >= 3) {
    selects[0].addEventListener('change', function() { plFilters.status = this.value; renderProjectList(); });
    selects[1].addEventListener('change', function() { plFilters.type = this.value; renderProjectList(); });
    selects[2].addEventListener('change', function() { plFilters.area = this.value; renderProjectList(); });
  }
  var search = document.querySelector('.pl-search');
  if (search) {
    search.addEventListener('input', function() { plFilters.search = this.value; renderProjectList(); });
  }
}

function renderProjectList() {
  var tbody = document.getElementById('pl-table-body');
  if (!tbody) return;
  var filtered = applyProjectListFilters();
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:#999;font-size:12px">条件に合致する案件がありません</td></tr>';
    return;
  }
  var html = '';
  filtered.forEach(function(p) {
    var rowClass = p.selected ? 'pl-row-highlight' : '';
    var statusClass = 'pl-status-active';
    if (p.status === '基本設計' || p.status === '実施設計') statusClass = 'pl-status-design';
    else if (p.status === '再見積中' || p.status === '施工図確認') statusClass = 'pl-status-revise';
    else if (p.status === '着工済み') statusClass = 'pl-status-started';

    var highlightTag = p.highlight ? '<span class="pl-row-highlight-tag">' + p.highlight + '</span>' : '';
    var scaleText = p.units ? p.units + '戸' : (p.floorArea ? p.floorArea.toLocaleString() + 'm²' : '—');

    html += '<tr class="' + rowClass + '" onclick="selectProject(\'' + p.id + '\')">';
    html += '<td><span class="pl-row-id">' + p.id + '</span></td>';
    html += '<td><span class="pl-status ' + statusClass + '">' + p.status + '</span></td>';
    html += '<td><span class="pl-row-name">' + p.name + '</span>' + highlightTag + '</td>';
    html += '<td>' + p.type + '</td>';
    html += '<td>' + p.location + '</td>';
    html += '<td>' + scaleText + '</td>';
    html += '<td>' + p.scheduledStart + '</td>';
    html += '<td>' + p.manager + '</td>';
    html += '</tr>';
  });
  tbody.innerHTML = html;
}

function selectProject(projectId) {
  showProjectDetailView(projectId);
}

function togglePdCard(cardId) {
  var el = document.getElementById('pd-expand-' + cardId);
  if (!el) return;
  if (el.style.display === 'none' || !el.style.display) {
    el.style.display = 'block';
    if (cardId === 'schedule') {
      renderPdGanttChart();
      renderPdBudgetChart();
    }
    if (cardId === 'resource') {
      renderPdResourceBars();
    }
  } else {
    el.style.display = 'none';
  }
}

function renderPdGanttChart() {
  var container = document.getElementById('pd-gantt-chart');
  if (!container || container.dataset.rendered) return;
  var phases = [
    { name: '準備工事', start: 0, duration: 1 },
    { name: '基礎工事', start: 1, duration: 3 },
    { name: '躯体工事', start: 3, duration: 4 },
    { name: '外装工事', start: 6, duration: 3 },
    { name: '内装工事', start: 8, duration: 3 },
    { name: '検査・引渡し', start: 11, duration: 1 }
  ];
  var totalMonths = 12;
  var html = '';
  phases.forEach(function(p) {
    var leftPct = (p.start / totalMonths) * 100;
    var widthPct = (p.duration / totalMonths) * 100;
    html += '<div class="pd-gantt-row">';
    html += '<div class="pd-gantt-label">' + p.name + '</div>';
    html += '<div class="pd-gantt-bar-wrap"><div class="pd-gantt-bar" style="left:' + leftPct + '%;width:' + widthPct + '%"></div></div>';
    html += '</div>';
  });
  html += '<div class="pd-gantt-axis"><span>着工</span><span>3M</span><span>6M</span><span>9M</span><span>竣工</span></div>';
  container.innerHTML = html;
  container.dataset.rendered = 'true';
}

function renderPdBudgetChart() {
  var container = document.getElementById('pd-budget-chart');
  if (!container || container.dataset.rendered) return;
  var monthly = [3, 6, 12, 18, 24, 32, 42, 56, 68, 80, 92, 100];
  var html = '';
  monthly.forEach(function(v, i) {
    var prev = i === 0 ? 0 : monthly[i-1];
    var monthly_share = v - prev;
    html += '<div class="pd-budget-bar" style="height:' + (monthly_share * 4) + '%" title="' + (i+1) + 'ヶ月目: 累計 ' + v + '%"></div>';
  });
  container.innerHTML = html;
  var labelsContainer = document.createElement('div');
  labelsContainer.className = 'pd-budget-labels';
  labelsContainer.innerHTML = '<span>1M</span><span></span><span></span><span></span><span>6M</span><span></span><span></span><span></span><span></span><span></span><span></span><span>12M</span>';
  container.parentNode.insertBefore(labelsContainer, container.nextSibling);
  container.dataset.rendered = 'true';
}

function renderPdResourceBars() {
  var container = document.getElementById('pd-resource-bars');
  if (!container || container.dataset.rendered) return;
  var resources = [
    { name: '鉄筋工', value: 480, max: 600 },
    { name: '型枠工', value: 360, max: 600 },
    { name: '左官工', value: 180, max: 600 },
    { name: '鳶工', value: 220, max: 600 },
    { name: '電工', value: 240, max: 600 },
    { name: '設備工', value: 200, max: 600 },
    { name: '内装工', value: 160, max: 600 }
  ];
  var html = '';
  resources.forEach(function(r) {
    var widthPct = (r.value / r.max) * 100;
    html += '<div class="pd-resource-bar-row">';
    html += '<div class="pd-resource-bar-label">' + r.name + '</div>';
    html += '<div class="pd-resource-bar-wrap"><div class="pd-resource-bar" style="width:' + widthPct + '%"></div></div>';
    html += '<div class="pd-resource-bar-value">' + r.value + ' 人工</div>';
    html += '</div>';
  });
  container.innerHTML = html;
  container.dataset.rendered = 'true';
}

function showProjectDetailView(projectId) {
  var project = projectsData.find(function(p) { return p.id === projectId; });
  if (!project) return;
  window.selectedProject = project;
  document.getElementById('project-list-view').style.display = 'none';
  document.getElementById('project-detail-view').style.display = 'block';
  updateScenarioGuide(1, '案件詳細の確認', '建物概要・工程予算・必要リソースを確認後、「調達計画の分析を開始」で次のステップへ進みます。');
  document.getElementById('pd-id').textContent = project.id;
  document.getElementById('pd-project-name').textContent = project.name;
  document.getElementById('pd-project-location').textContent = project.location;
  document.getElementById('pd-type').textContent = project.type;
  document.getElementById('pd-owner').textContent = project.owner ? project.owner + ' 様' : '—';
  document.getElementById('pd-brand').textContent = project.brand || '—';
  document.getElementById('pd-structure').textContent = project.structure;
  document.getElementById('pd-units').textContent = project.units ? project.units + ' 戸' : '—';
  document.getElementById('pd-floor-area').textContent = project.floorArea ? project.floorArea.toLocaleString() + ' m²' : '—';
  document.getElementById('pd-start').textContent = project.scheduledStart;
  document.getElementById('pd-end').textContent = project.scheduledEnd;
  var startDate = new Date(project.scheduledStart);
  var endDate = new Date(project.scheduledEnd);
  var months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  document.getElementById('pd-duration').textContent = months + ' ヶ月';
  document.getElementById('pd-budget').textContent = '¥' + (project.budget / 1000000).toFixed(0) + 'M';
  var badge = document.getElementById('pd-status-badge');
  badge.textContent = project.status;
  badge.className = 'pl-status';
  if (project.status === '基本設計') badge.className += ' pl-status-design';
  else if (project.status === '再見積中') badge.className += ' pl-status-revise';
  else if (project.status === '着工済み') badge.className += ' pl-status-started';
  else badge.className += ' pl-status-active';

  // デモ対象（PRJ002）以外の場合、分析開始ボタンを無効化してデモ移動ボタンを表示
  var startBtn = document.getElementById('pd-start-analysis-btn');
  var gotoBtn = document.getElementById('pd-goto-demo-btn');
  var actionNote = document.getElementById('pd-action-note');
  if (project.id === 'PRJ002') {
    if (startBtn) { startBtn.style.display = 'inline-block'; startBtn.disabled = false; }
    if (gotoBtn) gotoBtn.style.display = 'none';
    if (actionNote) actionNote.textContent = '業界横断データを用いて、リソース需給状況を地理空間上で分析します';
  } else {
    if (startBtn) startBtn.style.display = 'none';
    if (gotoBtn) gotoBtn.style.display = 'inline-block';
    if (actionNote) actionNote.textContent = '本デモではPRJ002（D-room泉区紫山新築計画）を対象としています';
  }
}

function gotoDemoProject() {
  showProjectDetailView('PRJ002');
}

function backToProjectList() {
  document.getElementById('project-detail-view').style.display = 'none';
  document.getElementById('project-list-view').style.display = 'block';
}

function startResourceAnalysis() {
  document.getElementById('project-detail-view').style.display = 'none';
  document.getElementById('analysis-loading-overlay').style.display = 'block';
  startAnalysisLoadingAnimation();
}

function updateScenarioGuide(stepNum, title, desc) {
  var guide = document.getElementById('app-tabs');
  if (!guide) return;
  guide.style.display = 'flex';
  guide.className = 'app-scenario-guide';
  document.getElementById('asg-step-num').textContent = stepNum;
  document.getElementById('asg-step-title').textContent = title;
  document.getElementById('asg-step-desc').textContent = desc;
}

function hideScenarioGuide() {
  var guide = document.getElementById('app-tabs');
  if (!guide) return;
  guide.style.display = 'none';
}

function showProjectListView() {
  var landingScreen = document.getElementById('landing-screen') || document.getElementById('screen-0') || document.getElementById('screen0');
  if (landingScreen) landingScreen.style.display = 'none';

  var mapView = document.getElementById('map-view');
  if (mapView) mapView.style.display = 'none';

  var hearingView = document.getElementById('hearing-view');
  if (hearingView) hearingView.style.display = 'none';

  var plView = document.getElementById('project-list-view');
  if (plView) plView.style.display = 'block';

  updateScenarioGuide(1, '案件選択', '本デモで分析する案件を選択します。デモ対象はPRJ002（D-room泉区紫山新築計画）です。');
}

// ===== V4 Scene 2: Supply Demand Data =====

var V4_PROJECT_CENTER = [38.315, 140.88]; // 仙台市泉区紫山周辺
var currentRouteLayer = null;

// ===== V4 Map v2: Geo-based Supply Area Visualization =====

// GeoJSONデータキャッシュ
var japanGeoJSON = null;

// 現在表示中のレイヤー
var currentLayerType = 'equipment';

// Leafletレイヤー参照
var municipalityLayer = null;
var supplyAreaCircle = null;
var vendorPinsLayer = null;

// レイヤー別の地図表示設定
var layerViewSettings = {
  craftsmen: { center: [38.31, 140.88], zoom: 9, label: '東北100km圏' },
  equipment: { center: [38.31, 140.88], zoom: 10, label: '仙台市内30km圏' },
  concrete:  { center: [38.315, 140.88], zoom: 11, label: '仙台市内20km圏' },
  steel:     { center: [37.5, 140.0],   zoom: 7,  label: '関東圏まで' },
  competing: { center: [38.31, 140.88], zoom: 9, label: '東北100km圏' }
};

// レイヤー別の説明テキスト
var layerDescriptions = {
  craftsmen: '職人需給：東北全域から応援職人を調達可能（100km圏）',
  equipment: '重機需給：仙台市内および近隣市から調達（30km圏）',
  concrete:  '生コン供給：仙台市内および近隣市から調達（20km圏、90分運搬制約）',
  steel:     '鋼材調達：東北圏内および関東圏から調達可能',
  competing: '競合案件：東北100km圏内の他社案件動向'
};

// 後続バッチで実装する関数のスケルトン
// 使用する都道府県コードと県名
var GEOJSON_PREFS = [
  { code: '03', name: '岩手県' },
  { code: '04', name: '宮城県' },
  { code: '06', name: '山形県' },
  { code: '07', name: '福島県' },
  { code: '08', name: '茨城県' },
  { code: '10', name: '群馬県' },
  { code: '11', name: '埼玉県' },
  { code: '12', name: '千葉県' }
];

// デモで使う市区町村名のホワイトリスト
var TARGET_MUNICIPALITIES = [
  '仙台市青葉区', '仙台市泉区', '仙台市太白区', '仙台市若林区', '仙台市宮城野区',
  '多賀城市', '塩竈市', '名取市', '富谷市', '利府町', '岩沼市', '七ヶ浜町', '松島町',
  '大和町', '大郷町', '大衡村', '色麻町', '加美町', '大崎市', '美里町', '涌谷町',
  '蔵王町', '川崎町', '村田町', '柴田町', '大河原町', '角田市', '白石市',
  '亘理町', '山元町', '東松島市', '石巻市', '女川町', '南三陸町', '気仙沼市',
  '登米市', '栗原市',
  '山形市', '上山市', '天童市', '東根市', '寒河江市', '米沢市', '南陽市',
  '高畠町', '川西町', '尾花沢市', '村山市', '新庄市',
  '福島市', '二本松市', '伊達市', '本宮市', '郡山市', '須賀川市',
  '相馬市', '南相馬市',
  '一関市', '奥州市', '北上市', '花巻市', '陸前高田市'
];

// 市区町村ポリゴンデータ（GeoJSONから動的にロード）
var municipalityPolygons = {};  // key: 市区町村名, value: GeoJSON Feature

async function loadJapanGeoJSON() {
  if (Object.keys(municipalityPolygons).length > 0) return municipalityPolygons;

  var fetchPromises = GEOJSON_PREFS.map(function(pref) {
    var url = 'https://cdn.jsdelivr.net/gh/smartnews-smri/japan-topography@main/data/municipality/geojson/s0010/N03-21_' + pref.code + '_210101.json';
    return fetch(url)
      .then(function(r) { return r.json(); })
      .catch(function(e) { console.warn('Failed to load ' + pref.name + ':', e); return null; });
  });

  try {
    var allGeoJSONs = await Promise.all(fetchPromises);
    var pendingAggregation = {};
    allGeoJSONs.forEach(function(geojson) {
      if (!geojson || !geojson.features) return;
      geojson.features.forEach(function(feature) {
        var props = feature.properties || {};
        var muniName = props.N03_004 || props.name || '';
        var cityName = props.N03_003;
        var fullName;
        if (cityName && cityName.endsWith('市') && muniName && muniName.endsWith('区')) {
          if (cityName === '仙台市') {
            fullName = cityName + muniName;
            if (TARGET_MUNICIPALITIES.indexOf(fullName) >= 0) {
              municipalityPolygons[fullName] = feature;
            }
          } else {
            if (TARGET_MUNICIPALITIES.indexOf(cityName) >= 0) {
              if (!pendingAggregation[cityName]) {
                pendingAggregation[cityName] = [];
              }
              pendingAggregation[cityName].push(feature);
            }
          }
        } else {
          fullName = muniName;
          if (TARGET_MUNICIPALITIES.indexOf(fullName) >= 0) {
            municipalityPolygons[fullName] = feature;
          }
        }
      });
    });
    Object.keys(pendingAggregation).forEach(function(cityName) {
      var features = pendingAggregation[cityName];
      municipalityPolygons[cityName] = {
        type: 'FeatureCollection',
        features: features
      };
    });
    console.log('GeoJSON loaded:', Object.keys(municipalityPolygons).length, 'municipalities');
    return municipalityPolygons;
  } catch (e) {
    console.error('Failed to load GeoJSON:', e);
    return {};
  }
}

// レイヤー別市区町村データ。各レイヤーで表示する市区町村と、その需給状況を定義。
var layerMunicipalityData = {
  craftsmen: {
    '仙台市青葉区':  { status: 'tight-high', balance: -28, supply: 18, demand: 25, hotspot: '仙台地下鉄延伸工事', canSupply: true },
    '仙台市泉区':    { status: 'tight-high', balance: -22, supply: 14, demand: 18, isProject: true, canSupply: true },
    '仙台市太白区':  { status: 'tight-medium', balance: -14, supply: 24, demand: 28, canSupply: true },
    '仙台市若林区':  { status: 'tight-medium', balance: -12, supply: 21, demand: 24, canSupply: true },
    '仙台市宮城野区':{ status: 'tight-high', balance: -20, supply: 16, demand: 20, canSupply: true },
    '多賀城市':      { status: 'tight-medium', balance: -8, supply: 9, demand: 10, canSupply: true },
    '塩竈市':        { status: 'balanced', balance: -4, supply: 7, demand: 7, canSupply: true },
    '名取市':        { status: 'tight-medium', balance: -10, supply: 12, demand: 14, canSupply: true },
    '富谷市':        { status: 'balanced', balance: -2, supply: 11, demand: 11, canSupply: true },
    '利府町':        { status: 'balanced', balance: -3, supply: 6, demand: 6, canSupply: true },
    '岩沼市':        { status: 'balanced', balance: -4, supply: 8, demand: 9, canSupply: true },
    '七ヶ浜町':      { status: 'balanced', balance: -2, supply: 4, demand: 4, canSupply: true },
    '松島町':        { status: 'balanced', balance: 0, supply: 5, demand: 5, canSupply: true },
    '大和町':        { status: 'balanced', balance: -3, supply: 7, demand: 7, canSupply: true },
    '大郷町':        { status: 'balanced', balance: 1, supply: 4, demand: 4, canSupply: true },
    '大衡村':        { status: 'balanced', balance: 2, supply: 3, demand: 3, canSupply: true },
    '色麻町':        { status: 'balanced', balance: 1, supply: 3, demand: 3, canSupply: true },
    '加美町':        { status: 'balanced', balance: -2, supply: 5, demand: 5, canSupply: true },
    '大崎市':        { status: 'balanced', balance: -5, supply: 22, demand: 23, canSupply: true },
    '美里町':        { status: 'balanced', balance: 0, supply: 5, demand: 5, canSupply: true },
    '涌谷町':        { status: 'balanced', balance: -1, supply: 4, demand: 4, canSupply: true },
    '蔵王町':        { status: 'balanced', balance: 0, supply: 4, demand: 4, canSupply: true },
    '川崎町':        { status: 'balanced', balance: -1, supply: 3, demand: 3, canSupply: true },
    '村田町':        { status: 'balanced', balance: 0, supply: 4, demand: 4, canSupply: true },
    '柴田町':        { status: 'balanced', balance: -2, supply: 6, demand: 6, canSupply: true },
    '大河原町':      { status: 'balanced', balance: -1, supply: 5, demand: 5, canSupply: true },
    '角田市':        { status: 'balanced', balance: -3, supply: 6, demand: 6, canSupply: true },
    '白石市':        { status: 'balanced', balance: -2, supply: 7, demand: 7, canSupply: true },
    '亘理町':        { status: 'balanced', balance: -2, supply: 5, demand: 5, canSupply: true },
    '山元町':        { status: 'balanced', balance: 0, supply: 3, demand: 3, canSupply: true },
    '東松島市':      { status: 'tight-medium', balance: -8, supply: 7, demand: 8, canSupply: true },
    '石巻市':        { status: 'tight-high', balance: -28, supply: 11, demand: 16, hotspot: '石巻港湾施設災害復旧', canSupply: true },
    '女川町':        { status: 'tight-medium', balance: -10, supply: 3, demand: 3, canSupply: true },
    '南三陸町':      { status: 'tight-medium', balance: -9, supply: 4, demand: 4, canSupply: true },
    '気仙沼市':      { status: 'tight-medium', balance: -13, supply: 9, demand: 10, canSupply: true },
    '登米市':        { status: 'balanced', balance: -3, supply: 11, demand: 11, canSupply: true },
    '栗原市':        { status: 'balanced', balance: -2, supply: 10, demand: 10, canSupply: true },
    '山形市':        { status: 'surplus', balance: 12, supply: 32, demand: 28, canSupply: true },
    '上山市':        { status: 'surplus', balance: 8, supply: 14, demand: 13, canSupply: true },
    '天童市':        { status: 'surplus', balance: 9, supply: 12, demand: 11, canSupply: true },
    '東根市':        { status: 'surplus', balance: 7, supply: 10, demand: 9, canSupply: true },
    '寒河江市':      { status: 'balanced', balance: 4, supply: 8, demand: 8, canSupply: true },
    '米沢市':        { status: 'surplus', balance: 20, supply: 28, demand: 22, canSupply: true },
    '南陽市':        { status: 'surplus', balance: 14, supply: 11, demand: 9, canSupply: true },
    '高畠町':        { status: 'surplus', balance: 8, supply: 6, demand: 5, canSupply: true },
    '川西町':        { status: 'balanced', balance: 5, supply: 5, demand: 5, canSupply: true },
    '尾花沢市':      { status: 'balanced', balance: 3, supply: 6, demand: 6, canSupply: true },
    '村山市':        { status: 'balanced', balance: 2, supply: 7, demand: 7, canSupply: true },
    '新庄市':        { status: 'balanced', balance: 1, supply: 9, demand: 9, canSupply: true },
    '福島市':        { status: 'tight-high', balance: -24, supply: 26, demand: 34, hotspot: '福島県庁更新工事', canSupply: true },
    '二本松市':      { status: 'tight-medium', balance: -8, supply: 13, demand: 14, canSupply: true },
    '伊達市':        { status: 'tight-medium', balance: -7, supply: 11, demand: 12, canSupply: true },
    '本宮市':        { status: 'balanced', balance: -4, supply: 8, demand: 8, canSupply: true },
    '郡山市':        { status: 'tight-medium', balance: -10, supply: 35, demand: 39, canSupply: true },
    '須賀川市':      { status: 'tight-medium', balance: -7, supply: 13, demand: 14, canSupply: true },
    '相馬市':        { status: 'tight-medium', balance: -6, supply: 8, demand: 9, canSupply: true },
    '南相馬市':      { status: 'tight-medium', balance: -8, supply: 10, demand: 11, canSupply: true },
    '一関市':        { status: 'balanced', balance: -3, supply: 14, demand: 15, canSupply: true },
    '奥州市':        { status: 'balanced', balance: -2, supply: 13, demand: 13, canSupply: true },
    '北上市':        { status: 'surplus', balance: 10, supply: 25, demand: 22, canSupply: true },
    '花巻市':        { status: 'balanced', balance: 4, supply: 16, demand: 15, canSupply: true },
    '陸前高田市':    { status: 'tight-medium', balance: -8, supply: 4, demand: 5, canSupply: true }
  },
  equipment: {
    '仙台市青葉区':  { status: 'tight-high', balance: -28, supply: 8, demand: 11, canSupply: true },
    '仙台市泉区':    { status: 'tight-high', balance: -20, supply: 6, demand: 8, isProject: true, canSupply: true },
    '仙台市太白区':  { status: 'tight-medium', balance: -10, supply: 10, demand: 11, canSupply: true },
    '仙台市若林区':  { status: 'tight-medium', balance: -8, supply: 11, demand: 12, canSupply: true },
    '仙台市宮城野区':{ status: 'tight-high', balance: -18, supply: 7, demand: 9, canSupply: true },
    '多賀城市':      { status: 'surplus', balance: 8, supply: 14, demand: 13, canSupply: true },
    '塩竈市':        { status: 'balanced', balance: 2, supply: 6, demand: 6, canSupply: true },
    '名取市':        { status: 'balanced', balance: -3, supply: 12, demand: 12, canSupply: true },
    '富谷市':        { status: 'surplus', balance: 15, supply: 10, demand: 8, canSupply: true },
    '利府町':        { status: 'surplus', balance: 12, supply: 8, demand: 7, canSupply: true },
    '岩沼市':        { status: 'balanced', balance: -1, supply: 9, demand: 9, canSupply: true },
    '七ヶ浜町':      { status: 'balanced', balance: 4, supply: 5, demand: 5, canSupply: true },
    '松島町':        { status: 'surplus', balance: 10, supply: 6, demand: 5, canSupply: true },
    '大和町':        { status: 'balanced', balance: 5, supply: 7, demand: 7, canSupply: true },
    '柴田町':        { status: 'balanced', balance: 2, supply: 6, demand: 6, canSupply: true }
  },
  concrete: {
    '仙台市青葉区':  { status: 'tight-high', balance: -32, supply: 2, demand: 5, canSupply: true },
    '仙台市泉区':    { status: 'tight-high', balance: -25, supply: 1, demand: 2, isProject: true, canSupply: true },
    '仙台市太白区':  { status: 'tight-medium', balance: -12, supply: 3, demand: 4, canSupply: true },
    '仙台市若林区':  { status: 'balanced', balance: -2, supply: 4, demand: 4, canSupply: true },
    '仙台市宮城野区':{ status: 'balanced', balance: -3, supply: 4, demand: 4, canSupply: true },
    '多賀城市':      { status: 'surplus', balance: 10, supply: 5, demand: 4, canSupply: true },
    '塩竈市':        { status: 'surplus', balance: 12, supply: 4, demand: 3, canSupply: true },
    '名取市':        { status: 'surplus', balance: 12, supply: 4, demand: 3, canSupply: true },
    '七ヶ浜町':      { status: 'surplus', balance: 8, supply: 3, demand: 3, canSupply: true },
    '利府町':        { status: 'surplus', balance: 9, supply: 3, demand: 3, canSupply: true }
  },
  steel: {
    '仙台市青葉区':  { status: 'tight-medium', balance: -10, supply: 3, demand: 4, isProject: true },
    '仙台市宮城野区':{ status: 'tight-medium', balance: -8, supply: 2, demand: 3 },
    '福島市':        { status: 'tight-medium', balance: -7, supply: 4, demand: 5 },
    '郡山市':        { status: 'tight-medium', balance: -6, supply: 5, demand: 6 },
    'いわき市':      { status: 'balanced', balance: -3, supply: 6, demand: 6, canSupply: true },
    '水戸市':        { status: 'balanced', balance: 2, supply: 5, demand: 5, canSupply: true },
    'つくば市':      { status: 'surplus', balance: 12, supply: 7, demand: 6, canSupply: true },
    '日立市':        { status: 'surplus', balance: 10, supply: 6, demand: 5, canSupply: true },
    '川口市':        { status: 'surplus', balance: 18, supply: 14, demand: 10, canSupply: true },
    'さいたま市':    { status: 'surplus', balance: 16, supply: 12, demand: 9, canSupply: true },
    '千葉市':        { status: 'surplus', balance: 22, supply: 16, demand: 11, canSupply: true },
    '市川市':        { status: 'surplus', balance: 20, supply: 11, demand: 8, canSupply: true },
    '高崎市':        { status: 'surplus', balance: 14, supply: 9, demand: 7, canSupply: true }
  },
  competing: {
    '仙台市青葉区':  { status: 'tight-high', balance: -28, supply: 0, demand: 8, competingProjects: ['仙台地下鉄延伸工事', '仙台駅東口再開発', '青葉通り商業ビル建替'] },
    '仙台市泉区':    { status: 'tight-medium', balance: -10, supply: 0, demand: 3, isProject: true, competingProjects: ['泉中央サイト再開発', '富谷リテール物流センター'] },
    '仙台市宮城野区':{ status: 'tight-high', balance: -18, supply: 0, demand: 5, competingProjects: ['仙台港コンテナターミナル増設', '仙台駅東口集合住宅2件'] },
    '仙台市太白区':  { status: 'tight-medium', balance: -8, supply: 0, demand: 3, competingProjects: ['長町メディカルセンター', '太白区民間案件'] },
    '仙台市若林区':  { status: 'balanced', balance: -3, supply: 0, demand: 1 },
    '多賀城市':      { status: 'balanced', balance: -2, supply: 0, demand: 1 },
    '塩竈市':        { status: 'balanced', balance: 0, supply: 0, demand: 0 },
    '名取市':        { status: 'balanced', balance: -1, supply: 0, demand: 1 },
    '富谷市':        { status: 'surplus', balance: 5, supply: 0, demand: 0, canSupply: true },
    '石巻市':        { status: 'tight-high', balance: -25, supply: 0, demand: 7, competingProjects: ['石巻港湾施設災害復旧', '東日本大震災メンテナンス工事'] },
    '福島市':        { status: 'tight-high', balance: -22, supply: 0, demand: 6, competingProjects: ['福島県庁更新工事', '福島駅前再開発', '原発廃炉関連'] },
    '郡山市':        { status: 'tight-medium', balance: -8, supply: 0, demand: 4, competingProjects: ['郡山駅前広場整備', '郡山ロジスティクスセンター'] },
    '山形市':        { status: 'balanced', balance: 0, supply: 0, demand: 0 },
    '大崎市':        { status: 'balanced', balance: -2, supply: 0, demand: 1 }
  }
};

// ===== V4 Vendor Pin Data (番地レベル) =====
var vendorPinsData = {
  craftsmen: [
    { name: '仙台中央建設', addr: '宮城県仙台市青葉区中央4-3-1', coords: [38.260, 140.882], distance: 6.1, status: 'available', capacity: '鉄筋工8名・型枠工6名', utilization: 72, cost: 0 },
    { name: '泉区建設工業', addr: '宮城県仙台市泉区南光台3-12-5', coords: [38.327, 140.895], distance: 1.9, status: 'available', capacity: '型枠工7名・大工4名', utilization: 65, cost: 0 },
    { name: '宮城野建築工房', addr: '宮城県仙台市宮城野区福室3-2-5', coords: [38.286, 141.001], distance: 11.0, status: 'available', capacity: '内装大工10名', utilization: 58, cost: 0 },
    { name: '若林職人組合', addr: '宮城県仙台市若林区大和町5-7-2', coords: [38.251, 140.918], distance: 8.0, status: 'available', capacity: '左官・タイル工15名', utilization: 70, cost: 0 },
    { name: '太白建設', addr: '宮城県仙台市太白区長町8-3-1', coords: [38.226, 140.866], distance: 9.9, status: 'limited', capacity: '鉄筋工4名（半月制限）', utilization: 88, cost: 0 },
    { name: '東北建設工業', addr: '宮城県多賀城市中央2-8-3', coords: [38.301, 141.005], distance: 11.0, status: 'available', capacity: '型枠工5名・鉄筋工4名', utilization: 60, cost: 0 },
    { name: '塩竈協同建設', addr: '宮城県塩竈市港町2-15-4', coords: [38.317, 141.022], distance: 12.4, status: 'available', capacity: '大工8名', utilization: 55, cost: 0 },
    { name: '名取住宅建設', addr: '宮城県名取市増田字幾世橋8-5', coords: [38.169, 140.892], distance: 16.3, status: 'available', capacity: '鉄筋工6名・大工5名', utilization: 62, cost: 0 },
    { name: '岩沼建工', addr: '宮城県岩沼市本町1-2-3', coords: [38.103, 140.866], distance: 23.6, status: 'available', capacity: '型枠工4名', utilization: 50, cost: 0 },
    { name: '富谷建築サービス', addr: '宮城県富谷市富谷新町下7-1', coords: [38.408, 140.882], distance: 10.4, status: 'available', capacity: '大工6名・内装3名', utilization: 68, cost: 0 },
    { name: '利府住建', addr: '宮城県利府町中央2-8-1', coords: [38.330, 141.027], distance: 12.9, status: 'available', capacity: '鉄筋工5名', utilization: 75, cost: 0 },
    { name: '大和町建築組合', addr: '宮城県大和町吉岡まほろば1-1-1', coords: [38.434, 140.881], distance: 13.2, status: 'available', capacity: '大工7名', utilization: 60, cost: 0 },
    { name: '石巻復興建設', addr: '宮城県石巻市中央2-6-9', coords: [38.434, 141.302], distance: 38.9, status: 'limited', capacity: '鉄筋工4名（復興案件優先）', utilization: 92, cost: 0 },
    { name: '気仙沼大工組合', addr: '宮城県気仙沼市八日町1-5-3', coords: [38.908, 141.570], distance: 88.3, status: 'limited', capacity: '大工6名（応援可）', utilization: 80, cost: 0 },
    { name: '一関建設工業', addr: '岩手県一関市山目字前田', coords: [38.937, 141.123], distance: 73.9, status: 'available', capacity: '鉄筋工8名・型枠工5名', utilization: 50, cost: 0 },
    { name: '北上鉄筋工業', addr: '岩手県北上市相去町3-21-8', coords: [39.281, 141.135], distance: 113.4, status: 'available', capacity: '鉄筋工8名', utilization: 55, cost: 0 },
    { name: '山形北鉄筋工業', addr: '山形県山形市あこや町2-12-15', coords: [38.236, 140.358], distance: 47.5, status: 'available', capacity: '鉄筋工6名', utilization: 60, cost: 0 },
    { name: '米沢建設', addr: '山形県米沢市中央4-3-21', coords: [37.918, 140.119], distance: 79.1, status: 'limited', capacity: '鉄筋工3名（一部期間）', utilization: 85, cost: 0 },
    { name: '福島建工', addr: '福島県福島市曽根田町', coords: [37.755, 140.467], distance: 73.0, status: 'available', capacity: '型枠工7名・鉄筋工5名', utilization: 58, cost: 0 },
    { name: '郡山建設', addr: '福島県郡山市待池台3-21-8', coords: [37.412, 140.391], distance: 109.9, status: 'available', capacity: '大工10名', utilization: 65, cost: 0 }
  ],
  equipment: [
    { name: '仙台クレーン工業', addr: '宮城県仙台市青葉区荒巻本沢2-12-3', coords: [38.275, 140.842], distance: 5.7, status: 'available', capacity: '50tクローラークレーン1台、25t油圧クレーン2台', utilization: 60, cost: 320000 },
    { name: '泉区建機センター', addr: '宮城県仙台市泉区南中山1-31', coords: [38.353, 140.834], distance: 5.6, status: 'available', capacity: '30tクレーン1台、ユンボ3台', utilization: 65, cost: 180000 },
    { name: '宮城野重機リース', addr: '宮城県仙台市宮城野区扇町5-3-3', coords: [38.273, 140.961], distance: 8.2, status: 'limited', capacity: '50tクレーン1台（地下鉄工事で予約多数）', utilization: 92, cost: 480000 },
    { name: '東北建機リース塩竈', addr: '宮城県塩竈市港町2-15-4', coords: [38.317, 141.022], distance: 12.4, status: 'limited', capacity: '25tクレーン1台（5月以降）', utilization: 88, cost: 340000 },
    { name: '多賀城建機センター', addr: '宮城県多賀城市八幡4-2-9', coords: [38.297, 141.005], distance: 10.9, status: 'available', capacity: '30tクレーン・高所作業車各1台', utilization: 70, cost: 290000 },
    { name: '太白重機サービス', addr: '宮城県仙台市太白区長町南3-2-5', coords: [38.220, 140.871], distance: 10.5, status: 'available', capacity: '25tクレーン2台', utilization: 55, cost: 380000 },
    { name: '名取建設機械', addr: '宮城県名取市美田園7-3-1', coords: [38.181, 140.918], distance: 15.8, status: 'available', capacity: 'ユンボ4台、ダンプ3台', utilization: 50, cost: 420000 },
    { name: '岩沼クレーン', addr: '宮城県岩沼市押分字山2-1', coords: [38.103, 140.866], distance: 23.6, status: 'available', capacity: '25tクレーン1台', utilization: 60, cost: 550000 },
    { name: '富谷重機', addr: '宮城県富谷市成田1-3-7', coords: [38.408, 140.875], distance: 10.4, status: 'available', capacity: '50tクレーン1台', utilization: 65, cost: 280000 },
    { name: '大和町建機', addr: '宮城県大和町吉岡まほろば1-2-3', coords: [38.434, 140.881], distance: 13.2, status: 'available', capacity: '30tクレーン1台、ユンボ2台', utilization: 58, cost: 320000 },
    { name: '利府クレーン', addr: '宮城県利府町赤沼1-7', coords: [38.330, 141.027], distance: 12.9, status: 'available', capacity: '50t・25tクレーン各1台', utilization: 62, cost: 310000 },
    { name: '石巻復興建機', addr: '宮城県石巻市湊町2-9-1', coords: [38.434, 141.302], distance: 38.9, status: 'limited', capacity: '50tクレーン（復興案件専従）', utilization: 95, cost: 820000 },
    { name: '一関建機センター', addr: '岩手県一関市山目字前田', coords: [38.937, 141.123], distance: 73.9, status: 'available', capacity: '50tクレーン2台', utilization: 45, cost: 1180000 },
    { name: '北上重機リース', addr: '岩手県北上市相去町3-21-8', coords: [39.281, 141.135], distance: 113.4, status: 'available', capacity: '50tクレーン1台、ユンボ5台', utilization: 50, cost: 1620000 },
    { name: '郡山クレーンサービス', addr: '福島県郡山市待池台3-21-8', coords: [37.412, 140.391], distance: 109.9, status: 'available', capacity: '50tクローラークレーン1台、杭打ち機2台', utilization: 55, cost: 1580000 },
    { name: '福島重機', addr: '福島県福島市鎌田字御仮家', coords: [37.755, 140.467], distance: 73.0, status: 'available', capacity: '30tクレーン2台', utilization: 60, cost: 1120000 },
    { name: '山形建機', addr: '山形県山形市鈴川町1-3-5', coords: [38.236, 140.358], distance: 47.5, status: 'available', capacity: '25tクレーン1台、ユンボ3台', utilization: 50, cost: 880000 },
    { name: '米沢重機リース', addr: '山形県米沢市中央4-3-21', coords: [37.918, 140.119], distance: 79.1, status: 'limited', capacity: '50tクレーン1台（峠越え割増）', utilization: 75, cost: 1320000 }
  ],
  concrete: [
    { name: '仙台青葉生コン工業', addr: '宮城県仙台市青葉区中央4-3-1', coords: [38.269, 140.872], distance: 5.1, status: 'limited', capacity: '優先枠 420m³（公共工事先約）', utilization: 88, cost: 18500 },
    { name: '泉区生コン', addr: '宮城県仙台市泉区八乙女中央1-1', coords: [38.323, 140.901], distance: 2.1, status: 'available', capacity: '日量 200m³ / 工期内累計 500m³', utilization: 60, cost: 17800 },
    { name: '宮城野生コン工業', addr: '宮城県仙台市宮城野区福室3-2-5', coords: [38.286, 141.001], distance: 11.0, status: 'available', capacity: '日量 180m³ / 工期内累計 450m³', utilization: 65, cost: 18900 },
    { name: '若林生コン', addr: '宮城県仙台市若林区六丁の目南町3-7', coords: [38.249, 140.946], distance: 8.9, status: 'available', capacity: '日量 220m³ / 工期内累計 580m³', utilization: 55, cost: 18600 },
    { name: '太白レミコン', addr: '宮城県仙台市太白区長町南3-2-5', coords: [38.220, 140.871], distance: 10.5, status: 'available', capacity: '日量 160m³', utilization: 50, cost: 19200 },
    { name: '名取生コン工業', addr: '宮城県名取市増田字幾世橋8-5', coords: [38.169, 140.892], distance: 16.3, status: 'available', capacity: '日量 180m³ / 工期内累計 450m³', utilization: 58, cost: 19800 },
    { name: '多賀城レミコン', addr: '宮城県多賀城市町前3-7-12', coords: [38.292, 141.005], distance: 10.9, status: 'available', capacity: '日量 150m³ / 工期内累計 380m³', utilization: 62, cost: 18800 },
    { name: '塩竈生コン', addr: '宮城県塩竈市港町2-15-4', coords: [38.317, 141.022], distance: 12.4, status: 'available', capacity: '日量 140m³', utilization: 55, cost: 19400 },
    { name: '富谷生コン', addr: '宮城県富谷市成田5-2-1', coords: [38.408, 140.875], distance: 10.4, status: 'available', capacity: '日量 200m³', utilization: 60, cost: 18400 },
    { name: '岩沼レミコン', addr: '宮城県岩沼市相の原3-1-7', coords: [38.103, 140.866], distance: 23.6, status: 'limited', capacity: '日量 100m³（90分制約で部分対応）', utilization: 80, cost: 21500 },
    { name: '大和町生コン', addr: '宮城県大和町吉岡天皇寺1-5', coords: [38.434, 140.881], distance: 13.2, status: 'available', capacity: '日量 160m³', utilization: 65, cost: 18900 },
    { name: '利府レミコン', addr: '宮城県利府町中央1-2-3', coords: [38.330, 141.027], distance: 12.9, status: 'available', capacity: '日量 140m³', utilization: 60, cost: 19100 }
  ],
  steel: [],
  competing: []
};

function drawVendorPins(layerType) {
  if (vendorPinsLayer) { sdMap.removeLayer(vendorPinsLayer); vendorPinsLayer = null; }
  if (currentRouteLayer) { sdMap.removeLayer(currentRouteLayer); currentRouteLayer = null; }
  var vendors = vendorPinsData[layerType];
  if (!vendors || vendors.length === 0) return;

  vendorPinsLayer = L.layerGroup();
  vendors.forEach(function(v) {
    var distColor;
    if (v.status === 'limited') {
      distColor = '#d6841d';
    } else if (v.distance <= 10) {
      distColor = '#2d5a1a';
    } else if (v.distance <= 30) {
      distColor = '#5a8a3c';
    } else {
      distColor = '#9bb87a';
    }
    var size = v.distance <= 10 ? 18 : v.distance <= 30 ? 15 : 12;
    var pin = L.marker(v.coords, {
      icon: L.divIcon({
        className: 'vendor-pin-icon',
        html: '<div style="width:' + size + 'px;height:' + size + 'px;background:' + distColor + ';border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);position:relative"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:8px;font-weight:bold;line-height:1">' + Math.round(v.distance) + '</div></div>',
        iconSize: [size + 4, size + 4],
        iconAnchor: [(size + 4) / 2, (size + 4) / 2]
      })
    });
    pin.bindTooltip(v.name + '（' + v.distance + 'km）', { direction: 'top' });
    pin.on('click', function() {
      showVendorPopup(v, layerType);
      drawRouteToVendor(v);
    });
    vendorPinsLayer.addLayer(pin);
  });
  vendorPinsLayer.addTo(sdMap);
}

function showVendorPopup(vendor, layerType) {
  var statusLabel = vendor.status === 'available' ? '<span style="color:#3d6b24;font-weight:600">✓ 空きあり</span>' : '<span style="color:#d6841d;font-weight:600">△ 限定的</span>';
  var unitMap = { craftsmen: '', equipment: '円/日', concrete: '円/m³' };
  var unit = unitMap[layerType] || '';
  var distanceInfo = '<span class="vendor-popup-val"><strong>' + vendor.distance + ' km</strong></span>';
  var utilBarColor = vendor.utilization >= 85 ? '#c44a4a' : vendor.utilization >= 70 ? '#d6841d' : '#5a8a3c';
  var utilBar = '<div style="background:#e8e8e8;height:8px;border-radius:4px;overflow:hidden;margin-top:4px"><div style="width:' + vendor.utilization + '%;height:100%;background:' + utilBarColor + '"></div></div>';

  var costRow = '';
  if (vendor.cost && vendor.cost > 0) {
    var costFormatted = vendor.cost.toLocaleString();
    costRow = '<div class="vendor-popup-row"><span class="vendor-popup-key">配送コスト</span><span class="vendor-popup-val"><strong>¥' + costFormatted + '</strong> ' + unit + '</span></div>';
  }

  var aiComment = '';
  if (layerType === 'equipment' && vendor.distance > 30) {
    aiComment = '<div class="vendor-popup-ai"><span class="vendor-popup-ai-icon">🤖</span>距離' + vendor.distance + 'kmは50t重機の長距離輸送費が約' + Math.round(vendor.distance * 1.5) + '万円割増。近隣拠点との比較を推奨。</div>';
  } else if (layerType === 'concrete' && vendor.distance > 15) {
    aiComment = '<div class="vendor-popup-ai"><span class="vendor-popup-ai-icon">🤖</span>距離' + vendor.distance + 'kmは生コン90分制約のリスク領域。打設タイミング・運搬経路の事前調整が必要。</div>';
  } else if (vendor.utilization >= 85) {
    aiComment = '<div class="vendor-popup-ai"><span class="vendor-popup-ai-icon">🤖</span>稼働率' + vendor.utilization + '%は逼迫水準。代替候補の事前確保を推奨。</div>';
  } else if (vendor.distance <= 10) {
    aiComment = '<div class="vendor-popup-ai"><span class="vendor-popup-ai-icon">🤖</span>10km圏内・稼働率' + vendor.utilization + '%。輸送効率・即応性ともに最適候補。</div>';
  }

  var html = '<div class="vendor-popup-content">';
  html += '<div class="vendor-popup-name">' + vendor.name + '</div>';
  html += '<div class="vendor-popup-addr">📍 ' + vendor.addr + '</div>';
  html += '<div class="vendor-popup-row"><span class="vendor-popup-key">現場までの距離</span>' + distanceInfo + '</div>';
  html += costRow;
  html += '<div class="vendor-popup-row"><span class="vendor-popup-key">稼働率</span><span class="vendor-popup-val">' + vendor.utilization + '%</span></div>';
  html += utilBar;
  html += '<div class="vendor-popup-row" style="margin-top:8px"><span class="vendor-popup-key">稼働状況</span>' + statusLabel + '</div>';
  html += '<div class="vendor-popup-row"><span class="vendor-popup-key">提供可能</span><span class="vendor-popup-val">' + vendor.capacity + '</span></div>';
  html += aiComment;
  html += '<div class="vendor-popup-note">業界横断PF経由で即時手配可能。クリックで現場までのルートを地図上に表示中。</div>';
  html += '</div>';

  L.popup({ maxWidth: 340, minWidth: 280 }).setLatLng(vendor.coords).setContent(html).openOn(sdMap);
}

function drawRouteToVendor(vendor) {
  if (currentRouteLayer) { sdMap.removeLayer(currentRouteLayer); currentRouteLayer = null; }
  var siteCoords = V4_PROJECT_CENTER;
  var vendorCoords = vendor.coords;
  var midLat1 = siteCoords[0] + (vendorCoords[0] - siteCoords[0]) * 0.35 + (vendorCoords[1] - siteCoords[1]) * 0.04;
  var midLng1 = siteCoords[1] + (vendorCoords[1] - siteCoords[1]) * 0.35 - (vendorCoords[0] - siteCoords[0]) * 0.04;
  var midLat2 = siteCoords[0] + (vendorCoords[0] - siteCoords[0]) * 0.7 + (vendorCoords[1] - siteCoords[1]) * 0.02;
  var midLng2 = siteCoords[1] + (vendorCoords[1] - siteCoords[1]) * 0.7 - (vendorCoords[0] - siteCoords[0]) * 0.02;
  var routePoints = [siteCoords, [midLat1, midLng1], [midLat2, midLng2], vendorCoords];
  var routeColor = vendor.status === 'limited' ? '#d6841d' : '#2c5d8f';
  var mainLine = L.polyline(routePoints, {
    color: routeColor,
    weight: 4,
    opacity: 0.7,
    smoothFactor: 1.5,
    dashArray: vendor.status === 'limited' ? '8, 6' : null
  });
  var shadowLine = L.polyline(routePoints, {
    color: '#000',
    weight: 7,
    opacity: 0.15,
    smoothFactor: 1.5
  });
  currentRouteLayer = L.layerGroup([shadowLine, mainLine]);
  currentRouteLayer.addTo(sdMap);
}

// ===== V4 Competing Projects Pin Data =====
var competingProjectsPinData = [
  {
    id: 'CP01',
    name: '仙台地下鉄延伸工事',
    owner: '仙台市交通局',
    coords: [38.272, 140.882],
    location: '仙台市青葉区中央',
    type: '公共インフラ',
    scale: '事業費 約450億円',
    period: '2025-2028（継続中）',
    competingResources: ['鉄筋工', '型枠工', 'クレーン', '生コン'],
    impactLevel: 'high',
    influence: '本案件のピーク工期（4-6ヶ月目）に職人需要が直接競合。仙台市内・青葉区中心で鉄筋工逼迫の主因。'
  },
  {
    id: 'CP02',
    name: '仙台駅東口再開発',
    owner: '東日本旅客鉄道',
    coords: [38.260, 140.882],
    location: '仙台市宮城野区',
    type: '民間複合施設',
    scale: '延床35,000m²',
    period: '2026-2029',
    competingResources: ['鉄筋工', '生コン', '鋼材'],
    impactLevel: 'high',
    influence: '生コンの供給枠を仙台市内で大量確保。本案件の打設タイミング調整が必要。'
  },
  {
    id: 'CP03',
    name: '青葉通り商業ビル建替計画',
    owner: '東北エステート株式会社',
    coords: [38.265, 140.876],
    location: '仙台市青葉区一番町',
    type: '民間商業施設',
    scale: '延床12,000m²',
    period: '2026-2028',
    competingResources: ['鉄筋工', 'クレーン'],
    impactLevel: 'medium',
    influence: '同時期の躯体工事フェーズで重機（クレーン）需要が競合。'
  },
  {
    id: 'CP04',
    name: '泉中央サイト再開発',
    owner: '泉中央開発組合',
    coords: [38.310, 140.876],
    location: '仙台市泉区泉中央',
    type: '民間住宅',
    scale: '延床18,000m²',
    period: '2026-2028',
    competingResources: ['鉄筋工', '型枠工'],
    impactLevel: 'high',
    influence: '本案件と同じ泉区内で進行。地元協力会社の職人が分散され、本案件の確保が困難に。'
  },
  {
    id: 'CP05',
    name: '富谷リテール物流センター',
    owner: '東北リテール株式会社',
    coords: [38.412, 140.875],
    location: '宮城県富谷市',
    type: '物流施設',
    scale: '延床22,000m²',
    period: '2026-2027',
    competingResources: ['鋼材', '重機'],
    impactLevel: 'medium',
    influence: '鋼材調達で関東圏在庫との競合発生。重機（クレーン）は隣接エリアでの取り合い。'
  },
  {
    id: 'CP06',
    name: '仙台港コンテナターミナル増設',
    owner: '宮城県港湾整備公社',
    coords: [38.262, 141.002],
    location: '仙台市宮城野区港',
    type: '公共インフラ',
    scale: '事業費 約180億円',
    period: '2025-2027',
    competingResources: ['杭打ち機', '鋼材', '生コン'],
    impactLevel: 'medium',
    influence: '杭打ち機の稼働状況が完全に重複。本案件の杭打ち時期に手配困難リスク。'
  },
  {
    id: 'CP07',
    name: '石巻港湾施設災害復旧',
    owner: '国土交通省東北地方整備局',
    coords: [38.432, 141.298],
    location: '宮城県石巻市',
    type: '災害復旧',
    scale: '事業費 約95億円',
    period: '2024-2027（継続中）',
    competingResources: ['鉄筋工', '型枠工'],
    impactLevel: 'high',
    influence: '石巻周辺の職人が完全に拘束。応援職人の調達経路として石巻方面は期待できず。'
  },
  {
    id: 'CP08',
    name: '東日本大震災メンテナンス工事',
    owner: '宮城県',
    coords: [38.412, 141.282],
    location: '宮城県石巻市・東松島市',
    type: '災害復旧',
    scale: '複数案件、継続事業',
    period: '常時継続',
    competingResources: ['鉄筋工', '左官'],
    impactLevel: 'low',
    influence: '小規模な継続案件で個別影響は限定的だが、東北全体の職人プールに恒常的負荷。'
  },
  {
    id: 'CP09',
    name: '福島県庁更新工事',
    owner: '福島県',
    coords: [37.750, 140.467],
    location: '福島県福島市',
    type: '公共施設',
    scale: '延床28,000m²',
    period: '2026-2029',
    competingResources: ['鉄筋工', '生コン', '鋼材'],
    impactLevel: 'medium',
    influence: '福島市の職人を吸収。応援職人を福島方面から呼ぶ経路に影響。'
  },
  {
    id: 'CP10',
    name: '福島駅前再開発',
    owner: '福島都市開発',
    coords: [37.755, 140.475],
    location: '福島県福島市栄町',
    type: '民間商業施設',
    scale: '延床58,000m²',
    period: '2026-2028',
    competingResources: ['鉄筋工', 'クレーン', '生コン'],
    impactLevel: 'medium',
    influence: '福島市の建設リソース全般を圧迫。本案件への直接影響は限定的だが間接的に職人プールを縮小。'
  },
  {
    id: 'CP11',
    name: '原発廃炉関連工事',
    owner: '東京電力ホールディングス',
    coords: [37.422, 141.033],
    location: '福島県双葉郡',
    type: '特殊工事',
    scale: '事業費 数千億円規模',
    period: '長期継続',
    competingResources: ['鉄筋工', '型枠工'],
    impactLevel: 'medium',
    influence: '福島県内の職人を長期的に拘束。本案件への直接影響は中程度。'
  },
  {
    id: 'CP12',
    name: '郡山駅前広場整備',
    owner: '郡山市',
    coords: [37.397, 140.388],
    location: '福島県郡山市',
    type: '公共インフラ',
    scale: '事業費 約32億円',
    period: '2026-2027',
    competingResources: ['鉄筋工', '生コン'],
    impactLevel: 'low',
    influence: '小規模だが郡山市内の生コン枠を一部圧迫。'
  },
  {
    id: 'CP13',
    name: '郡山ロジスティクスセンター',
    owner: '東北リテール株式会社',
    coords: [37.408, 140.398],
    location: '福島県郡山市',
    type: '物流施設',
    scale: '延床8,500m²',
    period: '2026-2027',
    competingResources: ['鋼材', '鉄筋工'],
    impactLevel: 'low',
    influence: '本デモ案件群の一つ。郡山周辺のリソースを一部使用。'
  }
];

function drawCompetingProjectsPins() {
  if (vendorPinsLayer) { sdMap.removeLayer(vendorPinsLayer); vendorPinsLayer = null; }
  vendorPinsLayer = L.layerGroup();

  competingProjectsPinData.forEach(function(p) {
    var color, size;
    if (p.impactLevel === 'high') { color = '#c44a4a'; size = 22; }
    else if (p.impactLevel === 'medium') { color = '#f0a050'; size = 18; }
    else { color = '#5a7593'; size = 14; }

    var pin = L.marker(p.coords, {
      icon: L.divIcon({
        className: 'competing-pin-icon',
        html: '<div style="width:' + size + 'px;height:' + size + 'px;background:' + color + ';border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
        iconSize: [size + 4, size + 4],
        iconAnchor: [(size + 4) / 2, (size + 4) / 2]
      })
    });
    pin.bindTooltip(p.name + '（影響度: ' + (p.impactLevel === 'high' ? '高' : p.impactLevel === 'medium' ? '中' : '低') + '）', { direction: 'top' });
    pin.on('click', function() { showCompetingProjectPopup(p); });
    vendorPinsLayer.addLayer(pin);
  });

  if (sdProjectMarker) {
    sdProjectMarker.bringToFront();
  }

  vendorPinsLayer.addTo(sdMap);
}

function showCompetingProjectPopup(p) {
  var impactColor = p.impactLevel === 'high' ? '#c44a4a' : (p.impactLevel === 'medium' ? '#d6841d' : '#5a7593');
  var impactLabel = p.impactLevel === 'high' ? '影響度：高' : (p.impactLevel === 'medium' ? '影響度：中' : '影響度：低');

  var html = '<div class="competing-popup-content">';
  html += '<div class="competing-popup-header"><div class="competing-popup-name">' + p.name + '</div>';
  html += '<div class="competing-popup-impact" style="background:' + impactColor + '">' + impactLabel + '</div></div>';
  html += '<div class="competing-popup-meta">' + p.location + ' · ' + p.type + '</div>';
  html += '<div class="competing-popup-details">';
  html += '<div class="competing-popup-row"><span class="competing-popup-key">施主・発注者</span><span class="competing-popup-val">' + p.owner + '</span></div>';
  html += '<div class="competing-popup-row"><span class="competing-popup-key">規模</span><span class="competing-popup-val">' + p.scale + '</span></div>';
  html += '<div class="competing-popup-row"><span class="competing-popup-key">工期</span><span class="competing-popup-val">' + p.period + '</span></div>';
  html += '<div class="competing-popup-row"><span class="competing-popup-key">競合リソース</span><span class="competing-popup-val">' + p.competingResources.join('、') + '</span></div>';
  html += '</div>';
  html += '<div class="competing-popup-influence"><div class="competing-popup-influence-title">本案件への影響</div>';
  html += '<p>' + p.influence + '</p></div>';
  html += '</div>';

  L.popup({ maxWidth: 340, minWidth: 280 }).setLatLng(p.coords).setContent(html).openOn(sdMap);
}

function drawSupplyAreaLayer(layerType) {
  currentLayerType = layerType;
  clearSupplyAreaLayers();

  if (layerType === 'competing') {
    drawCompetingProjectsPins();
    return;
  }

  var data = layerMunicipalityData[layerType];
  if (!data) return;

  var monthIdx = parseInt((document.getElementById('sd-timeline-slider') || {}).value || 0);
  var multipliers = monthlyIntensityMultiplier || [1,1,1,1,1,1,1,1,1,1,1,1];
  var multiplier = multipliers[monthIdx] || 1;

  municipalityLayer = L.layerGroup();

  Object.keys(data).forEach(function(muniName) {
    var feature = municipalityPolygons[muniName];
    if (!feature) return;
    var info = data[muniName];

    var adjustedBalance = Math.round(info.balance * (info.balance < 0 ? multiplier : 1));
    var adjustedStatus = info.status;
    if (adjustedBalance <= -15) adjustedStatus = 'tight-high';
    else if (adjustedBalance <= -5) adjustedStatus = 'tight-medium';
    else if (adjustedBalance <= 5) adjustedStatus = 'balanced';
    else adjustedStatus = 'surplus';

    var color = getMuniStatusColor(adjustedStatus, adjustedBalance);
    var strokeColor = info.canSupply ? '#3d6b24' : '#888';
    var strokeWidth = info.canSupply ? 2.5 : 1;

    var polygon = L.geoJSON(feature, {
      style: {
        color: strokeColor,
        weight: strokeWidth,
        fillColor: color.fill,
        fillOpacity: color.opacity
      }
    });

    var currentInfo = Object.assign({}, info, {
      name: muniName,
      currentBalance: adjustedBalance,
      currentStatus: adjustedStatus
    });

    polygon.on('click', function() { showMunicipalityPopup(currentInfo); });
    polygon.bindTooltip(muniName + '（過不足率 ' + (adjustedBalance > 0 ? '+' : '') + adjustedBalance + '%）', { sticky: true });
    municipalityLayer.addLayer(polygon);

    if (info.isProject) {
      var bounds = polygon.getBounds();
      var center = bounds.getCenter();
      var centerLat = center.lat;
      var centerLng = center.lng;
      var label = L.marker([centerLat, centerLng], {
        icon: L.divIcon({
          className: 'mesh-label',
          html: '<div style="background:rgba(26,54,88,0.9);color:#fff;font-size:9px;padding:2px 6px;border-radius:8px;white-space:nowrap;font-weight:600;pointer-events:none">本案件</div>',
          iconSize: [50, 14],
          iconAnchor: [25, 25]
        })
      });
      municipalityLayer.addLayer(label);
    }
  });

  municipalityLayer.addTo(sdMap);

  // 業者ピンも描画
  drawVendorPins(layerType);
}

function getMuniStatusColor(status, balance) {
  var b = (typeof balance === 'number') ? balance : 0;
  var t = Math.max(0, Math.min(1, (20 - b) / 50));
  var r1 = 253, g1 = 229, b1 = 229;
  var r2 = 176, g2 = 48, b2 = 48;
  var r = Math.round(r1 + (r2 - r1) * t);
  var g = Math.round(g1 + (g2 - g1) * t);
  var bl = Math.round(b1 + (b2 - b1) * t);
  var fillColor = 'rgb(' + r + ',' + g + ',' + bl + ')';
  var opacity = 0.45 + t * 0.25;
  return { fill: fillColor, opacity: opacity };
}

function getMuniStatusLabel(status) {
  if (status === 'tight-high') return '深刻に逼迫';
  if (status === 'tight-medium') return '逼迫';
  if (status === 'balanced') return '均衡';
  if (status === 'surplus') return '供給余力あり';
  return '—';
}

function showMunicipalityPopup(info) {
  var monthlyData = [];
  var multipliers = monthlyIntensityMultiplier || [0.5,0.7,0.9,1.1,1.2,1.3,1.2,1.4,1.0,0.8,0.6,0.4];
  for (var i = 0; i < 12; i++) {
    var base = info.balance;
    var adjusted = Math.round(base * (base < 0 ? multipliers[i] : 1));
    var status;
    if (adjusted <= -15) status = 'tight-high';
    else if (adjusted <= -5) status = 'tight-medium';
    else if (adjusted <= 5) status = 'balanced';
    else status = 'surplus';
    monthlyData.push({ month: i + 1, value: adjusted, status: status });
  }
  var currentMonth = parseInt((document.getElementById('sd-timeline-slider') || {}).value || 0) + 1;
  var maxAbs = Math.max.apply(null, monthlyData.map(function(d) { return Math.abs(d.value); }));
  if (maxAbs < 15) maxAbs = 15;

  var resourceLabel = '職人需給バランス';
  if (currentLayerType === 'equipment') resourceLabel = '重機需給バランス';
  else if (currentLayerType === 'concrete') resourceLabel = '生コン需給バランス';
  else if (currentLayerType === 'steel') resourceLabel = '鋼材需給バランス';
  else if (currentLayerType === 'competing') resourceLabel = '競合案件密度';

  var html = '<div class="mesh-popup-content">';
  html += '<div class="mesh-popup-header"><div class="mesh-popup-area">' + info.name + '</div></div>';
  html += '<div class="mesh-popup-status-row ' + info.currentStatus + '">';
  html += '<span class="mesh-popup-status-label">' + resourceLabel + '（' + currentMonth + 'ヶ月目）</span>';
  html += '<span class="mesh-popup-status-val">' + getMuniStatusLabel(info.currentStatus) + '（' + (info.currentBalance > 0 ? '+' : '') + info.currentBalance + '%）</span>';
  html += '</div>';

  html += '<div class="mesh-popup-section">';
  html += '<div class="mesh-popup-section-title">工期12ヶ月の需給推移</div>';
  html += '<div class="mesh-chart"><div class="mesh-chart-bars">';
  monthlyData.forEach(function(d, i) {
    var h = Math.abs(d.value) / maxAbs * 100;
    var cls = 'mesh-chart-bar ' + d.status + ((i + 1) === currentMonth ? ' current' : '');
    html += '<div class="' + cls + '" style="height:' + h + '%" title="' + (i+1) + 'ヶ月目: ' + (d.value > 0 ? '+' : '') + d.value + '%"></div>';
  });
  html += '</div><div class="mesh-chart-labels">';
  for (var i = 1; i <= 12; i++) html += '<span>' + (i % 3 === 0 || i === 1 ? i : '') + '</span>';
  html += '</div></div></div>';

  html += '<div class="mesh-popup-section">';
  html += '<div class="mesh-popup-section-title">エリア内訳（現時点）</div>';
  var supplyUnit = '社';
  var demandUnit = '案件';
  if (currentLayerType === 'equipment') { supplyUnit = '社'; demandUnit = '現場'; }
  else if (currentLayerType === 'concrete') { supplyUnit = '工場'; demandUnit = '案件'; }
  else if (currentLayerType === 'steel') { supplyUnit = '商社'; demandUnit = '案件'; }
  else if (currentLayerType === 'competing') { supplyUnit = '—'; demandUnit = '案件'; }

  html += '<div class="mesh-popup-row"><span class="mesh-popup-key">供給能力</span><span class="mesh-popup-val">' + info.supply + ' ' + supplyUnit + '</span></div>';
  html += '<div class="mesh-popup-row"><span class="mesh-popup-key">競合需要</span><span class="mesh-popup-val">' + info.demand + ' ' + demandUnit + '</span></div>';
  html += '<div class="mesh-popup-row"><span class="mesh-popup-key">過不足率</span><span class="mesh-popup-val" style="color:' + (info.currentBalance < 0 ? '#c44a4a' : '#3d6b24') + '">' + (info.currentBalance > 0 ? '+' : '') + info.currentBalance + '%</span></div>';
  html += '</div>';

  // 競合案件リスト表示（競合レイヤーのみ）
  if (currentLayerType === 'competing' && info.competingProjects && info.competingProjects.length > 0) {
    html += '<div class="mesh-popup-causes">';
    html += '<div class="mesh-popup-causes-title">このエリアの主な競合案件</div>';
    html += info.competingProjects.map(function(p) { return '・' + p; }).join('<br>');
    html += '</div>';
  }

  if (info.canSupply) {
    html += '<div class="mesh-popup-causes" style="background:#e8f3dc;color:#3d6b24">';
    html += '<div class="mesh-popup-causes-title" style="color:#3d6b24">本案件からの調達可能性</div>';
    html += '✓ 本案件から調達可能なエリア';
    html += '</div>';
  }

  html += '</div>';

  var feature = municipalityPolygons[info.name];
  if (feature) {
    var tempLayer = L.geoJSON(feature);
    var center = tempLayer.getBounds().getCenter();
    L.popup({ maxWidth: 380, minWidth: 320 }).setLatLng([center.lat, center.lng]).setContent(html).openOn(sdMap);
  }
}

function clearSupplyAreaLayers() {
  if (municipalityLayer) { sdMap.removeLayer(municipalityLayer); municipalityLayer = null; }
  if (supplyAreaCircle) { sdMap.removeLayer(supplyAreaCircle); supplyAreaCircle = null; }
  if (vendorPinsLayer) { sdMap.removeLayer(vendorPinsLayer); vendorPinsLayer = null; }
  if (currentRouteLayer) { sdMap.removeLayer(currentRouteLayer); currentRouteLayer = null; }
}

var vendorLocationsData = [
  { coords: [38.2406, 140.3633], name: '山形北鉄筋工業（山形）', category: 'craftsmen' },
  { coords: [37.4007, 140.3886], name: '郡山クレーンサービス（郡山）', category: 'equipment' },
  { coords: [38.2682, 140.8694], name: '仙台青葉生コン工業（仙台青葉）', category: 'materials' }
];

var projectPhases = [
  '準備工事', '基礎工事', '基礎工事', '基礎工事ピーク',
  '躯体工事', '躯体工事ピーク', '躯体工事', '建方ピーク',
  '外装・設備', '内装工事', '内装工事', '竣工検査'
];

var monthlyIntensityMultiplier = [
  0.5, 0.7, 0.9, 1.1, 1.2, 1.3, 1.2, 1.4, 1.0, 0.8, 0.6, 0.4
];

var alertsData = [
  {
    id: 'ALT01',
    severity: 'high',
    title: '職人需給の深刻な逼迫（工期4-6ヶ月目）',
    description: '仙台市内中心部の鉄筋工が深刻に逼迫（-22%）。地元協力会社のみでは工期1.5ヶ月の遅延見込み。',
    impact: '工期+1.5ヶ月、コスト+14%',
    relatedMunicipality: '仙台市青葉区',
    icon: '⚠'
  },
  {
    id: 'ALT02',
    severity: 'high',
    title: '生コン供給枠の確保困難（工期5-7ヶ月目）',
    description: '仙台市内の生コン工場が公共工事案件で先約済み。本案件の打設タイミング調整が必要。',
    impact: '打設スケジュール再調整',
    relatedMunicipality: '仙台市青葉区',
    icon: '⚠'
  },
  {
    id: 'ALT03',
    severity: 'medium',
    title: '重機（クレーン）の予約困難（工期7-9ヶ月目）',
    description: '仙台地下鉄工事との競合で50tクレーンの稼働枠が限定的。近隣市から手配する必要あり。',
    impact: 'リース費+8%、調整工数発生',
    relatedMunicipality: '仙台市泉区',
    icon: '⚠'
  },
  {
    id: 'ALT04',
    severity: 'medium',
    title: '災害復旧需要との競合（東北全域）',
    description: '石巻港湾施設災害復旧、福島県庁更新等の継続案件で東北の職人プールが拘束されている。',
    impact: '応援職人の調達経路に制約',
    relatedMunicipality: '石巻市',
    icon: '⚠'
  }
];

var sdLayerVisibility = { craftsmen: true, equipment: false, materials: false, competing: false, bim: false };

var sdMap = null;
var sdLayerGroups = { craftsmen: null, equipment: null, materials: null, competing: null, bim: null };
var sdProjectMarker = null;

// ===== V4 Scene 2: Loading Animation =====
// ===== V4 Analysis Loading v2 (Claude-style) =====
var alo2Steps = [
  {
    id: 'craftsmen',
    text: '建設労働需給データを取得中',
    sources: ['建設業労働需給調査（東北地方）令和6年9月', 'JACIC技能労働者DB', '東北建設業協会データ', '宮城県建設業協会データ'],
    duration: 2200,
    result: '✓ 8職種・東北6県のデータ取得（1,240件）'
  },
  {
    id: 'equipment',
    text: '重機の稼働状況を確認中',
    sources: ['建設機械器具リース業等動態調査', '東北リース業協会', 'A社レンタル管理システム', 'B社建機稼働DB'],
    duration: 2400,
    result: '✓ 14業者・96台の稼働状況確認完了'
  },
  {
    id: 'materials',
    text: '主要資材の供給枠を照会中',
    sources: ['主要建設資材需給・価格動向調査', '東北生コンクリート工業組合', '鉄鋼商社協会データ', '東北圏在庫DB'],
    duration: 2600,
    result: '✓ 7業者・主要資材在庫枠の照会完了'
  },
  {
    id: 'projects',
    text: '周辺案件パイプラインを参照中',
    sources: ['案件パイプライン統合データ', '国交省インフラみらいマップ', '宮城県公共工事台帳', '近隣民間案件DB'],
    duration: 2800,
    result: '✓ 半径50km圏内 62案件のパイプライン分析完了'
  },
  {
    id: 'bim',
    text: '過去類似案件のBIMデータを参照中',
    sources: ['D-room類似案件BIMアーカイブ', 'D-room泉中央A（2022竣工）', 'D-room泉中央B（2023竣工）', 'D-room青葉（2024竣工）'],
    duration: 3000,
    result: '✓ 宮城県内 D-room類似案件 27件 のBIMデータ参照完了'
  },
  {
    id: 'recovery',
    text: '災害復旧需要・地域リスクを分析中',
    sources: ['東日本大震災復旧工事継続案件', '令和元年東日本台風水害復旧', '宮城県地震被害想定データ', '東北圏インフラ老朽度マップ'],
    duration: 3200,
    result: '✓ 過去5年の災害復旧需要パターン解析完了'
  }
];

var alo2DataSources = [
  '国交省統計',
  'JACIC',
  '業界横断PF',
  '過去BIM実績',
  '災害復旧履歴',
  '案件パイプライン'
];

function startAnalysisLoadingAnimation() {
  var stepsContainer = document.getElementById('alo2-steps');
  if (stepsContainer) {
    var stepsHtml = '';
    alo2Steps.forEach(function(s) {
      stepsHtml += '<div class="alo2-step pending" id="alo2-step-' + s.id + '">';
      stepsHtml += '<div class="alo2-step-row">';
      stepsHtml += '<div class="alo2-step-icon">';
      stepsHtml += '<span class="alo2-step-dot"></span>';
      stepsHtml += '<div class="alo2-step-spinner"></div>';
      stepsHtml += '<div class="alo2-step-check">✓</div>';
      stepsHtml += '</div>';
      stepsHtml += '<div class="alo2-step-text">' + s.text + '</div>';
      stepsHtml += '</div>';
      stepsHtml += '<div class="alo2-step-sources" id="alo2-sources-' + s.id + '">　</div>';
      stepsHtml += '<div class="alo2-step-result">' + s.result + '</div>';
      stepsHtml += '</div>';
    });
    stepsContainer.innerHTML = stepsHtml;
  }

  var sourcesGrid = document.getElementById('alo2-sources-grid');
  if (sourcesGrid) {
    sourcesGrid.innerHTML = alo2DataSources.map(function(s) {
      return '<div class="alo2-source-badge" data-source="' + s + '">' + s + '</div>';
    }).join('');
  }

  var startOffsets = [0, 200, 400, 600, 800, 1000];
  var sourceRotationIntervals = [];

  alo2Steps.forEach(function(step, i) {
    var stepEl = document.getElementById('alo2-step-' + step.id);
    if (!stepEl) return;

    setTimeout(function() {
      stepEl.classList.remove('pending');
      stepEl.classList.add('processing');

      var sourceEl = document.getElementById('alo2-sources-' + step.id);
      if (sourceEl) {
        var idx = 0;
        var interval = setInterval(function() {
          sourceEl.textContent = '→ ' + step.sources[idx % step.sources.length];
          idx++;
        }, 380);
        sourceRotationIntervals.push(interval);
        setTimeout(function() { clearInterval(interval); }, step.duration);
      }
    }, startOffsets[i]);

    setTimeout(function() {
      stepEl.classList.remove('processing');
      stepEl.classList.add('done');
    }, startOffsets[i] + step.duration);
  });

  alo2DataSources.forEach(function(s, i) {
    setTimeout(function() {
      var badge = document.querySelector('.alo2-source-badge[data-source="' + s + '"]');
      if (badge) badge.classList.add('active');
    }, 800 + i * 600);
  });

  var maxFinishTime = Math.max.apply(null, alo2Steps.map(function(s, i) { return startOffsets[i] + s.duration; }));
  setTimeout(function() {
    sourceRotationIntervals.forEach(function(intv) { clearInterval(intv); });
    setTimeout(function() {
      document.getElementById('analysis-loading-overlay').style.display = 'none';
      showSupplyDemandView();
    }, 800);
  }, maxFinishTime);
}

// ===== V4 Scene 2: Supply Demand View =====
function showSupplyDemandView() {
  document.getElementById('supply-demand-view').style.display = 'block';
  updateScenarioGuide(2, '需給可視化', '左の「主な調達対象」でレイヤーを切替、右の「AIシミュレーションを開始」で工期全体のリスクを分析します。');

  var p = window.selectedProject;
  if (p) {
    document.getElementById('sd-project-label').textContent = p.name + '（' + p.location + '）';
    document.getElementById('sd-info-location').textContent = p.location;
  }

  initSDMap();
  // アラート描画はシミュレーション完了後に実行
  simulationCompleted = false;
  var simSec = document.getElementById('sd-simulation-section');
  var progSec = document.getElementById('sd-sim-progress-section');
  var alertSec = document.getElementById('sd-alerts-section');
  var extSec = document.getElementById('sd-extended-section');
  var ctaSec = document.getElementById('sd-panel-cta');
  if (simSec) simSec.style.display = 'block';
  if (progSec) progSec.style.display = 'none';
  if (alertSec) alertSec.style.display = 'none';
  if (extSec) extSec.style.display = 'none';
  if (ctaSec) ctaSec.style.display = 'none';
  var pfMsg = document.getElementById('sd-pf-msg');
  if (pfMsg) pfMsg.remove();
  var pfSpacer = document.getElementById('sd-pf-msg-spacer');
  if (pfSpacer) pfSpacer.remove();
  var routeTile = document.getElementById('sd-route-result-tile');
  if (routeTile) routeTile.remove();
  if (window.optimizationRoutesLayer) {
    sdMap.removeLayer(window.optimizationRoutesLayer);
    window.optimizationRoutesLayer = null;
  }
  updateTimeline(0);
}

function initSDMap() {
  if (sdMap) {
    sdMap.remove();
    sdMap = null;
  }
  // 初期：仙台市泉区紫山周辺、半径15km圏
  sdMap = L.map('sd-map', { zoomControl: true }).setView([38.315, 140.88], 10);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(sdMap);

  // 本案件の所在地ピン
  sdProjectMarker = L.marker(V4_PROJECT_CENTER, {
    icon: L.divIcon({
      className: 'sd-project-marker-icon',
      html: '<div style="width:22px;height:22px;background:#1a3658;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
  }).addTo(sdMap);
  sdProjectMarker.bindTooltip('本案件：' + (window.selectedProject ? window.selectedProject.name : ''), { permanent: false, direction: 'top' });

  // GeoJSONをロード後、初期レイヤー（重機需給）を描画
  loadJapanGeoJSON().then(function() {
    drawSupplyAreaLayer('equipment');
    updateLegendForLayer('equipment');
  });
}

function updateLegendForLayer(layerType) {
  var titleEl = document.getElementById('sd-legend-title');
  var cansupplyEl = document.getElementById('sd-legend-cansupply');

  var legends = {
    craftsmen: { title: '職人需給バランス凡例', cansupply: '緑枠：本案件から調達可能なエリア' },
    equipment: { title: '重機需給バランス凡例', cansupply: '緑枠：30km圏内・重機輸送可能エリア' },
    concrete:  { title: '生コン供給バランス凡例', cansupply: '緑枠：20km圏内・90分運搬可能エリア' },
    steel:     { title: '鋼材供給バランス凡例', cansupply: '緑枠：陸送可能な調達拠点エリア' },
    competing: { title: '競合案件密度凡例', cansupply: '緑枠：競合影響の小さいエリア' }
  };

  var leg = legends[layerType] || legends.craftsmen;
  if (titleEl) titleEl.textContent = leg.title;
  if (cansupplyEl) cansupplyEl.innerHTML = leg.cansupply;

  var rangeEl = document.getElementById('sd-banner-range');
  if (rangeEl) {
    var rangeMap = {
      craftsmen: '100km圏内', equipment: '30km圏内', concrete: '20km圏内',
      steel: '関東圏まで', competing: '東北100km圏内'
    };
    rangeEl.textContent = rangeMap[layerType] || '100km圏内';
  }
}

function switchLayerTypeDisabled(layerType, layerName) {
  alert('「' + layerName + '」はこのデモでは未設定です。\n\n職人需給・重機需給・生コン供給・競合案件の各レイヤーをご確認ください。\n\n本番環境では当該リソースの需給状況も同様の地理空間AI分析で可視化されます。');
  var craftsmenRadio = document.querySelector('.sd-layer-toggle[data-layer="craftsmen"] input');
  if (craftsmenRadio) craftsmenRadio.checked = true;
  var disabledRadio = document.querySelector('.sd-layer-toggle.sd-layer-disabled input');
  if (disabledRadio) disabledRadio.checked = false;
}

function showLayerMoreInfo() {
  alert('このデモでは分析対象が制限されています。\n\n本番環境では以下のリソースも同様の分析対象となります：\n・足場（仮設工事）\n・内装材（フローリング・建具・クロス）\n・設備機器（給湯器・空調・キッチン）\n・外構工事リソース\n・塗料・防水材\n・電気工事業者\n\nその他、案件特性に応じて分析対象を拡張可能です。');
}

function switchLayerType(layerType) {
  document.querySelectorAll('.sd-layer-toggle').forEach(function(el) { el.classList.remove('active'); });
  var activeLabel = document.querySelector('.sd-layer-toggle[data-layer="' + layerType + '"]');
  if (activeLabel) activeLabel.classList.add('active');

  updateLegendForLayer(layerType);

  var setting = layerViewSettings[layerType];
  if (!setting || !sdMap) return;

  showLayerSwitchOverlay(layerType);

  setTimeout(function() {
    clearSupplyAreaLayers();
    sdMap.invalidateSize();
    sdMap.setView(setting.center, setting.zoom, { animate: false });
  }, 200);

  setTimeout(function() {
    drawSupplyAreaLayer(layerType);
    hideLayerSwitchOverlay();
  }, 500);

  if (simulationCompleted) {
    if (window.optimizationRoutesLayer) {
      sdMap.removeLayer(window.optimizationRoutesLayer);
      window.optimizationRoutesLayer = null;
    }
    if (currentRouteLayer) {
      sdMap.removeLayer(currentRouteLayer);
      currentRouteLayer = null;
    }
    var oldTile = document.getElementById('sd-route-result-tile');
    if (oldTile) oldTile.remove();
    var oldOverlay = document.getElementById('sd-route-opt-overlay');
    if (oldOverlay) oldOverlay.remove();
    var oldModal = document.getElementById('sd-route-result-modal');
    if (oldModal) oldModal.remove();

    var vendors = vendorPinsData[currentLayerType];
    if (vendors && vendors.length > 0) {
      if (currentLayerType === 'craftsmen') {
        showRouteOptimizationNotApplicableMessage();
      } else {
        hideElementsForRouteOptimization();
        setTimeout(function() {
          performRouteOptimizationAnalysis();
        }, 300);
      }
    } else {
      showElementsAfterRouteOptimization();
    }
  }
}

function showLayerSwitchOverlay(layerType) {
  var existing = document.getElementById('sd-layer-switch-overlay');
  if (existing) existing.remove();

  var labels = {
    craftsmen: '職人需給を分析中...',
    equipment: '重機需給を分析中...',
    concrete: '生コン供給を分析中...',
    steel: '鋼材調達経路を分析中...',
    competing: '競合案件を解析中...'
  };
  var overlay = document.createElement('div');
  overlay.id = 'sd-layer-switch-overlay';
  overlay.innerHTML = '<div class="sd-switch-msg"><div class="sd-switch-spinner"></div><div>' + (labels[layerType] || '分析中...') + '</div></div>';
  var mapContainer = document.querySelector('.sd-map-container');
  if (mapContainer) mapContainer.appendChild(overlay);
}

function hideLayerSwitchOverlay() {
  var overlay = document.getElementById('sd-layer-switch-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(function() { overlay.remove(); }, 200);
  }
}

function updateTimeline(monthIdx) {
  monthIdx = parseInt(monthIdx);
  var snapshotEl = document.getElementById('sd-timeline-snapshot');
  if (snapshotEl) {
    if (monthIdx === 0) snapshotEl.textContent = '工事開始時（着工日）';
    else if (monthIdx === 11) snapshotEl.textContent = '竣工時';
    else snapshotEl.textContent = '着工から ' + monthIdx + 'ヶ月後';
  }
  document.getElementById('sd-timeline-month').textContent = (monthIdx + 1) + 'ヶ月目';
  var phase = projectPhases[monthIdx];
  var phaseEl = document.getElementById('sd-timeline-phase');
  phaseEl.textContent = phase;
  phaseEl.className = 'sd-timeline-phase' + (phase.indexOf('ピーク') >= 0 ? ' peak' : '');
  clearSupplyAreaLayers();
  drawSupplyAreaLayer(currentLayerType);
}

// 旧createLayerGroups, toggleLayerは使用しないが、エラー回避のため空関数として残す
function createLayerGroups() {}
function toggleLayer(checkbox) {
  var layer = checkbox.dataset.layer;
  if (layer) switchLayerType(layer);
}

// ===== V4 Timeline Simulation =====
var simSteps = [
  { id: 'monthly', text: '月別需給バランスを計算中', duration: 1100, result: '✓ 12ヶ月分の需給推移を算出' },
  { id: 'spatial', text: '【地理空間AI】拠点配置×距離×輸送コストを最適化中', duration: 1300, result: '✓ 重機運搬距離・生コン90分制約を考慮した最適拠点群を特定', isAI: true },
  { id: 'public', text: '公共工事の進行スケジュールを反映中', duration: 1100, result: '✓ 仙台地下鉄延伸、地下鉄関連3案件を反映' },
  { id: 'disaster', text: '災害復旧需要との競合を分析中', duration: 1200, result: '✓ 石巻復旧、福島継続案件等の影響を計算' },
  { id: 'cascade', text: '隣接エリアの連鎖逼迫を計算中', duration: 1100, result: '✓ 6市区町村の連鎖逼迫を反映' },
  { id: 'timespace', text: '【地理空間AI】月別×エリア別の需給動的変化を予測中', duration: 1200, result: '✓ 時空間予測で工期4-6ヶ月目に仙台中心部で最大逼迫を特定', isAI: true },
  { id: 'peak', text: 'ピーク需給時期を特定中', duration: 1000, result: '✓ 工期4-6ヶ月目に最大逼迫（鉄筋工 -22%）' },
  { id: 'impact', text: 'コスト・工期影響を推定中', duration: 1100, result: '✓ 工期+1.5ヶ月、コスト+14%の見込み' }
];

var simulationCompleted = false;

function startTimelineSimulation() {
  var layerNames = {
    craftsmen: '職人需給（東北100km圏）',
    equipment: '重機需給（30km圏）',
    concrete: '生コン供給（20km圏）',
    competing: '競合案件動向'
  };
  var targetEl = document.getElementById('sd-sim-target');
  if (targetEl) {
    targetEl.textContent = '対象レイヤー：' + (layerNames[currentLayerType] || currentLayerType);
  }

  document.getElementById('sd-simulation-section').style.display = 'none';

  var progressSection = document.getElementById('sd-sim-progress-section');
  progressSection.style.display = 'block';

  var stepsContainer = document.getElementById('sd-sim-steps');
  var html = '';
  simSteps.forEach(function(s) {
    var aiClass = s.isAI ? ' sd-sim-step-ai' : '';
    var aiMark = s.isAI ? '<span class="sd-sim-step-ai-tag">🛰 地理空間AI</span>' : '';
    var stepText = s.text.replace('【地理空間AI】', '');
    html += '<div class="sd-sim-step pending' + aiClass + '" id="sd-sim-step-' + s.id + '">';
    html += '<div class="sd-sim-step-row">';
    html += '<div class="sd-sim-step-icon">';
    html += '<span class="sd-sim-step-dot"></span>';
    html += '<div class="sd-sim-step-spinner"></div>';
    html += '<div class="sd-sim-step-check">✓</div>';
    html += '</div>';
    html += '<div class="sd-sim-step-text">' + aiMark + stepText + '</div>';
    html += '</div>';
    html += '<div class="sd-sim-step-result">' + s.result + '</div>';
    html += '</div>';
  });
  stepsContainer.innerHTML = html;

  var offsets = [0, 180, 360, 540, 720, 900, 1080, 1260];
  simSteps.forEach(function(step, i) {
    var stepEl = document.getElementById('sd-sim-step-' + step.id);
    setTimeout(function() {
      stepEl.classList.remove('pending');
      stepEl.classList.add('processing');
    }, offsets[i]);
    setTimeout(function() {
      stepEl.classList.remove('processing');
      stepEl.classList.add('done');
    }, offsets[i] + step.duration);
  });

  startTimelineAutoScroll();

  var totalDuration = Math.max.apply(null, simSteps.map(function(s, i) { return offsets[i] + s.duration; }));
  setTimeout(function() {
    completeSimulation();
  }, totalDuration + 500);
}

function startTimelineAutoScroll() {
  var slider = document.getElementById('sd-timeline-slider');
  if (!slider) return;

  var startVal = 0;
  var endVal = 11;
  var duration = 6000;
  var startTime = performance.now();

  function animate(currentTime) {
    var elapsed = currentTime - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var currentMonth = Math.round(startVal + (endVal - startVal) * progress);

    if (slider.value != currentMonth) {
      slider.value = currentMonth;
      updateTimeline(currentMonth);
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      setTimeout(function() {
        slider.value = 5;
        updateTimeline(5);
      }, 300);
    }
  }
  requestAnimationFrame(animate);
}

function completeSimulation() {
  simulationCompleted = true;

  document.getElementById('sd-sim-progress-section').style.display = 'none';

  document.getElementById('sd-alerts-section').style.display = 'block';

  var extSec = document.getElementById('sd-extended-section');
  if (extSec) extSec.style.display = 'none';

  document.getElementById('sd-panel-cta').style.display = 'block';

  var alertsSec = document.getElementById('sd-alerts-section');
  if (alertsSec && !document.getElementById('sd-pf-msg')) {
    var msgDiv = document.createElement('div');
    msgDiv.id = 'sd-pf-msg';
    msgDiv.className = 'sd-pf-msg';
    msgDiv.innerHTML = '<div class="sd-pf-msg-icon">🔍</div><div class="sd-pf-msg-text"><strong>業界横断PFから追加候補を発見</strong><br>本案件の条件に合う調達候補が他の市区町村にも存在します。最適化プランで具体的に確認できます。</div>';
    alertsSec.parentNode.insertBefore(msgDiv, alertsSec);
    var spacer = document.createElement('div');
    spacer.id = 'sd-pf-msg-spacer';
    spacer.style.cssText = 'height: 20px; clear: both;';
    alertsSec.parentNode.insertBefore(spacer, alertsSec);
  }

  renderAlerts();

  hideElementsForRouteOptimization();
  setTimeout(function() {
    performRouteOptimizationAnalysis();
  }, 600);
}

function hideElementsForRouteOptimization() {
  var pfMsg = document.getElementById('sd-pf-msg');
  if (pfMsg) pfMsg.style.display = 'none';
  var pfMsgSpacer = document.getElementById('sd-pf-msg-spacer');
  if (pfMsgSpacer) pfMsgSpacer.style.display = 'none';
  var alertsSection = document.getElementById('sd-alerts-section');
  if (alertsSection) alertsSection.style.display = 'none';
  var panelCta = document.getElementById('sd-panel-cta');
  if (panelCta) panelCta.style.display = 'none';
}

function showElementsAfterRouteOptimization() {
  var pfMsg = document.getElementById('sd-pf-msg');
  if (pfMsg) {
    pfMsg.style.display = '';
    pfMsg.style.animation = 'fadeInUp 0.5s ease-out';
  }
  var pfMsgSpacer = document.getElementById('sd-pf-msg-spacer');
  if (pfMsgSpacer) pfMsgSpacer.style.display = '';
  setTimeout(function() {
    var alertsSection = document.getElementById('sd-alerts-section');
    if (alertsSection) {
      alertsSection.style.display = '';
      alertsSection.style.animation = 'fadeInUp 0.5s ease-out 0.2s both';
    }
  }, 250);
  setTimeout(function() {
    var panelCta = document.getElementById('sd-panel-cta');
    if (panelCta) {
      panelCta.style.display = '';
      panelCta.style.animation = 'fadeInUp 0.5s ease-out 0.4s both';
    }
  }, 500);
}

function showRouteOptimizationNotApplicableMessage() {
  var existing = document.getElementById('sd-route-result-tile');
  if (existing) existing.remove();
  var existingOverlay = document.getElementById('sd-route-opt-overlay');
  if (existingOverlay) existingOverlay.remove();

  var alertsSec = document.getElementById('sd-alerts-section');
  if (!alertsSec) return;

  var tile = document.createElement('div');
  tile.id = 'sd-route-result-tile';
  tile.className = 'sd-route-result-tile sd-route-not-applicable';
  tile.innerHTML =
    '<div class="sd-route-result-header">' +
      '<span class="sd-route-result-icon">🛰</span>' +
      '<span class="sd-route-result-title">ルート最適化は重機・生コンでお試しください</span>' +
    '</div>' +
    '<div class="sd-route-result-desc">職人需給は配送ではなく「対応可能エリア」で評価する性質のため、本デモのルート最適化分析は<strong>重機需給</strong>または<strong>生コン供給</strong>レイヤーでお試しいただけます。</div>' +
    '<div class="sd-route-not-applicable-cta">' +
      '<button class="sd-route-mini-btn" onclick="switchToLayerForRoute(\'equipment\')">重機需給を選択</button>' +
      '<button class="sd-route-mini-btn" onclick="switchToLayerForRoute(\'concrete\')">生コン供給を選択</button>' +
    '</div>';

  alertsSec.parentNode.insertBefore(tile, alertsSec);

  showElementsAfterRouteOptimization();
}

function switchToLayerForRoute(layerType) {
  var radio = document.querySelector('.sd-layer-toggle[data-layer="' + layerType + '"] input');
  if (radio) {
    radio.checked = true;
    switchLayerType(layerType);
  }
}

function performRouteOptimizationAnalysis() {
  if (currentLayerType === 'craftsmen') {
    showRouteOptimizationNotApplicableMessage();
    return;
  }

  var vendors = vendorPinsData[currentLayerType];
  if (!vendors || vendors.length === 0) {
    return;
  }

  showRouteOptimizationOverlay();

  if (currentRouteLayer) { sdMap.removeLayer(currentRouteLayer); currentRouteLayer = null; }
  if (window.optimizationRoutesLayer) { sdMap.removeLayer(window.optimizationRoutesLayer); window.optimizationRoutesLayer = null; }

  window.optimizationRoutesLayer = L.layerGroup().addTo(sdMap);

  var delay = 0;
  var interval = 280;
  vendors.forEach(function(vendor, idx) {
    setTimeout(function() {
      drawRoadLikeRoute(vendor, idx, vendors.length);
    }, delay);
    delay += interval;
  });

  setTimeout(function() {
    finalizeRouteOptimizationOverlay();
  }, delay + 800);

  setTimeout(function() {
    hideRouteOptimizationOverlay();
    showRouteOptimizationResultButton();
  }, delay + 2400);
}

function showRouteOptimizationOverlay() {
  var existing = document.getElementById('sd-route-opt-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'sd-route-opt-overlay';
  overlay.className = 'sd-route-opt-overlay';
  overlay.innerHTML =
    '<div class="sd-route-opt-card">' +
      '<div class="sd-route-opt-spinner"></div>' +
      '<div class="sd-route-opt-title">🛰 地理空間AIによるルート最適化分析中</div>' +
      '<div class="sd-route-opt-subtitle">道路接続・距離・拠点稼働率を統合解析しています</div>' +
      '<div class="sd-route-opt-progress" id="sd-route-opt-progress">道路ネットワーク評価中...</div>' +
    '</div>';

  var mapContainer = document.querySelector('.sd-map-container');
  if (mapContainer) {
    mapContainer.style.position = 'relative';
    mapContainer.appendChild(overlay);
  }

  var progressTexts = [
    '道路ネットワーク評価中...',
    '拠点間の道路接続を解析中...',
    '配送距離×稼働率×時期を最適化中...',
    '最適ルート候補を生成中...'
  ];
  var progressEl = document.getElementById('sd-route-opt-progress');
  var idx = 0;
  window.routeOptProgressTimer = setInterval(function() {
    idx = (idx + 1) % progressTexts.length;
    if (progressEl) progressEl.textContent = progressTexts[idx];
  }, 700);
}

function finalizeRouteOptimizationOverlay() {
  if (window.routeOptProgressTimer) {
    clearInterval(window.routeOptProgressTimer);
    window.routeOptProgressTimer = null;
  }
  var overlay = document.getElementById('sd-route-opt-overlay');
  if (overlay) {
    overlay.querySelector('.sd-route-opt-spinner').style.display = 'none';
    overlay.querySelector('.sd-route-opt-title').innerHTML = '✓ ルート最適化分析が完了しました';
    overlay.querySelector('.sd-route-opt-title').style.color = '#3d6b24';
    overlay.querySelector('.sd-route-opt-subtitle').textContent = '右パネルから結果を確認できます';
    overlay.querySelector('.sd-route-opt-progress').style.display = 'none';
    overlay.classList.add('completed');
  }
}

function hideRouteOptimizationOverlay() {
  var overlay = document.getElementById('sd-route-opt-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 400);
  }
}

function drawRoadLikeRoute(vendor, idx, total) {
  if (!window.optimizationRoutesLayer) return;
  var siteCoords = V4_PROJECT_CENTER;
  var vendorCoords = vendor.coords;

  var dLat = vendorCoords[0] - siteCoords[0];
  var dLng = vendorCoords[1] - siteCoords[1];
  var perpLat = -dLng * 0.06;
  var perpLng = dLat * 0.06;

  var routePoints = [
    siteCoords,
    [siteCoords[0] + dLat * 0.2 + perpLat * 0.3, siteCoords[1] + dLng * 0.2 + perpLng * 0.3],
    [siteCoords[0] + dLat * 0.4 - perpLat * 0.2, siteCoords[1] + dLng * 0.4 - perpLng * 0.2],
    [siteCoords[0] + dLat * 0.6 + perpLat * 0.4, siteCoords[1] + dLng * 0.6 + perpLng * 0.4],
    [siteCoords[0] + dLat * 0.8 - perpLat * 0.1, siteCoords[1] + dLng * 0.8 - perpLng * 0.1],
    vendorCoords
  ];

  var roadOutline = L.polyline(routePoints, {
    color: '#ffffff',
    weight: 6,
    opacity: 0.9,
    smoothFactor: 1.0
  });
  var roadCenter = L.polyline(routePoints, {
    color: vendor.status === 'limited' ? '#d6841d' : '#2c5d8f',
    weight: 3,
    opacity: 0,
    smoothFactor: 1.0,
    dashArray: vendor.status === 'limited' ? '6, 4' : null
  });

  window.optimizationRoutesLayer.addLayer(roadOutline);
  window.optimizationRoutesLayer.addLayer(roadCenter);

  var op = 0;
  var fadeIn = setInterval(function() {
    op += 0.1;
    if (op >= 0.85) {
      roadCenter.setStyle({ opacity: 0.85 });
      clearInterval(fadeIn);
    } else {
      roadCenter.setStyle({ opacity: op });
    }
  }, 30);
}

function showRouteOptimizationResultButton() {
  var alertsSec = document.getElementById('sd-alerts-section');
  if (!alertsSec) return;

  var existing = document.getElementById('sd-route-result-tile');
  if (existing) existing.remove();

  var tile = document.createElement('div');
  tile.id = 'sd-route-result-tile';
  tile.className = 'sd-route-result-tile';
  tile.innerHTML =
    '<div class="sd-route-result-header">' +
      '<span class="sd-route-result-icon">🛰</span>' +
      '<span class="sd-route-result-title">ルート最適化結果が確認できます</span>' +
    '</div>' +
    '<div class="sd-route-result-desc">地理空間AIによる道路接続・距離・稼働率の統合解析結果から、現在表示中のレイヤー（<span id="sd-route-result-layer-name"></span>）に対する最適ルートが算出されました。</div>' +
    '<button class="sd-route-result-btn" onclick="showRouteOptimizationResults()">📊 ルート最適化結果を見る →</button>';

  alertsSec.parentNode.insertBefore(tile, alertsSec);

  var layerNames = { craftsmen: '職人需給', equipment: '重機需給', concrete: '生コン供給', competing: '競合案件' };
  var nameSpan = document.getElementById('sd-route-result-layer-name');
  if (nameSpan) nameSpan.textContent = layerNames[currentLayerType] || currentLayerType;

  setTimeout(function() {
    showElementsAfterRouteOptimization();
  }, 500);
}

function showRouteOptimizationResults() {
  var modal = document.getElementById('sd-route-result-modal');
  if (modal) modal.remove();

  var vendors = vendorPinsData[currentLayerType];
  if (!vendors) return;

  var scored = vendors.map(function(v) {
    var score = 100 - (v.distance * 0.5) - (v.utilization * 0.3) - (v.status === 'limited' ? 30 : 0);
    return Object.assign({}, v, { score: score });
  });
  scored.sort(function(a, b) { return b.score - a.score; });
  var top5 = scored.slice(0, 5);

  var layerNames = { craftsmen: '職人需給', equipment: '重機需給', concrete: '生コン供給', competing: '競合案件' };

  var html =
    '<div class="sd-route-modal-backdrop" onclick="closeRouteOptResults(event)">' +
      '<div class="sd-route-modal" onclick="event.stopPropagation()">' +
        '<div class="sd-route-modal-header">' +
          '<div class="sd-route-modal-title">🛰 地理空間AIによるルート最適化結果</div>' +
          '<div class="sd-route-modal-sub">レイヤー：' + (layerNames[currentLayerType] || currentLayerType) + ' / 全' + vendors.length + '拠点を解析、上位5拠点を推奨</div>' +
          '<button class="sd-route-modal-close" onclick="closeRouteOptResults()">✕</button>' +
        '</div>' +
        '<div class="sd-route-modal-body">' +
          renderRouteOptResultRows(top5) +
          '<div class="sd-route-modal-note">💡 各推奨拠点をクリックすると、地図上に道路接続のルートと拠点の詳細がハイライト表示されます。</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  var modalDiv = document.createElement('div');
  modalDiv.id = 'sd-route-result-modal';
  modalDiv.innerHTML = html;
  document.body.appendChild(modalDiv);
}

function renderRouteOptResultRows(top5) {
  var html = '';
  top5.forEach(function(v, idx) {
    var costInfo = v.cost > 0 ? '¥' + v.cost.toLocaleString() : '地元単価';
    var statusBadge = v.status === 'available' ? '<span class="sd-route-status-ok">空きあり</span>' : '<span class="sd-route-status-limited">限定的</span>';
    html +=
      '<div class="sd-route-result-row" onclick="focusOnVendorFromResult(\'' + v.name + '\')">' +
        '<div class="sd-route-result-rank">' + (idx + 1) + '</div>' +
        '<div class="sd-route-result-info">' +
          '<div class="sd-route-result-name">' + v.name + ' ' + statusBadge + '</div>' +
          '<div class="sd-route-result-meta">📍 ' + v.distance + 'km / 稼働率 ' + v.utilization + '% / コスト ' + costInfo + '</div>' +
        '</div>' +
        '<div class="sd-route-result-score">スコア ' + Math.round(v.score) + '</div>' +
      '</div>';
  });
  return html;
}

function focusOnVendorFromResult(vendorName) {
  var vendors = vendorPinsData[currentLayerType];
  var v = vendors.find(function(x) { return x.name === vendorName; });
  if (!v) return;
  closeRouteOptResults();
  setTimeout(function() {
    sdMap.setView(v.coords, 11, { animate: true, duration: 0.8 });
    setTimeout(function() {
      showVendorPopup(v, currentLayerType);
      drawRouteToVendor(v);
    }, 600);
  }, 200);
}

function closeRouteOptResults(event) {
  if (event && event.target && event.target.classList) {
    if (!event.target.classList.contains('sd-route-modal-backdrop')) {
      return;
    }
  }
  var modal = document.getElementById('sd-route-result-modal');
  if (modal) modal.remove();
}

function startExtendedSearch() {
  document.getElementById('sd-extended-section').style.display = 'none';

  var extSection = document.createElement('div');
  extSection.id = 'sd-ext-searching';
  extSection.className = 'sd-panel-section';
  extSection.innerHTML = '<div class="sd-panel-section-title">業界横断PFから候補を検索中</div><div class="sd-ext-searching-msg"><div class="sd-sim-step-spinner" style="display:block"></div><div>協力企業ネットワークを横断検索中...</div></div>';
  document.getElementById('sd-alerts-section').parentNode.insertBefore(extSection, document.getElementById('sd-alerts-section').nextSibling);

  setTimeout(function() {
    extSection.remove();
    document.getElementById('sd-panel-cta').style.display = 'block';
    if (typeof drawSupplyAreaLayer === 'function' && currentLayerType) {
      drawSupplyAreaLayer(currentLayerType);
    }
  }, 2500);
}

function renderAlerts() {
  var container = document.getElementById('sd-alerts-container');
  if (!container) return;
  var html = '';
  alertsData.forEach(function(a) {
    var sevClass = 'sd-alert-' + a.severity;
    var clickable = a.relatedMunicipality ? ' onclick="focusOnAlertMunicipality(\'' + a.relatedMunicipality + '\', \'' + a.id + '\')"' : '';
    var clickHint = a.relatedMunicipality ? '<div class="sd-alert-click-hint">📍 地図で確認 →</div>' : '';
    html += '<div class="sd-alert-item ' + sevClass + (a.relatedMunicipality ? ' sd-alert-clickable' : '') + '"' + clickable + '>';
    html += '<div class="sd-alert-icon">' + (a.icon || '⚠') + '</div>';
    html += '<div class="sd-alert-body">';
    html += '<div class="sd-alert-title">' + a.title + '</div>';
    html += '<div class="sd-alert-desc">' + a.description + '</div>';
    html += '<div class="sd-alert-impact">影響: ' + a.impact + '</div>';
    html += clickHint;
    html += '</div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function focusOnAlertMunicipality(muniName, alertId) {
  if (currentLayerType === 'competing') {
    var craftsmenRadio = document.querySelector('.sd-layer-toggle[data-layer="craftsmen"] input');
    if (craftsmenRadio) craftsmenRadio.checked = true;
    switchLayerType('craftsmen');
    setTimeout(function() { openMunicipalityFocus(muniName); }, 900);
    return;
  }
  openMunicipalityFocus(muniName);
}

function openMunicipalityFocus(muniName) {
  var feature = municipalityPolygons[muniName];
  if (!feature) return;

  var tempLayer = L.geoJSON(feature);
  var bounds = tempLayer.getBounds();
  var center = bounds.getCenter();

  sdMap.setView([center.lat, center.lng], 11, { animate: true, duration: 0.8 });

  setTimeout(function() {
    var data = layerMunicipalityData[currentLayerType];
    if (data && data[muniName]) {
      var info = data[muniName];
      var monthIdx = parseInt((document.getElementById('sd-timeline-slider') || {}).value || 0);
      var multipliers = monthlyIntensityMultiplier || phaseMultipliers || [0.5,0.7,0.9,1.1,1.2,1.3,1.2,1.4,1.0,0.8,0.6,0.4];
      var multiplier = multipliers[monthIdx] || 1;
      var adjustedBalance = Math.round(info.balance * (info.balance < 0 ? multiplier : 1));
      var adjustedStatus = info.status;
      if (adjustedBalance <= -15) adjustedStatus = 'tight-high';
      else if (adjustedBalance <= -5) adjustedStatus = 'tight-medium';
      else if (adjustedBalance <= 5) adjustedStatus = 'balanced';
      else adjustedStatus = 'surplus';

      var currentInfo = Object.assign({}, info, {
        name: muniName,
        currentBalance: adjustedBalance,
        currentStatus: adjustedStatus
      });
      showMunicipalityPopup(currentInfo);
    }
  }, 600);
}

function toggleAlert(el) {
  el.classList.toggle('expanded');
}

function backToProjectDetail() {
  document.getElementById('supply-demand-view').style.display = 'none';
  document.getElementById('project-detail-view').style.display = 'block';
}

// ===== V4 Scene 3: Optimization & Vendors Data =====

var optimizationPlansData = [
  {
    id: 'planA', recommended: true, name: '広域調達型', tagline: '東北全域から最適なリソースを業界横断PF経由で確保。AI推奨。',
    metrics: { duration: '12ヶ月（予定通り）', cost: '+3.8%', risk: '低' },
    detail: '<strong>鉄筋工：</strong>山形北鉄筋工業（山形県山形市・47.5km）<br><strong>クレーン：</strong>福島重機（福島県福島市・73km）<br><strong>生コン：</strong>泉区生コン（仙台市泉区・2.1km）<br><strong>内装：</strong>富谷建築サービス（宮城県富谷市・10.4km）',
    relatedVendors: { craftsmen: ['山形北鉄筋工業', '一関建設工業', '福島建工'], equipment: ['福島重機', '山形建機'], concrete: ['泉区生コン', '富谷生コン'] },
    detailExtended: {
      summary: '通常範囲内の供給逼迫を踏まえ、業界横断PFで広域からリソースを補完する戦略。地元協力会社の不足分を、距離45-90km圏内の優良業者で確保することで、工期を予定通り維持。地理空間AIによる「距離×稼働率×時期」の最適化で輸送コストを最小化。',
      breakdown: [
        { resource: '鉄筋工（応援）', vendor: '山形北鉄筋工業', distance: '47.5km', period: '4-7ヶ月目', cost: '人工単価19,800円' },
        { resource: '鉄筋工（応援）', vendor: '一関建設工業', distance: '73.9km', period: '5-8ヶ月目', cost: '人工単価18,500円' },
        { resource: 'クレーン（50t）', vendor: '福島重機', distance: '73km', period: '7-9ヶ月目', cost: '日額1,120,000円（輸送費込）' },
        { resource: '生コン', vendor: '泉区生コン', distance: '2.1km', period: '2-6ヶ月目', cost: '17,800円/m³' },
        { resource: '生コン（追加）', vendor: '富谷生コン', distance: '10.4km', period: '4-5ヶ月目', cost: '18,400円/m³' },
        { resource: '内装', vendor: '富谷建築サービス', distance: '10.4km', period: '9-12ヶ月目', cost: '地元単価' }
      ],
      gantt: [
        { name: '準備', start: 0, duration: 1, vendor: '地元' },
        { name: '基礎', start: 1, duration: 3, vendor: '山形北鉄筋工業（応援）' },
        { name: '躯体', start: 3, duration: 4, vendor: '一関建設工業 + 地元' },
        { name: '建方', start: 6, duration: 2, vendor: '福島重機' },
        { name: '外装', start: 7, duration: 3, vendor: '地元 + 富谷建築サービス' },
        { name: '内装・引渡', start: 9, duration: 3, vendor: '富谷建築サービス + 地元' }
      ],
      risks: ['広域業者の品質管理に注力が必要', '50t重機の長距離輸送コストが発生（既算入済み）'],
      benefits: ['工期を完全に維持', '災害時の代替手段も同時確保', '取引履歴がPFに蓄積され将来活用可能', '近距離生コン拠点で90分制約リスクを最小化']
    }
  },
  {
    id: 'planB', recommended: false, name: '工期調整型', tagline: '着工時期を5週間後ろ倒し。地元協力会社のみで完結。',
    metrics: { duration: '13.2ヶ月（+5週）', cost: '+0.5%', risk: '低' },
    detail: '<strong>着工日：</strong>当初予定から5週間遅延<br><strong>調達範囲：</strong>仙台市内・近隣のみ（30km圏内）<br><strong>メリット：</strong>取引慣行を維持<br><strong>デメリット：</strong>引渡しが1ヶ月遅延',
    relatedVendors: { craftsmen: ['仙台中央建設', '泉区建設工業', '東北建設工業'], equipment: ['仙台クレーン工業', '泉区建機センター'], concrete: ['泉区生コン', '宮城野生コン工業'] },
    detailExtended: {
      summary: 'リソース逼迫のピーク時期を回避するため、着工を5週間後ろ倒しする戦略。職人需要のピークが過ぎた時期に基礎・躯体工事を実施。地理空間AI予測で月別・エリア別の需給変動を分析し、最適な着工時期を導出。',
      breakdown: [
        { resource: '鉄筋工', vendor: '仙台中央建設', distance: '6.1km', period: '5週後ろ倒し', cost: '地元単価' },
        { resource: '鉄筋工', vendor: '泉区建設工業', distance: '1.9km', period: '基礎・躯体', cost: '地元単価' },
        { resource: '型枠工', vendor: '東北建設工業', distance: '11km', period: '5-9ヶ月目', cost: '地元単価' },
        { resource: 'クレーン', vendor: '仙台クレーン工業', distance: '5.7km', period: '4-6ヶ月目（遅延後）', cost: '地元単価' },
        { resource: 'クレーン（補完）', vendor: '泉区建機センター', distance: '5.6km', period: '6-7ヶ月目', cost: '地元単価' },
        { resource: '生コン', vendor: '泉区生コン', distance: '2.1km', period: '通常確保', cost: '17,800円/m³' }
      ],
      gantt: [
        { name: '着工待機', start: 0, duration: 1.5, vendor: '（着工遅延）' },
        { name: '準備', start: 1.5, duration: 1, vendor: '地元' },
        { name: '基礎', start: 2.5, duration: 3, vendor: '仙台中央建設・泉区建設工業' },
        { name: '躯体', start: 5.5, duration: 4, vendor: '東北建設工業・地元' },
        { name: '建方', start: 8.5, duration: 1.5, vendor: '仙台クレーン工業' },
        { name: '外装', start: 9.5, duration: 2, vendor: '地元' },
        { name: '内装・引渡', start: 11, duration: 2.2, vendor: '地元' }
      ],
      risks: ['引渡しが1ヶ月遅延（地主・入居者への説明必要）', '遅延した期間中の地主の機会損失（家賃収入の遅れ）'],
      benefits: ['取引慣行を完全に維持', '広域業者管理の手間なし', 'コスト追加が極小', '全拠点10km圏内で配送効率最大']
    }
  },
  {
    id: 'planC', recommended: false, name: '工法転換型', tagline: '一部部材をプレキャスト化。現場職人工数を約30%削減。',
    metrics: { duration: '12ヶ月（予定通り）', cost: '+7.2%', risk: '中' },
    detail: '<strong>工法変更：</strong>基礎・床版をプレキャスト化<br><strong>調達範囲：</strong>関東圏のPCa工場<br><strong>メリット：</strong>現場工数大幅削減<br><strong>デメリット：</strong>部材コスト・輸送リスク',
    relatedVendors: { craftsmen: ['仙台中央建設', '泉区建設工業'], equipment: ['仙台クレーン工業', '泉区建機センター'], concrete: ['泉区生コン'] },
    detailExtended: {
      summary: '基礎・床版を工場製作のプレキャスト部材に変更することで、現場での職人工数を約30%削減する戦略。職人需給逼迫の影響を構造的に回避。地理空間AIで関東PCa工場からの輸送ルート・納入タイミングを最適化。',
      breakdown: [
        { resource: 'プレキャスト部材', vendor: '関東PCa工場', distance: '380km', period: '3-7ヶ月目', cost: '部材費+8% / 輸送費含' },
        { resource: '鉄筋工（現場）', vendor: '仙台中央建設', distance: '6.1km', period: '工程削減', cost: '地元単価' },
        { resource: '鉄筋工（現場）', vendor: '泉区建設工業', distance: '1.9km', period: '工程削減', cost: '地元単価' },
        { resource: 'クレーン', vendor: '仙台クレーン工業', distance: '5.7km', period: 'PCa設置時', cost: '地元単価' },
        { resource: 'クレーン（補完）', vendor: '泉区建機センター', distance: '5.6km', period: 'PCa設置時', cost: '地元単価' },
        { resource: '生コン（接続部）', vendor: '泉区生コン', distance: '2.1km', period: '4-6ヶ月目', cost: '17,800円/m³' }
      ],
      gantt: [
        { name: '準備', start: 0, duration: 1, vendor: '地元' },
        { name: '基礎(PCa)', start: 1, duration: 2, vendor: '関東PCa工場' },
        { name: '躯体(現場)', start: 3, duration: 3, vendor: '仙台中央建設（削減）' },
        { name: '床版(PCa)', start: 5, duration: 1, vendor: '関東PCa工場' },
        { name: '建方', start: 6, duration: 2, vendor: '仙台クレーン工業' },
        { name: '外装', start: 7, duration: 3, vendor: '地元' },
        { name: '内装・引渡', start: 9, duration: 3, vendor: '地元' }
      ],
      risks: ['PCa部材の輸送ロス・破損リスク（380km輸送）', '工場製作の納期管理', '設計変更が必要な可能性'],
      benefits: ['現場の職人工数を約30%削減', '逼迫の影響を構造的に回避', '工期は予定通り', '近距離拠点で現場作業の効率最大']
    }
  }
];

var vendorRecommendationsData = [
  {
    id: 'vendor1', category: '鉄筋工', name: '山形北鉄筋工業株式会社', location: '山形県山形市',
    distance: '45km / 車60分', period: '2026/12/15 - 2027/02/15', unit: '人工単価 19,800円',
    capacity: '6人工 / 当該期間', evaluation: '4.8 / 5.0', secured: false,
    tags: [{label: '業界横断PF経由', type: 'normal'}, {label: '過去BIM実績 3件', type: 'bim'}]
  },
  {
    id: 'vendor2', category: 'クレーン', name: '郡山クレーンサービス株式会社', location: '福島県郡山市',
    distance: '68km / 車90分', period: '2027/03/01 - 2027/05/30', unit: '日額 158,000円',
    capacity: '50tクローラー 空きあり', evaluation: '4.7 / 5.0', secured: false,
    tags: [{label: '業界横断PF経由', type: 'normal'}, {label: '稼働実績 12件', type: 'normal'}]
  },
  {
    id: 'vendor3', category: '生コン', name: '仙台青葉生コン工業株式会社', location: '仙台市青葉区',
    distance: '5km / 車15分', period: '2026/11/01 - 2027/03/31', unit: 'm³単価 18,500円',
    capacity: '420m³ 優先枠確保可能', evaluation: '4.9 / 5.0', secured: false,
    tags: [{label: '業界横断PF経由', type: 'normal'}, {label: '即時手配可能', type: 'normal'}]
  },
  {
    id: 'vendor4', category: '設備', name: '名取総合設備株式会社', location: '宮城県名取市',
    distance: '18km / 車30分', period: '2027/04/15 - 2027/07/15', unit: '一式 28,000,000円',
    capacity: '空調・給排水・電気一式', evaluation: '4.6 / 5.0', secured: false,
    tags: [{label: '過去BIM実績 5件', type: 'bim'}, {label: '同型空調機対応可', type: 'bim'}]
  }
];

var selectedPlanId = null;
var securedVendors = {};

// ===== V4 Vendor Flow State =====
var vendorFlowState = 'initial';

// ===== V4 Scene 3: Optimization Logic =====

function showOptimizationPlans() {
  document.getElementById('supply-demand-view').style.display = 'none';
  document.getElementById('optimization-loading-overlay').style.display = 'block';
  startOptimizationLoading();
}

function startOptimizationLoading() {
  var steps = ['ol-step-1', 'ol-step-2', 'ol-step-3', 'ol-step-4'];
  steps.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.className = 'ol-step';
  });
  steps.forEach(function(id, i) {
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.className = 'ol-step active';
    }, i * 600);
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.className = 'ol-step done';
    }, (i + 1) * 600);
  });
  setTimeout(function() {
    document.getElementById('optimization-loading-overlay').style.display = 'none';
    showOptimizationPlansView();
  }, 3000);
}

function showOptimizationPlansView() {
  document.getElementById('optimization-plans-view').style.display = 'block';
  updateScenarioGuide(3, '最適化プランの選択', 'AI推奨プランを比較し、最適な調達戦略を選択します。各プランの「+詳細を見る」で内訳を確認できます。');
  renderOptimizationPlans();
  selectedPlanId = null;
  document.getElementById('op-confirm-btn').style.display = 'none';
}

function renderOptimizationPlans() {
  var grid = document.getElementById('op-plans-grid');
  if (!grid) return;
  var html = '';
  optimizationPlansData.forEach(function(plan) {
    var cardClass = 'op-plan-card' + (plan.recommended ? ' recommended' : '');
    var badge = plan.recommended ? '<div class="op-plan-badge">AI推奨</div>' : '';
    html += '<div class="' + cardClass + '" data-plan-id="' + plan.id + '">';
    html += '<div onclick="selectOptimizationPlan(\'' + plan.id + '\')">';
    html += badge;
    html += '<div class="op-plan-name">' + plan.name + '</div>';
    html += '<div class="op-plan-tagline">' + plan.tagline + '</div>';
    html += '<div class="op-plan-metrics">';
    html += '<div class="op-plan-metric"><span class="op-plan-metric-key">工期</span><span class="op-plan-metric-val">' + plan.metrics.duration + '</span></div>';
    html += '<div class="op-plan-metric"><span class="op-plan-metric-key">コスト</span><span class="op-plan-metric-val">' + plan.metrics.cost + '</span></div>';
    html += '<div class="op-plan-metric"><span class="op-plan-metric-key">リスク</span><span class="op-plan-metric-val">' + plan.metrics.risk + '</span></div>';
    html += '</div>';
    html += '<div class="op-plan-detail">' + plan.detail + '</div>';
    html += '</div>';
    html += '<button class="op-plan-expand-btn" onclick="toggleOpPlanExpand(\'' + plan.id + '\', event)">＋ 詳細を見る</button>';
    html += '<div class="op-plan-expand" id="op-expand-' + plan.id + '" style="display:none"></div>';
    html += '</div>';
  });
  grid.innerHTML = html;
}

function toggleOpPlanExpand(planId, event) {
  if (event) event.stopPropagation();
  var el = document.getElementById('op-expand-' + planId);
  if (!el) return;

  if (el.style.display === 'none' || !el.style.display) {
    var plan = optimizationPlansData.find(function(p) { return p.id === planId; });
    if (!plan || !plan.detailExtended) return;
    el.innerHTML = renderPlanExpandContent(plan);
    el.style.display = 'block';
    setTimeout(function() {
      var rect = el.getBoundingClientRect();
      var offset = window.pageYOffset + rect.top - 100;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }, 100);
  } else {
    el.style.display = 'none';
  }
}

function renderPlanExpandContent(plan) {
  var ext = plan.detailExtended;
  var html = '';

  html += '<div class="op-expand-section">';
  html += '<div class="op-expand-title">戦略概要</div>';
  html += '<p class="op-expand-text">' + ext.summary + '</p>';
  html += '</div>';

  html += '<div class="op-expand-section">';
  html += '<div class="op-expand-title">リソース調達内訳</div>';
  html += '<table class="op-breakdown-table">';
  html += '<thead><tr><th>リソース</th><th>調達先</th><th>距離</th><th>期間</th></tr></thead><tbody>';
  ext.breakdown.forEach(function(b) {
    html += '<tr><td>' + b.resource + '</td><td>' + b.vendor + '</td><td>' + b.distance + '</td><td>' + b.period + '</td></tr>';
  });
  html += '</tbody></table>';
  html += '</div>';

  html += '<div class="op-expand-section">';
  html += '<div class="op-expand-title">工程ガントチャート</div>';
  html += '<div class="op-gantt">';
  var totalMonths = 13;
  ext.gantt.forEach(function(g) {
    var leftPct = (g.start / totalMonths) * 100;
    var widthPct = (g.duration / totalMonths) * 100;
    html += '<div class="op-gantt-row">';
    html += '<div class="op-gantt-label">' + g.name + '</div>';
    html += '<div class="op-gantt-bar-wrap"><div class="op-gantt-bar" style="left:' + leftPct + '%;width:' + widthPct + '%" title="' + g.vendor + '"></div></div>';
    html += '<div class="op-gantt-vendor">' + g.vendor + '</div>';
    html += '</div>';
  });
  html += '<div class="op-gantt-axis"><span>着工</span><span>3M</span><span>6M</span><span>9M</span><span>12M</span></div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="op-expand-rb">';
  html += '<div class="op-expand-section op-expand-risks">';
  html += '<div class="op-expand-title">想定リスク</div>';
  html += '<ul class="op-expand-list">';
  ext.risks.forEach(function(r) { html += '<li>' + r + '</li>'; });
  html += '</ul></div>';

  html += '<div class="op-expand-section op-expand-benefits">';
  html += '<div class="op-expand-title">メリット</div>';
  html += '<ul class="op-expand-list">';
  ext.benefits.forEach(function(b) { html += '<li>' + b + '</li>'; });
  html += '</ul></div>';
  html += '</div>';

  if (plan.relatedVendors) {
    html += '<div class="op-expand-section">';
    html += '<button class="op-expand-map-btn" onclick="focusMapOnPlan(\'' + plan.id + '\')">🗺 シーン2の地図でこのプランの拠点を確認 →</button>';
    html += '</div>';
  }

  return html;
}

function focusMapOnPlan(planId) {
  var plan = optimizationPlansData.find(function(p) { return p.id === planId; });
  if (!plan || !plan.relatedVendors) return;

  document.getElementById('optimization-plans-view').style.display = 'none';
  document.getElementById('supply-demand-view').style.display = 'block';

  window.highlightedVendorsForPlan = plan.relatedVendors;

  setTimeout(function() {
    sdMap.invalidateSize();
    highlightVendorsForCurrentLayer();
    var existingBadge = document.getElementById('sd-plan-overlay-badge');
    if (existingBadge) existingBadge.remove();
    var badge = document.createElement('div');
    badge.id = 'sd-plan-overlay-badge';
    badge.className = 'sd-plan-overlay-badge';
    badge.innerHTML = '🎯 <strong>' + plan.name + '</strong>で使用する拠点をハイライト中<button class="sd-plan-badge-close" onclick="clearPlanHighlight()">✕ 解除</button>';
    var mapContainer = document.querySelector('.sd-map-container');
    if (mapContainer) mapContainer.appendChild(badge);
  }, 300);
}

function highlightVendorsForCurrentLayer() {
  if (!window.highlightedVendorsForPlan) return;
  var highlights = window.highlightedVendorsForPlan[currentLayerType] || [];
  if (vendorPinsLayer) { sdMap.removeLayer(vendorPinsLayer); vendorPinsLayer = null; }
  var vendors = vendorPinsData[currentLayerType];
  if (!vendors || vendors.length === 0) return;

  vendorPinsLayer = L.layerGroup();
  vendors.forEach(function(v) {
    var isHighlighted = highlights.indexOf(v.name) >= 0;
    var distColor;
    if (v.status === 'limited') distColor = '#d6841d';
    else if (v.distance <= 10) distColor = '#2d5a1a';
    else if (v.distance <= 30) distColor = '#5a8a3c';
    else distColor = '#9bb87a';

    var size = v.distance <= 10 ? 18 : v.distance <= 30 ? 15 : 12;
    if (isHighlighted) size += 6;

    var ring = isHighlighted ? 'box-shadow:0 0 0 4px #ffd54f, 0 2px 10px rgba(0,0,0,0.5);animation:pulseHighlight 1.5s ease-in-out infinite;' : 'box-shadow:0 2px 6px rgba(0,0,0,0.4);';
    var opacity = (!isHighlighted && highlights.length > 0) ? '0.35' : '1';

    var pin = L.marker(v.coords, {
      icon: L.divIcon({
        className: 'vendor-pin-icon',
        html: '<div style="width:' + size + 'px;height:' + size + 'px;background:' + distColor + ';border:2px solid #fff;border-radius:50%;opacity:' + opacity + ';' + ring + 'position:relative"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:8px;font-weight:bold;line-height:1">' + Math.round(v.distance) + '</div></div>',
        iconSize: [size + 10, size + 10],
        iconAnchor: [(size + 10) / 2, (size + 10) / 2]
      })
    });
    pin.bindTooltip(v.name + '（' + v.distance + 'km）' + (isHighlighted ? ' ★採用' : ''), { direction: 'top' });
    pin.on('click', function() {
      showVendorPopup(v, currentLayerType);
      drawRouteToVendor(v);
    });
    vendorPinsLayer.addLayer(pin);
  });
  vendorPinsLayer.addTo(sdMap);
}

function clearPlanHighlight() {
  window.highlightedVendorsForPlan = null;
  var badge = document.getElementById('sd-plan-overlay-badge');
  if (badge) badge.remove();
  drawVendorPins(currentLayerType);
  if (currentRouteLayer) { sdMap.removeLayer(currentRouteLayer); currentRouteLayer = null; }
}

function selectOptimizationPlan(planId) {
  selectedPlanId = planId;
  document.querySelectorAll('.op-plan-card').forEach(function(card) {
    card.classList.remove('selected');
    if (card.dataset.planId === planId) card.classList.add('selected');
  });
  document.getElementById('op-confirm-btn').style.display = 'inline-block';
}

function confirmOptimizationPlan() {
  if (!selectedPlanId) return;
  document.getElementById('optimization-plans-view').style.display = 'none';
  showVendorRecommendationView();
}

function backToOptimizationPlans() {
  document.getElementById('vendor-recommendation-view').style.display = 'none';
  document.getElementById('optimization-plans-view').style.display = 'block';
}

function backToSupplyDemandView() {
  document.getElementById('optimization-plans-view').style.display = 'none';
  document.getElementById('supply-demand-view').style.display = 'block';
}

function showVendorRecommendationView() {
  document.getElementById('vendor-recommendation-view').style.display = 'block';
  updateScenarioGuide(3, '業者の確定', 'AIが推奨する業者一覧を確認し、業界横断PF経由で取引を確定します。');
  securedVendors = {};
  renderVendorCards();
  updateFinalizeButton();
  resetVendorFlow();
}

function renderVendorCards() {
  var grid = document.getElementById('vr-vendors-grid');
  if (!grid) return;
  var html = '';
  vendorRecommendationsData.forEach(function(v) {
    var secured = !!securedVendors[v.id];
    var cardClass = 'vr-vendor-card' + (secured ? ' secured' : '');
    var statusHtml = secured ? '<span class="vr-vendor-status vr-vendor-status-secured">✓ 確保済</span>' : '<span class="vr-vendor-status vr-vendor-status-available">空きあり</span>';
    var btnHtml = secured
      ? '<button class="vr-vendor-secure-btn vr-vendor-secure-btn-secured" onclick="secureVendor(\'' + v.id + '\')">✓ 確保済（クリックで解除）</button>'
      : '<button class="vr-vendor-secure-btn" onclick="secureVendor(\'' + v.id + '\')">このリソースを確保する</button>';
    var tagsHtml = v.tags.map(function(t) {
      var tc = t.type === 'bim' ? 'vr-vendor-tag vr-vendor-tag-bim' : 'vr-vendor-tag';
      return '<span class="' + tc + '">' + t.label + '</span>';
    }).join('');

    html += '<div class="' + cardClass + '">';
    html += '<div class="vr-vendor-card-header"><span class="vr-vendor-category">' + v.category + '</span>' + statusHtml + '</div>';
    html += '<div class="vr-vendor-name">' + v.name + '</div>';
    html += '<div class="vr-vendor-meta">' + v.location + ' · ' + v.distance + '</div>';
    html += '<div class="vr-vendor-details">';
    html += '<div class="vr-vendor-detail-row"><span class="vr-vendor-detail-key">対応期間</span><span class="vr-vendor-detail-val">' + v.period + '</span></div>';
    html += '<div class="vr-vendor-detail-row"><span class="vr-vendor-detail-key">単価</span><span class="vr-vendor-detail-val">' + v.unit + '</span></div>';
    html += '<div class="vr-vendor-detail-row"><span class="vr-vendor-detail-key">提供可能</span><span class="vr-vendor-detail-val">' + v.capacity + '</span></div>';
    html += '<div class="vr-vendor-detail-row"><span class="vr-vendor-detail-key">PF評価</span><span class="vr-vendor-detail-val">★ ' + v.evaluation + '</span></div>';
    html += '</div>';
    html += '<div class="vr-vendor-tags">' + tagsHtml + '</div>';
    html += btnHtml;
    html += '</div>';
  });
  grid.innerHTML = html;
}

function secureVendor(vendorId) {
  if (securedVendors[vendorId]) {
    delete securedVendors[vendorId];
  } else {
    securedVendors[vendorId] = true;
  }
  renderVendorCards();
  updateFinalizeButton();
}

function updateFinalizeButton() {
  var allSecured = vendorRecommendationsData.every(function(v) { return securedVendors[v.id]; });
  var anySecured = vendorRecommendationsData.some(function(v) { return securedVendors[v.id]; });
  var btn = document.getElementById('vr-finalize-btn');
  var note = document.querySelector('.vr-cta-note');
  if (btn) btn.disabled = false;
  if (note) {
    if (allSecured) {
      note.textContent = '全リソース確保完了。取引確定書の発行と社内決裁ワークフロー連携が可能です。';
    } else if (anySecured) {
      var count = Object.keys(securedVendors).length;
      note.textContent = '現在 ' + count + ' / ' + vendorRecommendationsData.length + ' リソース確保済み。確保済み分のみで発行可能です。';
    } else {
      note.textContent = 'リソースを確保すると発行されます。リソース未選択でも進行可能です。';
    }
  }
}

function verifyVendors() {
  vendorFlowState = 'verifying';
  document.getElementById('vr-cta-initial').style.display = 'none';
  document.getElementById('vr-cta-verifying').style.display = 'block';

  setTimeout(function() {
    vendorFlowState = 'verified';
    document.getElementById('vr-cta-verifying').style.display = 'none';
    document.getElementById('vr-cta-verified').style.display = 'block';

    vendorRecommendationsData.forEach(function(v) {
      securedVendors[v.id] = true;
    });
    renderVendorCards();
  }, 1200);
}

function finalizeVendors() {
  vendorFlowState = 'finalizing';
  document.getElementById('vr-cta-verified').style.display = 'none';
  document.getElementById('vr-cta-finalizing').style.display = 'block';

  setTimeout(function() {
    vendorFlowState = 'finalized';
    document.getElementById('vr-cta-finalizing').style.display = 'none';
    document.getElementById('vr-cta-finalized').style.display = 'block';

    setTimeout(function() {
      document.getElementById('vendor-recommendation-view').style.display = 'none';
      showSummaryView();
    }, 1500);
  }, 1000);
}

function resetVendorFlow() {
  vendorFlowState = 'initial';
  var stages = ['initial', 'verifying', 'verified', 'finalizing', 'finalized'];
  stages.forEach(function(s) {
    var el = document.getElementById('vr-cta-' + s);
    if (el) el.style.display = s === 'initial' ? 'block' : 'none';
  });
  securedVendors = {};
}

function returnToProjectList() {
  restartDemo();
}

function showSummaryView() {
  document.getElementById('summary-view').style.display = 'block';
  updateScenarioGuide(4, '契約完了とドキュメント発行', '調達計画が確定しました。業者リストと取引確定書をダウンロードできます。');
}

function restartDemo() {
  document.getElementById('summary-view').style.display = 'none';
  document.getElementById('project-list-view').style.display = 'block';
  securedVendors = {};
  selectedPlanId = null;
}

// ===== Hearing (Task 131) =====
var SUPABASE_URL = 'https://fivptpmctkfumdzeqvjr.supabase.co';
var SUPABASE_KEY = 'sb_publishable_zexOhIWAu2akWRPQ5h8_Uw_6O4b3NGW';
var hearingSessionId = null;
var hearingQuestions = [];
var hearingMemoData = {};

function sbFetch(path, options) {
  var opts = options || {};
  opts.headers = opts.headers || {};
  opts.headers['apikey'] = SUPABASE_KEY;
  opts.headers['Authorization'] = 'Bearer ' + SUPABASE_KEY;
  opts.headers['Content-Type'] = 'application/json';
  if (opts.upsert) {
    opts.headers['Prefer'] = 'resolution=merge-duplicates';
  }
  return fetch(SUPABASE_URL + '/rest/v1' + path, opts);
}

async function startHearingSession() {
  var interviewer = document.getElementById('hearing-interviewer').value.trim();
  var interviewee = document.getElementById('hearing-interviewee').value.trim();
  var company = document.getElementById('hearing-company').value.trim();
  if (!interviewer || !interviewee) {
    alert('実施者名と回答者名を入力してください');
    return;
  }
  var res = await sbFetch('/sessions', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ interviewer_name: interviewer, interviewee_name: interviewee, company_name: company, status: 'in_progress' })
  });
  var data = await res.json();
  hearingSessionId = data[0].id;
  document.getElementById('hearing-session-setup').classList.add('hidden');
  document.getElementById('hearing-questions-area').classList.remove('hidden');
  document.getElementById('hearing-export-bar').classList.remove('hidden');
  document.getElementById('hearing-session-info').textContent = interviewee + ' (' + company + ')';
  loadHearingQuestions();
}

async function autoStartHearing() {
  if (hearingSessionId) return;
  var res = await sbFetch('/sessions', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({ interviewer_name: 'デモ', interviewee_name: '', company_name: '', status: 'in_progress' })
  });
  var data = await res.json();
  if (data && data.length > 0) {
    hearingSessionId = data[0].id;
  }
  document.getElementById('hearing-export-bar').classList.remove('hidden');
  loadHearingQuestions();
}

async function loadHearingQuestions() {
  var res = await sbFetch('/questions?is_active=eq.true&order=sort_order');
  hearingQuestions = await res.json();
  var lm = document.getElementById('hearing-loading-msg');
  if (lm) lm.style.display = 'none';
  var list = document.getElementById('hearing-questions-list');
  var currentCat = '';
  var html = '';
  var qIdx = 0;
  hearingQuestions.forEach(function(q) {
    if (q.category !== currentCat) {
      if (currentCat) html += '</div>';
      currentCat = q.category;
      html += '<div style="margin:0 0 20px">';
      html += '<div class="hearing-category-title" style="display:flex;justify-content:space-between;align-items:center">';
      html += '<span>' + q.category + '</span>';
      html += '<div style="display:flex;gap:4px">';
      html += '<button onclick="addHearingQuestion(\'' + q.category.replace(/'/g, "\\'") + '\')" style="background:none;border:1px solid rgba(255,255,255,0.5);border-radius:4px;padding:2px 8px;font-size:10px;color:#fff;cursor:pointer">+ 追加</button>';
      html += '<button onclick="deleteHearingCategory(\'' + q.category.replace(/'/g, "\\'") + '\')" style="background:none;border:1px solid rgba(255,255,255,0.3);border-radius:4px;padding:2px 8px;font-size:10px;color:rgba(255,255,255,0.7);cursor:pointer">削除</button>';
      html += '</div></div>';
    }
    html += '<div class="hearing-question-card" data-qid="' + q.id + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
    qIdx++;
    html += '<div class="hearing-question-text">' + qIdx + '. ' + q.question_text + '</div>';
    html += '<div style="display:flex;gap:4px;margin-left:8px">';
    html += '<button class="edit-q-btn" data-qid="' + q.id + '" style="background:none;border:1px solid #ddd;border-radius:4px;padding:4px 8px;font-size:11px;color:#888;cursor:pointer;white-space:nowrap;font-family:inherit" onclick="editHearingQuestion(' + q.id + ', this)">編集</button>';
    html += '<button style="background:none;border:1px solid #e0b0b0;border-radius:4px;padding:4px 8px;font-size:11px;color:#c0392b;cursor:pointer;white-space:nowrap;font-family:inherit" onclick="deleteHearingQuestion(' + q.id + ')">削除</button>';
    html += '</div>';
    html += '</div>';
    if (q.question_type === 'free_text') {
      html += '<textarea class="hearing-memo-area" placeholder="回答を入力..." onchange="saveHearingMemo(' + q.id + ', this.value)"></textarea>';
    } else if (q.question_type === 'single_select' && q.options) {
      var opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      html += '<div class="hearing-options-group">';
      opts.forEach(function(opt) {
        var escOpt = opt.replace(/'/g, "\\'");
        html += '<div class="hearing-option-wrap" style="position:relative;display:inline-block">';
        html += '<button class="hearing-option-btn" onclick="selectHearingOption(this, ' + q.id + ', \'' + escOpt + '\', false)">' + opt + '</button>';
        html += '<button class="hearing-option-delete" onclick="deleteHearingOption(' + q.id + ', \'' + escOpt + '\')" style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#fff;border:1px solid #ccc;color:#888;font-size:11px;line-height:1;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center">×</button>';
        html += '</div>';
      });
      html += '<button onclick="addHearingOption(' + q.id + ')" style="padding:8px 16px;border:1px dashed #0067B3;border-radius:20px;font-size:12px;cursor:pointer;background:#fff;color:#0067B3;font-family:inherit">+ 選択肢を追加</button>';
      html += '</div>';
    } else if (q.question_type === 'multi_select' && q.options) {
      var mopts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      html += '<div class="hearing-options-group">';
      mopts.forEach(function(opt) {
        var escMOpt = opt.replace(/'/g, "\\'");
        html += '<div class="hearing-option-wrap" style="position:relative;display:inline-block">';
        html += '<button class="hearing-option-btn" onclick="selectHearingOption(this, ' + q.id + ', \'' + escMOpt + '\', true)">' + opt + '</button>';
        html += '<button class="hearing-option-delete" onclick="deleteHearingOption(' + q.id + ', \'' + escMOpt + '\')" style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#fff;border:1px solid #ccc;color:#888;font-size:11px;line-height:1;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center">×</button>';
        html += '</div>';
      });
      html += '<button onclick="addHearingOption(' + q.id + ')" style="padding:8px 16px;border:1px dashed #0067B3;border-radius:20px;font-size:12px;cursor:pointer;background:#fff;color:#0067B3;font-family:inherit">+ 選択肢を追加</button>';
      html += '</div>';
    } else if (q.question_type === 'rating_5') {
      html += '<div class="hearing-rating-group">';
      for (var r = 1; r <= 5; r++) {
        html += '<button class="hearing-rating-btn" onclick="selectHearingRating(this, ' + q.id + ', ' + r + ')">' + r + '</button>';
      }
      html += '</div>';
    }
    html += '<textarea class="hearing-memo-area" placeholder="メモ（任意）" style="margin-top:8px;min-height:40px" onchange="saveHearingMemo(' + q.id + ', this.value, true)"></textarea>';
    html += '</div>';
    html += '<div style="text-align:center;margin:4px 0"><button onclick="addHearingQuestion(\'' + q.category.replace(/'/g, "\\'") + '\', ' + q.sort_order + ')" style="background:none;border:1px dashed #ccc;border-radius:4px;padding:3px 10px;font-size:10px;color:#888;cursor:pointer;font-family:inherit">+ この下に質問を追加</button></div>';
  });
  if (currentCat) html += '</div>';
  html += '<div style="text-align:center;margin:20px 0"><button onclick="addNewCategory()" style="background:#fff;border:1.5px dashed #0067B3;border-radius:8px;padding:12px 24px;font-size:13px;color:#0067B3;cursor:pointer;font-family:inherit">+ 新しいセクションを追加</button></div>';
  var mgmtBar = '<div style="display:flex;gap:8px;margin:0 0 16px;padding:12px 14px;background:#f7f8fa;border-radius:8px;flex-wrap:wrap">';
  mgmtBar += '<button onclick="saveSnapshot()" style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:inherit">現在のシートを保存</button>';
  mgmtBar += '<button onclick="showSnapshotList()" style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:inherit">保存済みから復元</button>';
  mgmtBar += '<button onclick="addNewCategory()" style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:inherit">+ 新しいセクションを追加</button>';
  mgmtBar += '<button onclick="resetToDefaultQuestions()" style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;color:#888;font-family:inherit;margin-left:auto">初期設定に戻す</button>';
  mgmtBar += '</div>';
  list.innerHTML = mgmtBar + html;
}

var DEFAULT_QUESTIONS = [
  { category: '全体印象', sort_order: 1, question_text: '全体的に、実務で使えそうなイメージは沸きますか。その理由も教えてください。', question_type: 'free_text', options: null },
  { category: '全体印象', sort_order: 2, question_text: '一連のフローや分析項目等で違和感があるポイントはありますか。（例：スコアの算出根拠、UIの操作性、データの粒度、画面遷移など）', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 3, question_text: '土地取得に関して、現在どのようなツールやサービスを使っていますか。プロセスや業務ごとに教えてください。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 4, question_text: '用地評価のプロセスで最も時間がかかっている作業は何ですか。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 5, question_text: '競合他社の開発動向の把握はどのように行っていますか。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 6, question_text: '地権者情報の調査にどの程度の工数をかけていますか。', question_type: 'single_select', options: ['1人日以内', '2〜5人日', '5〜10人日', '10人日以上'] },
  { category: '業界・業務実態', sort_order: 7, question_text: '現在の業務で「見送っている土地」や「機会損失」が発生していると感じる領域はありますか。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 8, question_text: '用地探索から地権者データ取得まで一気通貫でできることに価値を感じますか。', question_type: 'free_text', options: null },
  { category: 'デモに対するフィードバック', sort_order: 9, question_text: '本日のデモで最も印象に残った機能はどれですか。', question_type: 'single_select', options: ['筆スコアリング', '開発シナリオ自動生成', '事業収支シミュレーション', '開発インパクト推計', '地権者分析', '代替候補探索'] },
  { category: 'デモに対するフィードバック', sort_order: 10, question_text: '「この機能があれば業務が大きく改善される」と思うものを挙げてください。', question_type: 'free_text', options: null },
  { category: 'デモに対するフィードバック', sort_order: 11, question_text: '現在の業務フローのどこにこのツールを組み込めると思いますか。', question_type: 'free_text', options: null },
  { category: 'デモに対するフィードバック', sort_order: 12, question_text: 'デモに含まれていないが、あるべきだと思う機能はありますか。', question_type: 'free_text', options: null },
  { category: 'デモに対するフィードバック', sort_order: 13, question_text: '導入にあたって懸念されることはどれですか。', question_type: 'multi_select', options: ['データソースの信頼性', 'セキュリティ・コンプライアンス', 'UIの学習コスト', '既存システムとの統合', '価格', '導入後のサポート体制', 'その他'] },
  { category: '市場性・商業化', sort_order: 14, question_text: 'このようなツールに対して、どの程度の価格が適切だと感じますか。', question_type: 'single_select', options: ['月額10万円以下', '月額10〜30万円', '月額30〜100万円', '月額100万円以上', '初期費用＋月額のモデルが適切'] },
  { category: '市場性・商業化', sort_order: 15, question_text: 'どのような業界・業種・企業規模が初期のお客様候補になりそうですか。', question_type: 'multi_select', options: ['大手デベロッパー', '中堅デベロッパー', '地域デベロッパー', 'アセットマネジメント会社', '不動産仲介', '金融機関', '自治体', 'その他'] },
  { category: '市場性・商業化', sort_order: 16, question_text: 'まず試してみたい機能があるとすればどれですか。', question_type: 'single_select', options: ['筆スコアリング', '開発シナリオ自動生成', '事業収支シミュレーション', '開発インパクト推計', '地権者分析', '代替候補探索'] }
];

async function resetToDefaultQuestions() {
  if (!confirm('ヒアリング項目を初期設定に戻しますか？現在の設定は、先に「現在のシートを保存」でスナップショットとして保存することを推奨します。')) return;
  await sbFetch('/questions?is_active=eq.true', {
    method: 'PATCH',
    body: JSON.stringify({ is_active: false })
  });
  var defaults = DEFAULT_QUESTIONS.map(function(q) {
    return {
      category: q.category,
      sort_order: q.sort_order,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      is_active: true
    };
  });
  await sbFetch('/questions', {
    method: 'POST',
    body: JSON.stringify(defaults)
  });
  loadHearingQuestions();
  showToast('ヒアリング項目を初期設定に戻しました');
}

async function saveSnapshot() {
  var name = prompt('スナップショット名を入力してください:', new Date().toLocaleDateString('ja-JP') + ' ' + new Date().toLocaleTimeString('ja-JP'));
  if (!name) return;
  var res = await sbFetch('/questions?is_active=eq.true&order=sort_order');
  var currentQuestions = await res.json();
  await sbFetch('/question_snapshots', {
    method: 'POST',
    body: JSON.stringify({
      snapshot_name: name,
      snapshot_data: currentQuestions
    })
  });
  showToast('スナップショットを保存しました');
}

async function showSnapshotList() {
  var res = await sbFetch('/question_snapshots?order=created_at.desc');
  var snapshots = await res.json();
  if (snapshots.length === 0) {
    alert('保存されたスナップショットはありません');
    return;
  }
  var existing = document.getElementById('snapshot-modal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'snapshot-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:100000;display:flex;align-items:center;justify-content:center';
  var html = '<div style="background:#fff;border-radius:12px;padding:24px;max-width:500px;width:90%;max-height:70vh;overflow-y:auto">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 16px">';
  html += '<h3 style="font-size:16px;font-weight:500;margin:0">保存済みスナップショット</h3>';
  html += '<button onclick="document.getElementById(\'snapshot-modal\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#888">×</button>';
  html += '</div>';
  html += '<div style="display:flex;flex-direction:column;gap:8px">';
  snapshots.forEach(function(snap) {
    var date = new Date(snap.created_at).toLocaleString('ja-JP');
    var count = Array.isArray(snap.snapshot_data) ? snap.snapshot_data.length : 0;
    html += '<div style="border:1px solid #e0e0e0;border-radius:8px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center">';
    html += '<div><div style="font-size:13px;font-weight:500">' + snap.snapshot_name + '</div><div style="font-size:11px;color:#888;margin-top:2px">' + date + ' / ' + count + '問</div></div>';
    html += '<div style="display:flex;gap:6px">';
    html += '<button onclick="restoreSnapshot(' + snap.id + ')" style="background:#0067B3;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer">復元</button>';
    html += '<button onclick="deleteSnapshot(' + snap.id + ')" style="background:none;color:#c0392b;border:1px solid #c0392b;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer">削除</button>';
    html += '</div></div>';
  });
  html += '</div></div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

async function restoreSnapshot(snapId) {
  if (!confirm('このスナップショットを復元しますか？現在の設定は上書きされます。')) return;
  var res = await sbFetch('/question_snapshots?id=eq.' + snapId);
  var data = await res.json();
  if (data.length === 0) return;
  var snapshot = data[0].snapshot_data;
  await sbFetch('/questions?is_active=eq.true', {
    method: 'PATCH',
    body: JSON.stringify({ is_active: false })
  });
  var toInsert = snapshot.map(function(q) {
    return {
      category: q.category,
      sort_order: q.sort_order,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      is_active: true
    };
  });
  await sbFetch('/questions', {
    method: 'POST',
    body: JSON.stringify(toInsert)
  });
  var modal = document.getElementById('snapshot-modal');
  if (modal) modal.remove();
  loadHearingQuestions();
  showToast('スナップショットを復元しました');
}

async function deleteSnapshot(snapId) {
  if (!confirm('このスナップショットを削除しますか？')) return;
  await sbFetch('/question_snapshots?id=eq.' + snapId, {
    method: 'DELETE'
  });
  showSnapshotList();
}

async function editHearingQuestion(qid, btn) {
  var card = btn.closest('.hearing-question-card');
  var textDiv = card.querySelector('.hearing-question-text');
  var currentText = textDiv.textContent.replace(/^\d+\.\s*/, '');
  if (btn.textContent === '編集') {
    var textarea = document.createElement('textarea');
    textarea.className = 'hearing-memo-area';
    textarea.value = currentText;
    textarea.style.minHeight = '60px';
    textarea.id = 'edit-q-' + qid;
    textDiv.style.display = 'none';
    textDiv.parentElement.insertBefore(textarea, textDiv);
    btn.textContent = '保存';
    btn.style.color = '#0067B3';
    btn.style.borderColor = '#0067B3';
  } else {
    var textarea = document.getElementById('edit-q-' + qid);
    var newText = textarea.value.trim();
    if (newText) {
      await sbFetch('/questions?id=eq.' + qid, {
        method: 'PATCH',
        body: JSON.stringify({ question_text: newText })
      });
      loadHearingQuestions();
      showToast('質問を更新しました');
    }
  }
}

async function addHearingQuestion(category, afterSortOrder) {
  var text = prompt('新しい質問文を入力してください:');
  if (!text) return;

  var insertOrder;

  if (typeof afterSortOrder === 'undefined') {
    var categoryQuestions = hearingQuestions.filter(function(q) { return q.category === category; });
    if (categoryQuestions.length > 0) {
      insertOrder = Math.max.apply(null, categoryQuestions.map(function(q) { return q.sort_order; })) + 1;
    } else {
      insertOrder = hearingQuestions.length > 0 ? Math.max.apply(null, hearingQuestions.map(function(q) { return q.sort_order; })) + 1 : 1;
    }
    var toShift = hearingQuestions.filter(function(q) { return q.sort_order >= insertOrder; });
    for (var i = 0; i < toShift.length; i++) {
      await sbFetch('/questions?id=eq.' + toShift[i].id, {
        method: 'PATCH',
        body: JSON.stringify({ sort_order: toShift[i].sort_order + 1 })
      });
    }
  } else {
    insertOrder = afterSortOrder + 1;
    var toShift = hearingQuestions.filter(function(q) { return q.sort_order >= insertOrder; });
    for (var i = 0; i < toShift.length; i++) {
      await sbFetch('/questions?id=eq.' + toShift[i].id, {
        method: 'PATCH',
        body: JSON.stringify({ sort_order: toShift[i].sort_order + 1 })
      });
    }
  }

  await sbFetch('/questions', {
    method: 'POST',
    body: JSON.stringify({
      category: category,
      sort_order: insertOrder,
      question_text: text,
      question_type: 'free_text',
      is_active: true
    })
  });

  loadHearingQuestions();
  showToast('質問を追加しました');
}

async function renormalizeSortOrders() {
  var res = await sbFetch('/questions?is_active=eq.true&order=sort_order');
  var qs = await res.json();
  for (var i = 0; i < qs.length; i++) {
    await sbFetch('/questions?id=eq.' + qs[i].id, {
      method: 'PATCH',
      body: JSON.stringify({ sort_order: i + 1 })
    });
  }
}

async function deleteHearingQuestion(qid) {
  if (!confirm('この質問を削除しますか？')) return;
  await sbFetch('/questions?id=eq.' + qid, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: false })
  });
  loadHearingQuestions();
  showToast('質問を削除しました');
}

async function deleteHearingCategory(category) {
  if (!confirm('カテゴリ「' + category + '」と、そこに含まれる全ての質問を削除します。よろしいですか？\n\n※この操作は取り消せません。個別の質問のみを削除したい場合は、各質問の「削除」ボタンを使ってください。')) return;
  await sbFetch('/questions?category=eq.' + encodeURIComponent(category), {
    method: 'PATCH',
    body: JSON.stringify({ is_active: false })
  });
  loadHearingQuestions();
  showToast('カテゴリを削除しました');
}

async function addNewCategory() {
  var categoryName = prompt('新しいセクション名を入力してください:');
  if (!categoryName) return;
  var existing = hearingQuestions.find(function(q) { return q.category === categoryName; });
  if (existing) {
    alert('このセクション名は既に存在します');
    return;
  }
  var questionText = prompt('最初の質問文を入力してください（任意）:');
  if (!questionText) questionText = '（ここに質問を入力してください）';
  var maxOrder = hearingQuestions.length > 0 ? Math.max.apply(null, hearingQuestions.map(function(q) { return q.sort_order; })) : 0;
  await sbFetch('/questions', {
    method: 'POST',
    body: JSON.stringify({ category: categoryName, sort_order: maxOrder + 1, question_text: questionText, question_type: 'free_text', is_active: true })
  });
  loadHearingQuestions();
  showToast('新しいセクションを追加しました');
}

async function deleteHearingOption(qid, optValue) {
  if (!confirm('この選択肢「' + optValue + '」を削除しますか？')) return;
  var q = hearingQuestions.find(function(x) { return x.id === qid; });
  if (!q || !q.options) return;
  var opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
  var newOpts = opts.filter(function(o) { return o !== optValue; });
  await sbFetch('/questions?id=eq.' + qid, {
    method: 'PATCH',
    body: JSON.stringify({ options: newOpts })
  });
  loadHearingQuestions();
  showToast('選択肢を削除しました');
}

async function addHearingOption(qid) {
  var newOpt = prompt('新しい選択肢を入力してください:');
  if (!newOpt) return;
  var q = hearingQuestions.find(function(x) { return x.id === qid; });
  if (!q) return;
  var opts = q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [];
  opts.push(newOpt);
  await sbFetch('/questions?id=eq.' + qid, {
    method: 'PATCH',
    body: JSON.stringify({ options: opts })
  });
  loadHearingQuestions();
  showToast('選択肢を追加しました');
}

function selectHearingOption(btn, qid, value, isMulti) {
  if (isMulti) {
    btn.classList.toggle('multi-selected');
    var scope = btn.closest('.hearing-options-group') || btn.parentElement;
    var selected = [];
    scope.querySelectorAll('.hearing-option-btn.multi-selected').forEach(function(b) {
      selected.push(b.textContent.trim());
    });
    saveHearingMemo(qid, selected.join(', '));
  } else {
    var wasSelected = btn.classList.contains('selected');
    var scopeS = btn.closest('.hearing-options-group') || btn.parentElement;
    scopeS.querySelectorAll('.hearing-option-btn').forEach(function(b) { b.classList.remove('selected'); });
    if (!wasSelected) {
      btn.classList.add('selected');
      saveHearingMemo(qid, value);
    } else {
      saveHearingMemo(qid, '');
    }
  }
}

function selectHearingRating(btn, qid, value) {
  var wasSelected = btn.classList.contains('selected');
  btn.parentElement.querySelectorAll('.hearing-rating-btn').forEach(function(b) { b.classList.remove('selected'); });
  if (!wasSelected) {
    btn.classList.add('selected');
    saveHearingMemo(qid, String(value));
  } else {
    saveHearingMemo(qid, '');
  }
}

async function saveHearingMemo(qid, text, isMemoField) {
  if (!hearingSessionId) return;
  hearingMemoData[qid] = hearingMemoData[qid] || {};
  if (isMemoField) { hearingMemoData[qid].memo = text; } else { hearingMemoData[qid].answer = text; }
  var memoText = '';
  if (hearingMemoData[qid].answer) memoText += hearingMemoData[qid].answer;
  if (hearingMemoData[qid].memo) memoText += (memoText ? ' | メモ: ' : '') + hearingMemoData[qid].memo;
  await sbFetch('/memos', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({ session_id: hearingSessionId, question_id: qid, memo_text: memoText })
  });
  var count = Object.keys(hearingMemoData).filter(function(k) { return hearingMemoData[k].answer || hearingMemoData[k].memo; }).length;
  document.getElementById('hearing-memo-count').textContent = 'メモ: ' + count + '件';
}

async function exportHearingCSV() {
  if (!hearingSessionId) return;
  var res = await sbFetch('/memos?session_id=eq.' + hearingSessionId + '&order=question_id');
  var memos = await res.json();
  var csv = '\uFEFF質問ID,カテゴリ,質問文,回答・メモ\n';
  hearingQuestions.forEach(function(q) {
    var memo = memos.find(function(m) { return m.question_id === q.id; });
    var text = memo ? memo.memo_text.replace(/"/g, '""') : '';
    csv += q.id + ',"' + q.category + '","' + q.question_text + '","' + text + '"\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'hearing_' + new Date().toISOString().slice(0,10) + '.csv';
  link.click();
}

async function endHearingSession() {
  if (!hearingSessionId) return;
  if (!confirm('ヒアリングを終了しますか？')) return;
  await sbFetch('/sessions?id=eq.' + hearingSessionId, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'completed' })
  });
  alert('ヒアリングが完了しました。CSVは出力済みですか？');
  document.getElementById('hearing-questions-area').classList.add('hidden');
  document.getElementById('hearing-export-bar').classList.add('hidden');
  document.getElementById('hearing-session-setup').classList.remove('hidden');
  hearingSessionId = null;
  hearingMemoData = {};
}

// ===== V4 Summary Downloads =====
function downloadVendorListCSV() {
  var projectName = window.selectedProject ? window.selectedProject.name : 'D-room泉区紫山新築計画';
  var today = new Date();
  var dateStr = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);

  var hasSecured = Object.keys(securedVendors).length > 0;
  var targetVendors = hasSecured
    ? vendorRecommendationsData.filter(function(v) { return securedVendors[v.id]; })
    : vendorRecommendationsData;

  var header = ['業者ID', '業種', '業者名', '所在地', '距離', '対応期間', '単価', '提供可能量', 'PF評価', '取引区分'];

  var rows = targetVendors.map(function(v) {
    var status = securedVendors[v.id] ? '確保済み' : '提案中';
    return [v.id, v.category, v.name, v.location, v.distance, v.period, v.unit, v.capacity, v.evaluation, status];
  });

  var csv = '﻿';
  csv += '案件名,' + projectName + '\n';
  csv += '発行日,' + dateStr + '\n';
  csv += '\n';
  csv += header.join(',') + '\n';
  rows.forEach(function(r) {
    csv += r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',') + '\n';
  });

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = '業者リスト_' + projectName + '_' + dateStr + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadOrderConfirmationPDF() {
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    alert('PDFライブラリが読み込まれていません。ページを再読み込みしてください。');
    return;
  }

  var projectName = window.selectedProject ? window.selectedProject.name : 'D-room泉区紫山新築計画';
  var ownerName = window.selectedProject && window.selectedProject.owner ? window.selectedProject.owner + '様' : '田中様';
  var location = window.selectedProject ? window.selectedProject.location : '仙台市泉区紫山';
  var today = new Date();
  var dateStr = today.getFullYear() + '年' + (today.getMonth() + 1) + '月' + today.getDate() + '日';

  var hasSecured = Object.keys(securedVendors).length > 0;
  var targetVendors = hasSecured
    ? vendorRecommendationsData.filter(function(v) { return securedVendors[v.id]; })
    : vendorRecommendationsData;

  if (targetVendors.length === 0) {
    alert('発行対象の業者が選択されていません。');
    return;
  }

  var doc = new window.jspdf.jsPDF({ format: 'a4', unit: 'mm' });

  doc.setFontSize(20);
  doc.text('Resource Procurement Confirmation', 105, 40, { align: 'center' });
  doc.setFontSize(14);
  doc.text('(Construction Resource Order)', 105, 50, { align: 'center' });

  doc.setFontSize(11);
  doc.text('Project: ' + projectName, 20, 80);
  doc.text('Client: ' + ownerName, 20, 90);
  doc.text('Location: ' + location, 20, 100);
  doc.text('Issue Date: ' + dateStr, 20, 110);
  doc.text('Contractor: Daiwa House Industry Co., Ltd.', 20, 120);
  doc.text('Total Vendors: ' + targetVendors.length, 20, 130);

  doc.setFontSize(9);
  doc.text('This document confirms the resource procurement contracts arranged via the', 20, 160);
  doc.text('Cross-Industry Social Capital Visualization Platform (RWAI).', 20, 167);
  doc.text('All vendor agreements below have been standardized through the platform.', 20, 174);

  targetVendors.forEach(function(v, idx) {
    doc.addPage();

    doc.setFontSize(16);
    doc.text('Vendor Order Detail #' + (idx + 1), 105, 25, { align: 'center' });

    doc.setFontSize(11);
    var y = 50;
    var rows = [
      ['Vendor ID', v.id],
      ['Category', v.category],
      ['Vendor Name', v.name],
      ['Location', v.location],
      ['Distance from Site', v.distance],
      ['Service Period', v.period],
      ['Unit Price', v.unit],
      ['Capacity Provided', v.capacity],
      ['PF Evaluation', v.evaluation],
      ['Status', securedVendors[v.id] ? 'Confirmed' : 'Proposed']
    ];

    rows.forEach(function(r) {
      doc.text(r[0] + ':', 25, y);
      doc.text(String(r[1]), 80, y);
      y += 10;
    });

    doc.setFontSize(9);
    doc.text('This order has been processed through the standardized contract template', 25, y + 15);
    doc.text('of the Cross-Industry Social Capital Visualization Platform.', 25, y + 22);
    doc.text('Signature/Seal (Vendor): _________________', 25, y + 40);
    doc.text('Signature/Seal (Contractor): _________________', 25, y + 50);
  });

  doc.save('Order_Confirmation_' + projectName.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
}
