// ===== SISTEMA DE GESTIÓN DE TAREAS =====
// Array global para almacenar todas las tareas creadas
let tareasCreadas = [];

// Funciones para persistencia de datos
function guardarTareasEnStorage() {
    try {
        localStorage.setItem('tareasCreadas', JSON.stringify(tareasCreadas));
        console.log('✅ Tareas guardadas en localStorage');
    } catch (error) {
        console.error('❌ Error al guardar tareas:', error);
    }
}

function cargarTareasDesdeStorage() {
    try {
        const tareasGuardadas = localStorage.getItem('tareasCreadas');
        if (tareasGuardadas) {
            const datosTareas = JSON.parse(tareasGuardadas);
            tareasCreadas = [];
            
            // Recrear instancias de la clase Tarea
            datosTareas.forEach(item => {
                const tareaData = item.tarea;
                
                // Recrear personal si existe
                let personalRecreado = null;
                if (tareaData.personal) {
                    personalRecreado = new Personal(
                        tareaData.personal.nombre,
                        tareaData.personal.costoPorHora,
                        tareaData.personal.costoPorHoraExtra
                    );
                    personalRecreado.horasTrabajadas = tareaData.personal.horasTrabajadas;
                }
                
                // Recrear material si existe
                let materialRecreado = null;
                if (tareaData.material) {
                    materialRecreado = new Material(
                        tareaData.material.nombreMaterial,
                        tareaData.material.costoPorUnidad
                    );
                    materialRecreado.inventario = tareaData.material.inventario;
                }
                
                // Recrear otros gastos si existe
                let otrosGastosRecreado = null;
                if (tareaData.otrosGastos) {
                    otrosGastosRecreado = new OtrosCostos(
                        tareaData.otrosGastos.nombre,
                        tareaData.otrosGastos.costoPorUnidad
                    );
                    otrosGastosRecreado.inventario = tareaData.otrosGastos.inventario;
                }
                
                // Recrear la instancia de Tarea
                const tareaRecreada = new Tarea(
                    tareaData.nombre,
                    personalRecreado,
                    materialRecreado,
                    otrosGastosRecreado,
                    tareaData.duracion
                );
                tareaRecreada.estado = tareaData.estado;
                tareaRecreada.fechaCreacion = new Date(tareaData.fechaCreacion);
                
                tareasCreadas.push({
                    tarea: tareaRecreada,
                    fechaCreacion: new Date(item.fechaCreacion),
                    id: item.id
                });
            });
            
            console.log(`✅ Cargadas ${tareasCreadas.length} tareas desde localStorage`);
            actualizarListaTareas();
            actualizarContadorTareas();
        }
    } catch (error) {
        console.error('❌ Error al cargar tareas:', error);
        tareasCreadas = [];
    }
}

// Función para actualizar el contador de tareas
function actualizarContadorTareas() {
    document.getElementById('contadorTareas').textContent = tareasCreadas.length;
}

// Función para agregar tarea a la lista
function agregarTareaALista(tarea) {
    tareasCreadas.push({
        tarea: tarea,
        fechaCreacion: new Date(),
        id: tareasCreadas.length + 1
    });
    console.log(`✅ Tarea agregada a la lista: ${tarea.getNombre()}`);
    guardarTareasEnStorage(); // Guardar en localStorage
    actualizarContadorTareas();
    actualizarListaTareas(); // Actualizar automáticamente la lista en la página
}

