# Majito

Sistema interno de gestión de pedidos por tickets para **Cerámica Maja SRL**, desarrollado como Trabajo Final Integrador de la Tecnicatura Universitaria en Programación.

## 1. Problema

Cerámica Maja SRL gestiona sus pedidos de forma manual y fragmentada. Un cliente puede realizar un pedido de dos maneras: a través de un vendedor viajante que lo visita, o enviando un mensaje directamente a administración. A partir de ahí, el pedido recorre un circuito informal: administración revisa stock, acuerda precio y cantidades, y traslada la información a depósito, que prepara el pedido y finalmente lo deriva a facturación.

Este circuito se sostiene hoy por canales no estructurados —papel, WhatsApp y comunicación oral entre áreas— lo que provoca pérdida de detalles de pedidos, demoras por mala comunicación entre sectores, y ausencia de un registro trazable del estado de cada pedido.

## 2. Objetivo

Desarrollar un sistema interno de gestión de pedidos basado en tickets, que digitalice y ordene el circuito actual (recepción del pedido → revisión de stock y precio en administración → preparación en depósito → facturación), garantizando trazabilidad y reduciendo la dependencia de canales informales.

## 3. Alcance (MVP)

Sistema de uso interno (vendedores, administración y depósito), sin portal para el cliente final en esta primera instancia:

- Carga de pedidos por administración (originados por vendedor viajante o consulta directa del cliente).
- Gestión de tickets con estados (creado → en revisión → en preparación → listo para facturar → cerrado) e historial de cambios.
- Consulta de stock, precios y cantidades al acordar el pedido.
- Panel de depósito para actualizar el estado de los pedidos en preparación.
- Gestión de usuarios por rol.
- Migración del control de stock desde Tango Gestión hacia la base de datos propia, pasando a ser esta última la fuente de verdad a partir de la migración.

## 4. Modalidad de implementación

El sistema se desarrolla como una **aplicación web responsiva**, accesible desde el navegador en distintos dispositivos según el contexto de uso de cada rol:

- **Administración:** PC de escritorio en oficina.
- **Vendedor viajante:** tablet provista por la empresa, durante la visita al cliente.
- **Depósito:** tablet o celular, durante la preparación del pedido en el depósito.

Se optó por una única aplicación web adaptable (responsive) en lugar de aplicaciones nativas independientes, dado que ningún rol requiere funcionalidades exclusivas de dispositivo (cámara, GPS, notificaciones push), y este enfoque permite mantener un solo código base para los tres contextos de uso, dentro del tiempo disponible para el proyecto.

## 5. Justificación del proyecto

La implementación de Majito se justifica por el impacto directo en la eficiencia operativa de Cerámica Maja SRL, transformando un circuito informal en un proceso auditable y trazable. Al centralizar la operación, se identifican cuellos de botella y se asignan responsabilidades claras en cada etapa del ticket.

Desde el punto de vista técnico, el proyecto adopta un stack moderno que equilibra flexibilidad y robustez. La combinación de React y NestJS permite un desarrollo modular, facilitando el mantenimiento y futuras extensiones (como un eventual portal de clientes). La elección de MongoDB es estratégica: permite representar el historial dinámico y variable de los tickets sin las rigideces de un esquema relacional. Los riesgos de consistencia en operaciones críticas (como el descuento de stock) se resuelven mediante transacciones explícitas a nivel de aplicación.

## 6. Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | React + TypeScript |
| Backend | Node.js + NestJS |
| Base de datos | MongoDB (MongoDB Atlas) |
| Despliegue | Vercel (frontend) · Render (backend) · MongoDB Atlas (DB) |
| Control de versiones | GitHub |

## 7. Integrantes y plan de trabajo

| Integrante | Responsabilidad principal |
|---|---|
| Santiago Rodríguez | Arquitectura backend (NestJS), modelado de la base en MongoDB, desarrollo de la API y de la lógica de negocio (flujo de estados del ticket, validaciones de stock). |
| Maximiliano Yamil Rojas | Desarrollo del frontend en React, relevamiento y validación de reglas de negocio con Cerámica Maja SRL (estados del ticket, permisos por rol, casos particulares del proceso). |

Ambos integrantes participan en la definición conjunta del modelo de datos y las decisiones de arquitectura antes de la 2.ª entrega (esquema de base de datos y listado de módulos, con vencimiento 27/09).

## Estructura del repositorio
| /Majito |
| |----frontend/ #Aplicacion React |
| |----backend/ #API NestJS |
| |----docs/ #Informes y entregas |


## Instalación

### Backend
\`\`\`bash
cd backend
npm install
npm run start:dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
