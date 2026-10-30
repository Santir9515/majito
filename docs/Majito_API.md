# Majito — API del backend (versión provisional)
 
Descripción de las rutas del backend tal como están implementadas al 30/10/2026. Es una versión
provisional: la API cambiará cuando se incorpore el login con JWT (ver sección 6).
 
## 1. Convenciones
 
- **URL base (local):** `http://localhost:3000`. No hay prefijo `/api`.
- **Formato:** JSON en pedidos y respuestas.
- **Identificación del usuario (provisional):** hasta tener autenticación, el usuario que realiza
  la acción viaja en el pedido: como `usuarioId` en el body (o en la query en el listado de
  movimientos) y como `creadoPor` al crear un ticket o un reemplazo. Con JWT este dato dejará de
  enviarse y se tomará del token.
- **Validación:** los campos no declarados en cada pedido se descartan sin error. Los campos
  inválidos o faltantes devuelven `400` con el detalle en `message`.
- **Identificadores:** los `id` son los `_id` de MongoDB (24 caracteres hexadecimales).
- **Errores de reglas de negocio:** una transición inválida, un usuario sin permiso o un ticket
  que no existe devuelven un error con un mensaje descriptivo en `message`. La falta de stock al
  facturar devuelve `400` con el mensaje `Stock insuficiente para "<producto>" (se necesitan N)`.
## 2. Tickets
 
| Método y ruta | Descripción | Datos |
|---|---|---|
| `POST /tickets` | Crea un ticket en estado `creado` (CU-02) | Body: `cliente`, `items` (lista de `productoId` y `cantidad`, mínimo 1 por ítem), `notas` (opcional), `creadoPor` |
| `GET /tickets` | Lista los tickets | Query opcional: `estado` (uno o varios separados por coma, por ejemplo `?estado=creado,facturado`) |
| `GET /tickets/:id` | Devuelve un ticket con su historial (CU-19) | — |
| `PATCH /tickets/:id/avanzar` | Pasa el ticket al estado siguiente del flujo (CU-04 a CU-09) | Body: `usuarioId` |
| `PATCH /tickets/:id/anular` | Anula el ticket (CU-13) | Body: `usuarioId`, `motivo` (obligatorio) |
| `PATCH /tickets/:id/rechazar` | Rechaza el ticket (CU-11) | Body: `usuarioId`, `motivo` (obligatorio) |
| `POST /tickets/:id/reemplazo` | Crea un ticket de reemplazo de uno rechazado (CU-12) | Body: `creadoPor`, `items` (mínimo 1), `notas` (opcional) |
 
Notas:
 
- `avanzar` no recibe el estado destino: el sistema calcula el siguiente según el estado actual
  (creado → en_revision → en_preparacion → listo_para_facturar → facturado → entregado → cerrado)
  y valida que el rol del usuario pueda hacer esa transición.
- Al avanzar de `listo_para_facturar` a `facturado`, el sistema descuenta el stock de cada ítem
  (RF-15). Si algún ítem no alcanza, no se factura ni se descuenta nada.
- Al anular un ticket `facturado`, el sistema reintegra el stock automáticamente (RF-07).
- Un ticket `rechazado` con reemplazos no puede anularse.
- Estados posibles: `creado`, `en_revision`, `en_preparacion`, `listo_para_facturar`, `facturado`,
  `entregado`, `cerrado`, `anulado`, `rechazado`.
Forma de un ticket en las respuestas:
 
| Campo | Descripción |
|---|---|
| `_id` | Identificador |
| `cliente` | Nombre del cliente |
| `items` | Lista de `productoId`, `productoNombre`, `productoCodigo`, `cantidad` |
| `estado` | Estado actual |
| `notas` | Notas del pedido |
| `creadoPor` | Usuario que lo creó |
| `historial` | Lista de `estado`, `usuario`, `fecha` y `motivo` (cuando corresponde) |
| `motivoAnulacion`, `motivoRechazo` | Presentes solo si el ticket fue anulado o rechazado |
| `ticketOrigenId` | En un reemplazo, el ticket rechazado del que proviene |
| `ticketsReemplazoIds` | En un ticket rechazado, sus tickets de reemplazo |
| `createdAt`, `updatedAt` | Fechas de creación y última modificación |
 
Ejemplo:
 
```bash
curl -X PATCH http://localhost:3000/tickets/<id>/avanzar \
  -H "Content-Type: application/json" \
  -d '{"usuarioId": "<id del usuario>"}'
```
 
## 3. Productos
 
| Método y ruta | Descripción | Datos |
|---|---|---|
| `POST /productos` | Da de alta un producto | Body: `codigo`, `nombre`, `categoria` (opcional), `precio` (≥ 0). El producto nace con stock 0: el stock se carga con un movimiento (sección 4) |
| `GET /productos` | Lista los productos y su stock (CU-14) | — |
| `GET /productos/:id` | Devuelve un producto | — |
 
Campos de un producto: `_id`, `codigo`, `nombre`, `categoria`, `precio`, `stockActual`, `activo`.
 
## 4. Movimientos de stock
 
Los movimientos de tipo `descuento_facturacion` y `reintegro_anulacion` los genera el sistema al
facturar o anular un ticket; no se cargan por la API. Los movimientos son de solo alta: no se
modifican ni se eliminan.
 
| Método y ruta | Descripción | Datos |
|---|---|---|
| `POST /movimientos-stock` | Registra un movimiento manual: carga inicial o ajuste (CU-16, CU-20) | Body: `productoId`, `tipo` (`migracion_inicial` o `ajuste_manual`), `cantidad` (con signo), `usuarioId`, `motivo` |
| `GET /movimientos-stock/producto/:productoId` | Lista los movimientos de un producto, para reconstruir su trazabilidad (CU-15) | Query: `usuarioId` |
 
Notas:
 
- `motivo` es obligatorio cuando el tipo es `ajuste_manual`.
- `cantidad` es positiva para sumar stock y negativa para restarlo. Un movimiento que dejaría el
  stock en negativo es rechazado (RNF-08).
Campos de un movimiento: `productoId`, `tipo`, `cantidad`, `usuarioId`, `fecha`, `ticketId`
(solo en descuentos y reintegros) y `motivo`.
 
## 5. Usuarios
 
| Método y ruta | Descripción | Datos |
|---|---|---|
| `POST /users` | Crea un usuario (CU-17) | Body: `nombre`, `email`, `password` (mínimo 6 caracteres), `rol` |
| `GET /users` | Lista los usuarios | — |
| `GET /users/:id` | Devuelve un usuario | — |
| `PATCH /users/:id` | Modifica los datos de un usuario o lo reactiva | Body: cualquiera de los campos del alta, o `activo` |
| `DELETE /users/:id` | Inactiva un usuario (`activo = false`); no lo elimina (RF-04) | — |
 
La contraseña se guarda con hash (bcrypt) y nunca se devuelve en las respuestas (RF-03).
`rol` toma uno de los valores del enum `Role` (vendedor, administración o depósito).
 
## 6. Previsto, todavía no implementado
 
| Funcionalidad | Requerimiento | Ruta prevista |
|---|---|---|
| Login con email y contraseña, con JWT y roles | RF-01, RF-02, RNF-03 | `POST /auth/login` |
| Editar un ticket | RF-16 | `PATCH /tickets/:id` |
| Comentarios de avance | RF-17 | Ruta a definir |
| Modificar el precio de un producto | RF-18 | `PATCH /productos/:id` |
| Importación masiva del stock inicial desde planilla | RF-12 | Ruta a definir |
| Listado general de movimientos de stock | RF-14 | `GET /movimientos-stock` |
 
