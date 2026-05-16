# Prompt - Arquitectura Backend del Sistema

El backend del proyecto debe diseñarse como el núcleo organizacional y operacional del sistema multiagente.

El backend NO debe pensarse como:

* una API tradicional de chat
* un simple wrapper de prompts
* una automatización lineal
* un sistema de mensajes básico

El backend debe actuar como:

* motor organizacional
* coordinador jerárquico
* workflow engine
* event system
* source of truth del sistema

---

# Filosofía General

El sistema representa una organización distribuida de agentes.

El backend es responsable de:

* gestionar workflows
* manejar jerarquías
* controlar lifecycle de agentes
* almacenar eventos
* construir trazabilidad
* emitir actualizaciones realtime
* mantener consistencia organizacional

Todo el sistema gira alrededor de:

Agents
+
Threads
+
Events

---

# Arquitectura Conceptual

Frontend/Desktop/Web
↓
API + Realtime Layer
↓
Organization Engine
↓
Event System
↓
Domain Layer
↓
Storage

---

# Domain Layer

La domain layer contiene las entidades principales del sistema.

Debe ser independiente de frameworks.

Entidades principales:

* Agent
* Thread
* Event
* Relationship

La domain layer representa las reglas conceptuales centrales del sistema.

---

# Agents

Los agentes representan entidades organizacionales.

Existen dos categorías:

## Permanent Agents

Representan organización estable.

Ejemplos:

* organizer
* backend-lead
* frontend-lead
* agent-designer

Responsabilidades:

* coordinación
* delegación
* consolidación
* supervisión

---

## Temporary Agents

Representan workers efímeros runtime.

Ejemplos:

* temp-auth-worker
* temp-ui-worker

Responsabilidades:

* ejecución concreta
* tareas específicas
* trabajo especializado

Los temporary agents:

* nacen desde templates
* trabajan dentro de threads
* eventualmente se archivan/finalizan

---

# Agent Definitions vs Runtime

El sistema debe separar:

## Agent Definitions

Definiciones permanentes/templates.

Contienen:

* prompts base
* personalidad
* responsabilidades
* herramientas
* capacidades

Se almacenan en:

.agents/definitions/

---

## Agent Runtime

Instancias activas temporales.

Contienen:

* estado runtime
* contexto temporal
* eventos
* outputs
* thread asociado

Los runtimes:

* son efímeros
* pueden archivarse
* NO deben modificar templates permanentes

---

# Threads

Los Threads representan workflows/contextos generales.

Ejemplos:

* "Implement Login"
* "Create Dashboard"

Un Thread agrupa:

* eventos
* delegaciones
* tareas
* workers
* resultados

Los Threads representan:
"sobre qué se está trabajando"

---

# Events

El sistema es event-driven.

Toda interacción organizacional debe modelarse mediante eventos.

Ejemplos:

* THREAD_CREATED
* TASK_ASSIGNED
* TASK_COMPLETED
* AGENT_SPAWNED
* SUMMARY_CREATED
* BLOCKED
* ERROR
* RUNTIME_ARCHIVED

Los eventos representan:
"qué ocurrió dentro del sistema"

---

# Event System

El event system es uno de los núcleos principales del backend.

Responsabilidades:

* persistencia de eventos
* emisión realtime
* replay
* trazabilidad
* auditoría
* reconstrucción de estado

El sistema debe ser:
event-first

---

# Organization Engine

El organization engine controla:

* jerarquías
* delegaciones
* managers
* workers
* permisos organizacionales
* creación de runtimes
* consolidación de resultados

El backend debe comportarse como:
"un sistema operativo organizacional"

---

# Runtime Lifecycle

Los temporary agents siguen un lifecycle:

1. Spawn desde template
2. Trabajo runtime
3. Generación de eventos
4. Finalización
5. Archivado

Los runtimes NO deben borrarse inmediatamente al terminar.

Estados recomendados:

* active
* completed
* blocked
* failed
* archived

---

# Realtime Layer

El backend debe emitir eventos en tiempo real hacia el frontend.

Ejemplos:

* nuevos workers
* delegaciones
* cambios de estado
* eventos runtime

Tecnología recomendada:

* WebSockets

---

# API Layer

La API debe exponer:

* threads
* agentes
* eventos
* workflows
* timelines
* grafos/proyecciones

El frontend debe consumir:

* datos
* vistas
* proyecciones

NO lógica organizacional compleja.

---

# Graph Projections

El backend debe construir representaciones visuales derivadas.

Ejemplos:

* nodes
* edges
* workflow trees
* timelines
* inboxes

Estas representaciones deben derivarse desde:

* events
* relationships
* threads

---

# Storage

## Filesystem

Utilizado para:

* definitions
* templates
* configuraciones de agentes

Ejemplo:

.agents/definitions/

---

## Database

Utilizada para:

* events
* runtime state
* threads
* relationships
* observabilidad

Base de datos recomendada:

* PostgreSQL

---

# Tecnologías Recomendadas

Backend:

* Node.js
* TypeScript

Framework:

* Fastify

ORM:

* Drizzle ORM

Database:

* PostgreSQL

Realtime:

* WebSockets

---

# Objetivo del Backend

El backend debe convertirse en:

* el cerebro organizacional
* la fuente de verdad
* el motor de workflows
* el coordinador distribuido
* el sistema de observabilidad

El sistema NO debe diseñarse como:

* un chat IA
* una colección de prompts
* una automatización simple

Debe diseñarse como:
"una plataforma organizacional para sistemas multiagente".
