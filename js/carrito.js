const CARRITO_KEY = "carrito";

function _obtenerProductosDisponiblesSync() {
  if (window.PRODUCTOS_CACHE && Array.isArray(window.PRODUCTOS_CACHE)) {
    return window.PRODUCTOS_CACHE;
  }
  return [];
}

async function _obtenerProductosDisponibles() {
  if (window.PRODUCTOS_CACHE && Array.isArray(window.PRODUCTOS_CACHE) && window.PRODUCTOS_CACHE.length > 0) {
    return window.PRODUCTOS_CACHE;
  }
  try {
    const res = await fetch(`${CONFIG.API_URL}/productos`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      window.PRODUCTOS_CACHE = data.data.map(p => ({
        id: p.idProducto || p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        stock: p.stock,
        imagen: p.imagen,
        categoria: p.categoria ? (typeof p.categoria === "object" ? p.categoria.nombre : p.categoria) : "General"
      }));
      return window.PRODUCTOS_CACHE;
    }
  } catch (e) {}
  return window.PRODUCTOS_CACHE || [];
}

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem(CARRITO_KEY) || "[]");
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  actualizarBadgeCarrito();
  renderizarCarrito();
  if (typeof listarProductos === "function") listarProductos();
}

async function agregarAlCarrito(productoId) {
  const productos = await _obtenerProductosDisponibles();
  const producto = productos.find(p => Number(p.id) === Number(productoId));
  if (!producto) return false;

  const carrito = obtenerCarrito();
  const item = carrito.find(i => Number(i.id) === Number(productoId));
  const cantidadActual = item ? item.cantidad : 0;

  if (cantidadActual >= producto.stock) {
    mostrarToastCarrito(`Stock insuficiente para "${producto.nombre}"`, "warning");
    return false;
  }

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id: Number(productoId), cantidad: 1 });
  }

  guardarCarrito(carrito);
  mostrarToastCarrito(`"${producto.nombre}" agregado al carrito`, "success");
  return true;
}

function eliminarDelCarrito(productoId) {
  let carrito = obtenerCarrito();
  if (!carrito.some(i => Number(i.id) === Number(productoId))) return false;
  carrito = carrito.filter(i => Number(i.id) !== Number(productoId));
  guardarCarrito(carrito);
  return true;
}

async function actualizarCantidad(productoId, nuevaCantidad) {
  if (nuevaCantidad <= 0) return eliminarDelCarrito(productoId);

  const productos = await _obtenerProductosDisponibles();
  const producto = productos.find(p => Number(p.id) === Number(productoId));
  if (!producto) return false;

  if (nuevaCantidad > producto.stock) {
    mostrarToastCarrito(`Stock insuficiente para "${producto.nombre}"`, "warning");
    return false;
  }

  const carrito = obtenerCarrito();
  const item = carrito.find(i => Number(i.id) === Number(productoId));
  if (!item) return false;

  item.cantidad = nuevaCantidad;
  guardarCarrito(carrito);
  return true;
}

async function incrementarCantidad(productoId) {
  const carrito = obtenerCarrito();
  const item = carrito.find(i => Number(i.id) === Number(productoId));
  if (!item) return await agregarAlCarrito(productoId);
  return await actualizarCantidad(productoId, item.cantidad + 1);
}

