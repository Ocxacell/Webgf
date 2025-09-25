function crearCorazon() {
  const heart = document.createElement("div");
  heart.innerHTML = "❤";
  heart.classList.add("heart");
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.fontSize = Math.random() * 20 + 15 + "px";
  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 6000);
}

setInterval(crearCorazon, 500);


function cambiarPantalla(origenId, destinoId) {
  const origen = document.getElementById(origenId);
  const destino = document.getElementById(destinoId);

  if (!origen || !destino) return;

  // Añadir animación de salida
  origen.classList.add("fade-out");

  // Después de la animación, ocultar origen y mostrar destino
  setTimeout(() => {
    origen.classList.add("oculto");
    origen.classList.remove("fade-out");

    destino.classList.remove("oculto");
    destino.classList.add("fade-in");

    // Quitar la clase fade-in después de la animación
    setTimeout(() => destino.classList.remove("fade-in"), 500);
  }, 500); // Duración de la animación
}



/*Codigo para mensaje diario*/
// Normaliza fechas desde formatos comunes hacia "YYYY-MM-DD"
function normalizarFecha(fechaSheet) {
  if (!fechaSheet) return "";
  fechaSheet = fechaSheet.trim();

  // Si viene con barras: DD/MM/YYYY
  if (fechaSheet.includes("/")) {
    const parts = fechaSheet.split("/");
    const dia = parts[0].padStart(2, "0");
    const mes = parts[1].padStart(2, "0");
    const anio = parts[2].padStart(4, "0");
    return `${anio}-${mes}-${dia}`;
  }

  // Si viene con guiones: puede ser YYYY-MM-DD o DD-MM-YYYY
  if (fechaSheet.includes("-")) {
    const parts = fechaSheet.split("-");
    if (parts[0].length === 4) {
      // ya es YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2,"0")}-${parts[2].padStart(2,"0")}`;
    } else {
      // asumimos DD-MM-YYYY
      return `${parts[2].padStart(4,"0")}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
    }
  }

  // fallback: devolver tal cual
  return fechaSheet;
}

async function obtenerMensajes() {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4y9fMkogxMXhnpJAb7Li7-zeZKLty1pp1aPV5w4_kTkxiNM3bsqrRBRyK6hwNNxfAsOJ5ffWYyf4i/pub?gid=0&single=true&output=csv";
  const response = await fetch(url);
  const text = await response.text();

  // Parse CSV respetando comillas (maneja comas internas)
  const rows = text.trim().split("\n").map(row => {
    const matches = row.match(/("([^"]|"")*"|[^,]+)(?=,|$)/g);
    if (!matches) return [];
    return matches.map(cell => {
      // quitar comillas exteriores y desdoblar comillas dobles internas
      let v = cell.trim();
      if (v.startsWith('"') && v.endsWith('"')) {
        v = v.slice(1, -1).replace(/""/g, '"');
      }
      return v;
    });
  });

  // Fecha local en formato YYYY-MM-DD (evita el problema de UTC)
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hoyLocal = `${yyyy}-${mm}-${dd}`;

  // También imprimimos la fecha UTC por si quieres comparar
  const hoyUTC = new Date().toISOString().split("T")[0];
  console.log("Fecha local:", hoyLocal, "| Fecha UTC:", hoyUTC);

  let mensajeHoy = "Aún no hay mensaje guardado para hoy 💌";

  rows.forEach((row, index) => {
    if (index === 0) return; // encabezado
    if (row.length === 0) return;

    const fechaSheet = row[0] || "";
    // si la fila tiene más de 2 columnas, juntamos todo lo que sigue como mensaje
    const mensaje = row.slice(1).join(", ").trim() || "";

    const fechaNormalizada = normalizarFecha(fechaSheet);

    // debug por fila (descomenta si quieres ver todo en consola)
    // console.log("Fila:", index, "fechaSheet:", fechaSheet, "normalizada:", fechaNormalizada, "mensaje:", mensaje);

    if (fechaNormalizada === hoyLocal) {
      mensajeHoy = mensaje;
      console.log(mensajeHoy);
    }
  });

  const el = document.getElementById("mensaje-dia");
  const contenedor = document.getElementById("mensaje-contenedor");
  if (el && contenedor) {
    // Mostrar el contenedor y animar expansión
    contenedor.classList.remove("oculto");
    contenedor.classList.remove("expandir");
    // Forzar reflow para reiniciar la animación
    void contenedor.offsetWidth;
    contenedor.classList.add("expandir");
    // Quitar la clase de animación si ya la tiene
    el.classList.remove("mensaje-animado");
    void el.offsetWidth;
    // Cambiar el texto
    el.innerText = mensajeHoy;
    // Volver a agregar la clase de animación
    el.classList.add("mensaje-animado");
  }
}
