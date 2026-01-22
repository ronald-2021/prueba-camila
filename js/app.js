const jointsData = {
  hombro: [
    { id: 'flex', name: 'Flexión', normal: 180 },
    { id: 'ext', name: 'Extensión', normal: 60 },
    { id: 'rot_int', name: 'Rot. Interna', normal: 70 },
    { id: 'rot_ext', name: 'Rot. Externa', normal: 90 }
  ],
  codo: [
    { id: 'flex', name: 'Flexión', normal: 150 },
    { id: 'ext', name: 'Extensión', normal: 0 },
    { id: 'pron', name: 'Pronación', normal: 80 },
    { id: 'sup', name: 'Supinación', normal: 80 }
  ],
  muneca: [
    { id: 'flex', name: 'Flexión', normal: 80 },
    { id: 'ext', name: 'Extensión', normal: 70 },
    { id: 'des_rad', name: 'Desv. Radial', normal: 20 },
    { id: 'des_cub', name: 'Desv. Cubital', normal: 30 },
    { id: 'circ', name: 'Circunducción', normal: 360 }
  ],
  cuello: [
    { id: 'flex', name: 'Flexión', normal: 45 },
    { id: 'ext', name: 'Extensión', normal: 45 },
    { id: 'rot_izq', name: 'Rot. Izquierda', normal: 60 },
    { id: 'rot_der', name: 'Rot. Derecha', normal: 60 },
    { id: 'lat_izq', name: 'Lat. Izquierda', normal: 45 },
    { id: 'lat_der', name: 'Lat. Derecha', normal: 45 }
  ],
  cadera: [
    { id: 'flex', name: 'Flexión', normal: 120 },
    { id: 'ext', name: 'Extensión', normal: 30 },
    { id: 'rot_int', name: 'Rot. Interna', normal: 40 },
    { id: 'rot_ext', name: 'Rot. Externa', normal: 45 }
  ],
  rodilla: [
    { id: 'flex', name: 'Flexión', normal: 135 },
    { id: 'ext', name: 'Extensión', normal: 0 }
  ],
  tobillo: [
    { id: 'dorsi', name: 'Dorsiflexión', normal: 20 },
    { id: 'plant', name: 'Plantiflexión', normal: 50 },
    { id: 'inv', name: 'Inversión', normal: 35 },
    { id: 'ever', name: 'Eversión', normal: 15 }
  ]
};

// Estado global para evitar reportes vacíos
let lastCalc = null;

function renderControls() {
  const joint = document.getElementById('joint').value;
  const container = document.getElementById('sliders-container');
  container.innerHTML = '';

  jointsData[joint].forEach(mov => {
    const max = (mov.id === 'circ') ? 360 : mov.normal + 30;

    container.insertAdjacentHTML('beforeend', `
      <div class="control-row">
        <div class="label-head">
          <label>${mov.name}</label>
          <span class="ref-tag">Ref: ${mov.normal}°</span>
        </div>
        <div class="input-group">
          <input type="range" id="range-${mov.id}" min="0" max="${max}" value="0"
                 oninput="syncInput('${mov.id}', this.value)">
          <input type="number" id="num-${mov.id}" min="0" max="${max}" value="0"
                 oninput="syncInput('${mov.id}', this.value)">
        </div>
      </div>
    `);
  });

  lastCalc = null;
  document.getElementById('results-area').style.display = 'none';
}

function syncInput(id, val) {
  const v = Number(val);
  document.getElementById(`range-${id}`).value = v;
  document.getElementById(`num-${id}`).value = v;
}

