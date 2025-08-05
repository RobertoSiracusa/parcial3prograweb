// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modalEliminarDatos = document.getElementById('modalEliminarDatosProyecto');
    const modalConfirmacion = document.getElementById('modalConfirmacionEliminacion');
    
    if (event.target === modalEliminarDatos) {
        cerrarModalEliminarDatos();
    }
    
    if (event.target === modalConfirmacion) {
        cerrarModalConfirmacion();
    }
}

// ===== FUNCIONES DEL DASHBOARD =====
function cargarEstadisticasDashboard() {
    // Cargar estadísticas desde localStorage
    const empleados = JSON.parse(localStorage.getItem('empleadosCreados')) || [];
    const materiales = JSON.parse(localStorage.getItem('materialesCreados')) || [];
    const tareas = JSON.parse(localStorage.getItem('tareasCreadas')) || [];
    const otrosGastos = JSON.parse(localStorage.getItem('otrosGastosCreados')) || [];
    
    // Actualizar contadores
    document.getElementById('totalEmpleados').textContent = empleados.length;
    document.getElementById('totalMateriales').textContent = materiales.length;
    document.getElementById('totalTareas').textContent = tareas.length;
    
    // Calcular cantidad de otros gastos
    const cantidadOtrosGastos = otrosGastos.length;
    document.getElementById('totalGastos').textContent = cantidadOtrosGastos;
    
    // Log temporal para verificar
    console.log('Dashboard Stats:', {
        empleados: empleados.length,
        materiales: materiales.length,
        tareas: tareas.length,
        gastos: totalGastos,
        empleadosData: empleados
    });
}

// Función para actualizar estadísticas desde otras páginas
function actualizarEstadisticasDashboard() {
    cargarEstadisticasDashboard();
}

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', function() {
    cargarEstadisticasDashboard();
    initializeProjectDashboard();
});

// ===== FUNCIONES DEL DASHBOARD DEL PROYECTO =====

