// ══════════════════════════════════════════════════════════════
//  NAV
// ══════════════════════════════════════════════════════════════
const titles = {
  datos:'📝 Ingreso de Datos',
  resultados:'📈 Estado de Resultados',
  flujo:'💸 Flujo de Caja',
  balance:'🏛 Balance General',
  dashboard:'📐 Dashboard & Ratios',
  ajustes:'⚙️ Ajustes — Gestión de Cuentas'
};

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>{
    if(n.getAttribute('onclick')?.includes("'"+id+"'")) n.classList.add('active');
  });
  document.getElementById('topbar-title').textContent = titles[id]||'';
  if(id === 'ajustes') renderAjustes();
  else calcularTodo();
}
