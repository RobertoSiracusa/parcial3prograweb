// ===== SISTEMA DE GESTIÓN DE MATERIALES =====
// Array global para almacenar todos los materiales creados
let materialesCreados = [];

// Funciones para persistencia de datos
function guardarMaterialesEnStorage() {
    try {
        localStorage.setItem('materialesCreados', JSON.stringify(materialesCreados));
        console.log('✅ Materiales guardados en localStorage');
    } catch (error) {
        console.error('❌ Error al guardar materiales:', error);
    }
}

function cargarMaterialesDesdeStorage() {
    try {
        const materialesGuardados = localStorage.getItem('materialesCreados');
        if (materialesGuardados) {
            const datosMateriales = JSON.parse(materialesGuardados);
            materialesCreados = [];
            
            // Recrear instancias de la clase Material
            datosMateriales.forEach(item => {
                const materialData = item.material;
                // Recrear la instancia de Material con los datos guardados
                const materialRecreado = new Material(
                    materialData.nombreMaterial,
                    materialData.costoPorUnidad
                );
                // Restaurar el inventario
                materialRecreado.inventario = materialData.inventario;
                
                materialesCreados.push({
                    material: materialRecreado,
                    fechaCreacion: new Date(item.fechaCreacion),
                    id: item.id
                });
            });
            
            console.log(`✅ Cargados ${materialesCreados.length} materiales desde localStorage`);
            actualizarListaMateriales();
            actualizarContadorMateriales();
        }
    } catch (error) {
        console.error('❌ Error al cargar materiales:', error);
        materialesCreados = [];
    }
}

// Función para actualizar el contador de materiales en el botón
function actualizarContadorMateriales() {
    document.getElementById('contadorMateriales').textContent = materialesCreados.length;
}

// Función para agregar material a la lista
function agregarMaterialALista(material) {
    materialesCreados.push({
        material: material,
        fechaCreacion: new Date(),
        id: materialesCreados.length + 1
    });
    console.log(`✅ Material agregado a la lista: ${material.getNombreMaterial()}`);
    guardarMaterialesEnStorage(); // Guardar en localStorage
    actualizarContadorMateriales();
    actualizarListaMateriales(); // Actualizar automáticamente la lista en la página
}

