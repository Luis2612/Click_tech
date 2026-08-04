const API_BASE_URL = `${CONFIG.API_URL}/auth`;
// function validarRutasAutorizadas() {
//   let usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado")) || null;

//   if (usuario) {
//     let linkInicioSesion = document.getElementById("inicioSesion");
//     if (linkInicioSesion) {
//       let correoUsuario = document.getElementById("nombreUsuario");
//       if (correoUsuario) {
//         document.getElementById("nombreUsuario").innerHTML = usuario.email;
//       }
//       let enlacesRapidos = document.getElementById("enlacesRapidos");

//       if (usuario.tipo === "administrador" && enlacesRapidos) {
//         const linkAdministrador = document.createElement("a");
//         linkAdministrador.href = "../admin/index.html";
//         linkAdministrador.textContent = "Consola Administrativa";
//         linkAdministrador.classList.add(
//           "text-color-alternativo",
//           "text-decoration-none"
//         );
//         enlacesRapidos.appendChild(linkAdministrador);
//       }
//       linkInicioSesion.innerHTML = "Cerrar sesión";
//     }
//   }

//   if (window.location.href.includes("/login/index.html")) {
//     if (usuario != null) {
//       if (usuario.tipo === "administrador") {
//         window.location.href = "../admin/index.html";
//       } else {
//         window.location.href = "../home/index.html";
//       }
//     }
//   } else {
//     if (usuario == null) {
//       const sitiosPublicos = [
//         "/html/login/index.html",
//         // "/html/register/index.html",
//         "/html/catalogo/index.html",
//         "/html/catalogo/product.html",
//         "/html/home/index.html",
//         "/html/about/index.html",
//         "/html/contact/index.html"
//       ];

//       if (!(sitiosPublicos.includes(window.location.pathname))) {
//         window.location.href = "../login/index.html";
//       }
//     } else {
//       if (
//         window.location.href.includes("/admin/index.html") &&
//         usuario.tipo !== "administrador"
//       ) {
//         window.location.href = "../home/index.html";
//       }
//     }
//   }
// }

function cargarBotonInicioSesion() {
  let btnInicio = document.getElementById("inicioSesion");
  if (btnInicio) {
    btnInicio.addEventListener("click", function (event) {
      let usuario = sessionStorage.getItem("usuarioAutenticado");
      if (usuario) {
        event.preventDefault();
        sessionStorage.removeItem("usuarioAutenticado");
        window.location.href = "../login/index.html";
      }
    });
  }
}

function cargarRegisterForm() {
  let registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (this.checkValidity()) {
        await registrarUsuario();
      } else {
        event.stopPropagation();
        this.classList.add("was-validated");
      }
    });
  }
}

function cargarloginForm() {
  let loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (this.checkValidity()) {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let usuario = await autenticarse(email, password);
        if (usuario) {
          if (typeof crearToastContainer === "function") crearToastContainer();
          if (typeof mostrarToastCarrito === "function") {
            mostrarToastCarrito("Inicio sesión exitoso", "success");
          }
          setTimeout(() => {
            if (usuario.tipo === "administrador") {
              window.location.href = "../admin/index.html";
            } else {
              window.location.href = "../home/index.html";
            }
          }, 1500);
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
  if (contenedor) {
    contenedor.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
              ${mensaje}
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
              </div>`;
  }
}

async function autenticarse(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const usuarioAutenticado = {
        token: data.data.token,
        nombre: data.data.nombre,
        email: data.data.email,
        rol: data.data.rol,
        tipo: data.data.rol === 0 ? "administrador" : "usuario",
        idUsuario: data.data.idUsuario
      };
      sessionStorage.setItem("usuarioAutenticado", JSON.stringify(usuarioAutenticado));
      return usuarioAutenticado;
    } else {
      let mensajeError = data.message || "Credenciales inválidas.";
      if (data.data && typeof data.data === "object") {
        mensajeError = Object.values(data.data).join("<br>");
      }
      mostrarMensajeError(mensajeError);
      return null;
    }
  } catch (error) {
    mostrarMensajeError("No se pudo conectar con el servidor backend. Verifica que esté iniciado.");
    return null;
  }
}

async function registrarUsuario() {
  let nombre = document.getElementById("nombre").value;
  let email = document.getElementById("email").value;
  let telefono = document.getElementById("telefono").value;
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value : password;

  if (password !== confirmPassword) {
    mostrarMensajeError("Las contraseñas no coinciden.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, email, telefono, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      if (typeof crearToastContainer === "function") crearToastContainer();
      if (typeof mostrarToastCarrito === "function") {
        mostrarToastCarrito("Usuario registrado exitosamente", "success");
      }
      setTimeout(() => {
        window.location.href = "../login/index.html";
      }, 1500);
    } else {
      let mensajeError = data.message || "Error al registrar usuario.";
      if (data.data && typeof data.data === "object") {
        mensajeError = Object.values(data.data).join("<br>");
      }
      mostrarMensajeError(mensajeError);
    }
  } catch (error) {
    mostrarMensajeError("No se pudo conectar con el servidor backend. Verifica que esté iniciado.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
 // validarRutasAutorizadas();
  cargarBotonInicioSesion();
  cargarRegisterForm();
  cargarloginForm();
});
