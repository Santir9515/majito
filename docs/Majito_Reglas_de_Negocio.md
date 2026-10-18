# Majito – Reglas de Negocio
**Sistema de gestión de pedidos por tickets — Cerámica Maja SRL**

## 1. Estados del pedido

El pedido avanza en general en este orden, con historial de cambios (quién, cuándo, qué) para trazabilidad. Se permiten excepciones válidas al orden general (ver sección 3).

| Estado | Quién lo dispara | Descripción |
|---|---|---|
| Creado | Vendedor / Administración | Pedido cargado con cliente, material y cantidad. |
| En Revisión | Administración | Se confirma stock, precio y cantidades. Si el stock no alcanza se rechaza. |
| En preparación | Depósito | Depósito arma físicamente el pedido. |
| Listo para facturar | Depósito | Pedido armado y listo para facturación. |
| Facturado | Administración | Se generan factura y remito. |
| Entregado | Depósito | Pedido entregado al cliente. |
| Cerrado | Administración | Ciclo del pedido finalizado. |
| Anulado | Administración | Excepción — ver sección 3. |
| Rechazado | Administración / Depósito | Excepción por falta de stock o diferencia detectada. Puede tener uno o más tickets de reemplazo vinculados (desglose del pedido original). |

### Tabla de equivalencias

| Estado (nombre visible) | Valor en el sistema |
|---|---|
| Creado | creado |
| En Revisión | en_revision |
| En preparación | en_preparacion |
| Listo para facturar | listo_para_facturar |
| Facturado | facturado |
| Entregado | entregado |
| Cerrado | cerrado |
| Anulado | anulado |
| Rechazado | rechazado |


## 2. Reglas por rol

### 2.1 Vendedor
- Crea pedidos: cliente, material y cantidad son obligatorios; notas libres opcionales (ej.: "pago por adelantado").
- Puede editar el pedido únicamente mientras esté en estado "Creado".
- Puede crear tickets de reemplazo de un pedido Rechazado (ver sección 3.1).

### 2.2 Depósito
- Mueve el pedido de En Revisión a En preparación, de En preparación a Listo para facturar, y de Facturado a Entregado.
- Agrega comentarios de avance.
- No modifica cliente, material ni cantidad.
- Puede rechazar el pedido si detecta una diferencia física respecto a lo cargado (ver sección 3).

### 2.3 Administración
- Opera el día a día como cualquier otro rol: puede crear pedidos, moverlos entre estados y agregar comentarios, según el detalle de la matriz de permisos (sección 5).
- Puede editar pedidos hasta Listo para facturar inclusive.
- Es quien genera la factura y el remito, lo cual dispara el paso a "Facturado".
- No puede facturar un pedido que no llegó al estado "Listo para facturar".
- Además, maneja las excepciones detalladas en la sección 3.

## 3. Rol de Admin (detalle)

Ocupado por un encargado o responsable autorizado por gerencia (no necesariamente el dueño ni alguien técnico). Puede operar como cualquier rol en el día a día, además de resolver estas excepciones:

| Acción | Cuándo aplica | Qué dispara |
|---|---|---|
| Anular pedido | Desde Creado hasta Facturado inclusive, o un pedido Rechazado que no tiene reemplazos. | Requiere motivo obligatorio. Si el pedido estaba Facturado, el stock se reintegra automáticamente (ver sección 6). |
| Rechazar pedido | Hasta Listo para facturar inclusive, por falta de stock o diferencia física. | Requiere motivo obligatorio. El pedido rechazado queda como registro final. Los tickets de reemplazo (uno o varios) quedan vinculados a él en ambos sentidos. |
| Manejo de Devoluciones (extensión a futuro) | Pedido ya facturado (posterior a la factura). | No anula el pedido original: registra la devolución como hecho separado, sin borrar el historial. |

El sistema debe distinguir automáticamente cuál de las acciones ofrecer, según el estado en que se encuentre el pedido.

## 4. Validaciones generales

- Cliente, material y cantidad son obligatorios para crear un pedido.
- Un pedido no puede volver a facturarse si ya está "Facturado", "Anulado" o "Rechazado".
- Todo cambio de estado queda registrado con quién lo hizo y cuándo (trazabilidad).

## 5. Matriz de permisos por rol

| Acción | Vendedor | Depósito | Administración |
|---|---|---|---|
| Crear pedido (estado Creado) | ✔ | — | ✔ |
| Editar cliente, producto o cantidad | ✔ solo en Creado | — | ✔ hasta Listo para facturar |
| Pasar Creado → En Revisión | — | — | ✔ |
| Pasar En Revisión → En preparación | — | ✔ | ✔ |
| Pasar En preparación → Listo para facturar | — | ✔ | ✔ |
| Pasar Listo para facturar → Facturado | — | — | ✔ |
| Pasar Facturado → Entregado | — | ✔ | ✔ |
| Pasar Entregado → Cerrado | — | — | ✔ |
| Agregar comentarios de avance | — | ✔ | ✔ |
| Rechazar pedido (hasta Listo para facturar inclusive, con motivo) | — | ✔ | ✔ |
| Crear ticket de reemplazo de un pedido Rechazado | ✔ | — | ✔ |
| Anular pedido (hasta Facturado inclusive, o Rechazado sin reemplazos, con motivo) | — | — | ✔ |
| Consultar catálogo y stock | ✔ | ✔ | ✔ |
| Ver movimientos de stock | — | — | ✔ |
| Ajuste manual de stock | — | — | ✔ |
| Alta e inactivación de usuarios | — | — | ✔ |
| Cargar o editar precios | — | — | ✔ |

Notas:
- Administración puede realizar cualquier acción de los otros roles, ya que opera el día a día como cualquier rol. La anulación es exclusiva de este rol.
- Depósito nunca modifica cliente, material ni cantidad.
- Un pedido ya facturado todavía puede anularse (hasta ese estado inclusive). Una vez entregado o cerrado, ya no se anula ni se rechaza: a partir de ahí, cualquier problema se maneja vía Manejo de Devoluciones (extensión a futuro).
- Un pedido Rechazado puede dar origen a uno o más tickets de reemplazo (por ejemplo, si se desglosa el pedido). Si no se acuerda ningún reemplazo con el cliente, el pedido Rechazado puede anularse; si ya tiene reemplazos, no.

## 6. Stock y precios

- Majito es la única fuente de verdad del stock una vez migrado desde Tango.
- El stock se descuenta automáticamente al pasar un pedido a Facturado.
- Al anular un pedido Facturado, el stock se reintegra automáticamente, de forma equivalente a una nota de crédito en Tango. Queda registrado como movimiento de tipo `reintegro_anulacion`.
- Anular o rechazar un pedido que todavía no fue facturado no modifica el stock.
- El precio de cada ítem es siempre el de catálogo al momento de crear el pedido. Solo Administración puede modificar el precio de catálogo.
- Los descuentos y las modificaciones de precio por operación se aplican en el módulo de facturación, que está fuera del alcance de Majito.