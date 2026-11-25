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
    s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
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
    if (phone) { state.haveContact = true; lset('sohag_chat_contact', '1'); rpc('request_contact', { p_session: sessionId, p_name: reply.name || null, p_phone: phone }); }
    setTimeout(function () {
      (reply.cards || []).forEach(function (c) { addMsg({ t: 'card', d: c }); });
      if (reply.text) botSay(reply.text);
      startPolling();
    }, 450);
  }

  function respond(raw, phone, forceAgent) {
    var t = norm(raw), out = { text: '', cards: [], needsAgent: !!forceAgent };
    if (phone) {
      out.needsAgent = true;
      out.text = 'تمام، سجلت رقمك (' + phone + '). هيتواصل معاك حد من فريق الأستاذ محمد في أقرب وقت.';
      return out;
    }
    if (forceAgent) {
      out.text = 'ممتاز! علشان نكمل معاك ونحجزلك معاينة، ابعتلي اسمك ورقم موبايلك وهيتواصل معاك فريق الأستاذ محمد.';
      return out;
    }
    if (/^(سلام|السلام|اهلا|مرحبا|هاي|صباح|مساء|هلو|ازيك|يا معلم)/.test(t) && t.length < 30 && !detectCat(t)) {
      out.text = 'أهلاً بيك! إنت محتاج إيه بالظبط؟ (أرض، شقة، كمبوند، فيلا، محل) وميزانيتك تقريباً كام؟';
      return out;
    }
    if (/(اكلم|كلمني|اتصال|رقم الاستاذ|رقم المالك|تواصل|معاينه|اعاين|اشوف الوحده|حجز|اتفاق|تفاوض|خصم|اخر سعر|اقل سعر|اسيب رقمي)/.test(t)) {
      out.needsAgent = true;
      out.text = 'تمام، هبلغ فريق الأستاذ محمد. ابعتلي اسمك ورقم موبايلك وهيتواصلوا معاك. وقولي أنهي عرض يهمك لو حابب.';
      return out;
    }
    if (/(كل العروض|المتاح|ايه المتاح|عندكم ايه|عندك ايه|ايه اللي عندكم|الاقسام)/.test(t)) {
      var counts = {}; listings().filter(function (p) { return !p.sold; }).forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
      var lines = CATS.filter(function (c) { return counts[c[0]]; }).map(function (c) { return '• ' + c[1] + ': ' + counts[c[0]] + ' عرض'; });
      out.text = lines.length ? 'المتاح عندنا حالياً:\n' + lines.join('\n') + '\nقولي تحب أنهي نوع وميزانيتك كام.' : 'مفيش عروض معروضة دلوقتي، قولي طلبك وأنا أسجله وهندور لك عليه.';
      return out;
    }
    var q = search(raw);
    var intent = q.cat || q.budget || q.area || q.loc || /(ابحث|عايز|عاوز|محتاج|ابغي|اريد|اشتري|للبيع|ايجار|مطلوب)/.test(t);
    if (!intent) {
      out.needsAgent = true;
      out.text = 'مش متأكد إني فهمت طلبك كويس. ممكن توضحلي تحب أرض ولا شقة ولا كمبوند ولا محل، وميزانيتك كام؟ ولو حابب تكلم حد من الفريق ابعتلي رقمك.';
      return out;
    }
    if (q.results.length) {
      out.cards = q.results.slice(0, 3).map(cardData);
      out.text = 'لقيتلك ' + q.results.length + ' ' + (q.results.length > 1 ? 'عروض مناسبة' : 'عرض مناسب') + (q.results.length > 3 ? ' (دي أول ٣)' : '') + '. دي البيانات من عروضنا الفعلية. لو عجبك واحد دوس "أنا مهتم"، أو ابعتلي رقمك وهنكلمك.';
      return out;
    }
    // لا يوجد في العروض: نسجل الطلب للبحث الخارجي
    out.needsAgent = true;
    var near = q.pool.filter(function (p) { return !q.cat || p.category === q.cat[0]; }).slice(0, 2);
    out.cards = near.map(cardData);
    var desc = [q.cat ? q.cat[1] : '', q.loc || '', q.area ? 'حوالي ' + q.area + ' م²' : '', q.budget ? 'ميزانية ' + money(q.budget) : ''].filter(Boolean).join(' - ');
    out.text = 'الطلب ده (' + (desc || raw.slice(0, 60)) + ') مش متوفر في عروضنا حالياً بالمواصفات دي بالظبط.' + (near.length ? ' دي أقرب عروض عندنا للمقارنة.' : '') + '\nسجلت طلبك وهندور لك عليه من برّه ونرجعلك بالمتاح. ابعتلي اسمك ورقم موبايلك علشان نبلغك أول ما نلاقي.';
    if (!state.reqSent || true) {
      rpc('request_create', { p_session: sessionId, p_need: raw, p_category: q.cat ? q.cat[0] : null, p_location: q.loc || null, p_budget_max: q.budget || null, p_area_min: q.area || null, p_name: null, p_phone: null, p_details: { source: 'app_chat', matched_in_listings: 0 } });
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
