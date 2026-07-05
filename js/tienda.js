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

  const stockBadge =
    producto.stock > 10
      ? `<span class="badge bg-success bg-opacity-25 text-success" id="stock-${producto.id}">En stock</span>`
      : producto.stock > 0
        ? `<span class="badge bg-warning bg-opacity-25 text-warning" id="stock-${producto.id}">Últimas ${producto.stock} uds</span>`
        : `<span class="badge bg-danger bg-opacity-25 text-danger" id="stock-${producto.id}">Agotado</span>`;

  return `
    <div class="col-sm-6 col-md-4 col-lg-3">
      <div class="card card-producto h-100 border-secondary rounded-3 overflow-hidden">
        ${imagenHTML}
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-primary bg-opacity-25 text-primary small">${producto.categoria}</span>
            ${stockBadge}
          </div>
          <h6 class="card-title fw-bold mb-1 text-color-principal">${producto.nombre}</h6>
          <p class="card-text text-color-alternativo small flex-grow-1">${producto.descripcion.length > 80 ? producto.descripcion.substring(0, 80) + "..." : producto.descripcion}</p>
          <div class="mt-auto d-flex align-items-center justify-content-between">
            <span class="fs-5 fw-bold text-color-resaltar">$${producto.precio.toLocaleString("es-CO")}</span>
            <button type="button" class="btn btn-outline-info" data-product-id=${producto.id}><i class="bi bi-cart3 fs-4"></i></button>
          </div>
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
  cargarCarrito();
  cargarEventosProducto();
});

//Asociar eventos a los iconos de carrito
function cargarEventosProducto() {
  let botones = document.querySelectorAll(".btn-outline-info");
  botones.forEach((elemento) => {
    elemento.addEventListener("click", function (e) {
      const productId = elemento.dataset.productId;
      agregarCarrito(parseInt(productId));
      cargarCarrito();
    });
  });
}

function agregarCarrito(productId) {
  let carrito = obtenerCarrito();
  let productoEncontrado = false;
  for (let item of carrito) {
    if (item.id === productId) {
      if (item.stock > 0) {
        item.cantidad++;
        productoEncontrado = true;
        item.stock--;
        validarSpanStock(item);
        editarProducto(productId, item);
      }
    }
  }
  if (!productoEncontrado) {
    let productos = obtenerProductosTienda();
    let filtrado = productos.filter((p) => p.id === productId);
    if (filtrado.length > 0) {
      filtrado = filtrado[0];
    }
    if (filtrado.stock > 0) {
      filtrado = { ...filtrado, cantidad: 1 };
      carrito.push(filtrado);
      filtrado.stock--;
      validarSpanStock(filtrado);
      editarProducto(productId, filtrado);
    }
  }
  guardarCarrito(carrito);
}

function cargarCarrito() {
  const items = obtenerCarrito();
  let carritoIcono = document.getElementById('carritoNumero');
  carritoIcono.innerHTML = items.length;
  const container = document.getElementById("mini-cart-items");
  if (items.length === 0) {
    container.innerHTML = '<p class="mini-cart__empty">Tu bolsa está vacía</p>';
    return;
  } else {
    let panel = "";
    for (let item of items) {
      panel += `<div style="border:1px solid #06B6D4">
      <div class="mini-cart__item">
        <div style="display:flex;gap:10px">
          <img src=${item.imagen}>
          <span>${item.nombre}</span>
          <span>${item.precio}</span>
          <span>${item.cantidad}</span>
          <span>
            <button type="button" class="btn bg-resaltar" style="padding: 0;" onclick="aumentarProductoDelCarrito(${item.id})"><i class="bi bi-plus-lg"></i></button>
            <button type="button" class="btn bg-resaltar" style="padding: 0;" onclick="disminuirProductoDelCarrito(${item.id})"><i class="bi bi-dash"></i></button>
          </span>
         </div>
        </div>
      </div>`;
    }
    container.innerHTML = panel;
  }
}

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carro_compra")) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem("carro_compra", JSON.stringify(carrito));
}

function editarProducto(id, datos) {
  const esBase = PRODUCTOS_INICIALES.some((p) => p.id === id);

  const productoActualizado = {
    id: id,
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    precio: parseInt(datos.precio),
    categoria: datos.categoria.trim(),
    stock: parseInt(datos.stock),
    imagen: datos.imagen,
  };

  if (esBase) {
    const editados = JSON.parse(
      localStorage.getItem("productos_editados") || "{}",
    );
    if (!datos.imagen) {
      const original = PRODUCTOS_INICIALES.find((p) => p.id === id);
      productoActualizado.imagen =
        editados[id]?.imagen || original.imagen || "";
    }
    editados[id] = productoActualizado;
    localStorage.setItem("productos_editados", JSON.stringify(editados));
  } else {
    const nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");
    const index = nuevos.findIndex((p) => p.id === id);
    if (index !== -1) {
      if (!datos.imagen) {
        productoActualizado.imagen = nuevos[index].imagen || "";
      }
      nuevos[index] = productoActualizado;
      localStorage.setItem("productos_nuevos", JSON.stringify(nuevos));
    }
  }
  return productoActualizado;
}

function validarSpanStock(producto) {
  let spanStockProducto = document.getElementById("stock-" + producto.id);
  if (producto.stock > 10) {
    spanStockProducto.classList.remove(
      "bg-warning",
      "text-warning",
      "bg-danger",
      "text-danger",
    );
    spanStockProducto.classList.add("bg-success", "text-success");
    spanStockProducto.innerHTML = `En stock`;
  } else if (producto.stock > 0 && producto.stock < 10) {
    spanStockProducto.classList.remove(
      "bg-success",
      "text-success",
      "bg-danger",
      "text-danger",
    );
    spanStockProducto.classList.add("bg-warning", "text-warning");
    spanStockProducto.innerHTML = `Últimas ${producto.stock} uds`;
  } else if (producto.stock == 0) {
    spanStockProducto.classList.remove(
      "bg-success",
      "text-success",
      "bg-warning",
      "text-warning",
    );
    spanStockProducto.classList.add("bg-danger", "text-danger");
    spanStockProducto.innerHTML = `Agotado`;
  }
}

function disminuirProductoDelCarrito(productId) {
  //obtengo el carrito
  let carrito = obtenerCarrito();
  let productoEncontrado = false;
  for (let item of carrito) {
    //obtengo el producto del carrito
    if (item.id === parseInt(productId)) {
      //valido el stock
      if (item.cantidad > 0) {
        //disminuyo la cantidad del producto en el carrito
        item.cantidad--;
        // aumento el stock
        item.stock++;
        validarSpanStock(item);
        editarProducto(productId, item);
      }
    }
  }
  guardarCarrito(carrito);
  cargarCarrito();
}

function aumentarProductoDelCarrito(productId) {
  //obtengo el carrito
  let carrito = obtenerCarrito();
  let productoEncontrado = false;
  for (let item of carrito) {
    //obtengo el producto del carrito
    if (item.id === parseInt(productId)) {
      //valido el stock
      if (item.stock > 0) {
        //disminuyo la cantidad del producto en el carrito
        item.cantidad++;
        // aumento el stock
        item.stock--;
        validarSpanStock(item);
        editarProducto(productId, item);
      }
    }
  }
  guardarCarrito(carrito);
  cargarCarrito();
}
