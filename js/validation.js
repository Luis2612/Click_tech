document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("nombre");
  if (nameInput) {
    nameInput.addEventListener("input", (e) => {
      const cleanValue = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      if (e.target.value !== cleanValue) {
        e.target.value = cleanValue;
      }
    });
  }

  const phoneInput = document.getElementById("telefono");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let cleanValue = e.target.value.replace(/\D/g, "");
      if (cleanValue.length > 10) {
        cleanValue = cleanValue.substring(0, 10);
      }
      if (e.target.value !== cleanValue) {
        e.target.value = cleanValue;
      }
      
      if (cleanValue.length === 10) {
        phoneInput.setCustomValidity("");
      } else {
        phoneInput.setCustomValidity("El teléfono debe tener exactamente 10 dígitos.");
      }
    });
  }

  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("input", (e) => {
      const email = e.target.value;
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
      if (emailPattern.test(email)) {
        emailInput.setCustomValidity("");
      } else {
        emailInput.setCustomValidity("El correo electrónico debe ser válido");
      }
    });
  }

  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  if (passwordInput && confirmPasswordInput) {
    const validatePasswords = () => {
      if (passwordInput.value === confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity("");
      } else {
        confirmPasswordInput.setCustomValidity("Las contraseñas no coinciden.");
      }
    };
    passwordInput.addEventListener("input", validatePasswords);
    confirmPasswordInput.addEventListener("input", validatePasswords);
  }

  const forms = document.querySelectorAll(".needs-validation");
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (phoneInput) {
        const cleanValue = phoneInput.value.replace(/\D/g, "");
        if (cleanValue.length !== 10) {
          phoneInput.setCustomValidity("El teléfono debe tener exactamente 10 dígitos.");
        } else {
          phoneInput.setCustomValidity("");
        }
      }
      if (emailInput) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
        if (!emailPattern.test(emailInput.value)) {
          emailInput.setCustomValidity("El correo electrónico debe ser válido");
        } else {
          emailInput.setCustomValidity("");
        }
      }
      if (passwordInput && confirmPasswordInput) {
        if (passwordInput.value !== confirmPasswordInput.value) {
          confirmPasswordInput.setCustomValidity("Las contraseñas no coinciden.");
        } else {
          confirmPasswordInput.setCustomValidity("");
        }
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    }, false);
  });
});
