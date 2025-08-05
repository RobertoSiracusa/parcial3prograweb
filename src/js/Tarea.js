// ===== CLASE TAREA =====
// Clase para representar una tarea del proyecto
class Tarea {
    constructor(nombre, personal = null, materiales = null, otrosGastos = null, duracion = 0) {
        this.nombre = this._validarNombre(nombre);
        this.personal = Array.isArray(personal) ? personal : (personal ? [personal] : []); // Array de instancias de Personal
        this.materiales = Array.isArray(materiales) ? materiales : (materiales ? [materiales] : []); // Array de instancias de Material
        this.otrosGastos = Array.isArray(otrosGastos) ? otrosGastos : (otrosGastos ? [otrosGastos] : []); // Array de instancias de OtrosCostos
        this.duracion = this._validarDuracion(duracion); // En horas
        this.fechaCreacion = new Date();
        this.estado = 'pendiente'; // pendiente, en_progreso, completada
    }

    // Validación de nombre
    _validarNombre(nombre) {
        if (!nombre || typeof nombre !== 'string') {
            throw new Error('El nombre de la tarea es requerido y debe ser un string');
        }
        
        const nombreLimpio = nombre.trim();
        if (nombreLimpio.length === 0) {
            throw new Error('El nombre de la tarea no puede estar vacío');
        }
        
        // Caracteres prohibidos para nombres
        const caracteresProhibidos = `!"·$%&/()=?¿'¡+\`*]^[´.:,;-_{}<>\`~\\|`;
        for (let char of caracteresProhibidos) {
            if (nombreLimpio.includes(char)) {
                throw new Error(`El carácter "${char}" no está permitido en el nombre de la tarea`);
            }
        }
        
        return nombreLimpio;
    }

    // Validación de duración
    _validarDuracion(duracion) {
        const duracionNum = parseFloat(duracion);
        if (isNaN(duracionNum) || duracionNum < 0) {
            throw new Error('La duración debe ser un número positivo');
        }
        return duracionNum;
    }

    // Getters
    getNombre() {
        return this.nombre;
    }

    getPersonal() {
        return this.personal;
    }

    getPersonalArray() {
        return this.personal;
    }

    getPrimerPersonal() {
        return this.personal.length > 0 ? this.personal[0] : null;
    }

    getMaterial() {
        return this.materiales.length > 0 ? this.materiales[0] : null; // Para compatibilidad
    }

    getMateriales() {
        return this.materiales;
    }

    getOtrosGastos() {
        return this.otrosGastos.length > 0 ? this.otrosGastos[0] : null; // Para compatibilidad
    }

    getOtrosGastosArray() {
        return this.otrosGastos;
    }

    getDuracion() {
        return this.duracion;
    }

    getEstado() {
        return this.estado;
    }

    getFechaCreacion() {
        return this.fechaCreacion;
    }

    // Setters
    setPersonal(personal) {
        this.personal = Array.isArray(personal) ? personal : (personal ? [personal] : []);
    }

    setMaterial(material) {
        this.materiales = Array.isArray(material) ? material : (material ? [material] : []); // Para compatibilidad
    }

    setMateriales(materiales) {
        this.materiales = Array.isArray(materiales) ? materiales : (materiales ? [materiales] : []);
    }


    setOtrosGastos(otrosGastos) {
        this.otrosGastos = Array.isArray(otrosGastos) ? otrosGastos : (otrosGastos ? [otrosGastos] : []); // Para compatibilidad
    }

    setOtrosGastosArray(otrosGastos) {
        this.otrosGastos = Array.isArray(otrosGastos) ? otrosGastos : (otrosGastos ? [otrosGastos] : []);
    }


    setDuracion(duracion) {
        this.duracion = this._validarDuracion(duracion);
    }

    setEstado(estado) {
        const estadosValidos = ['pendiente', 'en_progreso', 'completada'];
        if (!estadosValidos.includes(estado)) {
            throw new Error('Estado inválido. Debe ser: pendiente, en_progreso o completada');
        }
        this.estado = estado;
    }

