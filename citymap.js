// عارض خريطة مدينة سوهاج الجديدة داخل التطبيق (Canvas) — بيانات متجهة محوّلة من ملف الـ DWG
(function () {
  var BASE = 'citymap/';
  var host, cv, ctx, meta, overview, chunks = {}, loading = {}, pal = [];
  var view = { x: 0, y: 0, s: 0.02 }; // x,y = مركز الشاشة بالمتر (نسبةً لنقطة الأصل)، s = بكسل لكل متر
  var minS = 0.01, maxS = 12, dpr = 1, raf = 0, ready = false, started = false, drag = null, pointers = {}, pinch = null;

  function fixColor(c) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r + g + b < 120) ? '#d0d0d0' : c; }
  function decode(rec, start) { // [ci, dx,dy,...] بوحدة 0.1 متر
    var pts = [], x = 0, y = 0, minx = 1e12, miny = 1e12, maxx = -1e12, maxy = -1e12;
    for (var i = start; i < rec.length; i += 2) { x += rec[i]; y += rec[i + 1]; var mx = x / 10, my = y / 10; pts.push(mx, my); if (mx < minx) minx = mx; if (mx > maxx) maxx = mx; if (my < miny) miny = my; if (my > maxy) maxy = my; }
    return { c: pal[rec[0]], p: pts, b: [minx, miny, maxx, maxy] };
  }
  function prep(data) {
    var f = (data.f || []).map(function (r) { return decode(r, 1); });
    var t = (data.t || []).map(function (r) { return { s: r[0], x: r[1] / 10, y: r[2] / 10, h: r[3] / 10, r: r[4], c: pal[r[5]], al: r[6] }; });
    return { f: f, t: t };
  }
  function getJSON(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }

  function resize() {
    if (!cv) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    draw();
  }
  function w2sx(x) { return (x - view.x) * view.s + host.clientWidth / 2; }
  function w2sy(y) { return (view.y - y) * view.s + host.clientHeight / 2; }
  function visibleRect() {
    var w = host.clientWidth / view.s, h = host.clientHeight / view.s;
    return [view.x - w / 2, view.y - h / 2, view.x + w / 2, view.y + h / 2];
  }
  function request() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }

  function needChunks(r) {
    if (view.s < 0.45 || !meta) return [];
    var C = meta.cell, out = [], x0 = Math.max(0, Math.floor(r[0] / C)), x1 = Math.min(meta.nx - 1, Math.floor(r[2] / C)), y0 = Math.max(0, Math.floor(r[1] / C)), y1 = Math.min(meta.ny - 1, Math.floor(r[3] / C));
    for (var i = x0; i <= x1; i++) for (var j = y0; j <= y1; j++) { var k = i + '_' + j; if (meta.cells.indexOf(k) !== -1) out.push(k); }
    return out;
  }
  function loadChunk(k) {
    if (chunks[k] || loading[k]) return;
    loading[k] = true;
    getJSON(BASE + 'c/' + k + '.json').then(function (d) { chunks[k] = prep(d); loading[k] = false; request(); }).catch(function () { loading[k] = false; });
  }

  function drawFeatures(list, r, lw) {
    var byColor = {};
    for (var i = 0; i < list.length; i++) {
      var f = list[i], b = f.b;
      if (b[2] < r[0] || b[0] > r[2] || b[3] < r[1] || b[1] > r[3]) continue;
      (byColor[f.c] = byColor[f.c] || []).push(f);
    }
    ctx.lineWidth = lw; ctx.lineJoin = 'round';
    for (var c in byColor) {
      ctx.beginPath(); ctx.strokeStyle = fixColor(c);
      var arr = byColor[c];
      for (var k = 0; k < arr.length; k++) {
        var p = arr[k].p;
        if ((arr[k].b[2] - arr[k].b[0]) * view.s < 0.6 && (arr[k].b[3] - arr[k].b[1]) * view.s < 0.6) continue;
        ctx.moveTo(w2sx(p[0]), w2sy(p[1]));
        for (var m = 2; m < p.length; m += 2) ctx.lineTo(w2sx(p[m]), w2sy(p[m + 1]));
      }
      ctx.stroke();
    }
  }
  function drawTexts(list, r) {
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    for (var i = 0; i < list.length; i++) {
      var t = list[i], px = t.h * view.s;
      if (px < 5 || t.x < r[0] - 20 || t.x > r[2] + 20 || t.y < r[1] - 20 || t.y > r[3] + 20) continue;
      if (px > 90) px = 90;
      ctx.save(); ctx.translate(w2sx(t.x), w2sy(t.y)); if (t.r) ctx.rotate(-t.r * Math.PI / 180);
      ctx.font = '600 ' + px + 'px Cairo, Tahoma, sans-serif'; ctx.fillStyle = fixColor(t.c);
      if (!t.al) ctx.textAlign = 'left'; else ctx.textAlign = 'center';
      ctx.fillText(t.s, 0, -px * 0.4 * (t.al ? 0 : -1));
      ctx.restore();
    }
  }
  function draw() {
    if (!ctx || !host.clientWidth) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, host.clientWidth, host.clientHeight);
    if (!ready) return;
    var r = visibleRect();
    drawFeatures(overview.f, r, view.s > 1.5 ? 1.2 : 1);
    var keys = needChunks(r);
    var lw = view.s > 3 ? 1.1 : 0.8;
    for (var i = 0; i < keys.length; i++) {
      var ch = chunks[keys[i]];
      if (!ch) { loadChunk(keys[i]); continue; }
      drawFeatures(ch.f, r, lw);
      if (view.s >= 1.2) drawTexts(ch.t, r);
    }
    var z = document.getElementById('cityMapZoomInfo'); if (z) z.textContent = 'المقياس: ' + (view.s < 0.45 ? 'عام' : view.s < 1.2 ? 'متوسط (قطع الأراضي)' : 'تفصيلي (أرقام القطع)');
  }

  function clampView() {
    if (!meta) return;
    view.s = Math.max(minS, Math.min(maxS, view.s));
    view.x = Math.max(-500, Math.min(meta.w + 500, view.x));
    view.y = Math.max(-500, Math.min(meta.h + 500, view.y));
  }
  function fit() {
    if (!meta || !host.clientWidth) return;
    view.s = Math.min(host.clientWidth / meta.w, host.clientHeight / meta.h) * 0.95;
    minS = view.s * 0.8;
    view.x = meta.w / 2; view.y = meta.h / 2;
    request();
  }
  function zoomAt(sx, sy, factor) {
    var wx = (sx - host.clientWidth / 2) / view.s + view.x, wy = view.y - (sy - host.clientHeight / 2) / view.s;
    view.s = Math.max(minS, Math.min(maxS, view.s * factor));
    view.x = wx - (sx - host.clientWidth / 2) / view.s; view.y = wy + (sy - host.clientHeight / 2) / view.s;
    clampView(); request();
  }
  function pos(e) { var b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; }

  function bind() {
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); pointers[e.pointerId] = pos(e); if (Object.keys(pointers).length === 2) { var a = Object.values(pointers); pinch = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }; } });
    cv.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return;
      var p = pos(e), old = pointers[e.pointerId]; pointers[e.pointerId] = p;
      var ids = Object.keys(pointers);
      if (ids.length >= 2 && pinch) {
        var a = Object.values(pointers), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (pinch.d > 0) zoomAt((a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2, d / pinch.d);
        pinch.d = d;
      } else {
        view.x -= (p.x - old.x) / view.s; view.y += (p.y - old.y) / view.s; clampView(); request();
      }
    });
    function up(e) { delete pointers[e.pointerId]; if (Object.keys(pointers).length < 2) pinch = null; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); var p = pos(e); zoomAt(p.x, p.y, e.deltaY < 0 ? 1.25 : 0.8); }, { passive: false });
    cv.addEventListener('dblclick', function (e) { var p = pos(e); zoomAt(p.x, p.y, 2); });
    window.addEventListener('resize', resize);
  }

  window.cityMapInit = function () {
    host = document.getElementById('cityMapCanvasHost');
    if (!host) return;
    if (started) { resize(); return; }
    started = true;
    cv = document.createElement('canvas'); cv.style.display = 'block'; host.appendChild(cv); ctx = cv.getContext('2d');
    bind(); resize();
    var st = document.getElementById('cityMapStatus'); if (st) st.textContent = 'جاري تحميل الخريطة...';
    Promise.all([getJSON(BASE + 'meta.json'), getJSON(BASE + 'overview.json')]).then(function (res) {
      meta = res[0]; pal = meta.pal; overview = prep(res[1]); ready = true;
      if (st) st.style.display = 'none';
      fit(); resize();
    }).catch(function () { if (st) st.textContent = 'تعذر تحميل الخريطة. تأكد من الاتصال وأعد المحاولة.'; started = false; });
  };
  window.cityMapZoom = function (f) { zoomAt(host.clientWidth / 2, host.clientHeight / 2, f); };
  window.cityMapReset = function () { fit(); };
  window.cityMapResize = function () { resize(); };
})();
