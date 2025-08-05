/**
 * Clase Personal - Representa un empleado con información de costos y horas trabajadas
 */
class Personal {
    /**
     * Constructor de la clase Personal
     * @param {string} nombre - Nombre del empleado
     * @param {number} costoPorHora - Costo por hora normal (float)
     * @param {number} costoPorHoraExtra - Costo por hora extra (float)
     * @param {number} rangoMinimo - Valor mínimo permitido para costos
     * @param {number} rangoMaximo - Valor máximo permitido para costos
     */
    constructor(nombre, costoPorHora, costoPorHoraExtra, rangoMinimo = 0, rangoMaximo = 999999) {
        this.nombre = this.validarNombre(nombre);
        this.costoPorHora = parseFloat(costoPorHora);
        this.costoPorHoraExtra = parseFloat(costoPorHoraExtra);
        this.horasTrabajadas = 0; // Siempre comienza en 0
        
        // Validar costos en el constructor
        this.validarCostosEnConstructor(rangoMinimo, rangoMaximo);
    }

    /**
     * Valida los costos en el constructor con bucle hasta obtener valores válidos
     * @param {number} minimo - Valor mínimo permitido
     * @param {number} maximo - Valor máximo permitido
     */
    validarCostosEnConstructor(minimo, maximo) {
        const min = parseFloat(minimo);
        const max = parseFloat(maximo);
        
        // Validar costo por hora
        if (this.costoPorHora < min || this.costoPorHora > max) {
            let nuevoCosto;
            let esValido = false;
            
            while (!esValido) {
                nuevoCosto = parseFloat(prompt(`El costo por hora ($${this.costoPorHora}) está fuera del rango.\nIngrese el costo por hora (rango: $${min} - $${max}):`));
                
                if (isNaN(nuevoCosto)) {
                    alert("Por favor ingrese un número válido");
                    continue;
                }
                
                if (nuevoCosto >= min && nuevoCosto <= max) {
                    esValido = true;
                    this.costoPorHora = nuevoCosto;
                } else {
                    alert("El costo esta fuera del rango del proyecto");
                }
            }
        }
        
        // Validar costo por hora extra
        if (this.costoPorHoraExtra < min || this.costoPorHoraExtra > max) {
            let nuevoCosto;
            let esValido = false;
            
            while (!esValido) {
                nuevoCosto = parseFloat(prompt(`El costo por hora extra ($${this.costoPorHoraExtra}) está fuera del rango.\nIngrese el costo por hora extra (rango: $${min} - $${max}):`));
                
                if (isNaN(nuevoCosto)) {
                    alert("Por favor ingrese un número válido");
                    continue;
                }
                
                if (nuevoCosto >= min && nuevoCosto <= max) {
                    esValido = true;
                    this.costoPorHoraExtra = nuevoCosto;
                } else {
                    alert("El costo esta fuera del rango del proyecto");
                }
            }
        }
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
     * @returns {string} Nombre del empleado
     */
    getNombre() {
        return this.nombre;
    }

    /**
     * Setter para establecer el nombre
     * @param {string} nombre - Nuevo nombre del empleado
     */
    setNombre(nombre) {
        this.nombre = this.validarNombre(nombre);
    }

    /**
     * Getter para obtener el costo por hora
     * @returns {number} Costo por hora normal
     */
    getCostoPorHora() {
        return this.costoPorHora;
    }

    /**
     * Setter para establecer el costo por hora
     * @param {number} costo - Nuevo costo por hora
     */
    setCostoPorHora(costo) {
        this.costoPorHora = parseFloat(costo);
    }

    /**
     * Getter para obtener el costo por hora extra
     * @returns {number} Costo por hora extra
     */
    getCostoPorHoraExtra() {
        return this.costoPorHoraExtra;
    }

    /**
     * Setter para establecer el costo por hora extra
     * @param {number} costo - Nuevo costo por hora extra
     */
    setCostoPorHoraExtra(costo) {
        this.costoPorHoraExtra = parseFloat(costo);
    }

    /**
     * Getter para obtener las horas trabajadas
     * @returns {number} Horas trabajadas
     */
    getHorasTrabajadas() {
        return this.horasTrabajadas;
    }

    /**
     * Setter para establecer las horas trabajadas
     * @param {number} horas - Nuevas horas trabajadas
     */
    setHorasTrabajadas(horas) {
        this.horasTrabajadas = parseFloat(horas);
    }

    /**
     * Calcula el salario total considerando horas normales y extras
     * (Asume que después de 8 horas son horas extras)
     * @returns {number} Salario total calculado
     */
    calcularSalarioTotal() {
        const horasNormales = Math.min(this.horasTrabajadas, 8);
        const horasExtras = Math.max(this.horasTrabajadas - 8, 0);
        
        const pagoNormal = horasNormales * this.costoPorHora;
        const pagoExtra = horasExtras * this.costoPorHoraExtra;
        
        return pagoNormal + pagoExtra;
    }

    /**
     * Calcula solo el pago de horas normales
     * @returns {number} Pago por horas normales
     */
    calcularPagoHorasNormales() {
        const horasNormales = Math.min(this.horasTrabajadas, 8);
        return horasNormales * this.costoPorHora;
    }

    /**
     * Calcula solo el pago de horas extras
     * @returns {number} Pago por horas extras
     */
    calcularPagoHorasExtras() {
        const horasExtras = Math.max(this.horasTrabajadas - 8, 0);
        return horasExtras * this.costoPorHoraExtra;
    }

    /**
     * Calcula el costo de trabajo para una duración específica de horas
     * Considera ciclos de días laborales: cada 12h (8h normales + 4h extra) es un día completo
     * (Para uso en tareas - no modifica horasTrabajadas del empleado)
     * @param {number} horas - Cantidad de horas a calcular
     * @returns {number} Costo total para esas horas
     */
    calcularCostoPorHoras(horas) {
        const horasNum = parseFloat(horas);
        if (isNaN(horasNum) || horasNum < 0) {
            return 0;
        }

        const HORAS_NORMALES_POR_DIA = 8;
        const HORAS_EXTRA_POR_DIA = 4;
        const HORAS_TOTALES_POR_DIA = HORAS_NORMALES_POR_DIA + HORAS_EXTRA_POR_DIA; // 12

        // Calcular días completos de 12 horas
        const diasCompletos = Math.floor(horasNum / HORAS_TOTALES_POR_DIA);
        const horasRestantes = horasNum % HORAS_TOTALES_POR_DIA;

        let costoTotal = 0;

        // Costo de días completos (cada día: 8h normales + 4h extra)
        if (diasCompletos > 0) {
            const costoPorDiaCompleto = (HORAS_NORMALES_POR_DIA * this.costoPorHora) + 
                                       (HORAS_EXTRA_POR_DIA * this.costoPorHoraExtra);
            costoTotal += diasCompletos * costoPorDiaCompleto;
        }

        // Costo de horas restantes del último día parcial
        if (horasRestantes > 0) {
            const horasNormalesRestantes = Math.min(horasRestantes, HORAS_NORMALES_POR_DIA);
            const horasExtraRestantes = Math.max(horasRestantes - HORAS_NORMALES_POR_DIA, 0);
            
            costoTotal += (horasNormalesRestantes * this.costoPorHora);
            costoTotal += (horasExtraRestantes * this.costoPorHoraExtra);
        }

        return costoTotal;
    }

    /**
     * Obtiene desglose detallado del cálculo de costo por horas con días múltiples
     * @param {number} horas - Cantidad de horas a calcular
     * @returns {object} Desglose detallado del cálculo
     */
    obtenerDesgloseCostoPorHoras(horas) {
        const horasNum = parseFloat(horas);
        if (isNaN(horasNum) || horasNum < 0) {
            return {
                horasTotal: 0,
                diasCompletos: 0,
                horasRestantes: 0,
                desgloseDias: [],
                costoTotal: 0
            };
        }

        const HORAS_NORMALES_POR_DIA = 8;
        const HORAS_EXTRA_POR_DIA = 4;
        const HORAS_TOTALES_POR_DIA = HORAS_NORMALES_POR_DIA + HORAS_EXTRA_POR_DIA; // 12

        // Calcular días completos y horas restantes
        const diasCompletos = Math.floor(horasNum / HORAS_TOTALES_POR_DIA);
        const horasRestantes = horasNum % HORAS_TOTALES_POR_DIA;

        let desgloseDias = [];
        let costoTotal = 0;

        // Procesar días completos
        for (let dia = 1; dia <= diasCompletos; dia++) {
            const costoNormalDia = HORAS_NORMALES_POR_DIA * this.costoPorHora;
            const costoExtraDia = HORAS_EXTRA_POR_DIA * this.costoPorHoraExtra;
            const costoTotalDia = costoNormalDia + costoExtraDia;
            
            desgloseDias.push({
                dia: dia,
                horasNormales: HORAS_NORMALES_POR_DIA,
                horasExtra: HORAS_EXTRA_POR_DIA,
                costoHorasNormales: costoNormalDia,
                costoHorasExtra: costoExtraDia,
                costoTotalDia: costoTotalDia
            });
            
            costoTotal += costoTotalDia;
        }

        // Procesar día parcial (horas restantes)
        if (horasRestantes > 0) {
            const horasNormalesRestantes = Math.min(horasRestantes, HORAS_NORMALES_POR_DIA);
            const horasExtraRestantes = Math.max(horasRestantes - HORAS_NORMALES_POR_DIA, 0);
            
            const costoNormalRestante = horasNormalesRestantes * this.costoPorHora;
            const costoExtraRestante = horasExtraRestantes * this.costoPorHoraExtra;
            const costoTotalRestante = costoNormalRestante + costoExtraRestante;
            
            desgloseDias.push({
                dia: diasCompletos + 1,
                horasNormales: horasNormalesRestantes,
                horasExtra: horasExtraRestantes,
                costoHorasNormales: costoNormalRestante,
                costoHorasExtra: costoExtraRestante,
                costoTotalDia: costoTotalRestante
            });
            
            costoTotal += costoTotalRestante;
        }

        return {
            horasTotal: horasNum,
            diasCompletos: diasCompletos,
            horasRestantes: horasRestantes,
            desgloseDias: desgloseDias,
            costoTotal: costoTotal
        };
    }

    /**
     * Devuelve una representación en string del objeto
     * @returns {string} Información del empleado
     */
    toString() {
        return `Personal: ${this.nombre}
        Costo por hora: $${this.costoPorHora.toFixed(2)}
        Costo por hora extra: $${this.costoPorHoraExtra.toFixed(2)}
        Horas trabajadas: ${this.horasTrabajadas}
        Salario total: $${this.calcularSalarioTotal().toFixed(2)}`;
    }

    
   

    /**
     * Devuelve un objeto con toda la información del empleado
     * @returns {Object} Objeto con la información completa
     */
    obtenerInformacion() {
        return {
            nombre: this.nombre,
            costoPorHora: this.costoPorHora,
            costoPorHoraExtra: this.costoPorHoraExtra,
            horasTrabajadas: this.horasTrabajadas,
            pagoHorasNormales: this.calcularPagoHorasNormales(),
            pagoHorasExtras: this.calcularPagoHorasExtras(),
            salarioTotal: this.calcularSalarioTotal()
        };
    }
}

// Exportar la clase para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Personal;
}