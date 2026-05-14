document.addEventListener('DOMContentLoaded', () => {
    iniciarFormulario();
});

function iniciarFormulario() {
    const form = document.getElementById('order-form');
    if (!form) return;

    const inputFecha = document.getElementById('delivery-date');
    if (inputFecha) {
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        inputFecha.min = manana.toISOString().split('T')[0];
    }

    form.addEventListener('submit', manejarEnvio);

    const btnLimpiar = document.getElementById('clear-form-btn');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            const formularioTieneContenido = tieneContenido(form);
            if (!formularioTieneContenido) return; // nada que limpiar

            const confirmar = window.confirm(
                '¿Estás seguro de que quieres limpiar el formulario?\n' +
                'Todos los datos ingresados se perderán y tendrás que volver a escribirlos.'
            );
            if (confirmar) {
                form.reset();
                limpiarTodosLosErrores(form);
                ocultarEstado();
            }
        });
    }
}

async function manejarEnvio(evento) {
    evento.preventDefault();
    const form = evento.target;

    ocultarEstado();

    const esValido = validarFormulario(form);
    if (!esValido) {
        const primerError = form.querySelector('.invalid');
        if (primerError) primerError.focus();
        return;
    }

    const datosPedido = {
        nombreCliente:   form.customerName.value.trim(),
        emailCliente:    form.customerEmail.value.trim(),
        telefonoCliente: form.customerPhone.value.trim(),
        productoId:      parseInt(form.productId.value, 10),
        cantidad:        parseInt(form.quantity.value, 10),
        fechaEntrega:    form.deliveryDate.value,
        notas:           form.notes.value.trim()
    };

    const btnSubmit = document.getElementById('submit-btn');
    activarCarga(btnSubmit, true);

    try {
        const resultado = await realizarPedido(datosPedido);

        mostrarEstado(
            'ok',
            `¡Pedido confirmado! Tu número de pedido es <strong>${resultado.numeroPedido}</strong>. ` +
            `Recibirás la confirmación en <strong>${datosPedido.emailCliente}</strong>. ` +
            `Total: <strong>${formatearPrecio(resultado.totalPrecio)}</strong>.`
        );

        form.reset();
        limpiarTodosLosErrores(form);

        document.getElementById('form-status')
            .scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
        let mensaje = 'Ocurrió un error al procesar tu pedido. Por favor, intenta de nuevo en unos segundos.';

        if (err.message === 'SIN_STOCK') {
            mensaje = 'El producto que seleccionaste ya no tiene stock disponible. ' +
                      'Por favor elige otro producto del catálogo y vuelve a intentarlo.';
        } else if (err.message === 'PRODUCTO_NO_ENCONTRADO') {
            mensaje = 'El producto seleccionado no existe en nuestro sistema. ' +
                      'Recarga la página para actualizar el catálogo y vuelve a intentarlo.';
        }

        mostrarEstado('fail', mensaje);

    } finally {
        activarCarga(btnSubmit, false);
    }
}

function validarFormulario(form) {
    let valido = true;

    const nombre = form.customerName;
    if (!nombre.value.trim()) {
        marcarError(nombre, 'err-name', 'Ingresa tu nombre completo para que podamos identificar tu pedido.');
        valido = false;
    } else if (nombre.value.trim().length < 3) {
        marcarError(nombre, 'err-name', 'El nombre debe tener al menos 3 caracteres.');
        valido = false;
    } else {
        limpiarError(nombre, 'err-name');
    }

    const email = form.customerEmail;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        marcarError(email, 'err-email', 'Ingresa tu correo electrónico para recibir la confirmación del pedido.');
        valido = false;
    } else if (!regexEmail.test(email.value.trim())) {
        marcarError(email, 'err-email', 'El correo no tiene un formato válido. Ej: nombre@correo.com');
        valido = false;
    } else {
        limpiarError(email, 'err-email');
    }

    const telefono = form.customerPhone;
    const soloDigitos = telefono.value.replace(/[\s\-\(\)]/g, '');
    if (!telefono.value.trim()) {
        marcarError(telefono, 'err-phone', 'Ingresa un número de teléfono para coordinar la entrega.');
        valido = false;
    } else if (!/^\+?[0-9]{7,15}$/.test(soloDigitos)) {
        marcarError(telefono, 'err-phone', 'El teléfono debe tener entre 7 y 15 dígitos. Ej: 300 123 4567');
        valido = false;
    } else {
        limpiarError(telefono, 'err-phone');
    }

    const producto = form.productId;
    if (!producto.value) {
        marcarError(producto, 'err-product', 'Selecciona el producto que deseas pedir.');
        valido = false;
    } else {
        limpiarError(producto, 'err-product');
    }

    const cantidad = form.quantity;
    const cantNum = parseInt(cantidad.value, 10);
    if (!cantidad.value || isNaN(cantNum) || cantNum < 1) {
        marcarError(cantidad, 'err-quantity', 'La cantidad debe ser al menos 1 unidad.');
        valido = false;
    } else if (cantNum > 10) {
        marcarError(cantidad, 'err-quantity', 'El máximo por pedido es 10 unidades. Para pedidos mayores, contáctanos directamente.');
        valido = false;
    } else {
        limpiarError(cantidad, 'err-quantity');
    }

    const fecha = form.deliveryDate;
    if (!fecha.value) {
        marcarError(fecha, 'err-date', 'Selecciona la fecha en que deseas recibir tu pedido.');
        valido = false;
    } else {
        const seleccionada = new Date(fecha.value + 'T00:00:00');
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        manana.setHours(0, 0, 0, 0);

        if (seleccionada < manana) {
            marcarError(fecha, 'err-date', 'La fecha de entrega debe ser al menos mañana para que podamos procesar tu pedido a tiempo.');
            valido = false;
        } else {
            limpiarError(fecha, 'err-date');
        }
    }

    return valido;
}

function marcarError(input, idError, mensaje) {
    input.classList.add('invalid');
    const el = document.getElementById(idError);
    if (el) el.textContent = mensaje;
}

function limpiarError(input, idError) {
    input.classList.remove('invalid');
    const el = document.getElementById(idError);
    if (el) el.textContent = '';
}

function limpiarTodosLosErrores(form) {
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function tieneContenido(form) {
    return ['customerName', 'customerEmail', 'customerPhone', 'productId', 'notes']
        .some(name => form[name] && form[name].value.trim() !== '');
}

function activarCarga(btn, cargando) {
    btn.disabled = cargando;
    btn.textContent = cargando ? 'Procesando pedido...' : 'Confirmar y enviar pedido';
}

function mostrarEstado(tipo, html) {
    const el = document.getElementById('form-status');
    el.className = `form-status ${tipo}`;
    el.innerHTML = html;
    el.classList.remove('hidden');
}

function ocultarEstado() {
    const el = document.getElementById('form-status');
    el.className = 'form-status hidden';
    el.textContent = '';
}

function formatearPrecio(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}
