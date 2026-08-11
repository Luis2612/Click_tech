let imagenBase64Temp = "";
let productoEditandoId = null;
let idAEliminar = null;

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
  const productos = window.ADMIN_PRODUCTOS_CACHE || [];
  const producto = productos.find(p => Number(p.id) === Number(id));
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

async function guardarDesdeFormulario() {
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
    await editarProducto(productoEditandoId, datos);
  } else {
    await agregarProducto(datos);
  }

  const modal = bootstrap.Modal.getInstance(document.getElementById("modalProducto"));
  if (modal) modal.hide();
  form.classList.remove("was-validated");
  imagenBase64Temp = "";
}

function confirmarEliminar(id) {
  const productos = window.ADMIN_PRODUCTOS_CACHE || [];
  const producto = productos.find(p => Number(p.id) === Number(id));
  if (!producto) return;

  idAEliminar = id;
  document.getElementById("nombreProductoEliminar").textContent = producto.nombre;
  const modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
  modal.show();
}

async function ejecutarEliminar() {
  if (idAEliminar !== null) {
    await eliminarProducto(idAEliminar);
    idAEliminar = null;
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEliminar"));
    if (modal) modal.hide();
  }
}

function mostrarToast(mensaje, tipo = "success") {
  if (typeof mostrarToastCarrito === "function") {
    mostrarToastCarrito(mensaje, tipo);
    return;
  }
}
