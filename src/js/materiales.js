// ===== SISTEMA DE GESTIÓN DE MATERIALES =====
// Array global para almacenar todos los materiales creados
let materialesCreados = [];

// Función para verificar si un material está siendo usado en tareas activas
function verificarMaterialEnTareasActivas(nombreMaterial) {
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
                // Verificar si el material está asignado a esta tarea
                if (tarea.materiales && Array.isArray(tarea.materiales)) {
                    const materialAsignado = tarea.materiales.find(mat => mat.nombreMaterial === nombreMaterial);
                    if (materialAsignado) {
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
        console.error('Error al verificar material en tareas:', error);
        return null;
    }
}

// Función para mostrar advertencia cuando un material está en tareas activas
function mostrarAdvertenciaMaterialEnTareas(nombreMaterial, tareasActivas) {
    const tareasList = tareasActivas.map(tarea => 
        `• "${tarea.nombre}" (${tarea.estado})`
    ).join('\n');
    
    const mensaje = `No se puede eliminar el material "${nombreMaterial}" porque está asignado a las siguientes tareas activas:\n\n${tareasList}\n\nPara poder eliminar este material, primero debe completar o cancelar estas tareas.`;
    
    // Actualizar el mensaje en el modal
    document.getElementById('mensajeAdvertenciaMaterialEnTareas').textContent = mensaje;
    
    // Mostrar el modal de advertencia
    document.getElementById('modalAdvertenciaMaterialEnTareas').style.display = 'block';
}

// Función para cerrar el modal de advertencia
function cerrarModalAdvertenciaMaterialEnTareas() {
    document.getElementById('modalAdvertenciaMaterialEnTareas').style.display = 'none';
}

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

// Función para obtener el siguiente ID disponible
function obtenerSiguienteIDMaterial() {
    if (materialesCreados.length === 0) {
        return 1;
    }
    
    // Obtener todos los IDs existentes
    const idsExistentes = materialesCreados.map(item => item.id).sort((a, b) => a - b);
    
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

// Función para agregar material a la lista
function agregarMaterialALista(material) {
    const siguienteID = obtenerSiguienteIDMaterial();
    materialesCreados.push({
        material: material,
        fechaCreacion: new Date(),
        id: siguienteID
    });
    console.log(`✅ Material agregado a la lista: ${material.getNombreMaterial()} con ID: ${siguienteID}`);
    guardarMaterialesEnStorage(); // Guardar en localStorage
    actualizarContadorMateriales();
    actualizarListaMateriales(); // Actualizar automáticamente la lista en la página
}

// Función para actualizar la lista de materiales en la página
function actualizarListaMateriales() {
    const estadisticasDiv = document.getElementById('estadisticasMateriales');
    const listaDiv = document.getElementById('listaMateriales');
    
    if (materialesCreados.length === 0) {
        estadisticasDiv.innerHTML = '<p class="empty-stats"> No hay materiales creados aún</p>';
        listaDiv.innerHTML = '<p class="empty-state">Crea tu primer material usando los botones de arriba</p>';
        return;
    }
    
    // Calcular estadísticas
    const totalMateriales = materialesCreados.length;
    const costoPromedioUnidad = materialesCreados.reduce((sum, item) => sum + item.material.getCostoPorUnidad(), 0) / totalMateriales;
    const totalInventario = materialesCreados.reduce((sum, item) => sum + item.material.getInventario(), 0);
    const valorTotalInventario = materialesCreados.reduce((sum, item) => sum + item.material.calcularValorTotal(), 0);
    
    // Mostrar estadísticas con el formato correcto
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
                <div class="stat-value purple">${totalInventario}</div>
                <div class="stat-label">Total Unidades</div>
            </div>
            <div class="stat-card">
                <div class="stat-value warning">$${valorTotalInventario.toFixed(2)}</div>
                <div class="stat-label">Valor Total Inventario</div>
            </div>
        </div>
    `;
    
    // Mostrar lista de materiales con el mismo formato que empleados
    let listaHTML = '<h3 class="employees-title"><img src="../storage/vectors/layers-svgrepo-com.svg" alt="" class="layers-icon-large">Lista Detallada</h3>';
    
    materialesCreados.forEach((item, index) => {
        const material = item.material;
        const fechaFormateada = item.fechaCreacion.toLocaleString('es-ES');
        
        listaHTML += `
            <div class="employee-card">
                <div class="employee-header">
                    <h4 class="employee-name"><img src="../storage/vectors/layers-svgrepo-com.svg" alt="" class="layers-icon-large"> ${material.getNombreMaterial()}</h4>
                    <span class="employee-id">ID: ${item.id}</span>
                </div>
                
                <div class="employee-details">
                    <div class="employee-detail"><strong><img src="../storage/vectors/cash-register-svgrepo-com.svg" alt="" class="cash-register-icon"> Costo/Unidad:</strong> $${material.getCostoPorUnidad().toFixed(2)}</div>
                    <div class="employee-detail"><strong><img src="../storage/vectors/shapes-svgrepo-com.svg" alt="" class="briefcase-icon"> Inventario:</strong> ${material.getInventario()} unidades</div>
                    <div class="employee-detail"><strong><img src="../storage/vectors/badge-dollar-svgrepo-com.svg" alt="" class="coins-icon"> Valor Total:</strong> $${material.calcularValorTotal().toFixed(2)}</div>
                </div>
                
                <div class="employee-date">
                    <img src="../storage/vectors/clock-svgrepo-com.svg" alt="" class="clock-icon"> Creado: ${fechaFormateada}
                </div>
                
                <div class="employee-actions">
                    <button onclick="gestionarInventario(${index})" class="button button-info">
                        <img src="../storage/vectors/briefcase-svgrepo-com.svg" alt="" class="button-icon">Gestionar Inventario
                    </button>
                    <button onclick="eliminarMaterial(${index})" class="button button-danger">
                        <img src="../storage/vectors/trash-svgrepo-com.svg" alt="" class="button-icon">Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    listaDiv.innerHTML = listaHTML;
}

// Variable global para almacenar el índice del material seleccionado
let materialSeleccionadoIndex = -1;

// Función para gestionar el inventario de un material
function gestionarInventario(index) {
    materialSeleccionadoIndex = index;
    const material = materialesCreados[index].material;
    
    // Mostrar información del material en el modal
    document.getElementById('infoMaterialInventario').innerHTML = `
        <h4>${material.getNombreMaterial()}</h4>
        <div class="material-info-grid">
            <div class="material-info-item">
                <span class="material-info-label">Costo por Unidad:</span>
                <span class="material-info-value">$${material.getCostoPorUnidad().toFixed(2)}</span>
            </div>
            <div class="material-info-item">
                <span class="material-info-label">Inventario Actual:</span>
                <span class="material-info-value ${material.getInventario() > 0 ? 'success' : 'warning'}">${material.getInventario()} unidades</span>
            </div>
            <div class="material-info-item">
                <span class="material-info-label">Valor Total:</span>
                <span class="material-info-value">$${material.calcularValorTotal().toFixed(2)}</span>
            </div>
        </div>
    `;
    
    // Limpiar formulario y abrir modal
    limpiarFormularioInventario();
    document.getElementById('modalGestionarInventario').style.display = 'block';
}

// Función para cerrar el modal de gestión de inventario
function cerrarModalGestionarInventario() {
    document.getElementById('modalGestionarInventario').style.display = 'none';
    limpiarFormularioInventario();
    materialSeleccionadoIndex = -1;
}

// Función para limpiar el formulario de inventario
function limpiarFormularioInventario() {
    document.getElementById('cantidadInventario').value = '';
    document.getElementById('accionInventario').value = 'agregar';
    document.getElementById('errorCantidadInventario').textContent = '';
    document.getElementById('errorAccionInventario').textContent = '';
}

// Función para validar la cantidad de inventario
function validarCantidadInventario(cantidad) {
    if (cantidad === null || cantidad === "") {
        return "La cantidad no puede estar vacía";
    }
    
    if (isNaN(cantidad)) {
        return "La cantidad debe ser un número válido";
    }
    
    if (cantidad <= 0) {
        return "La cantidad debe ser mayor a 0";
    }
    
    return null; // Sin errores
}

// Función para validar si se puede quitar la cantidad especificada
function validarQuitarInventario(cantidad, inventarioActual) {
    if (cantidad > inventarioActual) {
        return `No hay suficiente inventario. Disponible: ${inventarioActual} unidades, Solicitado: ${cantidad} unidades`;
    }
    
    return null; // Sin errores
}

// Función para aplicar el cambio de inventario
function aplicarCambioInventario() {
    if (materialSeleccionadoIndex === -1) {
        return;
    }
    
    const cantidad = parseFloat(document.getElementById('cantidadInventario').value);
    const accion = document.getElementById('accionInventario').value;
    const material = materialesCreados[materialSeleccionadoIndex].material;
    
    // Validar cantidad
    const errorCantidad = validarCantidadInventario(cantidad);
    if (errorCantidad) {
        document.getElementById('errorCantidadInventario').textContent = '❌ ' + errorCantidad;
        return;
    }
    
    document.getElementById('errorCantidadInventario').textContent = '✅ Cantidad válida';
    
    // Validar acción de quitar
    if (accion === 'quitar') {
        const errorQuitar = validarQuitarInventario(cantidad, material.getInventario());
        if (errorQuitar) {
            document.getElementById('errorAccionInventario').textContent = '❌ ' + errorQuitar;
            return;
        }
    }
    
    document.getElementById('errorAccionInventario').textContent = '✅ Acción válida';
    
    // Aplicar cambio directamente
    if (accion === 'agregar') {
        material.agregarInventario(cantidad);
    } else if (accion === 'quitar') {
        material.reducirInventario(cantidad);
    }
    
    // Guardar cambios y actualizar interfaz
    guardarMaterialesEnStorage();
    actualizarListaMateriales();
    cerrarModalGestionarInventario();
}

// Variable global para almacenar el índice del material a eliminar
let materialAEliminarIndex = -1;

// Función para eliminar un material específico
function eliminarMaterial(index) {
    const nombreMaterial = materialesCreados[index].material.getNombreMaterial();
    
    // Verificar si el material está siendo usado en tareas activas
    const tareasActivas = verificarMaterialEnTareasActivas(nombreMaterial);
    
    if (tareasActivas) {
        // El material está siendo usado en tareas activas, mostrar advertencia
        mostrarAdvertenciaMaterialEnTareas(nombreMaterial, tareasActivas);
        return;
    }
    
    // Si no está siendo usado, proceder con la eliminación normal
    materialAEliminarIndex = index;
    document.getElementById('mensajeConfirmacionEliminarMaterial').textContent = 
        `¿Está seguro de que desea eliminar "${nombreMaterial}"?`;
    document.getElementById('modalConfirmacionEliminarMaterial').style.display = 'block';
}

// Función para cerrar el modal de confirmación de eliminación
function cerrarModalConfirmacionEliminarMaterial() {
    document.getElementById('modalConfirmacionEliminarMaterial').style.display = 'none';
    materialAEliminarIndex = -1;
}

// Función para confirmar la eliminación del material
function confirmarEliminacionMaterial() {
    if (materialAEliminarIndex === -1) {
        console.error('No hay material seleccionado para eliminar');
        return;
    }
    
    const nombreEliminado = materialesCreados[materialAEliminarIndex].material.getNombreMaterial();
    materialesCreados.splice(materialAEliminarIndex, 1);
    guardarMaterialesEnStorage(); // Guardar cambios en localStorage
    console.log(`❌ Material eliminado: ${nombreEliminado}`);
    actualizarListaMateriales();
    actualizarContadorMateriales();
    cerrarModalConfirmacionEliminarMaterial();
}

// Función para limpiar toda la lista
function limpiarListaMateriales() {
    if (materialesCreados.length === 0) {
        console.log('📭 La lista ya está vacía');
        return;
    }
    
    materialesCreados = [];
    guardarMaterialesEnStorage(); // Guardar cambios en localStorage
    actualizarListaMateriales();
    actualizarContadorMateriales();
    console.log('✅ Lista de materiales limpiada exitosamente');
}



// ===== GESTIÓN DE MODALES =====

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modalCrearMaterial = document.getElementById('modalCrearMaterial');
    const modalGestionarInventario = document.getElementById('modalGestionarInventario');
    const modalConfiguracion = document.getElementById('modalConfiguracion');
    const modalConfirmacionEliminarMaterial = document.getElementById('modalConfirmacionEliminarMaterial');
    const modalAdvertenciaMaterialEnTareas = document.getElementById('modalAdvertenciaMaterialEnTareas');
    
    if (event.target === modalCrearMaterial) {
        cerrarModalCrearMaterial();
    }
    if (event.target === modalGestionarInventario) {
        cerrarModalGestionarInventario();
    }
    if (event.target === modalConfiguracion) {
        cerrarModalConfiguracion();
    }
    if (event.target === modalConfirmacionEliminarMaterial) {
        cerrarModalConfirmacionEliminarMaterial();
    }
    if (event.target === modalAdvertenciaMaterialEnTareas) {
        cerrarModalAdvertenciaMaterialEnTareas();
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



// ===== MODAL DE CREAR MATERIAL =====

// Función para abrir el modal de crear material
function crearMaterialPersonalizado() {
    // Obtener el máximo configurado globalmente
    const maximoConfigurado = configuracionGlobal.maximoCosteMaterial || 1000;
    
    // Actualizar información de rango en el modal
    document.getElementById('rangoInfoMaterial').textContent = 
        `Máximo: $${maximoConfigurado.toFixed(2)}`;
    
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
    
    // Limpiar clases CSS de validación
    document.getElementById('nombreMaterial').classList.remove('valid', 'invalid');
    document.getElementById('costoPorUnidad').classList.remove('valid', 'invalid');
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
    if (isNaN(costo) || costo <= 0) {
        return `El ${tipo} debe ser un número positivo`;
    }
    
    // Para materiales, usar el máximo configurado globalmente
    if (tipoRango === 'costoPorUnidad') {
        const maximoConfigurado = configuracionGlobal.maximoCosteMaterial || 1000;
        if (costo > maximoConfigurado) {
            return `El ${tipo} no puede superar $${maximoConfigurado.toFixed(2)}`;
        }
    } else {
        // Para otros tipos, usar los rangos existentes
        const rangos = obtenerRangos(tipoRango);
        if (!rangos) return "Error al obtener rangos de configuración";
        
        if (costo < rangos.minimo || costo > rangos.maximo) {
            return `El ${tipo} debe estar entre $${rangos.minimo.toFixed(2)} y $${rangos.maximo.toFixed(2)}`;
        }
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
    
    // Si hay errores, mostrar indicador visual en lugar de alerta
    if (tieneErrores) {
        // Agregar clase de error al modal
        const modalContent = document.querySelector('#modalCrearMaterial .modal-content');
        modalContent.classList.add('modal-error');
        
        // Remover la clase después de 3 segundos
        setTimeout(() => {
            modalContent.classList.remove('modal-error');
        }, 3000);
        
        return;
    }
    
    // Crear material
    try {
        const maximoConfigurado = configuracionGlobal.maximoCosteMaterial || 1000;
        console.log("=== CREANDO MATERIAL DESDE MODAL ===");
        console.log(`Máximo configurado: $${maximoConfigurado}`);
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
    datos: { autoguardado: true, backupAutomatico: true },
    maximoCosteMaterial: 1000
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
    
    // Cargar valor del máximo coste de material
    document.getElementById('maximoCosteMaterial').value = configuracionGlobal.maximoCosteMaterial;
    
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

// Función para aplicar la configuración del máximo coste de material
function aplicarConfiguracionMaximoCoste() {
    const maximoCoste = parseFloat(document.getElementById('maximoCosteMaterial').value);
    
    // Validar que el valor sea válido
    if (isNaN(maximoCoste) || maximoCoste <= 0) {
        // Mostrar error visual en el campo
        const input = document.getElementById('maximoCosteMaterial');
        input.classList.add('invalid');
        input.style.borderColor = '#e74c3c';
        return;
    }
    
    // Actualizar la configuración global
    configuracionGlobal.maximoCosteMaterial = maximoCoste;
    
    // Guardar en localStorage
    localStorage.setItem('configuracionSistema', JSON.stringify(configuracionGlobal));
    
    // Mostrar confirmación visual
    const input = document.getElementById('maximoCosteMaterial');
    input.classList.remove('invalid');
    input.classList.add('valid');
    input.style.borderColor = '#27ae60';
    
    // Cerrar el modal después de un breve delay
    setTimeout(() => {
        cerrarModalConfiguracion();
    }, 1000);
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
    
    // ===== VALIDACIÓN EN TIEMPO REAL PARA INVENTARIO =====
    
    // Agregar validación en tiempo real al modal de gestión de inventario
    document.getElementById('cantidadInventario').addEventListener('input', function() {
        const cantidad = parseFloat(this.value);
        const accion = document.getElementById('accionInventario').value;
        const material = materialSeleccionadoIndex !== -1 ? materialesCreados[materialSeleccionadoIndex].material : null;
        
        const error = validarCantidadInventario(cantidad);
        const errorElement = document.getElementById('errorCantidadInventario');
        
        if (this.value === '') {
            errorElement.textContent = '';
            this.classList.remove('valid', 'invalid');
        } else if (error) {
            errorElement.textContent = '❌ ' + error;
            this.classList.remove('valid');
            this.classList.add('invalid');
        } else {
            errorElement.textContent = '✅ Cantidad válida';
            this.classList.remove('invalid');
            this.classList.add('valid');
            
            // Validar acción de quitar si hay material seleccionado
            if (material && accion === 'quitar') {
                const errorQuitar = validarQuitarInventario(cantidad, material.getInventario());
                const errorAccionElement = document.getElementById('errorAccionInventario');
                
                if (errorQuitar) {
                    errorAccionElement.textContent = '❌ ' + errorQuitar;
                } else {
                    errorAccionElement.textContent = '✅ Acción válida';
                }
            }
        }
    });
    
    // Agregar validación en tiempo real al selector de acción
    document.getElementById('accionInventario').addEventListener('change', function() {
        const cantidad = parseFloat(document.getElementById('cantidadInventario').value);
        const accion = this.value;
        const material = materialSeleccionadoIndex !== -1 ? materialesCreados[materialSeleccionadoIndex].material : null;
        
        if (material && accion === 'quitar' && cantidad > 0) {
            const errorQuitar = validarQuitarInventario(cantidad, material.getInventario());
            const errorAccionElement = document.getElementById('errorAccionInventario');
            
            if (errorQuitar) {
                errorAccionElement.textContent = '❌ ' + errorQuitar;
            } else {
                errorAccionElement.textContent = '✅ Acción válida';
            }
        } else {
            document.getElementById('errorAccionInventario').textContent = '';
        }
    });
    
    // Permitir aplicar cambio con Enter en el campo de cantidad
    document.getElementById('cantidadInventario').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            aplicarCambioInventario();
        }
    });
    
    // ===== CERRAR MODALES CON TECLA ESCAPE =====
    
    // Cerrar modales con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modalCrearMaterial = document.getElementById('modalCrearMaterial');
            const modalGestionarInventario = document.getElementById('modalGestionarInventario');
            const modalConfiguracion = document.getElementById('modalConfiguracion');
            const modalConfirmacionEliminarMaterial = document.getElementById('modalConfirmacionEliminarMaterial');
            const modalAdvertenciaMaterialEnTareas = document.getElementById('modalAdvertenciaMaterialEnTareas');
            
            if (modalCrearMaterial.style.display === 'block') {
                cerrarModalCrearMaterial();
            }
            
            if (modalGestionarInventario.style.display === 'block') {
                cerrarModalGestionarInventario();
            }
            
            if (modalConfiguracion.style.display === 'block') {
                cerrarModalConfiguracion();
            }
            
            if (modalConfirmacionEliminarMaterial.style.display === 'block') {
                cerrarModalConfirmacionEliminarMaterial();
            }
            
            if (modalAdvertenciaMaterialEnTareas.style.display === 'block') {
                cerrarModalAdvertenciaMaterialEnTareas();
            }
        }
    });
});