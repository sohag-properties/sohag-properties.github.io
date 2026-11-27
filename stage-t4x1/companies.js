/* "الشركات داخل المدينة": public section. Data comes from the companies_public() function. */
(function () {
  'use strict';
  var URL_ = 'https://ddjdejmzuucdbsprigbz.supabase.co', KEY = 'sb_publishable_cAUPNPGXZyrRY5-UN2wI5w_dERXX7hE';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var C = 'background:#13233b;border:1px solid #c9a24a55;border-radius:16px;padding:14px;margin:10px 0';
  var B = 'background:linear-gradient(90deg,#c9a24a,#e6c36a);color:#0b1626;font-weight:900;border:0;border-radius:12px;padding:10px 16px;cursor:pointer;font-size:14px;text-decoration:none;display:inline-block';
  var B2 = 'background:#1d3354;color:#e6c36a;font-weight:800;border:1px solid #c9a24a66;border-radius:12px;padding:9px 14px;cursor:pointer;font-size:13px;text-decoration:none;display:inline-block';
  var D = null, cur = null;
  function root() { var m = document.getElementById('coModal'); if (!m) { m = document.createElement('div'); m.id = 'coModal'; m.style.cssText = 'position:fixed;inset:0;z-index:9980;background:#0b1626;overflow:auto;direction:rtl;color:#fff;display:none'; document.body.appendChild(m); } return m; }
  window.coClose = function () { root().style.display = 'none'; document.body.style.overflow = ''; };
  function shell(h) { var m = root(); m.style.display = 'block'; document.body.style.overflow = 'hidden'; m.innerHTML = '<div style="max-width:560px;margin:0 auto;padding:14px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:900;font-size:19px;color:#e6c36a">الشركات داخل المدينة</div><button onclick="coClose()" style="' + B2 + '">إغلاق ✕</button></div>' + h + '</div>'; }
  function img(b, w, r) { if (!b) return ''; var t = b.charAt(0) === 'i' ? 'image/png' : 'image/jpeg'; return '<img src="data:' + t + ';base64,' + b + '" style="width:' + w + 'px;height:' + w + 'px;object-fit:cover;border-radius:' + r + 'px;background:#fff">'; }
  window.coOpen = function () {
    shell('<div style="' + C + '">...</div>');
    fetch(URL_ + '/rest/v1/rpc/companies_public', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: '{}' }).then(function (r) { return r.json(); }).then(function (l) { D = l; list(); }).catch(function () { shell('<div style="' + C + '">تعذر التحميل. حاول تاني</div>'); });
  };
  function list() {
    shell(D.length ? D.map(function (c, i) { return '<button onclick="coShow(' + i + ')" style="' + C + ';display:flex;align-items:center;gap:12px;width:100%;text-align:right;color:#fff;cursor:pointer">' + (c.logo ? img(c.logo, 56, 12) : '<div style="width:56px;height:56px;border-radius:12px;background:#1d3354;display:flex;align-items:center;justify-content:center;font-size:24px">🏢</div>') + '<div style="flex:1"><div style="font-weight:900;font-size:16px">' + esc(c.name) + '</div><div style="font-size:12px;color:#cbd5e1">' + c.projects.length + ' مشروع</div></div><span style="color:#e6c36a">◀</span></button>'; }).join('') : '<div style="' + C + ';text-align:center;color:#cbd5e1">قريبًا: الشركات العاملة داخل مدينة سوهاج الجديدة ومشروعاتها</div>');
  }
  var WA = '201112303616'; function waNum() { var w = D && D[cur] && D[cur].whatsapp; return w ? String(w).replace(/\D/g, '') : WA; }
  function fm(n) { return Number(n).toLocaleString('en-US'); }
  function sec(t) { return '<div style="font-weight:900;margin:16px 0 6px;color:#e6c36a;font-size:15px">' + t + '</div>'; }
  function pimg(p, r) { return '<img loading="lazy" src="' + esc(p) + '" style="width:100%;border-radius:' + (r || 12) + 'px;display:block">'; }
  window.coShow = function (i) {
    var c = D[i], x = c.extra || {}; cur = i;
    var works = (x.works || []).map(function (w) { return '<div style="display:flex;gap:10px;margin:8px 0"><div style="min-width:48px;height:48px;border-radius:50%;border:2px solid #c9a24a;color:#e6c36a;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center">' + esc(w.year) + '</div><div style="flex:1;font-size:13px;line-height:1.7">' + esc(w.text) + (w.img ? '<div style="display:flex;gap:6px;margin-top:6px">' + w.img.map(function (u) { return '<div style="flex:1">' + pimg(u, 10) + '</div>'; }).join('') + '</div>' : '') + '</div></div>'; }).join('');
    shell('<button onclick="coList()" style="' + B2 + ';margin-top:8px">◀ كل الشركات</button>' +
      (x.cover ? '<div style="margin-top:10px">' + pimg(x.cover, 16) + '</div>' : '') +
      '<div style="' + C + '"><div style="display:flex;gap:12px;align-items:center">' + (c.logo ? '<img src="data:image/jpeg;base64,' + c.logo + '" style="width:96px;border-radius:12px">' : '') + '<div><div style="font-weight:900;font-size:18px">' + esc(c.name) + '</div>' + (x.tagline ? '<div style="font-size:12px;color:#e6c36a;margin-top:3px">' + esc(x.tagline) + '</div>' : '') + (x.since ? '<div style="font-size:12px;color:#cbd5e1">منذ ' + x.since + '</div>' : '') + '</div></div>' + (c.about ? '<div style="margin-top:10px;font-size:13px;color:#e2e8f0;line-height:1.8;white-space:pre-wrap">' + esc(c.about) + '</div>' : '') +
      '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">' + (c.phone ? '<a href="tel:' + esc(c.phone) + '" style="' + B + '">اتصال</a>' : '') + (c.whatsapp ? '<a target="_blank" rel="noopener" href="https://wa.me/' + String(c.whatsapp).replace(/\D/g, '') + '" style="' + B2 + '">واتساب</a>' : '') + (c.website ? '<a target="_blank" rel="noopener" href="' + esc(/^https?:/.test(c.website) ? c.website : 'https://' + c.website) + '" style="' + B2 + '">الموقع</a>' : '') + '</div></div>' +
      (x.features ? sec('ما يميزنا') + '<div style="display:flex;gap:6px;flex-wrap:wrap">' + x.features.map(function (f) { return '<span style="background:#1d3354;border:1px solid #c9a24a66;border-radius:10px;padding:6px 10px;font-size:12px">' + esc(f) + '</span>' }).join('') + '</div>' : '') +
      (x.vision ? sec('رؤيتنا') + '<div style="font-size:13px;line-height:1.8">' + esc(x.vision) + '</div>' : '') + (x.mission ? sec('رسالتنا') + '<div style="font-size:13px;line-height:1.8">' + esc(x.mission) + '</div>' : '') +
      (x.values ? sec('قيمنا') + '<div style="font-size:13px">' + x.values.map(esc).join(' • ') + '</div>' : '') +
      (works ? sec('أعمالنا السابقة') + '<div style="' + C + '">' + works + '</div>' : '') +
      sec('المشروعات') +
      (c.projects.length ? c.projects.map(function (p, j) { var e = p.extra || {}; return '<button onclick="coProj(' + i + ',' + j + ')" style="' + C + ';width:100%;text-align:right;color:#fff;cursor:pointer;display:block">' + (e.hero ? pimg(e.hero, 12) : (p.photo ? '<img src="data:image/jpeg;base64,' + p.photo + '" style="width:100%;border-radius:12px">' : '')) + '<div style="font-weight:900;margin-top:8px;font-size:16px">' + esc(p.name) + '</div><div style="font-size:12px;color:#e6c36a">' + esc([p.kind, p.status].filter(Boolean).join(' - ')) + '</div><div style="margin-top:8px;color:#e6c36a;font-size:13px;font-weight:800">عرض المشروع ◀</div></button>'; }).join('') : '<div style="' + C + ';color:#cbd5e1;font-size:13px">لا توجد مشروعات مضافة بعد</div>'));
  };
  function vid(u) { var m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/.exec(u || ''); if (m) return '<iframe src="https://www.youtube.com/embed/' + m[1] + '" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px" allowfullscreen></iframe>'; return u ? '<a target="_blank" rel="noopener" href="' + esc(u) + '" style="' + B + '">▶ مشاهدة الفيديو</a>' : ''; }
  function bookUrl(p, u) { var t = 'السلام عليكم، عايز أحجز ' + (u ? (u.type === 'shop' ? 'محل رقم ' : 'مكتب رقم ') + u.no + ' في ' : '') + p.name + ' (' + D[cur].name + ')'; return 'https://wa.me/' + waNum() + '?text=' + encodeURIComponent(t); }
  function row(k, v, hl) { return '<div style="display:flex;justify-content:space-between;gap:8px;padding:7px 10px;border-top:1px solid #ffffff14;font-size:13px' + (hl ? ';background:#c9a24a22;font-weight:900;color:#e6c36a' : '') + '"><span style="color:#cbd5e1' + (hl ? ';color:#e6c36a' : '') + '">' + k + '</span><span>' + v + '</span></div>'; }

  function addM(d, m) { var x = new Date(d.getTime()); var dd = x.getDate(); x.setDate(1); x.setMonth(x.getMonth() + m); var last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(); x.setDate(Math.min(dd, last)); return x; }
  function dstr(d) { return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }); }
  window.coCalc = function (i, j, type, no) {
    var p = D[i].projects[j], u = (p.extra.units || []).filter(function (x) { return x.type === type && x.no === no; })[0], k = type + no;
    var el = document.getElementById('cc-' + k), mode = document.getElementById('ccm-' + k).value, dv = document.getElementById('ccd-' + k).value;
    var start = dv ? new Date(dv + 'T12:00:00') : new Date(), down = u.qsT, rest = u.total - down, per = u.qsT, n = Math.round(rest / per), step = 3;
    if (mode === 'm') { per = Math.round(u.qsT / 3); n = n * 3; step = 1; }
    var rows = '', left = rest;
    rows += '<tr style="background:#c9a24a22"><td>مقدم</td><td>' + dstr(start) + '</td><td>' + fm(down) + '</td><td>' + fm(left) + '</td></tr>';
    for (var a = 1; a <= n; a++) { var amt = (a === n) ? left : per; left -= amt; rows += '<tr style="border-top:1px solid #ffffff14"><td>' + a + '</td><td>' + dstr(addM(start, a * step)) + '</td><td>' + fm(amt) + '</td><td>' + fm(left) + '</td></tr>'; }
    el.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;margin-bottom:8px"><div style="flex:1;min-width:120px;background:#1d3354;border-radius:10px;padding:8px">المقدم (5%)<br><b style="color:#e6c36a;font-size:15px">' + fm(down) + ' ج</b></div><div style="flex:1;min-width:120px;background:#1d3354;border-radius:10px;padding:8px">القسط ' + (mode === 'm' ? 'الشهري (تقريبي)' : 'ربع السنوي') + '<br><b style="color:#e6c36a;font-size:15px">' + fm(per) + ' ج</b></div><div style="flex:1;min-width:120px;background:#1d3354;border-radius:10px;padding:8px">عدد الأقساط<br><b style="color:#e6c36a;font-size:15px">' + n + '</b></div></div>' +
      '<div style="max-height:260px;overflow:auto;border-radius:10px"><table style="width:100%;font-size:12px;text-align:center;border-collapse:collapse"><tr style="background:#1d3354;color:#e6c36a;position:sticky;top:0"><td style="padding:6px">#</td><td>التاريخ</td><td>القسط</td><td>المتبقي</td></tr>' + rows + '</table></div>' +
      '<div style="font-size:10px;color:#94a3b8;margin-top:6px">الجدول استرشادي ويُحسب من السعر الإجمالي والمقدم 5% والقسط الربع سنوي في عرض الشركة' + (mode === 'm' ? '. القسط الشهري = القسط الربع سنوي ÷ 3 (تقسيم تقريبي، غير مذكور في العرض)' : '') + '. التواريخ تبدأ من تاريخ التعاقد المختار.</div>';
  };
  function calcBox(i, j, u) {
    var k = u.type + u.no, today = new Date().toISOString().slice(0, 10);
    return '<details ontoggle="if(this.open)coCalc(' + i + ',' + j + ',\'' + u.type + '\',' + u.no + ')" style="margin:0 10px 10px;background:#0f1f35;border:1px solid #c9a24a55;border-radius:12px;padding:8px"><summary style="cursor:pointer;font-weight:900;color:#e6c36a;font-size:13px">🧮 حاسبة الأقساط وجدول السداد</summary><div style="margin-top:8px;display:flex;gap:8px;font-size:12px"><label style="flex:1">تاريخ التعاقد<input id="ccd-' + k + '" type="date" value="' + today + '" onchange="coCalc(' + i + ',' + j + ',\'' + u.type + '\',' + u.no + ')" style="width:100%;padding:6px;border-radius:8px;color:#000"></label><label style="flex:1">نظام القسط<select id="ccm-' + k + '" onchange="coCalc(' + i + ',' + j + ',\'' + u.type + '\',' + u.no + ')" style="width:100%;padding:6px;border-radius:8px;color:#000"><option value="q">ربع سنوي (حسب العرض)</option><option value="m">شهري (تقريبي)</option></select></label></div><div id="cc-' + k + '" style="margin-top:8px"></div></details>';
  }
  var TAB = 'shop';
  window.coTab = function (i, j, t) { TAB = t; coProj(i, j, true); };
  window.coProj = function (i, j, keep) {
    var c = D[i], p = c.projects[j], e = p.extra || {}, us = e.units || []; cur = i; if (!keep) TAB = 'shop';
    var nS = us.filter(function (u) { return u.type === 'shop'; }).length, nO = us.length - nS;
    var cards = us.filter(function (u) { return u.type === TAB; }).map(function (u) {
      var area = u.inner + ' م داخلي' + (u.open ? ' + ' + u.open + ' م أوبن إيريا' : '');
      var down = (u.type === 'shop' && u.no === 3) ? 'يُؤكد عند الحجز' : fm(u.down) + ' ج';
      return '<div style="' + C + ';padding:0;overflow:hidden"><div style="background:linear-gradient(90deg,#c9a24a,#e6c36a);color:#0b1626;font-weight:900;padding:9px 12px;font-size:15px">' + (u.type === 'shop' ? 'محل رقم ' : 'مكتب رقم ') + u.no + (u.desc ? ' <span style="font-size:12px;font-weight:700">(' + esc(u.desc) + ')</span>' : '') + '</div>' +
        '<div style="padding:8px;background:#fff"><img loading="lazy" onclick="coZoom(this.src)" src="' + esc(u.img) + '" style="width:100%;display:block"><div style="font-size:11px;color:#475569;text-align:center">' + (u.type === 'shop' ? 'المربع المظلل في المخطط = موقع المحل داخل المول' : 'المربع المظلل = موقع المكتب داخل الدور') + ' (اضغط للتكبير)</div></div>' +
        row('المساحة', area) + row('المقدم 5%', down) + row('القسط ربع السنوي', fm(u.qsT) + ' ج') + (u.type === 'shop' ? row('التقسيط حتى', '5 سنوات') : row('وديعة الصيانة', fm(u.qsT) + ' ج')) + row('إجمالي السعر', fm(u.total) + ' ج', 1) +
        calcBox(i, j, u) + '<div style="padding:10px"><a target="_blank" rel="noopener" href="' + bookUrl(p, u) + '" style="' + B + ';width:100%;text-align:center;box-sizing:border-box">احجز الان</a></div></div>';
    }).join('');
    var tb = function (t, n, l) { return '<button onclick="coTab(' + i + ',' + j + ',\'' + t + '\')" style="' + (TAB === t ? B : B2) + ';flex:1">' + l + ' (' + n + ')</button>'; };
    shell('<button onclick="coShow(' + i + ')" style="' + B2 + ';margin-top:8px">◀ ' + esc(c.name) + '</button>' + (e.hero ? '<div style="margin-top:10px">' + pimg(e.hero, 16) + '</div>' : '') +
      '<div style="' + C + '"><div style="font-weight:900;font-size:19px">' + esc(p.name) + '</div>' + (e.tagline ? '<div style="color:#e6c36a;font-size:13px">' + esc(e.tagline) + '</div>' : '') + '<div style="font-size:12px;color:#cbd5e1;margin-top:4px">' + esc([p.kind, p.status].filter(Boolean).join(' - ')) + '</div>' + (p.location ? '<div style="font-size:13px;margin-top:6px">📍 ' + esc(p.location) + '</div>' : '') + (e.offer ? '<div style="margin-top:8px;background:#c9a24a22;border:1px solid #c9a24a66;border-radius:10px;padding:8px;font-size:13px;font-weight:800">' + esc(e.offer) + '</div>' : '') + (p.details ? '<div style="font-size:13px;margin-top:8px;white-space:pre-wrap">' + esc(p.details) + '</div>' : '') + (e.amenities ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">' + e.amenities.map(function (f) { return '<span style="background:#1d3354;border-radius:8px;padding:5px 9px;font-size:11px">' + esc(f) + '</span>' }).join('') + '</div>' : '') + '</div>' +
      (p.video ? sec('فيديو المشروع') + vid(p.video) : '') +
      (us.length ? sec('الوحدات المتاحة') + '<div style="display:flex;gap:8px">' + tb('shop', nS, 'المحلات') + tb('office', nO, 'المكاتب (الدور الأول)') + '</div>' + cards : '') +
      '<div style="position:sticky;bottom:0;padding:10px 0;background:linear-gradient(transparent,#0b1626 40%)"><a target="_blank" rel="noopener" href="' + bookUrl(p) + '" style="' + B + ';width:100%;text-align:center;box-sizing:border-box;font-size:17px;padding:14px">احجز الان</a></div>');
  };
  window.coZoom = function (src) { var z = document.createElement('div'); z.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000e;display:flex;align-items:center;justify-content:center;padding:8px'; z.onclick = function () { z.remove(); }; z.innerHTML = '<img src="' + src + '" style="max-width:100%;max-height:100%;background:#fff">'; document.body.appendChild(z); };
  window.coList = list;
  (function btn() { function add() { if (document.getElementById('coBtn')) return; var h = document.querySelector('header .flex.flex-wrap.items-center.gap-1\\.5'); if (!h) return; var b = document.createElement('button'); b.id = 'coBtn'; b.type = 'button'; b.onclick = window.coOpen; b.style.cssText = 'background:#1d3354;color:#e6c36a;border:1px solid #c9a24a99;font-weight:900;font-size:12px;border-radius:12px;padding:8px 12px;cursor:pointer'; b.textContent = '🏢 الشركات داخل المدينة'; h.insertBefore(b, h.firstChild); } if (document.readyState !== 'loading') add(); else document.addEventListener('DOMContentLoaded', add); })();
})();
