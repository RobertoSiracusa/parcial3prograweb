// ===== SISTEMA DE GESTIÓN DE EMPLEADOS =====
// Array global para almacenar todos los empleados creados
let empleadosCreados = [];

// Función para verificar si un empleado está siendo usado en tareas activas
function verificarEmpleadoEnTareasActivas(nombreEmpleado) {
    try {
        const tareasGuardadas = localStorage.getItem('tareasCreadas');
        if (!tareasGuardadas) return null;
        
        const tareas = JSON.parse(tareasGuardadas);
        const tareasActivas = [];
        
        tareas.forEach((item, index) => {
            const tarea = item.tarea;
            const estado = tarea.estado;
            
            // Verificar si la tarea está pendiente o en progreso
            if (estado === 'pendiente' || estado === 'en progreso') {
                // Verificar si el empleado está asignado a esta tarea
                if (tarea.personal && Array.isArray(tarea.personal)) {
                    const empleadoAsignado = tarea.personal.find(emp => emp.nombre === nombreEmpleado);
                    if (empleadoAsignado) {
                        tareasActivas.push({
                            nombre: tarea.nombre,
                            estado: estado,
                            index: index
                        });
                    }
                }
            }
        });
        
        return tareasActivas.length > 0 ? tareasActivas : null;
    } catch (error) {
        console.error('Error al verificar empleado en tareas:', error);
        return null;
    }
}

// Función para mostrar advertencia cuando un empleado está en tareas activas
function mostrarAdvertenciaEmpleadoEnTareas(nombreEmpleado, tareasActivas) {
    const tareasList = tareasActivas.map(tarea => 
        `• "${tarea.nombre}" (${tarea.estado})`
    ).join('\n');
    
    const mensaje = `No se puede eliminar al empleado "${nombreEmpleado}" porque está asignado a las siguientes tareas activas:\n\n${tareasList}\n\nPara poder eliminar este empleado, primero debe completar o cancelar estas tareas.`;
    
    // Actualizar el mensaje en el modal
    document.getElementById('mensajeAdvertenciaEmpleadoEnTareas').textContent = mensaje;
    
    // Mostrar el modal de advertencia
    document.getElementById('modalAdvertenciaEmpleadoEnTareas').style.display = 'block';
}

// Función para cerrar el modal de advertencia
function cerrarModalAdvertenciaEmpleadoEnTareas() {
    document.getElementById('modalAdvertenciaEmpleadoEnTareas').style.display = 'none';
}

// Funciones para persistencia de datos
function guardarEmpleadosEnStorage() {
    try {
        localStorage.setItem('empleadosCreados', JSON.stringify(empleadosCreados));
        console.log('✅ Empleados guardados en localStorage');
    } catch (error) {
        console.error('❌ Error al guardar empleados:', error);
    }
}

function cargarEmpleadosDesdeStorage() {
    try {
        const empleadosGuardados = localStorage.getItem('empleadosCreados');
        if (empleadosGuardados) {
            const datosEmpleados = JSON.parse(empleadosGuardados);
            empleadosCreados = [];
            
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
            
            console.log(`✅ Cargados ${empleadosCreados.length} empleados desde localStorage`);
            actualizarListaEmpleados();
            actualizarContadorEmpleados();
        }
    } catch (error) {
        console.error('❌ Error al cargar empleados:', error);
        empleadosCreados = [];
    }
}

// Función para actualizar el contador de empleados en el botón
function actualizarContadorEmpleados() {
    document.getElementById('contadorEmpleados').textContent = empleadosCreados.length;
}

// Función para obtener el siguiente ID disponible
function obtenerSiguienteID() {
    if (empleadosCreados.length === 0) {
        return 1;
    }
    
    // Obtener todos los IDs existentes
    const idsExistentes = empleadosCreados.map(item => item.id).sort((a, b) => a - b);
    
    // Encontrar el primer ID faltante
    let siguienteID = 1;
    for (let id of idsExistentes) {
        if (id !== siguienteID) {
            break;
        }
        siguienteID++;
    }
    
    return siguienteID;
}

