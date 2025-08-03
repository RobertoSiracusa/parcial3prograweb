// ===== CLASE TAREA =====
// Clase para representar una tarea del proyecto
class Tarea {
    constructor(nombre, personal = null, material = null, otrosGastos = null, duracion = 0) {
        this.nombre = this._validarNombre(nombre);
        this.personal = personal; // Instancia de Personal o null
        this.material = material; // Instancia de Material o null
        this.otrosGastos = otrosGastos; // Instancia de OtrosCostos o null
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

    getMaterial() {
        return this.material;
    }

    getOtrosGastos() {
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
        this.personal = personal;
    }

    setMaterial(material) {
        this.material = material;
    }

    setOtrosGastos(otrosGastos) {
        this.otrosGastos = otrosGastos;
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
        if (this.personal) {
            const costoPersonal = this.personal.calcularCostoPorHoras(this.duracion);
            costoTotal += costoPersonal;
        }

        // Costo del material (si está asignado)
        if (this.material) {
            // Asumimos que se usa 1 unidad del material por defecto
            const costoMaterial = this.material.getCostoPorUnidad();
            costoTotal += costoMaterial;
        }

        // Otros gastos (si están asignados)
        if (this.otrosGastos) {
            // Asumimos que se usa 1 unidad por defecto
            const costoOtros = this.otrosGastos.getCostoPorUnidad();
            costoTotal += costoOtros;
        }

        return costoTotal;
    }

    // Método para obtener desglose detallado del costo del personal (con días múltiples)
    obtenerDesgloseCostoPersonal() {
        if (!this.personal) {
            return {
                horasTotal: 0,
                diasCompletos: 0,
                horasRestantes: 0,
                desgloseDias: [],
                costoTotalPersonal: 0
            };
        }

        return this.personal.obtenerDesgloseCostoPorHoras(this.duracion);
    }

    // Método para obtener resumen de la tarea
    obtenerResumen() {
        return {
            nombre: this.nombre,
            duracion: this.duracion,
            estado: this.estado,
            costoTotal: this.calcularCostoTotal(),
            tienePersonal: this.personal !== null,
            tieneMaterial: this.material !== null,
            tieneOtrosGastos: this.otrosGastos !== null,
            fechaCreacion: this.fechaCreacion
        };
    }

    // Método para mostrar información detallada
    mostrarDetalles() {
        let detalles = `Tarea: ${this.nombre}\n`;
        detalles += `Duración: ${this.duracion} horas\n`;
        detalles += `Estado: ${this.estado}\n`;
        detalles += `Fecha de creación: ${this.fechaCreacion.toLocaleDateString()}\n\n`;

        if (this.personal) {
            const desglose = this.obtenerDesgloseCostoPersonal();
            detalles += `Personal asignado: ${this.personal.getNombre()}\n`;
            detalles += `  • Duración total: ${desglose.horasTotal}h\n`;
            
            if (desglose.diasCompletos > 0) {
                detalles += `  • Días completos: ${desglose.diasCompletos} (12h cada uno)\n`;
            }
            if (desglose.horasRestantes > 0) {
                detalles += `  • Horas restantes: ${desglose.horasRestantes}h\n`;
            }
            detalles += `\n`;
            
            // Mostrar desglose por día
            desglose.desgloseDias.forEach(dia => {
                detalles += `  <img src="../storage/vectors/coins-svgrepo-com.svg" alt="" class="coins-icon"> Día ${dia.dia}:\n`;
                detalles += `    <img src="../storage/vectors/alarm-exclamation-svgrepo-com.svg" alt="" class="alarm-exclamation-icon"> ${dia.horasNormales}h normales × $${this.personal.getCostoPorHora().toFixed(2)}/h = $${dia.costoHorasNormales.toFixed(2)}\n`;
                if (dia.horasExtra > 0) {
                    detalles += `    <img src="../storage/vectors/alarm-exclamation-svgrepo-com.svg" alt="" class="alarm-exclamation-icon"> ${dia.horasExtra}h extra × $${this.personal.getCostoPorHoraExtra().toFixed(2)}/h = $${dia.costoHorasExtra.toFixed(2)}\n`;
                }
                detalles += `    Subtotal día ${dia.dia}: $${dia.costoTotalDia.toFixed(2)}\n\n`;
            });
            
            detalles += `  • Costo total personal: $${desglose.costoTotal.toFixed(2)}\n`;
        } else {
            detalles += `Personal: No asignado\n`;
        }

        if (this.material) {
            detalles += `Material: ${this.material.getNombreMaterial()}\n`;
            detalles += `Costo material: $${this.material.getCostoPorUnidad().toFixed(2)}\n`;
        } else {
            detalles += `Material: No asignado\n`;
        }

        if (this.otrosGastos) {
            detalles += `Otros gastos: ${this.otrosGastos.getNombre()}\n`;
            detalles += `Costo otros gastos: $${this.otrosGastos.getCostoPorUnidad().toFixed(2)}\n`;
        } else {
            detalles += `Otros gastos: No asignados\n`;
        }

        detalles += `\nCosto total: $${this.calcularCostoTotal().toFixed(2)}`;

        return detalles;
    }
}