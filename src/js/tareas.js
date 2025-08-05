// ===== SISTEMA DE GESTIÓN DE TAREAS =====
// Array global para almacenar todas las tareas creadas
let tareasCreadas = [];

// Variables para el modal de confirmación de eliminación
let tareaAEliminarIndex = -1;

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
                let personalRecreado = [];
                if (tareaData.personal) {
                    // Manejar tanto el formato anterior (objeto único) como el nuevo (array)
                    const personalData = Array.isArray(tareaData.personal) ? tareaData.personal : [tareaData.personal];
                    
                    personalData.forEach(empData => {
                        const empleado = new Personal(
                            empData.nombre,
                            empData.costoPorHora,
                            empData.costoPorHoraExtra
                        );
                        empleado.horasTrabajadas = empData.horasTrabajadas;
                        personalRecreado.push(empleado);
                    });
                }
                
                // Recrear materiales si existen
                let materialesRecreados = [];
                if (tareaData.materiales) {
                    // Manejar tanto el formato anterior (objeto único) como el nuevo (array)
                    const materialesData = Array.isArray(tareaData.materiales) ? tareaData.materiales : [tareaData.materiales];
                    
                    materialesData.forEach(materialData => {
                        const material = new Material(
                            materialData.nombreMaterial,
                            materialData.costoPorUnidad
                        );
                        material.inventario = materialData.inventario;
                        materialesRecreados.push(material);
                    });
                } else if (tareaData.material) {
                    // Compatibilidad con formato anterior
                    const material = new Material(
                        tareaData.material.nombreMaterial,
                        tareaData.material.costoPorUnidad
                    );
                    material.inventario = tareaData.material.inventario;
                    materialesRecreados.push(material);
                }
                
                // Recrear otros gastos si existen
                let otrosGastosRecreados = [];
                if (tareaData.otrosGastos) {
                    // Manejar tanto el formato anterior (objeto único) como el nuevo (array)
                    const otrosGastosData = Array.isArray(tareaData.otrosGastos) ? tareaData.otrosGastos : [tareaData.otrosGastos];
                    
                    otrosGastosData.forEach(gastoData => {
                        const gasto = new OtrosCostos(
                            gastoData.nombre,
                            gastoData.costoPorUnidad
                        );
                        gasto.inventario = gastoData.inventario;
                        otrosGastosRecreados.push(gasto);
                    });
                }
                
                // Recrear la instancia de Tarea
                const tareaRecreada = new Tarea(
                    tareaData.nombre,
                    personalRecreado,
                    materialesRecreados,
                    otrosGastosRecreados,
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
        estadisticasDiv.innerHTML = '<p class="empty-stats"> No hay tareas creadas aún</p>';
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
    const costoReal = tareasCreadas
        .filter(item => item.tarea.getEstado() === 'completada')
        .reduce((sum, item) => sum + item.tarea.calcularCostoTotal(), 0);
    
    // Mostrar estadísticas con el formato correcto
    estadisticasDiv.innerHTML = `
        <h3 class="stats-title"><img src="../storage/vectors/stats-svgrepo-com.svg" alt="" class="stats-icon-large">Estadísticas Generales</h3>
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
            <div class="stat-card">
                <div class="stat-value danger">$${costoReal.toFixed(2)}</div>
                <div class="stat-label">Costo Real</div>
            </div>
        </div>
    `;
    
    // Mostrar lista de tareas con formato vertical como empleados
    let listaHTML = '<h3 class="employees-title"><img src="../storage/vectors/clipboard-svgrepo-com.svg" alt="" class="clipboard-icon-large">Lista Detallada</h3>';
    
    tareasCreadas.forEach((item, index) => {
        const tarea = item.tarea;
        const estadoClass = tarea.getEstado() === 'completada' ? 'success' : 
                           tarea.getEstado() === 'en_progreso' ? 'primary' : 'warning';
        const estadoText = tarea.getEstado() === 'completada' ? 'Completada' :
                          tarea.getEstado() === 'en_progreso' ? 'En Progreso' : 'Pendiente';
        const fechaFormateada = item.fechaCreacion.toLocaleString('es-ES');
        
        listaHTML += `
            <div class="employee-card">
                <div class="employee-header">
                    <h4 class="employee-name"><img src="../storage/vectors/clipboard-svgrepo-com.svg" alt="" class="clipboard-icon-large"> ${tarea.getNombre()}</h4>
                    <span class="employee-id">ID: ${item.id}</span>
                </div>
                
                <div class="employee-details">
                    <div class="employee-detail"><strong><img src="../storage/vectors/clock-svgrepo-com.svg" alt="" class="clock-icon"> Duración:</strong> ${tarea.getDuracion()}h</div>
                    <div class="employee-detail"><strong><img src="../storage/vectors/traffic-light-svgrepo-com.svg" alt="" class="traffic-light-icon"> Estado:</strong> <span class="${estadoClass}">${estadoText}</span></div>
                                         <div class="employee-detail"><strong><img src="../storage/vectors/user-svgrepo-com.svg" alt="" class="user-icon"> Personal:</strong> ${tarea.getPersonalArray().length > 0 ? tarea.getPersonalArray().map(emp => emp.getNombre()).join(', ') : 'No asignado'}</div>
                                         <div class="employee-detail"><strong><img src="../storage/vectors/layers-svgrepo-com.svg" alt="" class="layers-icon"> Materiales:</strong> ${tarea.getMateriales().length > 0 ? tarea.getMateriales().map(mat => mat.getNombreMaterial()).join(', ') : 'No asignados'}</div>
                     <div class="employee-detail"><strong><img src="../storage/vectors/briefcase-svgrepo-com.svg" alt="" class="briefcase-icon"> Otros Gastos:</strong> ${tarea.getOtrosGastosArray().length > 0 ? tarea.getOtrosGastosArray().map(gasto => gasto.getNombre()).join(', ') : 'No asignados'}</div>
                    <div class="employee-detail"><strong><img src="../storage/vectors/circle-dollar-svgrepo-com.svg" alt="" class="circle-dollar-icon"> Costo Total:</strong> $${tarea.calcularCostoTotal().toFixed(2)}</div>
                </div>
                
                <div class="employee-date">
                    <img src="../storage/vectors/coins-svgrepo-com.svg" alt="" class="coins-icon"> Creado: ${fechaFormateada}
                </div>
                
                                 <div class="employee-actions">
                     <button onclick="cambiarEstadoTarea(${index})" class="button button-primary">
                         <img src="../storage/vectors/traffic-light-svgrepo-com.svg" alt="" class="button-icon">Cambiar Estado
                     </button>
                     <button onclick="eliminarTarea(${index})" class="button button-danger">
                         <img src="../storage/vectors/trash-svgrepo-com.svg" alt="" class="button-icon">Eliminar
                     </button>
                 </div>
            </div>
        `;
    });
    
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
    console.log(tarea.mostrarDetalles());
}