    // Métodos de cálculo
    calcularCostoTotal() {
        let costoTotal = 0;

        // Costo del personal (si está asignado)
        if (this.personal && this.personal.length > 0) {
            // Dividir la duración entre todos los empleados
            const duracionPorEmpleado = Math.round((this.duracion / this.personal.length) * 100) / 100;
            this.personal.forEach(empleado => {
                const costoPersonal = empleado.calcularCostoPorHoras(duracionPorEmpleado);
                costoTotal += costoPersonal;
            });
        }

        // Costo de los materiales (si están asignados)
        if (this.materiales && this.materiales.length > 0) {
            this.materiales.forEach(material => {
                // Calcular cantidad necesaria basada en la duración de la tarea
                // Asumimos que se necesita 1 unidad por cada 4 horas de trabajo
                const cantidadNecesaria = Math.ceil(this.duracion / 4);
                const costoMaterial = material.getCostoPorUnidad() * cantidadNecesaria;
                costoTotal += costoMaterial;
            });
        }

        // Costo de otros gastos (si están asignados)
        if (this.otrosGastos && this.otrosGastos.length > 0) {
            this.otrosGastos.forEach(gasto => {
                // Calcular cantidad necesaria basada en la duración de la tarea
                // Asumimos que se necesita 1 unidad por cada 8 horas de trabajo
                const cantidadNecesaria = Math.ceil(this.duracion / 8);
                const costoGasto = gasto.getCostoPorUnidad() * cantidadNecesaria;
                costoTotal += costoGasto;
            });
        }

        return costoTotal;
    }

    // Método para obtener desglose detallado del costo del personal (con días múltiples)
    obtenerDesgloseCostoPersonal() {
        if (!this.personal || this.personal.length === 0) {
            return {
                horasTotal: 0,
                diasCompletos: 0,
                horasRestantes: 0,
                desgloseDias: [],
                costoTotalPersonal: 0
            };
        }

        // Si hay múltiples empleados, dividir la duración
        const duracionPorEmpleado = Math.round((this.duracion / this.personal.length) * 100) / 100;
        return this.personal[0].obtenerDesgloseCostoPorHoras(duracionPorEmpleado);
    }

    // Método para obtener resumen de la tarea
    obtenerResumen() {
        return {
            nombre: this.nombre,
            duracion: this.duracion,
            estado: this.estado,
            costoTotal: this.calcularCostoTotal(),
            tienePersonal: this.personal.length > 0,
            tieneMateriales: this.materiales.length > 0,
            tieneOtrosGastos: this.otrosGastos.length > 0,
            cantidadPersonal: this.personal.length,
            cantidadMateriales: this.materiales.length,
            cantidadOtrosGastos: this.otrosGastos.length,
            fechaCreacion: this.fechaCreacion
        };
    }

    // Método para mostrar información detallada
    mostrarDetalles() {
        let detalles = `Tarea: ${this.nombre}\n`;
        detalles += `Duración: ${this.duracion} horas\n`;
        detalles += `Estado: ${this.estado}\n`;
        detalles += `Fecha de creación: ${this.fechaCreacion.toLocaleDateString()}\n\n`;

        if (this.personal && this.personal.length > 0) {
            detalles += `Personal asignado: ${this.personal.length} empleado(s)\n`;
            this.personal.forEach((empleado, index) => {
                const duracionPorEmpleado = this.duracion / this.personal.length;
                const desglose = empleado.obtenerDesgloseCostoPorHoras(duracionPorEmpleado);
                detalles += `  ${index + 1}. ${empleado.getNombre()} (${duracionPorEmpleado.toFixed(1)}h)\n`;
                detalles += `    • Costo: $${desglose.costoTotal.toFixed(2)}\n`;
            });
            detalles += `\n`;
        } else {
            detalles += `Personal: No asignado\n`;
        }

        if (this.materiales && this.materiales.length > 0) {
            detalles += `Materiales asignados: ${this.materiales.length} material(es)\n`;
            this.materiales.forEach((material, index) => {
                const cantidadNecesaria = Math.ceil(this.duracion / 4);
                const costoMaterial = material.getCostoPorUnidad() * cantidadNecesaria;
                detalles += `  ${index + 1}. ${material.getNombreMaterial()} (${cantidadNecesaria} unidades)\n`;
                detalles += `    • Costo: $${costoMaterial.toFixed(2)}\n`;
            });
            detalles += `\n`;
        } else {
            detalles += `Materiales: No asignados\n`;
        }

        if (this.otrosGastos && this.otrosGastos.length > 0) {
            detalles += `Otros gastos asignados: ${this.otrosGastos.length} gasto(s)\n`;
            this.otrosGastos.forEach((gasto, index) => {
                const cantidadNecesaria = Math.ceil(this.duracion / 8);
                const costoGasto = gasto.getCostoPorUnidad() * cantidadNecesaria;
                detalles += `  ${index + 1}. ${gasto.getNombre()} (${cantidadNecesaria} unidades)\n`;
                detalles += `    • Costo: $${costoGasto.toFixed(2)}\n`;
            });
            detalles += `\n`;
        } else {
            detalles += `Otros gastos: No asignados\n`;
        }

        detalles += `\nCosto total: $${this.calcularCostoTotal().toFixed(2)}`;

        return detalles;
    }
}