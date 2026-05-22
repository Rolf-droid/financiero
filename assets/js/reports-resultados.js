//  ESTADO DE RESULTADOS
// ══════════════════════════════════════════════════════════════
function renderResultados(D){
  // KPIs
  const kpis=[
    ['k-ing', D.total_ing],['k-bruta',D.ut_bruta],
    ['k-ebit',D.ebit],['k-neta',D.ut_neta]
  ];
  kpis.forEach(([id,v])=>{ const el=document.getElementById(id); if(el) el.textContent=fmt(v); });

  const rows = [
    {type:'header',label:'INGRESOS OPERACIONALES'},
    {type:'sub',label:'Ventas de Mercadería', v:D.ventas, pct:D.ventas/D.total_ing},
    {type:'sub',label:'Prestación de Servicios', v:D.servicios, pct:D.servicios/D.total_ing},
    {type:'sub',label:'Otros Ingresos', v:D.otros_ing, pct:D.otros_ing/D.total_ing},
    {type:'total',label:'TOTAL INGRESOS', v:D.total_ing, pct:1},
    {type:'header',label:'COSTOS Y GASTOS'},
    {type:'sub',label:'(-) Costo de Ventas', v:D.costo_v, neg:true, pct:D.costo_v/D.total_ing},
    {type:'hl',label:'UTILIDAD BRUTA', v:D.ut_bruta, pct:D.ut_bruta/D.total_ing},
    {type:'sub',label:'(-) Gastos de Ventas', v:D.gs_v, neg:true, pct:D.gs_v/D.total_ing},
    {type:'sub',label:'(-) Gastos Administrativos', v:D.gs_a, neg:true, pct:D.gs_a/D.total_ing},
    {type:'hl',label:'UTILIDAD OPERATIVA (EBIT)', v:D.ebit, pct:D.ebit/D.total_ing},
    {type:'sub',label:'(-) Gastos Financieros', v:D.gs_f, neg:true},
    {type:'sub',label:'(-) Depreciación', v:D.deprec, neg:true},
    {type:'sub',label:'UTILIDAD ANTES DE IMPUESTOS', v:D.ut_ai},
    {type:'sub',label:`(-) Impuesto a la Renta ${(D.tasa*100).toFixed(1)}%`, v:D.ir, neg:true},
    {type:'total',label:'UTILIDAD NETA DEL EJERCICIO', v:D.ut_neta, pct:D.ut_neta/D.total_ing},
  ];

  const tbody = document.getElementById('er-body');
  if(!tbody) return;
  tbody.innerHTML = rows.map(r=>{
    if(r.type==='header') return `<tr class="row-header"><td colspan="3">${r.label}</td></tr>`;
    const pctStr = r.pct!==undefined ? `<td style="color:var(--slate2);font-size:.75rem;font-family:'DM Mono',monospace">${pct(r.pct)}</td>` : '<td></td>';
    const cls = r.type==='total'?'row-total':r.type==='hl'?'row-hl':r.neg?'row-sub row-neg':'row-sub';
    return `<tr class="${cls}"><td>${r.label}</td><td style="text-align:right;font-family:'DM Mono',monospace;font-weight:600">${fmt(r.v)}</td>${pctStr}</tr>`;
  }).join('');

  // Charts
  renderChartIngresos(D);
  renderChartCascade(D);
}

function renderChartIngresos(D){
  destroyChart('ingresos');
  const ctx = document.getElementById('ch-ingresos');
  if(!ctx) return;
  charts['ingresos'] = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Ventas Mercadería','Servicios','Otros Ingresos'],
      datasets:[{
        data:[D.ventas, D.servicios, D.otros_ing],
        backgroundColor:[C.teal, C.green, C.amber],
        borderWidth:2, borderColor:'#fff', hoverOffset:8
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      cutout:'62%',
      plugins:{
        legend:{position:'right',labels:{padding:14,usePointStyle:true,font:{family:'DM Sans',size:11}}},
        tooltip:{callbacks:{label:c=>' S/ '+c.raw.toLocaleString('es-PE')}}
      }
    }
  });
}

function renderChartCascade(D){
  destroyChart('cascade');
  const ctx = document.getElementById('ch-cascade');
  if(!ctx) return;
  const vals = [D.total_ing, D.ut_bruta, D.ebit, D.ut_ai, D.ut_neta];
  const labels = ['Ing. Total','Ut. Bruta','EBIT','Ut. Antes IR','Ut. Neta'];
  charts['cascade'] = new Chart(ctx, {
    type:'bar',
    data:{
      labels,
      datasets:[{
        label:'Monto S/',
        data:vals,
        backgroundColor: vals.map(v=>v>=0?C.teal:C.red),
        borderRadius:6, borderSkipped:false
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'S/ '+c.raw.toLocaleString('es-PE')}}},
      scales:{
        y:{grid:{color:'#F1F5F9'},ticks:{callback:v=>'S/'+v.toLocaleString('es-PE'),font:{family:'DM Mono',size:10}}},
        x:{grid:{display:false},ticks:{font:{family:'DM Sans',size:10}}}
      }
    }
  });
}
