/* Update gate: if the server's build.json differs from this page's build, block the app with an "update required" screen. */
(function () {
  'use strict';
  var BUILD = '2026-11-28.1', shown = false;
  function show() {
    if (shown) return; shown = true;
    var d = document.createElement('div'); d.id = 'updGate';
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0b1626;color:#fff;display:flex;align-items:center;justify-content:center;direction:rtl;font-family:Cairo,sans-serif;padding:24px;text-align:center';
    d.innerHTML = '<div style="max-width:360px"><div style="font-size:54px">🔄</div><div style="font-size:22px;font-weight:900;color:#e6c36a;margin:10px 0">لازم تحدّث التطبيق</div><div style="font-size:15px;line-height:1.9;color:#cbd5e1">فيه نسخة جديدة من تطبيق سوهاج الجديدة. اضغط تحديث علشان يشتغل التطبيق.</div><button id="updGo" style="margin-top:18px;background:linear-gradient(90deg,#c9a24a,#e6c36a);color:#0b1626;font-weight:900;border:0;border-radius:14px;padding:12px 34px;font-size:17px;cursor:pointer">تحديث الآن</button></div>';
    document.body.appendChild(d); document.body.style.overflow = 'hidden';
    document.getElementById('updGo').onclick = function () {
      var go = function () { location.reload(); };
      Promise.all([
        ('caches' in window) ? caches.keys().then(function (k) { return Promise.all(k.map(function (x) { return caches.delete(x); })); }) : 0,
        navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(function (r) { return Promise.all(r.map(function (x) { return x.update().catch(function () { }); })); }) : 0
      ]).then(go, go);
    };
  }
  function check() {
    fetch('build.json?_=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.build && j.build !== BUILD) show(); }).catch(function () { });
  }
  window.addEventListener('load', function () { setTimeout(check, 1500); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
  setInterval(check, 10 * 60 * 1000);
})();
