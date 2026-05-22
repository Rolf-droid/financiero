// ══════════════════════════════════════════════════════════════
//  CHART INSTANCES (para destruir y recrear)
// ══════════════════════════════════════════════════════════════
const charts = {};

function destroyChart(id){
  if(charts[id]){ charts[id].destroy(); delete charts[id]; }
}
