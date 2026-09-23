# Majito – Requerimientos Funcionales y No Funcionales
**Trabajo Final Integrador – 2.ª entrega**

## 1. Requerimientos funcionales

### Autenticación y usuarios
- **RF-01:** El sistema debe permitir el login de usuarios mediante email y contraseña.
- **RF-02:** El sistema debe reconocer 3 roles (vendedor, administración, depósito), cada uno con permisos y vistas diferenciadas.
- **RF-03:** Las contraseñas deben almacenarse hasheadas, nunca en texto plano ni expuestas por la API.

### Gestión de pedidos (tickets)
- **RF-04:** El sistema debe permitir crear un ticket con cliente, uno o más ítems (producto y cantidad) y notas opcionales.
- **RF-05:** El sistema debe permitir hacer avanzar un ticket por su flujo de estados (creado → en revisión → en preparación → listo para facturar → facturado → entregado → cerrado), respetando qué rol puede disparar cada transición.
- **RF-06:** El sistema debe permitir anular un ticket en cualquier estado hasta "facturado" inclusive, con motivo obligatorio.
- **RF-07:** El sistema debe permitir rechazar un ticket en cualquier estado anterior a "facturado" (por falta de stock o diferencia detectada en depósito), con motivo obligatorio, y vincular el ticket de reemplazo al original.
- **RF-08:** El sistema debe registrar un historial de cada cambio de estado, indicando quién lo hizo y cuándo.
- **RF-09:** El sistema no debe permitir facturar un ticket que no llegó al estado "listo para facturar".

### Stock
- **RF-10:** El sistema debe permitir consultar el stock disponible de un producto al momento de crear o revisar un ticket.
- **RF-11:** El sistema debe cargar el stock inicial mediante una migración desde una planilla exportada de Tango Gestión.
- **RF-12:** A partir de la migración, el stock debe gestionarse exclusivamente desde Majito.

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
- **RNF-08:** Las operaciones que afectan el stock deben resolverse mediante transacciones explícitas a nivel de aplicación, para evitar inconsistencias propias de una base de datos no relacional.
