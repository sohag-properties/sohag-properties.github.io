/* Premium admin panel (owner only; every call is checked server-side by the admin login). */
(function () {
  'use strict';
  var URL_ = 'https://ddjdejmzuucdbsprigbz.supabase.co', KEY = 'sb_publishable_cAUPNPGXZyrRY5-UN2wI5w_dERXX7hE';
  var ERRS = { DUPLICATE_USER: 'اسم المستخدم موجود', WEAK_CREDENTIALS: 'اسم المستخدم 3 حروف+ وكلمة السر 6+', DAYS_REQUIRED: 'حدد عدد الأيام', ALREADY_DECIDED: 'الطلب اتحسم قبل كده', unauthorized: 'سجّل دخول السحابة الأول' };
  function rpc(fn, a) {
    return (window.cloudGetToken ? window.cloudGetToken() : Promise.resolve(null)).then(function (t) {
      if (!t) throw new Error('سجّل دخول السحابة الأول (الإدارة > السحابة)');
      return fetch(URL_ + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: JSON.stringify(a || {}) });
    }).then(function (r) { return r.json().then(function (d) { if (!r.ok) { var m = (d && d.message) || 'خطأ'; var k = Object.keys(ERRS).filter(function (x) { return m.indexOf(x) >= 0; })[0]; if (m.indexOf('duplicate key') >= 0) k = 'DUPLICATE_USER'; throw new Error(k ? ERRS[k] : m); } return d; }); });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(t) { if (window.showToast) showToast(t); else alert(t); }
  function fail(e) { toast(e.message || 'خطأ'); }
  var tab = 'pay', plans = [];
  var I = 'padding:8px;border:1px solid #cbd5e1;border-radius:8px;width:100%;margin:2px 0;font-size:13px';
  var B = 'background:#b45309;color:#fff;font-weight:800;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;margin:2px';
  var B2 = 'background:#e2e8f0;color:#0f172a;font-weight:800;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;margin:2px';
  var BR = 'background:#b91c1c;color:#fff;font-weight:800;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;margin:2px';
  function root() { var m = document.getElementById('premAdm'); if (!m) { m = document.createElement('div'); m.id = 'premAdm'; m.style.cssText = 'position:fixed;inset:0;z-index:9998;background:#f1f5f9;overflow:auto;direction:rtl;color:#0f172a;display:none'; document.body.appendChild(m); } return m; }
  window.premAdmClose = function () { root().style.display = 'none'; document.body.style.overflow = ''; };
  window.premAdmOpen = function () { root().style.display = 'block'; document.body.style.overflow = 'hidden'; draw(); };
  window.premAdmTab = function (t) { tab = t; draw(); };
  function draw() {
    var T = [['pay', 'طلبات الدفع'], ['stmt', 'كشف المشتركين'], ['subs', 'إدارة الحسابات'], ['plans', 'الباقات والأسعار'], ['tpl', 'العقود'], ['req', 'استشارات ومعاينات'], ['co', 'الشركات'], ['views', 'المشاهدات']];
    root().innerHTML = '<div style="max-width:760px;margin:0 auto;padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">👑 الخدمات المدفوعة (تجريبي)</b><button onclick="premAdmClose()" style="' + B2 + '">إغلاق ✕</button></div><div style="margin:8px 0">' + T.map(function (x) { return '<button onclick="premAdmTab(\'' + x[0] + '\')" style="' + (tab === x[0] ? B : B2) + '">' + x[1] + '</button>'; }).join('') + '</div><div id="pab">...</div></div>';
    ({ pay: vPay, stmt: vStmt, subs: vSubs, plans: vPlans, tpl: vTpl, req: vReq, co: vCo, views: vViews })[tab]();
  }
  function body(h) { var e = document.getElementById('pab'); if (e) e.innerHTML = h; }
  function box(h) { return '<div style="background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:10px;margin:8px 0;font-size:13px">' + h + '</div>'; }
  function d(s) { return s ? new Date(s).toLocaleString('ar-EG') : ''; }
  function loadPlans() { return rpc('admin_prem_plans_list').then(function (p) { plans = p; return p; }); }
  /* payments */
  function vPay() {
    Promise.all([rpc('admin_prem_pay_list'), loadPlans()]).then(function (r) {
      var l = r[0]; body(l.length ? l.map(function (x) {
        var st = { pending: '⏳ في الانتظار', confirmed: '✅ مؤكد', rejected: '❌ مرفوض' }[x.status];
        return box('<b>' + esc(x.code) + '</b> ' + st + '<div>' + esc(x.name) + ' - ' + esc(x.phone) + '</div><div>الباقة: ' + esc(x.plan || '-') + ' (' + (x.days || '?') + ' يوم / ' + esc(x.price == null ? '?' : x.price) + ' جنيه)</div><div>رقم العملية: <b>' + esc(x.txn) + '</b> | من: ' + esc(x.sender || '-') + ' | المبلغ: ' + esc(x.amount == null ? '-' : x.amount) + '</div><div style="color:#64748b">' + d(x.created_at) + '</div>' +
          (x.has_shot ? '<button onclick="premShot(' + x.id + ')" style="' + B2 + '">عرض صورة التحويل</button><div id="shot' + x.id + '"></div>' : '') +
          (x.status === 'pending' ? '<div style="border-top:1px dashed #cbd5e1;margin-top:6px;padding-top:6px"><input id="cu' + x.id + '" placeholder="اسم مستخدم للمشترك" style="' + I + '"><input id="cp' + x.id + '" placeholder="كلمة سر (6+)" style="' + I + '"><input id="cd' + x.id + '" placeholder="عدد الأيام (فاضي = حسب الباقة)" inputmode="numeric" style="' + I + '"><button onclick="premPay(' + x.id + ',\'confirmed\')" style="' + B + '">تأكيد التحويل وإنشاء الحساب</button><button onclick="premPay(' + x.id + ',\'rejected\')" style="' + BR + '">رفض</button></div>' : (x.note ? '<div>ملاحظة: ' + esc(x.note) + '</div>' : '')));
      }).join('') : box('لا توجد طلبات')); }).catch(fail);
  }
  window.premShot = function (id) { rpc('admin_prem_pay_shot', { p_id: id }).then(function (b) { document.getElementById('shot' + id).innerHTML = '<img style="max-width:100%;border-radius:8px;margin-top:6px" src="data:image/jpeg;base64,' + b + '">'; }).catch(fail); };
  window.premPay = function (id, st) {
    var g = function (p) { var e = document.getElementById(p + id); return e ? e.value : ''; };
    if (st === 'rejected' && !confirm('رفض الطلب؟')) return;
    rpc('admin_prem_pay_decide', { p_id: id, p_status: st, p_note: null, p_username: g('cu'), p_password: g('cp'), p_days: parseInt(g('cd')) || null }).then(function () { toast(st === 'confirmed' ? 'تم التأكيد وإنشاء الحساب' : 'تم الرفض'); vPay(); }).catch(fail);
  };

  /* statement of all members + per-member usage */
  var EV = { login: 'دخول', logout: 'خروج', device_bound: 'ربط الجهاز', login_other_device: 'محاولة دخول من جهاز آخر (مرفوضة)', login_expired: 'محاولة دخول بعد الانتهاء', view_contracts: 'فتح نماذج العقود', download_contract: 'تحميل عقد', request_consultation: 'طلب استشارة', request_inspection: 'طلب معاينة' };
  function vStmt() {
    rpc('admin_prem_statement').then(function (l) {
      var act = l.filter(function (x) { return !x.expired && x.status === 'active'; }).length;
      body(box('<b>ملخص:</b> ' + l.length + ' مشترك | نشط ' + act + ' | منتهي/موقوف ' + (l.length - act) + ' | إجمالي المدفوع ' + l.reduce(function (a, x) { return a + (+x.paid_egp || 0); }, 0) + ' جنيه') +
        l.map(function (x) { return box('<div style="display:flex;justify-content:space-between"><b>' + esc(x.display_name) + ' (' + esc(x.username) + ')</b><span>' + (x.expired ? '⛔ منتهي' : x.status === 'suspended' ? '⏸ موقوف' : '✅ نشط') + '</span></div><div>الباقة: ' + esc(x.plan || '-') + ' | مدفوع: ' + esc(x.paid_egp == null ? '-' : x.paid_egp) + ' جنيه</div><div>من ' + d(x.start_at) + '<br>إلى ' + d(x.end_at) + '</div><div style="margin-top:4px">دخول: <b>' + x.logins + '</b> | آخر دخول: ' + (x.last_login ? d(x.last_login) : '-') + '</div><div>عقود محملة: <b>' + x.downloads + '</b> | طلبات: <b>' + x.requests + '</b> | محاولات مرفوضة: <b style="color:' + (x.blocked ? '#b91c1c' : 'inherit') + '">' + x.blocked + '</b></div><button onclick="premDetail(\'' + x.id + '\')" style="' + B + '">التفاصيل الكاملة</button>'); }).join('') || box('لا يوجد مشتركين')); }).catch(fail);
  }
  window.premDetail = function (id) {
    rpc('admin_prem_sub_activity', { p_id: id }).then(function (a) {
      var s = a.sub || {};
      body('<button onclick="premAdmTab(\'stmt\')" style="' + B2 + '">◀ رجوع للكشف</button>' + box('<b>' + esc(s.display_name) + ' (' + esc(s.username) + ')</b><div>الباقة: ' + esc(s.plan || '-') + ' | مدفوع: ' + esc(s.paid_egp == null ? '-' : s.paid_egp) + '</div><div>بداية: ' + d(s.start_at) + '</div><div>نهاية: ' + d(s.end_at) + '</div><div>ربط الجهاز: ' + (s.bound_at ? d(s.bound_at) : 'غير مربوط') + '</div><div>دخول: ' + a.logins + ' | عقود: ' + a.downloads + ' | طلبات: ' + a.requests + ' | محاولات مرفوضة: ' + a.blocked_attempts + '</div>') +
        box('<b>سجل النشاط (آخر 200)</b>' + (a.events.length ? a.events.map(function (e) { return '<div style="padding:5px 0;border-bottom:1px dashed #e2e8f0"><span style="color:#64748b">' + d(e.ts) + '</span> - ' + esc(EV[e.event] || e.event) + (e.detail ? ': ' + esc(e.detail) : '') + '</div>'; }).join('') : '<div>لا يوجد نشاط</div>')));
    }).catch(fail);
  };

  /* companies in the city */
  function shrinkImg(file, max, type) { return new Promise(function (res) { if (!file) return res(null); var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL(type, 0.8).split(',')[1]); }; im.onerror = function () { res(null); }; im.src = r.result; }; r.readAsDataURL(file); }); }
  function vViews() {
    rpc('admin_views_ranking').then(function (d) {
      var P = (typeof properties !== 'undefined' ? properties : []), by = {}; P.forEach(function (p) { by[String(p.id)] = p; });
      var rows = d.posts.map(function (x, i) { var p = by[String(x.id)]; return '<tr style="border-top:1px solid #e2e8f0"><td style="padding:6px">' + (i + 1) + '</td><td style="padding:6px">' + (p ? esc(p.title) + (p.location ? ' <span style="color:#64748b">(' + esc(p.location) + ')</span>' : '') : '<span style="color:#94a3b8">إعلان محذوف أو غير موجود (' + esc(x.id) + ')</span>') + '</td><td style="padding:6px;font-weight:900">' + x.views + '</td><td style="padding:6px">' + x.last + '</td></tr>'; }).join('');
      body(box('<b>إحصائيات حقيقية (بدون أرقام مضافة)</b><div style="margin-top:6px">زوار مختلفون (أجهزة): <b>' + d.visitors + '</b> • زيارات اليوم: <b>' + d.today + '</b> • إجمالي الزيارات: <b>' + d.visits + '</b></div><div style="font-size:11px;color:#64748b;margin-top:4px">المشاهدة = جهاز واحد لكل إعلان في اليوم، بعد ظهور الإعلان على الشاشة ثانية. العدد على الإعلان يظهر بعد أول مشاهدة. إجمالي الزوار يظهر للزوار فقط بعد 100 جهاز. الحساب بيبدأ من لحظة التفعيل.</div>') + box('<b>ترتيب الإعلانات الأكثر مشاهدة</b>' + (rows ? '<table style="width:100%;font-size:13px;margin-top:6px"><tr style="color:#64748b"><td>#</td><td>الإعلان</td><td>المشاهدات</td><td>آخر مشاهدة</td></tr>' + rows + '</table>' : '<div style="color:#64748b;margin-top:6px">لسه مفيش مشاهدات متسجلة.</div>'))); }).catch(fail);
  }
  function vCo() {
    rpc('admin_companies_list').then(function (l) {
      body(box('<b>شركة جديدة</b><input id="cn" placeholder="اسم الشركة" style="' + I + '"><textarea id="ca" rows="2" placeholder="نبذة عن الشركة" style="' + I + '"></textarea><input id="cph" placeholder="تليفون" style="' + I + '"><input id="cwa" placeholder="واتساب (بالأرقام مع كود الدولة)" style="' + I + '"><input id="cwb" placeholder="الموقع (اختياري)" style="' + I + '"><label style="font-size:12px">الشعار</label><input id="clg" type="file" accept="image/*" style="' + I + '"><button onclick="coSave()" style="' + B + '">حفظ الشركة</button>') +
        l.map(function (c) { return box('<b>' + esc(c.name) + '</b> ' + (c.active ? '' : '(مخفية)') + '<div>' + c.projects.length + ' مشروع</div><button onclick="coProjForm(' + c.id + ')" style="' + B + '">+ مشروع</button><button onclick="coDel(\'company\',' + c.id + ')" style="' + BR + '">حذف الشركة</button>' + c.projects.map(function (p) { return '<div style="border-top:1px dashed #cbd5e1;margin-top:6px;padding-top:4px">' + esc(p.name) + ' <button onclick="coDel(\'project\',' + p.id + ')" style="' + BR + '">حذف</button><div style="margin-top:4px"><input id="pv' + p.id + '" value="' + esc(p.video || '') + '" placeholder="رابط فيديو المشروع (يوتيوب أو غيره)" style="' + I + '"><button onclick="coVid(' + p.id + ')" style="' + B + '">حفظ رابط الفيديو</button></div></div>'; }).join('') + '<div id="pf' + c.id + '"></div>'); }).join('')); }).catch(fail);
  }
  window.coSave = function () { var g = function (i) { return document.getElementById(i).value; }; shrinkImg(document.getElementById('clg').files[0], 300, 'image/png').then(function (lg) { return rpc('admin_company_save', { p_id: null, p_name: g('cn'), p_logo: lg, p_about: g('ca'), p_phone: g('cph'), p_wa: g('cwa'), p_web: g('cwb'), p_active: true }); }).then(function () { toast('تم الحفظ'); vCo(); }).catch(fail); };
  window.coVid = function (id) { rpc('admin_company_project_video', { p_id: id, p_video: document.getElementById('pv' + id).value }).then(function () { toast('تم حفظ رابط الفيديو'); }).catch(fail); };
  window.coProjForm = function (cid) { document.getElementById('pf' + cid).innerHTML = '<input id="pn' + cid + '" placeholder="اسم المشروع" style="' + I + '"><input id="pk' + cid + '" placeholder="النوع (كمبوند/عمارات/تجاري)" style="' + I + '"><input id="pl' + cid + '" placeholder="الموقع داخل المدينة" style="' + I + '"><input id="ps' + cid + '" placeholder="الحالة (تحت الإنشاء/جاهز/تم التسليم)" style="' + I + '"><textarea id="pd' + cid + '" rows="3" placeholder="تفاصيل" style="' + I + '"></textarea><input id="pp' + cid + '" type="file" accept="image/*" style="' + I + '"><button onclick="coProjSave(' + cid + ')" style="' + B + '">حفظ المشروع</button>'; };
  window.coProjSave = function (cid) { var g = function (p) { return document.getElementById(p + cid).value; }; shrinkImg(document.getElementById('pp' + cid).files[0], 900, 'image/jpeg').then(function (ph) { return rpc('admin_company_project_save', { p_id: null, p_company: cid, p_name: g('pn'), p_kind: g('pk'), p_location: g('pl'), p_status: g('ps'), p_details: g('pd'), p_photo: ph, p_active: true }); }).then(function () { toast('تم الحفظ'); vCo(); }).catch(fail); };
  window.coDel = function (k, id) { if (!confirm('تأكيد الحذف؟')) return; rpc('admin_company_delete', { p_kind: k, p_id: id }).then(function () { vCo(); }).catch(fail); };
  /* subscribers */
  function vSubs() {
    Promise.all([rpc('admin_prem_subs_list'), loadPlans()]).then(function (r) {
      var opts = plans.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + ' (' + p.days + ' يوم)</option>'; }).join('');
      var form = box('<b>مشترك جديد</b><input id="nu" placeholder="اسم المستخدم" style="' + I + '"><input id="np" placeholder="كلمة السر" style="' + I + '"><input id="nn" placeholder="الاسم الظاهر" style="' + I + '"><select id="npl" style="' + I + '"><option value="">بدون باقة (أيام يدوي)</option>' + opts + '</select><input id="nd" placeholder="عدد الأيام (اختياري لو في باقة)" inputmode="numeric" style="' + I + '"><input id="npd" placeholder="المبلغ المدفوع" inputmode="decimal" style="' + I + '"><button onclick="premNewSub()" style="' + B + '">إنشاء</button>');
      body(form + r[0].map(function (s) {
        return box('<b>' + esc(s.display_name) + '</b> (' + esc(s.username) + ') ' + (s.expired ? '⛔ منتهي' : s.status === 'suspended' ? '⏸ موقوف' : '✅ نشط') + '<div>ينتهي: ' + d(s.end_at) + '</div><div>الجهاز: ' + (s.bound ? 'مربوط من ' + d(s.bound_at) : 'غير مربوط') + '</div><div>' +
          '<button onclick="premExt(\'' + s.id + '\')" style="' + B + '">تمديد (أيام)</button><button onclick="premSusp(\'' + s.id + '\',\'' + (s.status === 'suspended' ? 'active' : 'suspended') + '\')" style="' + B2 + '">' + (s.status === 'suspended' ? 'تفعيل' : 'إيقاف') + '</button><button onclick="premResetDev(\'' + s.id + '\')" style="' + B2 + '">فك ربط الجهاز</button><button onclick="premPwd(\'' + s.id + '\')" style="' + B2 + '">كلمة سر جديدة</button></div>');
      }).join('')); }).catch(fail);
  }
  window.premNewSub = function () { var g = function (i) { return document.getElementById(i).value; }; rpc('admin_prem_sub_create', { p_username: g('nu'), p_password: g('np'), p_display: g('nn'), p_kind: 'individual', p_plan_id: +g('npl') || null, p_days: parseInt(g('nd')) || null, p_paid: parseFloat(g('npd')) || null, p_note: null }).then(function () { toast('تم إنشاء الحساب'); vSubs(); }).catch(fail); };
  window.premExt = function (id) { var n = parseInt(prompt('عدد الأيام للتمديد')); if (!n) return; rpc('admin_prem_sub_extend', { p_id: id, p_days: n }).then(function () { toast('تم التمديد'); vSubs(); }).catch(fail); };
  window.premSusp = function (id, st) { rpc('admin_prem_sub_set', { p_id: id, p_end_at: null, p_status: st }).then(function () { vSubs(); }).catch(fail); };
  window.premResetDev = function (id) { if (!confirm('فك ربط الجهاز؟ أول جهاز يسجل دخول بعدها هيتربط.')) return; rpc('admin_prem_sub_reset_device', { p_id: id }).then(function () { toast('تم فك الربط'); vSubs(); }).catch(fail); };
  window.premPwd = function (id) { var p = prompt('كلمة السر الجديدة (6 حروف+)'); if (!p) return; rpc('admin_prem_sub_password', { p_id: id, p_password: p }).then(function () { toast('تم التغيير'); }).catch(fail); };
  /* plans */
  function vPlans() {
    loadPlans().then(function (p) { body(box('<b>باقة جديدة</b><input id="pn" placeholder="الاسم (مثال: 15 يوم)" style="' + I + '"><input id="pd" placeholder="عدد الأيام" inputmode="numeric" style="' + I + '"><input id="pr" placeholder="السعر بالجنيه" inputmode="decimal" style="' + I + '"><button onclick="premPlanSave()" style="' + B + '">حفظ</button>') + p.map(function (x) { return box('<b>' + esc(x.name) + '</b> - ' + x.days + ' يوم - ' + esc(x.price_egp == null ? '-' : x.price_egp) + ' جنيه ' + (x.active ? '' : '(مخفية)') + '<div><button onclick="premPlanEdit(' + x.id + ')" style="' + B2 + '">تعديل</button><button onclick="premPlanTog(' + x.id + ')" style="' + B2 + '">' + (x.active ? 'إخفاء' : 'إظهار') + '</button></div>'); }).join('')); }).catch(fail);
  }
  window.premPlanSave = function () { var g = function (i) { return document.getElementById(i).value; }; rpc('admin_prem_plan_save', { p_id: null, p_name: g('pn'), p_days: parseInt(g('pd')), p_price: parseFloat(g('pr')) || null, p_active: true }).then(function () { vPlans(); }).catch(fail); };
  window.premPlanEdit = function (id) { var x = plans.filter(function (p) { return p.id === id; })[0]; var n = prompt('الاسم', x.name); if (n == null) return; var dd = prompt('الأيام', x.days); if (dd == null) return; var pr = prompt('السعر', x.price_egp == null ? '' : x.price_egp); if (pr == null) return; rpc('admin_prem_plan_save', { p_id: id, p_name: n, p_days: parseInt(dd), p_price: parseFloat(pr) || null, p_active: x.active }).then(function () { vPlans(); }).catch(fail); };
  window.premPlanTog = function (id) { var x = plans.filter(function (p) { return p.id === id; })[0]; rpc('admin_prem_plan_save', { p_id: id, p_name: x.name, p_days: x.days, p_price: x.price_egp, p_active: !x.active }).then(function () { vPlans(); }).catch(fail); };
  /* templates */
  function vTpl() {
    rpc('admin_prem_templates_list').then(function (l) { body(box('<b>رفع نموذج عقد (PDF)</b><input id="tt" placeholder="عنوان النموذج" style="' + I + '"><input id="tf" type="file" accept="application/pdf" style="' + I + '"><button onclick="premTplUp()" style="' + B + '">رفع</button>') + l.map(function (t) { return box('<b>' + esc(t.title) + '</b> ' + Math.round(t.size / 1024) + ' KB ' + (t.active ? '' : '(مخفي)') + '<button onclick="premTplTog(' + t.id + ',' + !t.active + ')" style="' + B2 + '">' + (t.active ? 'إخفاء' : 'إظهار') + '</button>'); }).join('')); }).catch(fail);
  }
  window.premTplUp = function () { var f = document.getElementById('tf').files[0], t = document.getElementById('tt').value; if (!f || !t) return toast('اختار ملف وعنوان'); if (f.size > 4e6) return toast('الملف أكبر من 4 ميجا'); var r = new FileReader(); r.onload = function () { rpc('admin_prem_template_save', { p_title: t, p_filename: f.name, p_mime: f.type || 'application/pdf', p_data_b64: String(r.result).split(',')[1] }).then(function () { toast('تم الرفع'); vTpl(); }).catch(fail); }; r.readAsDataURL(f); };
  window.premTplTog = function (id, a) { rpc('admin_prem_template_active', { p_id: id, p_active: a }).then(function () { vTpl(); }).catch(fail); };
  /* requests */
  function vReq() {
    rpc('admin_prem_requests_list').then(function (l) { body(l.length ? l.map(function (r) { return box('<b>' + (r.kind === 'inspection' ? 'معاينة' : 'استشارة') + '</b> من ' + esc(r.subscriber) + ' (' + esc(r.username) + ') - ' + esc(r.status) + '<div>' + esc(r.message) + '</div>' + (r.phone ? '<div>📞 ' + esc(r.phone) + '</div>' : '') + '<div style="color:#64748b">' + d(r.created_at) + '</div>' + (r.owner_reply ? '<div style="color:#047857">ردك: ' + esc(r.owner_reply) + '</div>' : '') + '<button onclick="premReply(' + r.id + ')" style="' + B + '">رد</button><button onclick="premReplyClose(' + r.id + ')" style="' + B2 + '">إغلاق الطلب</button>'); }).join('') : box('لا توجد طلبات')); }).catch(fail);
  }
  window.premReply = function (id) { var t = prompt('اكتب ردك'); if (!t) return; rpc('admin_prem_request_reply', { p_id: id, p_reply: t, p_status: 'replied' }).then(function () { vReq(); }).catch(fail); };
  window.premReplyClose = function (id) { rpc('admin_prem_request_reply', { p_id: id, p_reply: null, p_status: 'closed' }).then(function () { vReq(); }).catch(fail); };
})();
