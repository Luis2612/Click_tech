function validarRutasAutorizadas() {
  let usuario =
    JSON.parse(sessionStorage.getItem("usuarioAutenticado")) || null;

  if (usuario) {
    let correoUsuario = document.getElementById("nombreUsuario");
    if (correoUsuario) {
      correoUsuario.innerHTML = "";
      correoUsuario.style.display = "none";
    }

    let linkInicioSesion = document.getElementById("inicioSesion");
    if (linkInicioSesion) {
      let parent = linkInicioSesion.closest(".d-flex.ms-lg-3") || linkInicioSesion.parentElement;
      let userBox = linkInicioSesion.parentElement;
      const nombreMostrar = usuario.nombre || usuario.email.split("@")[0];

      if (userBox) {
        userBox.innerHTML = `
          <div class="d-flex align-items-center gap-2 me-3">
            <button type="button" class="btn btn-outline-info rounded-pill px-3 py-1 text-white fw-bold d-inline-flex align-items-center gap-2 shadow-sm" onclick="abrirPerfilUsuario()">
              <i class="bi bi-person-circle text-color-resaltar fs-5"></i>
              <span class="small">${nombreMostrar}</span>
            </button>
            <button type="button" class="btn btn-outline-danger rounded-pill px-3 py-1 fw-bold small shadow-sm" onclick="cerrarSesionUsuario()" title="Cerrar Sesión">
              <i class="bi bi-box-arrow-right"></i> <span class="d-none d-md-inline">Salir</span>
            </button>
          </div>
        `;
      }
    }

    let enlacesRapidos = document.getElementById("enlacesRapidos");
    if (usuario.tipo == "administrador" && enlacesRapidos && !document.getElementById("linkAdminFooter")) {
      const linkAdministrador = document.createElement("li");
      linkAdministrador.id = "linkAdminFooter";
      linkAdministrador.innerHTML = `<a href="../admin/index.html" class="text-color-alternativo text-decoration-none">Consola Administrativa</a>`;
      enlacesRapidos.appendChild(linkAdministrador);
    }

    const navbarNav = document.querySelector(".navbar-nav");
    if (navbarNav && !document.getElementById("navPedidos")) {
      const li = document.createElement("li");
      li.className = "nav-item";
      const activeClass = window.location.pathname.includes("/pedidos/") ? " active" : "";
      li.innerHTML = `<a class="nav-link fw-bold${activeClass}" id="navPedidos" href="../pedidos/index.html"><i class="bi bi-box-seam me-1"></i>Mis Pedidos</a>`;
      navbarNav.appendChild(li);
    }
  }

  if (window.location.href.includes("/login/index.html")) {
    if (usuario != null) {
      if (usuario.tipo == "administrador") {
        window.location.href = "../admin/index.html";
      } else {
        window.location.href = "../home/index.html";
      }
    }
  } else {
    if (usuario == null) {
      const sitiosPublicos = [
        "/html/login/index.html",
        "/html/register/index.html",
        "/html/catalogo/index.html",
        "/html/catalogo/product.html",
        "/html/home/index.html",
        "/html/about/index.html",
        "/html/contact/index.html",
        "/html/carrito/index.html",
      ];

      if (!(sitiosPublicos.includes(window.location.pathname))){
        window.location.href = "../login/index.html";
      }
    } else {
      if (
        window.location.href.includes("/admin/index.html") &&
        usuario.tipo !== "administrador"
      ) {
        window.location.href = "../home/index.html";
      }
    }
  }
}
function cargarBotonInicioSesion() {
  if (document.getElementById("inicioSesion") != undefined) {
    document
      .getElementById("inicioSesion")
      .addEventListener("click", function (event) {
        event.preventDefault();
        sessionStorage.removeItem("usuarioAutenticado");
        window.location.href = "../login/index.html";
      });
  }
}
function cargarRegisterForm() {
  if (document.getElementById("registerForm") != undefined) {
    document
      .getElementById("registerForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        if (this.checkValidity()) {
          registrarUsuario();
        } else {
          event.stopPropagation();
          this.classList.add("was-validated");
        }
      });
  }
}

