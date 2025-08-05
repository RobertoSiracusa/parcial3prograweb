/**
 * Clase OtrosCostos - Representa otros costos con información de costos e inventario
 */
class OtrosCostos {
    /**
     * Constructor de la clase OtrosCostos
     * @param {string} nombre - Nombre del costo
     * @param {number} costoPorUnidad - Costo por unidad (float)
     * @param {number} inventario - Cantidad en inventario (float)
     */
    constructor(nombre, costoPorUnidad, inventario = 0) {
        this.nombre = this.validarNombre(nombre);
        this.costoPorUnidad = parseFloat(costoPorUnidad);
        this.inventario = parseFloat(inventario);
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
     * Getter para obtener el nombre
     * @returns {string} Nombre del costo
     */
    getNombre() {
        return this.nombre;
    }

    /**
     * Setter para establecer el nombre
     * @param {string} nombre - Nuevo nombre del costo
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
     * Getter para obtener el inventario
     * @returns {number} Cantidad en inventario
     */
    getInventario() {
        return this.inventario;
    }

    /**
     * Setter para establecer el inventario
     * @param {number} cantidad - Nueva cantidad en inventario
     */
    setInventario(cantidad) {
        this.inventario = parseFloat(cantidad);
    }

    /**
     * Calcula el valor total del inventario
     * @returns {number} Valor total (inventario × costo por unidad)
     */
    calcularValorTotal() {
        return this.inventario * this.costoPorUnidad;
    }

    /**
     * Agrega unidades al inventario
     * @param {number} cantidad - Cantidad a agregar
     */
    agregarInventario(cantidad) {
        this.inventario += parseFloat(cantidad);
    }

    /**
     * Reduce unidades del inventario
     * @param {number} cantidad - Cantidad a reducir
     * @returns {boolean} True si fue posible, false si no hay suficiente inventario
     */
    reducirInventario(cantidad) {
        const cantidadFloat = parseFloat(cantidad);
        if (this.inventario >= cantidadFloat) {
            this.inventario -= cantidadFloat;
            return true;
        }
        return false;
    }


    /**
     * Devuelve una representación en string del objeto
     * @returns {string} Información del costo
     */
    toString() {
        return `Otros Costos: ${this.nombre}
        Costo por unidad: $${this.costoPorUnidad.toFixed(2)}
        Inventario: ${this.inventario} unidades
        Valor total: $${this.calcularValorTotal().toFixed(2)}`;
    }

    /**
     * Devuelve un objeto con toda la información del costo
     * @returns {Object} Objeto con la información completa
     */
    obtenerInformacion() {
        return {
            nombre: this.nombre,
            costoPorUnidad: this.costoPorUnidad,
            inventario: this.inventario,
            valorTotal: this.calcularValorTotal()
        };
    }
}

// Exportar la clase para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OtrosCostos;
}