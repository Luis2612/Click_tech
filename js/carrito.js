const CARRITO_KEY = "carrito";

function _obtenerProductosDisponibles() {
  const nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");
  const eliminados = JSON.parse(localStorage.getItem("productos_eliminados") || "[]");
  const editados = JSON.parse(localStorage.getItem("productos_editados") || "{}");
  const base = PRODUCTOS_INICIALES
    .filter(p => !eliminados.includes(p.id))
    .map(p => editados[p.id] ? editados[p.id] : p);
  return [...base, ...nuevos];
}

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem(CARRITO_KEY) || "[]");
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  actualizarBadgeCarrito();
  renderizarCarrito();
  listarProductos();
}

function agregarAlCarrito(productoId) {
  const productos = _obtenerProductosDisponibles();
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return false;

  const carrito = obtenerCarrito();
  const item = carrito.find(i => i.id === productoId);
  const cantidadActual = item ? item.cantidad : 0;

  if (cantidadActual >= producto.stock) {
    mostrarToastCarrito(`Stock insuficiente para "${producto.nombre}"`, "warning");
    return false;
  }

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id: productoId, cantidad: 1 });
  }

  guardarCarrito(carrito);
  mostrarToastCarrito(`"${producto.nombre}" agregado al carrito`, "success");
  return true;
}

function eliminarDelCarrito(productoId) {
  let carrito = obtenerCarrito();
  if (!carrito.some(i => i.id === productoId)) return false;
  carrito = carrito.filter(i => i.id !== productoId);
  guardarCarrito(carrito);
  return true;
}

function actualizarCantidad(productoId, nuevaCantidad) {
  if (nuevaCantidad <= 0) return eliminarDelCarrito(productoId);

  const productos = _obtenerProductosDisponibles();
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return false;

  if (nuevaCantidad > producto.stock) {
    mostrarToastCarrito(`Stock insuficiente para "${producto.nombre}"`, "warning");
    return false;
  }

  const carrito = obtenerCarrito();
  const item = carrito.find(i => i.id === productoId);
  if (!item) return false;

  item.cantidad = nuevaCantidad;
  guardarCarrito(carrito);
  return true;
}

function incrementarCantidad(productoId) {
  const carrito = obtenerCarrito();
  const item = carrito.find(i => i.id === productoId);
  if (!item) return agregarAlCarrito(productoId);
  return actualizarCantidad(productoId, item.cantidad + 1);
}

function decrementarCantidad(productoId) {
  const carrito = obtenerCarrito();
  const item = carrito.find(i => i.id === productoId);
  if (!item) return false;
  return actualizarCantidad(productoId, item.cantidad - 1);
}

function vaciarCarrito() {
  guardarCarrito([]);
  return true;
}

function obtenerTotalItems() {
  return obtenerCarrito().reduce((t, i) => t + i.cantidad, 0);
}

function obtenerResumenCarrito() {
  const carrito = obtenerCarrito();
  const productos = _obtenerProductosDisponibles();

  const items = carrito
    .map(item => {
      const producto = productos.find(p => p.id === item.id);
      if (!producto) return null;
      return { ...producto, cantidad: item.cantidad, totalItem: producto.precio * item.cantidad };
    })
    .filter(i => i !== null);

  return {
    items,
    totalItems: items.reduce((s, i) => s + i.cantidad, 0),
    productosDistintos: items.length,
    subtotal: items.reduce((s, i) => s + i.totalItem, 0)
  };
}

function cantidadEnCarrito(productoId) {
  const item = obtenerCarrito().find(i => i.id === productoId);
  return item ? item.cantidad : 0;
}

function validarCarrito() {
  const carrito = obtenerCarrito();
  const productos = _obtenerProductosDisponibles();
  let carritoActualizado = [];
  let huboAjustes = false;

  carrito.forEach(item => {
    const producto = productos.find(p => p.id === item.id);
    if (!producto || producto.stock === 0) {
      huboAjustes = true;
      return;
    }
    if (item.cantidad > producto.stock) {
      carritoActualizado.push({ id: item.id, cantidad: producto.stock });
      huboAjustes = true;
    } else {
      carritoActualizado.push(item);
    }
  });

  if (huboAjustes) guardarCarrito(carritoActualizado);
}

function actualizarBadgeCarrito() {
  const total = obtenerTotalItems();
  document.querySelectorAll(".badge-carrito").forEach(badge => {
    badge.textContent = total;
    badge.classList.toggle("d-none", total === 0);
    badge.classList.remove("pulse-badge");
    void badge.offsetWidth;
    if (total > 0) badge.classList.add("pulse-badge");
  });
}

