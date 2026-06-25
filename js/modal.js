let imagenBase64Temp = "";

function previsualizarImagen(event) {
  const archivo = event.target.files[0];
  const preview = document.getElementById("previewImagen");
  const previewContainer = document.getElementById("previewContainer");

  if (!archivo) {
    imagenBase64Temp = "";
    previewContainer.classList.add("d-none");
    return;
  }

  if (!archivo.type.startsWith("image/")) {
    mostrarToast("Por favor selecciona un archivo de imagen válido", "danger");
    event.target.value = "";
    return;
  }

  if (archivo.size > 2 * 1024 * 1024) {
    mostrarToast("La imagen no debe superar 2MB", "warning");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    imagenBase64Temp = e.target.result;
    preview.src = imagenBase64Temp;
    previewContainer.classList.remove("d-none");
  };
  reader.readAsDataURL(archivo);
}

function quitarImagen() {
  imagenBase64Temp = "";
  document.getElementById("inputImagen").value = "";
  document.getElementById("previewContainer").classList.add("d-none");
}
let productoEditandoId = null;

function abrirAgregar() {
  productoEditandoId = null;
  imagenBase64Temp = "";
  document.getElementById("modalTitulo").textContent = "Agregar Producto";
  document.getElementById("btnGuardar").innerHTML = '<i class="bi bi-plus-circle me-2"></i>Agregar';
  document.getElementById("formProducto").reset();
  document.getElementById("previewContainer").classList.add("d-none");
  const modal = new bootstrap.Modal(document.getElementById("modalProducto"));
  modal.show();
}

function abrirEditar(id) {
  const productos = obtenerProductos();
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  productoEditandoId = id;
  imagenBase64Temp = producto.imagen || "";
  document.getElementById("modalTitulo").textContent = "Editar Producto";
  document.getElementById("btnGuardar").innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Cambios';

  document.getElementById("inputNombre").value = producto.nombre;
  document.getElementById("inputDescripcion").value = producto.descripcion;
  document.getElementById("inputPrecio").value = producto.precio;
  document.getElementById("inputCategoria").value = producto.categoria;
  document.getElementById("inputStock").value = producto.stock;
  document.getElementById("inputImagen").value = "";

  const preview = document.getElementById("previewImagen");
  const previewContainer = document.getElementById("previewContainer");
  if (producto.imagen) {
    preview.src = producto.imagen;
    previewContainer.classList.remove("d-none");
  } else {
    previewContainer.classList.add("d-none");
  }

  const modal = new bootstrap.Modal(document.getElementById("modalProducto"));
  modal.show();
}

function guardarDesdeFormulario() {
  const form = document.getElementById("formProducto");

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const datos = {
    nombre: document.getElementById("inputNombre").value,
    descripcion: document.getElementById("inputDescripcion").value,
    precio: document.getElementById("inputPrecio").value,
    categoria: document.getElementById("inputCategoria").value,
    stock: document.getElementById("inputStock").value,
    imagen: imagenBase64Temp
  };

  if (productoEditandoId) {
    editarProducto(productoEditandoId, datos);
  } else {
    agregarProducto(datos);
  }

  const modal = bootstrap.Modal.getInstance(document.getElementById("modalProducto"));
  modal.hide();
  form.classList.remove("was-validated");
  imagenBase64Temp = "";
}
let idAEliminar = null;

function confirmarEliminar(id) {
  const productos = obtenerProductos();
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  idAEliminar = id;
  document.getElementById("nombreProductoEliminar").textContent = producto.nombre;
  const modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
  modal.show();
}

function ejecutarEliminar() {
  if (idAEliminar !== null) {
    eliminarProducto(idAEliminar);
    idAEliminar = null;
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEliminar"));
    modal.hide();
  }
}
function mostrarToast(mensaje, tipo = "success") {
  const contenedor = document.getElementById("toastContenedor");
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
          <i class="bi bi-${iconos[tipo] || 'info-circle'} me-2"></i>${mensaje}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;

  contenedor.insertAdjacentHTML("beforeend", toastHTML);
  const toastEl = contenedor.lastElementChild;
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}
