function validarRutasAutorizadas() {
  let usuario =
    JSON.parse(sessionStorage.getItem("usuarioAutenticado")) || null;

  if (usuario) {
    let linkInicioSesion = document.getElementById("inicioSesion");
    if (linkInicioSesion) {
      let correoUsuario = document.getElementById("nombreUsuario");
      if (correoUsuario) {
        document.getElementById("nombreUsuario").innerHTML = usuario.email;
      }
      let enlacesRapidos = document.getElementById("enlacesRapidos");

      if (usuario.tipo == "administrador" && enlacesRapidos) {
        const linkAdministrador = document.createElement("a");
        linkAdministrador.href = "../admin/index.html";
        linkAdministrador.textContent = "Consola Administrativa";
        linkAdministrador.classList.add(
          "text-color-alternativo",
          "text-decoration-none",
        );
        enlacesRapidos.appendChild(linkAdministrador);
      }
      linkInicioSesion.innerHTML = "Cerrar sesión";
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
        "/html/contact/index.html"
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

document.addEventListener("DOMContentLoaded", () => {
  validarRutasAutorizadas();
  cargarBotonInicioSesion();
  cargarRegisterForm();
  cargarloginForm();
});