// Función para agregar empleado a la lista
function agregarEmpleadoALista(empleado) {
    const siguienteID = obtenerSiguienteID();
    empleadosCreados.push({
        empleado: empleado,
        fechaCreacion: new Date(),
        id: siguienteID
    });
    console.log(` Empleado agregado a la lista: ${empleado.getNombre()} con ID: ${siguienteID}`);
    guardarEmpleadosEnStorage(); // Guardar en localStorage
    actualizarContadorEmpleados();
    actualizarListaEmpleados(); // Actualizar automáticamente la lista en la página
}

// Función para actualizar la lista de empleados en la ventana
function actualizarListaEmpleados() {
    const estadisticasDiv = document.getElementById('estadisticasEmpleados');
    const listaDiv = document.getElementById('listaEmpleados');
    
    if (empleadosCreados.length === 0) {
        estadisticasDiv.innerHTML = '<p class="empty-stats"> No hay empleados creados aún</p>';
        listaDiv.innerHTML = '<p class="empty-state">Crea tu primer empleado usando los botones de arriba</p>';
        return;
    }
    
    // Calcular estadísticas
    const totalEmpleados = empleadosCreados.length;
    const costoPromedioHora = empleadosCreados.reduce((sum, item) => sum + item.empleado.getCostoPorHora(), 0) / totalEmpleados;
    const costoPromedioExtra = empleadosCreados.reduce((sum, item) => sum + item.empleado.getCostoPorHoraExtra(), 0) / totalEmpleados;
    const totalHorasTrabajadas = empleadosCreados.reduce((sum, item) => sum + item.empleado.getHorasTrabajadas(), 0);
    
    // Mostrar estadísticas
    estadisticasDiv.innerHTML = `
        <h3 class="stats-title"><img src="../storage/vectors/stats-svgrepo-com.svg" alt="" class="stats-icon-large">Estadísticas Generales</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value success">${totalEmpleados}</div>
                <div class="stat-label">Total Empleados</div>
            </div>
            <div class="stat-card">
                <div class="stat-value primary">$${costoPromedioHora.toFixed(2)}</div>
                <div class="stat-label">Promedio Costo/Hora</div>
            </div>
            <div class="stat-card">
                <div class="stat-value purple">$${costoPromedioExtra.toFixed(2)}</div>
                <div class="stat-label">Promedio Extra/Hora</div>
            </div>
            <div class="stat-card">
                <div class="stat-value warning">${totalHorasTrabajadas}h</div>
                <div class="stat-label">Total Horas Trabajadas</div>
            </div>
        </div>
    `;
    
    // Mostrar lista de empleados
    let listaHTML = '<h3 class="employees-title"><img src="../storage/vectors/user-svgrepo-com.svg" alt="" class="user-icon-large">Lista Detallada</h3>';
    
    empleadosCreados.forEach((item, index) => {
        const empleado = item.empleado;
        const info = empleado.obtenerInformacion();
        const fechaFormateada = item.fechaCreacion.toLocaleString('es-ES');
        
        listaHTML += `
            <div class="employee-card">
                <div class="employee-header">
                    <h4 class="employee-name"><img src="../storage/vectors/user-list-svgrepo-com.svg" alt="" class="user-list-icon-large"> ${info.nombre}</h4>
                    <span class="employee-id">ID: ${item.id}</span>
                </div>
                
                <div class="employee-details">
                    <div class="employee-detail"><strong><img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Costo/Hora:</strong> $${info.costoPorHora.toFixed(2)}</div>
                    <div class="employee-detail"><strong><img src="../storage/vectors/alarm-exclamation-svgrepo-com.svg" alt="" class="alarm-exclamation-icon"> Extra/Hora:</strong> $${info.costoPorHoraExtra.toFixed(2)}</div>
                    <div class="employee-detail"><strong><img src="../storage/vectors/clock-svgrepo-com.svg" alt="" class="clock-icon"> Horas:</strong> ${info.horasTrabajadas}h</div>
                    <div class="employee-detail"><strong><img src="../storage/vectors/circle-dollar-svgrepo-com.svg" alt="" class="circle-dollar-icon"> Salario Total:</strong> $${info.salarioTotal.toFixed(2)}</div>
                </div>
                
                <div class="employee-date">
                    <img src="../storage/vectors/coins-svgrepo-com.svg" alt="" class="coins-icon"> Creado: ${fechaFormateada}
                </div>
                
                <div class="employee-actions">
                    <button onclick="eliminarEmpleado(${index})" class="button button-danger">
                        <img src="../storage/vectors/trash-svgrepo-com.svg" alt="" class="button-icon">Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    listaDiv.innerHTML = listaHTML;
}

// Función para eliminar un empleado específico
// Variable global para almacenar el índice del empleado a eliminar
let empleadoAEliminarIndex = -1;

function eliminarEmpleado(index) {
    const nombreEmpleado = empleadosCreados[index].empleado.getNombre();
    
    // Verificar si el empleado está siendo usado en tareas activas
    const tareasActivas = verificarEmpleadoEnTareasActivas(nombreEmpleado);
    
    if (tareasActivas) {
        // El empleado está siendo usado en tareas activas, mostrar advertencia
        mostrarAdvertenciaEmpleadoEnTareas(nombreEmpleado, tareasActivas);
        return;
    }
    
    // Si no está siendo usado, proceder con la eliminación normal
    empleadoAEliminarIndex = index;
    
    // Actualizar el mensaje de confirmación
    document.getElementById('mensajeConfirmacionEliminar').textContent = 
        `¿Está seguro de que desea eliminar a ${nombreEmpleado}?`;
    
    // Mostrar el modal de confirmación
    document.getElementById('modalConfirmacionEliminar').style.display = 'block';
}

function cerrarModalConfirmacionEliminar() {
    document.getElementById('modalConfirmacionEliminar').style.display = 'none';
    empleadoAEliminarIndex = -1;
}

function confirmarEliminacionEmpleado() {
    if (empleadoAEliminarIndex === -1) {
        console.error('No hay empleado seleccionado para eliminar');
        return;
    }
    
    const nombreEliminado = empleadosCreados[empleadoAEliminarIndex].empleado.getNombre();
    empleadosCreados.splice(empleadoAEliminarIndex, 1);
    guardarEmpleadosEnStorage(); // Guardar cambios en localStorage
    console.log(`❌ Empleado eliminado: ${nombreEliminado}`);
    actualizarListaEmpleados();
    actualizarContadorEmpleados();
    
    // Cerrar el modal
    cerrarModalConfirmacionEliminar();
}

// Función para limpiar toda la lista
function limpiarListaEmpleados() {
    if (empleadosCreados.length === 0) {
        console.log('📭 La lista ya está vacía');
        return;
    }
    
    empleadosCreados = [];
    guardarEmpleadosEnStorage(); // Guardar cambios en localStorage
    actualizarListaEmpleados();
    actualizarContadorEmpleados();
    console.log('✅ Lista de empleados limpiada exitosamente');
}



// ===== GESTIÓN DE MODALES =====

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modalCrearEmpleado = document.getElementById('modalCrearEmpleado');
    const modalConfiguracion = document.getElementById('modalConfiguracion');
    const modalConfirmacionEliminar = document.getElementById('modalConfirmacionEliminar');
    const modalAdvertenciaEmpleadoEnTareas = document.getElementById('modalAdvertenciaEmpleadoEnTareas');
    
    if (event.target === modalCrearEmpleado) {
        cerrarModalCrearEmpleado();
    }
    if (event.target === modalConfiguracion) {
        cerrarModalConfiguracion();
    }
    if (event.target === modalConfirmacionEliminar) {
        cerrarModalConfirmacionEliminar();
    }
    if (event.target === modalAdvertenciaEmpleadoEnTareas) {
        cerrarModalAdvertenciaEmpleadoEnTareas();
    }
}

// ===== FUNCIONES DE RANGO Y VALIDACIÓN =====

// Obtener los rangos específicos desde la configuración global
function obtenerRangos(tipoRango = 'costoPorHora') {
    // Cargar rangos desde localStorage si existen, sino usar configuración global
    const rangosGuardados = localStorage.getItem('rangosEspecificos');
    let rangos;
    
    if (rangosGuardados) {
        try {
            rangos = JSON.parse(rangosGuardados);
        } catch (error) {
            rangos = configuracionGlobal.rangos;
        }
    } else {
        rangos = configuracionGlobal.rangos;
    }
    
    // Obtener el rango específico solicitado
    const rangoEspecifico = rangos[tipoRango];
    if (!rangoEspecifico) {
        console.warn(`Tipo de rango '${tipoRango}' no encontrado. Usando costoPorHora por defecto.`);
        return rangos.costoPorHora || { minimo: 1, maximo: 100 };
    }
    
    const minimo = rangoEspecifico.minimo || 1;
    const maximo = rangoEspecifico.maximo || 100;
    
    if (minimo >= maximo) {
        alert("⚠️ Error: El valor mínimo debe ser menor que el máximo");
        return null;
    }
    
    return { minimo, maximo };
}



// ===== MODAL DE CREAR EMPLEADO =====

// Función para abrir el modal de crear empleado
function crearEmpleadoPersonalizado() {
    const rangosCostoPorHora = obtenerRangos('costoPorHora');
    const rangosCostoPorHoraExtra = obtenerRangos('costoPorHoraExtra');
    if (!rangosCostoPorHora || !rangosCostoPorHoraExtra) return;
    
    // Actualizar información de rangos en el modal
    document.getElementById('rangoInfoEmpleado').innerHTML = 
        `Costo/Hora: $${rangosCostoPorHora.minimo.toFixed(2)} - $${rangosCostoPorHora.maximo.toFixed(2)}<br>` +
        `Hora Extra: $${rangosCostoPorHoraExtra.minimo.toFixed(2)} - $${rangosCostoPorHoraExtra.maximo.toFixed(2)}`;
    
    // Limpiar formulario y abrir modal
    limpiarFormularioEmpleado();
    document.getElementById('modalCrearEmpleado').style.display = 'block';
}

// Función para cerrar el modal de crear empleado
function cerrarModalCrearEmpleado() {
    document.getElementById('modalCrearEmpleado').style.display = 'none';
    limpiarFormularioEmpleado();
}

// Función para limpiar el formulario
function limpiarFormularioEmpleado() {
    document.getElementById('nombreEmpleado').value = '';
    document.getElementById('costoPorHora').value = '';
    document.getElementById('costoPorHoraExtra').value = '';
    
    // Limpiar mensajes de error
    document.getElementById('errorNombre').textContent = '';
    document.getElementById('errorCostoHora').textContent = '';
    document.getElementById('errorCostoHoraExtra').textContent = '';
    
    // Limpiar clases CSS de validación
    document.getElementById('nombreEmpleado').classList.remove('valid', 'invalid');
    document.getElementById('costoPorHora').classList.remove('valid', 'invalid');
    document.getElementById('costoPorHoraExtra').classList.remove('valid', 'invalid');
}

// ===== VALIDACIÓN DE FORMULARIOS =====

// Función para validar el nombre
function validarNombreEmpleado(nombre) {
    if (!nombre.trim()) {
        return "El nombre no puede estar vacío";
    }
    
    // Validar que solo contenga letras y espacios
    const soloLetrasYEspacios = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetrasYEspacios.test(nombre)) {
        return "El nombre solo puede contener letras y espacios";
    }
    
    return null; // Sin errores
}

// Función para validar costos con rangos específicos
function validarCosto(costo, tipo, tipoRango) {
    const rangos = obtenerRangos(tipoRango);
    if (!rangos) return "Error al obtener rangos de configuración";
    
    if (isNaN(costo) || costo <= 0) {
        return `El ${tipo} debe ser un número positivo`;
    }
    
    if (costo < rangos.minimo || costo > rangos.maximo) {
        return `El ${tipo} debe estar entre $${rangos.minimo.toFixed(2)} y $${rangos.maximo.toFixed(2)}`;
    }
    
    return null; // Sin errores
}

// Función para validar y crear empleado
function validarYCrearEmpleado() {
    const nombre = document.getElementById('nombreEmpleado').value;
    const costoPorHora = parseFloat(document.getElementById('costoPorHora').value);
    const costoPorHoraExtra = parseFloat(document.getElementById('costoPorHoraExtra').value);
    
    let tieneErrores = false;
    
    // Validar nombre
    const errorNombre = validarNombreEmpleado(nombre);
    if (errorNombre) {
        document.getElementById('errorNombre').textContent = '❌ ' + errorNombre;
        tieneErrores = true;
    } else {
        document.getElementById('errorNombre').textContent = '✅ Nombre válido';
    }
    
    // Validar costo por hora
    const errorCostoHora = validarCosto(costoPorHora, 'costo por hora', 'costoPorHora');
    if (errorCostoHora) {
        document.getElementById('errorCostoHora').textContent = '❌ ' + errorCostoHora;
        tieneErrores = true;
    } else {
        document.getElementById('errorCostoHora').textContent = '✅ Costo válido';
    }
    
    // Validar costo por hora extra
    const errorCostoHoraExtra = validarCosto(costoPorHoraExtra, 'costo por hora extra', 'costoPorHoraExtra');
    if (errorCostoHoraExtra) {
        document.getElementById('errorCostoHoraExtra').textContent = '❌ ' + errorCostoHoraExtra;
        tieneErrores = true;
    } else {
        document.getElementById('errorCostoHoraExtra').textContent = '✅ Costo válido';
    }
    
    // Si hay errores, mostrar indicador visual en lugar de alerta
    if (tieneErrores) {
        // Agregar clase de error al modal
        const modalContent = document.querySelector('#modalCrearEmpleado .modal-content');
        
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
    
    // Crear empleado
    try {
        const rangosCostoPorHora = obtenerRangos('costoPorHora');
        const rangosCostoPorHoraExtra = obtenerRangos('costoPorHoraExtra');
        console.log("=== CREANDO EMPLEADO DESDE MODAL ===");
        console.log(`Rango costo/hora: $${rangosCostoPorHora.minimo} - $${rangosCostoPorHora.maximo}`);
        console.log(`Rango costo/hora extra: $${rangosCostoPorHoraExtra.minimo} - $${rangosCostoPorHoraExtra.maximo}`);
        console.log(`Datos ingresados: ${nombre}, $${costoPorHora}, $${costoPorHoraExtra} (horas: 0)`);
        
        // Usar el rango mínimo más estricto para validación en el constructor
        const rangoMinimoGeneral = Math.min(rangosCostoPorHora.minimo, rangosCostoPorHoraExtra.minimo);
        const rangoMaximoGeneral = Math.max(rangosCostoPorHora.maximo, rangosCostoPorHoraExtra.maximo);
        const empleado = new Personal(nombre, costoPorHora, costoPorHoraExtra, rangoMinimoGeneral, rangoMaximoGeneral);
        
        console.log("✅ Empleado creado exitosamente:", empleado.toString());
        agregarEmpleadoALista(empleado);
        
        // Cerrar modal
        cerrarModalCrearEmpleado();
        
    } catch (error) {
        console.error("❌ Error al crear empleado:", error.message);
        alert("❌ Error al crear empleado: " + error.message);
    }
}

// ===== CONFIGURACIÓN GLOBAL =====

let configuracionGlobal = {
    rangos: { 
        costoPorHora: { minimo: 1, maximo: 100 },
        costoPorHoraExtra: { minimo: 1, maximo: 150 },
        costoPorUnidad: { minimo: 1, maximo: 1000 },
        costoOtrosGastos: { minimo: 1, maximo: 500 }
    },
    validacion: { estricta: true, mostrarConsejos: true, caracteresProhibidos: `!"·$%&/()=?¿'¡+\`*]^[´.:,;-_{}<>\`~\\|` }
};

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
            configuracionGlobal = { ...configuracionGlobal, ...JSON.parse(configGuardada) };
        } catch (error) {
            console.warn('Error al cargar configuración guardada:', error);
        }
    }
}

