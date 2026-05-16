# Contexto General del Proyecto

El proyecto consiste en crear un sistema de coordinación y observabilidad para agentes jerárquicos, inspirado en la estructura organizacional de una empresa.

El objetivo NO es crear un simple chat entre agentes ni un sistema básico de prompts, sino una plataforma capaz de representar:

* jerarquías organizacionales
* delegación de tareas
* workflows distribuidos
* consolidación de resultados
* trazabilidad completa
* supervisión humana
* comunicación asincrónica entre agentes

---

# Modelo Organizacional

El sistema funciona como una empresa real.

Existen distintos tipos de agentes:

* agentes organizadores / managers
* agentes especializados
* agentes workers

Cada agente tiene:

* un rol
* responsabilidades
* un área/departamento
* superiores jerárquicos
* posibilidad de delegar tareas

Ejemplo de estructura:

CEO Agent
├── Backend Lead
│   ├── Auth Agent
│   └── Database Agent
│
└── Frontend Lead
├── UI Agent
└── UX Agent

---

# Flujo General

1. Un usuario solicita una tarea general.

2. Un agente organizador analiza la solicitud.

3. El organizador delega trabajo a agentes de áreas específicas.

4. Los agentes pueden delegar nuevamente a agentes más especializados.

5. Los agentes especializados realizan el trabajo.

6. Al finalizar, generan un resumen/evento de lo realizado.

7. Los managers consolidan resultados hacia arriba.

8. Finalmente, el organizador responde al usuario.

---

# Supervisión Humana

En la primera versión del sistema:

* los agentes NO serán totalmente automáticos
* OpenCode ejecutará manualmente los prompts
* los agentes revisarán manualmente sus tareas/eventos
* el sistema actuará principalmente como:

  * coordinador
  * visualizador
  * sistema de organización
  * sistema de trazabilidad

El foco inicial NO está en automatizar IA, sino en modelar correctamente:

* workflows
* delegaciones
* organización
* comunicación
* observabilidad

---

# Conceptos Principales del Sistema

## Agent

Representa una entidad de trabajo dentro de la organización.

Un Agent:

* recibe tareas
* delega tareas
* genera resultados
* reporta hacia arriba

Ejemplos:

* Organizer Agent
* Backend Lead
* Auth Agent
* UI Agent

El Agent representa:
"quién trabaja"

---

## Thread

Representa un workflow, objetivo o contexto general de trabajo.

Un Thread agrupa:

* tareas
* delegaciones
* resultados
* eventos
* contexto relacionado

Ejemplo:
"Implementar sistema de login"

El Thread representa:
"sobre qué se está trabajando"

---

## Event

Representa algo que ocurrió dentro de un Thread.

El sistema evoluciona mejor utilizando eventos en lugar de mensajes simples.

Un Event puede representar:

* delegación
* inicio de tarea
* finalización
* bloqueo
* resumen
* error
* solicitud de ayuda
* consolidación

Ejemplos:

* TASK_ASSIGNED
* TASK_COMPLETED
* SUMMARY_CREATED
* BLOCKED
* ERROR
* DELEGATED

El Event representa:
"qué ocurrió dentro del workflow"

---

# Filosofía Técnica

El sistema debe pensarse como:

* un sistema operativo para organizaciones de agentes
* un workflow engine jerárquico
* una estructura empresarial distribuida
* un sistema de coordinación y observabilidad

NO como:

* un simple chat
* una colección de prompts
* una automatización lineal

---

# Objetivos Iniciales

La V1 debería enfocarse en:

* organización de agentes
* delegación jerárquica
* visualización de workflows
* timelines
* inboxes por agente
* trazabilidad de eventos
* árboles de delegación
* supervisión manual

La automatización avanzada puede llegar después.

---

# Arquitectura Conceptual

Agents
+
Threads
+
Events

Donde:

* Agents trabajan
* Threads agrupan workflows
* Events describen lo ocurrido

Todo el sistema se construye alrededor de estas tres entidades.
