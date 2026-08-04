let estadoFiltroActual = "todos";

function obtenerUsuarioAutenticado() {
  return JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
}

function generarEjemplosDeDataLocal() {
  const prods = (typeof _obtenerProductosDisponibles === "function") 
    ? _obtenerProductosDisponibles() 
    : (typeof PRODUCTOS_INICIALES !== "undefined" ? PRODUCTOS_INICIALES : []);

  if (!prods || prods.length === 0) return [];

  const getProd = (id) => prods.find(p => p.id === id) || prods[0];

  const p1 = getProd(1);
  const p7 = getProd(7);
  const p3 = getProd(3);
  const p4 = getProd(4);
  const p2 = getProd(2);
  const p6 = getProd(6);

  return [
    {
      id: "CT-948102",
      fecha: "Hoy, 10:30 AM",
      timestamp: Date.now() - 7200000,
      estado: "en-proceso",
      paso: 2,
      pasoTexto: "En preparación por el equipo Click Techs",
      transportadora: "Servientrega",
      guia: "CT-TRK-948102",
      direccion: "Av. El Dorado #68-90, Apt 502, Bogotá D.C.",
      metodoPago: "Tarjeta de Crédito (Visa *4321)",
      total: (p1 ? p1.precio : 289900) + (p7 ? p7.precio : 129900),
      items: [
        { ...p1, cantidad: 1, totalItem: p1 ? p1.precio : 289900 },
        { ...p7, cantidad: 1, totalItem: p7 ? p7.precio : 129900 }
      ]
    },
    {
      id: "CT-882319",
      fecha: "Ayer, 03:45 PM",
      timestamp: Date.now() - 86400000,
      estado: "en-entrega",
      paso: 3,
      pasoTexto: "En camino a tu domicilio con repartidor",
      transportadora: "Interrapidísimo",
      guia: "INT-882319-COL",
      direccion: "Av. El Dorado #68-90, Apt 502, Bogotá D.C.",
      metodoPago: "PSE - Bancolombia",
      total: (p3 ? p3.precio : 1149900) + (p4 ? p4.precio : 349900),
      items: [
        { ...p3, cantidad: 1, totalItem: p3 ? p3.precio : 1149900 },
        { ...p4, cantidad: 1, totalItem: p4 ? p4.precio : 349900 }
      ]
    },
    {
      id: "CT-721094",
      fecha: "18 de Julio, 2026",
      timestamp: Date.now() - 1500000000,
      estado: "entregado",
      paso: 4,
      pasoTexto: "Entregado el 20 de Julio, 2026",
      transportadora: "Servientrega",
      guia: "CT-TRK-721094",
      direccion: "Av. El Dorado #68-90, Apt 502, Bogotá D.C.",
      metodoPago: "Tarjeta de Crédito (Mastercard *9876)",
      total: p2 ? p2.precio : 179900,
      items: [
        { ...p2, cantidad: 1, totalItem: p2 ? p2.precio : 179900 }
      ]
    },
    {
      id: "CT-615022",
      fecha: "02 de Junio, 2026",
      timestamp: Date.now() - 5000000000,
      estado: "entregado",
      paso: 4,
      pasoTexto: "Entregado el 05 de Junio, 2026",
      transportadora: "Coordinadora",
      guia: "COO-615022-BO",
      direccion: "Av. El Dorado #68-90, Apt 502, Bogotá D.C.",
      metodoPago: "Nequi",
      total: p6 ? p6.precio : 419900,
      items: [
        { ...p6, cantidad: 1, totalItem: p6 ? p6.precio : 419900 }
      ]
    }
  ];
}

function obtenerPedidos() {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) return [];

  const keyPedidos = `pedidos_${usuario.email}`;
  let pedidosGuardados = localStorage.getItem(keyPedidos);

  if (!pedidosGuardados) {
    const ejemplosIniciales = generarEjemplosDeDataLocal();
    localStorage.setItem(keyPedidos, JSON.stringify(ejemplosIniciales));
    return ejemplosIniciales;
  }

  try {
    let list = JSON.parse(pedidosGuardados);
    if (!Array.isArray(list) || list.some(p => !p.items || p.items.some(item => !item || !item.nombre))) {
      const ejemplosIniciales = generarEjemplosDeDataLocal();
      localStorage.setItem(keyPedidos, JSON.stringify(ejemplosIniciales));
      return ejemplosIniciales;
    }
    return list;
  } catch (e) {
    const ejemplosIniciales = generarEjemplosDeDataLocal();
    localStorage.setItem(keyPedidos, JSON.stringify(ejemplosIniciales));
    return ejemplosIniciales;
  }
}

