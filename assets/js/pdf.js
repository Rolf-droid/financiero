//  EXPORT PDF DASHBOARD
// ══════════════════════════════════════════════════════════════
async function exportarPDF(){
  const btn = document.getElementById('btn-pdf');
  const originalHTML = btn.innerHTML;

  // Show loading state on button
  btn.disabled = true;
  btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    <span id="pdf-progress">Preparando...</span>
  </span>`;

  // Animate spinner
  let angle = 0;
  const spinnerPath = btn.querySelector('path');
  const spin = setInterval(()=>{
    angle += 15;
    if(spinnerPath) spinnerPath.style.transform = `rotate(${angle}deg)`;
  }, 50);

  const setProgress = msg => {
    const el = document.getElementById('pdf-progress');
    if(el) el.textContent = msg;
  };

  try {
    showToast('📄 Generando PDF del dashboard...', 'info', 8000);

    // Sections to capture
    const sections = [
      { id: 'dash-alerts',      label: 'Alertas del Sistema' },
      { id: 'ratio-kpis',       label: 'KPIs de Ratios' },
      { id: 'page-dashboard',   label: null, fullPage: true },
    ];

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210, pageH = 297, margin = 12;

    // ── COVER PAGE ─────────────────────────────────────────────
    setProgress('Portada...');
    const grad = pdf.setFillColor(11, 31, 58);
    pdf.rect(0, 0, pageW, pageH, 'F');

    // Accent stripe
    pdf.setFillColor(14, 165, 201);
    pdf.rect(0, 0, 6, pageH, 'F');

    // Title block
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    pdf.text('DASHBOARD', margin + 6, 80);
    pdf.setFontSize(18);
    pdf.text('FINANCIERO', margin + 6, 93);

    pdf.setFillColor(14, 165, 201);
    pdf.rect(margin + 6, 98, 80, 1.5, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Comercial Andina S.A.C.', margin + 6, 108);
    pdf.text('Análisis de Ratios e Información Financiera', margin + 6, 115);
    pdf.text('Ejercicio 2024  ·  Expresado en Soles (S/)', margin + 6, 122);

    // Date box
    const today = new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
    pdf.setFillColor(21, 45, 78);
    pdf.roundedRect(margin + 6, 240, 100, 22, 3, 3, 'F');
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.text('FECHA DE GENERACIÓN', margin + 10, 248);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(today, margin + 10, 256);

    // Confidential tag
    pdf.setFillColor(239, 68, 68);
    pdf.roundedRect(pageW - margin - 6 - 46, 240, 46, 22, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONFIDENCIAL', pageW - margin - 6 - 42, 253, { align: 'left' });

    // ── PAGE 2+: Capture dashboard sections ────────────────────
    setProgress('Capturando gráficos...');

    // We'll capture the full dashboard page content in chunks
    const dashPage = document.getElementById('page-dashboard');

    // Temporarily make all children capturable
    const captureOpts = {
      scale: 1.8,
      useCORS: true,
      backgroundColor: '#F1F5F9',
      logging: false,
      allowTaint: true,
    };

    // Capture KPI strip
    setProgress('KPIs...');
    const kpiEl = document.getElementById('ratio-kpis');
    if(kpiEl){
      pdf.addPage();
      // Header bar
      pdf.setFillColor(11, 31, 58);
      pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setFillColor(14, 165, 201); pdf.rect(0, 0, 4, 18, 'F');
      pdf.setTextColor(255,255,255); pdf.setFont('helvetica','bold'); pdf.setFontSize(10);
      pdf.text('INDICADORES CLAVE DE RATIOS', margin, 11.5);
      pdf.setFont('helvetica','normal'); pdf.setFontSize(8); pdf.setTextColor(148,163,184);
      pdf.text('Comercial Andina S.A.C. · 2024', pageW - margin, 11.5, { align:'right' });

      const kpiCanvas = await html2canvas(kpiEl, captureOpts);
      const kpiImg = kpiCanvas.toDataURL('image/png');
      const kpiAR = kpiCanvas.height / kpiCanvas.width;
      const kpiW = pageW - margin*2;
      const kpiH = Math.min(kpiW * kpiAR, 60);
      pdf.addImage(kpiImg, 'PNG', margin, 22, kpiW, kpiH);
    }

    // Capture alerts
    setProgress('Alertas...');
    const alertEl = document.getElementById('dash-alerts');
    if(alertEl && alertEl.innerHTML.trim()){
      const alertCanvas = await html2canvas(alertEl, {...captureOpts, backgroundColor:'#F1F5F9'});
      const alertImg = alertCanvas.toDataURL('image/png');
      const alertAR = alertCanvas.height / alertCanvas.width;
      const alertW = pageW - margin*2;
      const alertH = Math.min(alertW * alertAR, 50);
      const kpiEl2 = document.getElementById('ratio-kpis');
      const kpiCanvas2 = await html2canvas(kpiEl2, captureOpts);
      const kpiAR2 = kpiCanvas2.height / kpiCanvas2.width;
      const kpiH2 = Math.min((pageW-margin*2)*kpiAR2, 60);
      pdf.addImage(alertImg, 'PNG', margin, 22 + kpiH2 + 6, alertW, alertH);
    }

    // Capture charts grid
    setProgress('Gráficos...');
    const chartsGrid = dashPage.querySelector('.charts-grid-2');
    if(chartsGrid){
      pdf.addPage();
      pdf.setFillColor(11, 31, 58); pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setFillColor(16, 185, 129); pdf.rect(0, 0, 4, 18, 'F');
      pdf.setTextColor(255,255,255); pdf.setFont('helvetica','bold'); pdf.setFontSize(10);
      pdf.text('ANÁLISIS GRÁFICO DE RATIOS FINANCIEROS', margin, 11.5);
      pdf.setFont('helvetica','normal'); pdf.setFontSize(8); pdf.setTextColor(148,163,184);
      pdf.text('Comercial Andina S.A.C. · 2024', pageW - margin, 11.5, { align:'right' });

      const gridCanvas = await html2canvas(chartsGrid, {...captureOpts, scale:1.4});
      const gridImg = gridCanvas.toDataURL('image/png');
      const gridAR = gridCanvas.height / gridCanvas.width;
      const gridW = pageW - margin*2;
      const gridH = Math.min(gridW * gridAR, pageH - 30);
      pdf.addImage(gridImg, 'PNG', margin, 22, gridW, gridH);
    }

    // Capture ratio table
    setProgress('Tabla de ratios...');
    const ratioCard = dashPage.querySelector('.ratio-table')?.closest('.card');
    if(ratioCard){
      pdf.addPage();
      pdf.setFillColor(11, 31, 58); pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setFillColor(245, 158, 11); pdf.rect(0, 0, 4, 18, 'F');
      pdf.setTextColor(255,255,255); pdf.setFont('helvetica','bold'); pdf.setFontSize(10);
      pdf.text('TABLA ANALÍTICA DE RATIOS — GUÍA PARA DECISIONES', margin, 11.5);
      pdf.setFont('helvetica','normal'); pdf.setFontSize(8); pdf.setTextColor(148,163,184);
      pdf.text('Comercial Andina S.A.C. · 2024', pageW - margin, 11.5, {align:'right'});

      const tableCanvas = await html2canvas(ratioCard, {...captureOpts, scale:1.3});
      const tableImg = tableCanvas.toDataURL('image/png');
      const tableAR = tableCanvas.height / tableCanvas.width;
      const tableW = pageW - margin*2;
      const tableH = tableW * tableAR;

      if(tableH <= pageH - 30){
        pdf.addImage(tableImg, 'PNG', margin, 22, tableW, tableH);
      } else {
        // Split into two pages
        const halfH = (pageH - 30) / tableAR;
        pdf.addImage(tableImg, 'PNG', margin, 22, tableW, pageH - 30);
        pdf.addPage();
        pdf.setFillColor(11, 31, 58); pdf.rect(0, 0, pageW, 18, 'F');
        pdf.setFillColor(245,158,11); pdf.rect(0, 0, 4, 18, 'F');
        pdf.addImage(tableImg, 'PNG', margin, 22 - (pageH - 30), tableW, tableH);
      }
    }

    // Capture recommendations
    setProgress('Recomendaciones...');
    const recCard = document.getElementById('recomendaciones')?.closest('.card');
    if(recCard){
      pdf.addPage();
      pdf.setFillColor(11, 31, 58); pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setFillColor(139, 92, 246); pdf.rect(0, 0, 4, 18, 'F');
      pdf.setTextColor(255,255,255); pdf.setFont('helvetica','bold'); pdf.setFontSize(10);
      pdf.text('RECOMENDACIONES ESTRATÉGICAS', margin, 11.5);
      pdf.setFont('helvetica','normal'); pdf.setFontSize(8); pdf.setTextColor(148,163,184);
      pdf.text('Comercial Andina S.A.C. · 2024', pageW - margin, 11.5, {align:'right'});

      const recCanvas = await html2canvas(recCard, captureOpts);
      const recImg = recCanvas.toDataURL('image/png');
      const recAR = recCanvas.height / recCanvas.width;
      const recW = pageW - margin*2;
      pdf.addImage(recImg, 'PNG', margin, 22, recW, recW * recAR);
    }

    // ── FOOTER on all pages ────────────────────────────────────
    setProgress('Finalizando...');
    const totalPages = pdf.getNumberOfPages();
    for(let i = 2; i <= totalPages; i++){
      pdf.setPage(i);
      pdf.setFillColor(11, 31, 58);
      pdf.rect(0, pageH - 10, pageW, 10, 'F');
      pdf.setFillColor(14, 165, 201);
      pdf.rect(0, pageH - 10, 4, 10, 'F');
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text('Comercial Andina S.A.C.  ·  Dashboard Financiero 2024  ·  Información Confidencial', margin, pageH - 4);
      pdf.text(`Pág. ${i} / ${totalPages}`, pageW - margin, pageH - 4, { align: 'right' });
    }

    // Save
    pdf.save('Dashboard_Financiero_Andina_2024.pdf');
    clearInterval(spin);
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    showToast('✅ PDF descargado correctamente', 'success');

  } catch(err){
    clearInterval(spin);
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    console.error(err);
    showToast('❌ Error al generar el PDF. Intenta de nuevo.', 'warning', 4000);
  }
}
