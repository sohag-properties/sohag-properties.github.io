/* سوهاج: لوحة المحادثات للإدارة — قراءة فقط من Supabase عبر RPCs محمية */
(function () {
  'use strict';
  var SB_URL = 'https://ddjdejmzuucdbsprigbz.supabase.co';
  var SB_KEY = 'sb_publishable_cAUPNPGXZyrRY5-UN2wI5w_dERXX7hE';
  var ADMIN_READ_TOKEN = 'GCOC6ksK3DE5qXvtuBKbYx7PikOsmVTU';
  var TEST_SESSIONS = {
    'f51eb4ff-fc07-478e-878b-0f8b087c7fd5': true,
    'b1cb9c8c-96c1-4f83-bba6-ec2382291e49': true
  };
  var sb = null;
  function client() {
    if (sb) return sb;
    if (typeof supabase === 'undefined' || !supabase.createClient) return null;
    sb = supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    return sb;
  }
  function rpc(name, args) {
    var c = client(); if (!c) return Promise.resolve({ error: 'no client' });
    args = args || {};
    var getTok = window.cloudGetToken ? window.cloudGetToken() : Promise.resolve(null);
    return getTok.then(function (tok) {
      if (tok) {
        args.p_token = '';
        return fetch(SB_URL + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
          .then(function (r) { return r.json().then(function (d) { return r.ok ? { data: d } : { error: d }; }); });
      }
      args.p_token = ADMIN_READ_TOKEN;
      return c.rpc(name, args);
    }).then(function (r) { if (r.error) console.warn('admin rpc', name, r.error); return r; }).catch(function (e) { return { error: e }; });
  }

  var view = 'sessions';        /* sessions | requests | transcript */
  var openSession = null;       /* session object being read */
  var lastData = { sessions: [], requests: [] };
  var pollTimer = null;

  function mk(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function fmtTime(ts) {
    if (!ts) return '';
    try { return new Date(ts).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch (_) { return String(ts).slice(0, 16); }
  }
  var STATUS = { open: 'مفتوحة', closed: 'مغلقة', handed_off: 'مع الفريق', needs_sourcing: 'بندور على طلبه' };
  var REQ_STATUS = { new: 'جديد', sourcing: 'جاري التوفير', closed: 'مغلق', done: 'تم', contacted: 'تم التواصل' };
  function statusLabel(s) { return STATUS[s] || s || 'مفتوحة'; }
  function reqStatusLabel(s) { return REQ_STATUS[s] || s || 'جديد'; }
  function money(n) { return n ? Number(n).toLocaleString('ar-EG') + ' ج.م' : ''; }
  function content() { return document.getElementById('chatsContent'); }
  function showClosed() { var c = document.getElementById('chatsShowClosed'); return c && c.checked; }

  /* ===== قائمة المحادثات ===== */
  function renderSessions(rows) {
    var box = content(); box.innerHTML = '';
    if (!rows.length) { box.appendChild(mk('div', 'bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm font-bold', 'مفيش محادثات لسه. لو في محادثات مغلقة أو اختبارات، فعّل "إظهار المغلقة والاختبارات".')); return; }
    rows.forEach(function (s) {
      var isTest = !!TEST_SESSIONS[s.id];
      var card = mk('button', 'w-full text-right bg-white border rounded-2xl p-4 flex flex-col gap-1.5 transition hover:border-teal-500 cursor-pointer ' + (s.waiting ? 'border-red-300 bg-red-50/40' : 'border-slate-200'));
      card.type = 'button';
      var top = mk('div', 'flex items-center justify-between gap-2 flex-wrap');
      var who = mk('div', 'flex items-center gap-2 flex-wrap');
      who.appendChild(mk('span', 'font-black text-navy-900 text-sm', s.name || 'زائر بدون اسم'));
      if (s.phone) who.appendChild(mk('span', 'text-teal-700 font-bold text-xs dir-ltr', s.phone));
      top.appendChild(who);
      var badges = mk('div', 'flex items-center gap-1.5 flex-wrap');
      if (s.waiting) badges.appendChild(mk('span', 'bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full', 'بيستنى رد'));
      if (isTest) badges.appendChild(mk('span', 'bg-slate-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full', 'اختبار'));
      var stCls = s.status === 'closed' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800';
      badges.appendChild(mk('span', stCls + ' text-[11px] font-black px-2 py-0.5 rounded-full', statusLabel(s.status)));
      top.appendChild(badges);
      card.appendChild(top);
      if (s.last_body) {
        var prev = mk('div', 'text-xs text-slate-600 font-semibold truncate', (s.last_sender === 'visitor' ? 'العميل: ' : s.last_sender === 'agent' ? 'الفريق: ' : 'البوت: ') + s.last_body);
        card.appendChild(prev);
      }
      card.appendChild(mk('div', 'text-[11px] text-slate-400 font-bold', fmtTime(s.last_message_at || s.created_at) + ' • ' + (s.msg_count || 0) + ' رسالة'));
      card.onclick = function () { openTranscript(s); };
      box.appendChild(card);
    });
  }

  /* ===== عرض المحادثة الكاملة ===== */
  function renderTranscript(msgs) {
    var box = content(); box.innerHTML = '';
    var s = openSession || {};
    var head = mk('div', 'bg-navy-900 text-white rounded-2xl p-3.5 flex items-center gap-3');
    var back = mk('button', 'bg-white/15 hover:bg-white/25 text-white font-black text-xs px-3 py-2 rounded-xl cursor-pointer shrink-0', '‹ رجوع');
    back.type = 'button'; back.onclick = function () { view = 'sessions'; openSession = null; refresh(); };
    head.appendChild(back);
    var info = mk('div', 'min-w-0');
    info.appendChild(mk('div', 'font-black text-sm', (s.name || 'زائر بدون اسم') + (s.phone ? ' • ' + s.phone : '')));
    info.appendChild(mk('div', 'text-[11px] text-slate-300 font-bold', statusLabel(s.status) + (TEST_SESSIONS[s.id] ? ' • اختبار' : '') + ' • ' + fmtTime(s.last_message_at || s.created_at)));
    head.appendChild(info);
    box.appendChild(head);

    var thread = mk('div', 'bg-[#e5ddd5] rounded-2xl p-3 flex flex-col gap-2');
    if (!msgs.length) thread.appendChild(mk('div', 'text-center text-slate-500 text-xs font-bold py-6', 'مفيش رسائل في المحادثة دي'));
    msgs.forEach(function (m) {
      var rowCls, bubCls, who = null;
      if (m.sender === 'visitor') { rowCls = 'self-end'; bubCls = 'bg-teal-700 text-white rounded-2xl rounded-tl-md'; }
      else if (m.sender === 'agent') { rowCls = 'self-start'; bubCls = 'bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl rounded-tr-md'; who = 'فريق الإدارة'; }
      else { rowCls = 'self-start'; bubCls = 'bg-white border border-slate-200 text-navy-900 rounded-2xl rounded-tr-md'; who = 'المساعد الذكي'; }
      var bub = mk('div', 'max-w-[85%] px-3 py-2 ' + rowCls + ' ' + bubCls);
      if (who) bub.appendChild(mk('span', 'block text-[10px] font-black opacity-70 mb-0.5', who));
      var body = mk('div', 'text-[13.5px] leading-relaxed font-semibold whitespace-pre-wrap break-words'); body.textContent = m.body || '';
      bub.appendChild(body);
      var meta = mk('div', 'text-[10px] font-bold mt-1 ' + (m.sender === 'visitor' ? 'text-teal-100/80' : 'text-slate-400'), fmtTime(m.created_at) + (m.needs_agent ? ' • طلب تدخل' : ''));
      bub.appendChild(meta);
      thread.appendChild(bub);
    });
    box.appendChild(thread);
  }

  function openTranscript(s) {
    view = 'transcript'; openSession = s;
    var box = content(); box.innerHTML = '';
    box.appendChild(mk('div', 'text-center text-slate-500 text-sm font-bold py-8', 'بنحمل المحادثة...'));
    rpc('admin_chat_messages', { p_session: s.id }).then(function (r) {
      if (view !== 'transcript' || !openSession || openSession.id !== s.id) return;
      renderTranscript((r && r.data) || []);
    });
  }

  /* ===== طلبات العملاء من الشات ===== */
  function renderRequests(rows) {
    var box = content(); box.innerHTML = '';
    if (!rows.length) { box.appendChild(mk('div', 'bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm font-bold', 'مفيش طلبات مسجلة من الشات لسه.')); return; }
    rows.forEach(function (r) {
      var isClosed = r.status === 'closed';
      var card = mk('div', 'bg-white border rounded-2xl p-4 space-y-1.5 ' + (isClosed ? 'border-slate-200 opacity-75' : 'border-amber-300'));
      var top = mk('div', 'flex items-center justify-between gap-2 flex-wrap');
      top.appendChild(mk('span', 'font-black text-navy-900 text-sm', r.client_name || 'بدون اسم'));
      var stCls = isClosed ? 'bg-slate-200 text-slate-600' : r.status === 'new' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800';
      top.appendChild(mk('span', stCls + ' text-[11px] font-black px-2 py-0.5 rounded-full', reqStatusLabel(r.status)));
      card.appendChild(top);
      if (r.need) card.appendChild(mk('div', 'text-[13px] text-slate-800 font-bold whitespace-pre-wrap break-words', r.need));
      var bits = [];
      if (r.client_phone) bits.push('📞 ' + r.client_phone);
      if (r.location) bits.push('📍 ' + r.location);
      if (r.budget_max) bits.push('ميزانية ' + money(r.budget_max));
      if (r.area_min) bits.push('من ' + Number(r.area_min).toLocaleString('ar-EG') + ' م²');
      if (bits.length) card.appendChild(mk('div', 'text-xs text-slate-500 font-bold', bits.join(' • ')));
      if (r.agent_notes) card.appendChild(mk('div', 'text-[11px] text-slate-400 font-semibold', 'ملاحظات الفريق: ' + r.agent_notes));
      card.appendChild(mk('div', 'text-[11px] text-slate-400 font-bold', fmtTime(r.created_at)));
      box.appendChild(card);
    });
  }

  /* ===== تحميل وتحديث ===== */
  function refresh(manual) {
    var box = content(); if (!box) return;
    if (view === 'transcript' && openSession) {
      rpc('admin_chat_messages', { p_session: openSession.id }).then(function (r) {
        if (view !== 'transcript') return;
        renderTranscript((r && r.data) || []);
      });
      return;
    }
    if (view === 'requests') {
      rpc('admin_client_requests', {}).then(function (r) {
        if (view !== 'requests') return;
        lastData.requests = (r && r.data) || [];
        renderRequests(lastData.requests);
      });
      return;
    }
    if (manual) { box.innerHTML = ''; box.appendChild(mk('div', 'text-center text-slate-500 text-sm font-bold py-8', 'بنحمل المحادثات...')); }
    rpc('admin_chat_sessions', { p_include_closed: showClosed() }).then(function (r) {
      if (view !== 'sessions') return;
      lastData.sessions = (r && r.data) || [];
      renderSessions(lastData.sessions);
    });
  }

  function setView(v) {
    view = v;
    document.querySelectorAll('.chats-subtab').forEach(function (b) {
      var on = b.getAttribute('data-view') === v;
      b.classList.toggle('bg-teal-700', on); b.classList.toggle('text-white', on);
      b.classList.toggle('bg-white', !on); b.classList.toggle('text-teal-800', !on);
    });
    refresh(true);
  }

  function start() {
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      var sec = document.getElementById('chatsSection');
      if (sec && !sec.classList.contains('hidden')) refresh(false);
    }, 15000);
  }

  window.renderChatsAdmin = function (manual) { start(); refresh(!!manual); };
  window.chatsSetView = setView;
})();