// Función para eliminar una tarea específica
function eliminarTarea(index) {
    // Guardar el índice de la tarea a eliminar
    tareaAEliminarIndex = index;
    
    // Abrir el modal de confirmación
    const modal = document.getElementById('modalConfirmacionEliminarTarea');
    modal.style.display = 'block';
}

// Función para limpiar toda la lista
function limpiarListaTareas() {
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
    const empleadosAsignados = tarea.getPersonalArray();
    const duracionTarea = tarea.getDuracion();
    
    // Solo proceder si hay empleados asignados y duración válida
    if (empleadosAsignados.length === 0 || duracionTarea <= 0) {
        return;
    }
    
    // Cargar empleados actuales
    const empleadosCreados = cargarEmpleadosParaTareas();
    
    // Dividir la duración entre todos los empleados
    const duracionPorEmpleado = Math.round((duracionTarea / empleadosAsignados.length) * 100) / 100;
    
    empleadosAsignados.forEach(empleadoAsignado => {
        // Buscar el empleado específico por nombre (asumiendo que los nombres son únicos)
        const empleadoEncontrado = empleadosCreados.find(item => 
            item.empleado.getNombre() === empleadoAsignado.getNombre()
        );
        
        if (empleadoEncontrado) {
            // Obtener horas actuales y sumar las nuevas
            const horasActuales = empleadoEncontrado.empleado.getHorasTrabajadas();
            const nuevasHoras = horasActuales + duracionPorEmpleado;
            
            // Asignar nuevas horas
            empleadoEncontrado.empleado.setHorasTrabajadas(nuevasHoras);
            
            console.log(`✅ Asignadas ${duracionPorEmpleado.toFixed(1)}h al empleado "${empleadoAsignado.getNombre()}" (Total: ${nuevasHoras.toFixed(1)}h)`);
        } else {
            console.warn(`⚠️ No se encontró el empleado "${empleadoAsignado.getNombre()}" en el sistema`);
        }
    });
    
    // Guardar cambios
    guardarEmpleadosParaTareas(empleadosCreados);
}

