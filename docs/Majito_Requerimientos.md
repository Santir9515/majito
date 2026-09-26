# Majito – Requerimientos Funcionales y No Funcionales
**Trabajo Final Integrador – 2.ª entrega**
 
## 0. Cambios en esta revisión
 
A partir de la revisión del tutor de la cátedra se incorporaron 4 ajustes: se detallan las transiciones válidas del ticket (antes RF-05), se agrega un requerimiento de auditoría de movimientos de stock, se agrega un requerimiento de inactivación de usuarios, y se reformula RNF-08 en términos de objetivo en vez de solución técnica. Como esto sumó 2 RF nuevos, se renumeró toda la lista para mantenerla correlativa:
 
| RF anterior | RF actual |
|---|---|
| RF-01 a RF-03 | sin cambios |
| — | RF-04 (nuevo: inactivación de usuarios) |
| RF-04 a RF-09 | RF-05 a RF-10 |
| RF-10 a RF-12 | RF-11 a RF-13 |
| — | RF-14 (nuevo: auditoría de movimientos de stock) |
 
## 1. Requerimientos funcionales
 
### Autenticación y usuarios
- **RF-01:** El sistema debe permitir el login de usuarios mediante email y contraseña.
- **RF-02:** El sistema debe reconocer 3 roles (vendedor, administración, depósito), cada uno con permisos y vistas diferenciadas.
- **RF-03:** Las contraseñas deben almacenarse hasheadas, nunca en texto plano ni expuestas por la API.
- **RF-04:** El sistema debe permitir inactivar un usuario (campo `activo = false`) en lugar de eliminarlo, impidiendo su login pero preservando el historial de acciones que ya haya registrado.
### Gestión de pedidos (tickets)
- **RF-05:** El sistema debe permitir crear un ticket con cliente, uno o más ítems (producto y cantidad) y notas opcionales.
- **RF-06:** El sistema debe permitir hacer avanzar un ticket únicamente por las siguientes transiciones, respetando qué rol puede disparar cada una:
  - creado → en_revision
  - en_revision → en_preparacion
  - en_preparacion → listo_para_facturar
  - listo_para_facturar → facturado
  - facturado → entregado
  - entregado → cerrado
  Las transiciones hacia "anulado" (RF-07) y "rechazado" (RF-08) no forman parte de este flujo lineal y se rigen por las condiciones propias de cada una.
- **RF-07:** El sistema debe permitir anular un ticket en cualquier estado hasta "facturado" inclusive, con motivo obligatorio.
- **RF-08:** El sistema debe permitir rechazar un ticket en cualquier estado anterior a "facturado" (por falta de stock o diferencia detectada en depósito), con motivo obligatorio, y vincular el ticket de reemplazo al original.
- **RF-09:** El sistema debe registrar un historial de cada cambio de estado, indicando quién lo hizo y cuándo.
- **RF-10:** El sistema no debe permitir facturar un ticket que no llegó al estado "listo para facturar".
### Stock
- **RF-11:** El sistema debe permitir consultar el stock disponible de un producto al momento de crear o revisar un ticket.
- **RF-12:** El sistema debe cargar el stock inicial mediante una migración desde una planilla exportada de Tango Gestión.
- **RF-13:** A partir de la migración, el stock debe gestionarse exclusivamente desde Majito.
- **RF-14:** El sistema debe registrar cada movimiento de stock (producto, cantidad, tipo de movimiento — `migracion_inicial`, `descuento_facturacion` o `ajuste_manual` —, usuario que lo generó, ticket asociado cuando corresponda, y fecha), de forma que sea posible reconstruir la trazabilidad del stock de un producto.
## 2. Requerimientos no funcionales
 
### Usabilidad
- **RNF-01:** La interfaz debe ser una aplicación web responsiva, utilizable desde PC (administración), tablet (vendedor viajante) y tablet/celular (depósito), sin necesidad de instalación.
- **RNF-02:** Las pantallas de depósito y vendedor deben priorizar controles simples y legibles, dado su uso en movimiento o fuera de oficina.
### Seguridad
- **RNF-03:** El acceso a cada funcionalidad debe estar restringido según el rol del usuario autenticado.
- **RNF-04:** Las contraseñas deben protegerse con hash (bcrypt) y las comunicaciones con el backend deben viajar sobre HTTPS en producción.
### Disponibilidad y despliegue
- **RNF-05:** El sistema debe estar desplegado en servicios en la nube (frontend en Vercel, backend en Render, base de datos en MongoDB Atlas), cumpliendo el requisito de la cátedra de tener al menos un componente accesible online.
### Mantenibilidad
- **RNF-06:** El código debe organizarse en módulos independientes (usuarios, tickets, productos), cada uno con su propio esquema, servicio y controlador, para facilitar el mantenimiento y la incorporación de funcionalidades futuras (por ejemplo, manejo de devoluciones o reportes).
- **RNF-07:** Todo el desarrollo debe versionarse en un repositorio único de GitHub, con ramas por funcionalidad y Pull Requests como mecanismo de integración a la rama principal.
### Integridad de datos
- **RNF-08:** El sistema debe garantizar la consistencia del stock ante operaciones concurrentes (por ejemplo, dos tickets afectando el mismo producto al mismo tiempo). La solución técnica elegida para cumplir este requerimiento (transacciones explícitas a nivel de aplicación, dado que la base de datos no es relacional) se detalla en el diseño técnico del sistema.