document.addEventListener("DOMContentLoaded", () => {
  console.log("%c⚡ Click Techs System: ONLINE ⚡", "color: #00f2fe; font-size: 16px; font-weight: bold;");
  const textElements = document.querySelectorAll(
    "main h1, main p, section h1, section h2, section h3, section h4, section p, footer h5, footer p"
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
});

if(document.getElementById('contactForm') != undefined){
  document.getElementById('contactForm').addEventListener('submit', function(event) {
      event.preventDefault();
      if (this.checkValidity()) {
        document.getElementById('formStatus').classList.remove('d-none');
        //this.reset();
        this.classList.remove('was-validated');
        document.getElementById('contactForm').submit();
        setTimeout(() => {
          document.getElementById('formStatus').classList.add('d-none');
        }, 5000);
      } else {
        event.stopPropagation();
        this.classList.add('was-validated');
      }
    });
}

    