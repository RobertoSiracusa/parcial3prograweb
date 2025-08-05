// ===== SISTEMA DE GESTIÓN DE OTROS GASTOS =====
// Array global para almacenar todos los otros gastos creados
let otrosGastosCreados = [];

// Función para verificar si un otro gasto está siendo usado en tareas activas
function verificarOtroGastoEnTareasActivas(nombreOtroGasto) {
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
                // Verificar si el otro gasto está asignado a esta tarea
                if (tarea.otrosGastos && Array.isArray(tarea.otrosGastos)) {
                    const otroGastoAsignado = tarea.otrosGastos.find(gasto => gasto.nombre === nombreOtroGasto);
                    if (otroGastoAsignado) {
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
        console.error('Error al verificar otro gasto en tareas:', error);
        return null;
    }
}

// Función para mostrar advertencia cuando un otro gasto está en tareas activas
function mostrarAdvertenciaOtroGastoEnTareas(nombreOtroGasto, tareasActivas) {
    const tareasList = tareasActivas.map(tarea => 
        `• "${tarea.nombre}" (${tarea.estado})`
    ).join('\n');
    
    const mensaje = `No se puede eliminar el gasto "${nombreOtroGasto}" porque está asignado a las siguientes tareas activas:\n\n${tareasList}\n\nPara poder eliminar este gasto, primero debe completar o cancelar estas tareas.`;
    
    // Actualizar el mensaje en el modal
    document.getElementById('mensajeAdvertenciaOtroGastoEnTareas').textContent = mensaje;
    
    // Mostrar el modal de advertencia
    document.getElementById('modalAdvertenciaOtroGastoEnTareas').style.display = 'block';
}

// Función para cerrar el modal de advertencia
function cerrarModalAdvertenciaOtroGastoEnTareas() {
    document.getElementById('modalAdvertenciaOtroGastoEnTareas').style.display = 'none';
}

// Variables para el modal de confirmación de eliminación
let otroGastoAEliminarIndex = -1;

// Funciones para persistencia de datos
function guardarOtrosGastosEnStorage() {
    try {
        localStorage.setItem('otrosGastosCreados', JSON.stringify(otrosGastosCreados));
        console.log('✅ Otros gastos guardados en localStorage');
    } catch (error) {
        console.error('❌ Error al guardar otros gastos:', error);
    }
}

function cargarOtrosGastosDesdeStorage() {
    try {
        const otrosGastosGuardados = localStorage.getItem('otrosGastosCreados');
        if (otrosGastosGuardados) {
            const datosOtrosGastos = JSON.parse(otrosGastosGuardados);
            otrosGastosCreados = [];
            
            // Recrear instancias de la clase OtrosGastos
            datosOtrosGastos.forEach(item => {
                const otroGastoData = item.otroGasto;
                // Recrear la instancia de OtrosGastos con los datos guardados
                const otroGastoRecreado = new OtrosGastos(
                    otroGastoData.nombre,
                    otroGastoData.costoPorUnidad,
                    otroGastoData.descripcion || ''
                );
                
                otrosGastosCreados.push({
                    otroGasto: otroGastoRecreado,
                    fechaCreacion: new Date(item.fechaCreacion),
                    id: item.id
                });
            });
            
            console.log(`✅ Cargados ${otrosGastosCreados.length} otros gastos desde localStorage`);
            actualizarListaOtrosGastos();
            actualizarContadorOtrosGastos();
        }
    } catch (error) {
        console.error('❌ Error al cargar otros gastos:', error);
        otrosGastosCreados = [];
    }
}

// Función para actualizar el contador de otros gastos
function actualizarContadorOtrosGastos() {
    document.getElementById('contadorOtrosGastos').textContent = otrosGastosCreados.length;
}

// Función para agregar otro gasto a la lista
function agregarOtroGastoALista(otroGasto) {
    otrosGastosCreados.push({
        otroGasto: otroGasto,
        fechaCreacion: new Date(),
        id: otrosGastosCreados.length + 1
    });
    console.log(`✅ Otro gasto agregado a la lista: ${otroGasto.getNombre()}`);
    guardarOtrosGastosEnStorage(); // Guardar en localStorage
    actualizarContadorOtrosGastos();
    actualizarListaOtrosGastos(); // Actualizar automáticamente la lista en la página
}

// Función para actualizar la lista de otros gastos en la página
function actualizarListaOtrosGastos() {
    const estadisticasDiv = document.getElementById('estadisticasOtrosGastos');
    const listaDiv = document.getElementById('listaOtrosGastos');
    
    if (otrosGastosCreados.length === 0) {
        estadisticasDiv.innerHTML = '<p class="empty-stats"> No hay otros gastos creados aún</p>';
        listaDiv.innerHTML = '<p class="empty-state">Crea tu primer otro gasto usando los botones de arriba</p>';
        return;
    }
    
    // Calcular estadísticas
    const totalOtrosGastos = otrosGastosCreados.length;
    const costoPromedioUnidad = otrosGastosCreados.reduce((sum, item) => sum + item.otroGasto.getCostoPorUnidad(), 0) / totalOtrosGastos;
    const costoTotalProyecto = otrosGastosCreados.reduce((sum, item) => sum + item.otroGasto.getCostoPorUnidad(), 0);
    
    // Mostrar estadísticas con el formato correcto
    estadisticasDiv.innerHTML = `
        <h3 class="stats-title"><img src="../storage/vectors/stats-svgrepo-com.svg" alt="" class="stats-icon-large">Estadísticas Generales</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value success">${totalOtrosGastos}</div>
                <div class="stat-label">Total Otros Gastos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value primary">$${costoPromedioUnidad.toFixed(2)}</div>
                <div class="stat-label">Promedio Costo</div>
            </div>
            <div class="stat-card">
                <div class="stat-value purple">$${costoTotalProyecto.toFixed(2)}</div>
                <div class="stat-label">Costo Total del Proyecto</div>
            </div>
            <div class="stat-card">
                <div class="stat-value warning">${totalOtrosGastos}</div>
                <div class="stat-label">Total Gastos Generales</div>
            </div>
        </div>
    `;
    
    // Mostrar lista de otros gastos con formato horizontal
    listaDiv.innerHTML = otrosGastosCreados.map((item, index) => {
        const otroGasto = item.otroGasto;
        const fecha = item.fechaCreacion.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
                 return `
             <div class="employee-card">
                 <div class="employee-header">
                     <h4 class="employee-name"><img src="../storage/vectors/briefcase-svgrepo-com.svg" alt="" class="briefcase-icon-large"> ${otroGasto.getNombre()}</h4>
                     <span class="employee-id">ID: ${item.id}</span>
                 </div>
                 
                 <div class="employee-details">
                     <div class="employee-detail"><strong><img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Costo:</strong> $${otroGasto.getCostoPorUnidad().toFixed(2)}</div>
                     ${otroGasto.getDescripcion() ? `
                     <div class="employee-detail"><strong><img src="../storage/vectors/align-right-svgrepo-com.svg" alt="" class="align-right-icon"> Descripción:</strong> ${otroGasto.getDescripcion()}</div>
                     ` : ''}
                 </div>
                 
                 <div class="employee-date">
                     <img src="../storage/vectors/coins-svgrepo-com.svg" alt="" class="coins-icon"> Creado: ${fecha}
                 </div>
                 
                 <div class="employee-actions">
                     <button onclick="eliminarOtroGasto(${index})" class="button button-danger">
                         <img src="../storage/vectors/trash-svgrepo-com.svg" alt="" class="button-icon">Eliminar
                     </button>
                 </div>
             </div>
         `;
    }).join('');
}



// Función para eliminar un otro gasto específico
function eliminarOtroGasto(index) {
    const nombreOtroGasto = otrosGastosCreados[index].otroGasto.getNombre();
    
    // Verificar si el otro gasto está siendo usado en tareas activas
    const tareasActivas = verificarOtroGastoEnTareasActivas(nombreOtroGasto);
    
    if (tareasActivas) {
        // El otro gasto está siendo usado en tareas activas, mostrar advertencia
        mostrarAdvertenciaOtroGastoEnTareas(nombreOtroGasto, tareasActivas);
        return;
    }
    
    // Si no está siendo usado, proceder con la eliminación normal
    otroGastoAEliminarIndex = index;
    
    // Abrir el modal de confirmación
    const modal = document.getElementById('modalConfirmacionEliminarOtroGasto');
    modal.style.display = 'block';
}

// Función para limpiar toda la lista
function limpiarListaOtrosGastos() {
    otrosGastosCreados = [];
    guardarOtrosGastosEnStorage(); // Guardar cambios en localStorage
    actualizarListaOtrosGastos();
    actualizarContadorOtrosGastos();
    console.log('Lista de otros gastos limpiada');
}



// ===== GESTIÓN DE MODALES =====

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modalCrearOtroGasto = document.getElementById('modalCrearOtroGasto');
    const modalConfiguracion = document.getElementById('modalConfiguracion');
    const modalConfirmacionEliminarOtroGasto = document.getElementById('modalConfirmacionEliminarOtroGasto');
    const modalAdvertenciaOtroGastoEnTareas = document.getElementById('modalAdvertenciaOtroGastoEnTareas');
    
    if (event.target === modalCrearOtroGasto) {
        cerrarModalCrearOtroGasto();
    }
    if (event.target === modalConfiguracion) {
        cerrarModalConfiguracion();
    }
    if (event.target === modalConfirmacionEliminarOtroGasto) {
        cerrarModalConfirmacionEliminarOtroGasto();
    }
    if (event.target === modalAdvertenciaOtroGastoEnTareas) {
        cerrarModalAdvertenciaOtroGastoEnTareas();
    }
}