function actualizarInterfazConfiguracion() {
    cargarConfiguracionGlobal();
    
    // Cargar valores de rangos específicos para empleados únicamente
    document.getElementById('costoPorHoraMin').value = configuracionGlobal.rangos.costoPorHora.minimo;
    document.getElementById('costoPorHoraMax').value = configuracionGlobal.rangos.costoPorHora.maximo;
    document.getElementById('costoPorHoraExtraMin').value = configuracionGlobal.rangos.costoPorHoraExtra.minimo;
    document.getElementById('costoPorHoraExtraMax').value = configuracionGlobal.rangos.costoPorHoraExtra.maximo;
    
    actualizarRangosActualesMostrados();
}

function actualizarRangosActualesMostrados() {
    const costoPorHoraMin = parseFloat(document.getElementById('costoPorHoraMin').value) || 1;
    const costoPorHoraMax = parseFloat(document.getElementById('costoPorHoraMax').value) || 100;
    const costoPorHoraExtraMin = parseFloat(document.getElementById('costoPorHoraExtraMin').value) || 1;
    const costoPorHoraExtraMax = parseFloat(document.getElementById('costoPorHoraExtraMax').value) || 150;
    
    document.getElementById('rangosActuales').innerHTML = `
        <strong>Rangos configurados:</strong><br>
        Costo/Hora: $${costoPorHoraMin.toFixed(2)} - $${costoPorHoraMax.toFixed(2)}<br>
        Hora Extra: $${costoPorHoraExtraMin.toFixed(2)} - $${costoPorHoraExtraMax.toFixed(2)}
    `;
}

