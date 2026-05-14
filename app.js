/**
 * app.js — Lógica principal: navegación y catálogo de productos
 *
 * Responsabilidades de este archivo:
 *   - Menú hamburguesa en móvil
 *   - Carga y renderizado del catálogo desde mockApi
 *   - Llenado del <select> de productos en el formulario
 *   - Interacción: clic en tarjeta → pre-selecciona producto en el formulario
 */

document.addEventListener('DOMContentLoaded', () => {
    iniciarNavegacion();
    cargarProductos();
});

// =============================================
// NAVEGACIÓN MÓVIL
// =============================================
function iniciarNavegacion() {
    const toggle = document.querySelector('.nav-toggle');
    const menu   = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const abierto = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(abierto));
    });

    // Cierra el menú al hacer clic en cualquier enlace
    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// =============================================
// CATÁLOGO DE PRODUCTOS
// =============================================
async function cargarProductos() {
    const elCargando = document.getElementById('products-loading');
    const elError    = document.getElementById('products-error');
    const elVacio    = document.getElementById('products-empty');
    const elGrilla   = document.getElementById('products-grid');
    const btnReintentar = document.getElementById('retry-btn');

    function mostrar(el) {
        [elCargando, elError, elVacio, elGrilla].forEach(e => e.classList.add('hidden'));
        el.classList.remove('hidden');
    }

    mostrar(elCargando);

    try {
        const { productos } = await obtenerProductos();

        if (!productos || productos.length === 0) {
            mostrar(elVacio);
            return;
        }

        elGrilla.innerHTML = '';
        productos.forEach(p => elGrilla.appendChild(crearTarjeta(p)));

        // Llena el select del formulario con los productos disponibles
        llenarSelectProductos(productos);

        mostrar(elGrilla);

    } catch {
        mostrar(elError);
    }

    // El botón "Reintentar" vuelve a llamar a esta función
    btnReintentar.addEventListener('click', cargarProductos);
}

/**
 * Crea el elemento <article> de una tarjeta de producto.
 * Si el producto está disponible, al hacer clic pre-selecciona
 * el producto en el formulario y desplaza hacia esa sección.
 */
function crearTarjeta(producto) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.id = producto.id;

    const precio = formatearPrecio(producto.precio);
    const stockClass = producto.disponible ? 'in'  : 'out';
    const stockText  = producto.disponible ? 'Disponible' : 'Sin stock';

    article.innerHTML = `
        <div class="card-image" aria-hidden="true">${producto.emoji}</div>
        <div class="card-body">
            <span class="card-category">${producto.categoria}</span>
            <h3>${producto.nombre}</h3>
            <p class="card-desc">${producto.descripcion}</p>
        </div>
        <div class="card-footer">
            <span class="card-price">${precio}</span>
            <span class="card-stock ${stockClass}">${stockText}</span>
        </div>
        ${producto.disponible ? '<p class="card-hint">Haz clic para seleccionar este producto →</p>' : ''}
    `;

    if (producto.disponible) {
        article.classList.add('is-clickable');
        article.setAttribute('role', 'button');
        article.setAttribute('tabindex', '0');
        article.setAttribute('aria-label', `Seleccionar ${producto.nombre} — ${precio}`);

        const seleccionar = () => preseleccionarProducto(producto.id);
        article.addEventListener('click', seleccionar);
        article.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                seleccionar();
            }
        });
    }

    return article;
}

/**
 * Llena el <select id="product-select"> con los productos disponibles.
 * También actualiza las opciones si se llama de nuevo (retry).
 */
function llenarSelectProductos(productos) {
    const select = document.getElementById('product-select');
    if (!select) return;

    // Conserva solo el placeholder y agrega el resto
    while (select.options.length > 1) select.remove(1);

    productos
        .filter(p => p.disponible)
        .forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nombre} — ${formatearPrecio(p.precio)}`;
            select.appendChild(opt);
        });
}

/**
 * Pre-selecciona un producto en el formulario y desplaza la vista hacia él.
 */
function preseleccionarProducto(id) {
    const select = document.getElementById('product-select');
    if (!select) return;

    select.value = String(id);

    // Dispara el evento change por si formHandler escucha cambios
    select.dispatchEvent(new Event('change'));

    document.getElementById('pedido')
        .scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================
// UTILIDADES
// =============================================
function formatearPrecio(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}
