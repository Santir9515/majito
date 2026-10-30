# Majito — Matriz de trazabilidad
 
Relaciona cada requerimiento con los casos de uso que lo cubren, con el punto de entrada del
backend y con su estado de implementación. Los requerimientos son los de
`Majito_Requerimientos.md` y los casos de uso, los de `Majito_Casos_de_Uso_e_Historias_de_Usuario.md`.
 
Estado de implementación (al 30/10/2026):
 
- **Hecho:** implementado en el backend y probado.
- **Parcial:** implementado en parte; la columna de notas dice qué falta.
- **Pendiente:** todavía no implementado.
El frontend funciona hoy con datos de ejemplo (conexión con la API en curso), por lo que el
estado se refiere al backend.
 
## 1. Requerimientos funcionales
 
| Requerimiento | Casos de uso | Backend | Estado | Notas |
|---|---|---|---|---|
| RF-01 Login con email y contraseña | CU-01 | — | Pendiente | Sin autenticación: hoy el usuario se identifica con `usuarioId` en el body o la query. Está previsto login con JWT. |
| RF-02 Tres roles con permisos y vistas diferenciadas | CU-01, CU-17 | `users`, validación de rol en `tickets` | Parcial | Las transiciones validan el rol del usuario indicado. Faltan las vistas por rol conectadas y la validación al crear un ticket. |
| RF-03 Contraseñas hasheadas, no expuestas | CU-01, CU-17 | `POST /users`, `PATCH /users/:id` | Hecho | Hash con bcrypt; `passwordHash` se excluye de todas las respuestas. |
| RF-04 Inactivar usuarios en lugar de eliminarlos | CU-17 | `DELETE /users/:id`, `PATCH /users/:id` | Hecho | `DELETE` marca `activo = false` y `PATCH` permite reactivar. Los servicios de tickets y de movimientos rechazan a los usuarios inactivos (403). El login los rechazará cuando exista (RF-01). |
| RF-05 Crear ticket con cliente, ítems y notas | CU-02 | `POST /tickets` | Hecho | |
| RF-06 Transiciones válidas por rol | CU-04, CU-05, CU-06, CU-07, CU-08, CU-09 | `PATCH /tickets/:id/avanzar` | Hecho | |
| RF-07 Anular (de creado a facturado, o rechazado sin reemplazos) | CU-13 | `PATCH /tickets/:id/anular` | Hecho | Motivo obligatorio. Al anular un facturado se reintegra el stock. |
| RF-08 Rechazar y crear reemplazos | CU-11, CU-12 | `PATCH /tickets/:id/rechazar`, `POST /tickets/:id/reemplazo` | Hecho | Reemplazos múltiples (`ticketsReemplazoIds`). |
| RF-09 Historial de cambios de estado | CU-19 | campo `historial` de `GET /tickets/:id` | Hecho | Muestra el ID del usuario; falta mostrar su nombre. |
| RF-10 No facturar un ticket que no está listo | CU-07 | `PATCH /tickets/:id/avanzar` | Hecho | |
| RF-11 Consultar stock al crear o revisar un ticket | CU-14, CU-04 | `GET /productos`, `GET /productos/:id` | Hecho | El stock es informativo, sin reserva. |
| RF-12 Carga inicial de stock desde planilla de Tango | CU-20 | `POST /movimientos-stock` (tipo `migracion_inicial`) | Parcial | Se carga producto por producto. Falta la importación masiva desde planilla. |
| RF-13 Stock gestionado solo desde Majito | CU-16, CU-20 | `POST /movimientos-stock` | Hecho | |
| RF-14 Registro de cada movimiento de stock | CU-15, CU-16, CU-20 | `POST /movimientos-stock`, `GET /movimientos-stock/producto/:productoId` | Parcial | Los movimientos se registran siempre. Falta un listado general (hoy se consulta por producto). |
| RF-15 Descontar stock al facturar, sin reserva | CU-07, CU-13 | `PATCH /tickets/:id/avanzar` | Hecho | Si un ítem no alcanza, no se factura nada. |
| RF-16 Editar cliente, ítems, cantidades y notas según rol y estado | CU-03 | — | Pendiente | Falta un endpoint de edición de tickets (por ejemplo `PATCH /tickets/:id`). |
| RF-17 Comentarios de avance con autor y fecha | CU-10 | — | Pendiente | Falta el endpoint y el campo para guardar los comentarios en el ticket. |
| RF-18 Cargar y modificar el precio de catálogo (solo Administración) | CU-18 | — | Pendiente | `productos` tiene alta y consulta, pero no `PATCH`. |
 
## 2. Requerimientos no funcionales
 
| Requerimiento | Cómo se cumple | Estado | Notas |
|---|---|---|---|
| RNF-01 Aplicación web responsiva | Frontend React + Vite | Parcial | Frontend en desarrollo. |
| RNF-02 Pantallas simples para depósito y vendedor | Frontend, vistas por rol | Parcial | Frontend en desarrollo. |
| RNF-03 Acceso restringido por rol | Validación de rol en el backend | Parcial | Depende de la autenticación (RF-01). |
| RNF-04 Hash de contraseñas y HTTPS | bcrypt en el backend; HTTPS en el despliegue | Parcial | El hash está hecho. HTTPS queda cubierto por Render y Vercel al desplegar. |
| RNF-05 Despliegue en la nube | Vercel, Render y MongoDB Atlas | Parcial | La base ya está en Atlas. Faltan el backend y el frontend. |
| RNF-06 Código en módulos independientes | Módulos `users`, `tickets`, `productos`, `movimientos-stock` | Hecho | |
| RNF-07 Repositorio único con ramas y Pull Requests | GitHub | Hecho | |
| RNF-08 Consistencia del stock ante concurrencia | Operación atómica condicionada, sin transacciones | Hecho | Verificado el 27/10/2026: con stock 1 y dos tickets, se factura exactamente uno y el stock final es 0. |
 
## 3. Verificación cruzada
 
- Todos los RF tienen al menos un caso de uso, y todos los casos de uso (CU-01 a CU-20) están cubiertos por al menos un RF.
- Los pendientes de código (autenticación, edición de tickets (RF-16), comentarios (RF-17),
  precios (RF-18), importación masiva y listado general de movimientos) son el trabajo que sigue después de cerrar la documentación.
 