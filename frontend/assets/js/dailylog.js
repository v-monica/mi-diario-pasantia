// Manejo del estado de los inputs interactivos
let objetivosDelDia = [];
let tareasDelDia = [];
let currentStep = 1;

// Elementos del DOM
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const indicators = document.querySelectorAll('.step-indicator');

// --- MANEJO DE PASOS (STEPPER) ---
// Modificación en el evento Next
btnNext.addEventListener('click', () => {
    if (currentStep < 4) {
        if (currentStep === 1) {
            renderizarCumplimiento();
        }
        
        // NUEVO: Si pasa del paso 3 al 4, genera el resumen automático
        if (currentStep === 3) {
            generarResumenFinal();
        }
        
        document.getElementById(`step-${currentStep}`).classList.remove('step-active');
        indicators[currentStep - 1].classList.remove('active');
        indicators[currentStep - 1].classList.add('completed');
        
        currentStep++;
        
        document.getElementById(`step-${currentStep}`).classList.add('step-active');
        indicators[currentStep - 1].classList.add('active');
        
        btnPrev.disabled = false;
        if (currentStep === 4) btnNext.textContent = 'Guardar Bitácora';
    } else {
        // Al dar click en Guardar Bitácora, aquí recopilarías el objeto completo para la API
        alert('¡Información diario pasantia consolidada con éxito!');
    }
});

// FUNCIÓN PARA GENERAR EL RESUMEN AUTOMÁTICO
function generarResumenFinal() {
    const resumenContainer = document.getElementById('resumen-jornada');
    
    // 1. Recopilar datos de cumplimiento del Paso 2
    const cards = document.querySelectorAll('.cumplimiento-card');
    let logrados = [];
    let pendientes = [];

    cards.forEach(card => {
        const texto = card.querySelector('.cumplimiento-text').textContent;
        const checkbox = card.querySelector('.cumplimiento-checkbox');
        const inputSeguimiento = card.querySelector('.seguimiento-input').value.trim();
        
        const detalle = inputSeguimiento ? ` (${inputSeguimiento})` : '';

        if (checkbox.checked) {
            logrados.push(`${texto}${detalle}`);
        } else {
            pendientes.push(`${texto}${detalle}`);
        }
    });

    // 2. Recopilar datos de dudas y equipo del Paso 3
    const dudasTexto = document.getElementById('dudas').value.trim() || 'Ninguna duda registrada hoy.';
    const equipoTexto = document.getElementById('equipo').value.trim() || 'No se registraron observaciones de equipo hoy.';

    // 3. Armar la estructura HTML del resumen
    resumenContainer.innerHTML = `
        <div class="resumen-seccion">
            <h4>✅ Logros del Día</h4>
            ${logrados.length > 0 
                ? `<ul class="resumen-item-list">${logrados.map(item => `<li>${item}</li>`).join('')}</ul>`
                : '<p class="step-subtitle" style="margin-bottom:0;">No se marcaron metas como completadas.</p>'}
        </div>
        
        <div class="resumen-seccion">
            <h4>⏳ Pendientes o Bloqueos</h4>
            ${pendientes.length > 0 
                ? `<ul class="resumen-item-list">${pendientes.map(item => `<li>${item}</li>`).join('')}</ul>`
                : '<p class="step-subtitle" style="margin-bottom:0;">¡Todo lo planeado fue completado!</p>'}
        </div>

        <div class="resumen-seccion">
            <h4>💡 Dudas y Soluciones</h4>
            <p>${dudasTexto}</p>
        </div>

        <div class="resumen-seccion">
            <h4>👥 Aprendizaje en Equipo</h4>
            <p>${equipoTexto}</p>
        </div>
    `;
}

btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('step-active');
        indicators[currentStep - 1].classList.remove('active');
        
        currentStep--;
        
        document.getElementById(`step-${currentStep}`).classList.add('step-active');
        indicators[currentStep - 1].classList.add('active');
        indicators[currentStep - 1].classList.remove('completed');
        
        if (currentStep === 1) btnPrev.disabled = true;
        btnNext.textContent = 'Siguiente';
    }
});


// --- LÓGICA DE AGREGAR ITEMS (PASO 1) ---
const setupDynamicInput = (inputId, btnId, listId, arrayContainer) => {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const list = document.getElementById(listId);

    const updateList = () => {
        list.innerHTML = '';
        arrayContainer.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `${item} <span class="remove-btn" data-index="${index}">&times;</span>`;
            list.appendChild(li);
        });
    };

    btn.addEventListener('click', () => {
        if (input.value.trim() !== '') {
            arrayContainer.push(input.value.trim());
            input.value = '';
            updateList();
        }
    });

    list.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.getAttribute('data-index');
            arrayContainer.splice(index, 1);
            updateList();
        }
    });
};

setupDynamicInput('input-objetivo', 'btn-add-objetivo', 'lista-objetivos', objetivosDelDia);
setupDynamicInput('input-tarea', 'btn-add-tarea', 'lista-tareas', tareasDelDia);


// --- LÓGICA DINÁMICA DE CUMPLIMIENTO (PASO 2) ---
function renderizarCumplimiento() {
    const container = document.getElementById('cumplimiento-container');
    container.innerHTML = ''; // Limpiar previo

    const todosLosItems = [
        ...objetivosDelDia.map(obj => ({ texto: obj, tipo: 'Objetivo' })),
        ...tareasDelDia.map(tar => ({ texto: tar, tipo: 'Tarea' }))
    ];

    if (todosLosItems.length === 0) {
        container.innerHTML = '<p class="step-subtitle">No agregaste planes u objetivos en el paso anterior.</p>';
        return;
    }

    todosLosItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'cumplimiento-card';
        
        card.innerHTML = `
            <div class="cumplimiento-row">
                <span class="cumplimiento-text"><strong>[${item.tipo}]</strong> ${item.texto}</span>
                <label class="switch-label" style="display: flex; gap: 8px; align-items: center; font-size: 13px;">
                    ¿Logrado? 
                    <input type="checkbox" class="cumplimiento-checkbox" data-index="${index}">
                </label>
            </div>
            <div class="seguimiento-input-container" id="seguimiento-${index}" style="margin-top: 12px;">
                <input type="text" placeholder="¿Qué te impidió cumplirlo?" class="seguimiento-input">
            </div>
        `;
        container.appendChild(card);

        // Lógica condicional: cambia el placeholder según el checkbox
        const checkbox = card.querySelector('.cumplimiento-checkbox');
        const inputSeguimiento = card.querySelector('.seguimiento-input');

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                inputSeguimiento.placeholder = '¿Qué hiciste para lograrlo?';
                inputSeguimiento.style.borderColor = 'var(--success)';
            } else {
                inputSeguimiento.placeholder = '¿Qué te impidió cumplirlo?';
                inputSeguimiento.style.borderColor = 'var(--border-color)';
            }
        });
    });
}