function renderizarEstadisticas(pedidos) {
  const total = pedidos.length;
  const enProceso = pedidos.filter(p => p.estado === "en-proceso").length;
  const enEntrega = pedidos.filter(p => p.estado === "en-entrega").length;
  const entregados = pedidos.filter(p => p.estado === "entregado").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statProceso").textContent = enProceso;
  document.getElementById("statEntrega").textContent = enEntrega;
  document.getElementById("statEntregados").textContent = entregados;

  document.getElementById("countTabTodos").textContent = total;
  document.getElementById("countTabProceso").textContent = enProceso;
  document.getElementById("countTabEntrega").textContent = enEntrega;
  document.getElementById("countTabHistorial").textContent = entregados;
}

function obtenerBadgeEstado(estado) {
  switch (estado) {
    case "en-proceso":
      return `<span class="badge-estado badge-proceso"><i class="bi bi-gear-wide-connected spinner-proceso"></i> En proceso</span>`;
    case "en-entrega":
      return `<span class="badge-estado badge-entrega"><i class="bi bi-truck"></i> En entrega</span>`;
    case "entregado":
      return `<span class="badge-estado badge-entregado"><i class="bi bi-check-circle-fill"></i> Entregado</span>`;
    default:
      return `<span class="badge-estado">${estado}</span>`;
  }
}

