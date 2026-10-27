# Majito – Casos de Uso e Historias de Usuario
**Sistema de gestión de pedidos por tickets — Cerámica Maja SRL**

Este documento se basa en las *Reglas de Negocio* vigentes (estados, roles, matriz de permisos, stock y precios).

## 1. Actores

| Actor | Descripción |
|---|---|
| Vendedor | Vendedor viajante. Carga pedidos desde tablet durante la visita al cliente. |
| Depósito | Prepara físicamente los pedidos y registra su avance (tablet o celular). |
| Administración | Encargado autorizado por gerencia. Opera el día a día como cualquier rol y es el único que anula pedidos, maneja stock, usuarios y precios de catálogo. |

> Administración puede realizar cualquier acción de los otros roles. En cada caso de uso se indica el actor principal; donde figura "Administración" como alternativa, es porque la matriz de permisos se lo permite.

## 2. Listado de casos de uso

| Código | Caso de uso | Actores |
|---|---|---|
| CU-01 | Iniciar sesión | Todos |
| CU-02 | Crear pedido | Vendedor, Administración |
| CU-03 | Editar pedido | Vendedor (solo en Creado), Administración (hasta Listo para facturar) |
| CU-04 | Revisar pedido (Creado → En Revisión) | Administración |
| CU-05 | Iniciar preparación (En Revisión → En preparación) | Depósito, Administración |
| CU-06 | Marcar pedido listo para facturar | Depósito, Administración |
| CU-07 | Facturar pedido | Administración |
| CU-08 | Registrar entrega | Depósito, Administración |
| CU-09 | Cerrar pedido | Administración |
| CU-10 | Agregar comentario de avance | Depósito, Administración |
| CU-11 | Rechazar pedido | Depósito, Administración |
| CU-12 | Crear ticket de reemplazo | Vendedor, Administración |
| CU-13 | Anular pedido | Administración |
| CU-14 | Consultar catálogo y stock | Todos |
| CU-15 | Ver movimientos de stock | Administración |
| CU-16 | Ajustar stock manualmente | Administración |
| CU-17 | Gestionar usuarios | Administración |
| CU-18 | Gestionar precios de catálogo | Administración |
| CU-19 | Consultar pedido e historial | Todos (ver nota en sección 5) |
| CU-20 | Cargar stock inicial | Administración |

## 3. Detalle de casos de uso

### CU-01 – Iniciar sesión
- **Actor:** cualquier usuario activo.
- **Flujo principal:** el usuario ingresa sus credenciales → el sistema las valida → el sistema muestra las pantallas y acciones que corresponden a su rol.
- **Alternativo:** credenciales inválidas o usuario inactivo → el sistema rechaza el acceso con un mensaje.

### CU-02 – Crear pedido
- **Actor:** Vendedor, Administración.
- **Precondición:** sesión iniciada.
- **Flujo principal:** el actor ingresa cliente, uno o más ítems (producto y cantidad) y, opcionalmente, notas libres (ej.: "pago por adelantado") → el sistema valida los datos obligatorios → copia nombre y código de cada producto desde el catálogo → crea el pedido en estado **Creado** y registra en el historial quién lo creó y cuándo.
- **Regla:** el nombre y el código del producto quedan fijos en el ítem; si el catálogo cambia después, el pedido conserva los datos originales. El pedido no maneja precios por ítem: el precio de referencia es el de catálogo, y los descuentos o precios especiales se aplican en la facturación, fuera del alcance de Majito.
- **Alternativo:** falta cliente, producto o cantidad → el sistema no crea el pedido e indica qué falta.
- **Postcondición:** pedido en estado Creado.

### CU-03 – Editar pedido
- **Actor:** Vendedor (solo mientras está en Creado), Administración (hasta Listo para facturar inclusive).
- **Flujo principal:** el actor modifica cliente, ítems, cantidades o notas → el sistema valida y guarda.
- **Alternativo:** un Vendedor intenta editar un pedido que ya no está en Creado → el sistema lo impide.
- **Alternativo:** Administración intenta editar un pedido que ya pasó de Listo para facturar → el sistema lo impide; la corrección se hace anulando el pedido (que reintegra el stock si estaba Facturado) y creando uno nuevo.
- **Regla:** Depósito nunca modifica cliente, producto ni cantidad.

