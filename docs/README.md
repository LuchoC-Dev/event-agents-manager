# Event Agent Manager — Documentación

EAM es una plataforma para organizar, coordinar y observar sistemas de agentes jerárquicos. Funciona como un "sistema operativo organizacional" para agentes: modela jerarquías, workflows, delegaciones y eventos, permitiendo trazabilidad completa de lo que ocurre dentro de cada proyecto.

---

## Índice

- [Conceptos fundamentales](./concepts.md)
- [Cómo levantar el sistema](./setup.md)
- [Backend API](./backend.md)
- [Frontend UI](./frontend.md)
- [CLI](./cli.md)

---

## Arquitectura general

```
┌─────────────────────────────────────────┐
│             Frontend (React)             │
│         Org View · Agents · Threads      │
└────────────────────┬────────────────────┘
                     │ HTTP + WebSocket
┌────────────────────▼────────────────────┐
│            Backend (Fastify)             │
│    REST API · WebSocket Broker           │
└────────────────────┬────────────────────┘
                     │ Drizzle ORM
┌────────────────────▼────────────────────┐
│           PostgreSQL (Docker)            │
└─────────────────────────────────────────┘

        CLI (eam) ──► Backend API
```

## Estructura del monorepo

```
event-agents-manager/
├── apps/
│   ├── backend/          → API REST + WebSockets (Fastify)
│   ├── frontend/         → UI visual (React + React Flow)
│   └── cli/              → Herramienta de línea de comandos
├── packages/
│   └── shared/           → Tipos TypeScript compartidos
├── docs/                 → Esta documentación
│   └── preview/          → Contexto original del proyecto
└── docker-compose.yml    → PostgreSQL en puerto 5555
```