// ===== FUNCIONES DE RANGO Y VALIDACIÓN =====

// Obtener los rangos específicos desde la configuración global
function obtenerRangos(tipoRango = 'costoOtrosGastos') {
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
        console.warn(`Tipo de rango '${tipoRango}' no encontrado. Usando costoOtrosGastos por defecto.`);
        return rangos.costoOtrosGastos || { minimo: 1, maximo: 500 };
    }
    
    const minimo = rangoEspecifico.minimo || 1;
    const maximo = rangoEspecifico.maximo || 500;
    
    if (minimo >= maximo) {
        alert("⚠️ Error: El valor mínimo debe ser menor que el máximo");
        return null;
    }
    
    return { minimo, maximo };
}



// ===== MODAL DE CREAR OTRO GASTO =====

// Función para abrir el modal de crear otro gasto
function crearOtroGastoPersonalizado() {
    const rangosCostoOtrosGastos = obtenerRangos('costoOtrosGastos');
    if (!rangosCostoOtrosGastos) return;
    
    // Actualizar información de rango en el modal
    document.getElementById('rangoInfoOtroGasto').textContent = 
        `$${rangosCostoOtrosGastos.minimo.toFixed(2)} - $${rangosCostoOtrosGastos.maximo.toFixed(2)}`;
    
    // Limpiar formulario y abrir modal
    limpiarFormularioOtroGasto();
    document.getElementById('modalCrearOtroGasto').style.display = 'block';
}

