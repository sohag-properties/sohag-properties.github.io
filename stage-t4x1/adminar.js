/* تفاصيل الطلبات الواردة بالعربي (بدل مفاتيح إنجليزي) + تنبيه لو الأرقام مش منطقية. عرض فقط، مفيش تغيير في البيانات المخزنة. */
(function () {
  'use strict';
  var L = { freq: 'نظام القسط', floor: 'الدور', years: 'مدة التقسيط', building: 'العمارة', delivery: 'الاستلام', deliveryTime: 'الاستلام', finishStatus: 'التشطيب', payMode: 'طريقة الدفع', saleType: 'نوع البيع', instCount: 'عدد الأقساط', instValue: 'قيمة القسط', singleInstallmentVal: 'قيمة القسط', paidCount: 'الأقساط المدفوعة (عدد)', paidAmount: 'المدفوع', downPayment: 'المقدم', lastInstValue: 'قيمة القسط الأخير', lastInstallmentVal: 'قيمة القسط الأخير', pricePerMeter: 'سعر المتر', remainingCount: 'الأقساط المتبقية (عدد)', remainingYears: 'المدة المتبقية', remainingAmount: 'المتبقي', paid: 'المدفوع (أقساط)', remaining: 'المتبقي (أقساط)' };
  var MONEY = { paidAmount: 1, downPayment: 1, instValue: 1, lastInstValue: 1, singleInstallmentVal: 1, lastInstallmentVal: 1, pricePerMeter: 1, remainingAmount: 1 };
  var YEARS = { years: 1, remainingYears: 1 };
  var VAL = { saleType: { resale: 'إعادة بيع (ريسيل)', new: 'جديد من الشركة' }, payMode: { installments: 'تقسيط', cash: 'كاش' } };
  function n(x) { return Number(x).toLocaleString('en-US'); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pair(k, v) {
    var lab = L[k] || 'بند إضافي', val = v;
    if (VAL[k] && VAL[k][v]) val = VAL[k][v];
    else if (MONEY[k] && !isNaN(Number(v))) val = n(v) + ' ج.م';
    else if (YEARS[k] && !isNaN(Number(v))) { var y = Number(v); val = (y === 1 ? 'سنة' : y === 2 ? 'سنتين' : n(y) + ' سنين'); }
    else if (!isNaN(Number(v)) && String(v).trim() !== '') val = n(v);
    return '<div style="display:flex;justify-content:space-between;gap:8px;padding:2px 0"><span style="color:#64748b">' + esc(lab) + '</span><b>' + esc(val) + '</b></div>';
  }
  function pendProblems(sub) {
    var m = [], cd = (sub && (sub.compoundDetails || sub.apartmentPaymentDelivery)) || {}, tp = Number(sub && sub.totalPrice), dp = Number(cd.downPayment) || 0;
    if (!sub.category || !sub.subcategory) m.push('القسم');
    if (!sub.location || !String(sub.location).trim()) m.push('المنطقة / المجاورة');
    if (!(Number(sub.area) > 0)) m.push('المساحة');
    if (!(tp > 0)) m.push('السعر'); else if (tp < 10000) m.push('السعر غير منطقي (' + n(tp) + ' ج.م، أقل من ١٠,٠٠٠)');
    if (tp > 0 && dp > tp) m.push('السعر أقل من المقدم المدفوع');
    if (!Array.isArray(sub.images) || !sub.images.length) m.push('صورة واحدة على الأقل');
    var ph = String(sub.ownerPhone || '').replace(/\D/g, ''); if (ph.length < 10) m.push('رقم الموبايل');
    if (String(sub.notes || '').trim().length < 10) m.push('وصف العقار (١٠ حروف على الأقل)');
    var ap = sub.apartmentPaymentDelivery; if (ap && ap.payMode === 'installments' && !(Number(ap.years) > 0)) m.push('مدة التقسيط');
    if ((cd.paidCount || 0) > (cd.instCount || 0)) m.push('عدد الأقساط المدفوعة أكبر من الإجمالي');
    return m;
  }
  window.pendProblems = pendProblems;
  window.pendDetailsAr = function (sub) {
    var pp = pendProblems(sub || {}), out = pp.length ? '<div class="text-xs font-black text-red-800 bg-red-50 border-2 border-red-400 rounded-xl p-2">⚠ بيان ناقص: ' + pp.map(esc).join(' • ') + '<br><span class="font-bold">متقبلهوش قبل ما تستكمل البيانات دي</span></div>' : '';
    ['compoundDetails', 'apartmentPaymentDelivery', 'installments4Info'].forEach(function (g) {
      var o = sub && sub[g]; if (!o || typeof o !== 'object') return;
      var rows = Object.keys(o).filter(function (k) { return o[k] !== '' && o[k] !== null && o[k] !== undefined && o[k] !== 0 && o[k] !== false; }).map(function (k) { return pair(k, o[k]); }).join('');
      if (rows) out += '<div class="text-xs text-slate-700 bg-slate-50 rounded-xl p-2 border border-slate-200">' + rows + '</div>';
    });
    var cd = (sub && (sub.compoundDetails || sub.apartmentPaymentDelivery)) || {}, tp = Number(sub && sub.totalPrice), dp = Number(cd.downPayment) + (Number(cd.paidAmount) && Number(cd.paidAmount) !== Number(cd.downPayment) ? Number(cd.paidAmount) : 0);
    if (false) out += '<div class="text-xs font-black text-red-700 bg-red-50 border border-red-300 rounded-xl p-2">⚠ السعر المطلوب (' + n(tp) + ' ج.م) أقل من المقدم المدفوع (' + n(Number(cd.downPayment) || dp) + ' ج.م). راجع الأرقام مع صاحب الطلب قبل الموافقة.</div>';
    return out;
  };
})();
