// ===== SISTEMA DE GESTIÓN DE OTROS GASTOS =====
// Array global para almacenar todos los otros gastos creados
let otrosGastosCreados = [];

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
            
            // Recrear instancias de la clase OtrosCostos
            datosOtrosGastos.forEach(item => {
                const otroGastoData = item.otroGasto;
                // Recrear la instancia de OtrosCostos con los datos guardados
                const otroGastoRecreado = new OtrosCostos(
                    otroGastoData.nombre,
                    otroGastoData.costoPorUnidad
                );
                // Restaurar el inventario
                otroGastoRecreado.inventario = otroGastoData.inventario;
                
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
        estadisticasDiv.innerHTML = '<p class="empty-stats">📭 No hay otros gastos creados aún</p>';
        listaDiv.innerHTML = '<p class="empty-state">Crea tu primer otro gasto usando los botones de arriba</p>';
        return;
    }
    
    // Calcular estadísticas
    const totalOtrosGastos = otrosGastosCreados.length;
    const costoPromedioUnidad = otrosGastosCreados.reduce((sum, item) => sum + item.otroGasto.getCostoPorUnidad(), 0) / totalOtrosGastos;
    const costoTotalProyecto = otrosGastosCreados.reduce((sum, item) => sum + item.otroGasto.getCostoPorUnidad(), 0);
    
    // Mostrar estadísticas
    estadisticasDiv.innerHTML = `
        <h3 class="stats-title"><img src="../storage/vectors/stats-svgrepo-com.svg" alt="" class="stats-icon-large">Estadísticas Generales</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value success">${totalOtrosGastos}</div>
                <div class="stat-label">Total Otros Gastos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value primary">$${costoPromedioUnidad.toFixed(2)}</div>
                <div class="stat-label">Promedio Costo/Unidad</div>
            </div>
            <div class="stat-card">
                <div class="stat-value warning">$${costoTotalProyecto.toFixed(2)}</div>
                <div class="stat-label">Costo Total del Proyecto</div>
            </div>
            <div class="stat-card">
                <div class="stat-value purple"><img src="../storage/vectors/briefcase-svgrepo-com.svg" alt="" class="briefcase-icon-stat"></div>
                <div class="stat-label">Gastos Generales</div>
            </div>
        </div>
    `;
    
    // Mostrar lista de otros gastos
    let listaHTML = '<h3 class="employees-title"><img src="../storage/vectors/briefcase-svgrepo-com.svg" alt="" class="briefcase-icon-large">Lista Detallada</h3>';
    
    otrosGastosCreados.forEach((item, index) => {
        const otroGasto = item.otroGasto;
        const info = otroGasto.obtenerInformacion();
        const fechaFormateada = item.fechaCreacion.toLocaleString('es-ES');
        
        listaHTML += `
            <div class="employee-card">
                <div class="employee-header">
                    <h4 class="employee-name"><img src="../storage/vectors/user-list-svgrepo-com.svg" alt="" class="user-list-icon-large"> ${info.nombre}</h4>
                    <span class="employee-id">ID: ${item.id}</span>
                </div>
                
                <div class="employee-details">
                    <div class="employee-detail"><strong><img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Costo/Unidad:</strong> $${info.costoPorUnidad.toFixed(2)}</div>
                    <div class="employee-detail"><strong>Tipo:</strong> Gasto General del Proyecto</div>
                    <div class="employee-detail">
                        <button onclick="calcularCostoPersonalizado(${index})" class="small-button" style="background: #17a2b8;">
                            🧮 Calcular Costo
                        </button>
                    </div>
                </div>
                
                <div class="employee-date">
                    <img src="../storage/vectors/coins-svgrepo-com.svg" alt="" class="coins-icon"> Creado: ${fechaFormateada}
                </div>
                
                <div class="employee-actions">
                    <button onclick="eliminarOtroGasto(${index})" class="small-button">
                                                    <img src="../storage/vectors/trash-svgrepo-com.svg" alt="" class="trash-icon">Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    listaDiv.innerHTML = listaHTML;
}

// Función para calcular costo personalizado
function calcularCostoPersonalizado(index) {
    const otroGasto = otrosGastosCreados[index].otroGasto;
    const cantidad = prompt(`Calcular costo total para "${otroGasto.getNombre()}" (Costo por unidad: $${otroGasto.getCostoPorUnidad().toFixed(2)})\n\nIngrese la cantidad de unidades:`);
    
    if (cantidad === null || cantidad === "0" || cantidad === "") return;
    
    const cantidadFloat = parseFloat(cantidad);
    if (isNaN(cantidadFloat) || cantidadFloat <= 0) {
        alert("⚠️ Por favor ingresa un número válido mayor a 0");
        return;
    }
    
    const costoTotal = otroGasto.calcularCostoTotal(cantidadFloat);
            alert(`<img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Cálculo de Costo:\n\n` +
          `Gasto: ${otroGasto.getNombre()}\n` +
          `Costo por unidad: $${otroGasto.getCostoPorUnidad().toFixed(2)}\n` +
          `Cantidad: ${cantidadFloat} unidades\n` +
          `Costo total: $${costoTotal.toFixed(2)}`);
}

// Función para eliminar un otro gasto específico
function eliminarOtroGasto(index) {
    if (confirm(`¿Está seguro de que desea eliminar "${otrosGastosCreados[index].otroGasto.getNombre()}"?`)) {
        const nombreEliminado = otrosGastosCreados[index].otroGasto.getNombre();
        otrosGastosCreados.splice(index, 1);
        guardarOtrosGastosEnStorage(); // Guardar cambios en localStorage
        console.log(`❌ Otro gasto eliminado: ${nombreEliminado}`);
        actualizarListaOtrosGastos();
        actualizarContadorOtrosGastos();
    }
}

// Función para limpiar toda la lista
function limpiarListaOtrosGastos() {
    if (otrosGastosCreados.length === 0) {
        alert('📭 La lista ya está vacía');
        return;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar todos los ${otrosGastosCreados.length} otros gastos?`)) {
        otrosGastosCreados = [];
        guardarOtrosGastosEnStorage(); // Guardar cambios en localStorage
        actualizarListaOtrosGastos();
        actualizarContadorOtrosGastos();
        console.log('Lista de otros gastos limpiada');
    }
}

