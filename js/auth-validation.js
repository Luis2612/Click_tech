document.addEventListener("DOMContentLoaded", () => {
  // --- Validations for Name Field (No numbers or special characters allowed) ---
  const nameInput = document.getElementById("nombre");
  if (nameInput) {
    nameInput.addEventListener("input", (e) => {
      // Remove any digits or special characters (only keep letters and spaces)
      const cleanValue = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      if (e.target.value !== cleanValue) {
        e.target.value = cleanValue;
      }
    });
  }

  // --- Validations for Phone Field (Only digits, exactly 10 characters) ---
  const phoneInput = document.getElementById("telefono");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      // Remove any non-digit characters
      let cleanValue = e.target.value.replace(/\D/g, "");
      // Limit to 10 digits max
      if (cleanValue.length > 10) {
        cleanValue = cleanValue.substring(0, 10);
      }
      if (e.target.value !== cleanValue) {
        e.target.value = cleanValue;
      }
      
      // Enforce exactly 10 digits
      if (cleanValue.length === 10) {
        phoneInput.setCustomValidity("");
      } else {
        phoneInput.setCustomValidity("El teléfono debe tener exactamente 10 dígitos.");
      }
    });
  }

  // --- Validations for Email Field (Must contain @ and end with .com) ---
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("input", (e) => {
      const email = e.target.value;
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
      if (emailPattern.test(email)) {
        emailInput.setCustomValidity("");
      } else {
        emailInput.setCustomValidity("El correo electrónico debe ser válido y terminar en .com");
      }
    });
  }

  // --- Validations for Password Match ---
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

  // --- Bootstrap Form Submission Interceptor ---
  const forms = document.querySelectorAll(".needs-validation");
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      // Run custom checks before checking validity
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
          emailInput.setCustomValidity("El correo electrónico debe ser válido y terminar en .com");
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
