async function obtenerProductosBackend() {
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

async function obtenerInfoProductoBackend(id) {
    try {
        const res = await fetch(`${CONFIG.API_URL}/productos/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
            const p = data.data;
            return {
                id: p.idProducto || p.id,
                nombre: p.nombre,
                descripcion: p.descripcion,
                precio: Number(p.precio),
                stock: p.stock,
                imagen: p.imagen,
                categoria: p.categoria ? (typeof p.categoria === "object" ? p.categoria.nombre : p.categoria) : "General"
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const sectionImages = document.getElementById('card-images');
    const sectionInfo = document.getElementById('card-info');
    if (!sectionImages || !sectionInfo) return;
    const parametros = new URLSearchParams(window.location.search);
    const idProducto = parametros.get('id');
    if (idProducto) {
        const productoInfo = await obtenerInfoProductoBackend(idProducto);
        if (productoInfo) {
            sectionImages.innerHTML = crearTarjetaImages(productoInfo);
            sectionInfo.innerHTML = crearTarjetaInfo(productoInfo);
            return;
        }
    }
    sectionImages.innerHTML = `
        <div class="d-flex align-items-center justify-content-center">
            <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
        </div>
    `;
    sectionInfo.innerHTML = `
        <p>No fue posible encontrar este producto, por favor vuelve a revisar nuestro catálogo.</p>
        <a href="../catalogo/index.html" class="btn btn-outline-info rounded-pill px-4 mt-3">Explorar catálogo</a>
    `;
});

function crearTarjetaImages(producto) {
    const fallbackImg = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
    const imagenHTML = producto.imagen ?
        `<img src="${producto.imagen}" alt="${producto.nombre}" class="bg-white-img img-fluid rounded w-100" onerror="this.onerror=null; this.src='${fallbackImg}';">` :
        `<div class="d-flex align-items-center justify-content-center" style="height: 400px; background: #1a1a1a;">
            <i class="bi bi-image display-4 text-secondary"></i>
        </div>`;
    return `
        <div class="position-relative">
            ${imagenHTML}
            <button class="btn btn-outline-danger position-absolute top-0 end-0 m-3 rounded-circle d-flex align-items-center justify-content-center"
                style="width: 40px; height: 40px; padding: 0;">
                <i class="bi bi-heart"></i>
            </button>
        </div>
    `;
}

function crearTarjetaInfo(producto) {
    const stockBadge = producto.stock > 10 ?
        `<span class="badge bg-success bg-opacity-25 text-success mb-2 align-self-start text-uppercase px-3 py-1 fw-bold">En stock</span>` : producto.stock > 0 ?
            `<span class="badge bg-warning bg-opacity-25 text-warning mb-2 align-self-start text-uppercase px-3 py-1 fw-bold">Últimas ${producto.stock} uds</span>` :
            `<span class="badge bg-danger bg-opacity-25 text-danger mb-2 align-self-start text-uppercase px-3 py-1 fw-bold">Agotado</span>`;
    return `
        ${stockBadge}
        <h1 class="h2 fw-bold mb-2">${producto.nombre}</h1>
        <div class="d-flex align-items-center mb-4 text-warning">
            <div class="me-2">★★★★★</div>
            <span class="text-color-alternativo small">(128 reseñas de clientes)</span>
        </div>
        <h2 class="text-info fw-bold display-6 mb-4">$${producto.precio.toLocaleString("es-CO")}</h2>
        <h3 class="h6 uppercase fw-bold">Descripción</h3>
        <p class="text-color-alternativo small lh-base mb-4">
            ${producto.descripcion}
        </p>
        <div class="d-flex gap-3 mb-4">
            <button class="btn bg-resaltar text-color-principal fw-bold w-70 py-3 rounded-3" data-id="${producto.id}" onclick="agregarAlCarrito(${producto.id})">
                <i class="bi bi-cart3 me-2"></i> Agregar al carrito
            </button>
            <button class="btn btn-outline-secondary text-color-principal fw-bold w-70 py-3 rounded-3" onclick="comprarAhora(${producto.id})">
                <i class="bi bi-cart3 me-2"></i> Comprar ahora
            </button>
        </div>
        <div class="d-flex gap-4 small text-color-alternativo">
            ${producto.precio >= 150000
            ? `<span><i class="bi bi-truck me-1 text-color-resaltar"></i> Envío gratis</span>`
            : `<span><i class="bi bi-truck me-1 text-color-resaltar"></i> Envío gratis desde $150.000</span>`
        }
            <span><i class="bi bi-shield-check me-1 text-color-resaltar"></i> 2-años de garantía</span>
        </div>
    `;
}

async function comprarAhora(productoId) {
    const agregado = await agregarAlCarrito(productoId);
    if (agregado) {
        window.location.href = "../carrito/index.html";
    }
}