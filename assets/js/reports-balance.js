//  BALANCE GENERAL
// ══════════════════════════════════════════════════════════════
function renderBalance(D){
  const kv=[['k-act',D.total_act],['k-pas',D.total_pas],['k-pat',D.patrimonio],['k-ver',D.cuadra?'✅ OK':'⚠️ Error']];
  kv.forEach(([id,v])=>{ const el=document.getElementById(id); if(el) el.textContent=typeof v==='string'?v:fmt(v); });

  const banner=document.getElementById('balance-check-banner');
  if(banner){
    if(D.cuadra){
      banner.className='balance-check ok';
      banner.innerHTML=`✅ <strong>BALANCE CUADRADO</strong> — Activos = Pasivos + Patrimonio = ${fmt(D.total_act)}`;
    } else {
      banner.className='balance-check err';
      banner.innerHTML=`⚠️ <strong>BALANCE NO CUADRA</strong> — Diferencia: ${fmt(D.diff)} — Revisa los datos ingresados`;
    }
  }

  const actRows=[
    {type:'header',label:'ACTIVO CORRIENTE'},
    {type:'sub',label:'Caja y Bancos',v:D.caja_b},
    {type:'sub',label:'Cuentas por Cobrar',v:D.cxc},
    {type:'sub',label:'Inventarios',v:D.inv},
    {type:'total',label:'TOTAL ACTIVO CORRIENTE',v:D.act_cte},
    {type:'header',label:'ACTIVO NO CORRIENTE'},
    {type:'sub',label:'Activos Fijos Netos',v:D.af},
    {type:'sub',label:'Otros Activos',v:D.oact},
    {type:'total',label:'TOTAL ACTIVO NO CORRIENTE',v:D.act_ncte},
    {type:'hl',label:'TOTAL ACTIVOS',v:D.total_act},
  ];
  const pasRows=[
    {type:'header',label:'PASIVO CORRIENTE'},
    {type:'sub',label:'Cuentas por Pagar',v:D.cxp},
    {type:'sub',label:'Otras Deudas',v:D.odeu},
    {type:'total',label:'TOTAL PASIVO CORRIENTE',v:D.pas_cte},
    {type:'header',label:'PASIVO NO CORRIENTE'},
    {type:'sub',label:'Deudas a Largo Plazo',v:D.dlp},
    {type:'total',label:'TOTAL PASIVO NO CORRIENTE',v:D.pas_ncte},
    {type:'header',label:'PATRIMONIO'},
    {type:'sub',label:'Capital Social',v:D.cap},
    {type:'sub',label:'Reservas',v:D.res},
    {type:'sub',label:'Utilidad del Ejercicio',v:D.ut_neta},
    {type:'total',label:'TOTAL PATRIMONIO',v:D.patrimonio},
    {type:'hl',label:'TOTAL PASIVOS + PATRIMONIO',v:D.total_pyp},
  ];

  const rowHtml=(rows)=>rows.map(r=>{
    if(r.type==='header') return `<tr class="row-header"><td colspan="2">${r.label}</td></tr>`;
    const cls=r.type==='total'?'row-total':r.type==='hl'?'row-hl':'row-sub';
    return `<tr class="${cls}"><td>${r.label}</td><td style="text-align:right;font-family:'DM Mono',monospace;font-weight:600">${fmt(r.v)}</td></tr>`;
  }).join('');

  const ab=document.getElementById('activos-body');
  const pb=document.getElementById('pasivos-body');
  if(ab) ab.innerHTML=rowHtml(actRows);
  if(pb) pb.innerHTML=rowHtml(pasRows);

  // Balance chart
  destroyChart('balance');
  const ctx=document.getElementById('ch-balance');
  if(ctx){
    charts['balance']=new Chart(ctx,{
      type:'doughnut',
      data:{
        labels:['Act.Corriente','Act.No Cte.','Pas.Corriente','Pas.No Cte.','Patrimonio'],
        datasets:[{
          data:[D.act_cte,D.act_ncte,D.pas_cte,D.pas_ncte,D.patrimonio],
          backgroundColor:[C.teal,'#0284C7',C.red,'#DC2626',C.green],
          borderWidth:2,borderColor:'#fff',hoverOffset:8
        }]
      },
      options:{
        responsive:true,maintainAspectRatio:false,cutout:'55%',
        plugins:{
          legend:{position:'right',labels:{padding:12,usePointStyle:true,font:{family:'DM Sans',size:11}}},
          tooltip:{callbacks:{label:c=>'S/ '+c.raw.toLocaleString('es-PE')}}
        }
      }
    });
  }

  // Breakdown
  const bd=document.getElementById('balance-breakdown');
  if(bd){
    const tot=D.total_act||1;
    const items=[
      {label:'Act. Corriente',v:D.act_cte,color:C.teal,pct:D.act_cte/tot},
      {label:'Act. No Corriente',v:D.act_ncte,color:'#0284C7',pct:D.act_ncte/tot},
      {label:'Pasivo Corriente',v:D.pas_cte,color:C.red,pct:D.pas_cte/tot},
      {label:'Pasivo No Cte.',v:D.pas_ncte,color:'#DC2626',pct:D.pas_ncte/tot},
      {label:'Patrimonio',v:D.patrimonio,color:C.green,pct:D.patrimonio/tot},
    ];
    bd.innerHTML='<div class="progress-row">'+items.map(i=>`
      <div class="prog-item">
        <div class="prog-label">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:${i.color};display:inline-block"></span>${i.label}</span>
          <span>${fmt(i.v)} <span style="color:var(--slate2)">(${pct(i.pct)})</span></span>
        </div>
        <div class="prog-bar"><div class="prog-fill" style="width:${Math.min(100,Math.abs(i.pct)*100).toFixed(1)}%;background:${i.color}"></div></div>
      </div>`).join('')+'</div>';
  }
}
