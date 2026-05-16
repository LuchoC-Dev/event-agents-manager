# Frontend UI

La UI es una aplicación React que actúa como panel de observabilidad organizacional. Se conecta al backend via HTTP y WebSocket para mostrar datos en tiempo real.

- **URL:** `http://localhost:5173`
- **Stack:** React 19, TypeScript, React Flow, ELKjs, Zustand

---

## Pantalla inicial — Selector de Proyectos

Al abrir la app por primera vez (o sin ningún proyecto), aparece la pantalla de selección.

### Si ya tenés proyectos creados

Se muestran como botones. Hacé click en el proyecto que querés abrir.

### Crear un proyecto nuevo

1. Hacé click en **"+ Nuevo Proyecto"**
2. Ingresá el nombre (obligatorio) y descripción (opcional)
3. Hacé click en **"Crear y Entrar"**

La app entra directamente al nuevo proyecto.

### Cambiar de proyecto

Desde cualquier vista, en el sidebar izquierdo aparece el nombre del proyecto activo. Debajo hay un link **"← Cambiar proyecto"** que te vuelve a la pantalla de selección.

---

## Layout general

```
┌─────────────────┬──────────────────────────────────────┐
│   Sidebar       │   Header                              │
│                 │   (título + botón de acción)          │
│  EAM            ├──────────────────────────────────────┤
│  Mi Proyecto    │                                       │
│  ← cambiar      │   Contenido principal                 │
│                 │                                       │
│  🏢 Org View    │                                       │
│  🤖 Agents (3)  │                                       │
│  🧵 Threads (2) │                                       │
│                 │                                       │
│  ● Connected    │                                       │
└─────────────────┴──────────────────────────────────────┘
```

### Indicador de conexión

En la parte inferior del sidebar aparece un punto de color:

- 🟢 **Connected** — WebSocket activo, la UI se actualiza automáticamente
- 🔴 **Disconnected** — Sin conexión al backend

---

## Org View (vista organizacional)

La vista principal. Muestra el organigrama completo del proyecto como un **grafo jerárquico interactivo**.

### Qué muestra

Cada nodo es un agente. El layout es calculado automáticamente con ELKjs:
- Los managers aparecen arriba
- Los subordinados aparecen abajo
- Las conexiones muestran la relación (ej: `manager_of`)

### Colores de status en los nodos

| Color | Status |
|-------|--------|
| Gris | `idle` |
| Azul | `working` |
| Rojo | `blocked` |
| Verde | `completed` |
| Gris claro | `archived` |

### Controles del grafo

En la esquina inferior izquierda:
- **+/-** → Zoom in/out
- **⊡** → Fit view (ajusta el grafo a la pantalla)
- **🔒** → Bloquear/desbloquear interactividad

En la esquina inferior derecha aparece el **minimapa**, útil cuando hay muchos agentes.

### Interactividad

- **Drag** → Mover nodos individualmente
- **Scroll** → Zoom
- **Drag en fondo** → Mover el canvas

> Los cambios de posición son visuales y no se guardan. El layout se recalcula con ELK al actualizar los datos.

### Estado vacío

Si no hay agentes, aparece un botón para ir a crear el primero directamente.

---

## Agents (vista de agentes)

Lista de todos los agentes del proyecto en cards.

### Información de cada card

- **Nombre** del agente
- **Rol** (subtítulo)
- **Badge de categoría:** azul oscuro para `permanent`, violeta para `temporary`
- **Badge de departamento** (si tiene)
- **Status actual**

### Crear un agente

Botón **"+ Nuevo Agente"** en el header. Abre un modal con los siguientes campos:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Nombre | ✅ | Nombre del agente |
| Rol | ✅ | Título o función |
| Categoría | No | `Permanent` o `Temporary` |
| Departamento | No | Área de la organización |
| Manager (superior) | No | Selector de agentes existentes — define quién es su superior jerárquico |
| System Prompt | No | Texto base del agente para cuando se ejecute con IA |

Al crear el agente, el Org View se actualiza automáticamente via WebSocket.

---

## Threads (vista de threads)

Lista de todos los threads del proyecto.

### Información de cada thread

- **Título** del workflow
- **Descripción** (si tiene)
- **Badge de status** con color:
  - Violeta → `open`
  - Amarillo → `in_progress`
  - Rojo → `blocked`
  - Verde → `completed`
  - Gris → `archived`

### Crear un thread

Botón **"+ Nuevo Thread"** en el header. Requiere que haya al menos un agente creado.

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Título | ✅ | Nombre del workflow |
| Descripción | No | Contexto adicional |
| Agente responsable | ✅ | Quién lidera este thread |
| Thread padre | No | Para crear sub-threads |

Al crear, se registra automáticamente el evento `THREAD_CREATED` en la timeline.

### Ver la timeline de un thread

Hacé click en cualquier thread para abrir su **Timeline**.

---

## Timeline de un Thread

Panel lateral que muestra todos los eventos de un thread en orden cronológico.

### Estructura de la timeline

Cada evento muestra:
- **Punto de color** según el tipo de evento
- **Tipo** del evento (ej: `TASK_ASSIGNED`) en color distintivo
- **Timestamp** (fecha y hora)
- **Agente origen** → **Agente destino** (si aplica)
- **Payload** en formato JSON (si tiene datos)

### Colores por tipo de evento

| Tipo | Color |
|------|-------|
| `THREAD_CREATED` | Indigo |
| `TASK_ASSIGNED` | Azul |
| `TASK_STARTED` | Amarillo |
| `TASK_COMPLETED` | Verde |
| `DELEGATED` | Violeta |
| `AGENT_SPAWNED` | Cyan |
| `BLOCKED` | Rojo |
| `ERROR` | Rojo oscuro |
| `SUMMARY_CREATED` | Verde esmeralda |

### Agregar un evento manualmente

Hacé click en el botón **"+ Evento"** dentro de la timeline. Aparece un formulario inline con:

- **Tipo de evento** → selector con todos los tipos disponibles
- **Agente origen** → quién genera el evento
- **Agente destino** → opcional, para delegaciones
- **Payload** → JSON libre (ej: `{"task": "Implementar JWT"}`)

Al agregar, el evento aparece inmediatamente en la timeline.

---

## Realtime

La UI mantiene una conexión WebSocket con el backend. Cualquier cambio generado desde otro cliente (la API, el CLI, o un segundo browser) se refleja automáticamente sin necesidad de recargar la página.

**Qué se actualiza automáticamente:**
- Lista de agentes (y el grafo org)
- Lista de threads
- Lista de proyectos

**Qué requiere cerrar y reabrir el panel:**
- Los eventos dentro de la timeline de un thread (el panel usa fetch directo al abrirse)