### CU-04 – Revisar pedido (Creado → En Revisión)
- **Actor:** Administración.
- **Precondición:** pedido en Creado.
- **Flujo principal:** Administración confirma stock, precio y cantidades → pasa el pedido a **En Revisión** → el sistema registra el cambio en el historial.
- **Alternativo:** el stock no alcanza → Administración rechaza el pedido (CU-11).

### CU-05 – Iniciar preparación (En Revisión → En preparación)
- **Actor:** Depósito, Administración.
- **Precondición:** pedido en En Revisión.
- **Flujo principal:** el actor pasa el pedido a **En preparación** y el sistema registra el cambio.
- **Regla:** desde que el pedido sale de Creado, el Vendedor ya no puede modificarlo.

### CU-06 – Marcar pedido listo para facturar
- **Actor:** Depósito, Administración.
- **Precondición:** pedido En preparación.
- **Flujo principal:** el actor confirma que el pedido está armado → el sistema lo pasa a **Listo para facturar**.
- **Alternativo:** el depósito detecta una diferencia física respecto de lo cargado → rechaza el pedido (CU-11).

### CU-07 – Facturar pedido
- **Actor:** Administración.
- **Precondición:** pedido en Listo para facturar.
- **Flujo principal:** Administración emite la factura y el remito en Tango (fuera de Majito) y marca el pedido como **Facturado**, que indica que esos comprobantes ya se emitieron legalmente → el sistema **descuenta el stock automáticamente** y registra los movimientos de stock.
- **Alternativo:** el pedido no está en Listo para facturar, o ya está Facturado, Anulado o Rechazado → el sistema no permite facturar.
- **Alternativo:** algún producto no tiene stock suficiente → el sistema no factura, informa cuál falta y el pedido queda en Listo para facturar.

### CU-08 – Registrar entrega
- **Actor:** Depósito, Administración.
- **Precondición:** pedido Facturado.
- **Flujo principal:** el actor registra que el pedido fue entregado → estado **Entregado**.

### CU-09 – Cerrar pedido
- **Actor:** Administración.
- **Precondición:** pedido Entregado.
- **Flujo principal:** Administración cierra el ciclo → estado **Cerrado**.
- **Nota:** desde Entregado o Cerrado ya no se anula ni se rechaza; cualquier problema posterior se maneja con "Manejo de Devoluciones" (extensión a futuro).

### CU-10 – Agregar comentario de avance
- **Actor:** Depósito, Administración.
- **Flujo principal:** el actor escribe un comentario sobre un pedido en curso → el sistema lo guarda asociado al pedido, con autor y fecha.

### CU-11 – Rechazar pedido
- **Actor:** Depósito, Administración.
- **Precondición:** pedido en cualquier estado hasta Listo para facturar inclusive.
- **Flujo principal:** el actor indica el **motivo** (falta de stock o diferencia física) → el sistema pasa el pedido a **Rechazado**, que queda como registro y solo puede pasar a Anulado si no tiene reemplazos.
- **Alternativo:** no se ingresa motivo → el sistema no permite rechazar.
- **Postcondición:** el pedido puede tener uno o más tickets de reemplazo vinculados (CU-12). El stock no se modifica.

### CU-12 – Crear ticket de reemplazo
- **Actor:** Vendedor, Administración.
- **Precondición:** pedido en estado Rechazado.
- **Flujo principal:** el actor crea un nuevo pedido a partir del rechazado (por ejemplo, un desglose) → el sistema crea el ticket nuevo en Creado y lo vincula con el original **en ambos sentidos**.
- **Variante:** un mismo pedido rechazado puede tener varios reemplazos.

### CU-13 – Anular pedido
- **Actor:** Administración (único rol autorizado).
- **Precondición:** pedido entre Creado y Facturado inclusive, o pedido Rechazado **sin** reemplazos.
- **Flujo principal:** Administración indica el **motivo** obligatorio → el sistema pasa el pedido a **Anulado**.
- **Variante:** si el pedido estaba Facturado, el sistema **reintegra el stock automáticamente** y lo registra como movimiento `reintegro_anulacion`. En los demás casos el stock no cambia.
- **Regla (pedido Facturado):** Majito anula el pedido, pero no la factura. La nota de crédito la emite Administración por separado, en Tango. Si la mercadería ya salió a reparto, se espera a que vuelva al depósito antes de emitir la nota de crédito y anular el pedido en Majito; como el sistema no tiene un estado de reparto, Administración verifica esta condición antes de anular.
- **Alternativo:** pedido Entregado o Cerrado, o Rechazado con reemplazos → el sistema no permite anular.