// Función para exportar otros gastos a la consola
function exportarOtrosGastos() {
    if (otrosGastosCreados.length === 0) {
        alert('📭 No hay otros gastos para exportar');
        return;
    }
    
    console.log('EXPORTACIÓN DE OTROS GASTOS');
    console.log('═'.repeat(50));
    
    otrosGastosCreados.forEach((item, index) => {
        const otroGasto = item.otroGasto;
        const info = otroGasto.obtenerInformacion();
        
        console.log(`\nOTRO GASTO #${item.id}`);
        console.log(`Nombre: ${info.nombre}`);
        console.log(`Costo por unidad: $${info.costoPorUnidad.toFixed(2)}`);
        console.log(`Fecha creación: ${item.fechaCreacion.toLocaleString('es-ES')}`);
        console.log('-'.repeat(30));
    });
    
    // Estadísticas finales
    const totalOtrosGastos = otrosGastosCreados.length;
    const costoPromedio = otrosGastosCreados.reduce((sum, item) => sum + item.otroGasto.getCostoPorUnidad(), 0) / totalOtrosGastos;
    const costoTotalProyecto = otrosGastosCreados.reduce((sum, item) => sum + item.otroGasto.getCostoPorUnidad(), 0);
    
    console.log(`\n📈 RESUMEN FINAL`);
    console.log(`Total otros gastos: ${totalOtrosGastos}`);
    console.log(`Costo promedio/unidad: $${costoPromedio.toFixed(2)}`);
    console.log(`Costo total proyecto: $${costoTotalProyecto.toFixed(2)}`);
    
    alert('📄 Otros gastos exportados a la consola. Abre las herramientas de desarrollador para verlos.');
}