function aplicarConfiguracionRangosEmpleados() {
    const costoPorHoraMin = parseFloat(document.getElementById('costoPorHoraMin').value);
    const costoPorHoraMax = parseFloat(document.getElementById('costoPorHoraMax').value);
    const costoPorHoraExtraMin = parseFloat(document.getElementById('costoPorHoraExtraMin').value);
    const costoPorHoraExtraMax = parseFloat(document.getElementById('costoPorHoraExtraMax').value);
    
    // Validar rangos de empleados únicamente
    if (costoPorHoraMin >= costoPorHoraMax) {
        // Mostrar error visual en el campo
        const input = document.getElementById('costoPorHoraMax');
        input.classList.add('invalid');
        input.style.borderColor = '#e74c3c';
        return;
    }
    if (costoPorHoraExtraMin >= costoPorHoraExtraMax) {
        // Mostrar error visual en el campo
        const input = document.getElementById('costoPorHoraExtraMax');
        input.classList.add('invalid');
        input.style.borderColor = '#e74c3c';
        return;
    }
    
    // Actualizar solo los rangos de empleados en la configuración global
    configuracionGlobal.rangos.costoPorHora.minimo = costoPorHoraMin;
    configuracionGlobal.rangos.costoPorHora.maximo = costoPorHoraMax;
    configuracionGlobal.rangos.costoPorHoraExtra.minimo = costoPorHoraExtraMin;
    configuracionGlobal.rangos.costoPorHoraExtra.maximo = costoPorHoraExtraMax;
    
    // Guardar en localStorage
    localStorage.setItem('configuracionSistema', JSON.stringify(configuracionGlobal));
    localStorage.setItem('rangosEspecificos', JSON.stringify(configuracionGlobal.rangos));
    
    actualizarRangosActualesMostrados();
    
    // Mostrar confirmación visual
    const inputs = [
        document.getElementById('costoPorHoraMin'),
        document.getElementById('costoPorHoraMax'),
        document.getElementById('costoPorHoraExtraMin'),
        document.getElementById('costoPorHoraExtraMax')
    ];
    
    inputs.forEach(input => {
        input.classList.remove('invalid');
        input.classList.add('valid');
        input.style.borderColor = '#27ae60';
    });
    
    // Cerrar el modal después de un breve delay
    setTimeout(() => {
        cerrarModalConfiguracion();
    }, 1000);
}