function crearOffcanvasCarrito() {
  if (document.getElementById("offcanvasCarrito")) return;

  const offcanvas = document.createElement("div");
  offcanvas.className = "offcanvas offcanvas-end offcanvas-carrito";
  offcanvas.id = "offcanvasCarrito";
  offcanvas.setAttribute("tabindex", "-1");
  offcanvas.setAttribute("aria-labelledby", "offcanvasCarritoLabel");

  offcanvas.innerHTML = `
    <div class="offcanvas-header border-bottom border-secondary">
      <h5 class="offcanvas-title text-color-principal fw-bold" id="offcanvasCarritoLabel">
        <i class="bi bi-cart3 me-2 text-color-resaltar"></i>Mi Carrito
        <span class="badge bg-info bg-opacity-25 text-info ms-2" id="carritoTotalBadge">0</span>
      </h5>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
    </div>
    <div class="offcanvas-body p-0" id="carritoContenido"></div>
    <div id="carritoFooter"></div>
  `;

  document.body.appendChild(offcanvas);
}

function crearToastContainer() {
  if (document.getElementById("toastCarritoContainer")) return;
  const container = document.createElement("div");
  container.id = "toastCarritoContainer";
  container.className = "toast-carrito-container";
  document.body.appendChild(container);
}

function mostrarToastCarrito(mensaje, tipo) {
  const container = document.getElementById("toastCarritoContainer");
  if (!container) return;

  const iconos = {
    success: "check-circle-fill",
    danger: "exclamation-triangle-fill",
    warning: "exclamation-circle-fill",
    info: "info-circle-fill"
  };

  const toastHTML = `
    <div class="toast align-items-center text-bg-${tipo} border-0 mb-2" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-${iconos[tipo] || "info-circle"} me-2"></i>${mensaje}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", toastHTML);
  const toastEl = container.lastElementChild;
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

function renderizarCarrito() {
  const contenido = document.getElementById("carritoContenido");
  const footer = document.getElementById("carritoFooter");
  const totalBadge = document.getElementById("carritoTotalBadge");
  if (!contenido || !footer) return;

  const resumen = obtenerResumenCarrito();

  if (totalBadge) totalBadge.textContent = resumen.totalItems;

  if (resumen.items.length === 0) {
    contenido.innerHTML = `
      <div class="carrito-vacio">
        <i class="bi bi-cart-x display-1 text-secondary mb-3"></i>
        <h6 class="text-color-principal fw-bold mb-2">Tu carrito está vacío</h6>
        <p class="text-color-alternativo small text-center mb-3">Agrega productos desde el catálogo para verlos aquí.</p>
        <a href="${_rutaCatalogo()}" class="btn btn-outline-info rounded-pill px-4" data-bs-dismiss="offcanvas">
          <i class="bi bi-shop me-2"></i>Explorar catálogo
        </a>
      </div>
    `;
    footer.innerHTML = "";
    return;
  }

  contenido.innerHTML = resumen.items.map(item => {
    const imagenHTML = item.imagen
      ? `<img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img">`
      : `<div class="carrito-item-img carrito-item-img-placeholder"><i class="bi bi-image text-secondary"></i></div>`;

    return `
      <div class="carrito-item">
        <div class="d-flex gap-3">
          ${imagenHTML}
          <div class="flex-grow-1" style="min-width:0">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <h6 class="mb-1 text-color-principal fw-semibold small text-truncate">${item.nombre}</h6>
              <button class="btn btn-sm btn-outline-danger border-0 p-0 px-1 flex-shrink-0" onclick="eliminarDelCarrito(${item.id})">
                <i class="bi bi-x-lg small"></i>
              </button>
            </div>
            <span class="text-color-alternativo small">$${item.precio.toLocaleString("es-CO")} c/u</span>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="controles-cantidad">
                <button onclick="decrementarCantidad(${item.id})"><i class="bi bi-dash"></i></button>
                <span>${item.cantidad}</span>
                <button onclick="incrementarCantidad(${item.id})"><i class="bi bi-plus"></i></button>
              </div>
              <span class="fw-bold text-color-resaltar">$${item.totalItem.toLocaleString("es-CO")}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  footer.innerHTML = `
    <div class="carrito-footer">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-color-principal fw-bold">Subtotal (${resumen.totalItems} item${resumen.totalItems !== 1 ? "s" : ""})</span>
        <span class="text-color-resaltar fw-bold fs-5">$${resumen.subtotal.toLocaleString("es-CO")}</span>
      </div>
      <div class="d-grid gap-2">
        <a href="../carrito/index.html" class="btn bg-resaltar fw-bold rounded-pill text-color-secundario">
          <i class="bi bi-bag-check me-2"></i>Proceder al pago
        </a>
        <button class="btn btn-outline-danger btn-sm rounded-pill" onclick="vaciarCarrito()">
          <i class="bi bi-trash3 me-2"></i>Vaciar carrito
        </button>
      </div>
    </div>
  `;
}

function listarProductos() {
  const contenedorItems = document.getElementById('list-productos');
  const contenedorResumen = document.getElementById('resumen-compra');
  if (!contenedorItems || !contenedorResumen) return;

  const resumen = obtenerResumenCarrito();

  if (resumen.items.length === 0) {
    contenedorItems.innerHTML = `
      <div class="carrito-vacio">
        <i class="bi bi-cart-x display-1 text-secondary mb-3"></i>
        <h5 class="text-color-principal fw-bold mb-2">Tu carrito está vacío</h5>
        <p class="text-color-alternativo text-center mb-3">Agrega productos desde el catálogo para verlos aquí.</p>
        <a href="../catalogo/index.html" class="btn btn-outline-info rounded-pill px-4">
          <i class="bi bi-shop me-2"></i>Explorar catálogo
        </a>
      </div>
    `;
  } else {
    contenedorItems.innerHTML = `
      <h4 class="fw-bold mb-4 text-color-principal">Mi carrito <span class="fs-6 text-color-alternativo">(${resumen.totalItems} items)</span></h4>
      ${resumen.items.map(producto => {
        const imagenHTML = producto.imagen
          ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="bg-white-img img-fluid rounded">`
          : `<div class="d-flex align-items-center justify-content-center rounded" style="height: 100px; width:200px; background: #1a1a1a;"><i class="bi bi-image text-secondary"></i></div>`;

        return `
          <div class="d-flex flex-column gap-3 pb-2">
            <div class="card bg-secundario-suave p-3 border-0 rounded-3 shadow-sm">
              <div class="row g-3">
                <div class="col-3 col-md-3 d-flex align-items-center">
                  ${imagenHTML}
                </div>
                <div class="col-9 col-md-7">
                  <h6 class="fw-bold mb-1 text-color-principal">${producto.nombre}</h6>
                  <span class="badge bg-primary bg-opacity-25 text-primary small mb-2">Categoría</span>
                  <p class="text-color-alternativo small lh-base mb-3">${producto.descripcion}</p>
                  <div class="input-group input-group-sm" style="max-width: 110px;">
                    <button class="btn bg-secundario text-color-principal border-0" type="button" onclick="decrementarCantidad(${producto.id})"><i class="bi bi-dash"></i></button>
                    <input type="text" class="form-control text-center bg-secundario text-color-principal border-0" value="${producto.cantidad}" readonly>
                    <button class="btn bg-secundario text-color-principal border-0" type="button" onclick="incrementarCantidad(${producto.id})"><i class="bi bi-plus"></i></button>
                  </div>
                </div>
                <div class="col-12 col-md-2 d-flex flex-row flex-md-column justify-content-between align-items-start align-items-md-end mt-md-2">
                  <button type="button" class="btn btn-link text-danger p-0 border-0 order-2 order-md-1" onclick="eliminarDelCarrito(${producto.id})"><i class="bi bi-trash fs-5"></i></button>
                  <span class="fw-bold text-color-resaltar order-1 order-md-2">$${producto.totalItem.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    `;
  }

  contenedorResumen.innerHTML = `
    <h5 class="text-color-principal fw-bold mb-4">Resumen del pedido</h5>
    <div class="d-flex justify-content-between mb-2">
      <span class="text-color-alternativo">Subtotal</span>
      <span class="text-color-principal">$${resumen.subtotal.toLocaleString("es-CO")}</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span class="text-color-alternativo">Envío</span>
      <span class="text-color-principal">GRATIS</span>
    </div>
    <hr class="border-secondary">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <span class="text-color-principal fw-bold">Total</span>
      <span class="text-color-resaltar fw-bold fs-4">$${resumen.subtotal.toLocaleString("es-CO")}</span>
    </div>
    <div class="d-grid gap-2">
      <button class="btn bg-resaltar fw-bold rounded-pill text-color-secundario" ${resumen.items.length === 0 ? "disabled" : ""}>
        <i class="bi bi-credit-card me-2"></i>Confirmar y pagar
      </button>
      <a href="../catalogo/index.html" class="btn btn-outline-secondary rounded-pill px-4">
        <i class="bi bi-arrow-left me-2"></i>Seguir Comprando
      </a>
    </div>
  `;
}

function _rutaCatalogo() {
  if (window.location.pathname.includes("/catalogo/")) return "#";
  return "../catalogo/index.html";
}

function abrirCarrito() {
  renderizarCarrito();
  const offcanvasEl = document.getElementById("offcanvasCarrito");
  if (!offcanvasEl) return;
  const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
  offcanvas.show();
}

document.addEventListener("DOMContentLoaded", () => {
  crearOffcanvasCarrito();
  crearToastContainer();
  validarCarrito();
  actualizarBadgeCarrito();
  listarProductos()
});
