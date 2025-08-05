/**
 * Clase OtrosGastos - Representa otros gastos del proyecto con información básica de costos
 */
class OtrosGastos {
    /**
     * Constructor de la clase OtrosGastos
     * @param {string} nombre - Nombre del gasto
     * @param {number} costoPorUnidad - Costo por unidad (float)
     * @param {string} descripcion - Descripción del gasto (opcional, máximo 80 caracteres)
     */
    constructor(nombre, costoPorUnidad, descripcion = '') {
        this.nombre = this.validarNombre(nombre);
        this.costoPorUnidad = parseFloat(costoPorUnidad);
        this.descripcion = this.validarDescripcion(descripcion);
    }

    /**
     * Valida que el nombre no contenga caracteres especiales prohibidos
     * @param {string} nombre - Nombre a validar
     * @returns {string} Nombre validado
     * @throws {Error} Si el nombre contiene caracteres prohibidos
     */
    validarNombre(nombre) {
        const caracteresProhibidos = /[!"·$%&/()=?¿'¡+`*\]^\[´.:,;\-_{}<>`~\\|]/;
        if (caracteresProhibidos.test(nombre)) {
            throw new Error(`El nombre "${nombre}" contiene caracteres no permitidos. Caracteres prohibidos: !"·$%&/()=?¿'¡+\`*]^[´.:,;-_{}<>\`~\\|`);
        }
        return nombre;
    }

    /**
     * Valida que la descripción no exceda los 80 caracteres
     * @param {string} descripcion - Descripción a validar
     * @returns {string} Descripción validada
     * @throws {Error} Si la descripción excede los 80 caracteres
     */
    validarDescripcion(descripcion) {
        if (descripcion.length > 80) {
            throw new Error(`La descripción no puede exceder los 80 caracteres. Longitud actual: ${descripcion.length}`);
        }
        return descripcion;
    }

    /**
     * Getter para obtener el nombre
     * @returns {string} Nombre del gasto
     */
    getNombre() {
        return this.nombre;
    }

    /**
     * Setter para establecer el nombre
     * @param {string} nombre - Nuevo nombre del gasto
     */
    setNombre(nombre) {
        this.nombre = this.validarNombre(nombre);
    }

    /**
     * Getter para obtener el costo por unidad
     * @returns {number} Costo por unidad
     */
    getCostoPorUnidad() {
        return this.costoPorUnidad;
    }

    /**
     * Setter para establecer el costo por unidad
     * @param {number} costo - Nuevo costo por unidad
     */
    setCostoPorUnidad(costo) {
        this.costoPorUnidad = parseFloat(costo);
    }

    /**
     * Getter para obtener la descripción
     * @returns {string} Descripción del gasto
     */
    getDescripcion() {
        return this.descripcion;
    }

    /**
     * Setter para establecer la descripción
     * @param {string} descripcion - Nueva descripción del gasto
     */
    setDescripcion(descripcion) {
        this.descripcion = this.validarDescripcion(descripcion);
    }

    /**
     * Calcula el costo total para una cantidad específica
     * @param {number} cantidad - Cantidad de unidades
     * @returns {number} Costo total (cantidad × costo por unidad)
     */
    calcularCostoTotal(cantidad = 1) {
        return parseFloat(cantidad) * this.costoPorUnidad;
    }

    /**
     * Devuelve una representación en string del objeto
     * @returns {string} Información del gasto
     */
    toString() {
        let info = `Otros Gastos: ${this.nombre}
        Costo por unidad: $${this.costoPorUnidad.toFixed(2)}`;
        
        if (this.descripcion) {
            info += `\n        Descripción: ${this.descripcion}`;
        }
        
        return info;
    }

    /**
     * Devuelve un objeto con toda la información del gasto
     * @returns {Object} Objeto con la información completa
     */
    obtenerInformacion() {
        return {
            nombre: this.nombre,
            costoPorUnidad: this.costoPorUnidad,
            descripcion: this.descripcion
        };
    }
}

// Exportar la clase para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OtrosGastos;
}