// Función para quitar horas al empleado cuando se desmarca una tarea como completada
function quitarHorasAlEmpleado(tarea) {
    const empleadosAsignados = tarea.getPersonalArray();
    const duracionTarea = tarea.getDuracion();
    
    // Solo proceder si hay empleados asignados y duración válida
    if (empleadosAsignados.length === 0 || duracionTarea <= 0) {
        return;
    }
    
    // Cargar empleados actuales
    const empleadosCreados = cargarEmpleadosParaTareas();
    
    // Dividir la duración entre todos los empleados
    const duracionPorEmpleado = duracionTarea / empleadosAsignados.length;
    
    empleadosAsignados.forEach(empleadoAsignado => {
        // Buscar el empleado específico por nombre
        const empleadoEncontrado = empleadosCreados.find(item => 
            item.empleado.getNombre() === empleadoAsignado.getNombre()
        );
        
        if (empleadoEncontrado) {
            // Obtener horas actuales y restar las horas de la tarea
            const horasActuales = empleadoEncontrado.empleado.getHorasTrabajadas();
            const nuevasHoras = Math.max(0, horasActuales - duracionPorEmpleado); // No permitir valores negativos
            
            // Asignar nuevas horas
            empleadoEncontrado.empleado.setHorasTrabajadas(nuevasHoras);
            
            console.log(`➖ Quitadas ${duracionPorEmpleado.toFixed(1)}h al empleado "${empleadoAsignado.getNombre()}" (Total: ${nuevasHoras.toFixed(1)}h)`);
        } else {
            console.warn(`⚠️ No se encontró el empleado "${empleadoAsignado.getNombre()}" en el sistema`);
        }
    });
    
    // Guardar cambios
    guardarEmpleadosParaTareas(empleadosCreados);
}

// ===== FUNCIONES PARA DROPDOWN =====





// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-btn') && !event.target.closest('.dropdown-menu')) {
        closeAllDropdowns();
    }
});

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const modalCrearTarea = document.getElementById('modalCrearTarea');
    const modalConfiguracion = document.getElementById('modalConfiguracion');
    
    if (event.target === modalCrearTarea) {
        cerrarModalCrearTarea();
    }
    
    if (event.target === modalConfiguracion) {
        cerrarModalConfiguracion();
    }
};



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

// ===== FUNCIONES PARA MODAL DE CONFIRMACIÓN DE ELIMINACIÓN =====

function confirmarEliminarTarea() {
    if (tareaAEliminarIndex >= 0 && tareaAEliminarIndex < tareasCreadas.length) {
        const tareaAEliminar = tareasCreadas[tareaAEliminarIndex].tarea;
        const nombreEliminado = tareaAEliminar.getNombre();
        
        // Si la tarea estaba completada, quitar las horas del empleado
        if (tareaAEliminar.getEstado() === 'completada') {
            quitarHorasAlEmpleado(tareaAEliminar);
        }
        
        tareasCreadas.splice(tareaAEliminarIndex, 1);
        guardarTareasEnStorage(); // Guardar cambios en localStorage
        console.log(`❌ Tarea eliminada: ${nombreEliminado}`);
        actualizarListaTareas();
        actualizarContadorTareas();
    }
    
    // Cerrar el modal y resetear el índice
    cerrarModalConfirmacionEliminarTarea();
}

function cerrarModalConfirmacionEliminarTarea() {
    document.getElementById('modalConfirmacionEliminarTarea').style.display = 'none';
    tareaAEliminarIndex = -1; // Resetear el índice
}

function limpiarFormularioTarea() {
    document.getElementById('nombreTarea').value = '';
    document.getElementById('duracionTarea').value = '';
    
    // Limpiar selección de empleados
    document.getElementById('empleadosSeleccionados').innerHTML = '';
    const empleadosOptions = document.querySelectorAll('#listaEmpleados .empleado-option');
    empleadosOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Limpiar selección de materiales
    document.getElementById('materialesSeleccionados').innerHTML = '';
    const materialesOptions = document.querySelectorAll('#listaMateriales .empleado-option');
    materialesOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Limpiar selección de otros gastos
    document.getElementById('otrosGastosSeleccionados').innerHTML = '';
    const otrosGastosOptions = document.querySelectorAll('#listaOtrosGastos .empleado-option');
    otrosGastosOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Limpiar mensajes de error
    document.getElementById('errorNombreTarea').textContent = '';
    document.getElementById('errorDuracionTarea').textContent = '';
    
    // Limpiar clases de validación
    document.getElementById('nombreTarea').classList.remove('valid', 'invalid');
    document.getElementById('duracionTarea').classList.remove('valid', 'invalid');
}

