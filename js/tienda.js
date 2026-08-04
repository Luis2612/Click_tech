let currentView = "grid";
let currentSort = "default";
let currentSearch = "";
let selectedCategories = [];
let globalPrecioMin = 0;
let globalPrecioMax = 2000000;
let filterPrecioMin = 0;
let filterPrecioMax = 2000000;

function obtenerProductosTienda() {
  const nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");
  const eliminados = JSON.parse(localStorage.getItem("productos_eliminados") || "[]");
  const editados = JSON.parse(localStorage.getItem("productos_editados") || "{}");
  const base = PRODUCTOS_INICIALES
    .filter(p => !eliminados.includes(p.id))
    .map(p => editados[p.id] ? editados[p.id] : p);
  return [...base, ...nuevos];
}

function initCatalogoFiltros(productos) {
  const container = document.getElementById("filterCategorias");
  if (!container) return;

  const categorias = [...new Set(productos.map(p => p.categoria))].sort();

  const allItem = document.createElement("label");
  allItem.className = "filter-check-item";
  allItem.innerHTML = `
    <input type="checkbox" id="catTodas" checked>
    <span class="filter-check-custom"></span>
    <span class="filter-check-label">Todas</span>
    <span class="filter-check-count">${productos.length}</span>
  `;
  container.appendChild(allItem);

  categorias.forEach(cat => {
    const count = productos.filter(p => p.categoria === cat).length;
    const item = document.createElement("label");
    item.className = "filter-check-item";
    item.innerHTML = `
      <input type="checkbox" data-cat="${cat}" checked>
      <span class="filter-check-custom"></span>
      <span class="filter-check-label">${cat}</span>
      <span class="filter-check-count">${count}</span>
    `;
    container.appendChild(item);
  });

  const catTodas = document.getElementById("catTodas");
  catTodas.addEventListener("change", () => {
    const checks = container.querySelectorAll("input[data-cat]");
    checks.forEach(c => { c.checked = catTodas.checked; });
    aplicarFiltros();
  });

  container.querySelectorAll("input[data-cat]").forEach(cb => {
    cb.addEventListener("change", () => {
      const allChecks = container.querySelectorAll("input[data-cat]");
      const allChecked = [...allChecks].every(c => c.checked);
      const noneChecked = [...allChecks].every(c => !c.checked);
      catTodas.checked = allChecked;
      catTodas.indeterminate = !allChecked && !noneChecked;
      aplicarFiltros();
    });
  });
}

function initPrecioSliders(productos) {
  const precios = productos.map(p => p.precio);
  globalPrecioMin = Math.min(...precios);
  globalPrecioMax = Math.max(...precios);

  const sliderMin = document.getElementById("precioMin");
  const sliderMax = document.getElementById("precioMax");
  if (!sliderMin || !sliderMax) return;

  sliderMin.min = globalPrecioMin;
  sliderMin.max = globalPrecioMax;
  sliderMin.value = globalPrecioMin;

  sliderMax.min = globalPrecioMin;
  sliderMax.max = globalPrecioMax;
  sliderMax.value = globalPrecioMax;

  filterPrecioMin = globalPrecioMin;
  filterPrecioMax = globalPrecioMax;

  actualizarPrecioLabels();

  sliderMin.addEventListener("input", () => {
    if (parseInt(sliderMin.value) > parseInt(sliderMax.value)) {
      sliderMin.value = sliderMax.value;
    }
    filterPrecioMin = parseInt(sliderMin.value);
    actualizarPrecioLabels();
    aplicarFiltros();
  });

  sliderMax.addEventListener("input", () => {
    if (parseInt(sliderMax.value) < parseInt(sliderMin.value)) {
      sliderMax.value = sliderMin.value;
    }
    filterPrecioMax = parseInt(sliderMax.value);
    actualizarPrecioLabels();
    aplicarFiltros();
  });
}

function actualizarPrecioLabels() {
  const minLabel = document.getElementById("precioMinLabel");
  const maxLabel = document.getElementById("precioMaxLabel");
  if (minLabel) minLabel.textContent = "$" + filterPrecioMin.toLocaleString("es-CO");
  if (maxLabel) maxLabel.textContent = "$" + filterPrecioMax.toLocaleString("es-CO");
}

function initBuscador() {
  const input = document.getElementById("buscadorProductos");
  const clearBtn = document.getElementById("searchClear");
  if (!input) return;

  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = input.value.trim().toLowerCase();
      clearBtn.classList.toggle("d-none", currentSearch === "");
      aplicarFiltros();
    }, 250);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      currentSearch = "";
      clearBtn.classList.add("d-none");
      aplicarFiltros();
    });
  }
}

function initSort() {
  const select = document.getElementById("sortSelect");
  if (!select) return;
  select.addEventListener("change", () => {
    currentSort = select.value;
    aplicarFiltros();
  });
}

function initViewToggle() {
  const gridBtn = document.getElementById("viewGrid");
  const listBtn = document.getElementById("viewList");
  if (!gridBtn || !listBtn) return;

  gridBtn.addEventListener("click", () => {
    currentView = "grid";
    gridBtn.classList.add("active");
    listBtn.classList.remove("active");
    aplicarFiltros();
  });

  listBtn.addEventListener("click", () => {
    currentView = "list";
    listBtn.classList.add("active");
    gridBtn.classList.remove("active");
    aplicarFiltros();
  });
}

