/* real view counter: a card counts once per device per post per day, after it was on screen (half visible) for 1 second. Counted server-side. No seeded numbers. */
(function () {
  'use strict';
  var URL_ = 'https://ddjdejmzuucdbsprigbz.supabase.co', KEY = 'sb_publishable_cAUPNPGXZyrRY5-UN2wI5w_dERXX7hE', MIN_VISITORS = 100;
  if (/bot|crawl|spider|headlesschrome/i.test(navigator.userAgent) && !/[?&]vtest=1/.test(location.search)) return;
  function rpc(fn, body) { return fetch(URL_ + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  var dev = localStorage.getItem('sp_dev'); if (!dev || dev.length < 16) { dev = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); localStorage.setItem('sp_dev', dev); }
  var day = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), done = {}, counts = {};
  try { done = JSON.parse(localStorage.getItem('sp_vd') || '{}'); if (done._d !== day) done = { _d: day }; } catch (e) { done = { _d: day }; }
  function fmt(n) { return Number(n).toLocaleString('ar-EG'); }
  function paint() {
    document.querySelectorAll('[data-pv]').forEach(function (e) { var n = counts[e.getAttribute('data-pv')]; if (n > 0) { e.textContent = '👁 ' + fmt(n) + ' مشاهدة'; e.style.display = 'block'; } });
  }
  function load() { rpc('views_public').then(function (d) { if (!d) return; counts = d.posts || {}; paint(); var c = document.getElementById('pvTotal'); if (d.visitors >= MIN_VISITORS) { if (!c) { c = document.createElement('div'); c.id = 'pvTotal'; c.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:50;background:#0b1626cc;color:#e6c36a;font-size:11px;font-weight:800;border-radius:12px;padding:5px 10px'; document.body.appendChild(c); } c.textContent = '👥 ' + fmt(d.visitors) + ' زائر'; } else if (c) c.remove(); }); }
  var timers = {}, io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { var id = en.target.getAttribute('data-pid'); if (!id) return;
      if (en.isIntersecting && !done[id] && !timers[id]) timers[id] = setTimeout(function () { delete timers[id]; if (done[id]) return; done[id] = 1; localStorage.setItem('sp_vd', JSON.stringify(done)); rpc('track_view', { p_post: String(id), p_device: dev }).then(function () { setTimeout(load, 600); }); }, 1000);
      else if (!en.isIntersecting && timers[id]) { clearTimeout(timers[id]); delete timers[id]; } });
  }, { threshold: 0.5 });
  var seen = new WeakSet();
  function scan() { document.querySelectorAll('[data-pid]').forEach(function (e) { if (!seen.has(e)) { seen.add(e); io.observe(e); } }); paint(); }
  var t; new MutationObserver(function () { clearTimeout(t); t = setTimeout(scan, 300); }).observe(document.body, { childList: true, subtree: true });
  rpc('track_visit', { p_device: dev }); load(); scan();
})();
