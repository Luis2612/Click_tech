async function _obtenerProductosBackend() {
  try {
    const res = await fetch(`${CONFIG.API_URL}/productos`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map(p => ({
        id: p.idProducto || p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        stock: p.stock,
        imagen: p.imagen,
        categoria: p.categoria ? (typeof p.categoria === "object" ? p.categoria.nombre : p.categoria) : "General"
      }));
    }
    return [];
  } catch (e) {
    return [];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const productos = await _obtenerProductosBackend();
  initPromoBanner();
  initPromoModal();
  initCarousel(productos);
  initCategorias(productos);
  initMasVendidos(productos);
  initHeroParticles();
  initCounters();
  initHeroFloat();
});


function initPromoModal() {
  const overlay = document.getElementById("promoModalOverlay");
  if (!overlay) return;

  const usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");

  if (usuario || sessionStorage.getItem("promoModalShown")) {
    overlay.remove();
    return;
  }

  const closeModal = () => {
    overlay.classList.add("closing");
    sessionStorage.setItem("promoModalShown", "true");
    setTimeout(() => overlay.remove(), 400);
  };

  setTimeout(() => {
    overlay.classList.add("visible");
  }, 3000);

  document.getElementById("promoModalClose").addEventListener("click", closeModal);
  document.getElementById("promoModalSkip").addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.getElementById("promoCopyBtn").addEventListener("click", () => {
    const code = document.querySelector("#promoCode span").textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById("promoCopyBtn");
      btn.innerHTML = '<i class="bi bi-check-lg"></i>';
      btn.style.color = "#22c55e";
      setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-clipboard"></i>';
        btn.style.color = "";
      }, 2000);
    });
  });
}


function initPromoBanner() {
  const banner = document.getElementById("promoBanner");
  const closeBtn = document.getElementById("promoBannerClose");
  if (!banner || !closeBtn) return;

  const usuario = JSON.parse(sessionStorage.getItem("usuarioAutenticado") || "null");

  if (usuario || sessionStorage.getItem("promoBannerClosed")) {
    banner.remove();
    return;
  }

  closeBtn.addEventListener("click", () => {
    banner.classList.add("closing");
    sessionStorage.setItem("promoBannerClosed", "true");
    setTimeout(() => banner.remove(), 400);
  });
}

