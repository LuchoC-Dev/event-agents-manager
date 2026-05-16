# Conceptos Fundamentales

EAM gira alrededor de tres entidades principales: **Project**, **Agent**, **Thread** y **Event**. Entender cómo se relacionan es clave para usar el sistema correctamente.

---

## Project

Un Project es un workspace completamente aislado. Cada proyecto tiene sus propios agentes, threads y eventos — no se comparten entre proyectos.

Usás un proyecto por cada "organización" o contexto de trabajo independiente.

**Ejemplos:**
- `Cliente A — App Mobile`
- `Proyecto Interno — Refactor Auth`
- `Investigación — Sistema de Recomendaciones`

---

## Agent

Un Agent representa una entidad de trabajo dentro de un proyecto. Puede ser un rol humano modelado como agente, un agente de IA, o cualquier actor del sistema.

### Tipos de agentes

| Tipo | Descripción | Ejemplos |
|------|-------------|---------|
| `permanent` | Agentes estables de la organización | CEO, Backend Lead, Designer |
| `temporary` | Workers efímeros creados para tareas concretas | temp-auth-worker, temp-ui-worker |

### Estados de un agente

| Status | Significado |
|--------|-------------|
| `idle` | Sin actividad actual |
| `working` | Ejecutando una tarea |
| `blocked` | Bloqueado esperando algo |
| `completed` | Finalizó su trabajo |
| `archived` | Ya no activo, pero historial preservado |

### Jerarquía

Los agentes pueden tener un `parentId` que apunta a otro agente. Esto define quién es el manager/superior. El Org View del frontend visualiza estas relaciones como un árbol jerárquico.

```
CEO Agent
├── Backend Lead
│   ├── Auth Specialist
│   └── DB Specialist
└── Frontend Lead
    └── UI Agent
```

---

## Thread

Un Thread representa un workflow, objetivo o contexto de trabajo. Agrupa todos los eventos, delegaciones y resultados relacionados a una misma tarea.

**Ejemplos:**
- `Implementar sistema de login`
- `Crear dashboard de métricas`
- `Migrar base de datos a PostgreSQL`

### Estados de un thread

| Status | Significado |
|--------|-------------|
| `open` | Recién creado, sin trabajo activo |
| `in_progress` | Trabajo en curso |
| `blocked` | Detenido esperando algo externo |
| `completed` | Trabajo finalizado exitosamente |
| `archived` | Cerrado y preservado como historial |

### Sub-threads

Un thread puede tener un `parentThreadId`, lo que permite crear árboles de trabajo:

```
Thread: "Implementar Auth"
├── Sub-thread: "Backend — JWT"
└── Sub-thread: "Frontend — Login Form"
```

---

## Event

Un Event es algo que ocurrió dentro de un Thread. El sistema es **event-driven**: toda interacción organizacional se modela como un evento, no como mensajes o estados simples.

Los eventos son **inmutables** — nunca se modifican, solo se agregan. Esto garantiza trazabilidad completa.

### Tipos de eventos

| Tipo | Cuándo usarlo |
|------|--------------|
| `THREAD_CREATED` | Se crea automáticamente al crear un thread |
| `TASK_ASSIGNED` | Un agente asigna una tarea a otro |
| `TASK_STARTED` | Un agente comienza a trabajar |
| `TASK_COMPLETED` | Un agente finaliza su tarea |
| `DELEGATED` | Un manager delega trabajo a un subordinado |
| `AGENT_SPAWNED` | Se crea un agente temporal para una tarea |
| `AGENT_ARCHIVED` | Un agente temporal finaliza y se archiva |
| `SUMMARY_CREATED` | Un agente genera un resumen de resultados |
| `BLOCKED` | Un agente se bloquea esperando algo |
| `UNBLOCKED` | El bloqueo se resuelve |
| `ERROR` | Ocurrió un error en el proceso |

### Anatomía de un evento

```json
{
  "id": "uuid",
  "type": "TASK_ASSIGNED",
  "threadId": "id-del-thread",
  "agentId": "id-del-agente-origen",
  "targetAgentId": "id-del-agente-destino",
  "payload": { "task": "Implementar JWT middleware" },
  "createdAt": "2026-05-13T18:00:00Z"
}
```

- `agentId` → quién generó el evento
- `targetAgentId` → a quién va dirigido (puede ser null)
- `payload` → cualquier dato adicional en JSON libre

---

## Flujo típico de trabajo

```
1. Crear proyecto
2. Crear agentes permanentes (CEO, leads, especialistas)
3. Crear un thread para el objetivo a trabajar
4. Registrar eventos a medida que ocurren:
   - TASK_ASSIGNED cuando un lead delega trabajo
   - TASK_STARTED cuando un worker empieza
   - DELEGATED cuando hay sub-delegaciones
   - TASK_COMPLETED cuando termina
5. Ver el Org View para entender la jerarquía
6. Ver la Timeline del thread para entender qué ocurrió
```
