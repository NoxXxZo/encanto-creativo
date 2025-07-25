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
window.addEventListener("DOMContentLoaded", () => {
  // ========================
  // VARIABLES
  // ========================
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let catalogo = [];

  // ========================
  // CARGAR PRODUCTOS DESDE JSON
  // ========================
  async function cargarProductos() {
    const response = await fetch("productos.json");
    const productos = await response.json();
    catalogo = productos; // Guardar el catálogo completo
    mostrarProductos(productos);

    // Filtro por categoría
    const filtro = document.getElementById("filtro");
    if (filtro) {
      filtro.addEventListener("change", (e) => {
        const categoria = e.target.value;
        const filtrados =
          categoria === "todos"
            ? productos
            : productos.filter((p) => p.categoria === categoria);
        mostrarProductos(filtrados);
      });
    }
  }

  // ========================
  // MOSTRAR PRODUCTOS EN TIENDA
  // ========================
  function mostrarProductos(productos) {
    const lista = document.getElementById("lista-productos");
    if (!lista) return; // No hacer nada si no existe
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
  // AGREGAR PRODUCTO AL CARRITO (CON CANTIDADES)
  // ========================
  window.agregarAlCarrito = function (nombre, precio) {
    const productoEnCatalogo = catalogo.find((p) => p.nombre === nombre);
    const stockDisponible = productoEnCatalogo ? productoEnCatalogo.stock : 1;

    const productoExistente = carrito.find((p) => p.nombre === nombre);
    if (productoExistente) {
      if (productoExistente.cantidad >= stockDisponible) {
        alert(
          `No puedes agregar más unidades de "${nombre}". Stock máximo alcanzado.`
        );
        return;
      }
      productoExistente.cantidad++;
    } else {
      carrito.push({ nombre, precio, cantidad: 1, stock: stockDisponible });
    }

    actualizarContadorCarrito();
    guardarCarrito();
    alert(`${nombre} agregado al carrito`);
  };

  // ========================
  // Guardar carrito en localStorage
  // ========================
  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  // ========================
  // ACTUALIZAR CONTADOR CARRITO
  // ========================
  function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    if (contador) contador.textContent = carrito.length;
  }

  // ========================
  // MODAL: ABRIR Y CERRAR
  // ========================
  const modal = document.getElementById("modal-carrito");
  const cerrarModal = document.getElementById("cerrar-modal");
  const carritoBtn = document.getElementById("carrito-btn");

  if (carritoBtn && modal && cerrarModal) {
    carritoBtn.addEventListener("click", () => {
      actualizarModalCarrito();
      modal.style.display = "flex";
    });

    cerrarModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // ========================
  // ACTUALIZAR MODAL CARRITO
  // ========================
  function actualizarModalCarrito() {
    const lista = document.getElementById("lista-carrito");
    const total = document.getElementById("total-carrito");
    if (!lista || !total) return;

    lista.innerHTML = "";
    let suma = 0;

    carrito.forEach((p, index) => {
      suma += p.precio * p.cantidad;
      lista.innerHTML += `
        <li>
          <span>${p.nombre} - ${p.precio.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
      })}</span>
          <div class="cantidad-control">
            <button onclick="cambiarCantidad(${index}, -1)">–</button>
<span>${p.cantidad}</span>
<button onclick="cambiarCantidad(${index}, 1)" ${
        p.cantidad >= p.stock ? "disabled" : ""
      }>+</button>
          </div>
        </li>
      `;
    });

    total.innerHTML = `<strong>Total: </strong>${suma.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    })}`;
  }

  // ========================
  // CAMBIAR CANTIDAD (+ / –)
  // ========================
  window.cambiarCantidad = function (indice, cambio) {
    const producto = carrito[indice];
    const nuevoValor = producto.cantidad + cambio;

    if (nuevoValor > producto.stock) {
      alert("No hay más stock disponible para este producto.");
      return;
    }

    if (nuevoValor <= 0) {
      carrito.splice(indice, 1);
    } else {
      producto.cantidad = nuevoValor;
    }

    actualizarContadorCarrito();
    actualizarModalCarrito();
    guardarCarrito();
  };

  // ========================
  // VACIAR CARRITO COMPLETAMENTE
  // ========================
  window.vaciarCarrito = function () {
    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      carrito = [];
      guardarCarrito();
      actualizarContadorCarrito();
      actualizarModalCarrito();
      modal.style.display = "none"; // Opcional: cierra el modal
    }
  };

  // ========================
  // ELIMINAR PRODUCTO DEL CARRITO
  // ========================
  window.eliminarDelCarrito = function (indice) {
    carrito.splice(indice, 1);
    actualizarContadorCarrito();
    actualizarModalCarrito();
    guardarCarrito();
  };

  // ========================
  // ENVIAR PEDIDO POR WHATSAPP
  // ========================
  window.enviarPedidoWhatsApp = function () {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    const numero = "56966411859";
    let mensaje = "¡Hola! Quiero hacer el siguiente pedido:%0A";

    carrito.forEach((p, index) => {
      mensaje += `${index + 1}. ${p.nombre} x${p.cantidad} - ${(
        p.precio * p.cantidad
      ).toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
      })}%0A`;
    });

    window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
  };

  // ========================
  // INICIALIZAR
  // ========================
  if (document.getElementById("lista-productos")) {
    cargarProductos();
  }

  actualizarContadorCarrito();
});