function initSidebarToggle() {
  const toggle = document.getElementById("filterToggle");
  const sidebar = document.getElementById("catalogoSidebar");
  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    toggle.classList.toggle("active");
  });
}

function initClearFilters() {
  const clearBtn = document.getElementById("clearFilters");
  const resetBtn = document.getElementById("resetFromEmpty");

  const reset = () => {
    const input = document.getElementById("buscadorProductos");
    const clearSearch = document.getElementById("searchClear");
    if (input) input.value = "";
    if (clearSearch) clearSearch.classList.add("d-none");
    currentSearch = "";

    document.querySelectorAll("#filterCategorias input").forEach(c => { c.checked = true; c.indeterminate = false; });

    const sliderMin = document.getElementById("precioMin");
    const sliderMax = document.getElementById("precioMax");
    if (sliderMin) { sliderMin.value = globalPrecioMin; filterPrecioMin = globalPrecioMin; }
    if (sliderMax) { sliderMax.value = globalPrecioMax; filterPrecioMax = globalPrecioMax; }
    actualizarPrecioLabels();

    document.getElementById("filterEnStock").checked = true;
    document.getElementById("filterPocoStock").checked = true;
    document.getElementById("filterAgotado").checked = false;

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) { sortSelect.value = "default"; currentSort = "default"; }

    aplicarFiltros();
  };

  if (clearBtn) clearBtn.addEventListener("click", reset);
  if (resetBtn) resetBtn.addEventListener("click", reset);
}

function initDisponibilidad() {
  ["filterEnStock", "filterPocoStock", "filterAgotado"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", aplicarFiltros);
  });
}

function getSelectedCategories() {
  const checks = document.querySelectorAll("#filterCategorias input[data-cat]:checked");
  return [...checks].map(c => c.getAttribute("data-cat"));
}

function getStockFilter() {
  return {
    enStock: document.getElementById("filterEnStock")?.checked ?? true,
    pocoStock: document.getElementById("filterPocoStock")?.checked ?? true,
    agotado: document.getElementById("filterAgotado")?.checked ?? false
  };
}

function aplicarFiltros() {
  let productos = obtenerProductosTienda();
  const cats = getSelectedCategories();
  const stock = getStockFilter();

  if (currentSearch) {
    productos = productos.filter(p =>
      p.nombre.toLowerCase().includes(currentSearch) ||
      p.descripcion.toLowerCase().includes(currentSearch) ||
      p.categoria.toLowerCase().includes(currentSearch)
    );
  }

  if (cats.length > 0) {
    productos = productos.filter(p => cats.includes(p.categoria));
  }

  productos = productos.filter(p => p.precio >= filterPrecioMin && p.precio <= filterPrecioMax);

  productos = productos.filter(p => {
    if (p.stock > 10 && stock.enStock) return true;
    if (p.stock > 0 && p.stock <= 10 && stock.pocoStock) return true;
    if (p.stock === 0 && stock.agotado) return true;
    return false;
  });

  switch (currentSort) {
    case "price-asc": productos.sort((a, b) => a.precio - b.precio); break;
    case "price-desc": productos.sort((a, b) => b.precio - a.precio); break;
    case "name-asc": productos.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
    case "name-desc": productos.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
    case "stock-desc": productos.sort((a, b) => b.stock - a.stock); break;
  }

  renderProductos(productos);
  renderActiveFilters(cats);
  updateResultsCount(productos.length);
}

function updateResultsCount(count) {
  const el = document.getElementById("resultsCount");
  if (el) el.textContent = `${count} producto${count !== 1 ? "s" : ""}`;
}

function renderActiveFilters(cats) {
  const container = document.getElementById("activeFilters");
  if (!container) return;

  let tags = [];

  if (currentSearch) {
    tags.push(`<span class="active-filter-tag"><i class="bi bi-search me-1"></i>"${currentSearch}" <button onclick="clearSearchFilter()"><i class="bi bi-x"></i></button></span>`);
  }

  const allCats = document.querySelectorAll("#filterCategorias input[data-cat]");
  if (cats.length > 0 && cats.length < allCats.length) {
    cats.forEach(cat => {
      tags.push(`<span class="active-filter-tag"><i class="bi bi-tag me-1"></i>${cat} <button onclick="removeCatFilter('${cat}')"><i class="bi bi-x"></i></button></span>`);
    });
  }

  if (filterPrecioMin > globalPrecioMin || filterPrecioMax < globalPrecioMax) {
    tags.push(`<span class="active-filter-tag"><i class="bi bi-cash-stack me-1"></i>$${filterPrecioMin.toLocaleString("es-CO")} - $${filterPrecioMax.toLocaleString("es-CO")} <button onclick="clearPriceFilter()"><i class="bi bi-x"></i></button></span>`);
  }

  container.innerHTML = tags.join("");
}

