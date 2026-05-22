//  FLUJO DE CAJA
// ══════════════════════════════════════════════════════════════
function renderFlujo(D){
  const kv=[['k-op',D.f_op],['k-inv',D.f_inv],['k-fin',D.f_fin],['k-saldo',D.s_fin]];
  kv.forEach(([id,v])=>{ const el=document.getElementById(id); if(el) el.textContent=fmt(v); });

  // Alert
  const al=document.getElementById('flujo-alert');
  const alm=document.getElementById('flujo-alert-msg');
  if(al && alm){
    if(D.s_fin<0){
      al.style.display='flex'; al.className='alert danger';
      alm.textContent=`Saldo final de caja negativo (${fmt(D.s_fin)}). Se recomienda revisar las amortizaciones de deuda y buscar fuentes de financiamiento a corto plazo.`;
    } else if(D.s_fin<5000){
      al.style.display='flex'; al.className='alert warn';
      alm.textContent=`Saldo final bajo (${fmt(D.s_fin)}). Mantener reserva mínima de liquidez para operaciones.`;
    } else {
      al.style.display='none';
    }
  }

  const rows=[
    {type:'header',label:'I. ACTIVIDADES DE OPERACIÓN'},
    {type:'sub',label:'(+) Cobranzas a Clientes', v:D.cobr},
    {type:'sub',label:'(-) Pagos a Proveedores', v:-D.pp, neg:true},
    {type:'sub',label:'(-) Pagos de Planillas', v:-D.ppl, neg:true},
    {type:'sub',label:'(-) Pagos de Tributos', v:-D.ptrib, neg:true},
    {type:'total',label:'FLUJO NETO DE OPERACIÓN', v:D.f_op},
    {type:'header',label:'II. ACTIVIDADES DE INVERSIÓN'},
    {type:'sub',label:'(-) Compra de Activos Fijos', v:-D.caf, neg:true},
    {type:'total',label:'FLUJO NETO DE INVERSIÓN', v:D.f_inv},
    {type:'header',label:'III. ACTIVIDADES DE FINANCIAMIENTO'},
    {type:'sub',label:'(+) Préstamos Recibidos', v:D.prest},
    {type:'sub',label:'(-) Amortización de Deudas', v:-D.amort, neg:true},
    {type:'total',label:'FLUJO NETO DE FINANCIAMIENTO', v:D.f_fin},
    {type:'hl',label:'VARIACIÓN NETA DEL EFECTIVO', v:D.f_neto},
    {type:'sub',label:'(+) Saldo Inicial de Caja', v:D.s_ini},
    {type:'total',label:'SALDO FINAL DE CAJA', v:D.s_fin},
  ];

  const tbody=document.getElementById('flujo-body');
  if(tbody) tbody.innerHTML = rows.map(r=>{
    if(r.type==='header') return `<tr class="row-header"><td colspan="2">${r.label}</td></tr>`;
    const cls = r.type==='total'?'row-total':r.type==='hl'?'row-hl':r.neg?'row-sub row-neg':'row-sub';
    const color = r.v<0?'color:var(--red)':'';
    return `<tr class="${cls}"><td>${r.label}</td><td style="text-align:right;font-family:'DM Mono',monospace;font-weight:600;${color}">${fmt(r.v)}</td></tr>`;
  }).join('');

  // Flujo chart
  destroyChart('flujo');
  const ctx=document.getElementById('ch-flujo');
  if(ctx){
    const labels=['Flujo Op.','Flujo Inv.','Flujo Fin.'];
    const vals=[D.f_op, D.f_inv, D.f_fin];
    charts['flujo'] = new Chart(ctx,{
      type:'bar',
      data:{
        labels,
        datasets:[{
          label:'S/',
          data:vals,
          backgroundColor:vals.map(v=>v>=0?C.green:C.red),
          borderRadius:8,borderSkipped:false
        }]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'S/ '+c.raw.toLocaleString('es-PE')}}},
        scales:{
          y:{grid:{color:'#F1F5F9'},ticks:{callback:v=>'S/'+v.toLocaleString('es-PE'),font:{family:'DM Mono',size:10}}},
          x:{grid:{display:false}}
        }
      }
    });
  }

  // Bars
  const barsEl=document.getElementById('flujo-bars');
  if(barsEl){
    const max=Math.max(D.cobr,D.pp+D.ppl+D.ptrib,D.amort)||1;
    const items=[
      {label:'Cobranzas',v:D.cobr,color:C.teal},
      {label:'Pagos Proveedores',v:D.pp,color:C.red},
      {label:'Planillas',v:D.ppl,color:C.amber},
      {label:'Amort.Deudas',v:D.amort,color:C.purple},
    ];
    barsEl.innerHTML=items.map(i=>`
      <div class="prog-item">
        <div class="prog-label"><span>${i.label}</span><span>${fmt(i.v)}</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${Math.min(100,(i.v/max)*100).toFixed(1)}%;background:${i.color}"></div></div>
      </div>`).join('');
  }
}
