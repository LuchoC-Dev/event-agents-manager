# Prompt - UI / Visualización del Sistema

El frontend del proyecto debe diseñarse como una interfaz de observabilidad organizacional para workflows multiagente.

La UI NO debe pensarse como:

* un chat tradicional
* una lista plana de mensajes
* una consola simple

La UI debe representar visualmente:

* jerarquías
* workflows
* delegaciones
* relaciones organizacionales
* eventos
* estados runtime
* trazabilidad

El sistema debe sentirse más cercano a:

* un organigrama vivo
* un workflow engine visual
* una herramienta de observabilidad distribuida

---

# Filosofía Visual

El sistema gira alrededor de:

* nodos
* conexiones
* eventos
* árboles
* grafos

Los agentes deben visualizarse como entidades organizacionales activas.

Los workflows deben visualizarse como grafos dinámicos en tiempo real.

---

# Separación de Vistas

La UI debe separar claramente:

## 1. Organizational View

Representa la estructura permanente de la organización.

Ejemplos:

* organizer
* backend-lead
* frontend-lead
* designer

Esta vista:

* cambia poco
* representa jerarquías permanentes
* muestra departamentos y managers

Ejemplo conceptual:

Organizer
├── Backend Lead
└── Frontend Lead

---

## 2. Workflow View

Representa lo que ocurre dentro de un Thread específico.

Debe mostrar:

* workers temporales
* delegaciones
* eventos
* estado de ejecución
* relaciones runtime

Ejemplo conceptual:

Login Thread
├── Backend Task
│   ├── temp-auth-worker
│   └── temp-db-worker
│
└── Frontend Task
└── temp-ui-worker

Esta vista:

* cambia constantemente
* es dinámica
* representa ejecución activa

---

# Nodos

Los nodos representan:

* agentes
* threads
* tareas
* workers temporales

Cada nodo debe poder mostrar:

* estado
* tipo
* jerarquía
* actividad
* eventos recientes
* carga de trabajo

Ejemplos de estados:

* idle
* working
* blocked
* completed
* archived

---

# Conexiones / Edges

Las conexiones representan relaciones organizacionales o runtime.

Ejemplos:

* manager_of
* delegated_to
* spawned
* depends_on
* reports_to

Las conexiones deben ser first-class citizens del sistema visual.

---

# Realtime

La UI debe actualizarse en tiempo real mediante eventos del backend.

Ejemplos:

* creación de workers
* delegaciones
* finalización de tareas
* cambios de estado
* nuevos eventos

El frontend NO debe calcular lógica organizacional compleja.
Debe consumir proyecciones generadas por el backend.

---

# Backend Authoritative

El backend es la fuente de verdad.

El frontend:

* renderiza
* observa
* interactúa

El frontend NO debe contener:

* lógica organizacional crítica
* reglas de delegación
* lifecycle principal

---

# Tecnologías Recomendadas

Frontend:

* React
* TypeScript

Desktop:

* Tauri

Graph/UI:

* React Flow
* ELKjs

State Management:

* Zustand

Realtime:

* WebSockets

---

# Objetivo de la UI

La interfaz debe permitir:

* entender rápidamente qué ocurre
* visualizar workflows
* observar delegaciones
* inspeccionar agentes
* seguir timelines
* analizar eventos
* navegar relaciones organizacionales

La UI debe sentirse como:
"un panel de observabilidad para organizaciones multiagente".
