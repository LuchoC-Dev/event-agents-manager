# Backend API

El backend es el núcleo del sistema. Expone una API REST y un canal WebSocket para tiempo real.

- **URL base:** `http://localhost:3001/api`
- **WebSocket:** `ws://localhost:3001/ws`
- **Health check:** `GET http://localhost:3001/health`

---

## Autenticación

La V1 no requiere autenticación. Todas las rutas son accesibles directamente.

---

## Convenciones

- Todos los IDs son UUIDs generados automáticamente por el servidor.
- Las fechas se devuelven en formato ISO 8601 (`2026-05-13T18:00:00.000Z`).
- Los errores devuelven `{ "error": "mensaje" }` con el status HTTP correspondiente.
- El `payload` de los eventos es un objeto JSON libre — podés poner lo que necesites.

---

## Projects

### `GET /api/projects`

Lista todos los proyectos.

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "name": "Mi Proyecto",
    "description": "Descripción opcional",
    "createdAt": "2026-05-13T18:00:00.000Z",
    "updatedAt": "2026-05-13T18:00:00.000Z"
  }
]
```

---

### `POST /api/projects`

Crea un nuevo proyecto.

**Body:**
```json
{
  "name": "Mi Proyecto",
  "description": "Descripción opcional"
}
```

**Respuesta:** El proyecto creado. Emite evento WebSocket `project:created`.

---

### `GET /api/projects/:id`

Obtiene un proyecto por ID.

---

### `PATCH /api/projects/:id`

Actualiza nombre o descripción de un proyecto.

**Body:** Cualquier combinación de `{ name, description }`.

---

### `DELETE /api/projects/:id`

Elimina un proyecto. Emite `project:deleted`.

> **Advertencia:** Eliminar un proyecto no elimina en cascada sus agentes, threads y eventos todavía. Esto es una limitación de la V1.

---

## Agents

Todas las rutas de agentes están bajo `/api/projects/:projectId/`.

### `GET /api/projects/:projectId/agents`

Lista todos los agentes del proyecto.

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "name": "CEO Agent",
    "role": "Chief Executive Officer",
    "category": "permanent",
    "status": "idle",
    "department": "Executive",
    "parentId": null,
    "templateId": null,
    "systemPrompt": "Sos el agente organizador principal...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### `POST /api/projects/:projectId/agents`

Crea un nuevo agente.

**Body:**
```json
{
  "name": "Backend Lead",
  "role": "Lead Backend Engineer",
  "category": "permanent",
  "department": "Engineering",
  "parentId": "uuid-del-ceo",
  "systemPrompt": "Sos el responsable del área de backend..."
}
```

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `name` | ✅ | Nombre del agente |
| `role` | ✅ | Rol o título |
| `category` | No | `permanent` (default) o `temporary` |
| `department` | No | Área o departamento |
| `parentId` | No | UUID del agente superior (manager) |
| `systemPrompt` | No | Prompt base para ejecutar el agente |

**Respuesta:** El agente creado. Emite `agent:created`.

---

### `PATCH /api/projects/:projectId/agents/:id`

Actualiza un agente. Útil para cambiar el status.

**Body:** Cualquier combinación de `{ name, role, status, systemPrompt }`.

**Valores válidos para `status`:** `idle | working | blocked | completed | archived`

**Respuesta:** El agente actualizado. Emite `agent:updated`.

---

## Templates

Los templates son moldes reutilizables para crear agentes temporales.

### `GET /api/projects/:projectId/templates`

Lista los templates del proyecto.

### `POST /api/projects/:projectId/templates`

Crea un nuevo template.

**Body:**
```json
{
  "name": "Auth Specialist",
  "role": "Authentication Engineer",
  "department": "Backend",
  "systemPrompt": "Sos un especialista en sistemas de autenticación...",
  "skills": ["JWT", "OAuth2", "bcrypt"]
}
```

---

## Threads

### `GET /api/projects/:projectId/threads`

Lista todos los threads del proyecto.

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Implementar sistema de login",
    "description": "Full auth implementation",
    "status": "open",
    "ownerAgentId": "uuid-del-ceo",
    "parentThreadId": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### `POST /api/projects/:projectId/threads`

Crea un nuevo thread. Automáticamente genera un evento `THREAD_CREATED`.

**Body:**
```json
{
  "title": "Implementar sistema de login",
  "description": "Descripción opcional",
  "ownerAgentId": "uuid-del-agente-responsable",
  "parentThreadId": "uuid-del-thread-padre"
}
```

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `title` | ✅ | Título del workflow |
| `ownerAgentId` | ✅ | Agente responsable del thread |
| `description` | No | Descripción libre |
| `parentThreadId` | No | Para crear sub-threads |

**Respuesta:** El thread creado. Emite `thread:created` y `event:created`.

---

### `PATCH /api/projects/:projectId/threads/:id`

Actualiza un thread.

**Body:** Cualquier combinación de `{ title, description, status }`.

**Valores válidos para `status`:** `open | in_progress | blocked | completed | archived`

---

### `GET /api/projects/:projectId/threads/:id/events`

Lista todos los eventos de un thread específico, ordenados cronológicamente.

---

## Events

### `GET /api/projects/:projectId/events`

Lista todos los eventos del proyecto, en orden cronológico.

---

### `POST /api/projects/:projectId/events`

Registra un nuevo evento en un thread.

**Body:**
```json
{
  "type": "TASK_ASSIGNED",
  "threadId": "uuid-del-thread",
  "agentId": "uuid-del-agente-origen",
  "targetAgentId": "uuid-del-agente-destino",
  "payload": {
    "task": "Implementar middleware JWT",
    "priority": "high"
  }
}
```

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `type` | ✅ | Tipo de evento (ver lista en concepts.md) |
| `threadId` | ✅ | Thread donde ocurre el evento |
| `agentId` | ✅ | Agente que genera el evento |
| `targetAgentId` | No | Agente destinatario |
| `payload` | No | Datos adicionales en JSON libre |

**Validaciones:** El `agentId` y `threadId` deben pertenecer al mismo proyecto.

**Respuesta:** El evento creado. Emite `event:created`.

---

## Graph Projections

El backend genera proyecciones de grafo listas para visualizar con React Flow.

### `GET /api/projects/:projectId/graph/org`

Proyección del organigrama completo del proyecto.

**Respuesta:**
```json
{
  "nodes": [
    {
      "id": "uuid",
      "type": "agent",
      "label": "CEO Agent",
      "data": {
        "role": "Chief Executive Officer",
        "status": "idle",
        "category": "permanent",
        "department": "Executive"
      }
    }
  ],
  "edges": [
    {
      "id": "parent-uuid->child-uuid",
      "source": "parent-uuid",
      "target": "child-uuid",
      "type": "manager_of"
    }
  ]
}
```

---

### `GET /api/projects/:projectId/graph/thread/:threadId`

Proyección del grafo de un thread: muestra los agentes involucrados y sus relaciones de delegación.

---

## WebSocket

Conectate a `ws://localhost:3001/ws` para recibir actualizaciones en tiempo real.

Todos los mensajes tienen el formato:

```json
{
  "event": "nombre:del:evento",
  "data": { ... }
}
```

### Eventos disponibles

| Evento | Cuándo se emite |
|--------|----------------|
| `project:created` | Al crear un proyecto |
| `project:updated` | Al modificar un proyecto |
| `project:deleted` | Al eliminar un proyecto |
| `agent:created` | Al crear un agente |
| `agent:updated` | Al modificar un agente |
| `thread:created` | Al crear un thread |
| `thread:updated` | Al modificar un thread |
| `event:created` | Al registrar un evento |

### Ejemplo de cliente WebSocket

```javascript
const ws = new WebSocket("ws://localhost:3001/ws");

ws.onmessage = (msg) => {
  const { event, data } = JSON.parse(msg.data);

  if (event === "agent:updated") {
    console.log("Agente actualizado:", data.name, "→", data.status);
  }
};
```
