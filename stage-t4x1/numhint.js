/* تجميع الأرقام + كتابة المبلغ بالحروف تحت خانات الأرقام (staging). لا يغيّر القيمة المخزنة: بيضيف سطر توضيح تحت الخانة بس. */
(function () {
  'use strict';
  var ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  var TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  var HUND = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  function below1000(n) {
    var p = [], h = Math.floor(n / 100), r = n % 100;
    if (h) p.push(HUND[h]);
    if (r) { if (r < 20) p.push(ONES[r]); else { var u = r % 10, t = Math.floor(r / 10); p.push(u ? ONES[u] + ' و' + TENS[t] : TENS[t]); } }
    return p.join(' و');
  }
  var UN = [['', '', '', ''], ['ألف', 'ألفان', 'آلاف', 'ألف'], ['مليون', 'مليونان', 'ملايين', 'مليون'], ['مليار', 'ملياران', 'مليارات', 'مليار']];
  function words(n) {
    n = Math.floor(Number(n));
    if (!(n > 0) || n >= 1e12) return '';
    var g = [], i = 0, parts = [];
    while (n > 0) { g.push(n % 1000); n = Math.floor(n / 1000); }
    for (i = g.length - 1; i >= 0; i--) {
      var x = g[i]; if (!x) continue;
      if (i === 0) parts.push(below1000(x));
      else if (x === 1) parts.push(UN[i][0]);
      else if (x === 2) parts.push(UN[i][1]);
      else if (x === 200) parts.push('مائتا ' + UN[i][0]);
      else if (x <= 10) parts.push(below1000(x) + ' ' + UN[i][2]);
      else parts.push(below1000(x) + ' ' + UN[i][3]);
    }
    return parts.join(' و');
  }
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  window.__numWords = words; window.__numFmt = fmt;
  var AREA = ['propArea', 'adminAptAreaInput', 'clientAptAreaInput', 'clientArea', 'adminFactoryBuiltArea', 'clientFactoryBuiltArea', 'wsArea'];
  var MONEY = ['calcBudget', 'calcDown', 'adminAptPricePerMeter', 'adminAptDownPayment', 'adminAptOver', 'adminAptTotalPriceMirror', 'adminCompPricePerMeter', 'adminCompDownPayment', 'adminCompOver', 'adminMallPricePerMeter', 'adminMallDown', 'adminMallOver', 'adminMallInstTotal', 'adminMallInstPaid', 'propTotalPrice', 'clientAptPricePerMeter', 'clientAptDownPayment', 'clientAptTotalPriceMirror', 'clientTotalPrice', 'clientCompDownPayment', 'clientMallPricePerMeter', 'clientMallDown', 'clientMallOver', 'clientMallInstTotal', 'clientMallInstPaid', 'alertBudget', 'wsPrice', 'wsDown', 'wsPaid', 'wsOver', 'wsInstAmt'];
  function upd(el) {
    var id = el.id, isA = AREA.indexOf(id) > -1;
    if (!isA && MONEY.indexOf(id) === -1) return;
    var lb = document.getElementById('nh_' + id);
    if (!lb) { lb = document.createElement('div'); lb.id = 'nh_' + id; lb.setAttribute('data-numhint', '1'); lb.style.cssText = 'font-size:12px;font-weight:700;color:#b45309;margin:2px 0 6px;min-height:0;direction:rtl;line-height:1.5'; el.insertAdjacentElement('afterend', lb); }
    var v = parseFloat(String(el.value).replace(/,/g, ''));
    if (!(v > 0)) { lb.textContent = ''; return; }
    var w = words(v);
    lb.textContent = fmt(v) + (w ? ' = ' + w + (isA ? ' متر مربع' : ' جنيه') : '');
  }
  document.addEventListener('input', function (e) { if (e.target && e.target.id) upd(e.target); }, true);
  document.addEventListener('focusin', function (e) { if (e.target && e.target.id) upd(e.target); }, true);
  document.addEventListener('change', function (e) { if (e.target && e.target.id) upd(e.target); }, true);
})();