function clearSearchFilter() {
  const input = document.getElementById("buscadorProductos");
  const clearBtn = document.getElementById("searchClear");
  if (input) input.value = "";
  if (clearBtn) clearBtn.classList.add("d-none");
  currentSearch = "";
  aplicarFiltros();
}

function removeCatFilter(cat) {
  const cb = document.querySelector(`#filterCategorias input[data-cat="${cat}"]`);
  if (cb) cb.checked = false;
  const allChecks = document.querySelectorAll("#filterCategorias input[data-cat]");
  const catTodas = document.getElementById("catTodas");
  if (catTodas) {
    const allChecked = [...allChecks].every(c => c.checked);
    const noneChecked = [...allChecks].every(c => !c.checked);
    catTodas.checked = allChecked;
    catTodas.indeterminate = !allChecked && !noneChecked;
  }
  aplicarFiltros();
}

function clearPriceFilter() {
  const sliderMin = document.getElementById("precioMin");
  const sliderMax = document.getElementById("precioMax");
  if (sliderMin) { sliderMin.value = globalPrecioMin; filterPrecioMin = globalPrecioMin; }
  if (sliderMax) { sliderMax.value = globalPrecioMax; filterPrecioMax = globalPrecioMax; }
  actualizarPrecioLabels();
  aplicarFiltros();
}

function renderProductos(productos) {
  const contenedor = document.getElementById("contenedorProductos");
  const sinProductos = document.getElementById("sinProductos");
  if (!contenedor) return;

  if (productos.length === 0) {
    contenedor.innerHTML = "";
    sinProductos.classList.remove("d-none");
    return;
  }

  sinProductos.classList.add("d-none");

  if (currentView === "grid") {
    contenedor.className = "row g-4";
    contenedor.innerHTML = productos.map(p => crearTarjetaGrid(p)).join("");
  } else {
    contenedor.className = "catalogo-list-view";
    contenedor.innerHTML = productos.map(p => crearTarjetaList(p)).join("");
  }
}

function crearTarjetaGrid(producto) {
  const fallbackImg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
  const imagenHTML = producto.imagen
    ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="cat-card-img" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">`
    : `<div class="cat-card-img-placeholder"><i class="bi bi-image"></i></div>`;

  const stockBadge = producto.stock > 10
    ? `<span class="cat-stock-badge stock-ok">En stock</span>`
    : producto.stock > 0
      ? `<span class="cat-stock-badge stock-low">Últimas ${producto.stock} uds</span>`
      : `<span class="cat-stock-badge stock-out">Agotado</span>`;

  return `
    <div class="col-sm-6 col-lg-4 col-xl-3">
      <div class="cat-product-card">
        <a href="product.html?id=${producto.id}" class="cat-card-link">
          <div class="cat-card-img-wrap">
            ${imagenHTML}
            ${stockBadge}
          </div>
          <div class="cat-card-body">
            <span class="cat-card-category">${producto.categoria}</span>
            <h5 class="cat-card-name">${producto.nombre}</h5>
            <p class="cat-card-desc">${producto.descripcion.length > 70 ? producto.descripcion.substring(0, 70) + "..." : producto.descripcion}</p>
          </div>
        </a>
        <div class="cat-card-footer">
          <span class="cat-card-price">$${producto.precio.toLocaleString("es-CO")}</span>
          <button class="cat-card-cart-btn" onclick="agregarAlCarrito(${producto.id})" ${producto.stock === 0 ? "disabled" : ""}>
            <i class="bi bi-cart-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function crearTarjetaList(producto) {
  const fallbackImg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
  const imagenHTML = producto.imagen
    ? `<img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">`
    : `<div class="cat-list-img-placeholder"><i class="bi bi-image"></i></div>`;

  const stockBadge = producto.stock > 10
    ? `<span class="cat-stock-badge stock-ok">En stock</span>`
    : producto.stock > 0
      ? `<span class="cat-stock-badge stock-low">Últimas ${producto.stock} uds</span>`
      : `<span class="cat-stock-badge stock-out">Agotado</span>`;

  return `
    <div class="cat-list-card">
      <a href="product.html?id=${producto.id}" class="cat-list-img-wrap">
        ${imagenHTML}
      </a>
      <div class="cat-list-body">
        <div class="cat-list-meta">
          <span class="cat-card-category">${producto.categoria}</span>
          ${stockBadge}
        </div>
        <a href="product.html?id=${producto.id}" class="cat-list-name">${producto.nombre}</a>
        <p class="cat-list-desc">${producto.descripcion}</p>
        <div class="cat-list-footer">
          <span class="cat-card-price">$${producto.precio.toLocaleString("es-CO")}</span>
          <button class="cat-card-cart-btn" onclick="agregarAlCarrito(${producto.id})" ${producto.stock === 0 ? "disabled" : ""}>
            <i class="bi bi-cart-plus me-1"></i> Agregar
          </button>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const productos = obtenerProductosTienda();
  initCatalogoFiltros(productos);
  initPrecioSliders(productos);
  initBuscador();
  initSort();
  initViewToggle();
  initSidebarToggle();
  initClearFilters();
  initDisponibilidad();
  aplicarFiltros();
});
