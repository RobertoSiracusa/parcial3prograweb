// Array bidimensional: [nombre, horas trabajadas]
const usuarios = [
  ["A", 1.5],
  ["Mario", 8.5],
  ["Maria", 6],
  ["Juan", 8],
  ["Ana", 1.3],
  ["Pedro", 1],
  ["Luis", 15],
  ["Carlos", 5],
  ["Ana", 14],
  ["Pedro", 13.5],
];

// Calcula el máximo de horas trabajadas
const horasMaxUsuario = Math.max(...usuarios.map(u => u[1]));
let maxHoras = horasMaxUsuario > 12 ? horasMaxUsuario + 2 : 12;

// Ajuste para cuadrar la gráfica si el máximo tiene decimales
if (!Number.isInteger(horasMaxUsuario)) {
  const decimal = horasMaxUsuario % 1;
  // Suma lo que falta para llegar al siguiente entero y luego suma 1 más
  maxHoras = Math.ceil(horasMaxUsuario) + (1 - decimal);
  maxHoras = Math.round(maxHoras); // Asegura que sea entero
}

function renderGrafica() {
  const grafica = document.getElementById("graficaPersonal");
  const ejeX = document.getElementById("ejeX");
  grafica.innerHTML = "";
  ejeX.innerHTML = "";

  // Guardar referencias a todas las barras y sus porcentajes
  const barras = [];

  // Renderizar filas
  usuarios.forEach(([nombre, horas]) => {
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
    for (let i = 0; i < maxHoras; i++) {
      const celda = document.createElement("div");
      celda.className = "celda-grafica";
      celdasContainer.appendChild(celda);
    }

    // Barra continua
    let barra;
    let tooltip;
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

      // Tooltip en toda la barra
      tooltip = document.createElement("span");
      tooltip.className = "tooltip";
      tooltip.textContent = horas + " horas";
      barra.appendChild(tooltip);
      celdasContainer.appendChild(barra);
    }

    // Guardar referencia a la barra y su porcentaje
    if (barra) {
      const horasValidadas = Math.min(Number(horas), maxHoras);
      let porcentaje = (horasValidadas * 100 / maxHoras);
      if (horasValidadas > 0 && porcentaje < 10) porcentaje = 10;
      porcentaje = porcentaje.toFixed(2);
      barras.push({ barra, porcentaje, tooltip });
      barra.onmouseenter = () => { tooltip.style.display = "block"; };
      barra.onmouseleave = () => { tooltip.style.display = "none"; };
    }

    fila.appendChild(celdasContainer);
    grafica.appendChild(fila);
  });

  // Renderizar los números del eje X (en cada vértice, de 0 a maxHoras)
  const celdaEje0 = document.createElement("div");
  celdaEje0.className = "celda-eje";
  celdaEje0.textContent = 0;
  ejeX.appendChild(celdaEje0);
  for (let i = 1; i <= maxHoras; i++) {
    const celdaEje = document.createElement("div");
    celdaEje.className = "celda-eje";
    celdaEje.textContent = i;
    ejeX.appendChild(celdaEje);
  }

  // Activar animación de barras al pasar el mouse sobre la imagen del reloj
  const relojImg = document.querySelector('img[alt="Reloj"]');
  if (relojImg) {
    relojImg.onmouseenter = () => {
      barras.forEach(({ barra, porcentaje }) => {
        barra.style.width = `calc(${porcentaje}% )`;
      });
    };
    relojImg.onmouseleave = () => {
      barras.forEach(({ barra }) => {
        barra.style.width = "0";
      });
    };
  }
}

// Modal
const btnDashboard = document.getElementById("btnDashboard");
const modal = document.getElementById("modalDashboard");
const cerrarModal = document.getElementById("cerrarModal");

btnDashboard.onclick = function() {
  modal.style.display = "flex";
  renderGrafica();
}
cerrarModal.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}