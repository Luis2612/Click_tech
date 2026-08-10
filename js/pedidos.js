let estadoFiltroActual = "todos";
let PEDIDOS_CACHE = [];

function obtenerUsuarioAutenticado() {
  return JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
}

function formatearFechaPedido(fechaRaw) {
  if (!fechaRaw) return "Fecha N/A";
  if (Array.isArray(fechaRaw)) {
    const y = fechaRaw[0];
    const m = (fechaRaw[1] || 1) - 1;
    const d = fechaRaw[2] || 1;
    const h = fechaRaw[3] || 0;
    const min = fechaRaw[4] || 0;
    const dObj = new Date(y, m, d, h, min);
    return dObj.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  const dObj = new Date(fechaRaw);
  if (isNaN(dObj.getTime())) return String(fechaRaw);
  return dObj.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function obtenerPedidosBackend() {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) return [];
  try {
    const res = await fetch(`${CONFIG.API_URL}/pedidos/usuario/${usuario.idUsuario}`, {
      headers: {
        "Authorization": `Bearer ${usuario.token}`
      }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      const productosMap = {};
      if (typeof _obtenerProductosBackend === "function") {
        const prods = await _obtenerProductosBackend();
        prods.forEach(p => { productosMap[p.id] = p; });
      }
      return data.data.map(p => ({
        id: `CT-${p.id}`,
        rawId: p.id,
        fecha: formatearFechaPedido(p.fecha),
        timestamp: p.fecha ? new Date(p.fecha).getTime() : Date.now(),
        estado: "en-proceso",
        paso: 2,
        pasoTexto: "En preparación por el equipo de almacén",
        transportadora: "Servientrega",
        guia: `CT-TRK-${p.id}`,
        direccion: p.direccion || "Dirección registrada",
        metodoPago: p.metodoPago || "Tarjeta de Crédito",
        total: Number(p.total),
        items: (p.detallePedidoResponseList || p.detalles || []).map(d => {
          const prod = productosMap[d.productoId || d.idProducto] || {};
          return {
            id: d.productoId || d.idProducto,
            nombre: prod.nombre || `Producto #${d.productoId || d.idProducto}`,
            categoria: prod.categoria || "Periféricos",
            imagen: prod.imagen || "",
            cantidad: d.cantidad,
            precio: Number(d.precioUnitario),
            totalItem: Number(d.subtotal)
          };
        })
      }));
    }
    return [];
  } catch (e) {
    return [];
  }
}

function renderizarEstadisticas(pedidos) {
  const total = pedidos.length;
  const enProceso = pedidos.filter(p => p.estado === "en-proceso").length;
  const enEntrega = pedidos.filter(p => p.estado === "en-entrega").length;
  const entregados = pedidos.filter(p => p.estado === "entregado").length;

  const statTotal = document.getElementById("statTotal");
  const statProceso = document.getElementById("statProceso");
  const statEntrega = document.getElementById("statEntrega");
  const statEntregados = document.getElementById("statEntregados");

  if (statTotal) statTotal.textContent = total;
  if (statProceso) statProceso.textContent = enProceso;
  if (statEntrega) statEntrega.textContent = enEntrega;
  if (statEntregados) statEntregados.textContent = entregados;

  const countTabTodos = document.getElementById("countTabTodos");
  const countTabProceso = document.getElementById("countTabProceso");
  const countTabEntrega = document.getElementById("countTabEntrega");
  const countTabHistorial = document.getElementById("countTabHistorial");

  if (countTabTodos) countTabTodos.textContent = total;
  if (countTabProceso) countTabProceso.textContent = enProceso;
  if (countTabEntrega) countTabEntrega.textContent = enEntrega;
  if (countTabHistorial) countTabHistorial.textContent = entregados;
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
    const fallbackImg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
    const imgHTML = item.imagen
      ? `<img src="${item.imagen}" alt="${item.nombre}" class="pedido-item-img" onerror="this.onerror=null; this.src='${fallbackImg}';">`
      : `<div class="pedido-item-img d-flex align-items-center justify-content-center bg-dark"><i class="bi bi-image text-secondary"></i></div>`;

    return `
      <div class="pedido-item-row">
        ${imgHTML}
        <div class="pedido-item-info">
          <span class="pedido-item-cat text-info fw-semibold">${item.categoria || "Periféricos"}</span>
          <h6 class="pedido-item-name text-white fw-bold m-0">${item.nombre}</h6>
          <span class="pedido-item-qty text-light opacity-75 small">Cantidad: ${item.cantidad} x $${item.precio.toLocaleString("es-CO")}</span>
        </div>
        <span class="pedido-item-price text-info fw-bold fs-6">$${item.totalItem.toLocaleString("es-CO")}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="card card-pedido mb-4">
      <div class="card-pedido-header">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h5 class="card-pedido-id mb-0 text-white fw-bold">${pedido.id}</h5>
            ${badge}
          </div>
          <span class="card-pedido-date text-light opacity-75 small"><i class="bi bi-calendar3 me-1"></i>${pedido.fecha}</span>
        </div>
        <div class="text-end">
          <span class="card-pedido-total-label text-light opacity-75 small d-block">Total del Pedido</span>
          <div class="card-pedido-total-val text-info fw-bold fs-5">$${pedido.total.toLocaleString("es-CO")}</div>
        </div>
      </div>

      <div class="card-pedido-body">
        ${tracker}

        <div class="pedido-items-list mt-4">
          ${itemsHTML}
        </div>

        <div class="pedido-details-grid mt-3 pt-3 border-top border-secondary row g-3">
          <div class="col-md-4">
            <span class="detail-label"><i class="bi bi-geo-alt me-1"></i>Dirección de Envío</span>
            <p class="detail-val">${pedido.direccion}</p>
          </div>
          <div class="col-md-4">
            <span class="detail-label"><i class="bi bi-credit-card me-1"></i>Método de Pago</span>
            <p class="detail-val">${pedido.metodoPago}</p>
          </div>
          <div class="col-md-4">
            <span class="detail-label"><i class="bi bi-truck me-1"></i>Transportadora</span>
            <p class="detail-val">${pedido.transportadora} (${pedido.guia})</p>
          </div>
        </div>
      </div>

      <div class="card-pedido-footer">
        <button class="btn btn-outline-info rounded-pill btn-sm fw-bold" onclick="abrirModalRastreo('${pedido.id}')">
          <i class="bi bi-geo me-1"></i>Rastrear Envío
        </button>
      </div>
    </div>
  `;
}

async function renderizarPedidos() {
  const container = document.getElementById("contenedorPedidos");
  if (!container) return;

  PEDIDOS_CACHE = await obtenerPedidosBackend();
  renderizarEstadisticas(PEDIDOS_CACHE);

  let filtrados = PEDIDOS_CACHE;
  if (estadoFiltroActual !== "todos") {
    filtrados = PEDIDOS_CACHE.filter(p => p.estado === estadoFiltroActual);
  }

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-box-seam display-1 text-secondary mb-3 d-block"></i>
        <h5 class="text-color-principal fw-bold">No tienes pedidos en esta categoría</h5>
        <p class="text-color-alternativo small">Cuando realices compras desde el catálogo aparecerán aquí.</p>
        <a href="../catalogo/index.html" class="btn btn-outline-info rounded-pill px-4 mt-2">
          <i class="bi bi-shop me-2"></i>Ir al catálogo
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = filtrados.map(p => crearTarjetaPedido(p)).join("");
}

function initTabsFiltro() {
  const tabs = document.querySelectorAll("#tabsPedidos .tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      estadoFiltroActual = tab.getAttribute("data-filtro") || "todos";
      renderizarPedidos();
    });
  });
}

