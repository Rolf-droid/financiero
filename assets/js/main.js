//  HELPERS
// ══════════════════════════════════════════════════════════════
function restaurarEjemplo(){
  const defaults={ventas:30000,servicios:1500,otros_ing:100,costo_ventas:200,gs_ventas:60,
    gs_admin:600,gs_fin:300,deprec:500,tasa_ir:29.5,
    cobranzas:45000,pag_prov:30000,pag_plan:15000,pag_trib:12500,compra_af:120,
    prestamos:450,amort:45000,saldo_ini:4600,
    caja:1500,cxc:2500,inventarios:3500,af_netos:4500,otros_act:5500,
    cxp:6500,otras_deudas:8500,dlp:7500,capital:9500,reservas:10000};
  Object.entries(defaults).forEach(([id,v])=>{
    const el=document.getElementById(id);
    if(el) el.value=v;
  });
  calcularTodo();
  showToast('↩ Ejemplo restaurado con datos de demostración','info');
}

function imprimirSeccion(pageId){
  window.print();
}

// Clock
function tick(){
  const d=new Date();
  const el=document.getElementById('clock-side');
  if(el) el.textContent=d.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
}
setInterval(tick,1000); tick();

// Init
Chart.defaults.font.family="'DM Sans', sans-serif";
Chart.defaults.color='#64748B';
Chart.defaults.plugins.legend.labels.padding=14;
Chart.defaults.plugins.legend.labels.usePointStyle=true;

// Initial calculation
calcularTodo();

if(restoreSession() && typeof showPage === 'function'){
  showPage('datos');
} else {
  updateLogoutVisibility();
}