// Función para actualizar la lista de materiales en la página
function actualizarListaMateriales() {
    const estadisticasDiv = document.getElementById('estadisticasMateriales');
    const listaDiv = document.getElementById('listaMateriales');
    
    if (materialesCreados.length === 0) {
        estadisticasDiv.innerHTML = '<p class="empty-stats">📭 No hay materiales creados aún</p>';
        listaDiv.innerHTML = '<p class="empty-state">Crea tu primer material usando los botones de arriba</p>';
        return;
    }
    
    // Calcular estadísticas
    const totalMateriales = materialesCreados.length;
    const costoPromedioUnidad = materialesCreados.reduce((sum, item) => sum + item.material.getCostoPorUnidad(), 0) / totalMateriales;
    const totalInventario = materialesCreados.reduce((sum, item) => sum + item.material.getInventario(), 0);
    const valorTotalInventario = materialesCreados.reduce((sum, item) => sum + item.material.calcularValorTotal(), 0);
    
    // Mostrar estadísticas
    estadisticasDiv.innerHTML = `
        <h3 class="stats-title"><img src="../storage/vectors/stats-svgrepo-com.svg" alt="" class="stats-icon-large">Estadísticas Generales</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value success">${totalMateriales}</div>
                <div class="stat-label">Total Materiales</div>
            </div>
            <div class="stat-card">
                <div class="stat-value primary">$${costoPromedioUnidad.toFixed(2)}</div>
                <div class="stat-label">Promedio Costo/Unidad</div>
            </div>
            <div class="stat-card">
                <div class="stat-value warning">${totalInventario}</div>
                <div class="stat-label">Total Unidades</div>
            </div>
            <div class="stat-card">
                <div class="stat-value purple">$${valorTotalInventario.toFixed(2)}</div>
                <div class="stat-label">Valor Total Inventario</div>
            </div>
        </div>
    `;
    
    // Mostrar lista de materiales
    let listaHTML = '<h3 class="employees-title"><img src="../storage/vectors/layers-svgrepo-com.svg" alt="" class="layers-icon-large">Lista Detallada</h3>';
    
    materialesCreados.forEach((item, index) => {
        const material = item.material;
        const info = material.obtenerInformacion();
        const fechaFormateada = item.fechaCreacion.toLocaleString('es-ES');
        
        listaHTML += `
            <div class="employee-card">
                <div class="employee-header">
                    <h4 class="employee-name"><img src="../storage/vectors/user-list-svgrepo-com.svg" alt="" class="user-list-icon-large"> ${info.nombreMaterial}</h4>
                    <span class="employee-id">ID: ${item.id}</span>
                </div>
                
                <div class="employee-details">
                    <div class="employee-detail"><strong><img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Costo/Unidad:</strong> $${info.costoPorUnidad.toFixed(2)}</div>
                    <div class="employee-detail"><strong>📦 Inventario:</strong> ${info.inventario} unidades</div>
                    <div class="employee-detail"><strong><img src="../storage/vectors/circle-dollar-svgrepo-com.svg" alt="" class="circle-dollar-icon"> Valor Total:</strong> $${info.valorTotal.toFixed(2)}</div>
                    <div class="employee-detail">
                        <button onclick="gestionarInventario(${index})" class="small-button" style="background: #28a745;">
                            📦 Gestionar Stock
                        </button>
                    </div>
                </div>
                
                <div class="employee-date">
                    <img src="../storage/vectors/coins-svgrepo-com.svg" alt="" class="coins-icon"> Creado: ${fechaFormateada}
                </div>
                
                <div class="employee-actions">
                    <button onclick="eliminarMaterial(${index})" class="small-button">
                                                    <img src="../storage/vectors/trash-svgrepo-com.svg" alt="" class="trash-icon">Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    listaDiv.innerHTML = listaHTML;
}

// Función para gestionar el inventario de un material
function gestionarInventario(index) {
    const material = materialesCreados[index].material;
    const accion = prompt(`Gestionar inventario de "${material.getNombreMaterial()}" (Actual: ${material.getInventario()} unidades)\n\nEscribe:\n- Un número positivo para AGREGAR unidades\n- Un número negativo para QUITAR unidades\n- "0" para cancelar`);
    
    if (accion === null || accion === "0") return;
    
    const cantidad = parseFloat(accion);
    if (isNaN(cantidad)) {
        alert("⚠️ Por favor ingresa un número válido");
        return;
    }
    
    if (cantidad > 0) {
        material.agregarInventario(cantidad);
        alert(`✅ Se agregaron ${cantidad} unidades. Nuevo inventario: ${material.getInventario()}`);
    } else if (cantidad < 0) {
        const cantidadAQuitar = Math.abs(cantidad);
        if (material.reducirInventario(cantidadAQuitar)) {
            alert(`✅ Se quitaron ${cantidadAQuitar} unidades. Nuevo inventario: ${material.getInventario()}`);
        } else {
            alert(`❌ No hay suficiente inventario. Disponible: ${material.getInventario()}, Solicitado: ${cantidadAQuitar}`);
        }
    }
    
    actualizarListaMateriales();
}

// Función para eliminar un material específico
function eliminarMaterial(index) {
    if (confirm(`¿Está seguro de que desea eliminar "${materialesCreados[index].material.getNombreMaterial()}"?`)) {
        const nombreEliminado = materialesCreados[index].material.getNombreMaterial();
        materialesCreados.splice(index, 1);
        guardarMaterialesEnStorage(); // Guardar cambios en localStorage
        console.log(`❌ Material eliminado: ${nombreEliminado}`);
        actualizarListaMateriales();
        actualizarContadorMateriales();
    }
}

// Función para limpiar toda la lista
function limpiarListaMateriales() {
    if (materialesCreados.length === 0) {
        alert('📭 La lista ya está vacía');
        return;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar todos los ${materialesCreados.length} materiales?`)) {
        materialesCreados = [];
        guardarMaterialesEnStorage(); // Guardar cambios en localStorage
        actualizarListaMateriales();
        actualizarContadorMateriales();
        console.log('Lista de materiales limpiada');
    }
}

// Función para exportar materiales a la consola
function exportarMateriales() {
    if (materialesCreados.length === 0) {
        alert('📭 No hay materiales para exportar');
        return;
    }
    
    console.log('EXPORTACIÓN DE MATERIALES');
    console.log('═'.repeat(50));
    
    materialesCreados.forEach((item, index) => {
        const material = item.material;
        const info = material.obtenerInformacion();
        
        console.log(`\nMATERIAL #${item.id}`);
        console.log(`Nombre: ${info.nombreMaterial}`);
        console.log(`Costo por unidad: $${info.costoPorUnidad.toFixed(2)}`);
        console.log(`Inventario: ${info.inventario} unidades`);
        console.log(`Valor total: $${info.valorTotal.toFixed(2)}`);
        console.log(`Fecha creación: ${item.fechaCreacion.toLocaleString('es-ES')}`);
        console.log('-'.repeat(30));
    });
    
    // Estadísticas finales
    const totalMateriales = materialesCreados.length;
    const costoPromedio = materialesCreados.reduce((sum, item) => sum + item.material.getCostoPorUnidad(), 0) / totalMateriales;
    const valorTotalInventario = materialesCreados.reduce((sum, item) => sum + item.material.calcularValorTotal(), 0);
    
    console.log(`\n📈 RESUMEN FINAL`);
    console.log(`Total materiales: ${totalMateriales}`);
    console.log(`Costo promedio/unidad: $${costoPromedio.toFixed(2)}`);
    console.log(`Valor total inventario: $${valorTotalInventario.toFixed(2)}`);
    
    alert('📄 Materiales exportados a la consola. Abre las herramientas de desarrollador para verlos.');
}

