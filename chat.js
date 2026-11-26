/* سوهاج: شات العملاء + عدادات الزوار والتحميلات (Supabase) */
(function () {
  'use strict';
  var SB_URL = 'https://ddjdejmzuucdbsprigbz.supabase.co';
  var SB_KEY = 'sb_publishable_cAUPNPGXZyrRY5-UN2wI5w_dERXX7hE';
  var LS = window.localStorage, SS = window.sessionStorage;
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }
  function lget(k, d) { try { var v = LS.getItem(k); return v === null ? d : v; } catch (_) { return d; } }
  function lset(k, v) { try { LS.setItem(k, v); } catch (_) {} }

  var visitorId = lget('sohag_vid', null) || (function () { var v = uuid(); lset('sohag_vid', v); return v; })();
  var sessionId = lget('sohag_chat_sid', null) || (function () { var v = uuid(); lset('sohag_chat_sid', v); return v; })();
  var sb = null;
  function client() {
    if (sb) return sb;
    if (typeof supabase === 'undefined' || !supabase.createClient) return null;
    sb = supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    return sb;
  }
  function rpc(name, args) {
    var c = client(); if (!c) return Promise.resolve({ error: 'no client' });
    return c.rpc(name, args).then(function (r) { if (r.error) console.warn('rpc', name, r.error); return r; }).catch(function (e) { console.warn('rpc fail', name, e); return { error: e }; });
  }

  /* ===== عدادات الزوار والتحميلات ===== */
  function appSource() {
    try {
      if (document.referrer && document.referrer.indexOf('android-app://') === 0) return 'apk';
      if (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches) || navigator.standalone) return 'pwa';
    } catch (_) {}
    return 'web';
  }
  function trackAll() {
    var src = appSource();
    if (!SS.getItem('sohag_visit_tracked')) { SS.setItem('sohag_visit_tracked', '1'); rpc('track', { p_kind: 'visit', p_visitor: visitorId, p_source: src }); }
    if (!lget('sohag_first_open', null)) {
      rpc('track', { p_kind: 'first_open', p_visitor: visitorId, p_source: src }).then(function (r) { if (!r.error) lset('sohag_first_open', String(Date.now())); });
    }
    window.addEventListener('appinstalled', function () { rpc('track', { p_kind: 'install', p_visitor: visitorId, p_source: 'pwa' }); });
  }
  function fmt(n) { return Number(n || 0).toLocaleString('ar-EG'); }
  function refreshStats() {
    var strip = document.getElementById('adminStatsStrip'); if (!strip || strip.classList.contains('hidden')) return;
    rpc('app_stats', {}).then(function (r) {
      var d = r && r.data; if (!d) return;
      var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = fmt(v); };
      set('statVisitors', d.visitors); set('statInstalls', d.installs); set('statOpens', d.page_opens);
      set('statFirstOpens', d.first_opens); set('statChats', d.chats); set('statRequests', d.requests); set('statToday', d.visitors_today);
    });
  }
  window.refreshAppStats = refreshStats;
  setInterval(refreshStats, 30000);
  var _apply = window.applyViewModeUI;
  if (typeof _apply === 'function') {
    window.applyViewModeUI = function () { var r = _apply.apply(this, arguments); setTimeout(refreshStats, 50); return r; };
  }

  /* ===== أدوات اللغة العربية ===== */
  function norm(s) {
    s = String(s || '').toLowerCase();
    s = s.replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    s = s.replace(/[٠-٩]/g, function (d) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)); }).replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); });
    return s;
  }
  var CATS = [
    ['lands', 'الأراضي', /ارض|اراضي|قطعه|قطع/],
    ['compounds', 'وحدات الكمبوندات', /كمبوند|كمبواند|compound/],
    ['apartments', 'الوحدات السكنية', /شقه|شقق|وحده|وحدات|سكني|دور/],
    ['houses', 'المنازل والفيلات', /فيلا|فيلات|منزل|بيت|منازل|عماره/],
    ['malls', 'المولات والمحلات', /مول|محل|محلات|تجاري|مكتب|اداري/],
    ['factories', 'المصانع والمخازن', /مصنع|مصانع|مخزن|مخازن/]
  ];
  function detectCat(t) { for (var i = 0; i < CATS.length; i++) if (CATS[i][2].test(t)) return CATS[i]; return null; }
  function catLabel(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i][0] === id) return CATS[i][1]; return null; }
  function parseBudget(t) {
    var m = t.match(/(\d+(?:[.,]\d+)?)\s*(مليون|م\b|الف|الاف|k)/);
    if (m) { var n = parseFloat(m[1].replace(',', '.')); return /مليون|^م$/.test(m[2]) ? n * 1e6 : n * 1e3; }
    if (/(\d+)\s*(?:ج|جنيه)/.test(t)) return parseFloat(RegExp.$1);
    if (/(?:ميزانيه|ميزانيتي|سعر|بحدود|حوالي|في حدود|اقصي|لحد|حد اقصي)\D{0,12}(\d{5,9})/.test(t)) return parseFloat(RegExp.$1);
    if (/\b(\d{6,9})\b/.test(t)) return parseFloat(RegExp.$1);
    return null;
  }
  function parseArea(t) {
    var m = t.match(/(\d{2,4})\s*(?:متر|م2|م²|م\b)/); if (m) return parseFloat(m[1]);
    return null;
  }
  function parseLoc(t) {
    var m = t.match(/مجاور[هة]?\s*(\d+)/); if (m) return 'مجاوره ' + m[1];
    return null;
  }
  function parsePhone(t) { var m = norm(t).match(/(?:\+?20|0)?1[0125]\d{8}/); return m ? ('0' + m[0].replace(/^\+?20/, '').replace(/^0/, '')) : null; }
  function money(n) { return fmt(n) + ' ج.م'; }

  /* ===== بيانات العروض (للعرض العام فقط، بدون الرقم السري ولا رقم المالك) ===== */
  function listings() {
    var arr = (typeof properties !== 'undefined' && Array.isArray(properties)) ? properties : [];
    return arr.filter(function (p) { return p && !p.hidden; });
  }
  function pubText(p) { return norm([p.title, p.location, p.subcategory, p.notes, p.paymentStatus].join(' ')); }
  function search(q) {
    var t = norm(q);
    var cat = detectCat(t), budget = parseBudget(t), area = parseArea(t), loc = parseLoc(t);
    var all = listings().filter(function (p) { return !p.sold; });
    var res = all.filter(function (p) {
      if (cat && p.category !== cat[0]) return false;
      if (budget && p.totalPrice && Number(p.totalPrice) > budget * 1.1) return false;
      if (area && p.area && (Number(p.area) < area * 0.8 || Number(p.area) > area * 1.25)) return false;
      if (loc && pubText(p).indexOf(loc) < 0) return false;
      return true;
    });
    return { cat: cat, budget: budget, area: area, loc: loc, results: res, pool: all };
  }
  function cardData(p) {
    var bits = [];
    if (p.paymentStatus) bits.push(p.paymentStatus);
    var c = p.compoundDetails || p.apartmentDetails;
    if (c && c.delivery) bits.push('الاستلام: ' + c.delivery);
    return { id: p.id, title: p.title, line: [p.location, p.area ? p.area + ' م²' : ''].filter(Boolean).join(' • '), price: p.totalPrice ? money(p.totalPrice) : '', extra: bits.join(' • '), notes: (p.notes || '').slice(0, 110) };
  }

  /* ===== واجهة الشات ===== */
  var CSS = '#sc-fab{position:fixed;bottom:18px;left:18px;z-index:9990;width:58px;height:58px;border-radius:50%;background:#0f766e;color:#fff;border:3px solid #eab308;box-shadow:0 6px 18px rgba(0,0,0,.35);font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center}'
    + '#sc-fab .sc-dot{position:absolute;top:-4px;right:-4px;background:#dc2626;color:#fff;font:700 11px Cairo,sans-serif;min-width:20px;height:20px;border-radius:10px;display:none;align-items:center;justify-content:center;padding:0 4px}'
    + '#sc-tease{position:fixed;bottom:84px;left:18px;z-index:9990;max-width:230px;background:#fff;color:#0f1f35;border-radius:14px;padding:10px 12px;font:700 13px Cairo,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);display:none;cursor:pointer}'
    + '#sc-panel{position:fixed;bottom:84px;left:18px;z-index:9991;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100vh - 110px));background:#f8fafc;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.45);display:none;flex-direction:column;overflow:hidden;font-family:Cairo,sans-serif;direction:rtl}'
    + '#sc-panel.open{display:flex}'
    + '#sc-head{background:#0f1f35;color:#fff;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #eab308}'
    + '#sc-head b{font-size:14px}#sc-head small{display:block;font-size:11px;color:#facc15;font-weight:600}#sc-close{background:none;border:0;color:#fff;font-size:20px;cursor:pointer}'
    + '#sc-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}'
    + '.sc-m{max-width:88%;padding:8px 11px;border-radius:14px;font-size:13.5px;line-height:1.7;white-space:pre-wrap;word-break:break-word}'
    + '.sc-bot{background:#fff;border:1px solid #e2e8f0;color:#0f1f35;align-self:flex-start;border-top-right-radius:4px}'
    + '.sc-agent{background:#ecfdf5;border:1px solid #6ee7b7;color:#064e3b;align-self:flex-start;border-top-right-radius:4px}'
    + '.sc-me{background:#0f766e;color:#fff;align-self:flex-end;border-top-left-radius:4px}'
    + '.sc-who{font-size:10px;font-weight:800;opacity:.7;display:block;margin-bottom:1px}'
    + '.sc-card{background:#fff;border:1px solid #cbd5e1;border-right:4px solid #eab308;border-radius:12px;padding:9px 11px;align-self:flex-start;max-width:92%;font-size:12.5px;line-height:1.6;color:#0f1f35}'
    + '.sc-card b{display:block;font-size:13px}.sc-card .pr{color:#0f766e;font-weight:800;font-size:14px}.sc-card button{margin-top:6px;background:#0f1f35;color:#fff;border:0;border-radius:8px;padding:5px 10px;font:700 12px Cairo,sans-serif;cursor:pointer}'
    + '#sc-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 12px 8px}.sc-chip{background:#fff;border:1px solid #0f766e;color:#0f766e;border-radius:999px;padding:4px 10px;font:700 12px Cairo,sans-serif;cursor:pointer}'
    + '#sc-form{display:flex;gap:6px;padding:10px;border-top:1px solid #e2e8f0;background:#fff}'
    + '#sc-input{flex:1;border:1.5px solid #cbd5e1;border-radius:12px;padding:8px 10px;font:600 13.5px Cairo,sans-serif;outline:none;direction:rtl}#sc-input:focus{border-color:#0f766e}'
    + '#sc-send{background:#eab308;color:#0f1f35;border:0;border-radius:12px;padding:0 14px;font:800 13px Cairo,sans-serif;cursor:pointer}';

  var state = { msgs: [], lastAgentId: Number(lget('sohag_chat_last_agent', '0')), started: false, asked: false, pendingReqId: null, unread: 0, reqSent: false };
  try { state.msgs = JSON.parse(lget('sohag_chat_msgs', '[]')) || []; } catch (_) { state.msgs = []; }
  state.reqSent = lget('sohag_chat_reqsent', '') === '1';
  state.haveContact = lget('sohag_chat_contact', '') === '1';

  /* ===== ذاكرة الجلسة: اللي البوت عرفه عن الزائر وميسألش فيه تاني ===== */
  var known = { name: null, phone: null, need: null, needLabel: null, budget: null, area: null, loc: null, interest: null, claimed: false, clarified: null };
  try {
    var _k = JSON.parse(lget('sohag_chat_known', '{}')) || {};
    for (var _kk in known) if (_k[_kk] != null) known[_kk] = _k[_kk];
  } catch (_) {}
  function saveKnown() { lset('sohag_chat_known', JSON.stringify(known)); }
  function hasContext() {
    return !!(known.name || known.phone || known.need || known.budget || known.area || known.interest || known.claimed || state.haveContact || state.reqSent);
  }
  /* يسأل بس عن اللي لسه ناقص، مش عن حاجة يعرفها */
  function askMissing() {
    var parts = [];
    if (!known.need) parts.push('إنت محتاج إيه بالظبط (أرض، شقة، كمبوند، فيلا، محل)');
    if (!known.budget) parts.push('ميزانيتك تقريباً كام');
    if (parts.length) return 'قولي ' + parts.join(' و') + ' وأنا أدورلك.';
    if (!state.haveContact) return 'ابعتلي اسمك ورقم موبايلك علشان فريق الأستاذ محمد يتواصل معاك.';
    return 'أقدر أساعدك في حاجة تانية؟';
  }
  function detectName(raw) {
    var m = String(raw).match(/(?:اسمي|اسمى|انا|أنا)\s+([^\d،,.]{2,30}?)(?=\s+(?:و|رقم)|\s*[،,.\d]|$)/);
    if (m) { var n = m[1].trim(); if (n && !/^(مش|مهتم|عايز|عاوز|محتاج|بدور|ساكن|كنت|عندي|جاي|كلمت|بكلم)/.test(norm(n))) return n; }
    return null;
  }
  var HOLD = 'لحظة واحدة يا فندم، حد من فريق الأستاذ محمد هيرد عليك هنا في الشات في أقرب وقت 🙏';
  /* العميل بيقول إن بياناته مسجلة عندنا */
  var REGD = /(مسجل|مسجله|مسجلين|متسجل|موجود عندك|موجودين عندك|بياناتي|اتعاملت معاكم|كلمتكم قبل|اتصلت بيكم|اشتريت منكم|حجزت معاكم|عندك رقمي|رقمي عندك)/;
  function regdClaim(t) {
    return REGD.test(t) && /(رقم|اسم|بيانات|مسجل|متسجل|معاكم|بيكم|منكم|عندك|عندكم)/.test(t) && !detectCat(t) && !parsePhone(t);
  }

  var el = {};
  function saveMsgs() { lset('sohag_chat_msgs', JSON.stringify(state.msgs.slice(-80))); }
  function mk(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function renderMsg(m) {
    var box;
    if (m.t === 'card') {
      box = mk('div', 'sc-card');
      box.appendChild(mk('b', '', m.d.title));
      box.appendChild(mk('div', '', m.d.line));
      if (m.d.price) box.appendChild(mk('div', 'pr', m.d.price));
      if (m.d.extra) box.appendChild(mk('div', '', m.d.extra));
      if (m.d.notes) box.appendChild(mk('div', '', m.d.notes));
      var b = mk('button', '', 'أنا مهتم بالعرض ده');
      b.onclick = function () { userSay('أنا مهتم بالعرض ده: ' + m.d.title, true); };
      box.appendChild(b);
    } else {
      box = mk('div', 'sc-m ' + (m.s === 'visitor' ? 'sc-me' : m.s === 'agent' ? 'sc-agent' : 'sc-bot'));
      if (m.s === 'agent') box.appendChild(mk('span', 'sc-who', 'فريق الإدارة'));
      box.appendChild(document.createTextNode(m.b));
    }
    el.msgs.appendChild(box);
  }
  function scroll() { el.msgs.scrollTop = el.msgs.scrollHeight; }
  function addMsg(m, persist) {
    state.msgs.push(m); if (persist !== false) saveMsgs(); renderMsg(m); scroll();
  }
  function botSay(text, log) {
    addMsg({ s: 'assistant', b: text });
    if (log !== false) rpc('chat_send', { p_session: sessionId, p_sender: 'assistant', p_body: text, p_needs_agent: false });
  }
  function ensureSession() {
    if (state.started) return;
    state.started = true;
    rpc('chat_start', { p_session: sessionId, p_visitor: visitorId, p_name: null, p_phone: null });
  }

  var GREET = 'أهلاً بيك في عروض سوهاج الجديدة 👋\nأنا المساعد الذكي بتاع الأستاذ محمد علي أبوالحمد. قولي إنت محتاج إيه (أرض، شقة، كمبوند، محل...) وميزانيتك تقريباً، وأنا أعرضلك المتاح عندنا.';

  function openChat() {
    el.panel.classList.add('open'); el.tease.style.display = 'none';
    state.unread = 0; updateDot();
    if (!state.msgs.length) { ensureSession(); botSay(GREET); }
    scroll(); setTimeout(function () { el.input.focus(); }, 50);
  }
  function closeChat() { el.panel.classList.remove('open'); }
  function updateDot() { el.dot.style.display = state.unread ? 'flex' : 'none'; el.dot.textContent = state.unread; }

  function userSay(text, forceAgent) {
    text = String(text || '').trim(); if (!text) return;
    ensureSession();
    addMsg({ s: 'visitor', b: text });
    el.chips.style.display = 'none';
    var phone = parsePhone(text);
    var reply = respond(text, phone, forceAgent);
    rpc('chat_send', { p_session: sessionId, p_sender: 'visitor', p_body: text, p_needs_agent: !!reply.needsAgent });
    if (phone) { state.haveContact = true; lset('sohag_chat_contact', '1'); rpc('request_contact', { p_session: sessionId, p_name: reply.name || known.name || null, p_phone: phone }); }
    setTimeout(function () {
      (reply.cards || []).forEach(function (c) { addMsg({ t: 'card', d: c }); });
      if (reply.text) botSay(reply.text);
      startPolling();
    }, 450);
  }

  function getUnclear() { try { return Number(SS.getItem('sohag_unclear') || 0); } catch (_) { return 0; } }
  function setUnclear(n) { try { SS.setItem('sohag_unclear', String(n)); } catch (_) {} }
  /* مجاملات ورد بسيط بالمصري: شكراً، تحيات، وداع، تمام، أيوه/لأ */
  function smallTalk(t) {
    var c = t.replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!c || c.length > 40 || /\d/.test(c) || detectCat(c)) return null;
    c = c.replace(/\s*(يا فندم|يا باشا|يا باش|يا هندسه|يا استاذ|يا معلم|يا غالي|جدا|اوي|كتير|ليك|لك|ليكم|لكم|بجد|والله|يارب|ي)(?=\s|$)/g, '').trim();
    var done = state.haveContact;
    var closing = 'العفو يا فندم 🌹 فريق الأستاذ محمد هيتواصل معاك قريب على رقمك. ولو احتجت أي حاجة تانية أنا موجود.';
    var nocontact = 'العفو يا فندم 🌹 لو حابب فريقنا يتواصل معاك ابعتلي اسمك ورقم موبايلك، وأي وقت تحتاج عقار تاني قولي.';
    if (/^(شكرا|شكرا ليك|شكرا جزيلا|الف شكر|الف شكرا|متشكر|متشكره|مشكور|تسلم|تسلمي|تسلم ايدك|يسلمو|يسلموا|ميرسي|thanks|thank you|thx)( .*)?$/.test(c) && c.split(' ').length <= 5) return done ? closing : (state.reqSent ? nocontact : 'العفو يا فندم 🌹 أنا في خدمتك. ' + askMissing());
    if (/^(مع السلامه|باي|bye|في امان الله|الي اللقاء|تصبح علي خير|سلام|سلامو عليكو|سلام عليكم ورحمه الله|مع السلامه يا فندم)$/.test(c)) {
      if (c === 'سلام' && !done) return 'أهلاً بيك! ' + askMissing();
      return done ? 'مع السلامة يا فندم 🌹 فريق الأستاذ محمد هيتواصل معاك قريب.' : 'مع السلامة يا فندم 🌹 أي وقت تحتاج عقار ابقى كلمني هنا.';
    }
    if (/^(ازيك|ازيكم|اهلا|اهلا بيك|اهلا وسهلا|اهلا بحضرتك|هلا|مرحبا|مرحبتين|هاي|هلو|hello|hi|صباح الخير|صباح النور|مساء الخير|مساء النور|السلام عليكم|السلام عليكم ورحمه الله|السلام عليكم ورحمه الله وبركاته|وعليكم السلام|وعليكم السلام ورحمه الله|ازيك عامل ايه|عامل ايه|اخبارك ايه|اخبارك)$/.test(c)) {
      if (/^(صباح الخير|صباح النور)$/.test(c)) return 'صباح النور يا فندم ☀️ ' + (done ? 'أقدر أساعدك في حاجة تانية؟' : askMissing());
      if (/^(مساء الخير|مساء النور)$/.test(c)) return 'مساء النور يا فندم 🌙 ' + (done ? 'أقدر أساعدك في حاجة تانية؟' : askMissing());
      if (/ازيك|عامل ايه|اخبار/.test(c)) return 'الحمد لله تمام، تسلم 🌹 ' + (done ? 'أقدر أساعدك في حاجة؟' : askMissing());
      return 'أهلاً بيك يا فندم 👋 ' + (done ? 'أقدر أساعدك في حاجة تانية؟' : askMissing());
    }
    if (/^(تمام|تمام كده|تمام الحمد لله|ماشي|ماشي كده|اوكي|اوكيه|اوك|اوكي تمام|ok|okay|حاضر|طيب|حلو|جميل|كويس|ممتاز|الحمد لله)$/.test(c)) return done ? 'تمام يا فندم 👌 فريق الأستاذ محمد هيتواصل معاك قريب.' : (state.reqSent ? 'تمام يا فندم 👌 ابعتلي اسمك ورقم موبايلك علشان فريقنا يتواصل معاك.' : 'تمام يا فندم 👌 ' + askMissing());
    if (/^(ايوه|ايوا|ايوه يا فندم|اه|ااه|اها|ايو|ايوة|نعم|اجل|اكيد|طبعا|يب|ايه ده|اه طبعا)$/.test(c)) return done ? 'تمام يا فندم 👌 فريق الأستاذ محمد هيتواصل معاك قريب، وأقدر أساعدك في حاجة تانية؟' : 'تمام 👌 ' + askMissing();
    if (/^(لا|لأ|لاء|لاا|لا شكرا|لا خلاص|لا تمام|مش دلوقتي|خلاص|كده تمام|لا كده تمام)$/.test(c)) return done ? 'ولا يهمك يا فندم 🌹 فريق الأستاذ محمد هيتواصل معاك على رقمك، وأي وقت تحتاج حاجة أنا موجود.' : 'ولا يهمك يا فندم 🌹 أي وقت تحتاج عقار قولي وأنا أدورلك.';
    return null;
  }

  function respond(raw, phone, forceAgent) {
    var t = norm(raw), out = { text: '', cards: [], needsAgent: !!forceAgent };

    /* رقم موبايل في الرسالة: تسجيل وتأكيد */
    if (phone) {
      var nm = detectName(raw);
      if (nm) out.name = nm;
      known.phone = phone; if (out.name) known.name = out.name;
      saveKnown(); setUnclear(0);
      out.needsAgent = true;
      out.text = known.claimed
        ? 'تمام يا فندم، وصلني الرقم (' + phone + ') للمطابقة مع اللي مسجل عندنا' + (known.name ? ' باسم ' + known.name : '') + ' ✅ فريق الأستاذ محمد هيتواصل معاك في أقرب وقت.'
        : 'تمام، سجلت رقمك (' + phone + '). هيتواصل معاك حد من فريق الأستاذ محمد في أقرب وقت.';
      known.claimed = false; saveKnown();
      return out;
    }

    /* اهتمام بعرض معين: الاهتمام نفسه هو السياق، ممنوع نسأل عن نوع العقار تاني */
    if (forceAgent) {
      var im = String(raw).match(/مهتم بالعرض ده[:：]?\s*(.+)$/);
      if (im) known.interest = im[1].trim().slice(0, 90);
      var ip = known.interest ? listings().filter(function (p) { return norm(p.title) === norm(known.interest); })[0] : null;
      if (ip) {
        if (!known.need) { known.need = ip.category; known.needLabel = catLabel(ip.category); }
        if (!known.area && ip.area) known.area = Number(ip.area);
      }
      saveKnown(); setUnclear(0);
      out.needsAgent = true;
      if (state.haveContact || known.phone) {
        out.text = 'تمام يا فندم، سجلت اهتمامك بـ"' + (known.interest || 'العرض ده') + '" وبياناتك موجودة عندنا ✅ فريق الأستاذ محمد هيكلمك على رقمك لتأكيد التفاصيل والمعاينة.';
      } else {
        out.text = 'ممتاز! اهتمامك بـ"' + (known.interest || 'العرض ده') + '" اتسجل ✍️ باقي خطوة واحدة بس: ابعتلي اسمك ورقم موبايلك وهيتواصل معاك فريق الأستاذ محمد لترتيب المعاينة.';
      }
      return out;
    }

    var st = smallTalk(t);
    if (st) { setUnclear(0); out.text = st; return out; }

    /* العميل بيقول إن اسمه أو رقمه مسجل عندنا */
    if (regdClaim(t)) {
      setUnclear(0);
      if (state.haveContact || known.phone || known.name) {
        out.text = 'موجودين يا فندم ✅ ' + (known.name ? 'اسمك (' + known.name + ') ' : '') + (known.phone ? 'ورقمك (' + known.phone + ') ' : '') + 'مسجلين عندنا وهنكمل بيهم. فريق الأستاذ محمد هيتواصل معاك قريب.';
      } else {
        known.claimed = true; saveKnown();
        out.text = 'تمام يا فندم. علشان نتأكد من تسجيلك، ابعتلي رقم الموبايل اللي اتسجلت بيه (ولو اسمك كمان يبقى أحسن) وهطابقه عندنا فوراً.';
      }
      return out;
    }

    if (/^(سلام|السلام|اهلا|مرحبا|هاي|صباح|مساء|هلو|ازيك|يا معلم)/.test(t) && t.length < 30 && !detectCat(t)) {
      out.text = 'أهلاً بيك! ' + askMissing();
      return out;
    }

    if (/(اكلم|كلمني|اتصال|رقم الاستاذ|رقم المالك|تواصل|معاينه|اعاين|اشوف الوحده|حجز|اتفاق|تفاوض|خصم|اخر سعر|اقل سعر|اسيب رقمي)/.test(t)) {
      out.needsAgent = true;
      if (state.haveContact || known.phone) out.text = 'تمام يا فندم، بلغت فريق الأستاذ محمد وهيتواصلوا معاك على رقمك المسجل (' + (known.phone || '') + ') في أقرب وقت.';
      else out.text = 'تمام، هبلغ فريق الأستاذ محمد. ابعتلي اسمك ورقم موبايلك وهيتواصلوا معاك.' + (known.interest ? ' وسجلت إن العرض اللي يهمك هو "' + known.interest + '".' : (known.need ? ' وسجلت إنك مهتم بـ' + (known.needLabel || '') + '.' : ''));
      return out;
    }

    if (/(كل العروض|المتاح|ايه المتاح|عندكم ايه|عندك ايه|ايه اللي عندكم|الاقسام)/.test(t)) {
      var counts = {}; listings().filter(function (p) { return !p.sold; }).forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
      var lines = CATS.filter(function (c) { return counts[c[0]]; }).map(function (c) { return '• ' + c[1] + ': ' + counts[c[0]] + ' عرض'; });
      out.text = lines.length ? 'المتاح عندنا حالياً:\n' + lines.join('\n') + '\n' + askMissing() : 'مفيش عروض معروضة دلوقتي، قولي طلبك وأنا أسجله وهندور لك عليه.';
      return out;
    }

    var KW = { lands: 'ارض', compounds: 'كمبوند', apartments: 'شقه', houses: 'فيلا', malls: 'محل', factories: 'مصنع' };
    var q = search(raw);
    if (!q.cat && known.need && known.clarified === known.need && KW[known.need]) q = search(raw + ' ' + KW[known.need]);
    /* نحدث ذاكرة الجلسة بأي معلومة جديدة */
    var nm2 = detectName(raw);
    if (nm2 && !known.name) known.name = nm2;
    if (q.cat && !known.need) { known.need = q.cat[0]; known.needLabel = q.cat[1]; }
    if (q.budget && !known.budget) known.budget = q.budget;
    if (q.area && !known.area) known.area = q.area;
    if (q.loc && !known.loc) known.loc = q.loc;
    saveKnown();

    /* طلب مختصر (نوع العقار بس): نسأل الأول عن المنطقة والمساحة/الغرف والميزانية ونعرض المتاح، ومنطلبش الاسم والرقم دلوقتي */
    var raw1 = norm(raw);
    if (q.cat && !parseBudget(raw1) && !parseArea(raw1) && !parseLoc(raw1) && known.clarified !== q.cat[0] && !/(غرف|اوض|اوضه)/.test(raw1)) {
      var QS = {
        apartments: 'تحب الشقة في أنهي مجاورة أو منطقة؟ وكام غرفة والمساحة تقريباً؟ وميزانيتك تقريباً كام؟',
        malls: 'المحل في أنهي منطقة؟ والمساحة تقريباً كام؟ وميزانيتك تقريباً كام؟',
        lands: 'الأرض في أنهي مجاورة؟ والمساحة اللي عايزها كام؟ وميزانيتك تقريباً كام؟',
        compounds: 'تحب الوحدة في أنهي كمبوند أو منطقة؟ وكام غرفة؟ وميزانيتك تقريباً كام؟',
        houses: 'تحب المنزل أو الفيلا في أنهي منطقة؟ والمساحة وعدد الغرف تقريباً؟ وميزانيتك كام؟',
        factories: 'المصنع أو المخزن في أنهي منطقة؟ والمساحة تقريباً؟ وميزانيتك تقريباً كام؟'
      };
      known.clarified = q.cat[0]; saveKnown(); setUnclear(0);
      out.needsAgent = false;
      if (q.results.length) {
        out.cards = q.results.slice(0, 3).map(cardData);
        out.text = 'أهلاً بيك يا فندم 👋 دي ' + (q.results.length > 1 ? 'أول عروض' : 'العرض') + ' ' + q.cat[1] + ' المتاحة عندنا حالياً' + (q.results.length > 3 ? ' (' + q.results.length + ' عرض، دي أول ٣)' : '') + '.\nعلشان أرشحلك الأنسب: ' + (QS[q.cat[0]] || 'قولي المنطقة والمساحة وميزانيتك تقريباً.');
      } else {
        out.text = 'أهلاً بيك يا فندم 👋 ' + 'علشان أدورلك على الأنسب: ' + (QS[q.cat[0]] || 'قولي المنطقة والمساحة وميزانيتك تقريباً.') + '\n(مفيش عرض ' + q.cat[1] + ' متاح دلوقتي، بس قولي طلبك وأنا أسجله وهندور لك عليه.)';
      }
      return out;
    }

    var intent = q.cat || q.budget || q.area || q.loc || /(غرف|اوض|اوضه)/.test(t) || /(ابحث|عايز|عاوز|محتاج|ابغي|اريد|اشتري|للبيع|ايجار|مطلوب)/.test(t);
    if (!intent) {
      out.needsAgent = true;
      /* أي رسالة مش واضحة والجلسة ليها سياق: تحويل للفريق من غير ما نرجع نسأل من الأول */
      if (hasContext()) { out.text = HOLD; return out; }
      var n = getUnclear() + 1; setUnclear(n);
      if (n === 1) { out.needsAgent = false; out.text = 'مش متأكد إني فهمت طلبك كويس. ' + askMissing() + ' ولو حابب تكلم حد من الفريق ابعتلي رقمك.'; }
      else if (n === 2) out.text = HOLD;
      else out.text = 'رسالتك وصلت لفريق الأستاذ محمد وهيرد عليك هنا قريب 🙏';
      return out;
    }
    setUnclear(0);
    if (q.results.length) {
      out.cards = q.results.slice(0, 3).map(cardData);
      out.text = 'لقيتلك ' + q.results.length + ' ' + (q.results.length > 1 ? 'عروض مناسبة' : 'عرض مناسب') + (q.results.length > 3 ? ' (دي أول ٣)' : '') + '. دي البيانات من عروضنا الفعلية.'
        + (state.haveContact ? ' لو عجبك واحد دوس "أنا مهتم" وهنكمل ببياناتك المسجلة.' : ' لو عجبك واحد دوس "أنا مهتم"، أو ابعتلي رقمك وهنكلمك.');
      return out;
    }
    // لا يوجد في العروض: نسجل الطلب للبحث الخارجي
    out.needsAgent = true;
    var near = q.pool.filter(function (p) { return !q.cat || p.category === q.cat[0]; }).slice(0, 2);
    out.cards = near.map(cardData);
    var desc = [q.cat ? q.cat[1] : '', q.loc || known.loc || '', q.area || known.area ? 'حوالي ' + (q.area || known.area) + ' م²' : '', q.budget || known.budget ? 'ميزانية ' + money(q.budget || known.budget) : ''].filter(Boolean).join(' - ');
    out.text = 'الطلب ده (' + (desc || raw.slice(0, 60)) + ') مش متوفر في عروضنا حالياً بالمواصفات دي بالظبط.' + (near.length ? ' دي أقرب عروض عندنا للمقارنة.' : '')
      + '\nسجلت طلبك وهندور لك عليه من برّه ونرجعلك بالمتاح.'
      + (state.haveContact ? ' وهنبلغك على رقمك المسجل أول ما نلاقي.' : ' ابعتلي اسمك ورقم موبايلك علشان نبلغك أول ما نلاقي.');
    if (!state.reqSent || true) {
      rpc('request_create', { p_session: sessionId, p_need: raw, p_category: q.cat ? q.cat[0] : known.need, p_location: q.loc || known.loc || null, p_budget_max: q.budget || known.budget || null, p_area_min: q.area || known.area || null, p_name: known.name || null, p_phone: known.phone || null, p_details: { source: 'app_chat', matched_in_listings: 0 } });
      state.reqSent = true; lset('sohag_chat_reqsent', '1');
    }
    return out;
  }

  var pollTimer = null;
  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(poll, 6000); poll();
  }
  function poll() {
    if (!state.started && !state.msgs.length) return;
    rpc('chat_poll', { p_session: sessionId, p_after: state.lastAgentId }).then(function (r) {
      var rows = (r && r.data) || [];
      rows.forEach(function (row) {
        state.lastAgentId = Math.max(state.lastAgentId, row.id); lset('sohag_chat_last_agent', String(state.lastAgentId));
        addMsg({ s: 'agent', b: row.body });
        if (!el.panel.classList.contains('open')) { state.unread++; updateDot(); }
      });
    });
  }

  function build() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    el.fab = mk('button', '', ''); el.fab.id = 'sc-fab'; el.fab.setAttribute('aria-label', 'محادثة مع المساعد');
    el.fab.innerHTML = '<i class="fa-solid fa-comments"></i><span class="sc-dot"></span>';
    el.dot = el.fab.querySelector('.sc-dot');
    el.tease = mk('div', '', 'أهلاً بيك! إنت محتاج إيه؟ أنا أقدر أساعدك 👋'); el.tease.id = 'sc-tease';
    el.panel = mk('div', ''); el.panel.id = 'sc-panel';
    el.panel.innerHTML = '<div id="sc-head"><div><b>المساعد الذكي - عروض سوهاج الجديدة</b><small>بيرد من العروض المتاحة فعلاً</small></div><button id="sc-close" aria-label="إغلاق">×</button></div><div id="sc-msgs"></div><div id="sc-chips"></div><form id="sc-form"><input id="sc-input" placeholder="اكتب طلبك هنا..." autocomplete="off"><button id="sc-send" type="submit">إرسال</button></form>';
    document.body.appendChild(el.panel); document.body.appendChild(el.tease); document.body.appendChild(el.fab);
    el.msgs = el.panel.querySelector('#sc-msgs'); el.input = el.panel.querySelector('#sc-input'); el.chips = el.panel.querySelector('#sc-chips');
    ['شقة', 'أرض', 'كمبوند', 'إيه المتاح عندكم؟'].forEach(function (c) {
      var b = mk('button', 'sc-chip', c); b.type = 'button';
      b.onclick = function () { userSay(c === 'إيه المتاح عندكم؟' ? c : 'عايز ' + c); }; el.chips.appendChild(b);
    });
    el.fab.onclick = function () { el.panel.classList.contains('open') ? closeChat() : openChat(); };
    el.tease.onclick = openChat;
    el.panel.querySelector('#sc-close').onclick = closeChat;
    el.panel.querySelector('#sc-form').onsubmit = function (e) { e.preventDefault(); var v = el.input.value; el.input.value = ''; userSay(v); };
    state.msgs.forEach(renderMsg); scroll();
    if (state.msgs.length) { el.chips.style.display = 'none'; ensureSession(); startPolling(); }
  }

  function proactive() {
    if (typeof isAdminMode !== 'undefined' && isAdminMode) return;
    if (SS.getItem('sohag_greeted')) return;
    SS.setItem('sohag_greeted', '1');
    setTimeout(function () {
      if (typeof isAdminMode !== 'undefined' && isAdminMode) return;
      if (el.panel.classList.contains('open')) return;
      if (!state.msgs.length) openChat();      /* أول زيارة: يفتح ويرحب */
      else { el.tease.style.display = 'block'; setTimeout(function () { el.tease.style.display = 'none'; }, 9000); }
    }, 2500);
  }

  function init() { build(); trackAll(); proactive(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
