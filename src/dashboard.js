// Array bidimensional: [nombre, horas trabajadas]
const usuarios = [
  ["A", 1.5],
  ["Mario", 8.5],
  ["Maria", 6],
  ["Juan", 8],
  ["Ana", 1.3],
  ["Pedro", 1],
  ["Carlos", 5],
  ["Ana", 11.5],
  ["Pedro", 12],
];

// Calcula el máximo de horas trabajadas y se asegura de que sea un número entero
const horasMaxUsuario = Math.max(...usuarios.map(u => u[1]));
let maxHoras = horasMaxUsuario > 12 ? Math.ceil(horasMaxUsuario) + 2 : 12;

// Variable para controlar el estado de las barras
let barrasVisibles = false;
let barras = [];

function renderGrafica() {
  const grafica = document.getElementById("graficaPersonal");
  // Eliminar la referencia al ejeX
  grafica.innerHTML = "";

  // Limpiar array de barras
  barras = [];

  // Crear fila de encabezados
  const filaEncabezados = document.createElement("div");
  filaEncabezados.className = "barra-personal fila-encabezados";

  // Celda de encabezado "Empleados"
  const encabezadoEmpleados = document.createElement("div");
  encabezadoEmpleados.className = "encabezado-empleados";
  encabezadoEmpleados.textContent = "Empleados";
  filaEncabezados.appendChild(encabezadoEmpleados);

  // Celda de encabezado "Horas trabajadas al día"
  const encabezadoHoras = document.createElement("div");
  encabezadoHoras.className = "encabezado-horas";
  encabezadoHoras.textContent = "Horas trabajadas al día";
  filaEncabezados.appendChild(encabezadoHoras);

  grafica.appendChild(filaEncabezados);

  // Renderizar filas de empleados
  usuarios.forEach(([nombre, horas], index) => {
    const fila = document.createElement("div");
    fila.className = "barra-personal";

    // Celda de nombre
    const nombreDiv = document.createElement("div");
    nombreDiv.className = "nombre";
    nombreDiv.textContent = nombre;
    fila.appendChild(nombreDiv);

    // Contenedor de celdas de la gráfica
    const celdasContainer = document.createElement("div");
    celdasContainer.className = "celdas-container";

    // Bucle para crear celdas de la cuadrícula
    // Crear maxHoras + 1 celdas para tener una celda extra al final
    for (let i = 0; i <= maxHoras; i++) {
      const celda = document.createElement("div");
      celda.className = "celda-grafica";
      celdasContainer.appendChild(celda);
    }

    // Barra continua
    let barra;
    if (horas > 0) {
      barra = document.createElement("div");
      barra.className = "barra";
      barra.style.width = "0"; // Oculta por defecto

      // Colores según la regla
      if (horas < 8) {
        barra.style.background = "green";
      } else if (horas === 8) {
        barra.style.background = "gold";
      } else {
        barra.style.background = "red";
      }

      celdasContainer.appendChild(barra);
    }

    // Guardar referencia a la barra y su porcentaje
    if (barra) {
      const horasValidadas = Math.min(Number(horas), maxHoras);
      // Usar maxHoras + 1 para el cálculo del porcentaje ya que ahora hay una celda extra
      let porcentaje = (horasValidadas * 100 / (maxHoras + 1));
      if (horasValidadas > 0 && porcentaje < 10) porcentaje = 10;
      porcentaje = porcentaje.toFixed(2);
      barras.push({ barra, porcentaje, nombre, horas });

      // Eventos hover para mostrar popup
      barra.onmouseenter = (e) => {
        mostrarPopupEmpleado(horas, e);
      };

      barra.onmouseleave = () => {
        ocultarPopupEmpleado();
      };
    }

    fila.appendChild(celdasContainer);
    grafica.appendChild(fila);
  });
}

// Función para mostrar el popup del empleado
function mostrarPopupEmpleado(horas, event) {
  const popup = document.getElementById("popupEmpleado");
  const popupHoras = document.getElementById("popupHoras");

  // Llenar información del empleado
  popupHoras.textContent = horas;

  // Posicionar popup cerca del mouse
  let left = event.clientX + 10;
  let top = event.clientY - 30;

  // Ajustar si se sale de la pantalla
  if (left + 60 > window.innerWidth) {
    left = event.clientX - 70;
  }

  if (top < 0) {
    top = event.clientY + 10;
  }

  popup.style.left = left + "px";
  popup.style.top = top + "px";
  popup.style.display = "block";
}

// Función para ocultar el popup
function ocultarPopupEmpleado() {
  const popup = document.getElementById("popupEmpleado");
  popup.style.display = "none";
}

// Función para mostrar las barras con animación
function mostrarBarras() {
  barras.forEach(({ barra, porcentaje }) => {
    barra.style.width = `${porcentaje}%`;
  });
  barrasVisibles = true;
}

// Función para ocultar las barras con animación
function ocultarBarras() {
  barras.forEach(({ barra }) => {
    barra.style.width = "0";
  });
  barrasVisibles = false;
}

// Función para alternar el estado de las barras
function toggleBarras() {
  const btnReloj = document.getElementById("btnReloj");

  if (barrasVisibles) {
    ocultarBarras();
    btnReloj.classList.remove("activo");
  } else {
    mostrarBarras();
    btnReloj.classList.add("activo");
  }
}

// Modal principal
const btnDashboard = document.getElementById("btnDashboard");
const modal = document.getElementById("modalDashboard");
const cerrarModal = document.getElementById("cerrarModal");

btnDashboard.onclick = function() {
  modal.style.display = "flex";
  renderGrafica();
}

cerrarModal.onclick = function() {
  modal.style.display = "none";
  // Resetear estado cuando se cierra el modal
  barrasVisibles = false;
  const btnReloj = document.getElementById("btnReloj");
  btnReloj.classList.remove("activo");
}

window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
    // Resetear estado cuando se cierra el modal
    barrasVisibles = false;
    const btnReloj = document.getElementById("btnReloj");
    btnReloj.classList.remove("activo");
  }
}

// Agregar evento click al botón del reloj cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  const btnReloj = document.getElementById("btnReloj");
  if (btnReloj) {
    btnReloj.addEventListener('click', toggleBarras);
  }
});