// ===== GESTIÓN DE MODALES =====

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modalCrearMaterial = document.getElementById('modalCrearMaterial');
    const modalConfiguracion = document.getElementById('modalConfiguracion');
    
    if (event.target === modalCrearMaterial) {
        cerrarModalCrearMaterial();
    }
    if (event.target === modalConfiguracion) {
        cerrarModalConfiguracion();
    }
}

// ===== FUNCIONES DE RANGO Y VALIDACIÓN =====

// Obtener los rangos específicos desde la configuración global
function obtenerRangos(tipoRango = 'costoPorUnidad') {
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
        console.warn(`Tipo de rango '${tipoRango}' no encontrado. Usando costoPorUnidad por defecto.`);
        return rangos.costoPorUnidad || { minimo: 1, maximo: 1000 };
    }
    
    const minimo = rangoEspecifico.minimo || 1;
    const maximo = rangoEspecifico.maximo || 1000;
    
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
CONFIGURACIÓN ACTUAL DE RANGOS PARA MATERIALES
═══════════════════════════════════════════════

        <img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Rango de Costos Permitidos:
   Mínimo: $${rangos.minimo.toFixed(2)}
   Máximo: $${rangos.maximo.toFixed(2)}

🎯 Aplicación:
   ✓ Se aplica al costo por unidad
   ✓ Validación automática en el modal
   ✓ Inventario siempre comienza en 0
   ✓ Gestión de stock disponible
   ✓ Configuración global sincronizada

⚠️ Reglas:
   • Los valores deben estar dentro del rango
   • Se solicita corrección si están fuera
   • El inventario inicial es siempre 0
   • Nombres sin caracteres especiales

💡 Ejemplo de uso:
   new Material("Cemento", ${rangos.minimo + 5}, 0);
   // El inventario siempre comienza en 0

