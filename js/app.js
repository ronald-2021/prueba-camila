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

function renderControls() {
    const joint = document.getElementById('joint').value;
    const movements = jointsData[joint];
    const container = document.getElementById('sliders-container');
    
    container.innerHTML = '';

    movements.forEach(mov => {
        const maxSlider = mov.normal + 30; 
        
        const html = `
            <div class="control-row">
                <div class="label-head">
                    <label>${mov.name}</label>
                    <span class="ref-tag">Normal: ${mov.normal}°</span>
                </div>
                <div class="input-group">
                    <input type="range" id="range-${mov.id}" 
                           min="0" max="${maxSlider}" value="0" 
                           oninput="syncInput('${mov.id}', this.value)">
                    
                    <input type="number" id="num-${mov.id}" 
                           min="0" max="${maxSlider}" value="0" 
                           oninput="syncInput('${mov.id}', this.value)">
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    document.getElementById('results-area').style.display = 'none';
}

function syncInput(id, val) {
    document.getElementById(`range-${id}`).value = val;
    document.getElementById(`num-${id}`).value = val;
}

function calcular() {
    const joint = document.getElementById('joint').value;
    const movements = jointsData[joint];
    
    let totalIdeal = 0;
    let totalPaciente = 0;
    let isHyper = false;
    let summaryHTML = '';

    movements.forEach(mov => {
        const val = parseFloat(document.getElementById(`num-${mov.id}`).value) || 0;
        
        summaryHTML += `
            <div class="data-item">
                <small>${mov.name}</small>
                <span>${val}°</span>
            </div>
        `;

        totalIdeal += mov.normal;
        
        if (val > mov.normal) {
            isHyper = true;
        }
        
        totalPaciente += Math.min(val, mov.normal);
    });

    let deficit = 0;
    if (totalIdeal > 0) {
        deficit = 100 - ((totalPaciente / totalIdeal) * 100);
    }
    deficit = Math.max(0, deficit);

    const resDeficit = document.getElementById('res-deficit');
    const resLevel = document.getElementById('res-level');
    const card = document.getElementById('numeric-card');
    const suggestions = document.getElementById('suggestions-content');
    
    document.getElementById('input-summary').innerHTML = summaryHTML;

    let texto = "";
    let color = "";
    let bg = "";
    let htmlSug = "";

    if (deficit === 0 && isHyper) {
        texto = "🔵 Hiperlaxitud / Rango Excesivo";
        color = "var(--blue-text)";
        bg = "var(--blue-bg)";
        htmlSug = `
            <li><strong>⚠ Precaución:</strong> El paciente excede los rangos fisiológicos.</li>
            <li><strong>❌ NO ESTIRAR:</strong> Riesgo de inestabilidad articular.</li>
            <li><strong>✔ Estabilidad:</strong> Ejercicios isométricos y propiocepción.</li>
            <li><strong>✔ Control Motor:</strong> Reeducar el movimiento en rango medio.</li>
        `;
    } 
    else if (deficit <= 20) {
        texto = "🟢 Normal / Limitación Leve";
        color = "var(--green-text)";
        bg = "var(--green-bg)";
        htmlSug = `
            <li><strong>Funcionalidad:</strong> Conservada.</li>
            <li><strong>Actividad:</strong> Ejercicios activos libres completos.</li>
            <li><strong>Prevención:</strong> Higiene postural y pausas activas.</li>
        `;
    } 
    else if (deficit <= 50) {
        texto = "🟡 Limitación Moderada";
        color = "var(--yellow-text)";
        bg = "var(--yellow-bg)";
        htmlSug = `
            <li><strong>Movilización:</strong> Activo-asistida y pasiva suave.</li>
            <li><strong>Estiramientos:</strong> Sostenidos (15-30 seg) sin dolor agudo.</li>
            <li><strong>Fisioterapia:</strong> Calor superficial + Terapia manual.</li>
        `;
    } 
    else {
        texto = "🔴 Limitación Severa";
        color = "var(--red-text)";
        bg = "var(--red-bg)";
        htmlSug = `
            <li><strong>Movilización:</strong> Pasiva exclusiva (Maitland G-I/II).</li>
            <li><strong>Analgesia:</strong> Crioterapia o TENS para dolor.</li>
            <li><strong>Precaución:</strong> No forzar rangos para evitar daño tisular.</li>
        `;
    }

    resDeficit.innerText = deficit.toFixed(1) + "%";
    resDeficit.style.color = color;
    resLevel.innerText = texto;
    resLevel.style.color = color;
    card.style.backgroundColor = bg;
    card.style.borderLeftColor = color;
    
    suggestions.innerHTML = `<ul class="suggestions-list">${htmlSug}</ul>`;
    
    document.getElementById('results-area').style.display = 'block';
}

renderControls();