function cargarloginForm() {
  if (document.getElementById("loginForm") != undefined) {
    document
      .getElementById("loginForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        if (this.checkValidity()) {
          let email = document.getElementById("email").value;
          let password = document.getElementById("password").value;
          let usuario = autenticarse(email, password);
          if (usuario) {
            if (usuario.tipo == "administrador") {
              crearToastContainer();
              mostrarToastCarrito("Inicio sesión exitoso", "success");
              setTimeout(() => {
                window.location.href = "../admin/index.html";
              }, 2000);
            } else {
              crearToastContainer();
              mostrarToastCarrito("Inicio sesión exitoso", "success");
              setTimeout(() => {
                window.location.href = "../home/index.html";
              }, 2000);
            }
          } else {
            mostrarMensajeError("¡Error! usuario y contraseña invalido.");
          }
        } else {
          event.stopPropagation();
          this.classList.add("was-validated");
        }
      });
  }
}
function mostrarMensajeError(mensaje) {
  var contenedor = document.getElementById("contenedorErrores");
  contenedor.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            `;
}

function autenticarse(email, password) {
  let usuario = null;
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  if (usuarios.length > 0) {
    usuario = usuarios.find(
      (user) => user.email === email && user.password === password,
    );

    if (usuario) {
      sessionStorage.setItem("usuarioAutenticado", JSON.stringify(usuario));
    }
  }
  return usuario;
}

function registrarUsuario() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  let nombre = document.getElementById("nombre").value;
  let correo = document.getElementById("email").value;
  let telefono = document.getElementById("telefono").value;
  let password = document.getElementById("password").value;

  let usuario = usuarios.find((user) => user.email === correo);

  if (usuario) {
    mostrarMensajeError("¡Error! El correo ya existe en el sistema.");
  } else {
    let tipo = "usuario";
    if (correo.includes("clicktech.com")) {
      tipo = "administrador";
    }
    let usuario = {
      nombre: nombre,
      email: correo,
      telefono: telefono,
      password: password,
      tipo: tipo,
    };

    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    crearToastContainer();
    mostrarToastCarrito("Usuario registrado exitosamente", "success");
    setTimeout(() => {
                    window.location.href = "../login/index.html";
              }, 2000);
  }
}

function cerrarSesionUsuario() {
  sessionStorage.removeItem("usuarioAutenticado");
  window.location.href = "../login/index.html";
}

function crearModalPerfilUsuario() {
  if (document.getElementById("modalPerfilUsuario")) return;

  const modalHTML = `
    <div class="modal fade" id="modalPerfilUsuario" tabindex="-1" aria-labelledby="modalPerfilLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-secundario-suave border border-secondary text-color-principal rounded-4 shadow-lg">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold" id="modalPerfilLabel">
              <i class="bi bi-person-badge-fill me-2 text-color-resaltar"></i>Perfil de Usuario
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body p-4">
            <div class="text-center mb-4">
              <div class="d-inline-flex align-items-center justify-content-center bg-resaltar text-color-secundario rounded-circle mb-3 shadow" style="width: 80px; height: 80px; font-size: 2.5rem; font-weight: 800;" id="perfilAvatarIniciales">
                U
              </div>
              <h5 class="fw-bold mb-1" id="perfilNombreHeader">Usuario</h5>
              <span class="badge bg-info bg-opacity-25 text-info text-uppercase px-3 py-1" id="perfilTipoBadge">Cliente</span>
            </div>

            <form id="formPerfilUsuario" onsubmit="guardarPerfilUsuario(event)">
              <div class="mb-3">
                <label for="perfilNombreInput" class="form-label text-color-alternativo small fw-bold">Nombre Completo</label>
                <input type="text" class="form-control bg-secundario text-color-principal border-secondary" id="perfilNombreInput" required>
              </div>

              <div class="mb-3">
                <label for="perfilEmailInput" class="form-label text-color-alternativo small fw-bold">Correo Electrónico</label>
                <input type="email" class="form-control bg-secundario text-color-principal border-secondary" id="perfilEmailInput" readonly disabled>
                <div class="form-text text-secondary small">El correo electrónico no puede ser modificado.</div>
              </div>

              <div class="mb-3">
                <label for="perfilTelefonoInput" class="form-label text-color-alternativo small fw-bold">Teléfono de Contacto</label>
                <input type="tel" class="form-control bg-secundario text-color-principal border-secondary" id="perfilTelefonoInput" placeholder="Ej: 300 123 4567">
              </div>

              <div class="d-grid gap-2 mt-4">
                <button type="submit" class="btn bg-resaltar text-color-secundario fw-bold rounded-pill">
                  <i class="bi bi-check-circle me-2"></i>Guardar Cambios
                </button>
                <button type="button" class="btn btn-outline-info rounded-pill fw-bold" onclick="window.location.href='../pedidos/index.html'">
                  <i class="bi bi-box-seam me-2"></i>Ir a Mis Pedidos
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function abrirPerfilUsuario() {
  const usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
  if (!usuario) return;

  crearModalPerfilUsuario();

  const nombre = usuario.nombre || usuario.email.split("@")[0];
  const inicial = nombre.charAt(0).toUpperCase();

  document.getElementById("perfilAvatarIniciales").textContent = inicial;
  document.getElementById("perfilNombreHeader").textContent = nombre;
  document.getElementById("perfilTipoBadge").textContent = usuario.tipo === "administrador" ? "Administrador" : "Cliente VIP";
  document.getElementById("perfilNombreInput").value = usuario.nombre || "";
  document.getElementById("perfilEmailInput").value = usuario.email || "";
  document.getElementById("perfilTelefonoInput").value = usuario.telefono || "";

  const modalEl = document.getElementById("modalPerfilUsuario");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function guardarPerfilUsuario(event) {
  event.preventDefault();
  const usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");
  if (!usuario) return;

  const nuevoNombre = document.getElementById("perfilNombreInput").value.trim();
  const nuevoTelefono = document.getElementById("perfilTelefonoInput").value.trim();

  usuario.nombre = nuevoNombre;
  usuario.telefono = nuevoTelefono;

  sessionStorage.setItem("usuarioAutenticado", JSON.stringify(usuario));

  let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const index = usuarios.findIndex(u => u.email === usuario.email);
  if (index !== -1) {
    usuarios[index].nombre = nuevoNombre;
    usuarios[index].telefono = nuevoTelefono;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  const modalEl = document.getElementById("modalPerfilUsuario");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  if (typeof crearToastContainer === "function") crearToastContainer();
  if (typeof mostrarToastCarrito === "function") {
    mostrarToastCarrito("Perfil actualizado con éxito", "success");
  }

  validarRutasAutorizadas();
}

document.addEventListener("DOMContentLoaded", () => {
  validarRutasAutorizadas();
  cargarBotonInicioSesion();
  cargarRegisterForm();
  cargarloginForm();
});