// Función principal para inicializar el dashboard del proyecto
function initializeProjectDashboard() {
    // Cargar datos desde localStorage
    let empleados = JSON.parse(localStorage.getItem('empleadosCreados')) || [];
    let materiales = JSON.parse(localStorage.getItem('materialesCreados')) || [];
    let tareas = JSON.parse(localStorage.getItem('tareasCreadas')) || [];
    let otrosGastos = JSON.parse(localStorage.getItem('otrosGastosCreados')) || [];
    
    // Recrear instancias de la clase Personal para que tengan sus métodos
    empleados = empleados.map(item => {
        const empleadoData = item.empleado;
        // Recrear la instancia de Personal con los datos guardados
        const empleadoRecreado = new Personal(
            empleadoData.nombre,
            empleadoData.costoPorHora,
            empleadoData.costoPorHoraExtra
        );
        // Restaurar las horas trabajadas
        empleadoRecreado.horasTrabajadas = empleadoData.horasTrabajadas;
        
        return {
            empleado: empleadoRecreado,
            fechaCreacion: new Date(item.fechaCreacion),
            id: item.id
        };
    });

    // Recrear instancias de la clase Material para que tengan sus métodos
    materiales = materiales.map(item => {
        const materialData = item.material;
        // Recrear la instancia de Material con los datos guardados
        const materialRecreado = new Material(
            materialData.nombreMaterial,
            materialData.costoPorUnidad,
            materialData.inventario
        );
        
        return {
            material: materialRecreado,
            fechaCreacion: new Date(item.fechaCreacion),
            id: item.id
        };
    });

    // Recrear instancias de la clase OtrosGastos para que tengan sus métodos
    otrosGastos = otrosGastos.map(item => {
        const gastoData = item.otroGasto;
        // Recrear la instancia de OtrosGastos con los datos guardados
        const gastoRecreado = new OtrosGastos(
            gastoData.nombre,
            gastoData.costoPorUnidad,
            gastoData.descripcion || ''
        );
        
        return {
            otroGasto: gastoRecreado,
            fechaCreacion: new Date(item.fechaCreacion),
            id: item.id
        };
    });

    // Recrear instancias de la clase Tarea para que tengan sus métodos
    tareas = tareas.map(item => {
        const tareaData = item.tarea;
        
        // Recrear la instancia de Tarea con los datos básicos
        const tareaRecreada = new Tarea(
            tareaData.nombre,
            null, // personal se asignará después
            null, // materiales se asignarán después
            null, // otrosGastos se asignarán después
            tareaData.duracion
        );
        
        // Restaurar el estado
        tareaRecreada.estado = tareaData.estado;
        tareaRecreada.fechaCreacion = new Date(tareaData.fechaCreacion);
        
        // Restaurar personal asignado
        if (tareaData.personal && tareaData.personal.length > 0) {
            const personalRecreado = tareaData.personal.map(personalData => {
                return empleados.find(emp => emp.empleado.nombre === personalData.nombre)?.empleado;
            }).filter(Boolean);
            tareaRecreada.personal = personalRecreado;
        }
        
        // Restaurar materiales asignados
        if (tareaData.materiales && tareaData.materiales.length > 0) {
            const materialesRecreados = tareaData.materiales.map(materialData => {
                return materiales.find(mat => mat.material.nombreMaterial === materialData.nombreMaterial)?.material;
            }).filter(Boolean);
            tareaRecreada.materiales = materialesRecreados;
        }
        
        // Restaurar otros gastos asignados
        if (tareaData.otrosGastos && tareaData.otrosGastos.length > 0) {
            const gastosRecreados = tareaData.otrosGastos.map(gastoData => {
                return otrosGastos.find(gasto => gasto.otroGasto.nombre === gastoData.nombre)?.otroGasto;
            }).filter(Boolean);
            tareaRecreada.otrosGastos = gastosRecreados;
        }
        
        return {
            tarea: tareaRecreada,
            fechaCreacion: new Date(item.fechaCreacion),
            id: item.id
        };
    });
    
    // Preparar datos para el dashboard
    const projectData = {
        duration: tareas.map(tarea => ({ duration: (tarea.tarea.duracion || 0) / 12 })), // Convertir horas a días (12 horas = 1 día)
        employees: empleados.map(emp => ({ 
            name: emp.empleado.nombre, 
            salary: emp.empleado.calcularSalarioTotal() 
        })),
        materials: materiales.map(mat => ({ 
            name: mat.material.nombreMaterial,
            costoUnitario: mat.material.costoPorUnidad,
            cantidad: mat.material.inventario,
            valorTotal: mat.material.costoPorUnidad * mat.material.inventario
        })),
        extraCosts: otrosGastos.map(gasto => ({ 
            name: gasto.otroGasto.nombre, 
            value: gasto.otroGasto.costoPorUnidad 
        })),
        realCost: calcularCostoReal(tareas),
        totalCost: calcularCostoTotal(tareas, empleados, materiales, otrosGastos)
    };
    
    // Renderizar cada sección del dashboard
    renderDurationChart(projectData.duration);
    renderTeamMembers(projectData.employees);
    renderMaterials(projectData.materials);
    renderExtraCosts(projectData.extraCosts);
    renderCostChart(projectData.realCost, projectData.totalCost);
    renderPieChart(empleados, materiales, otrosGastos, tareas);
    renderPieChartReal(empleados, materiales, otrosGastos, tareas);
    renderTasksStatus(tareas);
    renderEmployeeUtilization(tareas);
    renderSalaryDistribution(tareas);
}

// Calcular costo real (solo tareas completadas)
function calcularCostoReal(tareas) {
    return tareas.reduce((total, item) => {
        if (item.tarea.estado === 'completada') {
            return total + item.tarea.calcularCostoTotal();
        }
        return total;
    }, 0);
}

// Calcular costo total (todas las tareas)
function calcularCostoTotal(tareas, empleados, materiales, otrosGastos) {
    return tareas.reduce((total, item) => {
        return total + item.tarea.calcularCostoTotal();
    }, 0);
}