function calcular() {
  const jointKey = document.getElementById('joint').value;

  let totalIdeal = 0;
  let totalPaciente = 0;
  let isHyper = false;
  let htmlRes = '';

  jointsData[jointKey].forEach(mov => {
    const val = Number(document.getElementById(`num-${mov.id}`).value) || 0;
    htmlRes += `<div class="data-item"><small>${mov.name}</small><span>${val}°</span></div>`;

    // circunducción NO entra al déficit global
    if (mov.id !== 'circ') {
      totalIdeal += mov.normal;
      totalPaciente += Math.min(val, mov.normal);
      if (val > mov.normal) isHyper = true;
    }
  });

  let deficit = 0;
  if (totalIdeal > 0) deficit = Math.max(0, 100 - ((totalPaciente / totalIdeal) * 100));

  document.getElementById('input-summary').innerHTML = htmlRes;

  const resDeficit = document.getElementById('res-deficit');
  const resLevel = document.getElementById('res-level');
  const card = document.getElementById('numeric-card');

  let text = "", color = "", bg = "", sug = "";

  // ===== NUEVOS PLANES =====
  if (deficit === 0 && isHyper) {
    text = "Hiperlaxitud";
    color = "#1565c0";
    bg = "#e3f2fd";
    sug = `
      <li><b>Precaución con rangos excesivos.</b></li>
      <li>No estirar; priorizar <b>estabilidad y control</b>.</li>
      <li>Fortalecimiento progresivo y trabajo propioceptivo.</li>
    `;
  } else if (deficit <= 20) {
    // 🟢 Limitación leve (0–20%)
    text = "Limitación leve (0–20%)";
    color = "#2e7d32";
    bg = "#e8f5e9";
    sug = `
      <li><b>Objetivo:</b> Mantener movilidad normal y prevenir rigidez.</li>
      <li><b>Plan general domiciliario:</b></li>
      <li><b>1. Termoterapia superficial:</b> calor local 10 min.</li>
      <li><b>2. Flexión – Extensión activa:</b> adelante/atrás sin dolor. <b>10 repeticiones × 3 series</b>.</li>
      <li><b>3. Abducción – Aducción activa:</b> movimiento lateral. <b>10 repeticiones</b>.</li>
      <li><b>4. Circunducción o rotaciones:</b> círculos lentos y amplios. <b>10 círculos por lado</b>.</li>
      <li><b>5. Estiramientos suaves:</b> mantener <b>20 segundos</b> sin dolor.</li>
    `;
  } else if (deficit <= 50) {
    // 🟡 Limitación moderada (20–50%)
    text = "Limitación moderada (20–50%)";
    color = "#f9a825";
    bg = "#fffde7";
    sug = `
      <li><b>Objetivo:</b> Recuperar movilidad y disminuir rigidez o dolor.</li>
      <li><b>Plan con ayuda terapéutica:</b></li>
      <li><b>1. Termoterapia previa:</b> 10 min.</li>
      <li><b>2. Cinesiterapia pasiva (acompañante/terapeuta):</b></li>
      <li>• <b>Flexión–Extensión pasiva:</b> 10 repeticiones × 3.</li>
      <li>• <b>Abducción–Aducción pasiva:</b> 10 repeticiones.</li>
      <li>• <b>Rotaciones pasivas suaves:</b> 8–10 repeticiones.</li>
      <li><b>3. Cinesiterapia activa asistida:</b> con banda/palo/otra mano. <b>10 repeticiones</b>.</li>
      <li><b>4. Masoterapia relajante:</b> 5 min.</li>
      <li><b>5. Crioterapia posterior (si inflamación):</b> 10 min.</li>
    `;
  } else {
    // 🔴 Limitación severa (>50%)
    text = "Limitación severa (>50%)";
    color = "#c62828";
    bg = "#ffebee";
    sug = `
      <li><b>Objetivo:</b> Disminuir dolor y recuperar movilidad básica de forma segura.</li>
      <li><b>Plan controlado y progresivo:</b></li>
      <li><b>1. Terapia analgésica inicial:</b> frío o calor <b>10–15 min</b>.</li>
      <li><b>2. Cinesiterapia pasiva suave:</b></li>
      <li>• <b>Oscilaciones articulares grado I–II:</b> 30–60 s.</li>
      <li>• <b>Flexión–Extensión pasiva limitada:</b> 8 repeticiones (sin dolor).</li>
      <li>• <b>Movimientos pendulares:</b> 1–2 min (tipo “columpio”).</li>
      <li><b>3. Masoterapia relajante:</b> 5–8 min.</li>
      <li><b>4. Activación mínima:</b> pequeños movimientos propios sin dolor. <b>5 repeticiones</b>.</li>
    `;
  }

  resDeficit.innerText = deficit.toFixed(1) + "%";
  resDeficit.style.color = color;

  resLevel.innerText = text;
  resLevel.style.color = color;

  card.style.borderColor = color;
  card.style.backgroundColor = bg;

  document.getElementById('suggestions-content').innerHTML =
    `<ul class="suggestions-list">${sug}</ul>`;

  document.getElementById('results-area').style.display = 'block';

  lastCalc = { jointKey, deficitText: resDeficit.innerText, estadoText: text };
}