### CU-14 – Consultar catálogo y stock
- **Actor:** todos los roles.
- **Flujo principal:** el actor busca o lista productos y ve su información y stock disponible.

### CU-15 – Ver movimientos de stock
- **Actor:** Administración.
- **Flujo principal:** Administración lista los movimientos de stock (migración inicial, ajustes manuales, descuentos por facturación y reintegros por anulación) con fecha, responsable y, cuando corresponde, el pedido asociado.

### CU-16 – Ajustar stock manualmente
- **Actor:** Administración.
- **Flujo principal:** Administración ingresa el ajuste y su motivo → el sistema actualiza el stock y registra el movimiento.
- **Alternativo:** el ajuste dejaría el stock negativo → el sistema no lo permite.

### CU-17 – Gestionar usuarios
- **Actor:** Administración.
- **Flujo principal:** Administración da de alta un usuario con su rol (Vendedor, Depósito o Administración) o lo inactiva.
- **Regla:** un usuario inactivo no puede iniciar sesión.

### CU-18 – Gestionar precios de catálogo
- **Actor:** Administración.
- **Flujo principal:** Administración carga o edita el precio de catálogo de un producto.
- **Regla:** solo Administración puede modificar precios de catálogo. El precio final de cada operación, con descuentos o promociones, lo define la facturación, fuera de Majito.

### CU-19 – Consultar pedido e historial
- **Actor:** todos los roles.
- **Flujo principal:** el actor abre un pedido y ve sus datos, su estado actual y el historial completo de cambios (quién, cuándo, qué, y motivo cuando corresponde).

### CU-20 – Cargar stock inicial
- **Actor:** Administración.
- **Precondición:** el producto existe en el catálogo y no tiene una carga inicial previa.
- **Flujo principal:** Administración ingresa la cantidad inicial de un producto, tomada de la planilla exportada de Tango → el sistema suma esa cantidad al stock y registra un movimiento de tipo `migracion_inicial`.
- **Alternativo:** la cantidad no es positiva, o el producto ya tiene una carga inicial → el sistema no lo permite.

## 4. Historias de usuario

Formato: **Como** [rol] **quiero** [acción] **para** [beneficio]. Cada historia incluye criterios de aceptación.

### Pedidos

**HU-01 – Cargar un pedido** (CU-02)
Como **vendedor** quiero cargar un pedido desde mi tablet durante la visita para que no se pierdan detalles en papel o WhatsApp.
- El nombre y el código del producto se toman del catálogo al crear el pedido.
- Puedo agregar una nota libre.
- El pedido queda en estado Creado con mi usuario y la fecha en el historial.

**HU-02 – Corregir un pedido antes de que se procese** (CU-03)
Como **vendedor** quiero editar mi pedido mientras está en Creado para corregir errores antes de que avance.
- Puedo editar solo si el estado es Creado.
- Si ya avanzó, el sistema me lo impide.

**HU-03 – Revisar stock y precio** (CU-04)
Como **administración** quiero confirmar stock, precio y cantidades antes de mandar el pedido a preparación para no prometer lo que no hay.
- Puedo pasar el pedido de Creado a En Revisión.
- Si el stock no alcanza, puedo rechazarlo con motivo.

**HU-04 – Preparar un pedido** (CU-05, CU-06, CU-10)
Como **depósito** quiero ver los pedidos a preparar y actualizar su estado para que Administración sepa en qué punto está cada uno.
- Puedo pasar de En Revisión a En preparación, y de ahí a Listo para facturar.
- Puedo agregar comentarios de avance.
- No puedo modificar cliente, producto ni cantidad.

**HU-05 – Avisar una diferencia física** (CU-11)
Como **depósito** quiero rechazar un pedido cuando lo que hay no coincide con lo cargado para evitar facturar algo incorrecto.
- Puedo rechazar hasta Listo para facturar inclusive.
- El motivo es obligatorio.