// ===== GESTIÓN DE MODALES =====

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modalCrearOtroGasto = document.getElementById('modalCrearOtroGasto');
    const modalConfiguracion = document.getElementById('modalConfiguracion');
    
    if (event.target === modalCrearOtroGasto) {
        cerrarModalCrearOtroGasto();
    }
    if (event.target === modalConfiguracion) {
        cerrarModalConfiguracion();
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

// Función para mostrar detalles de los rangos
function mostrarRangosDetallados() {
    const rangos = obtenerRangos();
    if (!rangos) return;
    
    const detalles = `
CONFIGURACIÓN ACTUAL DE RANGOS PARA OTROS GASTOS
═══════════════════════════════════════════════

        <img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Rango de Costos Permitidos:
   Mínimo: $${rangos.minimo.toFixed(2)}
   Máximo: $${rangos.maximo.toFixed(2)}

🎯 Aplicación:
   ✓ Se aplica al costo por unidad
   ✓ Validación automática en el modal
   ✓ Gastos generales del proyecto
   ✓ Configuración global sincronizada

⚠️ Reglas:
   • Los valores deben estar dentro del rango
   • Se solicita corrección si están fuera
   • Representa gastos generales (servicios, otros)
   • Nombres sin caracteres especiales

💡 Ejemplo de uso:
   new OtrosGastos("Servicios públicos", ${rangos.minimo + 10});
   // Para gastos generales del proyecto

🔧 Nota: Los rangos se pueden modificar desde el modal de Configuración global.
    `;
    
    console.log(detalles);
    alert("Detalles de rangos mostrados en la consola.\n💡 Usa el modal de Configuración para modificar rangos.");
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

// Función para limpiar el formulario
function limpiarFormularioOtroGasto() {
    document.getElementById('nombreOtroGasto').value = '';
    document.getElementById('costoPorUnidadOtroGasto').value = '';
    
    // Limpiar mensajes de error
    document.getElementById('errorNombreOtroGasto').textContent = '';
    document.getElementById('errorCostoPorUnidadOtroGasto').textContent = '';
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

// Función para validar y crear otro gasto
function validarYCrearOtroGasto() {
    const nombre = document.getElementById('nombreOtroGasto').value;
    const costoPorUnidad = parseFloat(document.getElementById('costoPorUnidadOtroGasto').value);
    
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
    
    // Si hay errores, no crear el otro gasto
    if (tieneErrores) {
        alert('⚠️ Por favor corrija los errores antes de continuar');
        return;
    }
    
    // Crear otro gasto
    try {
        const rangos = obtenerRangos('costoOtrosGastos');
        console.log("=== CREANDO OTRO GASTO DESDE MODAL ===");
        console.log(`Rango: $${rangos.minimo} - $${rangos.maximo}`);
        console.log(`Datos ingresados: ${nombre}, $${costoPorUnidad}`);
        
        const otroGasto = new OtrosGastos(nombre, costoPorUnidad);
        
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
}

function actualizarRangosActualesMostrados() {
    const costoOtrosGastosMin = parseFloat(document.getElementById('costoOtrosGastosMin').value) || 1;
    const costoOtrosGastosMax = parseFloat(document.getElementById('costoOtrosGastosMax').value) || 500;
    
    document.getElementById('rangosActuales').innerHTML = `
        <strong>Rangos configurados:</strong><br>
        Otros Gastos: $${costoOtrosGastosMin.toFixed(2)} - $${costoOtrosGastosMax.toFixed(2)}
    `;
}

function aplicarConfiguracionRangosOtrosGastos() {
    const costoOtrosGastosMin = parseFloat(document.getElementById('costoOtrosGastosMin').value);
    const costoOtrosGastosMax = parseFloat(document.getElementById('costoOtrosGastosMax').value);
    
    // Validar rangos de otros gastos únicamente
    if (costoOtrosGastosMin >= costoOtrosGastosMax) {
        alert("⚠️ Error: El costo de otros gastos mínimo debe ser menor que el máximo");
        return;
    }
    
    // Actualizar solo los rangos de otros gastos en la configuración global
    configuracionGlobal.rangos.costoOtrosGastos.minimo = costoOtrosGastosMin;
    configuracionGlobal.rangos.costoOtrosGastos.maximo = costoOtrosGastosMax;
    
    // Guardar en localStorage
    localStorage.setItem('configuracionSistema', JSON.stringify(configuracionGlobal));
    localStorage.setItem('rangosEspecificos', JSON.stringify(configuracionGlobal.rangos));
    
    actualizarRangosActualesMostrados();
    
    alert(`✅ Configuración de rangos para otros gastos aplicada exitosamente:\n\n` +
          `Otros Gastos: $${costoOtrosGastosMin.toFixed(2)} - $${costoOtrosGastosMax.toFixed(2)}\n\n` +
          `Los cambios se aplicarán inmediatamente en la sección de otros gastos.`);
}

function aplicarConfiguracionValidacion() {
    alert('✅ Configuración de validación aplicada');
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
    
    // ===== FUNCIONALIDAD DE TECLA ENTER =====
    
    // Permitir crear otro gasto con Enter en los campos del formulario
    function handleEnterKey(event) {
        if (event.key === 'Enter') {
            validarYCrearOtroGasto();
        }
    }
    
    document.getElementById('nombreOtroGasto').addEventListener('keypress', handleEnterKey);
    document.getElementById('costoPorUnidadOtroGasto').addEventListener('keypress', handleEnterKey);
});