// Función para actualizar la lista de tareas en la página
function actualizarListaTareas() {
    const estadisticasDiv = document.getElementById('estadisticasTareas');
    const listaDiv = document.getElementById('listaTareas');
    
    if (tareasCreadas.length === 0) {
        estadisticasDiv.innerHTML = '<p class="empty-stats">📭 No hay tareas creadas aún</p>';
        listaDiv.innerHTML = '<p class="empty-state">Crea tu primera tarea usando el botón de arriba</p>';
        return;
    }
    
    // Calcular estadísticas
    const totalTareas = tareasCreadas.length;
    const tareasPendientes = tareasCreadas.filter(item => item.tarea.getEstado() === 'pendiente').length;
    const tareasEnProgreso = tareasCreadas.filter(item => item.tarea.getEstado() === 'en_progreso').length;
    const tareasCompletadas = tareasCreadas.filter(item => item.tarea.getEstado() === 'completada').length;
    const duracionPromedio = tareasCreadas.reduce((sum, item) => sum + item.tarea.getDuracion(), 0) / totalTareas;
    const costoTotal = tareasCreadas.reduce((sum, item) => sum + item.tarea.calcularCostoTotal(), 0);
    
    // Mostrar estadísticas
    estadisticasDiv.innerHTML = `
        <h3 class="stats-title"><img src="../storage/vectors/stats-svgrepo-com.svg" alt="" class="stats-icon-large">Estadísticas de Tareas</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value success">${totalTareas}</div>
                <div class="stat-label">Total Tareas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value warning">${tareasPendientes}</div>
                <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value primary">${tareasEnProgreso}</div>
                <div class="stat-label">En Progreso</div>
            </div>
            <div class="stat-card">
                <div class="stat-value purple">${tareasCompletadas}</div>
                <div class="stat-label">Completadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value info">${duracionPromedio.toFixed(1)}h</div>
                <div class="stat-label">Duración Promedio</div>
            </div>
            <div class="stat-card">
                <div class="stat-value success">$${costoTotal.toFixed(2)}</div>
                <div class="stat-label">Costo Total</div>
            </div>
        </div>
    `;
    
    // Crear lista de tareas
    let listaHTML = '<div class="employees-grid">';
    tareasCreadas.forEach((item, index) => {
        const tarea = item.tarea;
        const estadoClass = tarea.getEstado() === 'completada' ? 'success' : 
                           tarea.getEstado() === 'en_progreso' ? 'primary' : 'warning';
        const estadoText = tarea.getEstado() === 'completada' ? 'Completada' :
                          tarea.getEstado() === 'en_progreso' ? 'En Progreso' : 'Pendiente';
        
        listaHTML += `
            <div class="employee-card">
                <div class="employee-header">
                    <div class="employee-title-section">
                        <h4 class="employee-name">${tarea.getNombre()}</h4>
                        <span class="employee-id">#${item.id}</span>
                    </div>
                    <div class="dropdown-actions">
                        <button onclick="toggleDropdown(${index}, event)" class="dropdown-btn" title="Opciones">
                            <img src="../storage/vectors/equalizer-svgrepo-com.svg" alt="Opciones" class="dropdown-icon">
                        </button>
                        <div id="dropdown-${index}" class="dropdown-menu">
                            <button onclick="cambiarEstadoTarea(${index}); closeAllDropdowns()" class="dropdown-item">
                                Cambiar Estado
                            </button>
                            <button onclick="verDetallesTarea(${index}); closeAllDropdowns()" class="dropdown-item">
                                Ver Detalles
                            </button>
                            <button onclick="eliminarTarea(${index}); closeAllDropdowns()" class="dropdown-item danger">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
                <div class="employee-details-horizontal">
                    <span class="detail-item">
                        <strong>Duración:</strong> ${tarea.getDuracion()}h
                    </span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">
                        <strong>Estado:</strong> <span class="${estadoClass}">${estadoText}</span>
                    </span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">
                        <strong>Personal:</strong> ${tarea.getPersonal() ? tarea.getPersonal().getNombre() : 'No asignado'}
                    </span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">
                        <strong>Material:</strong> ${tarea.getMaterial() ? tarea.getMaterial().getNombreMaterial() : 'No asignado'}
                    </span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">
                        <strong>Otros Gastos:</strong> ${tarea.getOtrosGastos() ? tarea.getOtrosGastos().getNombre() : 'No asignados'}
                    </span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">
                        <strong>Costo:</strong> <span class="success">$${tarea.calcularCostoTotal().toFixed(2)}</span>
                    </span>
                    <span class="detail-separator">•</span>
                    <span class="detail-item">
                        <strong>Creada:</strong> ${item.fechaCreacion.toLocaleDateString()}
                    </span>
                </div>
            </div>
        `;
    });
    listaHTML += '</div>';
    
    listaDiv.innerHTML = listaHTML;
}

