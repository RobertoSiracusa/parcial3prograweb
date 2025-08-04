// Función principal para inicializar el dashboard con datos
function initializeProjectDashboard(projectData) {
    // Validar que los datos requeridos estén presentes
    if (!projectData) {
        console.error('Error: No se proporcionaron datos del proyecto');
        return;
    }

    // Renderizar cada sección del dashboard
    renderDurationChart(projectData.duration || []);
    renderTeamMembers(projectData.employees || []);
    renderMaterials(projectData.materials || []);
    renderExtraCosts(projectData.extraCosts || []);
    renderCostChart(projectData.realCost || 0, projectData.totalCost || 0);
    renderDifferencePieChart(projectData.realCost || 0, projectData.totalCost || 0);
}

// Renderizar gráfico de duración de tareas
function renderDurationChart(tasks) {
    const durationChart = document.getElementById('durationChart');
    const totalDurationElement = document.getElementById('totalDuration');
    
    if (!durationChart) return;
    
    durationChart.innerHTML = '';
    
    let totalDuration = 0;
    const maxDuration = Math.max(...tasks.map(task => task.duration || 0), 1);
    
    tasks.forEach((task, index) => {
        const taskBar = document.createElement('div');
        taskBar.className = 'task-bar';
        
        const taskLabel = document.createElement('div');
        taskLabel.className = 'task-label';
        taskLabel.textContent = `Task ${index + 1}`;
        
        const taskProgress = document.createElement('div');
        taskProgress.className = 'task-progress';
        
        const taskProgressFill = document.createElement('div');
        taskProgressFill.className = 'task-progress-fill';
        const percentage = ((task.duration || 0) / maxDuration) * 100;
        taskProgressFill.style.width = '0%';
        
        const taskValue = document.createElement('div');
        taskValue.className = 'task-value';
        taskValue.textContent = `${task.duration || 0} días`;
        
        taskProgress.appendChild(taskProgressFill);
        taskBar.appendChild(taskLabel);
        taskBar.appendChild(taskProgress);
        taskBar.appendChild(taskValue);
        durationChart.appendChild(taskBar);
        
        totalDuration += task.duration || 0;
        
        // Animar la barra después de un pequeño delay
        setTimeout(() => {
            taskProgressFill.style.width = `${percentage}%`;
        }, index * 200);
    });
    
    totalDurationElement.textContent = totalDuration;
}

// Renderizar lista de empleados
function renderTeamMembers(employees) {
    const teamList = document.getElementById('teamList');
    
    if (!teamList) return;
    
    teamList.innerHTML = '';
    
    employees.forEach(employee => {
        const teamMember = document.createElement('div');
        teamMember.className = 'team-member';
        
        const memberName = document.createElement('div');
        memberName.className = 'team-member-name';
        memberName.textContent = employee.name || 'Empleado';
        
        const memberSalary = document.createElement('div');
        memberSalary.className = 'team-member-salary';
        memberSalary.textContent = employee.salary ? `$${employee.salary}` : '';
        
        teamMember.appendChild(memberName);
        teamMember.appendChild(memberSalary);
        teamList.appendChild(teamMember);
    });
}

// Renderizar lista de materiales
function renderMaterials(materials) {
    const materialsList = document.getElementById('materialsList');
    
    if (!materialsList) return;
    
    materialsList.innerHTML = '';
    
    materials.forEach(material => {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';
        materialItem.textContent = material.name || material;
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
        
        const costName = document.createElement('div');
        costName.className = 'extra-cost-name';
        costName.textContent = cost.name || cost;
        
        const costValue = document.createElement('div');
        costValue.className = 'extra-cost-value';
        costValue.textContent = cost.value ? `$${cost.value}` : '';
        
        costItem.appendChild(costName);
        costItem.appendChild(costValue);
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
    
    // Barra de costo real
    const realCostBar = document.createElement('div');
    realCostBar.className = 'cost-bar';
    
    const realCostLabel = document.createElement('div');
    realCostLabel.className = 'cost-label';
    realCostLabel.textContent = 'Real Cost';
    
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
    
    // Barra de costo total
    const totalCostBar = document.createElement('div');
    totalCostBar.className = 'cost-bar';
    
    const totalCostLabel = document.createElement('div');
    totalCostLabel.className = 'cost-label';
    totalCostLabel.textContent = 'Total Cost';
    
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
    
    // Animar las barras
    setTimeout(() => {
        realCostProgressFill.style.width = `${realPercentage}%`;
    }, 300);
    
    setTimeout(() => {
        totalCostProgressFill.style.width = `${totalPercentage}%`;
    }, 600);
    
    // Actualizar diferencia
    if (costDifference) {
        costDifference.textContent = `$${difference.toLocaleString()}`;
    }
}

// Renderizar gráfico circular de diferencia
function renderDifferencePieChart(realCost, totalCost) {
    const canvas = document.getElementById('differencePieChart');
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calcular ángulos
    const total = realCost + totalCost;
    const realAngle = (realCost / total) * 2 * Math.PI;
    const totalAngle = (totalCost / total) * 2 * Math.PI;
    
    // Dibujar sección de costo real
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, realAngle);
    ctx.closePath();
    ctx.fillStyle = '#3498db';
    ctx.fill();
    
    // Dibujar sección de costo total
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, realAngle, realAngle + totalAngle);
    ctx.closePath();
    ctx.fillStyle = '#5dade2';
    ctx.fill();
    
    // Dibujar borde
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Ejemplo de uso con datos de muestra
// Puedes llamar a esta función con tus propios datos
function loadSampleData() {
    const sampleData = {
        duration: [
            { duration: 9 },
            { duration: 5 },
            { duration: 7 },
            { duration: 5 },
            { duration: 6 }
        ],
        employees: [
            { name: 'Empleado', salary: null },
            { name: 'Albert', salary: 50 },
            { name: 'Rose', salary: 45 }
        ],
        materials: [
            { name: 'Concrete' },
            { name: 'Steel' },
            { name: 'Wood' }
        ],
        extraCosts: [
            { name: 'Transport', value: 400 },
            { name: 'Equipment', value: 300 },
            { name: 'Consultation', value: 250 }
        ],
        realCost: 12500,
        totalCost: 14700
    };
    
    initializeProjectDashboard(sampleData);
}

// Inicializar el dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos de muestra por defecto
    loadSampleData();
});

// Exportar la función principal para uso externo
window.initializeProjectDashboard = initializeProjectDashboard; 