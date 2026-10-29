# Majito — Frontend
 
Aplicación web de Majito, desarrollada con React, TypeScript y Vite. Es responsiva,
para usarse desde PC (Administración), tablet (Vendedor) y tablet o celular (Depósito).
 
## Requisitos
 
- Node.js 22 (LTS)
## Puesta en marcha
 
```bash
npm install
npm run dev
```
 
La aplicación queda disponible en la dirección que muestra Vite en la consola
(por defecto, `http://localhost:5173`).
 
## Estructura
 
```
src/
├── context/    # Usuario actual (rol) disponible para toda la aplicación
├── layouts/    # Layout y navegación, con opciones visibles según el rol
├── pages/      # Pantallas
├── routes/     # Definición de rutas
├── services/   # Acceso a datos (pedidos y productos)
│   └── mock/   # Datos de ejemplo
├── types/      # Tipos del dominio, alineados con la API del backend
├── hooks/      # Hooks propios
└── utils/      # Utilidades
```
 
## Estado actual
 
Los servicios de pedidos y productos funcionan hoy con datos de ejemplo (`services/mock`).
La conexión con la API del backend está en curso: las pantallas no cambian, solo el interior
de los servicios. Las rutas del backend están descriptas en `backend/README.md`.
 