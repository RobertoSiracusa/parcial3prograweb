# PROJECT CONTROL Dashboard

Una interfaz moderna y responsiva para visualizar datos de control de proyectos, inspirada en el diseño de la imagen de referencia.

## Características

- **Diseño Moderno**: Interfaz limpia y profesional con animaciones suaves
- **Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Gráficos Interactivos**: Barras de progreso animadas y gráfico circular
- **Fácil Integración**: Función simple para cargar datos personalizados

## Archivos del Proyecto

- `project-dashboard.html` - Página principal del dashboard
- `project-styles.css` - Estilos CSS para el diseño
- `project-dashboard.js` - Lógica JavaScript para renderizar los datos
- `example-usage.html` - Ejemplo de cómo usar la interfaz

## Cómo Usar

### 1. Estructura de Datos

El dashboard espera recibir un objeto con la siguiente estructura:

```javascript
const projectData = {
  duration: [
    { duration: 9 },    // Duración en días de cada tarea
    { duration: 5 },
    { duration: 7 },
    { duration: 5 },
    { duration: 6 }
  ],
  employees: [
    { name: 'Empleado', salary: null },  // Nombre y salario del empleado
    { name: 'Albert', salary: 50 },
    { name: 'Rose', salary: 45 }
  ],
  materials: [
    { name: 'Concrete' },  // Lista de materiales
    { name: 'Steel' },
    { name: 'Wood' }
  ],
  extraCosts: [
    { name: 'Transport', value: 400 },    // Costos adicionales
    { name: 'Equipment', value: 300 },
    { name: 'Consultation', value: 250 }
  ],
  realCost: 12500,    // Costo real del proyecto
  totalCost: 14700    // Costo total presupuestado
};
```

### 2. Cargar Datos

Para cargar datos en el dashboard, usa la función `initializeProjectDashboard()`:

```javascript
// Cargar datos personalizados
initializeProjectDashboard(projectData);
```

### 3. Ejemplo Completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Dashboard</title>
  <link rel="stylesheet" href="project-styles.css">
</head>
<body>
  <div class="dashboard-container">
    <h1 class="dashboard-title">PROJECT CONTROL</h1>
    
    <div class="dashboard-grid">
      <!-- Las tarjetas se generan automáticamente -->
    </div>
  </div>

  <script src="project-dashboard.js"></script>
  <script>
    // Tus datos del proyecto
    const misDatos = {
      duration: [
        { duration: 10 },
        { duration: 8 },
        { duration: 12 }
      ],
      employees: [
        { name: 'Juan', salary: 60 },
        { name: 'María', salary: 55 }
      ],
      materials: [
        { name: 'Material A' },
        { name: 'Material B' }
      ],
      extraCosts: [
        { name: 'Gasolina', value: 500 },
        { name: 'Herramientas', value: 300 }
      ],
      realCost: 15000,
      totalCost: 18000
    };

    // Cargar el dashboard
    initializeProjectDashboard(misDatos);
  </script>
</body>
</html>
```

## Secciones del Dashboard

### 1. Duration (Duración)
- Muestra la duración de cada tarea con barras de progreso
- Calcula automáticamente el total de días
- Animaciones suaves al cargar

### 2. Team Members (Empleados)
- Lista de empleados con sus nombres y salarios
- Diseño limpio con bordes de color

### 3. Materials (Materiales)
- Lista de materiales utilizados en el proyecto
- Diseño consistente con el resto de secciones

### 4. Difference (Diferencia)
- Gráfico circular que muestra la proporción entre costo real y total
- Generado dinámicamente con Canvas

### 5. Extra Costs (Costos Extra)
- Lista de costos adicionales como gasolina, herramientas, etc.
- Muestra nombre y valor de cada costo

### 6. Cost (Costos)
- Comparación visual entre costo real y costo total
- Barras de progreso animadas
- Cálculo automático de la diferencia

## Personalización

### Colores
Los colores principales se pueden modificar en `project-styles.css`:

```css
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
}
```

### Animaciones
Las animaciones se pueden ajustar modificando los valores de `transition` en el CSS:

```css
.task-progress-fill {
  transition: width 0.8s ease; /* Duración de la animación */
}
```

## Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Diseño responsivo para móviles y tablets
- No requiere librerías externas

## Ejecutar el Proyecto

1. Abre `project-dashboard.html` en tu navegador para ver el dashboard con datos de muestra
2. Abre `example-usage.html` para ver ejemplos de cómo cargar datos personalizados
3. Integra los archivos en tu proyecto web existente

## Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial. 