// Función para cambiar estado de una tarea
function cambiarEstadoTarea(index) {
    const tarea = tareasCreadas[index].tarea;
    const estadoActual = tarea.getEstado();
    
    let nuevoEstado;
    if (estadoActual === 'pendiente') {
        nuevoEstado = 'en_progreso';
    } else if (estadoActual === 'en_progreso') {
        nuevoEstado = 'completada';
    } else {
        nuevoEstado = 'pendiente';
    }
    
    // Si la tarea se va a completar, asignar horas al empleado
    if (nuevoEstado === 'completada' && estadoActual !== 'completada') {
        asignarHorasAlEmpleado(tarea);
    }
    
    // Si la tarea deja de estar completada, quitar horas al empleado
    if (estadoActual === 'completada' && nuevoEstado !== 'completada') {
        quitarHorasAlEmpleado(tarea);
    }
    
    tarea.setEstado(nuevoEstado);
    guardarTareasEnStorage();
    actualizarListaTareas();
    
    const estadoTexto = {
        'pendiente': 'Pendiente',
        'en_progreso': 'En Progreso',
        'completada': 'Completada'
    };
    
    console.log(`🔄 Estado de tarea "${tarea.getNombre()}" cambiado a: ${estadoTexto[nuevoEstado]}`);
}

// Función para ver detalles de una tarea
function verDetallesTarea(index) {
    const tarea = tareasCreadas[index].tarea;
    alert(tarea.mostrarDetalles());
}

// Función para eliminar una tarea específica
function eliminarTarea(index) {
    if (confirm(`¿Está seguro de que desea eliminar la tarea "${tareasCreadas[index].tarea.getNombre()}"?`)) {
        const tareaAEliminar = tareasCreadas[index].tarea;
        const nombreEliminado = tareaAEliminar.getNombre();
        
        // Si la tarea estaba completada, quitar las horas del empleado
        if (tareaAEliminar.getEstado() === 'completada') {
            quitarHorasAlEmpleado(tareaAEliminar);
        }
        
        tareasCreadas.splice(index, 1);
        guardarTareasEnStorage(); // Guardar cambios en localStorage
        console.log(`❌ Tarea eliminada: ${nombreEliminado}`);
        actualizarListaTareas();
        actualizarContadorTareas();
    }
}

