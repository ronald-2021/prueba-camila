const jointsData = {
    hombro: [
        { id: 'flex', name: 'Flexión', normal: 180 }, { id: 'ext', name: 'Extensión', normal: 60 },
        { id: 'rot_int', name: 'Rot. Interna', normal: 70 }, { id: 'rot_ext', name: 'Rot. Externa', normal: 90 }
    ],
    codo: [
        { id: 'flex', name: 'Flexión', normal: 150 }, { id: 'ext', name: 'Extensión', normal: 0 },
        { id: 'pron', name: 'Pronación', normal: 80 }, { id: 'sup', name: 'Supinación', normal: 80 }
    ],
    muneca: [
        { id: 'flex', name: 'Flexión', normal: 80 }, { id: 'ext', name: 'Extensión', normal: 70 },
        { id: 'des_rad', name: 'Desv. Radial', normal: 20 }, { id: 'des_cub', name: 'Desv. Cubital', normal: 30 },
        { id: 'circ', name: 'Circunducción', normal: 360 }
    ],
    cuello: [
        { id: 'flex', name: 'Flexión', normal: 45 }, { id: 'ext', name: 'Extensión', normal: 45 },
        { id: 'rot_izq', name: 'Rot. Izquierda', normal: 60 }, { id: 'rot_der', name: 'Rot. Derecha', normal: 60 },
        { id: 'lat_izq', name: 'Lat. Izquierda', normal: 45 }, { id: 'lat_der', name: 'Lat. Derecha', normal: 45 }
    ],
    cadera: [
        { id: 'flex', name: 'Flexión', normal: 120 }, { id: 'ext', name: 'Extensión', normal: 30 },
        { id: 'rot_int', name: 'Rot. Interna', normal: 40 }, { id: 'rot_ext', name: 'Rot. Externa', normal: 45 }
    ],
    rodilla: [ { id: 'flex', name: 'Flexión', normal: 135 }, { id: 'ext', name: 'Extensión', normal: 0 } ],
    tobillo: [
        { id: 'dorsi', name: 'Dorsiflexión', normal: 20 }, { id: 'plant', name: 'Plantiflexión', normal: 50 },
        { id: 'inv', name: 'Inversión', normal: 35 }, { id: 'ever', name: 'Eversión', normal: 15 }
    ]
};

function renderControls() {
    const joint = document.getElementById('joint').value;
    const container = document.getElementById('sliders-container');
    container.innerHTML = '';
    jointsData[joint].forEach(mov => {
        const max = (mov.id === 'circ') ? 360 : mov.normal + 30;
        container.insertAdjacentHTML('beforeend', `
            <div class="control-row">
                <div class="label-head"><label>${mov.name}</label><span class="ref-tag">Ref: ${mov.normal}°</span></div>
                <div class="input-group">
                    <input type="range" id="range-${mov.id}" min="0" max="${max}" value="0" oninput="syncInput('${mov.id}', this.value)">
                    <input type="number" id="num-${mov.id}" min="0" max="${max}" value="0" oninput="syncInput('${mov.id}', this.value)">
                </div>
            </div>`);
    });
    document.getElementById('results-area').style.display = 'none';
}

function syncInput(id, val) {
    document.getElementById(`range-${id}`).value = val;
    document.getElementById(`num-${id}`).value = val;
}

