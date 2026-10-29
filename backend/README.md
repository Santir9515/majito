# Majito — Backend

API REST de Majito, desarrollada con NestJS y MongoDB (Mongoose).

## Requisitos

- Node.js 22 (LTS)
- Una base MongoDB (MongoDB Atlas)

## Puesta en marcha

```bash
cp .env.example .env   # completar MONGODB_URI
npm install
npm run start:dev
```

La API queda en `http://localhost:3000`. Si estás usando Atlas, la IP de tu equipo
tiene que estar autorizada en *Network Access*.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | Cadena de conexión a MongoDB |

## Módulos

`usuarios`, `productos`, `tickets` y `movimientos-stock`. Cada uno tiene su schema,
servicio y controlador.

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/tickets` | Crear un ticket |
| `GET` | `/tickets?estado=` | Listar tickets, con filtro opcional por uno o más estados separados por coma |
| `GET` | `/tickets/:id` | Detalle de un ticket |
| `PATCH` | `/tickets/:id/avanzar` | Avanzar al siguiente estado |
| `PATCH` | `/tickets/:id/anular` | Anular (solo Administración, con motivo) |
| `PATCH` | `/tickets/:id/rechazar` | Rechazar (con motivo) |
| `POST` | `/tickets/:id/reemplazo` | Crear un ticket de reemplazo de un rechazado |
| `GET` | `/productos`, `/productos/:id` | Consultar productos |
| `POST` | `/movimientos-stock` | Movimiento manual de stock (solo Administración) |
| `GET` | `/movimientos-stock/producto/:productoId` | Historial de movimientos de un producto |

## Stock

El stock no se reserva: se descuenta al pasar un ticket a *facturado* y se reintegra
al anular uno facturado. Cada cambio queda registrado en `movimientos_stock`.
Las reglas completas están en `docs/Majito_Reglas_de_Negocio.md`.

## Estado actual

Mientras no esté implementado el login, el usuario que realiza cada acción se envía
como `usuarioId` en el cuerpo (o en la query) de la solicitud.
