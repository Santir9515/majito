# Majito – Reglas de Negocio
**Sistema de gestión de pedidos por tickets — Cerámica Maja SRL**

## 1. Estados del pedido

El pedido avanza en general en este orden, con historial de cambios (quién, cuándo, qué) para trazabilidad. Se permiten excepciones válidas al orden general (ver sección 3).

| Estado | Quién lo dispara | Descripción |
|---|---|---|
| Recibido | Vendedor / Administración | Pedido cargado con cliente, material y cantidad. |
| En Revisión | Administración | Se confirma stock, precio y cantidades. Si el stock no alcanza se rechaza. |
| En preparación | Depósito | Depósito arma físicamente el pedido. |
| Listo para facturar | Depósito | Pedido armado y listo para facturación. |
| Facturado | Administración | Se generan factura y remito. |
| Entregado | Depósito | Pedido entregado al cliente. |
| Cerrado | Administración | Ciclo del pedido finalizado. |
| Anulado | Admin | Excepción — ver sección 3. |
| Rechazado | Administración / Depósito | Excepción por falta de stock o diferencia detectada. El ticket de reemplazo queda vinculado al rechazado. |

## 2. Reglas por rol

### 2.1 Vendedor
- Crea pedidos: cliente, material y cantidad son obligatorios; notas libres opcionales (ej.: "pago por adelantado").
- Puede editar el pedido mientras esté en estado "Recibido".
- No puede modificarlo una vez que pasó a "En preparación".

### 2.2 Depósito
- Mueve el pedido entre los estados En Revisión → En preparación → Listo para facturar.
- Agrega comentarios de avance.
- No modifica cliente, material ni cantidad.
- Puede rechazar el pedido si detecta una diferencia física respecto a lo cargado (ver sección 3).

### 2.3 Administración
- Opera el día a día como cualquier otro rol.
- Además, maneja las excepciones detalladas en la sección 3.
- Solo ve pedidos en estado "Listo para facturar".
- Genera factura y remito, lo cual dispara el estado "Facturado".
- No puede facturar un pedido que no llegó a "Listo para facturar".

## 3. Rol de Admin (detalle)

Ocupado por un encargado o responsable autorizado por gerencia (no necesariamente el dueño ni alguien técnico). Puede operar como cualquier rol en el día a día, además de resolver estas excepciones:

| Acción | Cuándo aplica | Qué dispara |
|---|---|---|
| Anular pedido | Antes de facturar. | Requiere motivo obligatorio. |
| Rechazar pedido | Antes de facturar, por falta de stock o diferencia física. | Requiere motivo obligatorio. El pedido rechazado queda como registro final, y el ticket de reemplazo (si se crea) queda vinculado a él en ambos sentidos. |
| Manejo de Devoluciones (extensión a futuro) | Pedido ya facturado (posterior a la factura). | No anula el pedido original: registra la devolución como hecho separado, sin borrar el historial. |

El sistema debe distinguir automáticamente cuál de las acciones ofrecer, según el estado en que se encuentre el pedido.

## 4. Validaciones generales

- Cliente, material y cantidad son obligatorios para crear un pedido.
- Un pedido no puede volver a facturarse si ya está "Facturado", "Anulado" o "Rechazado".
- Todo cambio de estado queda registrado con quién lo hizo y cuándo (trazabilidad).

---
*Trabajo Final Integrador — Tecnicatura Universitaria en Programación (UTN)*