function buildReportHTML() {
  if (!lastCalc) calcular();

  const paciente = (document.getElementById('patientName')?.value || '').trim();
  const evaluador = (document.getElementById('evaluatorName')?.value || '').trim();
  const obs = (document.getElementById('observations')?.value || '').trim();

  const jointSelect = document.getElementById('joint');
  const articulacion = jointSelect.options[jointSelect.selectedIndex].text;
  const jointKey = jointSelect.value;

  const fecha = new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Guayaquil'
  }).format(new Date());

  const deficit = document.getElementById('res-deficit').innerText;
  const estado = document.getElementById('res-level').innerText;

  let listaSugerencias = '';
  document.querySelectorAll('.suggestions-list li')
    .forEach(li => (listaSugerencias += `<li>${li.innerText}</li>`));

  let filas = '';
  jointsData[jointKey].forEach(mov => {
    const val = document.getElementById(`num-${mov.id}`).value || 0;
    filas += `<tr><td>${mov.name}</td><td><b>${val}°</b></td><td>${mov.normal}°</td></tr>`;
  });

  return `
    <div class="report-header">
      <h1 class="report-title">Reporte Clínico de Fisioterapia</h1>
    </div>

    <div class="report-meta">
      <span><strong>Fecha:</strong> ${fecha}</span>
      <span><strong>Articulación:</strong> ${articulacion}</span>
    </div>

    <div class="report-meta">
      <span><strong>Paciente:</strong> ${paciente || 'No especificado'}</span>
      <span><strong>Evaluador:</strong> ${evaluador || 'No especificado'}</span>
    </div>

    <div class="report-section">
      <h3>0. Observaciones</h3>
      <div class="report-result" style="border-left-color:#333;">
        ${obs ? obs.replace(/\n/g, '<br>') : '—'}
      </div>
    </div>

    <div class="report-section">
      <h3>1. Goniometría (Rangos de Movimiento)</h3>
      <table class="report-table">
        <tr><th>Movimiento</th><th>Paciente</th><th>Referencia</th></tr>
        ${filas}
      </table>
    </div>

    <div class="report-section">
      <h3>2. Diagnóstico Funcional Automatizado</h3>
      <div class="report-result">
        <p style="margin:5px 0"><strong>Déficit Global Calculado:</strong> ${deficit}</p>
        <p style="margin:5px 0"><strong>Interpretación:</strong> ${estado}</p>
      </div>
    </div>

    <div class="report-section">
      <h3>3. Sugerencias Terapéuticas</h3>
      <ul style="line-height:1.8; font-size:14px;">${listaSugerencias}</ul>
    </div>

    <div class="report-footer">
      Documento generado digitalmente por Calculadora ROM | Valores de referencia (AAOS)
    </div>
  `;
}

function mostrarVistaPrevia() {
  if (document.getElementById('results-area').style.display === 'none') calcular();

  const papelHTML = buildReportHTML();
  document.getElementById('report-paper').innerHTML = papelHTML;
  document.getElementById('preview-overlay').style.display = 'flex';
}

function cerrarVistaPrevia() {
  document.getElementById('preview-overlay').style.display = 'none';
}

/**
 * Exportación robusta:
 * - Clona el reporte fuera de pantalla
 * - Fuerza layout en px (clase pdf-export)
 * - Renderiza con html2canvas
 * - Genera PDF con jsPDF UMD
 */
async function descargarPDFFinal() {
  const reportPaper = document.getElementById('report-paper');

  if (!reportPaper.innerHTML.trim()) {
    reportPaper.innerHTML = buildReportHTML();
  }

  const articulacion = document.getElementById('joint')
    .options[document.getElementById('joint').selectedIndex].text;

  const exportWrap = document.createElement('div');
  exportWrap.style.position = 'fixed';
  exportWrap.style.left = '-10000px';
  exportWrap.style.top = '0';
  exportWrap.style.background = '#fff';

  const exportPaper = reportPaper.cloneNode(true);
  exportPaper.classList.add('pdf-export');
  exportPaper.style.transform = 'none';

  exportWrap.appendChild(exportPaper);
  document.body.appendChild(exportWrap);

  try {
    const canvas = await window.html2canvas(exportPaper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      width: exportPaper.scrollWidth,
      height: exportPaper.scrollHeight,
      windowWidth: exportPaper.scrollWidth,
      windowHeight: exportPaper.scrollHeight
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`ROM_${articulacion}.pdf`);
    cerrarVistaPrevia();

  } catch (e) {
    console.error('Error al generar PDF:', e);
    alert('No se pudo generar el PDF. Revisa la consola (F12) para ver el error.');
  } finally {
    exportWrap.remove();
  }
}

renderControls();
