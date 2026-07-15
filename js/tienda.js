function obtenerProductosTienda() {
  const nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");
  const eliminados = JSON.parse(localStorage.getItem("productos_eliminados") || "[]");
  const editados = JSON.parse(localStorage.getItem("productos_editados") || "{}");

  const base = PRODUCTOS_INICIALES
    .filter(p => !eliminados.includes(p.id))
    .map(p => editados[p.id] ? editados[p.id] : p);

  return [...base, ...nuevos];
}

function generarFiltros(productos) {
  const categorias = [...new Set(productos.map(p => p.categoria))].sort();
  const contenedor = document.getElementById("filtroCategorias");

  categorias.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-light btn-sm rounded-pill px-3 fw-bold";
    btn.setAttribute("data-categoria", cat);
    btn.textContent = cat;
    contenedor.appendChild(btn);
  });

  contenedor.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      contenedor.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      const filtro = e.target.getAttribute("data-categoria");
      mostrarProductos(filtro);
    }
  });
}

function crearTarjetaProducto(producto) {
  const imagenHTML = producto.imagen
    ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="card-img-top" style="height: 200px; object-fit: cover;">`
    : `<div class="d-flex align-items-center justify-content-center" style="height: 200px; background: #1a1a1a;">
         <i class="bi bi-image display-4 text-secondary"></i>
       </div>`;

  const stockBadge = producto.stock > 10
    ? `<span class="badge bg-success bg-opacity-25 text-success">En stock</span>`
    : producto.stock > 0
      ? `<span class="badge bg-warning bg-opacity-25 text-warning">Últimas ${producto.stock} uds</span>`
      : `<span class="badge bg-danger bg-opacity-25 text-danger">Agotado</span>`;

  return `
    <div class="col-sm-6 col-md-4 col-lg-3">
      <div class="card card-producto h-100 border-secondary rounded-3 overflow-hidden d-flex flex-column">
        <a href="product.html?id=${producto.id}" class="text-decoration-none text-reset d-flex flex-column flex-grow-1">
          ${imagenHTML}
          <div class="card-body d-flex flex-column flex-grow-1 pb-2">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary bg-opacity-25 text-primary small">${producto.categoria}</span>
              ${stockBadge}
            </div>
            <h6 class="card-title fw-bold mb-1 text-color-principal">${producto.nombre}</h6>
            <p class="card-text text-color-alternativo small flex-grow-1">${producto.descripcion.length > 80 ? producto.descripcion.substring(0, 80) + "..." : producto.descripcion}</p>
          </div>
        </a>
        <div class="p-3 pt-0 d-flex align-items-center justify-content-between mt-auto">
          <span class="fs-5 fw-bold text-color-resaltar">$${producto.precio.toLocaleString("es-CO")}</span>
          <button type="button" class="btn btn-outline-info" data-id="${producto.id}" onclick="agregarAlCarrito(${producto.id})"><i class="bi bi-cart3 fs-4"></i></button>
        </div>
      </div>
    </div>
  `;
}

function mostrarProductos(categoriaFiltro = "todas") {
  const productos = obtenerProductosTienda();
  const contenedor = document.getElementById("contenedorProductos");
  const sinProductos = document.getElementById("sinProductos");

  const filtrados = categoriaFiltro === "todas"
    ? productos
    : productos.filter(p => p.categoria === categoriaFiltro);

  if (filtrados.length === 0) {
    contenedor.innerHTML = "";
    sinProductos.classList.remove("d-none");
  } else {
    sinProductos.classList.add("d-none");
    contenedor.innerHTML = filtrados.map(p => crearTarjetaProducto(p)).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const productos = obtenerProductosTienda();
  generarFiltros(productos);
  mostrarProductos();
});