// Función para cerrar el modal de crear otro gasto
function cerrarModalCrearOtroGasto() {
    document.getElementById('modalCrearOtroGasto').style.display = 'none';
    limpiarFormularioOtroGasto();
}

// ===== FUNCIONES PARA MODAL DE CONFIRMACIÓN DE ELIMINACIÓN =====

function confirmarEliminarOtroGasto() {
    if (otroGastoAEliminarIndex >= 0 && otroGastoAEliminarIndex < otrosGastosCreados.length) {
        const otroGastoAEliminar = otrosGastosCreados[otroGastoAEliminarIndex].otroGasto;
        const nombreEliminado = otroGastoAEliminar.getNombre();
        
        otrosGastosCreados.splice(otroGastoAEliminarIndex, 1);
        guardarOtrosGastosEnStorage(); // Guardar cambios en localStorage
        console.log(`❌ Otro gasto eliminado: ${nombreEliminado}`);
        actualizarListaOtrosGastos();
        actualizarContadorOtrosGastos();
    }
    
    // Cerrar el modal y resetear el índice
    cerrarModalConfirmacionEliminarOtroGasto();
}

function cerrarModalConfirmacionEliminarOtroGasto() {
    document.getElementById('modalConfirmacionEliminarOtroGasto').style.display = 'none';
    otroGastoAEliminarIndex = -1; // Resetear el índice
}

