window.ADMIN_PRODUCTOS_CACHE = [];

function obtenerAuthHeader() {
  const usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
  if (!usuario || !usuario.token) return {};
  return { "Authorization": `Bearer ${usuario.token}` };
}

function mapearCategoriaAId(categoriaStr) {
  if (!categoriaStr) return 5;
  if (!isNaN(categoriaStr)) return Number(categoriaStr);
  const cat = String(categoriaStr).toLowerCase().trim();
  if (cat.includes("teclado")) return 1;
  if (cat.includes("mouse") || cat.includes("raton")) return 2;
  if (cat.includes("monitor") || cat.includes("pantalla")) return 3;
  if (cat.includes("audio") || cat.includes("audifono") || cat.includes("parlante")) return 4;
  return 5;
}

async function obtenerProductosAdmin() {
  try {
    const res = await fetch(`${CONFIG.API_URL}/productos`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      window.ADMIN_PRODUCTOS_CACHE = data.data.map(p => ({
        id: p.idProducto || p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        stock: p.stock,
        imagen: p.imagen,
        categoria: p.categoria ? (typeof p.categoria === "object" ? p.categoria.nombre : p.categoria) : "Accesorios",
        idCategoria: p.categoria && typeof p.categoria === "object" ? p.categoria.idCategorias : 5
      }));
      return window.ADMIN_PRODUCTOS_CACHE;
    }
  } catch (e) {}
  window.ADMIN_PRODUCTOS_CACHE = [];
  return [];
}


function actualizarEstadisticas(todos) {
  const el = (id) => document.getElementById(id);
  if (el("contadorProductos")) el("contadorProductos").textContent = todos.length;
  if (el("contadorCategorias")) el("contadorCategorias").textContent = [...new Set(todos.map(p => p.categoria))].length;
  if (el("contadorStock")) el("contadorStock").textContent = todos.reduce((s, p) => s + p.stock, 0);
  if (el("contadorStockBajo")) el("contadorStockBajo").textContent = todos.filter(p => p.stock <= 10).length;
}

async function listarProductos(filtro = "") {
  let productos = await obtenerProductosAdmin();
  actualizarEstadisticas(productos);

  if (filtro.trim() !== "") {
    const texto = filtro.toLowerCase();
    productos = productos.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto) ||
      p.descripcion.toLowerCase().includes(texto)
    );
  }

  const tbody = document.getElementById("tablaProductos");
  if (!tbody) return;

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

  const fallbackImg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
  tbody.innerHTML = productos.map(p => `
    <tr>
      <td>
        ${p.imagen
          ? `<img src="${p.imagen}" alt="${p.nombre}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.onerror=null; this.src='${fallbackImg}';">`
          : `<div class="rounded d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background: #2d2d2d;">
               <i class="bi bi-image text-secondary"></i>
             </div>`
        }
      </td>
      <td>
        <div class="fw-semibold text-color-principal">${p.nombre}</div>
        <small class="text-color-alternativo">${p.descripcion && p.descripcion.length > 60 ? p.descripcion.substring(0, 60) + "..." : (p.descripcion || "")}</small>
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

async function agregarProducto(datos) {
  const payload = {
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    imagen: datos.imagen || "",
    idCategoria: mapearCategoriaAId(datos.categoria)
  };

  try {
    const res = await fetch(`${CONFIG.API_URL}/productos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...obtenerAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      await listarProductos();
      mostrarToast("Producto agregado exitosamente", "success");
      return data.data;
    } else {
      mostrarToast(data.message || "Error al agregar el producto", "danger");
    }
  } catch (e) {
    mostrarToast("Error de conexión al agregar producto", "danger");
  }
  return null;
}

async function editarProducto(id, datos) {
  const payload = {
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    imagen: datos.imagen || "",
    idCategoria: mapearCategoriaAId(datos.categoria)
  };

  try {
    const res = await fetch(`${CONFIG.API_URL}/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...obtenerAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      await listarProductos();
      mostrarToast("Producto actualizado exitosamente", "info");
      return data.data;
    } else {
      mostrarToast(data.message || "Error al actualizar el producto", "danger");
    }
  } catch (e) {
    mostrarToast("Error de conexión al actualizar producto", "danger");
  }
  return null;
}

async function eliminarProducto(id) {
  try {
    const res = await fetch(`${CONFIG.API_URL}/productos/${id}`, {
      method: "DELETE",
      headers: {
        ...obtenerAuthHeader()
      }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      await listarProductos();
      mostrarToast("Producto eliminado correctamente", "warning");
      return true;
    } else {
      mostrarToast(data.message || "Error al eliminar el producto", "danger");
    }
  } catch (e) {
    mostrarToast("Error de conexión al eliminar producto", "danger");
  }
  return false;
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