function abrirModalRastreo(idPedido) {
  const pedido = PEDIDOS_CACHE.find(p => p.id === idPedido);
  if (!pedido) return;

  const modalEl = document.getElementById("modalRastreo");
  if (!modalEl) return;

  const rId = document.getElementById("rastreoIdPedido");
  const rTrans = document.getElementById("rastreoTransportadora");
  const rGuia = document.getElementById("rastreoGuia");
  const rEst = document.getElementById("rastreoEstadoActual");

  if (rId) rId.textContent = pedido.id;
  if (rTrans) rTrans.textContent = pedido.transportadora;
  if (rGuia) rGuia.textContent = pedido.guia;
  if (rEst) rEst.textContent = pedido.pasoTexto;

  const timelineContainer = document.getElementById("rastreoTimeline");
  const eventos = [
    { fecha: pedido.fecha, titulo: "Pedido recibido en el sistema", desc: "El pedido fue registrado y confirmado por Click Techs.", icon: "bi-check-circle-fill", active: true },
    { fecha: "Hace unas horas", titulo: "Empacado y listo en almacén", desc: "Tu paquete fue preparado con sus respectivos sellos de garantía.", icon: "bi-box-seam-fill", active: pedido.paso >= 2 },
    { fecha: "En tránsito", titulo: "Entregado a la empresa transportadora", desc: `El paquete viaja con ${pedido.transportadora} con número de guía ${pedido.guia}.`, icon: "bi-truck", active: pedido.paso >= 3 },
    { fecha: "Estimado pronto", titulo: "Entrega final en domicilio", desc: `Dirección de entrega: ${pedido.direccion}`, icon: "bi-house-heart-fill", active: pedido.paso >= 4 }
  ];

  if (timelineContainer) {
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
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

document.addEventListener("DOMContentLoaded", () => {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) {
    window.location.href = "../login/index.html";
    return;
  }
  const hHeading = document.getElementById("usuarioNombreHeading");
  if (hHeading) hHeading.textContent = usuario.nombre || usuario.email;
  initTabsFiltro();
  renderizarPedidos();
});