**HU-06 – Facturar** (CU-07)
Como **administración** quiero marcar un pedido como Facturado para que el stock se descuente solo.
- Solo puedo facturar pedidos en Listo para facturar.
- Al facturar, el stock se descuenta automáticamente y queda un movimiento registrado.
- Si algún producto no tiene stock suficiente, el sistema no factura e indica cuál falta.

**HU-07 – Seguir el pedido hasta el final** (CU-08, CU-09)
Como **depósito** quiero registrar la entrega, y como **administración** quiero cerrar el pedido, para dejar completo el ciclo.
- Facturado → Entregado lo puedo hacer como depósito o administración.
- Entregado → Cerrado solo lo hace administración.

**HU-08 – Reingresar un pedido rechazado** (CU-12)
Como **vendedor** quiero crear un pedido de reemplazo a partir de uno rechazado para que el cliente pueda recibir lo que sí se puede cumplir.
- El nuevo ticket queda vinculado con el original en ambos sentidos.
- Un pedido rechazado puede tener varios reemplazos.

**HU-09 – Anular un pedido** (CU-13)
Como **administración** quiero anular un pedido por una excepción para que no quede activo algo que ya no corresponde.
- Solo administración puede anular.
- El motivo es obligatorio.
- Si el pedido estaba Facturado, el stock se reintegra automáticamente.
- Si estaba Facturado, la nota de crédito la emito aparte en Tango: Majito no anula la factura.
- Si la mercadería ya salió a reparto, espero a que vuelva al depósito antes de emitir la nota de crédito y anular en Majito.
- No puedo anular pedidos Entregados o Cerrados, ni Rechazados con reemplazos.

**HU-10 – Ver la trazabilidad** (CU-19)
Como **usuario del sistema** quiero ver el historial completo de un pedido para saber quién hizo qué y cuándo.
- Cada cambio de estado muestra usuario, fecha y, si corresponde, motivo.

### Stock, precios y usuarios

**HU-11 – Consultar stock** (CU-14)
Como **vendedor** quiero consultar el catálogo y el stock desde la tablet para saber qué puedo ofrecer al cliente.
- Veo los productos y su stock disponible.

**HU-12 – Controlar los movimientos de stock** (CU-15, CU-16, CU-20)
Como **administración** quiero ver los movimientos y hacer ajustes manuales para mantener el stock correcto.
- Veo cada movimiento con fecha y responsable.
- Un ajuste manual requiere motivo y queda registrado.
- Puedo cargar el stock inicial de un producto una sola vez.

**HU-13 – Mantener los precios de catálogo** (CU-18)
Como **administración** quiero cargar y editar los precios de catálogo para tener un precio de referencia actualizado.
- Solo administración puede modificar el precio de catálogo.
- Los descuentos y promociones no se cargan en Majito: se aplican en la facturación.

**HU-14 – Administrar usuarios** (CU-17)
Como **administración** quiero dar de alta e inactivar usuarios con su rol para controlar quién accede al sistema.
- Cada usuario tiene uno de los 3 roles.
- Un usuario inactivo no puede iniciar sesión.

**HU-15 – Entrar al sistema** (CU-01)
Como **usuario** quiero iniciar sesión para ver solo lo que corresponde a mi rol.
- Con credenciales válidas ingreso y veo solo las pantallas y acciones de mi rol.
- Con credenciales inválidas, o si mi usuario está inactivo, el sistema no me deja entrar y me muestra un mensaje.

## 5. Decisiones de diseño

1. **Precio.** El precio es el de catálogo (campo `precio` del producto) y solo Administración lo modifica. El pedido no guarda ni permite modificar precios por ítem. Los descuentos y precios promocionales se aplican en la facturación, fuera del alcance de Majito.
2. **Edición del Vendedor.** El Vendedor solo puede modificar un pedido mientras está en "Creado".
3. **Consulta de pedidos (CU-19).** Todos los roles pueden consultar pedidos e historial.
4. **Edición de Administración.** Administración puede modificar un pedido hasta Listo para facturar inclusive; una vez facturado, la corrección es anular y crear un pedido nuevo.