async function decrementarCantidad(productoId) {
  const carrito = obtenerCarrito();
  const item = carrito.find(i => Number(i.id) === Number(productoId));
  if (!item) return false;
  return await actualizarCantidad(productoId, item.cantidad - 1);
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
  const productos = _obtenerProductosDisponiblesSync();

  const items = carrito
    .map(item => {
      const producto = productos.find(p => Number(p.id) === Number(item.id));
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
  const item = obtenerCarrito().find(i => Number(i.id) === Number(productoId));
  return item ? item.cantidad : 0;
}

async function validarCarrito() {
  const carrito = obtenerCarrito();
  const productos = await _obtenerProductosDisponibles();
  let carritoActualizado = [];
  let huboAjustes = false;

  carrito.forEach(item => {
    const producto = productos.find(p => Number(p.id) === Number(item.id));
    if (!producto || producto.stock === 0) {
      huboAjustes = true;
      return;
    }
    if (item.cantidad > producto.stock) {
      carritoActualizado.push({ id: Number(item.id), cantidad: producto.stock });
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
    const fallbackImg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
    const imagenHTML = item.imagen
      ? `<img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img" onerror="this.onerror=null; this.src='${fallbackImg}';">`
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

function esPrimeraCompra(email) {
  if (!email || typeof email !== "string" || !email.trim()) {
    return true;
  }
  const cleanEmail = email.trim().toLowerCase();
  const keyPedidos = `pedidos_${cleanEmail}`;
  const historial = JSON.parse(localStorage.getItem(keyPedidos) || "[]");
  return historial.length === 0;
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

  const usuarioAct = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
  const esPrimeraCart = esPrimeraCompra(usuarioAct ? usuarioAct.email : "");
  const descuento10Cart = (esPrimeraCart && resumen.subtotal > 0) ? Math.round(resumen.subtotal * 0.10) : 0;
  const subtotalConDescuentoCart = Math.max(0, resumen.subtotal - descuento10Cart);

  const esGratis = resumen.subtotal >= 150000;
  const faltante = 150000 - resumen.subtotal;
  const porcentaje = Math.min(100, Math.round((resumen.subtotal / 150000) * 100));

  let envioTextoHTML = `<span class="text-success fw-bold"><i class="bi bi-gift-fill me-1"></i>GRATIS</span>`;
  let bannerEnvioHTML = `
    <div class="p-2.5 rounded-3 mb-3 border text-center" style="background-color: rgba(34, 197, 94, 0.12); border-color: rgba(34, 197, 94, 0.3) !important; color: #4ADE80; font-size: 0.85rem;">
      <i class="bi bi-truck me-1"></i>¡Genial! Tu compra supera $150.000 y tienes <strong>ENVÍO GRATIS</strong>.
    </div>
  `;

  if (!esGratis && resumen.subtotal > 0) {
    envioTextoHTML = `<span class="text-color-alternativo small">Calculado al pagar</span>`;
    bannerEnvioHTML = `
      <div class="mb-3 p-3 bg-secundario rounded-3 border border-secondary">
        <div class="d-flex justify-content-between small text-color-alternativo mb-1 fw-bold">
          <span>Progreso Envío GRATIS</span>
          <span class="text-color-resaltar">Faltan $${faltante.toLocaleString("es-CO")}</span>
        </div>
        <div class="progress bg-dark mb-2" style="height: 8px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: ${porcentaje}%; background-color: #06B6D4;"></div>
        </div>
        <span class="small text-color-alternativo d-block" style="font-size: 0.78rem;">
          <i class="bi bi-info-circle me-1 text-info"></i>Envío GRATIS en compras superiores a $150.000.
        </span>
      </div>
    `;
  }

  let rowDescuentoCartHTML = "";
  if (esPrimeraCart && descuento10Cart > 0) {
    rowDescuentoCartHTML = `
      <div class="d-flex justify-content-between mb-2">
        <span class="text-success fw-bold"><i class="bi bi-tag-fill me-1"></i>Descuento 1ª Compra (10%)</span>
        <span class="text-success fw-bold">-$${descuento10Cart.toLocaleString("es-CO")}</span>
      </div>
    `;
  }

  contenedorResumen.innerHTML = `
    <h5 class="text-color-principal fw-bold mb-4">Resumen del pedido</h5>
    ${resumen.subtotal > 0 ? bannerEnvioHTML : ""}
    <div class="d-flex justify-content-between mb-2">
      <span class="text-color-alternativo">Subtotal</span>
      <span class="text-color-principal">$${resumen.subtotal.toLocaleString("es-CO")}</span>
    </div>
    ${rowDescuentoCartHTML}
    <div class="d-flex justify-content-between mb-2">
      <span class="text-color-alternativo">Envío</span>
      ${envioTextoHTML}
    </div>
    <hr class="border-secondary">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <span class="text-color-principal fw-bold">Total estimado</span>
      <span class="text-color-resaltar fw-bold fs-4">$${subtotalConDescuentoCart.toLocaleString("es-CO")}</span>
    </div>
    <div class="d-grid gap-2">
      <button class="btn bg-resaltar fw-bold rounded-pill text-color-secundario" onclick="procesarPagoCarrito()" ${resumen.items.length === 0 ? "disabled" : ""}>
        <i class="bi bi-credit-card me-2"></i>Confirmar y pagar
      </button>
      <a href="../catalogo/index.html" class="btn btn-outline-secondary rounded-pill px-4">
        <i class="bi bi-arrow-left me-2"></i>Seguir Comprando
      </a>
    </div>
  `;
}

let metodoPagoPasarelaSeleccionado = "tarjeta";

function procesarPagoCarrito() {
  const resumen = obtenerResumenCarrito();
  if (!resumen || resumen.items.length === 0) {
    if (typeof mostrarToastCarrito === "function") {
      mostrarToastCarrito("Tu carrito está vacío", "warning");
    }
    return;
  }

  const offcanvasEl = document.getElementById("offcanvasCarrito");
  if (offcanvasEl) {
    const instance = bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (instance) instance.hide();
  }

  abrirPasarelaPago();
}

function crearModalPasarelaPago() {
  const oldModal = document.getElementById("modalPasarelaPago");
  if (oldModal) oldModal.remove();

  const modalHTML = `
    <div class="modal fade" id="modalPasarelaPago" tabindex="-1" aria-labelledby="modalPasarelaLabel" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content bg-secundario-suave border border-secondary text-color-principal rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header border-secondary bg-secundario py-3">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2 flex-wrap" id="modalPasarelaLabel">
              <i class="bi bi-shield-lock-fill text-success fs-4"></i>
              <span>Pasarela de Pagos Segura (Click Techs Pay)</span>
              <span class="pasarela-badge-ssl ms-2"><i class="bi bi-shield-check me-1"></i>256-bit SSL</span>
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>

          <div class="modal-body p-0" id="pasarelaBodyContent">
            <div class="row g-0">
              <div class="col-lg-7 p-4 border-end border-secondary">
                
                <h6 class="fw-bold mb-3 text-color-resaltar"><i class="bi bi-person-badge me-2"></i>1. Datos del Comprador</h6>

                <div id="bloqueUsuarioRegistrado" class="d-none alert bg-secundario border-secondary text-color-principal p-3 rounded-3 mb-4">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-check-circle-fill text-success fs-5"></i>
                      <div>
                        <span class="fw-bold small d-block" id="textoUsuarioNombre">Usuario Autenticado</span>
                        <span class="text-color-alternativo small" style="font-size:0.75rem;" id="textoUsuarioEmail">email@ejemplo.com</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="bloqueUsuarioInvitado" class="mb-4 p-3 bg-secundario rounded-3 border border-secondary">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                    <span class="small fw-bold text-color-principal"><i class="bi bi-person-fill-add me-1 text-info"></i>Compra rápida como Invitado</span>
                    <a href="../login/index.html" class="small text-color-resaltar text-decoration-none"><i class="bi bi-box-arrow-in-right me-1"></i>¿Ya tienes cuenta? Inicia sesión</a>
                  </div>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label small fw-bold text-color-alternativo">Nombre completo</label>
                      <input type="text" class="form-control bg-secundario-suave text-color-principal border-secondary" id="inputGuestNombre" placeholder="Ej: Maria Perez" oninput="formatearTarjetaLive()">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-bold text-color-alternativo">Correo para factura / guía</label>
                      <input type="email" class="form-control bg-secundario-suave text-color-principal border-secondary" id="inputGuestEmail" placeholder="ejemplo@correo.com">
                    </div>
                  </div>
                </div>

                <h6 class="fw-bold mb-3 text-color-resaltar"><i class="bi bi-wallet2 me-2"></i>2. Método de pago</h6>

                <div class="d-flex gap-2 mb-4 flex-wrap" id="metodosPagoPills">
                  <button type="button" class="btn btn-sm d-inline-flex align-items-center gap-2" id="btnMetodoTarjeta" style="background-color: rgba(6, 182, 212, 0.2); border: 1px solid #06B6D4; color: #06B6D4; padding: 10px 16px; border-radius: 12px; font-weight: 700;" onclick="cambiarMetodoPagoPasarela('tarjeta')">
                    <i class="bi bi-credit-card-2-front"></i> <span>Tarjeta</span>
                  </button>
                  <button type="button" class="btn btn-sm d-inline-flex align-items-center gap-2" id="btnMetodoPse" style="background-color: #0F172A; border: 1px solid rgba(148, 163, 184, 0.2); color: #CBD5E1; padding: 10px 16px; border-radius: 12px; font-weight: 600;" onclick="cambiarMetodoPagoPasarela('pse')">
                    <i class="bi bi-bank"></i> <span>PSE</span>
                  </button>
                  <button type="button" class="btn btn-sm d-inline-flex align-items-center gap-2" id="btnMetodoNequi" style="background-color: #0F172A; border: 1px solid rgba(148, 163, 184, 0.2); color: #CBD5E1; padding: 10px 16px; border-radius: 12px; font-weight: 600;" onclick="cambiarMetodoPagoPasarela('nequi')">
                    <i class="bi bi-phone"></i> <span>Nequi</span>
                  </button>
                  <button type="button" class="btn btn-sm d-inline-flex align-items-center gap-2" id="btnMetodoContra" style="background-color: #0F172A; border: 1px solid rgba(148, 163, 184, 0.2); color: #CBD5E1; padding: 10px 16px; border-radius: 12px; font-weight: 600;" onclick="cambiarMetodoPagoPasarela('contraentrega')">
                    <i class="bi bi-box-seam"></i> <span>Contra entrega</span>
                  </button>
                </div>

                <form id="formTransaccionPasarela" onsubmit="procesarTransaccionPasarela(event)">
                  <div id="seccionTarjeta">
                    <div class="credit-card-visual mb-4" id="creditCardVisual">
                      <div class="card-visual-bg"></div>
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <i class="bi bi-chip-fill fs-3 text-warning"></i>
                        <span class="card-brand-logo fw-bold fs-5 fst-italic" id="cardBrandText">VISA</span>
                      </div>
                      <div class="card-number-display mb-3" id="cardNumberDisplay">•••• •••• •••• ••••</div>
                      <div class="d-flex justify-content-between align-items-end">
                        <div>
                          <span class="card-label">TITULAR</span>
                          <div class="card-val-name text-uppercase text-truncate" style="max-width: 180px;" id="cardNameDisplay">NOMBRE DEL TITULAR</div>
                        </div>
                        <div class="text-end">
                          <span class="card-label">EXPIRACIÓN</span>
                          <div class="card-val-exp" id="cardExpDisplay">MM/YY</div>
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold text-color-alternativo">Nombre en la tarjeta</label>
                      <input type="text" class="form-control bg-secundario text-color-principal border-secondary" id="inputCardName" placeholder="Ej: LUIS G IMBACCHI" oninput="formatearTarjetaLive()">
                    </div>

                    <div class="row g-3 mb-3">
                      <div class="col-8">
                        <label class="form-label small fw-bold text-color-alternativo">Número de tarjeta</label>
                        <div class="input-group">
                          <span class="input-group-text bg-secundario text-color-alternativo border-secondary"><i class="bi bi-credit-card"></i></span>
                          <input type="text" class="form-control bg-secundario text-color-principal border-secondary" id="inputCardNumber" placeholder="4532 8912 3456 7890" maxlength="19" oninput="formatearTarjetaLive()">
                        </div>
                      </div>
                      <div class="col-4">
                        <label class="form-label small fw-bold text-color-alternativo">CVV</label>
                        <input type="password" class="form-control bg-secundario text-color-principal border-secondary text-center" id="inputCardCVV" placeholder="123" maxlength="4">
                      </div>
                    </div>

                    <div class="row g-3 mb-3">
                      <div class="col-6">
                        <label class="form-label small fw-bold text-color-alternativo">Expiración (MM/YY)</label>
                        <input type="text" class="form-control bg-secundario text-color-principal border-secondary text-center" id="inputCardExp" placeholder="12/28" maxlength="5" oninput="formatearTarjetaLive()">
                      </div>
                      <div class="col-6">
                        <label class="form-label small fw-bold text-color-alternativo">Cuotas</label>
                        <select class="form-select bg-secundario text-color-principal border-secondary" id="selectCuotas">
                          <option value="1">1 cuota (sin interés)</option>
                          <option value="3">3 cuotas</option>
                          <option value="6">6 cuotas</option>
                          <option value="12">12 cuotas</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div id="seccionPSE" class="d-none">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-color-alternativo">Selecciona tu Banco</label>
                      <select class="form-select bg-secundario text-color-principal border-secondary" id="selectBancoPSE">
                        <option value="Bancolombia">Bancolombia</option>
                        <option value="Nequi">Nequi</option>
                        <option value="Davivienda / Daviplata">Davivienda / Daviplata</option>
                        <option value="Banco de Bogotá">Banco de Bogotá</option>
                        <option value="BBVA Colombia">BBVA Colombia</option>
                        <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                      </select>
                    </div>
                    <div class="row g-3 mb-3">
                      <div class="col-6">
                        <label class="form-label small fw-bold text-color-alternativo">Tipo de Persona</label>
                        <select class="form-select bg-secundario text-color-principal border-secondary">
                          <option value="natural">Natural</option>
                          <option value="juridica">Jurídica</option>
                        </select>
                      </div>
                      <div class="col-6">
                        <label class="form-label small fw-bold text-color-alternativo">Documento de Identidad</label>
                        <input type="text" class="form-control bg-secundario text-color-principal border-secondary" placeholder="1098765432" id="inputPseDoc">
                      </div>
                    </div>
                  </div>

                  <div id="seccionNequi" class="d-none">
                    <div class="alert bg-secundario border-secondary text-color-principal p-3 rounded-3 mb-3">
                      <i class="bi bi-phone-vibrate text-info fs-4 me-2"></i>
                      <span>Ingresa tu celular Nequi. Recibirás una notificación en tu app para autorizar el pago.</span>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-color-alternativo">Número de celular Nequi</label>
                      <input type="tel" class="form-control bg-secundario text-color-principal border-secondary" placeholder="300 123 4567" id="inputTelNequi">
                    </div>
                  </div>

                  <div id="seccionContraentrega" class="d-none">
                    <div class="alert bg-secundario border-secondary text-color-principal p-3 rounded-3 mb-3">
                      <i class="bi bi-box-seam-fill text-warning fs-4 me-2"></i>
                      <span>Pagas en efectivo o transferencia cuando el repartidor entregue el pedido en tu domicilio.</span>
                    </div>
                  </div>

                  <h6 class="fw-bold mb-3 mt-4 text-color-resaltar"><i class="bi bi-geo-alt me-2"></i>3. Dirección y Ciudad de Envío</h6>
                  <div class="row g-3 mb-4">
                    <div class="col-md-6">
                      <label class="form-label small fw-bold text-color-alternativo">Ciudad de destino</label>
                      <select class="form-select bg-secundario text-color-principal border-secondary" id="selectCiudadPasarela" onchange="calcularEnvioPasarelaLive()" required>
                        <option value="Bogotá D.C.">Bogotá D.C.</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Cali">Cali</option>
                        <option value="Barranquilla">Barranquilla</option>
                        <option value="Bucaramanga">Bucaramanga</option>
                        <option value="Cartagena">Cartagena</option>
                        <option value="Manizales">Manizales</option>
                        <option value="Pereira">Pereira</option>
                        <option value="Cúcuta">Cúcuta</option>
                        <option value="Pasto">Pasto</option>
                        <option value="Otras Ciudades">Otras Ciudades</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-bold text-color-alternativo">Dirección de residencia</label>
                      <input type="text" class="form-control bg-secundario text-color-principal border-secondary" id="inputDireccionEnvioPasarela" value="Calle 123 # 45 - 67, Apt 502" required>
                    </div>
                  </div>

                  <button type="submit" class="btn bg-resaltar text-color-secundario fw-bold w-100 py-3 rounded-pill fs-5 shadow" id="btnPagarPasarela">
                    <i class="bi bi-lock-fill me-2"></i>Pagar Ahora
                  </button>
                </form>
              </div>

              <div class="col-lg-5 p-4 bg-secundario d-flex flex-column justify-content-between">
                <div>
                  <h6 class="fw-bold mb-3 text-color-principal"><i class="bi bi-receipt me-2 text-color-resaltar"></i>Resumen de la Compra</h6>
                  <div class="pasarela-items-list mb-3" id="pasarelaItemsList" style="max-height: 230px; overflow-y: auto;"></div>

                  <div class="border-top border-secondary pt-3">
                    <div class="d-flex justify-content-between mb-2 small text-color-alternativo">
                      <span>Subtotal</span>
                      <span class="text-color-principal" id="pasarelaSubtotal">$0</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2 small d-none" id="rowPasarelaDescuento">
                      <span class="text-success fw-bold"><i class="bi bi-tag-fill me-1"></i>Descuento 1ª Compra (10%)</span>
                      <span class="text-success fw-bold" id="pasarelaDescuento">-$0</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2 small text-color-alternativo">
                      <span>Envío</span>
                      <span id="pasarelaEnvio" class="fw-bold">$0</span>
                    </div>
                    <div id="pasarelaEnvioBanner" class="mt-2 mb-2"></div>
                    <hr class="border-secondary">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="fw-bold text-color-principal fs-5">Total a pagar</span>
                      <span class="fw-bold text-color-resaltar fs-3" id="pasarelaTotal">$0</span>
                    </div>
                  </div>
                </div>

                <div class="pasarela-security-box p-3 rounded-3 text-center border border-secondary mt-3">
                  <div class="d-flex justify-content-center gap-3 text-secondary mb-2">
                    <i class="bi bi-shield-check fs-4 text-success"></i>
                    <i class="bi bi-lock-fill fs-4 text-info"></i>
                    <i class="bi bi-patch-check-fill fs-4 text-warning"></i>
                  </div>
                  <p class="small text-color-alternativo mb-0">Transacción encriptada de extremo a extremo. Tus datos de pago están protegidos por Click Techs Pay.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function calcularEnvioPasarelaLive() {
  const resumen = obtenerResumenCarrito();
  if (!resumen) return { costoEnvio: 0, descuento: 0, totalConEnvio: 0, ciudad: "Bogotá D.C.", esGratis: true, esPrimera: true };

  const usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
  const guestEmail = document.getElementById("inputGuestEmail")?.value || "";
  const emailEvaluado = usuario ? usuario.email : guestEmail;

  const esPrimera = esPrimeraCompra(emailEvaluado);
  const descuento = (esPrimera && resumen.subtotal > 0) ? Math.round(resumen.subtotal * 0.10) : 0;
  const subtotalConDescuento = Math.max(0, resumen.subtotal - descuento);

  const ciudadSelect = document.getElementById("selectCiudadPasarela");
  const ciudad = ciudadSelect ? ciudadSelect.value : "Bogotá D.C.";

  let costoEnvio = 0;
  let esGratis = false;

  if (resumen.subtotal >= 150000) {
    costoEnvio = 0;
    esGratis = true;
  } else {
    if (ciudad.includes("Bogotá")) {
      costoEnvio = 7000;
    } else {
      costoEnvio = 15000;
    }
  }

  const totalFinal = subtotalConDescuento + costoEnvio;

  const rowDescuentoEl = document.getElementById("rowPasarelaDescuento");
  const descuentoEl = document.getElementById("pasarelaDescuento");
  const envioEl = document.getElementById("pasarelaEnvio");
  const totalEl = document.getElementById("pasarelaTotal");
  const btnPagarEl = document.getElementById("btnPagarPasarela");
  const bannerEl = document.getElementById("pasarelaEnvioBanner");

  if (rowDescuentoEl && descuentoEl) {
    if (esPrimera && descuento > 0) {
      rowDescuentoEl.classList.remove("d-none");
      descuentoEl.textContent = `-$${descuento.toLocaleString("es-CO")}`;
    } else {
      rowDescuentoEl.classList.add("d-none");
    }
  }

  if (envioEl) {
    if (esGratis) {
      envioEl.innerHTML = `<span class="text-success fw-bold"><i class="bi bi-gift-fill me-1"></i>GRATIS</span>`;
    } else {
      envioEl.innerHTML = `<span class="text-color-principal">$${costoEnvio.toLocaleString("es-CO")}</span>`;
    }
  }

  if (bannerEl) {
    if (esGratis) {
      bannerEl.innerHTML = `
        <div class="p-2 rounded-3 text-center border" style="background-color: rgba(34, 197, 94, 0.12); border-color: rgba(34, 197, 94, 0.3) !important; color: #4ADE80; font-size: 0.78rem;">
          <i class="bi bi-gift-fill me-1"></i>¡Envío GRATIS por compras superiores a $150.000!
        </div>
      `;
    } else {
      const faltante = 150000 - resumen.subtotal;
      bannerEl.innerHTML = `
        <div class="p-2.5 rounded-3 border" style="background-color: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.25) !important; color: #38BDF8; font-size: 0.78rem;">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span><i class="bi bi-truck me-1"></i>Envío (${ciudad})</span>
            <span class="fw-bold">$${costoEnvio.toLocaleString("es-CO")}</span>
          </div>
          <div class="text-color-alternativo" style="font-size: 0.72rem;">Agrega $${faltante.toLocaleString("es-CO")} más para Envío GRATIS</div>
        </div>
      `;
    }
  }

  if (totalEl) {
    totalEl.textContent = `$${totalFinal.toLocaleString("es-CO")}`;
  }

  if (btnPagarEl) {
    btnPagarEl.innerHTML = `<i class="bi bi-lock-fill me-2"></i>Pagar $${totalFinal.toLocaleString("es-CO")}`;
  }

  return { costoEnvio, descuento, totalConEnvio: totalFinal, ciudad, esGratis, esPrimera };
}

function abrirPasarelaPago() {
  crearModalPasarelaPago();

  const usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
  const resumen = obtenerResumenCarrito();
  if (!resumen) return;

  const bloqueRegistrado = document.getElementById("bloqueUsuarioRegistrado");
  const bloqueInvitado = document.getElementById("bloqueUsuarioInvitado");
  const inputCardName = document.getElementById("inputCardName");

  if (usuario) {
    if (bloqueRegistrado) {
      bloqueRegistrado.classList.remove("d-none");
      document.getElementById("textoUsuarioNombre").textContent = usuario.nombre || "Usuario Click Techs";
      document.getElementById("textoUsuarioEmail").textContent = usuario.email || "";
    }
    if (bloqueInvitado) bloqueInvitado.classList.add("d-none");
    if (inputCardName && !inputCardName.value) inputCardName.value = usuario.nombre;
  } else {
    if (bloqueRegistrado) bloqueRegistrado.classList.add("d-none");
    if (bloqueInvitado) bloqueInvitado.classList.remove("d-none");
  }

  const itemsContainer = document.getElementById("pasarelaItemsList");
  if (itemsContainer) {
    itemsContainer.innerHTML = resumen.items.map(item => `
      <div class="d-flex align-items-center gap-3 mb-2 pb-2 border-bottom border-secondary">
        <img src="${item.imagen || ''}" alt="${item.nombre}" style="width: 44px; height: 44px; object-fit: contain; background: #fff; border-radius: 8px; padding: 4px;">
        <div class="flex-grow-1 min-w-0">
          <h6 class="small fw-bold text-color-principal mb-0 text-truncate">${item.nombre}</h6>
          <span class="small text-color-alternativo">Cant: ${item.cantidad} x $${item.precio.toLocaleString("es-CO")}</span>
        </div>
        <span class="fw-bold text-color-resaltar small">$${item.totalItem.toLocaleString("es-CO")}</span>
      </div>
    `).join("");
  }

  document.getElementById("pasarelaSubtotal").textContent = `$${resumen.subtotal.toLocaleString("es-CO")}`;
  calcularEnvioPasarelaLive();

  formatearTarjetaLive();

  const modalEl = document.getElementById("modalPasarelaPago");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function cambiarMetodoPagoPasarela(metodo) {
  metodoPagoPasarelaSeleccionado = metodo;

  const btnIds = ["btnMetodoTarjeta", "btnMetodoPse", "btnMetodoNequi", "btnMetodoContra"];
  btnIds.forEach(id => {
    const b = document.getElementById(id);
    if (b) {
      b.style.backgroundColor = "#0F172A";
      b.style.borderColor = "rgba(148, 163, 184, 0.2)";
      b.style.color = "#CBD5E1";
      b.style.fontWeight = "600";
      b.style.boxShadow = "none";
    }
  });

  let activeId = "btnMetodoTarjeta";
  if (metodo === "pse") activeId = "btnMetodoPse";
  if (metodo === "nequi") activeId = "btnMetodoNequi";
  if (metodo === "contraentrega") activeId = "btnMetodoContra";

  const activeBtn = document.getElementById(activeId);
  if (activeBtn) {
    activeBtn.style.backgroundColor = "rgba(6, 182, 212, 0.2)";
    activeBtn.style.borderColor = "#06B6D4";
    activeBtn.style.color = "#06B6D4";
    activeBtn.style.fontWeight = "700";
    activeBtn.style.boxShadow = "0 0 12px rgba(6, 182, 212, 0.25)";
  }

  document.getElementById("seccionTarjeta")?.classList.toggle("d-none", metodo !== "tarjeta");
  document.getElementById("seccionPSE")?.classList.toggle("d-none", metodo !== "pse");
  document.getElementById("seccionNequi")?.classList.toggle("d-none", metodo !== "nequi");
  document.getElementById("seccionContraentrega")?.classList.toggle("d-none", metodo !== "contraentrega");
}

function formatearTarjetaLive() {
  const numInput = document.getElementById("inputCardNumber");
  const nameInput = document.getElementById("inputCardName");
  const guestNameInput = document.getElementById("inputGuestNombre");
  const expInput = document.getElementById("inputCardExp");

  if (!numInput) return;

  let v = numInput.value.replace(/\D/g, "");
  let formatted = "";
  for (let i = 0; i < v.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += " ";
    formatted += v[i];
  }
  numInput.value = formatted;

  const cardNumDisplay = document.getElementById("cardNumberDisplay");
  if (cardNumDisplay) cardNumDisplay.textContent = formatted.length > 0 ? formatted : "•••• •••• •••• ••••";

  const cardBrandText = document.getElementById("cardBrandText");
  if (cardBrandText) {
    if (v.startsWith("4")) cardBrandText.textContent = "VISA";
    else if (v.startsWith("5")) cardBrandText.textContent = "MASTERCARD";
    else if (v.startsWith("3")) cardBrandText.textContent = "AMEX";
    else cardBrandText.textContent = "CARD";
  }

  let nombreTitular = "NOMBRE DEL TITULAR";
  if (nameInput && nameInput.value.trim().length > 0) {
    nombreTitular = nameInput.value;
  } else if (guestNameInput && guestNameInput.value.trim().length > 0) {
    nombreTitular = guestNameInput.value;
  }

  const cardNameDisplay = document.getElementById("cardNameDisplay");
  if (cardNameDisplay) cardNameDisplay.textContent = nombreTitular;

  const cardExpDisplay = document.getElementById("cardExpDisplay");
  if (cardExpDisplay) cardExpDisplay.textContent = expInput && expInput.value.trim().length > 0 ? expInput.value : "MM/YY";
}

async function procesarTransaccionPasarela(event) {
  event.preventDefault();

  const usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
  const resumen = obtenerResumenCarrito();
  if (!resumen || resumen.items.length === 0) return;

  if (!usuario) {
    if (typeof mostrarToastCarrito === "function") {
      mostrarToastCarrito("Por favor inicia sesión para continuar con el pago", "warning");
    }
    setTimeout(() => {
      window.location.href = "../login/index.html";
    }, 1500);
    return;
  }

  const infoEnvio = calcularEnvioPasarelaLive();
  const direccionInput = document.getElementById("inputDireccionEnvioPasarela")?.value || "Calle 123 # 45 - 67";
  const direccionCompleta = `${direccionInput}, ${infoEnvio.ciudad}`;

  let nombreMetodo = "Tarjeta de Crédito (Visa)";
  if (metodoPagoPasarelaSeleccionado === "pse") {
    const banco = document.getElementById("selectBancoPSE")?.value || "Bancolombia";
    nombreMetodo = `PSE (${banco})`;
  } else if (metodoPagoPasarelaSeleccionado === "nequi") {
    nombreMetodo = "Nequi";
  } else if (metodoPagoPasarelaSeleccionado === "contraentrega") {
    nombreMetodo = "Pago Contra entrega";
  }

  const bodyContent = document.getElementById("pasarelaBodyContent");
  if (!bodyContent) return;

  bodyContent.innerHTML = `
    <div class="p-5 text-center my-4">
      <div class="spinner-border text-info mb-4" style="width: 3.5rem; height: 3.5rem;" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <h4 class="fw-bold text-color-principal mb-2">Procesando transacción segura...</h4>
      <p class="text-color-alternativo small">Conectando con la pasarela de pago. No cierres la ventana.</p>
    </div>
  `;

  const listaDetalles = resumen.items.map(item => ({
    idProducto: Number(item.id),
    cantidad: Number(item.cantidad),
    precioUnitario: Number(item.precio),
    subtotal: Number(item.totalItem)
  }));

  const payload = {
    idUsuario: Number(usuario.idUsuario),
    direccion: direccionCompleta,
    total: Number(resumen.subtotal),
    metodoPago: nombreMetodo,
    fecha: new Date().toISOString(),
    detalles: listaDetalles,
    detallePedidoRequestList: listaDetalles
  };


  try {
    const response = await fetch(`${CONFIG.API_URL}/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${usuario.token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      vaciarCarrito();
      bodyContent.innerHTML = `
        <div class="p-5 text-center my-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-25 text-success rounded-circle mb-3 p-3" style="width: 80px; height: 80px;">
            <i class="bi bi-check-circle-fill display-4"></i>
          </div>
          <h3 class="fw-bold text-color-principal mb-2">¡Pago Aprobado con Éxito!</h3>
          <p class="text-color-alternativo mb-2">Tu pedido <strong>#${data.data?.id || 'CT-' + Math.floor(100000 + Math.random() * 900000)}</strong> ha sido registrado en el sistema.</p>
          <span class="badge bg-success px-4 py-2 fs-6 rounded-pill mb-3">Aprobado</span>
        </div>
      `;

      setTimeout(() => {
        const modalEl = document.getElementById("modalPasarelaPago");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        window.location.href = "../pedidos/index.html";
      }, 2500);
    } else {
      let mensajeError = data.message || "Error al procesar el pago.";
      if (data.data && typeof data.data === "object") {
        mensajeError = Object.values(data.data).join("<br>");
      }
      bodyContent.innerHTML = `
        <div class="p-5 text-center my-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-25 text-danger rounded-circle mb-3 p-3" style="width: 80px; height: 80px;">
            <i class="bi bi-exclamation-triangle-fill display-4"></i>
          </div>
          <h4 class="fw-bold text-color-principal mb-2">Transacción Rechazada</h4>
          <p class="text-color-alternativo small mb-4">${mensajeError}</p>
          <button class="btn btn-outline-info rounded-pill px-4" onclick="abrirPasarelaPago()">Intentar de nuevo</button>
        </div>
      `;
    }
  } catch (error) {
    bodyContent.innerHTML = `
      <div class="p-5 text-center my-4">
        <div class="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-25 text-danger rounded-circle mb-3 p-3" style="width: 80px; height: 80px;">
          <i class="bi bi-wifi-off display-4"></i>
        </div>
        <h4 class="fw-bold text-color-principal mb-2">Error de conexión</h4>
        <p class="text-color-alternativo small mb-4">No fue posible conectar con el servidor backend.</p>
        <button class="btn btn-outline-info rounded-pill px-4" onclick="abrirPasarelaPago()">Intentar de nuevo</button>
      </div>
    `;
  }
}


function _rutaCatalogo() {
  if (window.location.pathname.includes("/catalogo/")) return "#";
  return "../catalogo/index.html";
}

async function abrirCarrito() {
  await _obtenerProductosDisponibles();
  renderizarCarrito();
  const offcanvasEl = document.getElementById("offcanvasCarrito");
  if (!offcanvasEl) return;
  const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
  offcanvas.show();
}

document.addEventListener("DOMContentLoaded", async () => {
  crearOffcanvasCarrito();
  crearToastContainer();
  await _obtenerProductosDisponibles();
  await validarCarrito();
  actualizarBadgeCarrito();
  if (typeof listarProductos === "function") listarProductos();
});

