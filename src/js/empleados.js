// ===== SISTEMA DE GESTIÓN DE EMPLEADOS =====
// Array global para almacenar todos los empleados creados
let empleadosCreados = [];

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

// Función para agregar empleado a la lista
function agregarEmpleadoALista(empleado) {
    empleadosCreados.push({
        empleado: empleado,
        fechaCreacion: new Date(),
        id: empleadosCreados.length + 1
    });
    console.log(`✅ Empleado agregado a la lista: ${empleado.getNombre()}`);
    guardarEmpleadosEnStorage(); // Guardar en localStorage
    actualizarContadorEmpleados();
    actualizarListaEmpleados(); // Actualizar automáticamente la lista en la página
}

// Función para actualizar la lista de empleados en la ventana
function actualizarListaEmpleados() {
    const estadisticasDiv = document.getElementById('estadisticasEmpleados');
    const listaDiv = document.getElementById('listaEmpleados');
    
    if (empleadosCreados.length === 0) {
        estadisticasDiv.innerHTML = '<p class="empty-stats">📭 No hay empleados creados aún</p>';
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
                    <button onclick="eliminarEmpleado(${index})" class="small-button">
                                                    <img src="../storage/vectors/trash-svgrepo-com.svg" alt="" class="trash-icon">Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    listaDiv.innerHTML = listaHTML;
}

// Función para eliminar un empleado específico
function eliminarEmpleado(index) {
    if (confirm(`¿Está seguro de que desea eliminar a ${empleadosCreados[index].empleado.getNombre()}?`)) {
        const nombreEliminado = empleadosCreados[index].empleado.getNombre();
        empleadosCreados.splice(index, 1);
        guardarEmpleadosEnStorage(); // Guardar cambios en localStorage
        console.log(`❌ Empleado eliminado: ${nombreEliminado}`);
        actualizarListaEmpleados();
        actualizarContadorEmpleados();
    }
}

// Función para limpiar toda la lista
function limpiarListaEmpleados() {
    if (empleadosCreados.length === 0) {
        alert('📭 La lista ya está vacía');
        return;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar todos los ${empleadosCreados.length} empleados?`)) {
        empleadosCreados = [];
        guardarEmpleadosEnStorage(); // Guardar cambios en localStorage
        actualizarListaEmpleados();
        actualizarContadorEmpleados();
        console.log('Lista de empleados limpiada');
    }
}

// Función para exportar empleados a la consola
function exportarEmpleados() {
    if (empleadosCreados.length === 0) {
        alert('📭 No hay empleados para exportar');
        return;
    }
    
    console.log('EXPORTACIÓN DE EMPLEADOS');
    console.log('═'.repeat(50));
    
    empleadosCreados.forEach((item, index) => {
        const empleado = item.empleado;
        const info = empleado.obtenerInformacion();
        
        console.log(`\nEMPLEADO #${item.id}`);
        console.log(`Nombre: ${info.nombre}`);
        console.log(`Costo por hora: $${info.costoPorHora.toFixed(2)}`);
        console.log(`Costo hora extra: $${info.costoPorHoraExtra.toFixed(2)}`);
        console.log(`Horas trabajadas: ${info.horasTrabajadas}`);
        console.log(`Salario total: $${info.salarioTotal.toFixed(2)}`);
        console.log(`Fecha creación: ${item.fechaCreacion.toLocaleString('es-ES')}`);
        console.log('-'.repeat(30));
    });
    
    // Estadísticas finales
    const totalEmpleados = empleadosCreados.length;
    const costoPromedio = empleadosCreados.reduce((sum, item) => sum + item.empleado.getCostoPorHora(), 0) / totalEmpleados;
    const nominaTotal = empleadosCreados.reduce((sum, item) => sum + item.empleado.calcularSalarioTotal(), 0);
    
    console.log(`\n📈 RESUMEN FINAL`);
    console.log(`Total empleados: ${totalEmpleados}`);
    console.log(`Costo promedio/hora: $${costoPromedio.toFixed(2)}`);
    console.log(`Nómina total: $${nominaTotal.toFixed(2)}`);
    
    alert('📄 Empleados exportados a la consola. Abre las herramientas de desarrollador para verlos.');
}

// ===== GESTIÓN DE MODALES =====

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modalCrearEmpleado = document.getElementById('modalCrearEmpleado');
    const modalConfiguracion = document.getElementById('modalConfiguracion');
    
    if (event.target === modalCrearEmpleado) {
        cerrarModalCrearEmpleado();
    }
    if (event.target === modalConfiguracion) {
        cerrarModalConfiguracion();
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

// Función para mostrar detalles de los rangos
function mostrarRangosDetallados() {
    const rangos = obtenerRangos();
    if (!rangos) return;
    
    const detalles = `
CONFIGURACIÓN ACTUAL DE RANGOS PARA EMPLEADOS
═══════════════════════════════════════════════

        <img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Rango de Costos Permitidos:
   Mínimo: $${rangos.minimo.toFixed(2)}
   Máximo: $${rangos.maximo.toFixed(2)}

🎯 Aplicación:
   ✓ Se aplica al costo por hora
   ✓ Se aplica al costo por hora extra
   ✓ Validación automática en el constructor
   ✓ Bucle hasta obtener valores válidos
   ✓ Horas trabajadas siempre comienzan en 0
   ✓ Configuración global sincronizada

⚠️ Reglas:
   • Los valores deben estar dentro del rango
   • Se solicita corrección si están fuera
   • No se puede crear empleado con costos inválidos
   • Las horas trabajadas no se solicitan al usuario

💡 Ejemplo de uso:
   new Personal("Juan", ${rangos.minimo + 5}, ${rangos.maximo - 5}, ${rangos.minimo}, ${rangos.maximo});
   // Las horas trabajadas siempre comienzan en 0

🔧 Nota: Los rangos se pueden modificar desde el modal de Configuración global.
    `;
    
    console.log(detalles);
    alert("Detalles de rangos mostrados en la consola.\n💡 Usa el modal de Configuración para modificar rangos.");
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
}

// ===== VALIDACIÓN DE FORMULARIOS =====

// Función para validar el nombre
function validarNombreEmpleado(nombre) {
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
    
    // Si hay errores, no crear el empleado
    if (tieneErrores) {
        alert('⚠️ Por favor corrija los errores antes de continuar');
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
        alert("⚠️ Error: El costo por hora mínimo debe ser menor que el máximo");
        return;
    }
    if (costoPorHoraExtraMin >= costoPorHoraExtraMax) {
        alert("⚠️ Error: El costo por hora extra mínimo debe ser menor que el máximo");
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
    
    alert(`✅ Configuración de rangos para empleados aplicada exitosamente:\n\n` +
          `Costo por hora: $${costoPorHoraMin.toFixed(2)} - $${costoPorHoraMax.toFixed(2)}\n` +
          `Hora extra: $${costoPorHoraExtraMin.toFixed(2)} - $${costoPorHoraExtraMax.toFixed(2)}\n\n` +
          `Los cambios se aplicarán inmediatamente en la sección de empleados.`);
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

function importarConfiguracion() {
    alert('📥 Función de importación');
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
});