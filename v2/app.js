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
      {"id":"B01","name":"芝公園3-2","lat":35.6619,"lng":139.7522,"polygon":[[35.661991,139.75215],[35.661888,139.752094],[35.661823,139.752295],[35.661847,139.752308],[35.661777,139.752496],[35.661875,139.752539],[35.661995,139.752153]],"zone":"商業地域","far":700,"score":84,"noiYield":4.2,"irr":11.0,"rent":6800,"area":450,"vacancy":3.5,"floors":11,"units":38,"cost":1460,"landPrice":720,"grossMargin":20,"dscr":1.5,"capRate":3.6,"buildableArea":2930,"rentableRatio":74,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B02","name":"芝公園3-4","lat":35.6618,"lng":139.7521,"polygon":[[35.661879,139.752075],[35.661683,139.751979],[35.661613,139.752201],[35.661807,139.752308],[35.661875,139.752078]],"zone":"商業地域","far":700,"score":78,"noiYield":3.9,"irr":10.2,"rent":6500,"area":380,"vacancy":4.0,"floors":10,"units":30,"cost":1240,"landPrice":680,"grossMargin":19,"dscr":1.45,"capRate":3.8,"buildableArea":2480,"rentableRatio":73,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B03","name":"芝公園3-6","lat":35.6617,"lng":139.7524,"polygon":[[35.661803,139.752359],[35.661725,139.752325],[35.661694,139.752443],[35.661768,139.752477],[35.661807,139.752365]],"zone":"商業地域","far":600,"score":72,"noiYield":3.7,"irr":9.5,"rent":6300,"area":280,"vacancy":4.5,"floors":9,"units":22,"cost":780,"landPrice":650,"grossMargin":18,"dscr":1.4,"capRate":3.9,"buildableArea":1560,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B04","name":"芝公園3-8","lat":35.6616,"lng":139.7523,"polygon":[[35.661705,139.752284],[35.661585,139.752228],[35.661537,139.752389],[35.661672,139.752445],[35.661729,139.752292]],"zone":"商業地域","far":600,"score":70,"noiYield":3.6,"irr":9.2,"rent":6200,"area":320,"vacancy":4.5,"floors":8,"units":24,"cost":890,"landPrice":640,"grossMargin":17,"dscr":1.38,"capRate":4.0,"buildableArea":1790,"rentableRatio":72,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
      {"id":"B05","name":"芝公園3-10","lat":35.6614,"lng":139.7520,"polygon":[[35.66165,139.751981],[35.661546,139.75193],[35.661485,139.752054],[35.661241,139.751941],[35.661162,139.75219],[35.661522,139.752351],[35.661659,139.751979]],"zone":"商業地域","far":700,"score":76,"noiYield":3.8,"irr":10.0,"rent":6400,"area":580,"vacancy":4.0,"floors":10,"units":42,"cost":1890,"landPrice":660,"grossMargin":18,"dscr":1.42,"capRate":3.9,"buildableArea":3780,"rentableRatio":73,"risks":{"flood":"低","soil":"なし","cultural":"なし","liquefaction":"低","road":"適合","adjacentUse":"問題なし"}},
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

// ===== Screen 0 -> Screen 1 =====
function startDemo() {
  if (gifInterval) { clearInterval(gifInterval); gifInterval = null; }
  document.getElementById('screen0').style.display = 'none';
  document.getElementById('screen-map').style.display = 'block';
  document.getElementById('app-tabs').style.display = 'flex';
  var floatBtn = document.getElementById('hearing-float-btn');
  if (floatBtn) floatBtn.style.display = 'flex';
  var resetBtn = document.getElementById('reset-float-btn');
  if (resetBtn) resetBtn.style.display = 'flex';
  initMap();
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
      const resp = await fetch('data/parcels.json?v=' + Date.now());
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
  if (!window._isAlternativeArea) {
    var isInPlan = false;
    developmentPlans.forEach(function(plan) {
      if (plan.parcels.indexOf(id) >= 0) isInPlan = true;
    });
    if (!isInPlan) {
      showToast('この筆は開発シナリオの対象外です。スコア上位の筆（P01〜P07）をクリックしてください');
      return;
    }
  }
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
  _panelUpdating = true;
  window._isAlternativeArea = false;
  currentScreen = 2;
  selectedParcelId = null;
  clearImpactOverlay();
  var rpEl = document.getElementById('side-panel');
  if (rpEl) rpEl.style.display = '';

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
  _panelUpdating = false;
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
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;

  // Check if parcel is in any development plan
  var isInPlan = false;
  if (typeof developmentPlans !== 'undefined' && developmentPlans) {
    developmentPlans.forEach(function(plan) {
      if (plan.parcels.indexOf(id) >= 0) isInPlan = true;
    });
  }
  if (!isInPlan && !window._isAlternativeArea) {
    showToast('この筆は開発シナリオの対象外です。スコア上位の筆（P01〜P07）をクリックしてください');
    return;
  }

  _panelUpdating = true;
  currentScreen = 3;
  selectedParcelId = id;
  clearImpactOverlay();
  const grade = getGrade(p.score);

  // Keep panel at 400px for detail
  setPanelWidth(400);
  map.panTo(getParcelCenter(p));
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

  _panelUpdating = false;
  // Guide: after detail panel opens, show step 4
  if (guideStep === 3) setTimeout(() => advanceGuide(4), 1000);
}

function closeDetailPanel() {
  setPanelWidth(400);
  showRankingPanel();
}

// ===== Screen 4: Scenario Selection Panel (Task 49) =====
function showScenarioPanel(id) {
  currentScreen = 4;
  clearGuideUI();
  var p = parcelsData.find(function(d) { return d.id === id; });
  if (!p) return;

  setPanelWidth(400);

  // Grey out all parcels, hide tooltips
  Object.keys(parcelLayers).forEach(function(pid) {
    parcelLayers[pid].setStyle({ fillColor: '#cccccc', fillOpacity: 0.2, weight: 1, color: '#aaaaaa' });
  });
  Object.values(parcelTooltips).forEach(function(t) { t.setOpacity(0); });

  // Default expanded plan
  var expandedPlanId = 'planD';

  function renderScenarioPanel() {
    _panelUpdating = true;
    var panel = document.getElementById('side-panel');
    var html = '<div style="padding:14px 16px">';
    html += '<p style="font-size:11px;color:#999;margin:0 0 4px">' + p.name + '（スコア: ' + p.score + ' / ' + p.zone + ' / 容積率' + p.far + '%）</p>';
    html += '<p style="font-size:15px;font-weight:500;color:#333;margin:0 0 6px">開発シナリオの選択</p>';
    html += '<p style="font-size:12px;color:#666;line-height:1.6;margin:0 0 14px">隣接筆の形状・法規制・接道条件から算出した開発パターンです。</p>';

    html += '<div style="display:flex;flex-direction:column;gap:6px">';

    developmentPlans.forEach(function(plan) {
      var isExpanded = plan.id === expandedPlanId;
      var isRec = plan.recommended;

      if (isExpanded) {
        // Expanded card
        var shakeClass = isRec ? ' style="animation:shake 0.6s ease-in-out 1s 3"' : '';
        html += '<div class="plan-card-expanded" data-plan="' + plan.id + '"' + (isRec ? ' style="border:2px solid #0067B3;border-radius:10px;overflow:hidden;animation:shake 0.6s ease-in-out 1s 3"' : ' style="border:2px solid #0067B3;border-radius:10px;overflow:hidden"') + '>';

        // Header
        html += '<div style="padding:14px 14px 10px;position:relative">';
        if (isRec) {
          html += '<div style="position:absolute;top:-1px;right:-1px;background:#0067B3;color:#fff;font-size:9px;padding:3px 10px;border-radius:0 8px 0 8px">AI推奨</div>';
        }
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 4px">';
        html += '<span style="font-size:14px;font-weight:500;color:#333">' + plan.name + '</span>';
        html += '<span style="font-size:11px;color:#0C447C;background:#E6F1FB;padding:2px 8px;border-radius:4px">' + plan.badge + '</span>';
        html += '</div>';
        html += '<div style="display:flex;gap:16px;font-size:12px;color:#666;margin:0 0 4px">';
        html += '<span>敷地 ' + plan.siteArea.toLocaleString() + 'm\u00B2</span>';
        html += '<span>延床 ' + plan.floorArea.toLocaleString() + 'm\u00B2</span>';
        html += '<span>' + plan.floors + '階</span>';
        html += '</div>';
        html += '<p style="font-size:11px;color:#0C447C;margin:0">' + plan.description + '</p>';
        html += '</div>';

        // Facility type tabs + 3D + button
        html += '<div style="border-top:1px solid #E6F1FB;padding:12px 14px;background:#FAFCFF">';
        html += '<p style="font-size:11px;color:#888;margin:0 0 8px">施設タイプ</p>';
        html += '<div style="display:flex;gap:4px;margin:0 0 12px">';
        html += '<div class="facility-tab" data-type="office" style="flex:1;text-align:center;padding:8px 4px;border:1px solid #e0e0e0;border-radius:6px;cursor:pointer;font-size:11px;color:#888">オフィス<br><span style="font-size:10px">' + plan.floors + 'F</span></div>';
        html += '<div class="facility-tab" data-type="complex" style="flex:1;text-align:center;padding:8px 4px;border:2px solid #0067B3;border-radius:6px;cursor:pointer;font-size:11px;color:#0C447C;background:#F0F6FD">複合施設<br><span style="font-size:10px;color:#0067B3">' + plan.floors + 'F</span></div>';
        html += '<div class="facility-tab" data-type="tower-mansion" style="flex:1;text-align:center;padding:8px 4px;border:1px solid #e0e0e0;border-radius:6px;cursor:pointer;font-size:11px;color:#888">タワマン<br><span style="font-size:10px">' + Math.round(plan.floors * 1.3) + 'F</span></div>';
        html += '</div>';
        html += '<div id="facility-3d-preview" style="width:100%;height:160px;background:#f0f4f8;border-radius:8px;margin:0 0 12px;overflow:hidden"></div>';
        if (plan.recommended) {
          html += '<div id="scenario-start-btn" data-plan="' + plan.id + '" style="background:#0067B3;color:#fff;text-align:center;padding:12px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer">このプランで分析を開始</div>';
        } else {
          html += '<div id="scenario-start-btn" data-plan="' + plan.id + '" style="background:#ccc;color:#fff;text-align:center;padding:12px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer">このプランで分析を開始</div>';
        }
        html += '</div>';
        html += '</div>';
      } else {
        // Collapsed card
        if (plan.recommended) {
          html += '<div class="plan-card-collapsed" data-plan="' + plan.id + '" style="border:2px solid #0067B3;border-radius:8px;padding:12px 14px;cursor:pointer;opacity:0.9;transition:opacity 0.2s;position:relative" onmouseover="this.style.opacity=1;highlightPlanParcels(\'' + plan.id + '\')" onmouseout="this.style.opacity=0.9;clearPlanHighlight()">';
          html += '<div style="position:absolute;top:-1px;right:-1px;background:#0067B3;color:#fff;font-size:9px;padding:3px 10px;border-radius:0 8px 0 8px">AI推奨</div>';
          html += '<div style="display:flex;justify-content:space-between;align-items:center">';
          html += '<span style="font-size:13px;font-weight:500;color:#333">' + plan.name + '</span>';
          html += '<div style="display:flex;align-items:center;gap:8px">';
          html += '<span style="font-size:11px;color:#0C447C">' + plan.siteArea.toLocaleString() + 'm\u00B2 / ' + plan.floors + 'F</span>';
          html += '<span style="font-size:11px;color:#0C447C;background:#E6F1FB;padding:2px 6px;border-radius:4px">' + plan.badge + '</span>';
          html += '</div></div></div>';
        } else {
          html += '<div class="plan-card-collapsed" data-plan="' + plan.id + '" style="border:1px solid #e0e0e0;border-radius:8px;padding:12px 14px;cursor:pointer;opacity:0.7;transition:opacity 0.2s" onmouseover="this.style.opacity=1;highlightPlanParcels(\'' + plan.id + '\')" onmouseout="this.style.opacity=0.7;clearPlanHighlight()">';
          html += '<div style="display:flex;justify-content:space-between;align-items:center">';
          html += '<span style="font-size:13px;color:#333">' + plan.name + '</span>';
          html += '<div style="display:flex;align-items:center;gap:8px">';
          html += '<span style="font-size:11px;color:#999">' + plan.siteArea.toLocaleString() + 'm\u00B2 / ' + plan.floors + 'F</span>';
          html += '<span style="font-size:11px;color:#999;background:#f4f6f9;padding:2px 6px;border-radius:4px">' + plan.badge + '</span>';
          html += '</div></div></div>';
        }
      }
    });

    html += '</div>';
    html += '<div style="background:#f7f8fa;border-radius:6px;padding:8px 12px;margin:10px 0 0">';
    html += '<p style="font-size:10px;color:#999;line-height:1.5;margin:0">各プランは隣接筆の形状・容積率・接道条件から算出。地権者の特定と売却意向の分析はプラン選択後に実行されます。</p>';
    html += '</div></div>';

    panel.innerHTML = html;

    // Highlight expanded plan parcels
    var currentPlan = developmentPlans.find(function(dp) { return dp.id === expandedPlanId; });
    if (currentPlan) {
      window._expandedPlanParcels = currentPlan.parcels;
      Object.keys(parcelLayers).forEach(function(pid) {
        parcelLayers[pid].setStyle({ fillColor: '#cccccc', fillOpacity: 0.2, weight: 1, color: '#aaaaaa' });
      });
      currentPlan.parcels.forEach(function(pid) {
        if (parcelLayers[pid]) {
          parcelLayers[pid].setStyle({ fillColor: '#d94f43', fillOpacity: 0.6, weight: 3, color: '#d94f43' });
        }
      });
    }

    // Collapsed card click → expand
    panel.querySelectorAll('.plan-card-collapsed').forEach(function(card) {
      card.addEventListener('click', function() {
        expandedPlanId = this.dataset.plan;
        renderScenarioPanel();
      });
    });

    // Facility tab click
    var selectedFacility = 'complex';
    panel.querySelectorAll('.facility-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        selectedFacility = this.dataset.type;
        panel.querySelectorAll('.facility-tab').forEach(function(t) {
          t.style.borderColor = '#e0e0e0';
          t.style.borderWidth = '1px';
          t.style.color = '#888';
          t.style.background = 'transparent';
        });
        this.style.borderColor = '#0067B3';
        this.style.borderWidth = '2px';
        this.style.color = '#0C447C';
        this.style.background = '#F0F6FD';
        // Update 3D
        var preview = document.getElementById('facility-3d-preview');
        if (preview && typeof create3DBuilding === 'function') {
          preview.innerHTML = '';
          create3DBuilding(preview, null, preview.clientWidth || 350, 160, selectedFacility);
        }
      });
    });

    // Start analysis button
    var startBtn = document.getElementById('scenario-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', function() {
        var planId = this.dataset.plan;
        var plan = developmentPlans.find(function(dp) { return dp.id === planId; });
        if (plan && plan.recommended) {
          window.selectedPlan = plan;
          window._selectedFacility = selectedFacility;
          showAnalysisResults(id, selectedFacility, plan.floorArea);
        } else {
          showToast('デモ版ではPlan Dの分析のみ可能です');
        }
      });
    }

    // Render initial 3D preview
    setTimeout(function() {
      var preview = document.getElementById('facility-3d-preview');
      if (preview && typeof create3DBuilding === 'function') {
        create3DBuilding(preview, null, preview.clientWidth || 350, 160, 'complex');
      }
    }, 100);
    _panelUpdating = false;
  }

  renderScenarioPanel();

  if (guideStep === 4) setTimeout(function() { advanceGuide(5); }, 1000);
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
  _panelUpdating = true;
  currentScreen = 5;
  clearImpactOverlay();
  const p = parcelsData.find(d => d.id === id);
  if (!p) return;

  // Expand panel to 500px
  setPanelWidth(500);
  var panTarget;
  if (window.selectedPlan && window.selectedPlan.parcels) {
    var pLats = [];
    var pLngs = [];
    window.selectedPlan.parcels.forEach(function(pid) {
      var pp = parcelsData.find(function(d) { return d.id === pid; });
      if (pp) {
        var c = getParcelCenter(pp);
        pLats.push(c[0]);
        pLngs.push(c[1]);
      }
    });
    if (pLats.length > 0) {
      panTarget = [pLats.reduce(function(a,b){return a+b},0)/pLats.length, pLngs.reduce(function(a,b){return a+b},0)/pLngs.length];
    } else {
      panTarget = getParcelCenter(p);
    }
  } else {
    panTarget = getParcelCenter(p);
  }
  window._planCenter = panTarget;
  map.setView(panTarget, 17);

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
        <button class="analysis-tab" data-tab="risk" onclick="switchAnalysisTab('risk','${p.id}','${facilityType}',${floorArea})">リスク</button>
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
  setTimeout(function() {
    var container = document.getElementById('three-analysis-volume');
    if (container) create3DBuilding(container, p, 350, 250, facilityType);
  }, 100);
  _panelUpdating = false;
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
  var ba = p.buildableArea || Math.round(p.area * p.far / 100 * 0.93);
  var rr = (p.rentableRatio || 73) / 100;
  var landCost = Math.round(p.landPrice * p.area / 100);
  var designFee = Math.round(p.cost * 0.08);
  var expenses = Math.round(p.cost * 0.05);
  var contingency = Math.round(p.cost * 0.10);
  var totalInvest = landCost + p.cost + designFee + expenses + contingency;
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
    '<div class="metric-card"><div class="metric-label">NOI利回り</div><div class="metric-value" style="font-size:16px">' + p.noiYield + '%</div></div>' +
    '<div class="metric-card"><div class="metric-label">想定IRR</div><div class="metric-value" style="font-size:16px">' + p.irr + '%</div></div>' +
    '<div class="metric-card"><div class="metric-label">粗利率</div><div class="metric-value" style="font-size:16px">' + p.grossMargin + '%</div></div>' +
    '<div class="metric-card"><div class="metric-label">DSCR</div><div class="metric-value" style="font-size:16px;color:' + dscrColor + '">' + dscrVal + '</div></div>' +
    '</div>' +
    '<h4 style="font-size:13px;color:#888;margin-bottom:8px">初期投資</h4>' +
    '<table class="detail-table" style="margin-bottom:12px">' +
    '<tr><td>土地取得費</td><td>' + landCost.toLocaleString() + '百万円</td></tr>' +
    '<tr><td>建築工事費</td><td>' + p.cost.toLocaleString() + '百万円</td></tr>' +
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
  _panelUpdating = true;
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

  var alertHTML = '';
  if (window._isAlternativeArea) {
    alertHTML =
      '<div style="background:#EAF3DE;border:1px solid #97C459;border-radius:8px;padding:14px 16px;margin:16px 0">' +
        '<div style="display:flex;align-items:center;gap:8px;margin:0 0 8px">' +
          '<div style="width:20px;height:20px;border-radius:50%;background:#639922;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">✓</div>' +
          '<span style="font-size:13px;font-weight:500;color:#27500A">権利整理が容易な候補地です</span>' +
        '</div>' +
        '<p style="font-size:12px;color:#3B6D11;line-height:1.6;margin:0">対象エリアの全筆が単独所有であり、抵当権の設定もありません。地権者との個別交渉により、比較的短期間での用地取得が見込めます。</p>' +
      '</div>';
  } else {
    alertHTML =
      '<div style="background:#FCEBEB;border:1px solid #E24B4A;border-radius:8px;padding:14px 16px;margin:16px 0">' +
        '<div style="display:flex;align-items:center;gap:8px;margin:0 0 8px">' +
          '<div style="width:20px;height:20px;border-radius:50%;background:#E24B4A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;flex-shrink:0">!</div>' +
          '<span style="font-size:13px;font-weight:500;color:#791F1F">用地取得リスクが検出されました</span>' +
        '</div>' +
        '<p style="font-size:12px;color:#A32D2D;line-height:1.6;margin:0 0 10px">P03（芝大門1-3）の登記情報を分析した結果、以下のリスクが特定されました。</p>' +
        '<div style="background:#fff;border-radius:6px;padding:10px 12px;margin:0 0 10px">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin:0 0 6px"><span style="color:#791F1F">所有形態</span><span style="font-weight:500">共有（3名）</span></div>' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin:0 0 6px"><span style="color:#791F1F">抵当権</span><span style="font-weight:500">あり（2件、異なる債権者）</span></div>' +
          '<div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:#791F1F">推定取得難易度</span><span style="color:#E24B4A;font-weight:500">高（全権利者の合意に12〜18ヶ月）</span></div>' +
        '</div>' +
        '<p style="font-size:11px;color:#A32D2D;line-height:1.5;margin:0">この筆を含むプランの実行には、権利整理に相当の期間を要する可能性があります。</p>' +
      '</div>' +
      '<div style="background:#E6F1FB;border:1px solid #0067B3;border-radius:8px;padding:14px 16px;margin:0 0 16px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin:0 0 8px">' +
          '<div style="width:20px;height:20px;border-radius:50%;background:#0067B3;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">AI</div>' +
          '<span style="font-size:13px;font-weight:500;color:#0C447C">代替候補エリアが見つかりました</span>' +
        '</div>' +
        '<p style="font-size:12px;color:#0C447C;line-height:1.6;margin:0">分析対象エリアの周辺500m圏内で、同等の開発ポテンシャルを持ち、かつ権利整理が比較的容易な候補地を3件特定しました。</p>' +
      '</div>';
  }

  // Draw alternative area parcels on map
  if (!window._isAlternativeArea) {
    window._altAreaLayers = window._altAreaLayers || [];
    window._altAreaLayers.forEach(function(l) { map.removeLayer(l); });
    window._altAreaLayers = [];

    alternativeAreas.forEach(function(area) {
      area.parcels.forEach(function(ap) {
        if (ap.polygon) {
          var latlngs = ap.polygon.map(function(c) { return [c[0], c[1]]; });
          var layer = L.polygon(latlngs, {
            color: '#0067B3',
            fillColor: '#0067B3',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4,4'
          }).addTo(map);
          window._altAreaLayers.push(layer);
        }
      });
    });

    var allPoints = [];
    if (window._planCenter) allPoints.push(window._planCenter);
    alternativeAreas.forEach(function(area) { allPoints.push(area.center); });
    if (allPoints.length > 1) {
      var bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }

  var altCardsHTML = '';
  if (!window._isAlternativeArea) {
    altCardsHTML = `
      <div id="alt-recommend" style="display:none">
        <div style="background:#0067B3;color:#fff;padding:12px 16px;border-radius:8px 8px 0 0;display:flex;align-items:center;gap:8px">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="#FFD600"/></svg>
          <div>
            <div style="font-size:15px;font-weight:600">AI分析結果</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7)">より有望な近隣エリアが3件見つかりました</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;padding:12px;background:#f7f8fa;border-radius:0 0 8px 8px;margin-bottom:4px">
          <div class="alt-card" style="flex:1;border:2px solid #e0e0e0;margin-bottom:0;opacity:0.85;border-radius:8px;overflow:visible;position:relative" onmouseover="highlightAltArea('alt1')" onmouseout="unhighlightAltAreas()">
            <div style="background:#f4f6f9;padding:10px 12px;border-radius:6px 6px 0 0;margin:-12px -12px 10px;display:flex;align-items:center;justify-content:space-between">
              <strong style="font-size:13px;display:block">新橋四丁目</strong>
              <span style="font-size:10px;color:#888;background:#e0e0e0;padding:1px 6px;border-radius:3px">候補</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px">
              <div style="font-size:22px;font-weight:700;color:#0067B3">80</div>
              <div style="font-size:11px;color:#888">NOI 4.0%</div>
            </div>
            <div style="background:#E6F1FB;border-radius:4px;padding:6px 8px;font-size:11px;color:#333;margin-bottom:10px;line-height:1.5">商業地域で高容積率の開発が可能</div>
            <div style="border:1px solid #ccc;color:#999;text-align:center;padding:8px;border-radius:6px;font-size:12px;cursor:default">デモ版では調査不可</div>
          </div>
          <div class="alt-card" style="flex:1;border:2px solid #0067B3;margin-bottom:0;animation:card-nudge 2s ease-in-out infinite, pulse-border 2s ease-in-out infinite;position:relative;border-radius:8px;overflow:visible" onmouseover="highlightAltArea('alt2')" onmouseout="unhighlightAltAreas()">
            <span style="position:absolute;top:-8px;right:8px;background:#c0392b;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:3px">推奨</span>
            <div style="background:#E8F2FB;padding:10px 12px;border-radius:6px 6px 0 0;margin:-12px -12px 10px">
              <strong style="font-size:13px;display:block">芝公園三丁目</strong>
            </div>
            <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px">
              <div style="font-size:22px;font-weight:700;color:#0067B3">84</div>
              <div style="font-size:11px;color:#888">NOI 4.2%</div>
            </div>
            <div style="background:#EAF3DE;border-radius:4px;padding:6px 8px;font-size:11px;color:#333;margin-bottom:10px;line-height:1.5">権利整理が容易で大規模開発の余地あり</div>
            <button class="alt-explore-btn" onclick="exploreAlternativeArea('alt2')" style="height:32px;font-size:12px;background:#0067B3;color:#fff;border:none;border-radius:6px;width:100%;cursor:pointer;font-family:inherit">このエリアを調査</button>
          </div>
          <div class="alt-card" style="flex:1;border:2px solid #e0e0e0;margin-bottom:0;opacity:0.7;border-radius:8px;overflow:visible;position:relative">
            <div style="background:#f4f6f9;padding:10px 12px;border-radius:6px 6px 0 0;margin:-12px -12px 10px;display:flex;align-items:center;justify-content:space-between">
              <strong style="font-size:13px;display:block">浜松町二丁目</strong>
              <span style="font-size:10px;color:#888;background:#e0e0e0;padding:1px 6px;border-radius:3px">候補</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px">
              <div style="font-size:22px;font-weight:700;color:#0067B3">76</div>
              <div style="font-size:11px;color:#888">NOI 3.8%</div>
            </div>
            <div style="background:#FAEEDA;border-radius:4px;padding:6px 8px;font-size:11px;color:#333;margin-bottom:10px;line-height:1.5">将来価値の上昇余地あり</div>
            <button class="alt-explore-btn" onclick="showToast('詳細データを準備中です')" style="height:32px;font-size:12px;background:transparent;color:#0067B3;border:1px solid #0067B3;border-radius:6px;width:100%;cursor:pointer;font-family:inherit">このエリアを調査</button>
          </div>
        </div>
        <div style="text-align:center;margin-bottom:12px">
          <button style="background:none;border:none;color:#0067B3;font-size:12px;cursor:pointer;font-family:inherit;font-weight:500">...他の候補エリアを表示</button>
        </div>
      </div>`;
  }

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

      ${altCardsHTML}

      ${alertHTML}

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

  _panelUpdating = false;
  // Delayed AI recommendation + guide
  setTimeout(() => {
    const altEl = document.getElementById('alt-recommend');
    if (altEl) {
      altEl.style.display = 'block';
      altEl.style.opacity = '0';
      altEl.style.transition = 'opacity 1.0s';
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
  window._isAlternativeArea = true;
  var area = alternativeAreas.find(function(a) { return a.areaId === areaId; });
  if (!area) return;

  // Save original data
  if (!originalParcelsData) {
    originalParcelsData = [...parcelsData];
  }

  // Clear existing layers
  Object.values(parcelLayers).forEach(function(l) { map.removeLayer(l); });
  Object.values(parcelTooltips).forEach(function(t) { map.removeLayer(t); });
  if (window._altAreaLayers) {
    window._altAreaLayers.forEach(function(l) { map.removeLayer(l); });
    window._altAreaLayers = [];
  }
  parcelLayers = {};
  parcelTooltips = {};

  parcelsData = area.parcels;
  currentAreaLabel = area.areaName;

  map.flyTo(area.center, 17, { duration: 1 });

  clearGuideUI();
  setTimeout(function() {
    drawParcels();

    var totalArea = 0;
    var parcelIds = [];
    parcelsData.forEach(function(p) {
      totalArea += p.area;
      parcelIds.push(p.id);
    });

    window.selectedPlan = {
      id: 'altPlan',
      name: 'Plan D: 中規模（' + area.areaName + '）',
      parcels: parcelIds,
      siteArea: totalArea,
      floorArea: Math.round(totalArea * 7 * 0.93),
      floors: 22,
      badge: parcelIds.length + '筆',
      description: area.areaName + 'エリアの開発プラン',
      recommended: true
    };

    var firstParcel = parcelsData[0];
    showAnalysisResults(firstParcel.id, 'complex', window.selectedPlan.floorArea);
    if (guideStep === 13) advanceGuide(14);
  }, 1200);
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
  if (tab === 'map') {
    document.getElementById('map-view').style.display = '';
    document.getElementById('hearing-view').style.display = 'none';
    document.getElementById('tab-map').style.borderBottomColor = '#5a8a3c';
    document.getElementById('tab-map').style.color = '#3d6b24';
    document.getElementById('tab-map').style.fontWeight = '500';
    document.getElementById('tab-hearing').style.borderBottomColor = 'transparent';
    document.getElementById('tab-hearing').style.color = '#999';
    document.getElementById('tab-hearing').style.fontWeight = '400';
    if (document.getElementById('hearing-float-btn')) document.getElementById('hearing-float-btn').style.display = 'flex';
    if (document.getElementById('reset-float-btn')) document.getElementById('reset-float-btn').style.display = 'flex';
    var gb = document.querySelector('.guide-bubble');
    if (gb && guideStep > 0) gb.style.display = '';
    var gpf = document.querySelectorAll('.guide-pulse-fixed');
    gpf.forEach(function(el) { el.style.display = ''; });
    if (typeof map !== 'undefined') map.invalidateSize();
  } else {
    document.getElementById('map-view').style.display = 'none';
    document.getElementById('hearing-view').style.display = '';
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
  if (lm) lm.classList.add('hidden');
  var list = document.getElementById('hearing-questions-list');
  var currentCat = '';
  var html = '';
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
    html += '<div class="hearing-question-text">' + q.sort_order + '. ' + q.question_text + '</div>';
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
        html += '<button class="hearing-option-btn" onclick="selectHearingOption(this, ' + q.id + ', \'' + opt.replace(/'/g, "\\'") + '\', false)">' + opt + '</button>';
      });
      html += '</div>';
    } else if (q.question_type === 'multi_select' && q.options) {
      var mopts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      html += '<div class="hearing-options-group">';
      mopts.forEach(function(opt) {
        html += '<button class="hearing-option-btn" onclick="selectHearingOption(this, ' + q.id + ', \'' + opt.replace(/'/g, "\\'") + '\', true)">' + opt + '</button>';
      });
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
  { category: '全体印象', sort_order: 3, question_text: 'ご自身のネットワーク内の顧客企業で、このツールを使えそうな企業像は思い浮かびますか。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 4, question_text: '土地取得に関して、現在どのようなツールやサービスを使っていますか。プロセスや業務ごとに教えてください。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 5, question_text: '用地評価のプロセスで最も時間がかかっている作業は何ですか。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 6, question_text: '競合他社の開発動向の把握はどのように行っていますか。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 7, question_text: '地権者情報の調査にどの程度の工数をかけていますか。', question_type: 'single_select', options: ['1人日以内', '2〜5人日', '5〜10人日', '10人日以上'] },
  { category: '業界・業務実態', sort_order: 8, question_text: '現在の業務で「見送っている土地」や「機会損失」が発生していると感じる領域はありますか。', question_type: 'free_text', options: null },
  { category: '業界・業務実態', sort_order: 9, question_text: '用地探索から地権者データ取得まで一気通貫でできることに価値を感じますか。', question_type: 'free_text', options: null },
  { category: 'デモに対するフィードバック', sort_order: 10, question_text: '本日のデモで最も印象に残った機能はどれですか。', question_type: 'single_select', options: ['筆スコアリング', '開発シナリオ自動生成', '事業収支シミュレーション', '開発インパクト推計', '地権者分析', '代替候補探索'] },
  { category: 'デモに対するフィードバック', sort_order: 11, question_text: '「この機能があれば業務が大きく改善される」と思うものを挙げてください。', question_type: 'free_text', options: null },
  { category: 'デモに対するフィードバック', sort_order: 12, question_text: '現在の業務フローのどこにこのツールを組み込めると思いますか。', question_type: 'free_text', options: null },
  { category: 'デモに対するフィードバック', sort_order: 13, question_text: 'デモに含まれていないが、あるべきだと思う機能はありますか。', question_type: 'free_text', options: null },
  { category: 'デモに対するフィードバック', sort_order: 14, question_text: '導入にあたって懸念されることはどれですか。', question_type: 'multi_select', options: ['データソースの信頼性', 'セキュリティ・コンプライアンス', 'UIの学習コスト', '既存システムとの統合', '価格', '導入後のサポート体制', 'その他'] },
  { category: '市場性・商業化', sort_order: 15, question_text: 'このようなツールに対して、どの程度の価格が適切だと感じますか。', question_type: 'single_select', options: ['月額10万円以下', '月額10〜30万円', '月額30〜100万円', '月額100万円以上', '初期費用＋月額のモデルが適切'] },
  { category: '市場性・商業化', sort_order: 16, question_text: 'どのような業界・業種・企業規模が初期のお客様候補になりそうですか。', question_type: 'multi_select', options: ['大手デベロッパー', '中堅デベロッパー', '地域デベロッパー', 'アセットマネジメント会社', '不動産仲介', '金融機関', '自治体', 'その他'] },
  { category: '市場性・商業化', sort_order: 17, question_text: 'まず試してみたい機能があるとすればどれですか。', question_type: 'single_select', options: ['筆スコアリング', '開発シナリオ自動生成', '事業収支シミュレーション', '開発インパクト推計', '地権者分析', '代替候補探索'] }
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
  } else {
    insertOrder = afterSortOrder + 0.5;
  }
  await sbFetch('/questions', {
    method: 'POST',
    body: JSON.stringify({ category: category, sort_order: insertOrder, question_text: text, question_type: 'free_text', is_active: true })
  });
  await renormalizeSortOrders();
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

function selectHearingOption(btn, qid, value, isMulti) {
  if (isMulti) {
    btn.classList.toggle('multi-selected');
    var selected = [];
    btn.parentElement.querySelectorAll('.multi-selected').forEach(function(b) { selected.push(b.textContent); });
    saveHearingMemo(qid, selected.join(', '));
  } else {
    btn.parentElement.querySelectorAll('.hearing-option-btn').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    saveHearingMemo(qid, value);
  }
}

function selectHearingRating(btn, qid, value) {
  btn.parentElement.querySelectorAll('.hearing-rating-btn').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
  saveHearingMemo(qid, String(value));
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
