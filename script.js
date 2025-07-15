// Scroll suave al hacer clic en el menú
document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
  enlace.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({
      behavior: "smooth",
    });
  });
});

// ========================
// VARIABLES
// ========================
let carrito = [];

// ========================
// CARGAR PRODUCTOS DESDE JSON
// ========================
async function cargarProductos() {
  const response = await fetch("productos.json");
  const productos = await response.json();
  mostrarProductos(productos);

  // Filtro por categoría
  document.getElementById("filtro").addEventListener("change", (e) => {
    const categoria = e.target.value;
    const filtrados =
      categoria === "todos"
        ? productos
        : productos.filter((p) => p.categoria === categoria);
    mostrarProductos(filtrados);
  });
}

// ========================
// MOSTRAR PRODUCTOS EN TIENDA
// ========================
function mostrarProductos(productos) {
  const lista = document.getElementById("lista-productos");
  lista.innerHTML = "";

  productos.forEach((p) => {
    const stockText = p.stock > 0 ? "En stock" : "Agotado";
    const disabled = p.stock === 0 ? "disabled" : "";

    lista.innerHTML += `
      <div class="card">
        <img src="${p.imagen}" alt="${p.nombre}" />
        <h3>${p.nombre}</h3>
        <p>${p.precio.toLocaleString("es-CL", {
          style: "currency",
          currency: "CLP",
        })}</p>
        <p>${stockText}</p>
        <button class="btn" ${disabled} onclick="agregarAlCarrito('${
      p.nombre
    }', ${p.precio})">
          Agregar al carrito
        </button>
      </div>
    `;
  });
}

// ========================
// AGREGAR PRODUCTO AL CARRITO
// ========================
function agregarAlCarrito(nombre, precio) {
  carrito.push({ nombre, precio });
  actualizarContadorCarrito();
  alert(`${nombre} agregado al carrito`);
}

// ========================
// ACTUALIZAR CONTADOR CARRITO
// ========================
function actualizarContadorCarrito() {
  document.getElementById("contador-carrito").textContent = carrito.length;
}

// ========================
// ENVIAR PEDIDO POR WHATSAPP
// ========================
function enviarPedidoWhatsApp() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  const numero = "56966411859"; // Reemplaza con tu número
  let mensaje = "¡Hola! Quiero hacer el siguiente pedido:%0A";

  carrito.forEach((p, index) => {
    mensaje += `${index + 1}. ${p.nombre} - ${p.precio.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    })}%0A`;
  });

  window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
}

// ========================
// INICIALIZAR
// ========================
if (document.getElementById("lista-productos")) {
  cargarProductos();
}