// Función para limpiar toda la lista
function limpiarListaTareas() {
    if (tareasCreadas.length === 0) {
        alert('📭 La lista ya está vacía');
        return;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar todas las ${tareasCreadas.length} tareas?`)) {
        // Quitar horas de todas las tareas completadas antes de limpiar
        tareasCreadas.forEach(item => {
            if (item.tarea.getEstado() === 'completada') {
                quitarHorasAlEmpleado(item.tarea);
            }
        });
        
        tareasCreadas = [];
        guardarTareasEnStorage(); // Guardar cambios en localStorage
        actualizarListaTareas();
        actualizarContadorTareas();
        console.log('Lista de tareas limpiada');
    }
}

// ===== FUNCIONES PARA GESTIÓN DE HORAS DE EMPLEADOS =====

// Función para cargar empleados desde localStorage
function cargarEmpleadosParaTareas() {
    try {
        const empleadosGuardados = localStorage.getItem('empleadosCreados');
        if (empleadosGuardados) {
            const datosEmpleados = JSON.parse(empleadosGuardados);
            const empleadosCreados = [];
            
            // Recrear instancias de la clase Personal
            datosEmpleados.forEach(item => {
                const empleadoData = item.empleado;
                // Recrear la instancia de Personal con los datos guardados
                const empleadoRecreado = new Personal(
                    empleadoData.nombre,
                    empleadoData.costoPorHora,
                    empleadoData.costoPorHoraExtra
                );
                // Restaurar las horas trabajadas
                empleadoRecreado.horasTrabajadas = empleadoData.horasTrabajadas;
                
                empleadosCreados.push({
                    empleado: empleadoRecreado,
                    fechaCreacion: new Date(item.fechaCreacion),
                    id: item.id
                });
            });
            
            return empleadosCreados;
        }
        return [];
    } catch (error) {
        console.error('❌ Error al cargar empleados para tareas:', error);
        return [];
    }
}

// Función para guardar empleados en localStorage
function guardarEmpleadosParaTareas(empleadosCreados) {
    try {
        localStorage.setItem('empleadosCreados', JSON.stringify(empleadosCreados));
        console.log('✅ Empleados actualizados en localStorage desde tareas');
    } catch (error) {
        console.error('❌ Error al guardar empleados desde tareas:', error);
    }
}

// Función para asignar horas al empleado cuando se completa una tarea
function asignarHorasAlEmpleado(tarea) {
    const empleadoAsignado = tarea.getPersonal();
    const duracionTarea = tarea.getDuracion();
    
    // Solo proceder si hay un empleado asignado y duración válida
    if (!empleadoAsignado || duracionTarea <= 0) {
        return;
    }
    
    // Cargar empleados actuales
    const empleadosCreados = cargarEmpleadosParaTareas();
    
    // Buscar el empleado específico por nombre (asumiendo que los nombres son únicos)
    const empleadoEncontrado = empleadosCreados.find(item => 
        item.empleado.getNombre() === empleadoAsignado.getNombre()
    );
    
    if (empleadoEncontrado) {
        // Obtener horas actuales y sumar las nuevas
        const horasActuales = empleadoEncontrado.empleado.getHorasTrabajadas();
        const nuevasHoras = horasActuales + duracionTarea;
        
        // Asignar nuevas horas
        empleadoEncontrado.empleado.setHorasTrabajadas(nuevasHoras);
        
        // Guardar cambios
        guardarEmpleadosParaTareas(empleadosCreados);
        
        console.log(`✅ Asignadas ${duracionTarea}h al empleado "${empleadoAsignado.getNombre()}" (Total: ${nuevasHoras}h)`);
    } else {
        console.warn(`⚠️ No se encontró el empleado "${empleadoAsignado.getNombre()}" en el sistema`);
    }
}

// Función para quitar horas al empleado cuando se desmarca una tarea como completada
function quitarHorasAlEmpleado(tarea) {
    const empleadoAsignado = tarea.getPersonal();
    const duracionTarea = tarea.getDuracion();
    
    // Solo proceder si hay un empleado asignado y duración válida
    if (!empleadoAsignado || duracionTarea <= 0) {
        return;
    }
    
    // Cargar empleados actuales
    const empleadosCreados = cargarEmpleadosParaTareas();
    
    // Buscar el empleado específico por nombre
    const empleadoEncontrado = empleadosCreados.find(item => 
        item.empleado.getNombre() === empleadoAsignado.getNombre()
    );
    
    if (empleadoEncontrado) {
        // Obtener horas actuales y restar las horas de la tarea
        const horasActuales = empleadoEncontrado.empleado.getHorasTrabajadas();
        const nuevasHoras = Math.max(0, horasActuales - duracionTarea); // No permitir valores negativos
        
        // Asignar nuevas horas
        empleadoEncontrado.empleado.setHorasTrabajadas(nuevasHoras);
        
        // Guardar cambios
        guardarEmpleadosParaTareas(empleadosCreados);
        
        console.log(`➖ Quitadas ${duracionTarea}h al empleado "${empleadoAsignado.getNombre()}" (Total: ${nuevasHoras}h)`);
    } else {
        console.warn(`⚠️ No se encontró el empleado "${empleadoAsignado.getNombre()}" en el sistema`);
    }
}

// ===== FUNCIONES PARA DROPDOWN =====

function toggleDropdown(index, event) {
    // Prevenir que el evento se propague y cierre el dropdown inmediatamente
    if (event) {
        event.stopPropagation();
    }
    
    // Cerrar todos los otros dropdowns
    closeAllDropdowns();
    
    // Abrir/cerrar el dropdown específico
    const dropdown = document.getElementById(`dropdown-${index}`);
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-btn') && !event.target.closest('.dropdown-menu')) {
        closeAllDropdowns();
    }
});

// Función para exportar tareas a la consola
function exportarTareas() {
    if (tareasCreadas.length === 0) {
        alert('📭 No hay tareas para exportar');
        return;
    }
    
    console.log('📄 ===== EXPORTACIÓN DE TAREAS =====');
    console.log(`Total de tareas: ${tareasCreadas.length}`);
    console.log('');
    
    tareasCreadas.forEach((item, index) => {
        const tarea = item.tarea;
        console.log(`--- Tarea ${index + 1} ---`);
        console.log(tarea.mostrarDetalles());
        console.log('');
    });
    
    console.log('📄 ===== FIN DE EXPORTACIÓN =====');
    alert('📄 Tareas exportadas a la consola. Abre las herramientas de desarrollador (F12) para verlas.');
}

// Función para mostrar rangos detallados
function mostrarRangosDetallados() {
    const rangos = obtenerRangosTareas();
    alert(`Rangos configurados para tareas:\n\n` +
          `⏱️ Duración: ${rangos.duracionMin} - ${rangos.duracionMax} horas\n\n` +
          `Estos rangos se validan al crear nuevas tareas.`);
}

// ===== FUNCIONES DEL MODAL DE CREAR TAREA =====

function crearTareaPersonalizada() {
    // Cargar listas de empleados, materiales y otros gastos
    cargarOpcionesFormulario();
    
    // Mostrar rangos actuales
    const rangos = obtenerRangosTareas();
    
    // Limpiar formulario
    limpiarFormularioTarea();
    
    // Mostrar modal
    document.getElementById('modalCrearTarea').style.display = 'block';
}

function cerrarModalCrearTarea() {
    document.getElementById('modalCrearTarea').style.display = 'none';
}

function limpiarFormularioTarea() {
    document.getElementById('nombreTarea').value = '';
    document.getElementById('duracionTarea').value = '';
    document.getElementById('personalAsignado').selectedIndex = 0;
    document.getElementById('materialAsignado').selectedIndex = 0;
    document.getElementById('otrosGastosAsignado').selectedIndex = 0;
    
    // Limpiar mensajes de error
    document.getElementById('errorNombreTarea').textContent = '';
    document.getElementById('errorDuracionTarea').textContent = '';
    
    // Limpiar clases de validación
    document.getElementById('nombreTarea').classList.remove('valid', 'invalid');
    document.getElementById('duracionTarea').classList.remove('valid', 'invalid');
}

function cargarOpcionesFormulario() {
    // Cargar empleados
    const selectPersonal = document.getElementById('personalAsignado');
    selectPersonal.innerHTML = '<option value="">-- Sin personal asignado --</option>';
    
    // Obtener empleados del localStorage
    try {
        const empleadosGuardados = localStorage.getItem('empleadosCreados');
        if (empleadosGuardados) {
            const empleados = JSON.parse(empleadosGuardados);
            empleados.forEach((item, index) => {
                const empleado = item.empleado;
                selectPersonal.innerHTML += `<option value="${index}">${empleado.nombre} ($${empleado.costoPorHora}/h)</option>`;
            });
        }
    } catch (error) {
        console.warn('Error al cargar empleados:', error);
    }
    
    // Cargar materiales
    const selectMaterial = document.getElementById('materialAsignado');
    selectMaterial.innerHTML = '<option value="">-- Sin material asignado --</option>';
    
    try {
        const materialesGuardados = localStorage.getItem('materialesCreados');
        if (materialesGuardados) {
            const materiales = JSON.parse(materialesGuardados);
            materiales.forEach((item, index) => {
                const material = item.material;
                selectMaterial.innerHTML += `<option value="${index}">${material.nombreMaterial} ($${material.costoPorUnidad}/u)</option>`;
            });
        }
    } catch (error) {
        console.warn('Error al cargar materiales:', error);
    }
    
    // Cargar otros gastos
    const selectOtrosGastos = document.getElementById('otrosGastosAsignado');
    selectOtrosGastos.innerHTML = '<option value="">-- Sin otros gastos asignados --</option>';
    
    try {
        const otrosGastosGuardados = localStorage.getItem('otrosGastosCreados');
        if (otrosGastosGuardados) {
            const otrosGastos = JSON.parse(otrosGastosGuardados);
            otrosGastos.forEach((item, index) => {
                const gasto = item.otroGasto;
                selectOtrosGastos.innerHTML += `<option value="${index}">${gasto.nombre} ($${gasto.costoPorUnidad}/u)</option>`;
            });
        }
    } catch (error) {
        console.warn('Error al cargar otros gastos:', error);
    }
}

function validarNombreTarea(nombre) {
    if (!nombre || nombre.trim().length === 0) {
        return 'El nombre de la tarea es requerido';
    }
    
    const caracteresProhibidos = `!"·$%&/()=?¿'¡+\`*]^[´.:,;-_{}<>\`~\\|`;
    for (let char of caracteresProhibidos) {
        if (nombre.includes(char)) {
            return `El carácter "${char}" no está permitido`;
        }
    }
    
    return '';
}

function validarDuracionTarea(duracion) {
    const rangos = obtenerRangosTareas();
    const duracionNum = parseFloat(duracion);
    
    if (isNaN(duracionNum)) {
        return 'La duración debe ser un número válido';
    }
    
    if (duracionNum < rangos.duracionMin || duracionNum > rangos.duracionMax) {
        return `La duración debe estar entre ${rangos.duracionMin} y ${rangos.duracionMax} horas`;
    }
    
    return '';
}

function validarYCrearTarea() {
    const nombre = document.getElementById('nombreTarea').value.trim();
    const duracion = document.getElementById('duracionTarea').value;
    const personalIndex = document.getElementById('personalAsignado').value;
    const materialIndex = document.getElementById('materialAsignado').value;
    const otrosGastosIndex = document.getElementById('otrosGastosAsignado').value;
    
    // Validar nombre
    const errorNombre = validarNombreTarea(nombre);
    if (errorNombre) {
        document.getElementById('errorNombreTarea').textContent = '❌ ' + errorNombre;
        document.getElementById('nombreTarea').classList.add('invalid');
        return;
    }
    
    // Validar duración
    const errorDuracion = validarDuracionTarea(duracion);
    if (errorDuracion) {
        document.getElementById('errorDuracionTarea').textContent = '❌ ' + errorDuracion;
        document.getElementById('duracionTarea').classList.add('invalid');
        return;
    }
    
    try {
        // Obtener instancias de los recursos asignados
        let personal = null;
        let material = null;
        let otrosGastos = null;
        
        // Personal
        if (personalIndex !== '') {
            const empleadosGuardados = localStorage.getItem('empleadosCreados');
            if (empleadosGuardados) {
                const empleados = JSON.parse(empleadosGuardados);
                const empleadoData = empleados[parseInt(personalIndex)].empleado;
                personal = new Personal(
                    empleadoData.nombre,
                    empleadoData.costoPorHora,
                    empleadoData.costoPorHoraExtra
                );
                personal.horasTrabajadas = empleadoData.horasTrabajadas;
            }
        }
        
        // Material
        if (materialIndex !== '') {
            const materialesGuardados = localStorage.getItem('materialesCreados');
            if (materialesGuardados) {
                const materiales = JSON.parse(materialesGuardados);
                const materialData = materiales[parseInt(materialIndex)].material;
                material = new Material(
                    materialData.nombreMaterial,
                    materialData.costoPorUnidad
                );
                material.inventario = materialData.inventario;
            }
        }
        
        // Otros gastos
        if (otrosGastosIndex !== '') {
            const otrosGastosGuardados = localStorage.getItem('otrosGastosCreados');
            if (otrosGastosGuardados) {
                const otrosGastos_array = JSON.parse(otrosGastosGuardados);
                const otroGastoData = otrosGastos_array[parseInt(otrosGastosIndex)].otroGasto;
                otrosGastos = new OtrosCostos(
                    otroGastoData.nombre,
                    otroGastoData.costoPorUnidad
                );
                otrosGastos.inventario = otroGastoData.inventario;
            }
        }
        
        // Crear la tarea
        const nuevaTarea = new Tarea(nombre, personal, material, otrosGastos, parseFloat(duracion));
        
        // Agregar a la lista
        agregarTareaALista(nuevaTarea);
        
        // Cerrar modal
        cerrarModalCrearTarea();
        
        console.log(`✅ Tarea creada exitosamente: ${nuevaTarea.getNombre()}`);
        console.log(`Costo estimado: $${nuevaTarea.calcularCostoTotal().toFixed(2)}`);
        
    } catch (error) {
        alert(`❌ Error al crear la tarea: ${error.message}`);
        console.error('Error al crear tarea:', error);
    }
}

// ===== FUNCIONES DE CONFIGURACIÓN GLOBAL =====

let configuracionGlobal = {
    tareas: {
        duracionMinima: 0.5,
        duracionMaxima: 40
    },
    validacion: { estricta: true, mostrarConsejos: true, caracteresProhibidos: `!"·$%&/()=?¿'¡+\`*]^[´.:,;-_{}<>\`~\\|` },
    interfaz: { tema: 'default', animaciones: true, idioma: 'es' },
    datos: { autoguardado: true, backupAutomatico: true }
};

function obtenerRangosTareas() {
    return {
        duracionMin: configuracionGlobal.tareas.duracionMinima,
        duracionMax: configuracionGlobal.tareas.duracionMaxima
    };
}

function abrirModalConfiguracion() {
    cargarConfiguracionGlobal();
    document.getElementById('modalConfiguracion').style.display = 'block';
    actualizarInterfazConfiguracion();
}

function cerrarModalConfiguracion() {
    document.getElementById('modalConfiguracion').style.display = 'none';
}

// Cargar configuración desde localStorage
function cargarConfiguracionGlobal() {
    const configGuardada = localStorage.getItem('configuracionSistema');
    if (configGuardada) {
        try {
            const configCargada = JSON.parse(configGuardada);
            configuracionGlobal = { ...configuracionGlobal, ...configCargada };
        } catch (error) {
            console.warn('Error al cargar configuración guardada:', error);
        }
    }
}

function actualizarInterfazConfiguracion() {
    cargarConfiguracionGlobal();
    
    // Cargar valores de configuración específicos para tareas
    document.getElementById('duracionMinimaTarea').value = configuracionGlobal.tareas?.duracionMinima || 0.5;
    document.getElementById('duracionMaximaTarea').value = configuracionGlobal.tareas?.duracionMaxima || 40;
    
    actualizarRangosActualesMostrados();
}

function actualizarRangosActualesMostrados() {
    const duracionMin = parseFloat(document.getElementById('duracionMinimaTarea').value) || 0.5;
    const duracionMax = parseFloat(document.getElementById('duracionMaximaTarea').value) || 40;
    
    document.getElementById('rangosActualesTareas').innerHTML = `
        <strong>Rangos configurados:</strong><br>
        Duración: ${duracionMin} - ${duracionMax} horas
    `;
}

function aplicarConfiguracionTareas() {
    const duracionMin = parseFloat(document.getElementById('duracionMinimaTarea').value);
    const duracionMax = parseFloat(document.getElementById('duracionMaximaTarea').value);
    
    // Validar rangos de tareas únicamente
    if (duracionMin >= duracionMax) {
        alert("⚠️ Error: La duración mínima debe ser menor que la máxima");
        return;
    }
    
    // Actualizar solo los rangos de tareas en la configuración global
    if (!configuracionGlobal.tareas) {
        configuracionGlobal.tareas = {};
    }
    configuracionGlobal.tareas.duracionMinima = duracionMin;
    configuracionGlobal.tareas.duracionMaxima = duracionMax;
    
    // Guardar en localStorage
    localStorage.setItem('configuracionSistema', JSON.stringify(configuracionGlobal));
    
    actualizarRangosActualesMostrados();
    
    alert(`✅ Configuración de rangos para tareas aplicada exitosamente:\n\n` +
          `Duración: ${duracionMin} - ${duracionMax} horas\n\n` +
          `Los cambios se aplicarán inmediatamente en la sección de tareas.`);
}

function aplicarConfiguracionValidacion() {
    alert('✅ Configuración de validación aplicada');
}

function aplicarConfiguracionInterfaz() {
    alert('✅ Configuración de interfaz aplicada');
}

function exportarConfiguracion() {
    alert('📤 Configuración exportada');
}

function resetearConfiguracion() {
    alert('🔄 Configuración restaurada');
}

function limpiarDatosSistema() {
    alert('Datos del sistema eliminados');
}

function actualizarEstadisticasSistemaConfig() {
    document.getElementById('estadisticasSistema').innerHTML = '<p>Estadísticas del sistema</p>';
}

// ===== INICIALIZACIÓN DEL SISTEMA =====

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Sistema iniciado sin datos precargados
    console.log("🚀 Sistema de Gestión de Tareas iniciado");
    console.log("📚 Clases cargadas: Personal, Material, OtrosCostos, Tarea");
    console.log("💡 Usa los botones para crear tareas y gestionar el proyecto");
    
    // Cargar configuración global al iniciar
    cargarConfiguracionGlobal();
    console.log("Configuración de rangos cargada desde configuración global");
    
    // Cargar tareas guardadas al iniciar
    cargarTareasDesdeStorage();
    console.log(`Tareas en la lista: ${tareasCreadas.length}`);
    
    // Mostrar lista inicial de tareas
    actualizarListaTareas();
    
    // ===== VALIDACIÓN EN TIEMPO REAL =====
    
    // Agregar validación en tiempo real al modal de crear tarea
    document.getElementById('nombreTarea').addEventListener('input', function() {
        const error = validarNombreTarea(this.value);
        const errorElement = document.getElementById('errorNombreTarea');
        
        if (this.value === '') {
            errorElement.textContent = '';
            this.classList.remove('valid', 'invalid');
        } else if (error) {
            errorElement.textContent = '❌ ' + error;
            this.classList.remove('valid');
            this.classList.add('invalid');
        } else {
            errorElement.textContent = '✅ Nombre válido';
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });
    
    document.getElementById('duracionTarea').addEventListener('input', function() {
        const error = validarDuracionTarea(this.value);
        const errorElement = document.getElementById('errorDuracionTarea');
        
        if (this.value === '') {
            errorElement.textContent = '';
            this.classList.remove('valid', 'invalid');
        } else if (error) {
            errorElement.textContent = '❌ ' + error;
            this.classList.remove('valid');
            this.classList.add('invalid');
        } else {
            errorElement.textContent = '✅ Duración válida';
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });
    
    // ===== FUNCIONALIDAD DE TECLA ENTER =====
    
    // Permitir crear tarea con Enter en los campos del formulario
    function handleEnterKey(event) {
        if (event.key === 'Enter') {
            validarYCrearTarea();
        }
    }
    
    document.getElementById('nombreTarea').addEventListener('keypress', handleEnterKey);
    document.getElementById('duracionTarea').addEventListener('keypress', handleEnterKey);
});