function crearTrackerPasos(pasoActual) {
  const pasos = [
    { num: 1, titulo: "Confirmado", icon: "bi-receipt" },
    { num: 2, titulo: "En preparación", icon: "bi-box-seam" },
    { num: 3, titulo: "En camino", icon: "bi-truck" },
    { num: 4, titulo: "Entregado", icon: "bi-house-check" }
  ];

  return `
    <div class="pedido-progress-container">
      <div class="pedido-progress-line">
        <div class="pedido-progress-line-fill" style="width: ${((pasoActual - 1) / 3) * 100}%"></div>
      </div>
      <div class="pedido-steps">
        ${pasos.map(step => {
          let statusClass = "";
          if (step.num < pasoActual) statusClass = "completed";
          else if (step.num === pasoActual) statusClass = "active";
          return `
            <div class="step-item ${statusClass}">
              <div class="step-icon-wrap">
                <i class="bi ${step.icon}"></i>
              </div>
              <span class="step-label">${step.titulo}</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function crearTarjetaPedido(pedido) {
  const badge = obtenerBadgeEstado(pedido.estado);
  const tracker = crearTrackerPasos(pedido.paso);

  const itemsHTML = pedido.items.map(item => {
    const imgHTML = item.imagen
      ? `<img src="${item.imagen}" alt="${item.nombre}" class="pedido-item-img">`
      : `<div class="pedido-item-img d-flex align-items-center justify-content-center bg-dark"><i class="bi bi-image text-secondary"></i></div>`;

    return `
      <div class="pedido-item-row">
        ${imgHTML}
        <div class="pedido-item-info">
          <span class="pedido-item-cat">${item.categoria || "Periféricos"}</span>
          <h6 class="pedido-item-name">${item.nombre}</h6>
          <span class="pedido-item-qty">Cantidad: ${item.cantidad} x $${item.precio.toLocaleString("es-CO")}</span>
        </div>
        <div class="pedido-item-price">$${(item.precio * item.cantidad).toLocaleString("es-CO")}</div>
      </div>
    `;
  }).join("");

  return `
    <div class="card-pedido" id="pedido-${pedido.id}">
      <div class="card-pedido-header">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <div>
            <span class="card-pedido-id">Pedido ${pedido.id}</span>
            <div class="card-pedido-date"><i class="bi bi-calendar3 me-1"></i>Realizado el ${pedido.fecha}</div>
          </div>
          ${badge}
        </div>
        <div class="card-pedido-total-wrap text-end">
          <span class="card-pedido-total-label">Total pagado</span>
          <span class="card-pedido-total-val">$${pedido.total.toLocaleString("es-CO")}</span>
        </div>
      </div>

      <div class="card-pedido-body">
        ${tracker}
        <div class="pedido-status-banner">
          <i class="bi bi-info-circle me-2"></i><strong>Estado actual:</strong> ${pedido.pasoTexto}
        </div>

        <div class="pedido-items-container mt-3">
          ${itemsHTML}
        </div>

        <div class="pedido-details-collapse collapse" id="detalles-${pedido.id}">
          <div class="pedido-extra-info">
            <div class="row g-3">
              <div class="col-md-4">
                <span class="extra-info-label"><i class="bi bi-geo-alt me-1"></i> Dirección de envío</span>
                <p class="extra-info-val">${pedido.direccion}</p>
              </div>
              <div class="col-md-4">
                <span class="extra-info-label"><i class="bi bi-credit-card me-1"></i> Método de pago</span>
                <p class="extra-info-val">${pedido.metodoPago}</p>
              </div>
              <div class="col-md-4">
                <span class="extra-info-label"><i class="bi bi-truck me-1"></i> Transporte & Guía</span>
                <p class="extra-info-val">${pedido.transportadora} - <code>${pedido.guia}</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-pedido-footer">
        <button class="btn-pedido-action btn-outline-custom" type="button" data-bs-toggle="collapse" data-bs-target="#detalles-${pedido.id}">
          <i class="bi bi-eye me-1"></i> Detalle del pedido
        </button>

        <div class="d-flex gap-2">
          ${pedido.estado !== 'entregado' ? `
            <button class="btn-pedido-action btn-track-custom" onclick="abrirModalRastreo('${pedido.id}')">
              <i class="bi bi-pin-map me-1"></i> Rastrear pedido
            </button>
          ` : ''}
          <button class="btn-pedido-action btn-reorder-custom" onclick="recomprarPedido('${pedido.id}')">
            <i class="bi bi-cart-plus me-1"></i> Volver a comprar
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderizarPedidos() {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) return;

  const contenedor = document.getElementById("contenedorPedidos");
  const sinPedidos = document.getElementById("sinPedidos");
  if (!contenedor) return;

  const pedidos = obtenerPedidos();
  renderizarEstadisticas(pedidos);

  let filtrados = pedidos;
  if (estadoFiltroActual !== "todos") {
    filtrados = pedidos.filter(p => p.estado === estadoFiltroActual);
  }

  if (filtrados.length === 0) {
    contenedor.innerHTML = "";
    if (sinPedidos) sinPedidos.classList.remove("d-none");
  } else {
    if (sinPedidos) sinPedidos.classList.add("d-none");
    contenedor.innerHTML = filtrados.map(p => crearTarjetaPedido(p)).join("");
  }
}

function initTabsFiltro() {
  const buttons = document.querySelectorAll("#tabsPedidos button");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      estadoFiltroActual = btn.getAttribute("data-filtro");
      renderizarPedidos();
    });
  });
}

function recomprarPedido(idPedido) {
  const pedidos = obtenerPedidos();
  const pedido = pedidos.find(p => p.id === idPedido);
  if (!pedido) return;

  let agregados = 0;
  pedido.items.forEach(item => {
    for (let i = 0; i < item.cantidad; i++) {
      if (agregarAlCarrito(item.id)) agregados++;
    }
  });

  if (agregados > 0) {
    mostrarToastCarrito("Productos añadidos al carrito", "success");
    abrirCarrito();
  }
}

function abrirModalRastreo(idPedido) {
  const pedidos = obtenerPedidos();
  const pedido = pedidos.find(p => p.id === idPedido);
  if (!pedido) return;

  const modalEl = document.getElementById("modalRastreo");
  if (!modalEl) return;

  document.getElementById("rastreoIdPedido").textContent = pedido.id;
  document.getElementById("rastreoTransportadora").textContent = pedido.transportadora;
  document.getElementById("rastreoGuia").textContent = pedido.guia;
  document.getElementById("rastreoEstadoActual").textContent = pedido.pasoTexto;

  const timelineContainer = document.getElementById("rastreoTimeline");
  const eventos = [
    { fecha: pedido.fecha, titulo: "Pedido recibido en el sistema", desc: "El pedido fue registrado y confirmado por Click Techs.", icon: "bi-check-circle-fill", active: true },
    { fecha: "Hace unas horas", titulo: "Empacado y listo en almacén", desc: "Tu paquete fue preparado con sus respectivos sellos de garantía.", icon: "bi-box-seam-fill", active: pedido.paso >= 2 },
    { fecha: "En tránsito", titulo: "Entregado a la empresa transportadora", desc: `El paquete viaja con ${pedido.transportadora} con número de guía ${pedido.guia}.`, icon: "bi-truck", active: pedido.paso >= 3 },
    { fecha: "Estimado pronto", titulo: "Entrega final en domicilio", desc: `Dirección de entrega: ${pedido.direccion}`, icon: "bi-house-heart-fill", active: pedido.paso >= 4 }
  ];

  timelineContainer.innerHTML = eventos.map(ev => `
    <div class="timeline-event ${ev.active ? 'active' : ''}">
      <div class="timeline-icon">
        <i class="bi ${ev.icon}"></i>
      </div>
      <div class="timeline-content">
        <span class="timeline-date">${ev.fecha}</span>
        <h6 class="timeline-title">${ev.titulo}</h6>
        <p class="timeline-desc">${ev.desc}</p>
      </div>
    </div>
  `).join("");

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

document.addEventListener("DOMContentLoaded", () => {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) {
    window.location.href = "../login/index.html";
    return;
  }
  document.getElementById("usuarioNombreHeading").textContent = usuario.nombre || usuario.email;
  initTabsFiltro();
  renderizarPedidos();
});
