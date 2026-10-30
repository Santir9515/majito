# Majito — Diagramas
 
Diagramas del sistema, escritos en Mermaid (GitHub los renderiza directamente). Los
nombres de estados, colecciones y campos coinciden con el Esquema de base de datos y con las
Reglas de Negocio.
 
1. [Estados del ticket](#1-estados-del-ticket)
2. [Modelo de datos completo (DER)](#2-modelo-de-datos-completo-der)
3. [Actividades: ciclo de vida de un pedido](#3-actividades-ciclo-de-vida-de-un-pedido)
4. [Secuencia: facturación con descuento de stock](#4-secuencia-facturación-con-descuento-de-stock)
5. [Componentes](#5-componentes)
6. [Arquitectura](#6-arquitectura)
7. [Despliegue](#7-despliegue)
## 1. Estados del ticket
 
Cada transición indica el rol que la ejecuta. La anulación es exclusiva de Administración;
el rechazo puede hacerlo Administración o Depósito.
 
```mermaid
stateDiagram-v2
    [*] --> creado
    creado --> en_revision: Administración
    en_revision --> en_preparacion: Depósito o Administración
    en_preparacion --> listo_para_facturar: Depósito o Administración
    listo_para_facturar --> facturado: Administración
    facturado --> entregado: Depósito o Administración
    entregado --> cerrado
    cerrado --> [*]
 
    creado --> rechazado
    en_revision --> rechazado
    en_preparacion --> rechazado
    listo_para_facturar --> rechazado
 
    creado --> anulado: Administración
    en_revision --> anulado
    en_preparacion --> anulado
    listo_para_facturar --> anulado
    facturado --> anulado
    rechazado --> anulado: solo si no tiene reemplazos
    anulado --> [*]
```
 
## 2. Modelo de datos completo (DER)
 
Incluye los subdocumentos `items` e `historial`, que en MongoDB se guardan embebidos dentro
de cada ticket. El Esquema de base de datos contiene la versión resumida.
 
```mermaid
erDiagram
    usuarios ||--o{ tickets : "creadoPor"
    usuarios ||--o{ historial : "usuario"
    tickets ||--|{ items : "embebe"
    tickets ||--|{ historial : "embebe"
    productos ||--o{ items : "productoId"
    tickets |o--o{ tickets : "ticketOrigenId"
    productos ||--o{ movimientos_stock : "productoId"
    usuarios ||--o{ movimientos_stock : "usuarioId"
    tickets |o--o{ movimientos_stock : "ticketId"
 
    usuarios {
        string nombre
        string email
        string passwordHash
        string rol
        boolean activo
    }
    productos {
        string codigo
        string nombre
        string categoria
        number precio
        number stockActual
        boolean activo
    }
    tickets {
        string cliente
        string estado
        string notas
        objectId creadoPor
        string motivoAnulacion
        string motivoRechazo
        objectId ticketOrigenId
        array ticketsReemplazoIds
        date createdAt
        date updatedAt
    }
    items {
        objectId productoId
        string productoNombre
        string productoCodigo
        number cantidad
    }
    historial {
        string estado
        objectId usuario
        date fecha
        string motivo
    }
    movimientos_stock {
        objectId productoId
        number cantidad
        string tipo
        objectId usuarioId
        date fecha
        objectId ticketId
        string motivo
    }
```
 
## 3. Actividades: ciclo de vida de un pedido
 
Recorrido de un pedido por las áreas, con las excepciones de rechazo y de stock insuficiente.
 
```mermaid
flowchart TD
    subgraph VA["Vendedor / Administración"]
        A(["Inicio"]) --> B["Cargar el pedido: cliente, productos y cantidades"]
        B --> C["Estado: Creado"]
    end
 
    subgraph ADM["Administración"]
        C --> D["Revisar stock disponible, precio y cantidades"]
        D --> E{"¿Se puede cumplir?"}
        E -- "No" --> R["Rechazar con motivo (Administración o Depósito)"]
        E -- "Sí" --> F["Estado: En Revisión"]
    end
 
    subgraph DEP["Depósito"]
        F --> G["Preparar el pedido"]
        G --> H{"¿Hay diferencia física?"}
        H -- "Sí" --> R
        H -- "No" --> I["Estado: Listo para facturar"]
    end
 
    subgraph ADM2["Administración"]
        I --> J["Emitir factura y remito en Tango"]
        J --> K["Marcar como Facturado"]
        K --> L{"¿Alcanza el stock de todos los ítems?"}
        L -- "No" --> M["No se factura. El pedido sigue en Listo para facturar"]
        M -- "Se repone el stock" --> J
        M -- "Se rechaza por falta de stock" --> R
        L -- "Sí" --> O["Descuento automático de stock"]
    end
 
    O --> P["Estado: Facturado"]
    P --> Q["Depósito entrega la mercadería"]
    Q --> S["Estado: Entregado"]
    S --> T["Estado: Cerrado"]
    T --> Z(["Fin"])
 
    R --> U["Estado: Rechazado"]
    U --> V{"¿El cliente acepta una alternativa?"}
    V -- "Sí" --> W["Crear uno o más tickets de reemplazo"]
    V -- "No" --> X["Anular el pedido rechazado"]
    W --> Z
    X --> Z
```
 
## 4. Secuencia: facturación con descuento de stock
 
Al pasar un ticket a Facturado, el sistema descuenta el stock ítem por ítem con una operación
atómica condicionada. Si algún ítem no alcanza, revierte lo ya descontado y no factura.
 
```mermaid
sequenceDiagram
    actor Admin as Administración
    participant Front as Frontend (React)
    participant API as Backend (NestJS)
    participant DB as MongoDB Atlas
 
    Note over Admin,Front: La factura y el remito se emiten en Tango, fuera de Majito
    Admin->>Front: Marca el ticket como Facturado
    Front->>API: PATCH /tickets/:id/avanzar
    API->>DB: Lee el ticket (estado listo_para_facturar)
    API->>API: Valida el rol y la transición
 
    loop Por cada ítem del ticket
        API->>DB: Descuenta el stock solo si stockActual alcanza
        break Stock insuficiente en algún ítem
            API->>DB: Revierte los descuentos ya aplicados
            API-->>Front: 400 Stock insuficiente (nombra el producto)
            Front-->>Admin: Muestra el error y el ticket sigue en Listo para facturar
        end
        API->>DB: Registra movimiento descuento_facturacion
    end
 
    API->>DB: Guarda el estado Facturado y el historial
    API-->>Front: Ticket actualizado
    Front-->>Admin: Muestra el ticket en Facturado
```
 
## 5. Componentes
 
Módulos del backend y capas del frontend. Los módulos del backend dependen entre sí de la
forma que indican las flechas.
 
```mermaid
flowchart LR
    subgraph FE["Frontend (React + TypeScript)"]
        PAG["pages"]
        LAY["layouts y navegación por rol"]
        RUT["routes"]
        CTX["context: usuario actual"]
        SRV["services"]
        TIP["types"]
        PAG --> SRV
        LAY --> CTX
        RUT --> PAG
        SRV --> TIP
    end
 
    subgraph BE["Backend (NestJS)"]
        TIC["Módulo tickets"]
        MOV["Módulo movimientos-stock"]
        PRO["Módulo productos"]
        USU["Módulo usuarios"]
        TIC --> MOV
        TIC --> PRO
        TIC --> USU
        MOV --> PRO
        MOV --> USU
    end
 
    DB[("MongoDB Atlas")]
 
    SRV -- "HTTP / JSON" --> TIC
    SRV -- "HTTP / JSON" --> PRO
    SRV -- "HTTP / JSON" --> MOV
    TIC --> DB
    MOV --> DB
    PRO --> DB
    USU --> DB
```
 
## 6. Arquitectura
 
Aplicación web en tres capas. Tango Gestión es un sistema externo: emite la factura, el remito
y la nota de crédito, y es el origen de la migración inicial de stock.
 
```mermaid
flowchart LR
    subgraph USR["Usuarios"]
        U1["Administración (PC)"]
        U2["Vendedor (tablet)"]
        U3["Depósito (tablet o celular)"]
    end
 
    FE["Frontend web responsivo (React + TypeScript + Vite)"]
 
    subgraph API["Backend (NestJS)"]
        CT["Controladores REST"]
        SV["Servicios: reglas de negocio"]
        SC["Schemas (Mongoose)"]
        CT --> SV --> SC
    end
 
    DB[("MongoDB Atlas")]
    TG["Tango Gestión (sistema externo)"]
 
    U1 --> FE
    U2 --> FE
    U3 --> FE
    FE -- "HTTPS / JSON" --> CT
    SC --> DB
    TG -. "migración inicial de stock (una sola vez)" .-> DB
```
 
## 7. Despliegue
 
Despliegue previsto en servicios en la nube (RNF-05). Hoy el sistema se ejecuta en forma local.
 
```mermaid
flowchart LR
    NAV["Navegador del usuario (PC, tablet o celular)"]
 
    subgraph VER["Vercel"]
        FE["Frontend: archivos estáticos (React)"]
    end
 
    subgraph REN["Render"]
        BE["Backend: servicio web (NestJS, Node.js)"]
    end
 
    subgraph ATL["MongoDB Atlas"]
        DB[("Base de datos: usuarios, productos, tickets, movimientos_stock")]
    end
 
    GH["GitHub: repositorio"]
 
    NAV -- "HTTPS" --> FE
    NAV -- "HTTPS / JSON (API REST)" --> BE
    BE -- "conexión TLS (MONGODB_URI)" --> DB
    GH -. "despliegue desde el repositorio" .-> FE
    GH -. "despliegue desde el repositorio" .-> BE
```
 