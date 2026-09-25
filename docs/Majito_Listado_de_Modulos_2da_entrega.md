# Majito – Listado de Módulos

**Trabajo Final Integrador – 2.ª entrega**

**Equipo:** Santiago Rodríguez (backend/arquitectura) y Maximiliano Rojas (frontend/relevamiento)

## 1. Contexto

Majito es el sistema interno de gestión de pedidos por tickets para Cerámica Maja SRL, que digitaliza el circuito actual (recepción del pedido → revisión de stock y precio → preparación en depósito → facturación), dando trazabilidad a cada pedido.

Este listado de módulos, junto con el esquema de base de datos, corresponde a la 2.ª entrega del proyecto y actualiza la propuesta original (agosto 2026) con los cambios acordados con el tutor desde entonces, incluyendo las mejoras sugeridas en la revisión de esta entrega (ver sección 3).

## 2. Evolución respecto a la propuesta original

| Aspecto | Propuesta original (ago. 2026) | Versión actual |
|---|---|---|
| Estados del pedido | 5 estados (creado, en revisión, en preparación, listo para facturar, cerrado) | 9 estados (creado, en_revision, en_preparacion, listo_para_facturar, facturado, entregado, cerrado, anulado, rechazado) |
| Roles | 5 (vendedor, administración, depósito, facturación, logística) | 3 (Vendedor, Administración, Depósito) |
| Stock | Migración completa del stock a Majito; Tango queda como registro histórico | Confirmado: se mantiene la migración completa. Majito pasa a ser la única fuente de verdad del stock a partir de la migración inicial desde Tango. Se evaluó un modelo alternativo de reserva/comprometido con Tango como verdad física, pero se descartó por la complejidad adicional que agregaba sin necesidad, dado el tiempo disponible para el proyecto. |
| Módulos | Stock y productos mencionados solo en el esquema de datos, sin módulo funcional propio; historial descripto como característica de Pedidos | Catálogo de Productos e Inventario se separan como módulos propios; Historial pasa a describirse como capacidad transversal del sistema |

## 3. Listado de módulos

### 3.1 Módulo de Autenticación y Usuarios

- Login y gestión de sesión
- 3 roles: Vendedor, Administración, Depósito
- Permisos y acciones habilitadas según rol

### 3.2 Módulo de Catálogo de Productos

- Consulta y búsqueda de productos (por nombre, material, categoría)
- Detalle de producto: material, unidad de medida, precio
- Alcance de esta entrega: solo consulta. Alta, baja y modificación de productos quedan fuera de alcance (posible extensión futura, dependiendo de si la carga de catálogo sigue centralizada en Tango o pasa a gestionarse desde Majito)

### 3.3 Módulo de Inventario

- Consulta de stock disponible por producto
- Ajuste inicial: carga del stock migrado desde Tango al arrancar el sistema
- Visualización de movimientos de stock (entradas y salidas, generadas principalmente por el ciclo de vida de los pedidos)
- Es la fuente de verdad de stock consultada por el Módulo de Gestión de Pedidos; no incluye en esta entrega reposición automática ni alertas de stock mínimo

### 3.4 Módulo de Gestión de Pedidos (núcleo del sistema)

- Alta de pedido, con canal de ingreso (vendedor viajante o consulta directa del cliente)
- Consulta de stock contra el Módulo de Inventario al momento de crear/revisar el pedido
- Transición por los 9 estados del pedido, incluyendo rechazo (por falta de stock o diferencia detectada en depósito, con el ticket de reemplazo vinculado al original) y anulación (disponible hasta el estado facturado inclusive, con motivo obligatorio)
- Notas libres asociadas al pedido (ej. "pago por adelantado", "embalar en pallet")
- El seguimiento de cambios de estado del pedido se registra mediante la capacidad transversal de Historial (ver sección 4)

### 3.5 Módulo de Administración/Excepciones

- Registro de motivo de anulación (mediante el Historial del pedido correspondiente)
- Gestión del rechazo de pedidos y su vínculo con el ticket de reemplazo
- Base para la futura extensión "Manejo de Devoluciones" (pedidos ya entregados) — fuera de alcance de esta entrega

### 3.6 Módulo de Reportes/Consulta Histórica

Fuera de alcance de esta entrega. El foco de esta versión es la gestión operativa de tickets, no la analítica. Queda documentado como mejora futura para el informe final.

## 4. Capacidades transversales

### 4.1 Historial

El historial no es un módulo aislado, sino una capacidad transversal del sistema: registra quién hizo un cambio, cuándo y con qué motivo (cuando corresponde), y queda disponible para consulta desde el pedido al que pertenece.

En esta entrega aplica al ciclo de vida del pedido (cambios de estado, anulaciones, rechazos), pero está pensada para extenderse a otras entidades del sistema (por ejemplo, movimientos de inventario) a medida que el proyecto lo requiera. Se destaca como capacidad propia porque es clave para la trazabilidad que es el objetivo central de Majito, y por eso también será un punto fuerte a mostrar en la defensa.
