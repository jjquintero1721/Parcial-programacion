# Koffi — Tienda de Café de Especialidad

Página web para la venta de café artesanal colombiano y equipos de preparación.
Desarrollada con HTML5, CSS3 y JavaScript vanilla, sin dependencias externas.

## Descripción

Koffi ofrece una experiencia de compra sencilla organizada en tres secciones:

1. **Landing (Inicio):** presentación del producto con llamado a la acción.
2. **Catálogo:** grilla de productos cargada dinámicamente desde la API simulada, con estados de carga, error y vacío.
3. **Formulario de pedido:** permite realizar un pedido con validación en tiempo real, estado de carga visible y mensajes de éxito o error claros.

## Cómo correrlo localmente

Este proyecto no requiere instalación ni servidor especial. Solo necesitas abrir el archivo `index.html` en un navegador moderno.

### Opción A — Abrir directamente (más rápido)

1. Clona el repositorio:
   ```bash
   git clone https://github.com/jjquintero1721/Parcial-programacion.git
   cd Parcial-programacion
   ```
2. Abre el archivo `index.html` con doble clic, o arrastrándolo al navegador.

### Opción B — Servidor local (recomendado para evitar restricciones de CORS)

Si tienes Python instalado:
```bash
python -m http.server 8000
```
Luego abre `http://localhost:8000` en el navegador.

Si tienes Node.js y `npx`:
```bash
npx serve .
```

## Documentación de endpoints simulados (`mockApi.js`)

### `obtenerProductos()`

| Campo | Valor |
|-------|-------|
| **Equivalente HTTP** | `GET /api/products` |
| **Parámetros** | Ninguno |
| **Delay simulado** | 800 ms |

**Respuesta exitosa (objeto):**
```json
{
  "productos": [
    {
      "id": 1,
      "nombre": "Café Origen Sierra Nevada",
      "categoria": "Granos",
      "descripcion": "...",
      "precio": 28000,
      "emoji": "🫘",
      "disponible": true
    }
  ]
}
```

**Respuesta de error:**  
Lanza `Error("SERVER_ERROR")` y registra en consola:
```
500 Internal Server Error — GET /api/products: Error interno al consultar el catálogo. Intenta de nuevo.
```

---

### `realizarPedido(datosPedido)`

| Campo | Valor |
|-------|-------|
| **Equivalente HTTP** | `POST /api/orders` |
| **Delay simulado** | 1000 ms |

**Parámetros (`datosPedido`):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombreCliente` | `string` | Nombre completo del cliente |
| `emailCliente` | `string` | Correo electrónico de contacto |
| `telefonoCliente` | `string` | Teléfono de contacto |
| `productoId` | `number` | ID del producto seleccionado |
| `cantidad` | `number` | Número de unidades (1–10) |
| `fechaEntrega` | `string` | Fecha deseada en formato `YYYY-MM-DD` |
| `notas` | `string` | (Opcional) instrucciones adicionales |

**Respuesta exitosa (objeto):**
```json
{
  "numeroPedido": "KF-1001",
  "mensaje": "Tu pedido de 2 × Café Origen Sierra Nevada fue registrado exitosamente.",
  "fechaEntrega": "2026-05-20",
  "totalPrecio": 56000
}
```

**Respuestas de error:**

| `err.message` | Causa | Log en consola |
|---------------|-------|----------------|
| `SERVER_ERROR` | Fallo interno aleatorio | `500 Internal Server Error — POST /api/orders: Error interno...` |
| `PRODUCTO_NO_ENCONTRADO` | El `productoId` no existe | `500 Internal Server Error — POST /api/orders: El producto con id X no existe...` |
| `SIN_STOCK` | El producto existe pero `disponible: false` | `500 Internal Server Error — POST /api/orders: El producto "X" no tiene stock...` |

## Integrantes

- Nicolas Carmona
- Juan Jose Quintero
