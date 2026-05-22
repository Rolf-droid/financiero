// ══════════════════════════════════════════════════════════════
//  UTILIDADES
// ══════════════════════════════════════════════════════════════
const fmt = v => {
  if(v === null || v === undefined || isNaN(v)) return '—';
  const abs = Math.abs(v);
  const str = abs.toLocaleString('es-PE',{minimumFractionDigits:0,maximumFractionDigits:0});
  return (v<0?'(S/ '+str+')':'S/ '+str);
};
const pct = v => isNaN(v)||!isFinite(v)?'—':(v*100).toFixed(1)+'%';
const xfmt = v => isNaN(v)||!isFinite(v)?'—':v.toFixed(2)+'x';
const g = id => parseFloat(document.getElementById(id)?.value)||0;

// Colors
const C = {
  navy:'#0B1F3A', teal:'#0EA5C9', green:'#10B981', amber:'#F59E0B',
  red:'#EF4444', purple:'#8B5CF6', slate:'#64748B',
  teal2:'rgba(14,165,201,.15)', green2:'rgba(16,185,129,.15)',
  amber2:'rgba(245,158,11,.15)', red2:'rgba(239,68,68,.15)',
};
