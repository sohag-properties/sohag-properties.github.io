/* "سوق الجملة": محلات تجارية + تلاجات. staging فقط. البيانات من wholesale_public()، والإضافة من لوحة الإدارة (جلسة السحابة). */
(function () {
  'use strict';
  var URL_ = 'https://ddjdejmzuucdbsprigbz.supabase.co', KEY = 'sb_publishable_cAUPNPGXZyrRY5-UN2wI5w_dERXX7hE', PHONE = '01112303616';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return Number(n).toLocaleString('en-US') + ' ج.م'; }
  var C = 'background:#13233b;border:1px solid #c9a24a55;border-radius:16px;padding:14px;margin:10px 0';
  var B = 'background:linear-gradient(90deg,#c9a24a,#e6c36a);color:#0b1626;font-weight:900;border:0;border-radius:12px;padding:10px 16px;cursor:pointer;font-size:14px;text-decoration:none;display:inline-block';
  var B2 = 'background:#1d3354;color:#e6c36a;font-weight:800;border:1px solid #c9a24a66;border-radius:12px;padding:9px 14px;cursor:pointer;font-size:13px;text-decoration:none;display:inline-block';
  var IN = 'width:100%;box-sizing:border-box;background:#0b1626;color:#fff;border:1px solid #c9a24a66;border-radius:10px;padding:10px;font-size:14px;margin:4px 0 8px';
  var D = [], tab = 'shop', admin = false, tok = null, edit = null;
  function root() { var m = document.getElementById('wsModal'); if (!m) { m = document.createElement('div'); m.id = 'wsModal'; m.style.cssText = 'position:fixed;inset:0;z-index:9985;background:#0b1626;overflow:auto;direction:rtl;color:#fff;display:none'; document.body.appendChild(m); } return m; }
  window.wsClose = function () { root().style.display = 'none'; document.body.style.overflow = ''; };
  function shell(h) { var m = root(); m.style.display = 'block'; document.body.style.overflow = 'hidden'; m.innerHTML = '<div style="max-width:560px;margin:0 auto;padding:14px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:900;font-size:19px;color:#e6c36a">🏪 سوق الجملة</div><button onclick="wsClose()" style="' + B2 + '">إغلاق ✕</button></div>' + h + '</div>'; }
  function rpc(fn, body, t) { return fetch(URL_ + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + (t || KEY), 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  window.wsOpen = function () {
    shell('<div style="' + C + '">...</div>');
    Promise.resolve(window.cloudGetToken ? window.cloudGetToken() : null).catch(function () { return null; }).then(function (t) {
      tok = t; admin = !!t;
      return (admin ? rpc('admin_wholesale_list', {}, tok) : rpc('wholesale_public')).then(function (l) { D = l; draw(); });
    }).catch(function () { shell('<div style="' + C + '">تعذر التحميل. حاول تاني</div>'); });
  };
  /* معادلة المتبقي: غيّرها هنا (للمعاينة في النموذج) وفي دالة _ws_remaining في قاعدة البيانات (للعرض) */
  function REMAIN(total, down, paid) { return Math.max(total - (down + paid), 0); }
  function PAIDTOTAL(down, paid, over) { return down + paid + over; }
  var FREQ = { quarterly: 'ربع سنوي', semiannual: 'نصف سنوي', annual: 'سنوي' };
  function YRS(n) { n = Number(n); return n === 1 ? 'سنة' : n === 2 ? 'سنتين' : n + ' سنين'; }
  var ED = []; /* صور التعديل الحالي */
  function shrink(file) { return new Promise(function (res) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.72).split(',')[1]); }; im.onerror = function () { res(null); }; im.src = r.result; }; r.onerror = function () { res(null); }; r.readAsDataURL(file); }); }
  function embed(u) { u = (u || '').trim(); if (!u) return ''; var m;
    if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(u)) return '<video controls playsinline preload="metadata" style="width:100%;max-height:60vh;border-radius:12px;background:#000" src="' + esc(u) + '"></video>';
    if ((m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/.exec(u))) return '<iframe src="https://www.youtube.com/embed/' + m[1] + '" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px" allowfullscreen></iframe>';
    if ((m = /drive\.google\.com\/file\/d\/([\w-]+)/.exec(u))) return '<iframe src="https://drive.google.com/file/d/' + m[1] + '/preview" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px" allowfullscreen></iframe>';
    if ((m = /tiktok\.com\/(?:@[\w.\-]+\/video|embed\/v2)\/(\d{8,25})/.exec(u))) return '<div style="display:flex;justify-content:center"><iframe src="https://www.tiktok.com/embed/v2/' + m[1] + '" style="width:100%;max-width:340px;height:600px;border:0;border-radius:12px" allowfullscreen></iframe></div>';
    if (/facebook\.com|fb\.watch/i.test(u)) return '<iframe src="https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(u) + '&show_text=false" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px" allowfullscreen></iframe>';
    return '<a target="_blank" rel="noopener" href="' + esc(u) + '" style="' + B + '">▶ مشاهدة الفيديو</a>'; }
  window.wsVid = function (id) { var e = document.getElementById('wsv' + id); if (!e) return; if (e.dataset.on) { e.innerHTML = ''; e.dataset.on = ''; return; } var it = D.filter(function (x) { return x.id === id; })[0]; e.innerHTML = embed(it.video); e.dataset.on = '1'; };
  window.wsZoom = function (id, i) { var it = D.filter(function (x) { return x.id === id; })[0], z = document.createElement('div'); z.style.cssText = 'position:fixed;inset:0;z-index:9990;background:#000e;display:flex;align-items:center;justify-content:center'; z.onclick = function () { z.remove(); }; z.innerHTML = '<img src="data:image/jpeg;base64,' + it.images[i] + '" style="max-width:100%;max-height:100%">'; document.body.appendChild(z); };
  window.wsTab = function (k) { tab = k; edit = null; draw(); };
  function card(it) {
    var shop = it.kind === 'shop', rows = [];
    rows.push(['المساحة', Number(it.area) + ' م²']);
    if (shop) rows.push(['النشاط', it.activity || '-']); else { rows.push(['الوصف', it.description || '-']); rows.push(['التشطيب', it.finished ? 'متشطبة' : 'غير متشطبة']); }
    if (shop && it.ppm) rows.push(['سعر المتر', money(it.ppm)]);
    var h = '<div style="' + C + '">' + ((it.images || []).length ? '<div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:10px">' + it.images.map(function (b, i) { return '<img onclick="wsZoom(' + it.id + ',' + i + ')" src="data:image/jpeg;base64,' + b + '" style="height:150px;border-radius:10px;flex:none;cursor:pointer">'; }).join('') + '</div>' : '') + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-weight:900;font-size:16px">' + (shop ? 'محل رقم ' : 'تلاجة رقم ') + esc(it.num) + '</div>' + (it.sample ? '<span style="background:#7c2d12;color:#fed7aa;font-size:11px;font-weight:800;border-radius:8px;padding:3px 8px">نموذج تجريبي</span>' : '') + '</div>';
    rows.forEach(function (r) { h += '<div style="display:flex;justify-content:space-between;font-size:14px;padding:4px 0;border-bottom:1px solid #ffffff14"><span style="color:#94a3b8">' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; });
    var inst = '', R = function (l, val) { return '<div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:#94a3b8">' + l + '</span><b>' + val + '</b></div>'; };
    if (shop && it.pay === 'inst') inst = '<div style="margin-top:8px;font-size:14px">' + R('المدفوع (مقدم + أقساط' + (admin && it.over ? ' + أوفر' : '') + ')', money(it.paid_total)) + R('المتبقي', money(it.remaining)) + (it.inst_amount ? R('قيمة القسط', money(it.inst_amount)) : '') + (it.freq ? R('نظام القسط', FREQ[it.freq]) : '') + (it.years ? R('مدة التقسيط الإجمالية', YRS(it.years)) : '') + (it.years_left != null ? R('المتبقي من المدة', YRS(it.years_left)) : '') + '</div>';
    var tag = shop && it.pay === 'full' ? ' <span style="font-size:12px;color:#86efac;font-weight:800">خالصة</span>' : (shop && it.pay === 'inst' ? ' <span style="font-size:12px;color:#cbd5e1;font-weight:700">إجمالي</span>' : '');
    h += inst + '<div style="margin-top:10px;font-size:20px;font-weight:900;color:#e6c36a">' + money(it.price) + tag + '</div>';
    h += '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><a href="https://wa.me/2' + PHONE + '?text=' + encodeURIComponent('أنا مهتم بـ' + (shop ? 'المحل رقم ' : 'التلاجة رقم ') + it.num + ' في سوق الجملة') + '" target="_blank" style="' + B + '">واتساب</a><a href="tel:' + PHONE + '" style="' + B2 + '">اتصال</a>';
    if (it.video) h += '<button onclick="wsVid(' + it.id + ')" style="' + B2 + '">▶ فيديو</button>';
    if (admin) h += '<button onclick="wsEdit(' + it.id + ')" style="' + B2 + '">تعديل</button><button onclick="wsDel(' + it.id + ')" style="' + B2 + ';color:#fca5a5">حذف</button>';
    return h + '</div><div id="wsv' + it.id + '" style="margin-top:10px"></div></div>';
  }
  function draw() {
    var list = D.filter(function (x) { return x.kind === tab; });
    var tb = function (k, t) { return '<button onclick="wsTab(\'' + k + '\')" style="flex:1;' + (tab === k ? B : B2) + '">' + t + '</button>'; };
    var h = '<div style="display:flex;gap:8px;margin:14px 0">' + tb('shop', 'المحلات التجارية') + tb('fridge', 'التلاجات') + '</div>';
    if (admin) h += '<button onclick="wsEdit(0)" style="' + B + ';width:100%;margin-bottom:6px">+ إضافة ' + (tab === 'shop' ? 'محل' : 'تلاجة') + '</button>';
    h += list.length ? list.map(card).join('') : '<div style="' + C + ';text-align:center;color:#cbd5e1">مفيش عروض في القسم ده حالياً</div>';
    shell(h);
  }
  window.wsEdit = function (id) {
    var it = id ? D.filter(function (x) { return x.id === id; })[0] : { kind: tab, pay: 'cash' }; edit = it; ED = (it.images || []).slice(); var shop = it.kind === 'shop', ins = shop && it.pay === 'inst';
    function f(l, i, v, t, ph) { return '<label style="font-size:13px;color:#cbd5e1">' + l + '</label><input id="' + i + '" type="' + (t || 'text') + '" inputmode="' + (t === 'number' ? 'decimal' : 'text') + '" value="' + esc(v == null ? '' : v) + '" placeholder="' + (ph || '') + '" style="' + IN + '">'; }
    var h = '<div style="' + C + '"><div style="font-weight:900;margin-bottom:8px">' + (id ? 'تعديل' : 'إضافة') + ' ' + (shop ? 'محل' : 'تلاجة') + '</div>' + f(shop ? 'رقم المحل' : 'رقم التلاجة', 'wsNum', it.num) + f('المساحة (م²)', 'wsArea', it.area, 'number');
    if (shop) h += f('النشاط', 'wsAct', it.activity, 'text', 'مثال: خضار وفاكهة');
    else h += f('الوصف', 'wsDesc', it.description) + '<label style="font-size:13px;color:#cbd5e1">التشطيب</label><select id="wsFin" style="' + IN + '"><option value="1"' + (it.finished !== false ? ' selected' : '') + '>متشطبة</option><option value="0"' + (it.finished === false ? ' selected' : '') + '>غير متشطبة</option></select>';
    h += f('المطلوب (إجمالي السعر بالجنيه)', 'wsPrice', it.price, 'number');
    if (shop) {
      h += '<div id="wsPpmBox" style="background:#0b1626;border:1px dashed #c9a24a66;border-radius:10px;padding:10px;font-size:14px;margin-bottom:8px">سعر المتر (محسوب): <b id="wsPpm" style="color:#e6c36a">-</b></div>';
      h += '<label style="font-size:13px;color:#cbd5e1">طريقة الدفع</label><select id="wsPay" onchange="wsPayChg()" style="' + IN + '"><option value="cash"' + (it.pay === 'cash' ? ' selected' : '') + '>كاش</option><option value="full"' + (it.pay === 'full' ? ' selected' : '') + '>خالصة (المبلغ هو الإجمالي كله)</option><option value="inst"' + (ins ? ' selected' : '') + '>تقسيط</option></select>';
      h += '<div id="wsInst" style="display:' + (ins ? 'block' : 'none') + '">' + f('المقدم المدفوع (ج.م)', 'wsDown', it.down, 'number') + f('الأقساط المدفوعة (ج.م)', 'wsPaid', it.paid, 'number') + f('الأوفر (اختياري، للإدارة فقط ومحسوب في المدفوع)', 'wsOver', it.over, 'number') + f('قيمة القسط (ج.م)', 'wsInstAmt', it.inst_amount, 'number') + '<label style="font-size:13px;color:#cbd5e1">نظام القسط</label><select id="wsFreq" style="' + IN + '"><option value="">اختار</option><option value="quarterly"' + (it.freq === 'quarterly' ? ' selected' : '') + '>ربع سنوي</option><option value="semiannual"' + (it.freq === 'semiannual' ? ' selected' : '') + '>نصف سنوي</option><option value="annual"' + (it.freq === 'annual' ? ' selected' : '') + '>سنوي</option></select>' + f('مدة التقسيط الإجمالية (سنوات)', 'wsYears', it.years, 'number') + f('المتبقي من المدة (سنوات)', 'wsYearsLeft', it.years_left, 'number') + '<div id="wsCalc" style="background:#0b1626;border-radius:10px;padding:10px;font-size:13px;margin-bottom:8px;color:#e6c36a"></div></div>';
    }
    h += f('رابط فيديو (يوتيوب / تيك توك / فيسبوك / درايف / mp4)', 'wsVideo', it.video, 'url') + '<label style="font-size:13px;color:#cbd5e1">الصور (لحد 6)</label><div id="wsImgs" style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0"></div><input id="wsFile" type="file" accept="image/*" multiple onchange="wsPick(this)" style="' + IN + '"><div id="wsErr" style="color:#fca5a5;font-size:13px;min-height:16px"></div><div style="display:flex;gap:8px"><button onclick="wsSave()" style="' + B + ';flex:1">حفظ</button><button onclick="draw_ws()" style="' + B2 + '">رجوع</button></div></div>';
    shell(h); imgs(); ['wsArea', 'wsPrice', 'wsDown', 'wsPaid', 'wsOver'].forEach(function (i) { var e = document.getElementById(i); if (e) e.oninput = calc; }); calc();
  };
  function imgs() { var e = document.getElementById('wsImgs'); if (e) e.innerHTML = ED.map(function (b, i) { return '<div style="position:relative"><img src="data:image/jpeg;base64,' + b + '" style="width:72px;height:72px;object-fit:cover;border-radius:8px"><button onclick="wsRm(' + i + ')" style="position:absolute;top:-6px;left:-6px;background:#b91c1c;color:#fff;border:0;border-radius:50%;width:22px;height:22px">×</button></div>'; }).join(''); }
  window.wsRm = function (i) { ED.splice(i, 1); imgs(); };
  window.wsPick = function (inp) { var fs = Array.prototype.slice.call(inp.files || []).slice(0, 6 - ED.length); Promise.all(fs.map(shrink)).then(function (r) { r.forEach(function (b) { if (b) ED.push(b); }); imgs(); inp.value = ''; }); };
  function nv(i) { var x = parseFloat(v(i)); return x > 0 ? x : 0; }
  function calc() { var a = nv('wsArea'), t = nv('wsPrice'), p = document.getElementById('wsPpm'); if (p) p.textContent = a && t ? money(Math.round(t / a)) : '-'; var e = document.getElementById('wsCalc'); if (e) e.innerHTML = 'الإجمالي: ' + money(t) + '<br>المدفوع: ' + money(PAIDTOTAL(nv('wsDown'), nv('wsPaid'), nv('wsOver'))) + '<br>المتبقي: ' + money(REMAIN(t, nv('wsDown'), nv('wsPaid'))); }
  window.wsPayChg = function () { document.getElementById('wsInst').style.display = v('wsPay') === 'inst' ? 'block' : 'none'; calc(); };
  window.draw_ws = draw;
  function v(i) { var e = document.getElementById(i); return e ? e.value.trim() : ''; }
  window.wsSave = function () {
    var shop = edit.kind === 'shop', n = v('wsNum'), a = parseFloat(v('wsArea')), p = parseFloat(v('wsPrice')), pay = shop ? v('wsPay') : 'cash', ins = pay === 'inst', err = document.getElementById('wsErr');
    if (!n || !(a > 0) || !(p > 0)) { err.textContent = 'الرقم والمساحة والمطلوب لازم يتكتبوا'; return; }
    rpc('admin_wholesale_save', { p_id: edit.id || null, p_kind: edit.kind, p_num: n, p_area: a, p_activity: shop ? v('wsAct') : null, p_description: shop ? null : v('wsDesc'), p_finished: shop ? null : v('wsFin') === '1', p_price: p, p_images: ED, p_video: v('wsVideo') || null, p_pay: pay, p_down: ins ? nv('wsDown') : null, p_paid: ins ? nv('wsPaid') : null, p_over: ins && nv('wsOver') ? nv('wsOver') : null, p_inst: ins && nv('wsInstAmt') ? nv('wsInstAmt') : null, p_years: ins && nv('wsYears') ? nv('wsYears') : null, p_years_left: ins && v('wsYearsLeft') !== '' ? nv('wsYearsLeft') : null, p_freq: ins && v('wsFreq') ? v('wsFreq') : null }, tok)
      .then(function () { return rpc('admin_wholesale_list', {}, tok); }).then(function (l) { D = l; edit = null; draw(); })
      .catch(function () { err.textContent = 'تعذر الحفظ. اتأكد إنك داخل بحساب الإدارة'; });
  };
  window.wsDel = function (id) {
    if (!confirm('تحذف العرض ده؟')) return;
    rpc('admin_wholesale_delete', { p_id: id }, tok).then(function () { return rpc('admin_wholesale_list', {}, tok); }).then(function (l) { D = l; draw(); }).catch(function () { alert('تعذر الحذف'); });
  };
  (function btn() { function add() { if (document.getElementById('wsBtn')) return; var h = document.querySelector('header .flex.flex-wrap.items-center.gap-1\\.5'); if (!h) return; var b = document.createElement('button'); b.id = 'wsBtn'; b.type = 'button'; b.onclick = window.wsOpen; b.style.cssText = 'background:#1d3354;color:#e6c36a;border:1px solid #c9a24a99;font-weight:900;font-size:12px;border-radius:12px;padding:8px 12px;cursor:pointer'; b.textContent = '🏪 سوق الجملة'; h.insertBefore(b, h.firstChild); } if (document.readyState !== 'loading') add(); else document.addEventListener('DOMContentLoaded', add); })();
})();
