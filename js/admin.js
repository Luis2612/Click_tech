function obtenerProductos() {
  const nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");
  const eliminados = JSON.parse(localStorage.getItem("productos_eliminados") || "[]");
  const editados = JSON.parse(localStorage.getItem("productos_editados") || "{}");

  const base = PRODUCTOS_INICIALES
    .filter(p => !eliminados.includes(p.id))
    .map(p => editados[p.id] ? editados[p.id] : p);

  return [...base, ...nuevos];
}

function generarId() {
  const todos = obtenerProductos();
  if (todos.length === 0) return 100;
  return Math.max(...todos.map(p => p.id)) + 1;
}

function actualizarEstadisticas() {
  const todos = obtenerProductos();
  const el = (id) => document.getElementById(id);
  if (el("contadorProductos")) el("contadorProductos").textContent = todos.length;
  if (el("contadorCategorias")) el("contadorCategorias").textContent = [...new Set(todos.map(p => p.categoria))].length;
  if (el("contadorStock")) el("contadorStock").textContent = todos.reduce((s, p) => s + p.stock, 0);
  if (el("contadorStockBajo")) el("contadorStockBajo").textContent = todos.filter(p => p.stock <= 10).length;
}

function listarProductos(filtro = "") {
  let productos = obtenerProductos();
  actualizarEstadisticas();

  if (filtro.trim() !== "") {
    const texto = filtro.toLowerCase();
    productos = productos.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto) ||
      p.descripcion.toLowerCase().includes(texto)
    );
  }

  const tbody = document.getElementById("tablaProductos");

  if (productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-secondary py-5">
          <i class="bi bi-inbox display-4 d-block mb-3"></i>
          ${filtro ? "No se encontraron productos con ese filtro." : "No hay productos registrados. ¡Agrega el primero!"}
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr>
      <td>
        ${p.imagen
          ? `<img src="${p.imagen}" alt="${p.nombre}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;">`
          : `<div class="rounded d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background: #2d2d2d;">
               <i class="bi bi-image text-secondary"></i>
             </div>`
        }
      </td>
      <td>
        <div class="fw-semibold text-color-principal">${p.nombre}</div>
        <small class="text-color-alternativo">${p.descripcion.length > 60 ? p.descripcion.substring(0, 60) + "..." : p.descripcion}</small>
      </td>
      <td><span class="badge bg-primary bg-opacity-25 text-primary">${p.categoria}</span></td>
      <td class="fw-semibold text-color-principal">$${p.precio.toLocaleString("es-CO")}</td>
      <td>
        <span class="badge ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'} bg-opacity-25 
        ${p.stock > 10 ? 'text-success' : p.stock > 0 ? 'text-warning' : 'text-danger'}">
          ${p.stock} uds
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-info me-1" onclick="abrirEditar(${p.id})" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmarEliminar(${p.id})" title="Eliminar">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    </tr>
  `).join("");
}
function agregarProducto(datos) {
  const nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");

  const nuevoProducto = {
    id: generarId(),
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    precio: parseInt(datos.precio),
    categoria: datos.categoria.trim(),
    stock: parseInt(datos.stock),
    imagen: datos.imagen || ""
  };

  nuevos.push(nuevoProducto);
  localStorage.setItem("productos_nuevos", JSON.stringify(nuevos));
  listarProductos();
  mostrarToast("Producto agregado exitosamente", "success");
  return nuevoProducto;
}
function editarProducto(id, datos) {
  const esBase = PRODUCTOS_INICIALES.some(p => p.id === id);

  const productoActualizado = {
    id: id,
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    precio: parseInt(datos.precio),
    categoria: datos.categoria.trim(),
    stock: parseInt(datos.stock),
    imagen: datos.imagen
  };

  if (esBase) {
    const editados = JSON.parse(localStorage.getItem("productos_editados") || "{}");
    if (!datos.imagen) {
      const original = PRODUCTOS_INICIALES.find(p => p.id === id);
      productoActualizado.imagen = editados[id]?.imagen || original.imagen || "";
    }
    editados[id] = productoActualizado;
    localStorage.setItem("productos_editados", JSON.stringify(editados));
  } else {
    const nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");
    const index = nuevos.findIndex(p => p.id === id);
    if (index !== -1) {
      if (!datos.imagen) {
        productoActualizado.imagen = nuevos[index].imagen || "";
      }
      nuevos[index] = productoActualizado;
      localStorage.setItem("productos_nuevos", JSON.stringify(nuevos));
    }
  }

  listarProductos();
  mostrarToast("Producto actualizado exitosamente", "info");
  return productoActualizado;
}
function eliminarProducto(id) {
  const productos = obtenerProductos();
  const producto = productos.find(p => p.id === id);
  if (!producto) {
    mostrarToast("Producto no encontrado", "danger");
    return false;
  }

  const esBase = PRODUCTOS_INICIALES.some(p => p.id === id);

  if (esBase) {
    const eliminados = JSON.parse(localStorage.getItem("productos_eliminados") || "[]");
    eliminados.push(id);
    localStorage.setItem("productos_eliminados", JSON.stringify(eliminados));

    const editados = JSON.parse(localStorage.getItem("productos_editados") || "{}");
    delete editados[id];
    localStorage.setItem("productos_editados", JSON.stringify(editados));
  } else {
    let nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");
    nuevos = nuevos.filter(p => p.id !== id);
    localStorage.setItem("productos_nuevos", JSON.stringify(nuevos));
  }

  listarProductos();
  mostrarToast(`"${producto.nombre}" eliminado correctamente`, "warning");
  return true;
}
document.addEventListener("DOMContentLoaded", () => {
  listarProductos();

  const inputBuscar = document.getElementById("inputBuscar");
  if (inputBuscar) {
    inputBuscar.addEventListener("input", (e) => {
      listarProductos(e.target.value);
    });
  }
});
