export function obtenerProductos() {
    const nuevos = JSON.parse(localStorage.getItem("productos_nuevos") || "[]");
    const eliminados = JSON.parse(localStorage.getItem("productos_eliminados") || "[]");
    const editados = JSON.parse(localStorage.getItem("productos_editados") || "{}");

    const base = PRODUCTOS_INICIALES
        .filter(p => !eliminados.includes(p.id))
        .map(p => editados[p.id] ? editados[p.id] : p);

    return [...base, ...nuevos];
}