// ===== INICIALIZACIÓN DEL SISTEMA =====

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Sistema iniciado sin datos precargados
    console.log("🚀 Sistema de Gestión de Empleados iniciado");
    console.log("📚 Clases cargadas: Personal, Material, OtrosCostos");
    console.log("💡 Usa los botones para crear empleados y gestionar rangos de costos");
    
    // Cargar configuración global al iniciar
    cargarConfiguracionGlobal();
    console.log("Configuración de rangos cargada desde configuración global");
    
    // Cargar empleados guardados al iniciar
    cargarEmpleadosDesdeStorage();
    console.log(`Empleados en la lista: ${empleadosCreados.length}`);
    
    // Mostrar lista inicial de empleados (vacía al principio)
    actualizarListaEmpleados();
    
    // ===== VALIDACIÓN EN TIEMPO REAL =====
    
    // Agregar validación en tiempo real al modal de crear empleado
    document.getElementById('nombreEmpleado').addEventListener('input', function() {
        const nombre = this.value;
        const error = validarNombreEmpleado(nombre);
        const errorElement = document.getElementById('errorNombre');
        
        if (nombre === '') {
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
    
    document.getElementById('costoPorHora').addEventListener('input', function() {
        const costo = parseFloat(this.value);
        const error = validarCosto(costo, 'costo por hora', 'costoPorHora');
        const errorElement = document.getElementById('errorCostoHora');
        
        if (this.value === '') {
            errorElement.textContent = '';
            this.classList.remove('valid', 'invalid');
        } else if (error) {
            errorElement.textContent = '❌ ' + error;
            this.classList.remove('valid');
            this.classList.add('invalid');
        } else {
            errorElement.textContent = '✅ Costo válido';
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });
    
    document.getElementById('costoPorHoraExtra').addEventListener('input', function() {
        const costo = parseFloat(this.value);
        const error = validarCosto(costo, 'costo por hora extra', 'costoPorHoraExtra');
        const errorElement = document.getElementById('errorCostoHoraExtra');
        
        if (this.value === '') {
            errorElement.textContent = '';
            this.classList.remove('valid', 'invalid');
        } else if (error) {
            errorElement.textContent = '❌ ' + error;
            this.classList.remove('valid');
            this.classList.add('invalid');
        } else {
            errorElement.textContent = '✅ Costo válido';
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });
    
    // ===== FUNCIONALIDAD DE TECLA ENTER =====
    
    // Permitir crear empleado con Enter en los campos del formulario
    function handleEnterKey(event) {
        if (event.key === 'Enter') {
            validarYCrearEmpleado();
        }
    }
    
    document.getElementById('nombreEmpleado').addEventListener('keypress', handleEnterKey);
    document.getElementById('costoPorHora').addEventListener('keypress', handleEnterKey);
    document.getElementById('costoPorHoraExtra').addEventListener('keypress', handleEnterKey);
    
    // ===== CERRAR MODALES CON TECLA ESCAPE =====
    
    // Cerrar modales con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modalCrearEmpleado = document.getElementById('modalCrearEmpleado');
            const modalConfiguracion = document.getElementById('modalConfiguracion');
            const modalConfirmacionEliminar = document.getElementById('modalConfirmacionEliminar');
            const modalAdvertenciaEmpleadoEnTareas = document.getElementById('modalAdvertenciaEmpleadoEnTareas');
            
            if (modalCrearEmpleado.style.display === 'block') {
                cerrarModalCrearEmpleado();
            }
            
            if (modalConfiguracion.style.display === 'block') {
                cerrarModalConfiguracion();
            }
            
            if (modalConfirmacionEliminar.style.display === 'block') {
                cerrarModalConfirmacionEliminar();
            }
            
            if (modalAdvertenciaEmpleadoEnTareas.style.display === 'block') {
                cerrarModalAdvertenciaEmpleadoEnTareas();
            }
        }
    });
});