function calcular() {
    const joint = document.getElementById('joint').value;
    let totalIdeal = 0, totalPaciente = 0, isHyper = false, htmlRes = '';
    
    jointsData[joint].forEach(mov => {
        const val = parseFloat(document.getElementById(`num-${mov.id}`).value) || 0;
        htmlRes += `<div class="data-item"><small>${mov.name}</small><span>${val}°</span></div>`;
        if(mov.id !== 'circ') {
            totalIdeal += mov.normal;
            totalPaciente += Math.min(val, mov.normal);
        }
        if(val > mov.normal) isHyper = true;
    });

    let deficit = 0;
    if(totalIdeal > 0) deficit = Math.max(0, 100 - ((totalPaciente / totalIdeal) * 100));
    
    document.getElementById('input-summary').innerHTML = htmlRes;
    const resDeficit = document.getElementById('res-deficit');
    const resLevel = document.getElementById('res-level');
    const card = document.getElementById('numeric-card');
    
    let text = "", color = "", bg = "", sug = "";
    if (deficit === 0 && isHyper) { text="Hiperlaxitud"; color="#1565c0"; bg="#e3f2fd"; sug="<li>Precaución con rangos excesivos.</li><li>No estirar; fortalecer estabilidad.</li>"; }
    else if (deficit <= 20) { text="Normal / Leve"; color="#2e7d32"; bg="#e8f5e9"; sug="<li>Funcionalidad conservada.</li><li>Ejercicios activos libres.</li>"; }
    else if (deficit <= 50) { text="Moderada"; color="#f9a825"; bg="#fffde7"; sug="<li>Movilización activo-asistida.</li><li>Estiramientos suaves.</li>"; }
    else { text="Severa"; color="#c62828"; bg="#ffebee"; sug="<li>Movilización pasiva (Maitland).</li><li>Analgesia (TENS/Crio).</li>"; }

    resDeficit.innerText = deficit.toFixed(1) + "%"; resDeficit.style.color = color;
    resLevel.innerText = text; resLevel.style.color = color;
    card.style.borderColor = color; card.style.backgroundColor = bg;
    document.getElementById('suggestions-content').innerHTML = `<ul class="suggestions-list">${sug}</ul>`;
    document.getElementById('results-area').style.display = 'block';
}

// --- NUEVA LÓGICA DE VISTA PREVIA Y DESCARGA ---

function mostrarVistaPrevia() {
    // 1. Recopilar datos
    const fecha = new Date().toLocaleString();
    const articulacion = document.getElementById('joint').options[document.getElementById('joint').selectedIndex].text;
    const jointKey = document.getElementById('joint').value;
    const deficit = document.getElementById('res-deficit').innerText;
    const estado = document.getElementById('res-level').innerText;
    
    // Sugerencias
    let listaSugerencias = '';
    document.querySelectorAll('.suggestions-list li').forEach(li => { listaSugerencias += `<li>${li.innerText}</li>`; });

    // Filas tabla
    let filas = '';
    jointsData[jointKey].forEach(mov => {
        const val = document.getElementById(`num-${mov.id}`).value || 0;
        filas += `<tr><td>${mov.name}</td><td><b>${val}°</b></td><td>${mov.normal}°</td></tr>`;
    });

    // 2. Construir el HTML del papel (Diseño limpio para impresión)
    const papelHTML = `
        <div class="report-header">
            <h1 class="report-title">Reporte Clínico de Fisioterapia</h1>
        </div>
        <div class="report-meta">
            <span><strong>Fecha:</strong> ${fecha}</span>
            <span><strong>Articulación:</strong> ${articulacion}</span>
        </div>

        <div class="report-section">
            <h3>1. Goniometría (Rangos de Movimiento)</h3>
            <table class="report-table">
                <tr><th>Movimiento</th><th>Paciente</th><th>Referencia AAOS</th></tr>
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
            Documento generado digitalmente por Calculadora ROM | Basado en valores AAOS
        </div>
    `;

    // 3. Inyectar y mostrar el Overlay
    document.getElementById('report-paper').innerHTML = papelHTML;
    document.getElementById('preview-overlay').style.display = 'flex';
}

function cerrarVistaPrevia() {
    document.getElementById('preview-overlay').style.display = 'none';
}

function descargarPDFFinal() {
    // Tomamos la foto SOLO al papel blanco (#report-paper)
    const element = document.getElementById('report-paper');
    const articulacion = document.getElementById('joint').options[document.getElementById('joint').selectedIndex].text;
    
    const opt = {
        margin:       0,
        filename:     `ROM_${articulacion}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Descargar y luego cerrar
    html2pdf().set(opt).from(element).save().then(() => {
        cerrarVistaPrevia();
    });
}
function descargarPDFFinal() {
    // Tomamos la foto SOLO al papel blanco (#report-paper)
    const element = document.getElementById('report-paper');
    const articulacion = document.getElementById('joint').options[document.getElementById('joint').selectedIndex].text;
    
    const opt = {
        margin:       [10, 10, 10, 10], // Márgenes [top, left, bottom, right] en mm
        filename:     `ROM_${articulacion}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true,
            scrollY: 0 // Importante para capturar todo el scroll
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // Evita cortar elementos a la mitad
    };

    // Descargar y luego cerrar
    html2pdf().set(opt).from(element).save().then(() => {
        cerrarVistaPrevia();
    });
}
renderControls();