// VALORES AAOS (Del PDF)
const referencias = {
    hombro: { f: 180, e: 60, r: 90 }, 
    codo:   { f: 150, e: 0, r: 80 },  
    muneca: { f: 80, e: 70, r: 30 },  
    cadera: { f: 120, e: 30, r: 45 }, 
    rodilla:{ f: 135, e: 0, r: 0 },   
    tobillo:{ f: 50, e: 20, r: 35 },  
    cuello: { f: 45, e: 45, r: 60 }   
};

function syncVal(type, val) {
    document.getElementById('range-' + type).value = val;
    document.getElementById('num-' + type).value = val;
}

function toggleTable() {
    const table = document.getElementById('ref-table');
    table.style.display = (table.style.display === 'table') ? 'none' : 'table';
}

function updateLimits() {
    const joint = document.getElementById('joint').value;
    const ref = referencias[joint];
    const margin = 30; // Margen para permitir superar el estándar

    document.getElementById('hint-flex').innerText = `Ref: ${ref.f}°`;
    document.getElementById('hint-ext').innerText = `Ref: ${ref.e}°`;
    document.getElementById('hint-rot').innerText = `Ref: ${ref.r}°`;

    document.getElementById('range-flex').max = ref.f + margin;
    document.getElementById('range-ext').max = ref.e + margin;
    document.getElementById('range-rot').max = ref.r + margin;

    ['flex', 'ext', 'rot'].forEach(t => syncVal(t, 0));
    document.getElementById('results-area').style.display = 'none';
}

function calcular() {
    const joint = document.getElementById('joint').value;
    
    const fInput = parseFloat(document.getElementById('num-flex').value) || 0;
    const eInput = parseFloat(document.getElementById('num-ext').value) || 0;
    const rInput = parseFloat(document.getElementById('num-rot').value) || 0;

    const ref = referencias[joint];
    const romIdeal = ref.f + ref.e + ref.r;

    // Detectar si hay valores que EXCEDEN la norma (Hiperlaxitud)
    // Se considera exceso si supera la referencia en cualquier movimiento significativo
    let isHyper = false;
    if(fInput > ref.f || eInput > ref.e || rInput > ref.r) {
        isHyper = true;
    }

    // Cálculo de Déficit (limitado al 100% funcional)
    const fCalc = Math.min(fInput, ref.f);
    const eCalc = Math.min(eInput, ref.e);
    const rCalc = Math.min(rInput, ref.r);

    const romPacienteFuncional = fCalc + eCalc + rCalc;
    
    let deficit = 100 - ((romPacienteFuncional / romIdeal) * 100);
    deficit = Math.max(0, deficit); 

    // --- LÓGICA DE SUGERENCIAS Y COLORES ---
    const numericCard = document.getElementById('numeric-card');
    const resDeficit = document.getElementById('res-deficit');
    const resLevel = document.getElementById('res-level');
    const suggestionsContent = document.getElementById('suggestions-content');

    let htmlSugerencias = "";
    let colorBorder = "";
    let colorText = "";
    let labelNivel = "";
    let bgCard = "";

    // CASO ESPECIAL: HIPERLAXITUD (Déficit 0% pero valores altos)
    if (deficit === 0 && isHyper) {
        labelNivel = "🔵 Hiperlaxitud / Rango Excesivo";
        colorBorder = "var(--status-blue-text)";
        colorText = "var(--status-blue-text)";
        bgCard = "var(--status-blue-bg)";

        htmlSugerencias = `
            <p style="margin-bottom:15px; color:#0d47a1;"><strong>⚠ Atención:</strong> El paciente excede los rangos fisiológicos normales.</p>
            <ul class="suggestions-list">
                <li><strong>NO ESTIRAR:</strong> Evitar aumentar el rango.</li>
                <li><strong>Ejercicios de Estabilidad:</strong> Fortalecimiento isométrico y control motor.</li>
                <li><strong>Propiocepción:</strong> Mejorar la conciencia articular.</li>
                <li><strong>Fortalecimiento muscular:</strong> Para proteger la articulación inestable.</li>
            </ul>
            <div class="objective" style="border-left-color:#2962ff; background:#e3f2fd;">Objetivo: Ganar estabilidad y control, NO movilidad.</div>`;

    } else if (deficit <= 20) {
        // NIVEL 1: LEVE / NORMAL (Sin exceder rango)
        labelNivel = "🟢 Rango Normal / Limitación Leve";
        colorBorder = "var(--status-green-text)";
        colorText = "var(--status-green-text)";
        bgCard = "var(--status-green-bg)";
        htmlSugerencias = `
            <p style="margin-bottom:15px"><em>Funcionalidad conservada.</em></p>
            <ul class="suggestions-list">
                <li><strong>Cinesiterapia activa:</strong> Mantener ROM.</li>
                <li><strong>Estiramientos leves:</strong> Solo si hay rigidez puntual.</li>
                <li><strong>Fortalecimiento:</strong> Cargas progresivas.</li>
            </ul>
            <div class="objective">Objetivo: Mantener función completa.</div>`;

    } else if (deficit > 20 && deficit <= 50) {
        // NIVEL 2: MODERADA
        labelNivel = "🟡 Limitación Moderada";
        colorBorder = "#fbc02d";
        colorText = "#f57f17"; 
        bgCard = "var(--status-yellow-bg)";
        htmlSugerencias = `
            <p style="margin-bottom:15px"><em>Restricción clara.</em></p>
            <ul class="suggestions-list">
                <li><strong>Movilizaciones asistidas:</strong> Para ganar rango.</li>
                <li><strong>Estiramientos sostenidos:</strong> 30 seg para tejido blando.</li>
                <li><strong>Medios físicos:</strong> Calor para flexibilizar.</li>
            </ul>
            <div class="objective">Objetivo: Recuperar movilidad funcional.</div>`;

    } else {
        // NIVEL 3: SEVERA
        labelNivel = "🔴 Limitación Severa";
        colorBorder = "var(--status-red-text)";
        colorText = "var(--status-red-text)";
        bgCard = "var(--status-red-bg)";
        htmlSugerencias = `
            <p style="margin-bottom:15px"><em>Rigidez importante.</em></p>
            <ul class="suggestions-list">
                <li><strong>Cinesiterapia pasiva:</strong> Movimientos suaves.</li>
                <li><strong>Maitland G-I/II:</strong> Para dolor.</li>
                <li><strong>Evitar dolor agudo:</strong> Progresión lenta.</li>
            </ul>
            <div class="objective">Objetivo: Reducir rigidez y dolor.</div>`;
    }

    // Actualizar DOM
    document.getElementById('show-flex').innerText = fInput + "°";
    document.getElementById('show-ext').innerText = eInput + "°";
    document.getElementById('show-rot').innerText = rInput + "°";

    resDeficit.innerText = deficit.toFixed(1) + "%";
    resDeficit.style.color = colorText;
    resLevel.innerText = labelNivel;
    resLevel.style.color = colorText;

    numericCard.style.backgroundColor = bgCard;
    numericCard.style.borderLeftColor = colorBorder;
    suggestionsContent.innerHTML = htmlSugerencias;
    document.getElementById('results-area').style.display = "block";
}

// Inicializar

updateLimits();
