document.addEventListener("DOMContentLoaded", () => {
  console.log("%c⚡ Click Techs System: ONLINE ⚡", "color: #00f2fe; font-size: 16px; font-weight: bold;");
  const textElements = document.querySelectorAll(
    "main h1, main p, section h1, section h2, section h3, section h4, section p, footer h5, footer p",
  );

  const typeWriterEffect = (element) => {
    const text = element.getAttribute("data-text");
    if (!text || element.classList.contains("typed-done")) return;

    element.classList.add("typed-done");
    element.textContent = "";

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < text.length) {
        element.textContent += text.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  };
  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeWriterEffect(entry.target);
          observer.unobserve(entry.target);
        }
      });
  }, { threshold: 0.1 });
  textElements.forEach((el) => {
    // Evitar efecto de máquina de escribir en elementos que contienen enlaces u otros tags HTML
    if (el.children.length > 0) return;

    const originalText = el.textContent.trim().replace(/\s+/g, ' ');
    if (originalText.length > 0) {
      el.setAttribute("data-text", originalText);
      const rect = el.getBoundingClientRect();
      const isVisibleOnLoad = (rect.top >= 0 && rect.bottom <= window.innerHeight);

      if (!isVisibleOnLoad) {
        el.textContent = "";
      }

      observer.observe(el);
    }
  });
  validarRutasAutorizadas();
});

if (document.getElementById("contactForm") != undefined) {
  document
    .getElementById("contactForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      if (this.checkValidity()) {
        document.getElementById("formStatus").classList.remove("d-none");
        this.classList.remove("was-validated");
        let nombre = document.getElementById("nombre").value;
        console.log(nombre);
        /*document.getElementById('contactForm').submit();
        setTimeout(() => {
          document.getElementById('formStatus').classList.add('d-none');
        }, 5000);*/
      } else {
        event.stopPropagation();
        this.classList.add("was-validated");
      }
    });
}

if (document.getElementById("inicioSesion") != undefined) {
  document
    .getElementById("inicioSesion")
    .addEventListener("click", function (event) {
      event.preventDefault();
      sessionStorage.removeItem("usuarioAutenticado");
      window.location.href = "../login/index.html";
    });
}

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

if (document.getElementById("loginForm") != undefined) {
  document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      console.log("uno");
      if (this.checkValidity()) {
        console.log("dos");
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        if (autenticarse(email, password)) {
          window.location.href = "../contact/index.html";
        } else {
          mostrarMensajeError("¡Error! usuario y contraseña invalido.");
        }
      } else {
        event.stopPropagation();
        this.classList.add("was-validated");
      }
    });
}

function mostrarMensajeError(mensaje) {
  var contenedor = document.getElementById("contenedorErrores");
  // Inserta HTML de alerta
  contenedor.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            `;
}

function autenticarse(email, password) {
  let autenticado = false;
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  if (usuarios.length > 0) {
    let usuario = usuarios.find(
      (user) => user.email === email && user.password === password,
    );

    if (usuario) {
      sessionStorage.setItem("usuarioAutenticado", JSON.stringify(usuario));
      autenticado = true;
    }
  }
  return autenticado;
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
    let usuario = {
      nombre: nombre,
      email: correo,
      telefono: telefono,
      password: password,
    };

    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    window.location.href = "../login/index.html";
  }
}

function validarRutasAutorizadas(){
    let usuario =
    JSON.parse(sessionStorage.getItem("usuarioAutenticado")) || null;

  if (usuario) {
    let linkInicioSesion = document.getElementById("inicioSesion");
    console.log(linkInicioSesion);
    if (linkInicioSesion) {
      linkInicioSesion.innerHTML = "Cerrar sesión";
    }
  }

  if (window.location.href.includes("/login/index.html")) {
    if (usuario != null) {
      window.location.href = "../home/index.html";
    }
  } else {
    if (usuario == null) {
      if (
        !window.location.href.includes("/login/index.html") &&
        !window.location.href.includes("/register/index.html") &&
        !window.location.href.includes("/catalogo/index.html") &&
        !window.location.href.includes("/catalogo/product.html")
      ) {
        window.location.href = "../login/index.html";
      }
    }
  }
}