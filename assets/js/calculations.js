//  CÁLCULO PRINCIPAL
// ══════════════════════════════════════════════════════════════
function calcularTodo(){
  const D = getData();
  renderResultados(D);
  renderFlujo(D);
  renderBalance(D);
  renderDashboard(D);
  updateTopbar(D);
}

function getData(){
  // Ingresos y costos
  const ventas     = g('ventas');
  const servicios  = g('servicios');
  const otros_ing  = g('otros_ing');
  const costo_v    = g('costo_ventas');
  const gs_v       = g('gs_ventas');
  const gs_a       = g('gs_admin');
  const gs_f       = g('gs_fin');
  const deprec     = g('deprec');
  const tasa       = g('tasa_ir')/100;

  const total_ing  = ventas + servicios + otros_ing;
  const ut_bruta   = total_ing - costo_v;
  const ebit       = ut_bruta - gs_v - gs_a;
  const ut_ai      = ebit - gs_f - deprec;
  const ir         = ut_ai > 0 ? ut_ai * tasa : 0;
  const ut_neta    = ut_ai - ir;

  // Flujo
  const cobr   = g('cobranzas');
  const pp     = g('pag_prov');
  const ppl    = g('pag_plan');
  const ptrib  = g('pag_trib');
  const caf    = g('compra_af');
  const prest  = g('prestamos');
  const amort  = g('amort');
  const s_ini  = g('saldo_ini');

  const f_op   = cobr - pp - ppl - ptrib;
  const f_inv  = -caf;
  const f_fin  = prest - amort;
  const f_neto = f_op + f_inv + f_fin;
  const s_fin  = s_ini + f_neto;

  // Balance
  const caja_b = g('caja');
  const cxc    = g('cxc');
  const inv    = g('inventarios');
  const af     = g('af_netos');
  const oact   = g('otros_act');
  const cxp    = g('cxp');
  const odeu   = g('otras_deudas');
  const dlp    = g('dlp');
  const cap    = g('capital');
  const res    = g('reservas');

  const act_cte   = caja_b + cxc + inv;
  const act_ncte  = af + oact;
  const total_act = act_cte + act_ncte;
  const pas_cte   = cxp + odeu;
  const pas_ncte  = dlp;
  const total_pas = pas_cte + pas_ncte;
  const patrimonio= cap + res + ut_neta;
  const total_pyp = total_pas + patrimonio;
  const diff      = Math.abs(total_act - total_pyp);
  const cuadra    = diff < 1;

  return {
    ventas, servicios, otros_ing, costo_v, gs_v, gs_a, gs_f, deprec, tasa,
    total_ing, ut_bruta, ebit, ut_ai, ir, ut_neta,
    cobr, pp, ppl, ptrib, caf, prest, amort, s_ini,
    f_op, f_inv, f_fin, f_neto, s_fin,
    caja_b, cxc, inv, af, oact, cxp, odeu, dlp, cap, res,
    act_cte, act_ncte, total_act, pas_cte, pas_ncte, total_pas,
    patrimonio, total_pyp, cuadra, diff,
    // Ratios
    r_liq:    pas_cte ? act_cte / pas_cte : 0,
    r_acida:  pas_cte ? (act_cte - inv) / pas_cte : 0,
    r_mb:     total_ing ? ut_bruta / total_ing : 0,
    r_mn:     total_ing ? ut_neta / total_ing : 0,
    r_roe:    patrimonio ? ut_neta / patrimonio : 0,
    r_end:    total_act ? total_pas / total_act : 0,
    r_cob:    gs_f ? ebit / gs_f : 0,
    r_roa:    total_act ? ut_neta / total_act : 0,
  };
}

// ══════════════════════════════════════════════════════════════
//  TOPBAR
// ══════════════════════════════════════════════════════════════
function updateTopbar(D){
  const chip = document.getElementById('balance-chip');
  if(D.cuadra){
    chip.className='chip good'; chip.textContent='✅ Balance Cuadrado';
  } else {
    chip.className='chip bad'; chip.textContent=`⚠️ Dif: ${fmt(D.diff)}`;
  }
}