function initCarousel(productos) {
  const track = document.getElementById("carouselTrack");
  const dotsContainer = document.getElementById("carouselDots");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  if (!track) return;

  const populares = [...productos].sort((a, b) => a.stock - b.stock);

  populares.forEach(p => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    const fallbackImg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
    slide.innerHTML = `
      <div class="product-card-carousel">
        <div class="product-card-badge">Popular</div>
        <div class="product-card-img-wrap">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
        </div>
        <div class="product-card-info">
          <span class="product-card-category">${p.categoria}</span>
          <h4 class="product-card-name">${p.nombre}</h4>
          <p class="product-card-desc">${p.descripcion}</p>
          <div class="product-card-footer">
            <span class="product-card-price">$${p.precio.toLocaleString("es-CO")}</span>
            <button class="product-card-btn" onclick="agregarAlCarrito(${p.id})">
              <i class="bi bi-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    track.appendChild(slide);
  });

  let currentIndex = 0;
  let autoplayInterval;
  const slides = track.querySelectorAll(".carousel-slide");

  function getVisibleCount() {
    if (window.innerWidth >= 1200) return 4;
    if (window.innerWidth >= 992) return 3;
    if (window.innerWidth >= 576) return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, slides.length - getVisibleCount());
  }

  function updateCarousel() {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 24;
    track.style.transform = `translateX(-${currentIndex * (slideWidth + gap)}px)`;
    updateDots();
    prevBtn.style.opacity = currentIndex <= 0 ? "0.3" : "1";
    nextBtn.style.opacity = currentIndex >= getMaxIndex() ? "0.3" : "1";
  }

  function updateDots() {
    const totalDots = getMaxIndex() + 1;
    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.className = `carousel-dot${i === currentIndex ? " active" : ""}`;
      dot.addEventListener("click", () => {
        currentIndex = i;
        updateCarousel();
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function goNext() {
    currentIndex = currentIndex >= getMaxIndex() ? 0 : currentIndex + 1;
    updateCarousel();
  }

  function goPrev() {
    currentIndex = currentIndex <= 0 ? getMaxIndex() : currentIndex - 1;
    updateCarousel();
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(goNext, 4000);
  }

  prevBtn.addEventListener("click", () => { goPrev(); resetAutoplay(); });
  nextBtn.addEventListener("click", () => { goNext(); resetAutoplay(); });

  let touchStartX = 0;
  let touchEndX = 0;
  track.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  track.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext(); else goPrev();
      resetAutoplay();
    }
  });

  window.addEventListener("resize", () => {
    if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
    updateCarousel();
  });

  updateCarousel();
  autoplayInterval = setInterval(goNext, 4000);
}

function initCategorias(productos) {
  const grid = document.getElementById("categoriasGrid");
  if (!grid) return;

  const iconos = {
    "Teclados": "bi-keyboard",
    "Mouses": "bi-mouse",
    "Monitores": "bi-display",
    "Audio": "bi-headphones",
    "Accesorios": "bi-usb-drive",
    "Almacenamiento": "bi-hdd",
    "Redes": "bi-wifi"
  };

  const colores = {
    "Teclados": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "Mouses": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "Monitores": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "Audio": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "Accesorios": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "Almacenamiento": "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "Redes": "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
  };

  const categorias = [...new Set(productos.map(p => p.categoria))];

  categorias.forEach(cat => {
    const count = productos.filter(p => p.categoria === cat).length;
    const card = document.createElement("a");
    card.href = "../catalogo/index.html";
    card.className = "categoria-card";
    card.innerHTML = `
      <div class="categoria-icon" style="background:${colores[cat] || "linear-gradient(135deg, #06B6D4, #0891b2)"}">
        <i class="bi ${iconos[cat] || "bi-box"}"></i>
      </div>
      <h5 class="categoria-name">${cat}</h5>
      <span class="categoria-count">${count} producto${count !== 1 ? "s" : ""}</span>
    `;
    grid.appendChild(card);
  });
}

function initMasVendidos(productos) {
  const grid = document.getElementById("masVendidosGrid");
  if (!grid) return;

  const vendidos = [...productos].sort((a, b) => a.stock - b.stock).slice(0, 4);

  vendidos.forEach((p, i) => {
    const col = document.createElement("div");
    col.className = "col-6 col-lg-3";
    col.innerHTML = `
      <div class="vendido-card" style="animation-delay: ${i * 0.1}s">
        <div class="vendido-rank">#${i + 1}</div>
        <div class="vendido-img-wrap">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
        </div>
        <div class="vendido-info">
          <span class="vendido-category">${p.categoria}</span>
          <h5 class="vendido-name">${p.nombre}</h5>
          <div class="vendido-footer">
            <span class="vendido-price">$${p.precio.toLocaleString("es-CO")}</span>
            <button class="vendido-btn" onclick="agregarAlCarrito(${p.id})">
              <i class="bi bi-cart-plus"></i> Agregar
            </button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function initHeroParticles() {
  const container = document.getElementById("heroParticles");
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.width = particle.style.height = (Math.random() * 4 + 2) + "px";
    particle.style.animationDuration = (Math.random() * 8 + 4) + "s";
    particle.style.animationDelay = (Math.random() * 5) + "s";
    container.appendChild(particle);
  }
}

function initCounters() {
  const counters = document.querySelectorAll(".hero-stat-number");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count"));
        let current = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current.toLocaleString("es-CO");
        }, 25);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function initHeroFloat() {
  const img = document.getElementById("heroImage");
  if (!img) return;
  let t = 0;
  function animate() {
    t += 0.02;
    img.style.transform = `translateY(${Math.sin(t) * 12}px)`;
    requestAnimationFrame(animate);
  }
  animate();
}
