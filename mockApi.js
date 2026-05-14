/**
 * mockApi.js — Simulación de API REST para Koffi
 *
 * Simula los endpoints del backend con latencia de red real y manejo
 * de errores. El front debe consumir este archivo igual que consumiría
 * una API real usando async/await.
 *
 * Endpoints disponibles:
 *   obtenerProductos()  →  GET  /api/products
 *   realizarPedido()    →  POST /api/orders
 */

/* ---- Base de datos interna (solo para la simulación) ---- */
const _productos = [
    {
        id: 1,
        nombre: 'Café Origen Sierra Nevada',
        categoria: 'Granos',
        descripcion: 'Notas de chocolate negro, frutas rojas y panela. Cultivado a 1 800 msnm en la Sierra Nevada de Santa Marta.',
        precio: 28000,
        emoji: '🫘',
        disponible: true
    },
    {
        id: 2,
        nombre: 'Blend Koffi Signature',
        categoria: 'Granos',
        descripcion: 'Nuestra mezcla exclusiva de tres orígenes colombianos. Equilibrada, cremosa y de tueste medio.',
        precio: 22000,
        emoji: '☕',
        disponible: true
    },
    {
        id: 3,
        nombre: 'Prensa Francesa Premium',
        categoria: 'Equipos',
        descripcion: 'Prensa francesa de 1 L con doble filtro de acero inoxidable y cuerpo de vidrio borosilicato.',
        precio: 85000,
        emoji: '🧪',
        disponible: true
    },
    {
        id: 4,
        nombre: 'Molino Manual de Cerámica',
        categoria: 'Equipos',
        descripcion: 'Molino de mano con burras de cerámica ajustables. 15 niveles de grosor para cualquier método de extracción.',
        precio: 120000,
        emoji: '⚙️',
        disponible: true
    },
    {
        id: 5,
        nombre: 'Kettle Cuello de Ganso',
        categoria: 'Equipos',
        descripcion: 'Tetera de precisión para pour over. Capacidad 0.8 L, boquilla diseñada para flujo constante y controlado.',
        precio: 95000,
        emoji: '🫖',
        disponible: false   // sin stock
    },
    {
        id: 6,
        nombre: 'Kit Pour Over Completo',
        categoria: 'Kits',
        descripcion: 'Incluye dripper de cerámica, soporte de madera, 100 filtros de papel y 250 g de café de especialidad.',
        precio: 140000,
        emoji: '🎁',
        disponible: true
    }
];

const _pedidos = [];
let _contadorPedidos = 1001;

/* ---- Helpers privados ---- */

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Falla aleatoriamente con la probabilidad indicada (0-1)
function _fallaAleatoria(probabilidad) {
    return Math.random() < probabilidad;
}


/* ============================================================
   ENDPOINT 1
   obtenerProductos()
   Equivalente HTTP: GET /api/products
   ============================================================
   Parámetros: ninguno

   Respuesta exitosa:
     {
       productos: [
         { id, nombre, categoria, descripcion, precio, emoji, disponible },
         ...
       ]
     }

   Respuesta de error:
     Lanza un Error con message "SERVER_ERROR"
     y registra en consola: "500 Internal Server Error — GET /api/products: ..."
   ============================================================ */
async function obtenerProductos() {
    await _delay(800);  // simula latencia de red (mínimo 500 ms)

    if (_fallaAleatoria(0.2)) {
        console.log('500 Internal Server Error — GET /api/products: Error interno al consultar el catálogo. Intenta de nuevo.');
        throw new Error('SERVER_ERROR');
    }

    return { productos: _productos };
}


/* ============================================================
   ENDPOINT 2
   realizarPedido(datosPedido)
   Equivalente HTTP: POST /api/orders
   ============================================================
   Parámetros (objeto datosPedido):
     {
       nombreCliente  : string  — nombre completo del cliente
       emailCliente   : string  — correo electrónico
       telefonoCliente: string  — teléfono de contacto
       productoId     : number  — id del producto seleccionado
       cantidad       : number  — unidades (1-10)
       fechaEntrega   : string  — fecha ISO 8601 (YYYY-MM-DD)
       notas          : string  — (opcional) instrucciones adicionales
     }

   Respuesta exitosa:
     {
       numeroPedido  : string  — ej. "KF-1001"
       mensaje       : string  — confirmación legible para el usuario
       fechaEntrega  : string  — fecha de entrega confirmada
       totalPrecio   : number  — precio total en COP
     }

   Respuesta de error:
     Lanza un Error con message "SERVER_ERROR", "PRODUCTO_NO_ENCONTRADO" o "SIN_STOCK"
     y registra en consola: "500 Internal Server Error — POST /api/orders: ..."
   ============================================================ */
async function realizarPedido(datosPedido) {
    await _delay(1000);  // simula latencia de red (mínimo 500 ms)

    if (_fallaAleatoria(0.2)) {
        console.log('500 Internal Server Error — POST /api/orders: Error interno al procesar el pedido. El registro no fue guardado.');
        throw new Error('SERVER_ERROR');
    }

    const producto = _productos.find(p => p.id === datosPedido.productoId);

    if (!producto) {
        console.log('500 Internal Server Error — POST /api/orders: El producto con id ' + datosPedido.productoId + ' no existe en la base de datos.');
        throw new Error('PRODUCTO_NO_ENCONTRADO');
    }

    if (!producto.disponible) {
        console.log('500 Internal Server Error — POST /api/orders: El producto "' + producto.nombre + '" no tiene stock disponible.');
        throw new Error('SIN_STOCK');
    }

    const nuevoPedido = {
        numeroPedido: 'KF-' + (_contadorPedidos++),
        ...datosPedido,
        nombreProducto: producto.nombre,
        totalPrecio: producto.precio * datosPedido.cantidad,
        estado: 'confirmado',
        creadoEn: new Date().toISOString()
    };

    _pedidos.push(nuevoPedido);

    return {
        numeroPedido: nuevoPedido.numeroPedido,
        mensaje: `Tu pedido de ${datosPedido.cantidad} × ${producto.nombre} fue registrado exitosamente.`,
        fechaEntrega: datosPedido.fechaEntrega,
        totalPrecio: nuevoPedido.totalPrecio
    };
}