🔧 Nota: Los rangos se pueden modificar desde el modal de Configuración global.
    `;
    
    console.log(detalles);
    alert("Detalles de rangos mostrados en la consola.\n💡 Usa el modal de Configuración para modificar rangos.");
}

// ===== MODAL DE CREAR MATERIAL =====

// Función para abrir el modal de crear material
function crearMaterialPersonalizado() {
    const rangosCostoPorUnidad = obtenerRangos('costoPorUnidad');
    if (!rangosCostoPorUnidad) return;
    
    // Actualizar información de rango en el modal
    document.getElementById('rangoInfoMaterial').textContent = 
        `$${rangosCostoPorUnidad.minimo.toFixed(2)} - $${rangosCostoPorUnidad.maximo.toFixed(2)}`;
    
    // Limpiar formulario y abrir modal
    limpiarFormularioMaterial();
    document.getElementById('modalCrearMaterial').style.display = 'block';
}

// Función para cerrar el modal de crear material
function cerrarModalCrearMaterial() {
    document.getElementById('modalCrearMaterial').style.display = 'none';
    limpiarFormularioMaterial();
}

// Función para limpiar el formulario
function limpiarFormularioMaterial() {
    document.getElementById('nombreMaterial').value = '';
    document.getElementById('costoPorUnidad').value = '';
    
    // Limpiar mensajes de error
    document.getElementById('errorNombreMaterial').textContent = '';
    document.getElementById('errorCostoPorUnidad').textContent = '';
}

// ===== VALIDACIÓN DE FORMULARIOS =====

// Función para validar el nombre del material
function validarNombreMaterial(nombre) {
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
function validarCosto(costo, tipo, tipoRango = 'costoPorUnidad') {
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

// Función para validar y crear material
function validarYCrearMaterial() {
    const nombre = document.getElementById('nombreMaterial').value;
    const costoPorUnidad = parseFloat(document.getElementById('costoPorUnidad').value);
    
    let tieneErrores = false;
    
    // Validar nombre
    const errorNombre = validarNombreMaterial(nombre);
    if (errorNombre) {
        document.getElementById('errorNombreMaterial').textContent = '❌ ' + errorNombre;
        tieneErrores = true;
    } else {
        document.getElementById('errorNombreMaterial').textContent = '✅ Nombre válido';
    }
    
    // Validar costo por unidad
    const errorCosto = validarCosto(costoPorUnidad, 'costo por unidad', 'costoPorUnidad');
    if (errorCosto) {
        document.getElementById('errorCostoPorUnidad').textContent = '❌ ' + errorCosto;
        tieneErrores = true;
    } else {
        document.getElementById('errorCostoPorUnidad').textContent = '✅ Costo válido';
    }
    
    // Si hay errores, no crear el material
    if (tieneErrores) {
        alert('⚠️ Por favor corrija los errores antes de continuar');
        return;
    }
    
    // Crear material
    try {
        const rangos = obtenerRangos();
        console.log("=== CREANDO MATERIAL DESDE MODAL ===");
        console.log(`Rango: $${rangos.minimo} - $${rangos.maximo}`);
        console.log(`Datos ingresados: ${nombre}, $${costoPorUnidad} (inventario inicial: 0)`);
        
        const material = new Material(nombre, costoPorUnidad, 0);
        
        console.log("✅ Material creado exitosamente:", material.toString());
        agregarMaterialALista(material);
        
        // Cerrar modal
        cerrarModalCrearMaterial();
        
    } catch (error) {
        console.error("❌ Error al crear material:", error.message);
        alert("❌ Error al crear material: " + error.message);
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
    
    // Cargar valores de rangos específicos para materiales únicamente
    document.getElementById('costoPorUnidadMin').value = configuracionGlobal.rangos.costoPorUnidad.minimo;
    document.getElementById('costoPorUnidadMax').value = configuracionGlobal.rangos.costoPorUnidad.maximo;
    
    actualizarRangosActualesMostrados();
}

function actualizarRangosActualesMostrados() {
    const costoPorUnidadMin = parseFloat(document.getElementById('costoPorUnidadMin').value) || 1;
    const costoPorUnidadMax = parseFloat(document.getElementById('costoPorUnidadMax').value) || 1000;
    
    document.getElementById('rangosActuales').innerHTML = `
        <strong>Rangos configurados:</strong><br>
        Materiales: $${costoPorUnidadMin.toFixed(2)} - $${costoPorUnidadMax.toFixed(2)}
    `;
}

function aplicarConfiguracionRangosMateriales() {
    const costoPorUnidadMin = parseFloat(document.getElementById('costoPorUnidadMin').value);
    const costoPorUnidadMax = parseFloat(document.getElementById('costoPorUnidadMax').value);
    
    // Validar rangos de materiales únicamente
    if (costoPorUnidadMin >= costoPorUnidadMax) {
        alert("⚠️ Error: El costo por unidad mínimo debe ser menor que el máximo");
        return;
    }
    
    // Actualizar solo los rangos de materiales en la configuración global
    configuracionGlobal.rangos.costoPorUnidad.minimo = costoPorUnidadMin;
    configuracionGlobal.rangos.costoPorUnidad.maximo = costoPorUnidadMax;
    
    // Guardar en localStorage
    localStorage.setItem('configuracionSistema', JSON.stringify(configuracionGlobal));
    localStorage.setItem('rangosEspecificos', JSON.stringify(configuracionGlobal.rangos));
    
    actualizarRangosActualesMostrados();
    
    alert(`✅ Configuración de rangos para materiales aplicada exitosamente:\n\n` +
          `Materiales: $${costoPorUnidadMin.toFixed(2)} - $${costoPorUnidadMax.toFixed(2)}\n\n` +
          `Los cambios se aplicarán inmediatamente en la sección de materiales.`);
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
    console.log("🚀 Sistema de Gestión de Materiales iniciado");
    console.log("📚 Clases cargadas: Personal, Material, OtrosCostos");
    console.log("💡 Usa los botones para crear materiales y gestionar inventario");
    
    // Cargar configuración global al iniciar
    cargarConfiguracionGlobal();
    console.log("Configuración de rangos cargada desde configuración global");
    
    // Cargar materiales guardados al iniciar
    cargarMaterialesDesdeStorage();
    console.log(`Materiales en la lista: ${materialesCreados.length}`);
    
    // Mostrar lista inicial de materiales
    actualizarListaMateriales();
    
    // ===== VALIDACIÓN EN TIEMPO REAL =====
    
    // Agregar validación en tiempo real al modal de crear material
    document.getElementById('nombreMaterial').addEventListener('input', function() {
        const nombre = this.value;
        const error = validarNombreMaterial(nombre);
        const errorElement = document.getElementById('errorNombreMaterial');
        
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
    
    document.getElementById('costoPorUnidad').addEventListener('input', function() {
        const costo = parseFloat(this.value);
        const error = validarCosto(costo, 'costo por unidad', 'costoPorUnidad');
        const errorElement = document.getElementById('errorCostoPorUnidad');
        
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
    
    // Permitir crear material con Enter en los campos del formulario
    function handleEnterKey(event) {
        if (event.key === 'Enter') {
            validarYCrearMaterial();
        }
    }
    
    document.getElementById('nombreMaterial').addEventListener('keypress', handleEnterKey);
    document.getElementById('costoPorUnidad').addEventListener('keypress', handleEnterKey);
});