// Función para limpiar el formulario
function limpiarFormularioOtroGasto() {
    document.getElementById('nombreOtroGasto').value = '';
    document.getElementById('costoPorUnidadOtroGasto').value = '';
    document.getElementById('descripcionOtroGasto').value = '';
    
    // Limpiar mensajes de error
    document.getElementById('errorNombreOtroGasto').textContent = '';
    document.getElementById('errorCostoPorUnidadOtroGasto').textContent = '';
    document.getElementById('errorDescripcionOtroGasto').textContent = '';
    
    // Actualizar contador de caracteres
    document.querySelector('.char-counter').textContent = '0/80 caracteres';
}

// ===== VALIDACIÓN DE FORMULARIOS =====

// Función para validar el nombre del otro gasto
function validarNombreOtroGasto(nombre) {
    if (!nombre.trim()) {
        return "El nombre no puede estar vacío";
    }
    
    const caracteresProhibidos = /[!"·$%&/()=?¿'¡+`*\]^\[´.:,;\-_{}<>`~\\|]/;
    if (caracteresProhibidos.test(nombre)) {
        return "El nombre contiene caracteres no permitidos";
    }
    
    return null; // Sin errores
}

// Función para validar costos con rangos específicos
function validarCosto(costo, tipo, tipoRango = 'costoOtrosGastos') {
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

// Función para validar la descripción
function validarDescripcion(descripcion) {
    if (descripcion.length > 80) {
        return "La descripción no puede exceder los 80 caracteres";
    }
    
    return null; // Sin errores
}

// Función para validar y crear otro gasto
function validarYCrearOtroGasto() {
    const nombre = document.getElementById('nombreOtroGasto').value;
    const costoPorUnidad = parseFloat(document.getElementById('costoPorUnidadOtroGasto').value);
    const descripcion = document.getElementById('descripcionOtroGasto').value;
    
    let tieneErrores = false;
    
    // Validar nombre
    const errorNombre = validarNombreOtroGasto(nombre);
    if (errorNombre) {
        document.getElementById('errorNombreOtroGasto').textContent = '❌ ' + errorNombre;
        tieneErrores = true;
    } else {
        document.getElementById('errorNombreOtroGasto').textContent = '✅ Nombre válido';
    }
    
    // Validar costo por unidad
    const errorCosto = validarCosto(costoPorUnidad, 'costo por unidad', 'costoOtrosGastos');
    if (errorCosto) {
        document.getElementById('errorCostoPorUnidadOtroGasto').textContent = '❌ ' + errorCosto;
        tieneErrores = true;
    } else {
        document.getElementById('errorCostoPorUnidadOtroGasto').textContent = '✅ Costo válido';
    }
    
    // Validar descripción
    const errorDescripcion = validarDescripcion(descripcion);
    if (errorDescripcion) {
        document.getElementById('errorDescripcionOtroGasto').textContent = '❌ ' + errorDescripcion;
        tieneErrores = true;
    } else {
        document.getElementById('errorDescripcionOtroGasto').textContent = descripcion ? '✅ Descripción válida' : '';
    }
    
    // Si hay errores, mostrar indicador visual en lugar de alerta
    if (tieneErrores) {
        // Agregar clase de error al modal
        const modalContent = document.querySelector('#modalCrearOtroGasto .modal-content');
        
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
    
    // Crear otro gasto
    try {
        const rangos = obtenerRangos('costoOtrosGastos');
        console.log("=== CREANDO OTRO GASTO DESDE MODAL ===");
        console.log(`Rango: $${rangos.minimo} - $${rangos.maximo}`);
        console.log(`Datos ingresados: ${nombre}, $${costoPorUnidad}`);
        
        const otroGasto = new OtrosGastos(nombre, costoPorUnidad, descripcion);
        
        console.log("✅ Otro gasto creado exitosamente:", otroGasto.toString());
        agregarOtroGastoALista(otroGasto);
        
        // Cerrar modal
        cerrarModalCrearOtroGasto();
        
    } catch (error) {
        console.error("❌ Error al crear otro gasto:", error.message);
        alert("❌ Error al crear otro gasto: " + error.message);
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
    validacion: { estricta: true, mostrarConsejos: true, caracteresProhibidos: `!"·$%&/()=?¿'¡+\`*]^[´.:,;-_{}<>\`~\\|` },
    interfaz: { tema: 'default', animaciones: true, idioma: 'es' },
    datos: { autoguardado: true, backupAutomatico: true }
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
    
    // Cargar valores de rangos específicos para otros gastos únicamente
    document.getElementById('costoOtrosGastosMin').value = configuracionGlobal.rangos.costoOtrosGastos.minimo;
    document.getElementById('costoOtrosGastosMax').value = configuracionGlobal.rangos.costoOtrosGastos.maximo;
    
    actualizarRangosActualesMostrados();
    
    // Validar rangos al cargar la configuración
    validarRangoConfiguracion();
}

function actualizarRangosActualesMostrados() {
    const costoOtrosGastosMin = parseFloat(document.getElementById('costoOtrosGastosMin').value) || 1;
    const costoOtrosGastosMax = parseFloat(document.getElementById('costoOtrosGastosMax').value) || 500;
    
    document.getElementById('rangosActuales').innerHTML = `
        <strong>Rangos configurados:</strong><br>
        Otros Gastos: $${costoOtrosGastosMin.toFixed(2)} - $${costoOtrosGastosMax.toFixed(2)}
    `;
}

// Función para validar rangos en tiempo real
function validarRangoConfiguracion() {
    const inputMin = document.getElementById('costoOtrosGastosMin');
    const inputMax = document.getElementById('costoOtrosGastosMax');
    const botonAplicar = document.querySelector('button[onclick="aplicarConfiguracionRangosOtrosGastos()"]');
    
    const valorMin = parseFloat(inputMin.value);
    const valorMax = parseFloat(inputMax.value);
    
    // Resetear estilos
    inputMin.classList.remove('invalid');
    inputMax.classList.remove('invalid');
    botonAplicar.disabled = false;
    
    let hayErrores = false;
    
    // Validar que no sean negativos
    if (valorMin < 0) {
        inputMin.classList.add('invalid');
        hayErrores = true;
    }
    
    if (valorMax < 0) {
        inputMax.classList.add('invalid');
        hayErrores = true;
    }
    
    // Validar que el mínimo no sea mayor al máximo
    if (valorMin > valorMax) {
        inputMin.classList.add('invalid');
        inputMax.classList.add('invalid');
        hayErrores = true;
    }
    
    // Validar que no sean iguales
    if (valorMin === valorMax && valorMin !== 0) {
        inputMin.classList.add('invalid');
        inputMax.classList.add('invalid');
        hayErrores = true;
    }
    
    // Deshabilitar botón si hay errores
    if (hayErrores) {
        botonAplicar.disabled = true;
    }
    
    // Actualizar la visualización de rangos
    actualizarRangosActualesMostrados();
}

function aplicarConfiguracionRangosOtrosGastos() {
    const costoOtrosGastosMin = parseFloat(document.getElementById('costoOtrosGastosMin').value);
    const costoOtrosGastosMax = parseFloat(document.getElementById('costoOtrosGastosMax').value);
    
    // Validar que los valores no sean negativos
    if (costoOtrosGastosMin < 0) {
        alert("⚠️ Error: El valor mínimo no puede ser menor a 0");
        return;
    }
    
    if (costoOtrosGastosMax < 0) {
        alert("⚠️ Error: El valor máximo no puede ser menor a 0");
        return;
    }
    
    // Validar que el mínimo no sea mayor al máximo
    if (costoOtrosGastosMin > costoOtrosGastosMax) {
        alert("⚠️ Error: El valor mínimo no puede ser mayor al valor máximo");
        return;
    }
    
    // Validar que el mínimo no sea igual al máximo
    if (costoOtrosGastosMin === costoOtrosGastosMax) {
        alert("⚠️ Error: El valor mínimo no puede ser igual al valor máximo");
        return;
    }
    
    // Actualizar solo los rangos de otros gastos en la configuración global
    configuracionGlobal.rangos.costoOtrosGastos.minimo = costoOtrosGastosMin;
    configuracionGlobal.rangos.costoOtrosGastos.maximo = costoOtrosGastosMax;
    
    // Guardar en localStorage
    localStorage.setItem('configuracionSistema', JSON.stringify(configuracionGlobal));
    localStorage.setItem('rangosEspecificos', JSON.stringify(configuracionGlobal.rangos));
    
    actualizarRangosActualesMostrados();
}

// ===== INICIALIZACIÓN DEL SISTEMA =====

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Sistema iniciado sin datos precargados
    console.log("🚀 Sistema de Gestión de Otros Gastos iniciado");
    console.log("📚 Clases cargadas: Personal, Material, OtrosCostos, OtrosGastos");
    console.log("💡 Usa los botones para crear otros gastos y gestionar costos");
    
    // Cargar configuración global al iniciar
    cargarConfiguracionGlobal();
    console.log("Configuración de rangos cargada desde configuración global");
    
    // Cargar otros gastos guardados al iniciar
    cargarOtrosGastosDesdeStorage();
    console.log(`Otros gastos en la lista: ${otrosGastosCreados.length}`);
    
    // Mostrar lista inicial de otros gastos
    actualizarListaOtrosGastos();
    
    // ===== VALIDACIÓN EN TIEMPO REAL =====
    
    // Agregar validación en tiempo real al modal de crear otro gasto
    document.getElementById('nombreOtroGasto').addEventListener('input', function() {
        const nombre = this.value;
        const error = validarNombreOtroGasto(nombre);
        const errorElement = document.getElementById('errorNombreOtroGasto');
        
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
    
         document.getElementById('costoPorUnidadOtroGasto').addEventListener('input', function() {
         const costo = parseFloat(this.value);
         const error = validarCosto(costo, 'costo por unidad', 'costoOtrosGastos');
         const errorElement = document.getElementById('errorCostoPorUnidadOtroGasto');
         
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
     
     // Agregar validación en tiempo real para la descripción
     document.getElementById('descripcionOtroGasto').addEventListener('input', function() {
         const descripcion = this.value;
         const error = validarDescripcion(descripcion);
         const errorElement = document.getElementById('errorDescripcionOtroGasto');
         const charCounter = document.querySelector('.char-counter');
         
         // Actualizar contador de caracteres
         const charCount = descripcion.length;
         charCounter.textContent = `${charCount}/80 caracteres`;
         
         // Cambiar color del contador según la longitud
         charCounter.classList.remove('warning', 'danger');
         if (charCount > 70) {
             charCounter.classList.add('warning');
         }
         if (charCount > 75) {
             charCounter.classList.add('danger');
         }
         
         if (descripcion === '') {
             errorElement.textContent = '';
             this.classList.remove('valid', 'invalid');
         } else if (error) {
             errorElement.textContent = '❌ ' + error;
             this.classList.remove('valid');
             this.classList.add('invalid');
         } else {
             errorElement.textContent = '✅ Descripción válida';
             this.classList.remove('invalid');
             this.classList.add('valid');
         }
     });
    
    // ===== FUNCIONALIDAD DE TECLA ENTER =====
    
    // Permitir crear otro gasto con Enter en los campos del formulario
    function handleEnterKey(event) {
        if (event.key === 'Enter') {
            validarYCrearOtroGasto();
        }
    }
    
         document.getElementById('nombreOtroGasto').addEventListener('keypress', handleEnterKey);
     document.getElementById('costoPorUnidadOtroGasto').addEventListener('keypress', handleEnterKey);
     document.getElementById('descripcionOtroGasto').addEventListener('keypress', handleEnterKey);
     
     // ===== CERRAR MODALES CON TECLA ESCAPE =====
     
     // Cerrar modales con tecla Escape
     document.addEventListener('keydown', function(event) {
         if (event.key === 'Escape') {
             const modalCrearOtroGasto = document.getElementById('modalCrearOtroGasto');
             const modalConfiguracion = document.getElementById('modalConfiguracion');
             const modalConfirmacionEliminarOtroGasto = document.getElementById('modalConfirmacionEliminarOtroGasto');
             const modalAdvertenciaOtroGastoEnTareas = document.getElementById('modalAdvertenciaOtroGastoEnTareas');
             
             if (modalCrearOtroGasto.style.display === 'block') {
                 cerrarModalCrearOtroGasto();
             }
             
             if (modalConfiguracion.style.display === 'block') {
                 cerrarModalConfiguracion();
             }
             
             if (modalConfirmacionEliminarOtroGasto.style.display === 'block') {
                 cerrarModalConfirmacionEliminarOtroGasto();
             }
             
             if (modalAdvertenciaOtroGastoEnTareas.style.display === 'block') {
                 cerrarModalAdvertenciaOtroGastoEnTareas();
             }
         }
     });
});