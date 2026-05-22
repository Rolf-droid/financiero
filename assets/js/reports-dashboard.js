//  DASHBOARD & RATIOS
// ══════════════════════════════════════════════════════════════
function ratioStatus(v,bench,dir='up'){
  // dir='up' means higher is better, 'down' means lower is better
  if(dir==='up'){
    if(v>=bench*0.9) return 'ok';
    if(v>=bench*0.6) return 'warn';
    return 'bad';
  } else {
    if(v<=bench*1.1) return 'ok';
    if(v<=bench*1.5) return 'warn';
    return 'bad';
  }
}

function statusLabel(s){
  if(s==='ok')   return '<span class="pill ok">✅ ÓPTIMO</span>';
  if(s==='warn') return '<span class="pill warn">⚠️ ALERTA</span>';
  return '<span class="pill bad">🔴 CRÍTICO</span>';
}

function renderDashboard(D){
  const ratios=[
    {name:'Liquidez Corriente', v:D.r_liq,  fmt_v:xfmt(D.r_liq),  bench:'≥ 1.5x', bv:1.5, dir:'up',
     color: D.r_liq>=1.5?C.green:D.r_liq>=0.9?C.amber:C.red,
     interp:'Por cada S/1 de deuda corriente, la empresa tiene '+xfmt(D.r_liq)+' en activos corrientes. '+(D.r_liq<1?'Riesgo de incumplimiento a corto plazo. Negociar extensión de plazos con proveedores.':'Posición de liquidez adecuada.')},
    {name:'Prueba Ácida',       v:D.r_acida,fmt_v:xfmt(D.r_acida),bench:'≥ 1.0x', bv:1.0, dir:'up',
     color: D.r_acida>=1?C.green:D.r_acida>=0.6?C.amber:C.red,
     interp:'Excluyendo inventarios, la cobertura de obligaciones corrientes es '+xfmt(D.r_acida)+'. '+(D.r_acida<1?'Presión de tesorería. Acelerar cobranzas y revisar rotación de inventarios.':'Cobertura suficiente sin liquidar inventarios.')},
    {name:'Margen Bruto',       v:D.r_mb,   fmt_v:pct(D.r_mb),    bench:'≥ 30%', bv:0.30, dir:'up',
     color: D.r_mb>=0.3?C.green:C.amber,
     interp:'El '+pct(D.r_mb)+' de los ingresos queda tras cubrir el costo de ventas. '+(D.r_mb>0.5?'Excelente eficiencia en costos directos.':'Revisar estructura de costos de producción.')},
    {name:'Margen Neto',        v:D.r_mn,   fmt_v:pct(D.r_mn),    bench:'≥ 10%', bv:0.10, dir:'up',
     color: D.r_mn>=0.1?C.green:D.r_mn>=0?C.amber:C.red,
     interp:'De cada S/100 de ingresos, S/'+((D.r_mn||0)*100).toFixed(1)+' se convierte en utilidad neta. '+(D.r_mn>=0.1?'Alta rentabilidad.':'Revisar gastos operativos y financieros.')},
    {name:'ROE',                v:D.r_roe,  fmt_v:pct(D.r_roe),   bench:'≥ 15%', bv:0.15, dir:'up',
     color: D.r_roe>=0.15?C.green:D.r_roe>=0.08?C.amber:C.red,
     interp:'Retorno sobre patrimonio: '+pct(D.r_roe)+'. '+(D.r_roe>=0.15?'Excelente retorno para los accionistas.':'Considerar optimizar uso del capital propio.')},
    {name:'Endeudamiento',      v:D.r_end,  fmt_v:xfmt(D.r_end),  bench:'≤ 1.0x',bv:1.0, dir:'down',
     color: D.r_end<=1?C.green:D.r_end<=1.3?C.amber:C.red,
     interp:'Los pasivos representan '+pct(D.r_end)+' de los activos. '+(D.r_end>1?'Nivel de deuda supera activos. Reducir endeudamiento o aumentar capital.':'Estructura financiera saludable.')},
    {name:'Cobertura Intereses',v:D.r_cob,  fmt_v:xfmt(D.r_cob),  bench:'≥ 3.0x',bv:3.0, dir:'up',
     color: D.r_cob>=3?C.green:D.r_cob>=1.5?C.amber:C.red,
     interp:'El EBIT cubre '+xfmt(D.r_cob)+' los gastos financieros. '+(D.r_cob>=3?'Amplia capacidad de pago de intereses.':'Revisar carga financiera.')},
    {name:'ROA',                v:D.r_roa,  fmt_v:pct(D.r_roa),   bench:'≥ 5%',  bv:0.05, dir:'up',
     color: D.r_roa>=0.05?C.green:D.r_roa>=0.02?C.amber:C.red,
     interp:'Retorno sobre activos: '+pct(D.r_roa)+'. '+(D.r_roa>=0.05?'Los activos generan buen retorno.':'Mejorar eficiencia en el uso de activos.')},
  ];

  // KPI cards
  const kpiEl=document.getElementById('ratio-kpis');
  if(kpiEl){
    const top4=ratios.slice(0,4);
    kpiEl.innerHTML=top4.map(r=>`
      <div style="background:#fff;border-radius:12px;padding:16px 18px;box-shadow:var(--sh);border-left:4px solid ${r.color}">
        <div style="font-size:.68rem;font-weight:600;color:var(--slate2);text-transform:uppercase;letter-spacing:.06em">${r.name}</div>
        <div style="font-size:1.6rem;font-weight:700;color:${r.color};font-family:'DM Mono',monospace;margin:6px 0">${r.fmt_v}</div>
        <div style="font-size:.7rem;color:var(--muted)">Benchmark: ${r.bench}</div>
      </div>`).join('');
  }

  // Alerts
  const dashAl=document.getElementById('dash-alerts');
  if(dashAl){
    const crits=ratios.filter(r=>{
      const s=ratioStatus(r.v,r.bv,r.dir);
      return s==='bad';
    });
    const warns=ratios.filter(r=>ratioStatus(r.v,r.bv,r.dir)==='warn');
    let html='';
    if(crits.length>0) html+=`<div class="alert danger">🔴 <div><strong>${crits.length} ratio(s) en estado CRÍTICO:</strong> ${crits.map(r=>r.name).join(', ')}. Requieren acción inmediata.</div></div>`;
    if(warns.length>0) html+=`<div class="alert warn">⚠️ <div><strong>${warns.length} ratio(s) en estado de ALERTA:</strong> ${warns.map(r=>r.name).join(', ')}. Monitorear y planificar mejoras.</div></div>`;
    if(crits.length===0&&warns.length===0) html=`<div class="alert" style="background:#DCFCE7;color:#166534;border:1px solid #86EFAC">✅ <div><strong>Excelente desempeño financiero.</strong> Todos los ratios se encuentran dentro de los parámetros óptimos.</div></div>`;
    dashAl.innerHTML=html;
  }

  // Ratio table
  const tbody=document.getElementById('ratio-tbody');
  if(tbody){
    tbody.innerHTML=ratios.map(r=>{
      const s=ratioStatus(r.v,r.bv,r.dir);
      return `<tr>
        <td><strong>${r.name}</strong></td>
        <td style="color:${r.color}">${r.fmt_v}</td>
        <td>${r.bench}</td>
        <td>${statusLabel(s)}</td>
        <td>${r.interp}</td>
      </tr>`;
    }).join('');
  }

  // Chart 1: Ratios vs Benchmark
  destroyChart('ratios-bar');
  const ctx1=document.getElementById('ch-ratios-bar');
  if(ctx1){
    const normalized=ratios.slice(0,6).map(r=>{
      const n=r.dir==='up'?(r.bv?Math.min((r.v/r.bv)*100,200):0):(r.bv?Math.min((r.bv/r.v)*100,200):0);
      return {name:r.name,n:parseFloat(n.toFixed(1)),color:r.color};
    });
    charts['ratios-bar']=new Chart(ctx1,{
      type:'bar',
      data:{
        labels:normalized.map(r=>r.name),
        datasets:[
          {label:'Cumplimiento (%)',data:normalized.map(r=>r.n),backgroundColor:normalized.map(r=>r.color),borderRadius:6,borderSkipped:false},
          {label:'Óptimo (100%)',data:Array(6).fill(100),type:'line',borderColor:C.navy,borderDash:[4,4],borderWidth:2,pointRadius:0,fill:false}
        ]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'bottom',labels:{font:{family:'DM Sans',size:11},usePointStyle:true}},
          tooltip:{callbacks:{label:c=>c.dataset.label==='Óptimo (100%)'?'Benchmark: 100%':c.dataset.label+': '+c.raw+'%'}}},
        scales:{
          y:{min:0,max:200,ticks:{callback:v=>v+'%',font:{family:'DM Mono',size:10}},grid:{color:'#F1F5F9'}},
          x:{grid:{display:false},ticks:{font:{family:'DM Sans',size:10}}}
        }
      }
    });
  }

  // Chart 2: Radar
  destroyChart('radar');
  const ctx2=document.getElementById('ch-radar');
  if(ctx2){
    const dims=[
      {label:'Liquidez',  score:Math.min(100,D.r_liq/1.5*100)},
      {label:'P.Ácida',   score:Math.min(100,D.r_acida/1.0*100)},
      {label:'M.Bruto',   score:Math.min(100,D.r_mb/0.3*100)},
      {label:'M.Neto',    score:Math.min(100,D.r_mn/0.1*100)},
      {label:'ROE',       score:Math.min(100,D.r_roe/0.15*100)},
      {label:'Solvencia', score:Math.min(100,D.r_end<=1?(1)*100:(1/D.r_end)*100)},
    ];
    charts['radar']=new Chart(ctx2,{
      type:'radar',
      data:{
        labels:dims.map(d=>d.label),
        datasets:[{
          label:'Salud Financiera',
          data:dims.map(d=>parseFloat(d.score.toFixed(1))),
          backgroundColor:'rgba(14,165,201,.2)',
          borderColor:C.teal,
          pointBackgroundColor:C.teal,
          pointRadius:4,
          borderWidth:2
        }]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{family:'DM Mono',size:9}},grid:{color:'#E2E8F0'},pointLabels:{font:{family:'DM Sans',size:11}}}},
        plugins:{legend:{position:'bottom',labels:{font:{family:'DM Sans',size:11},usePointStyle:true}}}
      }
    });
  }

  // Chart 3: Costos Pie
  destroyChart('costos-pie');
  const ctx3=document.getElementById('ch-costos-pie');
  if(ctx3){
    const ti=D.total_ing||1;
    charts['costos-pie']=new Chart(ctx3,{
      type:'doughnut',
      data:{
        labels:['Costo Ventas','Gs.Ventas','Gs.Admin.','Gs.Financ.','Deprec.','Imp.Renta','Utilidad Neta'],
        datasets:[{
          data:[D.costo_v,D.gs_v,D.gs_a,D.gs_f,D.deprec,D.ir,Math.max(0,D.ut_neta)].map(v=>parseFloat((v/ti*100).toFixed(2))),
          backgroundColor:[C.red,'#F97316',C.amber,'#A78BFA',C.slate,'#64748B',C.green],
          borderWidth:2,borderColor:'#fff',hoverOffset:8
        }]
      },
      options:{
        responsive:true,maintainAspectRatio:false,cutout:'55%',
        plugins:{
          legend:{position:'right',labels:{padding:12,usePointStyle:true,font:{family:'DM Sans',size:10}}},
          tooltip:{callbacks:{label:c=>c.label+': '+c.raw+'%'}}
        }
      }
    });
  }

  // Chart 4: Waterfall
  destroyChart('waterfall');
  const ctx4=document.getElementById('ch-waterfall');
  if(ctx4){
    const wLabels=['Ing.Total','− Costo V.','Ut.Bruta','− Gs.Op.','EBIT','− Gs.Fin/Dep','Ut.Antes IR','− Imp.Renta','Ut.Neta'];
    const wVals=[D.total_ing, D.costo_v, D.ut_bruta, D.gs_v+D.gs_a, D.ebit, D.gs_f+D.deprec, D.ut_ai, D.ir, D.ut_neta];
    const wColors=wVals.map((v,i)=>[0,2,4,6,8].includes(i)?C.teal:C.red);
    charts['waterfall']=new Chart(ctx4,{
      type:'bar',
      data:{
        labels:wLabels,
        datasets:[{
          label:'S/',
          data:wVals,
          backgroundColor:wColors,
          borderRadius:5,borderSkipped:false
        }]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'S/ '+c.raw.toLocaleString('es-PE')}}},
        scales:{
          y:{grid:{color:'#F1F5F9'},ticks:{callback:v=>'S/'+v.toLocaleString('es-PE'),font:{family:'DM Mono',size:9}}},
          x:{grid:{display:false},ticks:{font:{family:'DM Sans',size:9},maxRotation:30}}
        }
      }
    });
  }

  // Recomendaciones
  const recEl=document.getElementById('recomendaciones');
  if(recEl){
    const recs=[];
    if(D.r_liq<1.5||D.r_acida<1)
      recs.push({icon:'💧',title:'Mejorar Liquidez',color:'#EF4444',desc:'Renegociar plazos con proveedores, acelerar cobranzas y reducir cuentas por pagar. Mantener reserva operativa mínima de 3 meses de gastos.'});
    if(D.r_end>1)
      recs.push({icon:'📉',title:'Reducir Endeudamiento',color:'#F59E0B',desc:'Evaluar refinanciamiento de deuda a largo plazo, incrementar capital propio y evitar nuevo endeudamiento hasta equilibrar la estructura.'});
    if(D.s_fin<0)
      recs.push({icon:'🏦',title:'Gestión de Caja',color:'#EF4444',desc:'Saldo de caja negativo requiere atención urgente. Revisar amortizaciones, negociar nuevas líneas de crédito o diferir inversiones.'});
    if(D.r_mb>0.5&&D.r_mn>0.2)
      recs.push({icon:'🚀',title:'Aprovechar Alta Rentabilidad',color:'#10B981',desc:'Los márgenes son excelentes. Considerar reinvertir utilidades en expansión, apertura de nuevas líneas de productos o mercados.'});
    if(D.r_roe>0.3)
      recs.push({icon:'💰',title:'Retorno Atractivo',color:'#10B981',desc:'ROE superior al 30% es altamente atractivo. Valorar distribución de dividendos o reinversión estratégica para sostener el crecimiento.'});
    if(D.r_cob>10)
      recs.push({icon:'📐',title:'Capacidad de Deuda',color:'#0EA5C9',desc:'Alta cobertura de intereses indica que podría asumir deuda adicional para financiar crecimiento si se normaliza la liquidez.'});
    if(recs.length===0)
      recs.push({icon:'✅',title:'Situación Equilibrada',color:'#10B981',desc:'Los indicadores muestran un desempeño financiero sólido. Mantener los controles actuales y monitorear periódicamente.'});

    recEl.innerHTML=recs.map(r=>`
      <div style="background:var(--bg);border-radius:10px;padding:16px;border-left:4px solid ${r.color}">
        <div style="font-size:1.1rem;margin-bottom:6px">${r.icon} <strong style="color:${r.color}">${r.title}</strong></div>
        <div style="font-size:.79rem;color:var(--muted);line-height:1.5">${r.desc}</div>
      </div>`).join('');
  }
}