// Renderizar gráfico de duración de tareas
function renderDurationChart(tasks) {
    const durationChart = document.getElementById('durationChart');
    const totalDurationElement = document.getElementById('totalDuration');
    
    if (!durationChart) return;
    
    durationChart.innerHTML = '';
    
    let totalDuration = 0;
    let totalDurationInHours = 0;
    const maxDuration = Math.max(...tasks.map(task => task.duration || 0), 1);
    
    tasks.forEach((task, index) => {
        const taskBar = document.createElement('div');
        taskBar.className = 'task-bar';
        
        const taskLabel = document.createElement('div');
        taskLabel.className = 'task-label';
        taskLabel.textContent = `Tarea ${index + 1}`;
        
        const taskProgress = document.createElement('div');
        taskProgress.className = 'task-progress';
        
        const taskProgressFill = document.createElement('div');
        taskProgressFill.className = 'task-progress-fill';
        const percentage = ((task.duration || 0) / maxDuration) * 100;
        taskProgressFill.style.width = '0%';
        
        // Aplicar color basado en la duración de la tarea (considerando 12 horas = 1 día)
        const duration = task.duration || 0;
        if (duration >= 15) {
            // Rojo para tareas de 15 días o más (180+ horas)
            taskProgressFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else if (duration >= 7) {
            // Amarillo para tareas de 7 días o más (84+ horas)
            taskProgressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            // Verde para tareas de menos de 7 días
            taskProgressFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
        }
        
        const taskValue = document.createElement('div');
        taskValue.className = 'task-value';
        
        // Mostrar duración en horas si es menos de 1 día, en días si es 1 día o más
        if (duration < 1) {
            const hours = (duration * 12).toFixed(2); // Convertir días a horas con 2 decimales
            taskValue.textContent = `${hours} horas`;
        } else {
            const days = duration.toFixed(2); // Redondear días a 2 decimales
            taskValue.textContent = `${days} días`;
        }
        
        taskProgress.appendChild(taskProgressFill);
        taskBar.appendChild(taskLabel);
        taskBar.appendChild(taskProgress);
        taskBar.appendChild(taskValue);
        durationChart.appendChild(taskBar);
        
        totalDuration += task.duration || 0;
        totalDurationInHours += (task.duration || 0) * 12; // Acumular en horas para el total
        
        // Animar la barra después de un pequeño delay
        setTimeout(() => {
            taskProgressFill.style.width = `${percentage}%`;
        }, index * 200);
    });
    
    if (totalDurationElement) {
        // Calcular días y horas restantes con redondeo a 2 decimales
        const totalDias = (totalDurationInHours / 12).toFixed(2);
        const totalHoras = (totalDurationInHours % 12).toFixed(2);
        
        totalDurationElement.textContent = `Total: ${totalDias} días / ${totalHoras} Horas`;
    }
}

// Renderizar lista de empleados
function renderTeamMembers(employees) {
    const teamList = document.getElementById('teamList');
    
    if (!teamList) return;
    
    teamList.innerHTML = '';
    
    let totalSalarios = 0;
    
    employees.forEach(employee => {
        const teamMember = document.createElement('div');
        teamMember.className = 'team-member';
        
        const memberName = document.createElement('div');
        memberName.className = 'team-member-name';
        memberName.textContent = employee.name || 'Empleado';
        
        // Crear barra de progreso para el salario
        const salaryProgress = document.createElement('div');
        salaryProgress.className = 'salary-progress';
        
        const salaryProgressFill = document.createElement('div');
        salaryProgressFill.className = 'salary-progress-fill';
        
        // Calcular el porcentaje basado en el salario (0-1000)
        const salary = employee.salary || 0;
        totalSalarios += salary;
        const percentage = Math.min((salary / 1000) * 100, 100);
        salaryProgressFill.style.width = '0%';
        
        // Cambiar color a rojo si el salario supera $1000
        if (salary > 1000) {
            salaryProgressFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        }
        
        const memberSalary = document.createElement('div');
        memberSalary.className = 'team-member-salary';
        memberSalary.textContent = `$${salary}`;
        
        salaryProgress.appendChild(salaryProgressFill);
        teamMember.appendChild(memberName);
        teamMember.appendChild(salaryProgress);
        teamMember.appendChild(memberSalary);
        teamList.appendChild(teamMember);
        
        // Animar la barra después de un pequeño delay
        setTimeout(() => {
            salaryProgressFill.style.width = `${percentage}%`;
        }, 200);
    });
    
    // Agregar el total al final
    if (employees.length > 0) {
        const totalDiv = document.createElement('div');
        totalDiv.className = 'team-total';
        totalDiv.style.cssText = `
            margin-top: 15px;
            text-align: center;
            font-weight: 600;
            color: #2c3e50;
            font-size: 1.1rem;
            padding: 10px;
            background: #ecf0f1;
            border-radius: 8px;
        `;
        totalDiv.textContent = `Total Dinero pagado a empleados: $${totalSalarios.toFixed(2)}`;
        teamList.appendChild(totalDiv);
    }
}

// Renderizar lista de materiales
function renderMaterials(materials) {
    const materialsList = document.getElementById('materialsList');
    
    if (!materialsList) return;
    
    materialsList.innerHTML = '';
    
    materials.forEach(material => {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';
        
        // Información resumida en una sola línea
        const materialInfo = document.createElement('div');
        materialInfo.className = 'material-info-compact';
        materialInfo.innerHTML = `
            <span class="material-name">${material.name || material}</span>
            <span class="material-details">
                <span class="detail">$${material.costoUnitario || 0}/u</span>
                <span class="detail">${material.cantidad || 0} un</span>
                <span class="detail total">$${material.valorTotal || 0}</span>
            </span>
        `;
        
        materialItem.appendChild(materialInfo);
        materialsList.appendChild(materialItem);
    });
}

// Renderizar lista de costos extra
function renderExtraCosts(extraCosts) {
    const extraCostsList = document.getElementById('extraCostsList');
    
    if (!extraCostsList) return;
    
    extraCostsList.innerHTML = '';
    
    extraCosts.forEach(cost => {
        const costItem = document.createElement('div');
        costItem.className = 'extra-cost-item';
        
        // Información resumida en una sola línea
        const costInfo = document.createElement('div');
        costInfo.className = 'extra-cost-info-compact';
        costInfo.innerHTML = `
            <span class="extra-cost-name">${cost.name || cost}</span>
            <span class="extra-cost-details">
                <span class="detail">$${cost.value || 0}</span>
            </span>
        `;
        
        costItem.appendChild(costInfo);
        extraCostsList.appendChild(costItem);
    });
}

// Renderizar gráfico de costos
function renderCostChart(realCost, totalCost) {
    const costChart = document.getElementById('costChart');
    const costDifference = document.getElementById('costDifference');
    
    if (!costChart) return;
    
    costChart.innerHTML = '';
    
    const maxCost = Math.max(realCost, totalCost, 1);
    const difference = totalCost - realCost;
    
    // Barra de costo total (PRIMERO)
    const totalCostBar = document.createElement('div');
    totalCostBar.className = 'cost-bar';
    
    const totalCostLabel = document.createElement('div');
    totalCostLabel.className = 'cost-label';
    totalCostLabel.textContent = 'Costo Total';
    
    const totalCostProgress = document.createElement('div');
    totalCostProgress.className = 'cost-progress';
    
    const totalCostProgressFill = document.createElement('div');
    totalCostProgressFill.className = 'cost-progress-fill total';
    const totalPercentage = (totalCost / maxCost) * 100;
    totalCostProgressFill.style.width = '0%';
    
    const totalCostValue = document.createElement('div');
    totalCostValue.className = 'cost-value';
    totalCostValue.textContent = `$${totalCost.toLocaleString()}`;
    
    totalCostProgress.appendChild(totalCostProgressFill);
    totalCostBar.appendChild(totalCostLabel);
    totalCostBar.appendChild(totalCostProgress);
    totalCostBar.appendChild(totalCostValue);
    costChart.appendChild(totalCostBar);
    
    // Barra de costo real (SEGUNDO)
    const realCostBar = document.createElement('div');
    realCostBar.className = 'cost-bar';
    
    const realCostLabel = document.createElement('div');
    realCostLabel.className = 'cost-label';
    realCostLabel.textContent = 'Costo Real';
    
    const realCostProgress = document.createElement('div');
    realCostProgress.className = 'cost-progress';
    
    const realCostProgressFill = document.createElement('div');
    realCostProgressFill.className = 'cost-progress-fill real';
    const realPercentage = (realCost / maxCost) * 100;
    realCostProgressFill.style.width = '0%';
    
    const realCostValue = document.createElement('div');
    realCostValue.className = 'cost-value';
    realCostValue.textContent = `$${realCost.toLocaleString()}`;
    
    realCostProgress.appendChild(realCostProgressFill);
    realCostBar.appendChild(realCostLabel);
    realCostBar.appendChild(realCostProgress);
    realCostBar.appendChild(realCostValue);
    costChart.appendChild(realCostBar);
    
    // Animar las barras
    setTimeout(() => {
        totalCostProgressFill.style.width = `${totalPercentage}%`;
    }, 300);
    
    setTimeout(() => {
        realCostProgressFill.style.width = `${realPercentage}%`;
    }, 600);
    
    // Actualizar diferencia
    if (costDifference) {
        costDifference.textContent = `$${difference.toLocaleString()}`;
    }
}

// Renderizar gráfica de torta de distribución de costos
function renderPieChart(empleados, materiales, otrosGastos, tareas) {
    const canvas = document.getElementById('costPieChart');
    const legendContainer = document.getElementById('pieChartLegend');
    if (!canvas || !legendContainer) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar canvas

    // Calcular costos totales por categoría basados en recursos asignados a tareas
    let totalSalarios = 0;
    let totalMateriales = 0;
    let totalOtrosGastos = 0;

    // Calcular costos basados en recursos asignados a tareas
    tareas.forEach(item => {
        // Calcular costo de personal asignado a esta tarea
        const personalAsignado = item.tarea.personal || [];
        personalAsignado.forEach(emp => {
            if (emp && emp.calcularSalarioTotal) {
                totalSalarios += emp.calcularSalarioTotal();
            }
        });
        
        // Calcular costo de materiales asignados a esta tarea
        const materialesAsignados = item.tarea.materiales || [];
        materialesAsignados.forEach(mat => {
            if (mat && mat.costoPorUnidad && mat.inventario) {
                totalMateriales += mat.costoPorUnidad * mat.inventario;
            }
        });
        
        // Calcular costo de otros gastos asignados a esta tarea
        const otrosGastosAsignados = item.tarea.otrosGastos || [];
        otrosGastosAsignados.forEach(gasto => {
            if (gasto && gasto.costoPorUnidad) {
                totalOtrosGastos += gasto.costoPorUnidad;
            }
        });
    });

    const totalProyecto = totalSalarios + totalMateriales + totalOtrosGastos;

    const data = [
        { label: 'Salarios de Empleados', value: totalSalarios, color: '#3498db' },
        { label: 'Costo de Materiales', value: totalMateriales, color: '#2ecc71' },
        { label: 'Gastos Extras', value: totalOtrosGastos, color: '#e74c3c' }
    ];

    let startAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10; // Dejar un pequeño margen

    legendContainer.innerHTML = ''; // Limpiar leyenda

    data.forEach(segment => {
        const sliceAngle = (segment.value / totalProyecto) * 2 * Math.PI;

        // Dibujar segmento
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();

        // Dibujar borde (opcional, para separación)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crear elemento de leyenda
        const percentage = totalProyecto > 0 ? ((segment.value / totalProyecto) * 100).toFixed(1) : 0;
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${segment.color};"></div>
            <div class="legend-label">${segment.label}</div>
            <div class="legend-value">$${segment.value.toFixed(2)}</div>
            <div class="legend-percentage">${percentage}%</div>
        `;
        legendContainer.appendChild(legendItem);

        startAngle += sliceAngle;
    });
}

// Renderizar gráfica de torta de distribución de costos reales
function renderPieChartReal(empleados, materiales, otrosGastos, tareas) {
    const canvas = document.getElementById('costPieChartClone');
    const legendContainer = document.getElementById('pieChartLegendClone');
    if (!canvas || !legendContainer) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar canvas

    // Calcular costos reales por categoría (solo tareas completadas)
    let totalSalariosReales = 0;
    let totalMaterialesReales = 0;
    let totalOtrosGastosReales = 0;

    // Calcular costos reales basados en tareas completadas
    tareas.forEach(item => {
        if (item.tarea.estado === 'completada') {
            // Calcular costo de personal en esta tarea
            const personalAsignado = item.tarea.personal || [];
            personalAsignado.forEach(emp => {
                if (emp && emp.calcularSalarioTotal) {
                    totalSalariosReales += emp.calcularSalarioTotal();
                }
            });
            
            // Calcular costo de materiales en esta tarea
            const materialesAsignados = item.tarea.materiales || [];
            materialesAsignados.forEach(mat => {
                if (mat && mat.costoPorUnidad && mat.inventario) {
                    totalMaterialesReales += mat.costoPorUnidad * mat.inventario;
                }
            });
            
            // Calcular costo de otros gastos en esta tarea
            const otrosGastosAsignados = item.tarea.otrosGastos || [];
            otrosGastosAsignados.forEach(gasto => {
                if (gasto && gasto.costoPorUnidad) {
                    totalOtrosGastosReales += gasto.costoPorUnidad;
                }
            });
        }
    });

    const totalProyectoReal = totalSalariosReales + totalMaterialesReales + totalOtrosGastosReales;

    const data = [
        { label: 'Salarios de Empleados', value: totalSalariosReales, color: '#3498db' },
        { label: 'Costo de Materiales', value: totalMaterialesReales, color: '#2ecc71' },
        { label: 'Gastos Extras', value: totalOtrosGastosReales, color: '#e74c3c' }
    ];

    let startAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10; // Dejar un pequeño margen

    legendContainer.innerHTML = ''; // Limpiar leyenda

    data.forEach(segment => {
        const sliceAngle = (segment.value / totalProyectoReal) * 2 * Math.PI;

        // Dibujar segmento
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();

        // Dibujar borde (opcional, para separación)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crear elemento de leyenda
        const percentage = totalProyectoReal > 0 ? ((segment.value / totalProyectoReal) * 100).toFixed(1) : 0;
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${segment.color};"></div>
            <div class="legend-label">${segment.label}</div>
            <div class="legend-value">$${segment.value.toFixed(2)}</div>
            <div class="legend-percentage">${percentage}%</div>
        `;
        legendContainer.appendChild(legendItem);

        startAngle += sliceAngle;
    });
}

// Renderizar estado de tareas
function renderTasksStatus(tareas) {
    const tasksStatusList = document.getElementById('tasksStatusList');
    const tasksCompletionTotal = document.getElementById('tasksCompletionTotal');
    
    if (!tasksStatusList || !tasksCompletionTotal) return;
    
    tasksStatusList.innerHTML = '';
    
    let tareasCompletadas = 0;
    const totalTareas = tareas.length;
    
    tareas.forEach((item, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-status-item';
        
        const taskName = document.createElement('div');
        taskName.className = 'task-status-name';
        taskName.textContent = item.tarea.nombre || `Tarea ${index + 1}`;
        
        const taskStatus = document.createElement('div');
        taskStatus.className = 'task-status-badge';
        
        // Determinar el estado y color
        let statusText = '';
        let statusColor = '';
        
        switch(item.tarea.estado) {
            case 'completada':
                statusText = 'Completada';
                statusColor = '#27ae60';
                tareasCompletadas++;
                break;
            case 'en_progreso':
                statusText = 'En Progreso';
                statusColor = '#f39c12';
                break;
            case 'pendiente':
            default:
                statusText = 'Pendiente';
                statusColor = '#e74c3c';
                break;
        }
        
        taskStatus.textContent = statusText;
        taskStatus.style.backgroundColor = statusColor;
        taskStatus.style.color = 'white';
        
        taskItem.appendChild(taskName);
        taskItem.appendChild(taskStatus);
        tasksStatusList.appendChild(taskItem);
    });
    
    // Calcular y mostrar el porcentaje de tareas completadas
    const porcentajeCompletadas = totalTareas > 0 ? ((tareasCompletadas / totalTareas) * 100).toFixed(1) : 0;
    
    tasksCompletionTotal.innerHTML = `
        <div class="completion-total">
            <span class="completion-label">% de tareas completadas:</span>
            <span class="completion-percentage">${porcentajeCompletadas}%</span>
        </div>
    `;
}

// Renderizar utilización de empleados
function renderEmployeeUtilization(tareas) {
    const employeeUtilizationList = document.getElementById('employeeUtilizationList');
    
    if (!employeeUtilizationList) return;
    
    employeeUtilizationList.innerHTML = '';
    
    // Crear un mapa para acumular las horas por empleado
    const empleadoHoras = new Map();
    
    // Calcular horas trabajadas por cada empleado (solo tareas completadas)
    tareas.forEach(item => {
        // Solo considerar tareas completadas
        if (item.tarea.estado === 'completada') {
            const personalAsignado = item.tarea.personal || [];
            const duracionTarea = item.tarea.duracion || 0; // en horas
            
            personalAsignado.forEach(emp => {
                if (emp && emp.nombre) {
                    const horasPorEmpleado = duracionTarea / personalAsignado.length; // Dividir horas entre empleados asignados
                    
                    if (empleadoHoras.has(emp.nombre)) {
                        empleadoHoras.set(emp.nombre, empleadoHoras.get(emp.nombre) + horasPorEmpleado);
                    } else {
                        empleadoHoras.set(emp.nombre, horasPorEmpleado);
                    }
                }
            });
        }
    });
    
    // Renderizar cada empleado
    empleadoHoras.forEach((horasTotales, nombreEmpleado) => {
        const empleadoItem = document.createElement('div');
        empleadoItem.className = 'employee-utilization-item';
        
        const empleadoNombre = document.createElement('div');
        empleadoNombre.className = 'employee-utilization-name';
        empleadoNombre.textContent = nombreEmpleado;
        
        const empleadoHorasContainer = document.createElement('div');
        empleadoHorasContainer.className = 'employee-utilization-hours';
        
        // Determinar horas normales y extras por bloques de 12 horas
        // Cada bloque de 12 horas: 8 normales + 4 extras
        const bloquesCompletos = Math.floor(horasTotales / 12);
        const horasRestantes = horasTotales % 12;
        
        // Calcular horas normales y extras
        let horasNormales = bloquesCompletos * 8; // 8 horas normales por cada bloque completo
        let horasExtras = bloquesCompletos * 4;   // 4 horas extras por cada bloque completo
        
        // Para las horas restantes (menos de 12)
        if (horasRestantes > 0) {
            if (horasRestantes <= 8) {
                // Si quedan 8 horas o menos, todas son normales
                horasNormales += horasRestantes;
            } else {
                // Si quedan más de 8 horas, las primeras 8 son normales y el resto extras
                horasNormales += 8;
                horasExtras += (horasRestantes - 8);
            }
        }
        
        const estaSobreUtilizado = horasTotales > 8;
        
        // Crear elementos para mostrar las horas
        const horasNormalesSpan = document.createElement('span');
        horasNormalesSpan.className = 'hours-normal';
        horasNormalesSpan.textContent = `${horasNormales.toFixed(1)}h`;
        
        const horasExtrasSpan = document.createElement('span');
        horasExtrasSpan.className = 'hours-extra';
        horasExtrasSpan.textContent = horasExtras > 0 ? `+${horasExtras.toFixed(1)}h` : '';
        
        const totalSpan = document.createElement('span');
        totalSpan.className = 'hours-total';
        totalSpan.textContent = `${horasTotales.toFixed(1)}h total`;
        
        // Aplicar estilos según si está sobre utilizado
        if (estaSobreUtilizado) {
            empleadoItem.classList.add('over-utilized');
            horasExtrasSpan.style.display = 'inline';
        } else {
            horasExtrasSpan.style.display = 'none';
        }
        
        empleadoHorasContainer.appendChild(horasNormalesSpan);
        empleadoHorasContainer.appendChild(horasExtrasSpan);
        empleadoHorasContainer.appendChild(totalSpan);
        
        empleadoItem.appendChild(empleadoNombre);
        empleadoItem.appendChild(empleadoHorasContainer);
        employeeUtilizationList.appendChild(empleadoItem);
    });
    
    // Si no hay empleados, mostrar mensaje
    if (empleadoHoras.size === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-utilization';
        emptyMessage.textContent = 'No hay empleados asignados a tareas';
        employeeUtilizationList.appendChild(emptyMessage);
    }
}

// Función para renderizar la distribución de salario
function renderSalaryDistribution(tareas) {
    console.log('renderSalaryDistribution llamada con:', tareas);
    const employeeSelect = document.getElementById('employeeSelect');
    const canvas = document.getElementById('salaryPieChart');
    const legendContainer = document.getElementById('salaryPieChartLegend');
    
    if (!employeeSelect || !canvas || !legendContainer) {
        return;
    }
    
    // Limpiar selector
    employeeSelect.innerHTML = '<option value="">-- Selecciona un empleado --</option>';
    
    // Obtener lista de empleados únicos de las tareas completadas
    const empleadosUnicos = new Set();
    tareas.forEach(item => {
        if (item.tarea.estado === 'completada') {
            const personalAsignado = item.tarea.personal || [];
            personalAsignado.forEach(emp => {
                if (emp && emp.nombre) {
                    empleadosUnicos.add(emp.nombre);
                }
            });
        }
    });
    
    // Llenar selector con empleados
    empleadosUnicos.forEach(nombreEmpleado => {
        const option = document.createElement('option');
        option.value = nombreEmpleado;
        option.textContent = nombreEmpleado;
        employeeSelect.appendChild(option);
    });
    
    // Si no hay empleados, mostrar mensaje
    if (empleadosUnicos.size === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        legendContainer.innerHTML = '<div class="dashboard-placeholder"><p>No hay empleados con tareas completadas</p></div>';
        return;
    }
    
    // Si hay empleados, seleccionar el primero por defecto
    if (empleadosUnicos.size > 0) {
        const primerEmpleado = Array.from(empleadosUnicos)[0];
        employeeSelect.value = primerEmpleado;
        actualizarDistribucionSalario();
    }
}

// Función para actualizar la distribución de salario cuando se selecciona un empleado
function actualizarDistribucionSalario() {
    const employeeSelect = document.getElementById('employeeSelect');
    const canvas = document.getElementById('salaryPieChart');
    const legendContainer = document.getElementById('salaryPieChartLegend');
    
    if (!employeeSelect || !canvas || !legendContainer) {
        return;
    }
    
    const empleadoSeleccionado = employeeSelect.value;
    if (!empleadoSeleccionado) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        legendContainer.innerHTML = '<div class="dashboard-placeholder"><p>Selecciona un empleado</p></div>';
        return;
    }
    
    // Cargar datos de tareas desde localStorage
    const tareasData = localStorage.getItem('tareasCreadas');
    if (!tareasData) {
        legendContainer.innerHTML = '<div class="dashboard-placeholder"><p>No hay datos de tareas</p></div>';
        return;
    }
    
    const tareasRaw = JSON.parse(tareasData);
    
    // Calcular salario por horas normales y extras para el empleado seleccionado
    let salarioHorasNormales = 0;
    let salarioHorasExtras = 0;
    
    tareasRaw.forEach(item => {
        if (item.tarea.estado === 'completada') {
            const personalAsignado = item.tarea.personal || [];
            const empleadoEnTarea = personalAsignado.find(emp => emp && emp.nombre === empleadoSeleccionado);
            
            if (empleadoEnTarea) {
                const duracionTarea = item.tarea.duracion || 0; // en horas
                const horasPorEmpleado = duracionTarea / personalAsignado.length;
                
                // Obtener el costo por hora del empleado
                const costoPorHora = empleadoEnTarea.costoPorHora || 0;
                
                // Aplicar la misma lógica de bloques de 12 horas
                const bloquesCompletos = Math.floor(horasPorEmpleado / 12);
                const horasRestantes = horasPorEmpleado % 12;
                
                // Calcular horas normales y extras
                let horasNormales = bloquesCompletos * 8; // 8 horas normales por cada bloque completo
                let horasExtras = bloquesCompletos * 4;   // 4 horas extras por cada bloque completo
                
                // Para las horas restantes (menos de 12)
                if (horasRestantes > 0) {
                    if (horasRestantes <= 8) {
                        // Si quedan 8 horas o menos, todas son normales
                        horasNormales += horasRestantes;
                    } else {
                        // Si quedan más de 8 horas, las primeras 8 son normales y el resto extras
                        horasNormales += 8;
                        horasExtras += (horasRestantes - 8);
                    }
                }
                
                // Calcular salarios
                salarioHorasNormales += horasNormales * costoPorHora;
                salarioHorasExtras += horasExtras * (costoPorHora * 1.5); // 50% extra por horas extras
            }
        }
    });
    
    // Renderizar gráfica de torta
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const totalSalario = salarioHorasNormales + salarioHorasExtras;
    
    if (totalSalario === 0) {
        legendContainer.innerHTML = '<div class="dashboard-placeholder"><p>No hay salario registrado para este empleado</p></div>';
        return;
    }
    
    const data = [
        { label: 'Salario Horas Normales', value: salarioHorasNormales, color: '#3498db' },
        { label: 'Salario Horas Extras', value: salarioHorasExtras, color: '#27ae60' }
    ];
    
    let startAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    legendContainer.innerHTML = '';
    
    data.forEach(segment => {
        const sliceAngle = (segment.value / totalSalario) * 2 * Math.PI;
        
        // Dibujar segmento
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        
        // Dibujar borde
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Crear elemento de leyenda
        const percentage = ((segment.value / totalSalario) * 100).toFixed(1);
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${segment.color};"></div>
            <div class="legend-label">${segment.label}</div>
            <div class="legend-value">$${segment.value.toFixed(2)}</div>
            <div class="legend-percentage">${percentage}%</div>
        `;
        legendContainer.appendChild(legendItem);
        
        startAngle += sliceAngle;
    });
}

// Función para eliminar todos los datos del proyecto
function eliminarDatosProyecto() {
    // Mostrar modal de confirmación
    document.getElementById('modalEliminarDatosProyecto').style.display = 'block';
}

// Función para cerrar el modal de eliminar datos
function cerrarModalEliminarDatos() {
    document.getElementById('modalEliminarDatosProyecto').style.display = 'none';
}

// Función para confirmar la eliminación de datos
function confirmarEliminarDatos() {
    // Eliminar todos los datos del localStorage
    localStorage.removeItem('empleadosCreados');
    localStorage.removeItem('materialesCreados');
    localStorage.removeItem('otrosGastosCreados');
    localStorage.removeItem('tareasCreadas');
    
    // Cerrar el modal de confirmación
    cerrarModalEliminarDatos();
    
    // Mostrar modal de confirmación exitosa
    document.getElementById('modalConfirmacionEliminacion').style.display = 'block';
}

// Función para cerrar el modal de confirmación exitosa
function cerrarModalConfirmacion() {
    document.getElementById('modalConfirmacionEliminacion').style.display = 'none';
    // Recargar la página para actualizar el dashboard
    window.location.reload();
}

// Función para actualización manual del dashboard
function actualizarDashboardManual() {
    cargarEstadisticasDashboard();
    initializeProjectDashboard();
    
    // Efecto visual de actualización
    const refreshButton = document.getElementById('btnActualizarDashboard');
    if (refreshButton) {
        refreshButton.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            refreshButton.style.transform = 'rotate(0deg)';
        }, 500);
    }
}

// Función para alternar el estado del sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

// Función para alternar el sidebar en dispositivos móviles
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('open');
    mobileToggle.classList.toggle('active');
    
    if (sidebar.classList.contains('open')) {
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('active'), 10);
    } else {
        overlay.classList.remove('active');
        setTimeout(() => overlay.style.display = 'none', 300);
    }
}

// Función para cerrar el sidebar móvil
function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('open');
    mobileToggle.classList.remove('active');
    overlay.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 300);
}

// Inicializar el dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarEstadisticasDashboard();
    initializeProjectDashboard();
    
    // Cerrar sidebar móvil al hacer clic en enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
    });
    
    // Cerrar sidebar móvil al redimensionar la ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            const sidebar = document.querySelector('.sidebar');
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const overlay = document.querySelector('.sidebar-overlay');
            
            sidebar.classList.remove('open');
            mobileToggle.classList.remove('active');
            overlay.classList.remove('active');
            overlay.style.display = 'none';
        }
    });
});