function cargarOpcionesFormulario() {
    // Cargar empleados
    const listaEmpleados = document.getElementById('listaEmpleados');
    listaEmpleados.innerHTML = '';
    
    // Obtener empleados del localStorage
    try {
        const empleadosGuardados = localStorage.getItem('empleadosCreados');
        if (empleadosGuardados) {
            const empleados = JSON.parse(empleadosGuardados);
            empleados.forEach((item, index) => {
                const empleado = item.empleado;
                const empleadoOption = document.createElement('div');
                empleadoOption.className = 'empleado-option';
                empleadoOption.dataset.index = index;
                empleadoOption.innerHTML = `
                    <div class="empleado-info">
                        <div class="empleado-nombre">${empleado.nombre}</div>
                        <div class="empleado-costo">$${empleado.costoPorHora}/h</div>
                    </div>
                    <img src="../storage/vectors/circle-check-svgrepo-com.svg" alt="" class="check-icon">
                `;
                
                // Agregar evento de clic
                empleadoOption.addEventListener('click', function() {
                    toggleEmpleadoSeleccionado(index, empleadoOption);
                });
                
                listaEmpleados.appendChild(empleadoOption);
            });
        }
    } catch (error) {
        console.warn('Error al cargar empleados:', error);
    }
    
    // Cargar materiales
    const listaMateriales = document.getElementById('listaMateriales');
    listaMateriales.innerHTML = '';
    
    try {
        const materialesGuardados = localStorage.getItem('materialesCreados');
        if (materialesGuardados) {
            const materiales = JSON.parse(materialesGuardados);
            materiales.forEach((item, index) => {
                const material = item.material;
                const materialOption = document.createElement('div');
                materialOption.className = 'empleado-option';
                materialOption.dataset.index = index;
                materialOption.innerHTML = `
                    <div class="empleado-info">
                        <div class="empleado-nombre">${material.nombreMaterial}</div>
                        <div class="empleado-costo">$${material.costoPorUnidad}/u</div>
                    </div>
                    <img src="../storage/vectors/circle-check-svgrepo-com.svg" alt="" class="check-icon">
                `;
                
                // Agregar evento de clic
                materialOption.addEventListener('click', function() {
                    toggleMaterialSeleccionado(index, materialOption);
                });
                
                listaMateriales.appendChild(materialOption);
            });
        }
    } catch (error) {
        console.warn('Error al cargar materiales:', error);
    }
    
    // Cargar otros gastos
    const listaOtrosGastos = document.getElementById('listaOtrosGastos');
    listaOtrosGastos.innerHTML = '';
    
    try {
        const otrosGastosGuardados = localStorage.getItem('otrosGastosCreados');
        if (otrosGastosGuardados) {
            const otrosGastos = JSON.parse(otrosGastosGuardados);
            otrosGastos.forEach((item, index) => {
                const gasto = item.otroGasto;
                const gastoOption = document.createElement('div');
                gastoOption.className = 'empleado-option';
                gastoOption.dataset.index = index;
                gastoOption.innerHTML = `
                    <div class="empleado-info">
                        <div class="empleado-nombre">${gasto.nombre}</div>
                        <div class="empleado-costo">$${gasto.costoPorUnidad}/u</div>
                    </div>
                    <img src="../storage/vectors/circle-check-svgrepo-com.svg" alt="" class="check-icon">
                `;
                
                // Agregar evento de clic
                gastoOption.addEventListener('click', function() {
                    toggleOtroGastoSeleccionado(index, gastoOption);
                });
                
                listaOtrosGastos.appendChild(gastoOption);
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
    const personalIndexes = Array.from(document.querySelectorAll('#listaEmpleados .empleado-option.selected')).map(option => option.dataset.index);
    const materialesIndexes = Array.from(document.querySelectorAll('#listaMateriales .empleado-option.selected')).map(option => option.dataset.index);
    const otrosGastosIndexes = Array.from(document.querySelectorAll('#listaOtrosGastos .empleado-option.selected')).map(option => option.dataset.index);
    
    let tieneErrores = false;
    
    // Validar nombre
    const errorNombre = validarNombreTarea(nombre);
    if (errorNombre) {
        document.getElementById('errorNombreTarea').textContent = '❌ ' + errorNombre;
        document.getElementById('nombreTarea').classList.add('invalid');
        tieneErrores = true;
    } else {
        document.getElementById('errorNombreTarea').textContent = '✅ Nombre válido';
        document.getElementById('nombreTarea').classList.remove('invalid');
        document.getElementById('nombreTarea').classList.add('valid');
    }
    
    // Validar duración
    const errorDuracion = validarDuracionTarea(duracion);
    if (errorDuracion) {
        document.getElementById('errorDuracionTarea').textContent = '❌ ' + errorDuracion;
        document.getElementById('duracionTarea').classList.add('invalid');
        tieneErrores = true;
    } else {
        document.getElementById('errorDuracionTarea').textContent = '✅ Duración válida';
        document.getElementById('duracionTarea').classList.remove('invalid');
        document.getElementById('duracionTarea').classList.add('valid');
    }
    
    // Si hay errores, mostrar indicador visual en lugar de alerta
    if (tieneErrores) {
        // Agregar clase de error al modal
        const modalContent = document.querySelector('#modalCrearTarea .modal-content');
        
        if (modalContent) {
            // Remover la clase si ya existe para forzar la animación
            modalContent.classList.remove('modal-error');
            
            // Forzar un reflow para asegurar que la animación se ejecute
            modalContent.offsetHeight;
            
            // Agregar la clase de error
            modalContent.classList.add('modal-error');
            
            // Remover la clase después de 3 segundos
            setTimeout(() => {
                modalContent.classList.remove('modal-error');
            }, 3000);
        }
        
        return;
    }
    
    try {
        // Obtener instancias de los recursos asignados
        let personal = [];
        let materiales = [];
        let otrosGastos = [];
        
        // Personal (múltiple)
        if (personalIndexes.length > 0) {
            const empleadosGuardados = localStorage.getItem('empleadosCreados');
            if (empleadosGuardados) {
                const empleados = JSON.parse(empleadosGuardados);
                personalIndexes.forEach(index => {
                    const empleadoData = empleados[parseInt(index)].empleado;
                    const empleado = new Personal(
                        empleadoData.nombre,
                        empleadoData.costoPorHora,
                        empleadoData.costoPorHoraExtra
                    );
                    empleado.horasTrabajadas = empleadoData.horasTrabajadas;
                    personal.push(empleado);
                });
            }
        }
        
        // Materiales (múltiples)
        if (materialesIndexes.length > 0) {
            const materialesGuardados = localStorage.getItem('materialesCreados');
            if (materialesGuardados) {
                const materialesData = JSON.parse(materialesGuardados);
                materialesIndexes.forEach(index => {
                    const materialData = materialesData[parseInt(index)].material;
                    const material = new Material(
                        materialData.nombreMaterial,
                        materialData.costoPorUnidad
                    );
                    material.inventario = materialData.inventario;
                    materiales.push(material);
                });
            }
        }
        
        // Otros gastos (múltiples)
        if (otrosGastosIndexes.length > 0) {
            const otrosGastosGuardados = localStorage.getItem('otrosGastosCreados');
            if (otrosGastosGuardados) {
                const otrosGastos_array = JSON.parse(otrosGastosGuardados);
                otrosGastosIndexes.forEach(index => {
                    const otroGastoData = otrosGastos_array[parseInt(index)].otroGasto;
                    const otroGasto = new OtrosCostos(
                        otroGastoData.nombre,
                        otroGastoData.costoPorUnidad
                    );
                    otroGasto.inventario = otroGastoData.inventario;
                    otrosGastos.push(otroGasto);
                });
            }
        }
        
        // Crear la tarea con arrays de materiales y otros gastos
        const nuevaTarea = new Tarea(nombre, personal.length > 0 ? personal : null, materiales, otrosGastos, parseFloat(duracion));
        
        // Agregar a la lista
        agregarTareaALista(nuevaTarea);
        
        // Cerrar modal
        cerrarModalCrearTarea();
        
        console.log(`✅ Tarea creada exitosamente: ${nuevaTarea.getNombre()}`);
        console.log(`Costo estimado: $${nuevaTarea.calcularCostoTotal().toFixed(2)}`);
        
    } catch (error) {
        console.error('Error al crear tarea:', error);
        
        // Mostrar error visual en el modal
        const modalContent = document.querySelector('#modalCrearTarea .modal-content');
        if (modalContent) {
            modalContent.classList.remove('modal-error');
            modalContent.offsetHeight;
            modalContent.classList.add('modal-error');
            
            setTimeout(() => {
                modalContent.classList.remove('modal-error');
            }, 3000);
        }
    }
}

// ===== FUNCIONES DE CONFIGURACIÓN GLOBAL =====

let configuracionGlobal = {
    tareas: {
        duracionMinima: 0.5,
        duracionMaxima: 40
    }
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
    validarRangoConfiguracionTareas();
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
    
    // Validar que no sean valores negativos
    if (duracionMin < 0 || duracionMax < 0) {
        console.warn("⚠️ Error: Los valores no pueden ser negativos");
        return;
    }
    
    // Validar que el mínimo no sea mayor que el máximo
    if (duracionMin >= duracionMax) {
        console.warn("⚠️ Error: La duración mínima debe ser menor que la máxima");
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
    
    console.log(`✅ Configuración de rangos para tareas aplicada exitosamente:\n` +
          `Duración: ${duracionMin} - ${duracionMax} horas\n` +
          `Los cambios se aplicarán inmediatamente en la sección de tareas.`);
}

function validarRangoConfiguracionTareas() {
    const duracionMin = parseFloat(document.getElementById('duracionMinimaTarea').value);
    const duracionMax = parseFloat(document.getElementById('duracionMaximaTarea').value);
    const btnAplicar = document.getElementById('btnAplicarConfiguracionTareas');
    
    // Validar que no sean valores negativos
    if (duracionMin < 0 || duracionMax < 0) {
        btnAplicar.disabled = true;
        return;
    }
    
    // Validar que el mínimo no sea mayor que el máximo
    if (duracionMin >= duracionMax) {
        btnAplicar.disabled = true;
        return;
    }
    
    // Si todo está bien, habilitar el botón
    btnAplicar.disabled = false;
}


// ===== FUNCIONES PARA SELECCIÓN DE EMPLEADOS =====

function toggleEmpleadoSeleccionado(index, empleadoOption) {
    const isSelected = empleadoOption.classList.contains('selected');
    
    if (isSelected) {
        // Deseleccionar
        empleadoOption.classList.remove('selected');
        removerEmpleadoTag(index);
    } else {
        // Seleccionar
        empleadoOption.classList.add('selected');
        agregarEmpleadoTag(index, empleadoOption);
    }
}

function agregarEmpleadoTag(index, empleadoOption) {
    const empleadosSeleccionadosDiv = document.getElementById('empleadosSeleccionados');
    const empleadoNombre = empleadoOption.querySelector('.empleado-nombre').textContent;
    
    const empleadoTag = document.createElement('div');
    empleadoTag.className = 'empleado-tag';
    empleadoTag.dataset.index = index;
    empleadoTag.innerHTML = `
        <span>${empleadoNombre}</span>
        <button class="remove-btn" onclick="removerEmpleadoSeleccionado('${index}')">×</button>
    `;
    empleadosSeleccionadosDiv.appendChild(empleadoTag);
}

function removerEmpleadoSeleccionado(index) {
    // Remover tag
    const empleadoTag = document.querySelector(`.empleado-tag[data-index="${index}"]`);
    if (empleadoTag) {
        empleadoTag.remove();
    }
    
    // Deseleccionar en la lista
    const empleadoOption = document.querySelector(`.empleado-option[data-index="${index}"]`);
    if (empleadoOption) {
        empleadoOption.classList.remove('selected');
    }
}

function removerEmpleadoTag(index) {
    const empleadoTag = document.querySelector(`.empleado-tag[data-index="${index}"]`);
    if (empleadoTag) {
        empleadoTag.remove();
    }
}

// ===== FUNCIONES PARA SELECCIÓN DE MATERIALES =====

function toggleMaterialSeleccionado(index, materialOption) {
    const isSelected = materialOption.classList.contains('selected');
    
    if (isSelected) {
        // Deseleccionar
        materialOption.classList.remove('selected');
        removerMaterialTag(index);
    } else {
        // Seleccionar
        materialOption.classList.add('selected');
        agregarMaterialTag(index, materialOption);
    }
}

function agregarMaterialTag(index, materialOption) {
    const materialesSeleccionadosDiv = document.getElementById('materialesSeleccionados');
    const materialNombre = materialOption.querySelector('.empleado-nombre').textContent;
    
    const materialTag = document.createElement('div');
    materialTag.className = 'empleado-tag';
    materialTag.dataset.index = index;
    materialTag.innerHTML = `
        <span>${materialNombre}</span>
        <button class="remove-btn" onclick="removerMaterialSeleccionado('${index}')">×</button>
    `;
    materialesSeleccionadosDiv.appendChild(materialTag);
}

function removerMaterialSeleccionado(index) {
    // Remover tag
    const materialTag = document.querySelector(`#materialesSeleccionados .empleado-tag[data-index="${index}"]`);
    if (materialTag) {
        materialTag.remove();
    }
    
    // Deseleccionar en la lista
    const materialOption = document.querySelector(`#listaMateriales .empleado-option[data-index="${index}"]`);
    if (materialOption) {
        materialOption.classList.remove('selected');
    }
}

function removerMaterialTag(index) {
    const materialTag = document.querySelector(`#materialesSeleccionados .empleado-tag[data-index="${index}"]`);
    if (materialTag) {
        materialTag.remove();
    }
}

// ===== FUNCIONES PARA SELECCIÓN DE OTROS GASTOS =====

function toggleOtroGastoSeleccionado(index, gastoOption) {
    const isSelected = gastoOption.classList.contains('selected');
    
    if (isSelected) {
        // Deseleccionar
        gastoOption.classList.remove('selected');
        removerOtroGastoTag(index);
    } else {
        // Seleccionar
        gastoOption.classList.add('selected');
        agregarOtroGastoTag(index, gastoOption);
    }
}

function agregarOtroGastoTag(index, gastoOption) {
    const otrosGastosSeleccionadosDiv = document.getElementById('otrosGastosSeleccionados');
    const gastoNombre = gastoOption.querySelector('.empleado-nombre').textContent;
    
    const gastoTag = document.createElement('div');
    gastoTag.className = 'empleado-tag';
    gastoTag.dataset.index = index;
    gastoTag.innerHTML = `
        <span>${gastoNombre}</span>
        <button class="remove-btn" onclick="removerOtroGastoSeleccionado('${index}')">×</button>
    `;
    otrosGastosSeleccionadosDiv.appendChild(gastoTag);
}

function removerOtroGastoSeleccionado(index) {
    // Remover tag
    const gastoTag = document.querySelector(`#otrosGastosSeleccionados .empleado-tag[data-index="${index}"]`);
    if (gastoTag) {
        gastoTag.remove();
    }
    
    // Deseleccionar en la lista
    const gastoOption = document.querySelector(`#listaOtrosGastos .empleado-option[data-index="${index}"]`);
    if (gastoOption) {
        gastoOption.classList.remove('selected');
    }
}

function removerOtroGastoTag(index) {
    const gastoTag = document.querySelector(`#otrosGastosSeleccionados .empleado-tag[data-index="${index}"]`);
    if (gastoTag) {
        gastoTag.remove();
    }
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
    
    // Cerrar modales con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modalCrearTarea = document.getElementById('modalCrearTarea');
            const modalConfiguracion = document.getElementById('modalConfiguracion');
            const modalConfirmacionEliminarTarea = document.getElementById('modalConfirmacionEliminarTarea');
            
            if (modalCrearTarea.style.display === 'block') {
                cerrarModalCrearTarea();
            }
            
            if (modalConfiguracion.style.display === 'block') {
                cerrarModalConfiguracion();
            }
            
            if (modalConfirmacionEliminarTarea.style.display === 'block') {
                cerrarModalConfirmacionEliminarTarea();
            }
        }
    });

    // Cerrar modales al hacer clic fuera de ellos
    window.onclick = function(event) {
        const modalCrearTarea = document.getElementById('modalCrearTarea');
        const modalConfiguracion = document.getElementById('modalConfiguracion');
        const modalConfirmacionEliminarTarea = document.getElementById('modalConfirmacionEliminarTarea');
        
        if (event.target === modalCrearTarea) {
            cerrarModalCrearTarea();
        }
        
        if (event.target === modalConfiguracion) {
            cerrarModalConfiguracion();
        }
        
        if (event.target === modalConfirmacionEliminarTarea) {
            cerrarModalConfirmacionEliminarTarea();
        }
    };

});