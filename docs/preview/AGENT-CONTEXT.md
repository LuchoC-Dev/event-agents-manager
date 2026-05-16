# Sistema de Agentes - Arquitectura y Lifecycle

Este documento define cómo deben funcionar, organizarse y tratarse los agentes dentro del sistema.

El objetivo es mantener una arquitectura limpia, escalable y observable para una organización jerárquica de agentes.

---

# Filosofía General

Los agentes NO deben tratarse como simples prompts o chats aislados.

Los agentes representan entidades organizacionales con:

* responsabilidades
* jerarquías
* workflows
* lifecycle
* comunicación basada en eventos

El sistema debe comportarse como una empresa distribuida.

---

# Tipos de Agentes

Existen dos grandes categorías:

## 1. Permanent Agents

Son agentes persistentes que forman parte estable de la organización.

Ejemplos:

* organizer
* agent-designer
* backend-lead
* frontend-lead

Responsabilidades:

* coordinación
* delegación
* consolidación
* planificación
* supervisión

Los Permanent Agents:

* NO deberían destruirse
* mantienen identidad estable
* representan departamentos o roles permanentes

---

## 2. Temporary Agents

Son agentes efímeros creados para realizar tareas específicas.

Ejemplos:

* temp-auth-worker
* temp-jwt-worker
* temp-ui-worker

Responsabilidades:

* ejecución técnica concreta
* tareas acotadas
* trabajo especializado

Los Temporary Agents:

* nacen desde templates
* existen durante un workflow
* finalizan al completar su trabajo
* NO deberían actuar como managers complejos

---

# Agent Designer

El único agente creado manualmente inicialmente será el Agent Designer.

Responsabilidades:

* crear nuevos templates de agentes
* definir prompts base
* definir capacidades
* definir reglas organizacionales
* mantener consistencia estructural

El Agent Designer NO crea runtimes temporales directamente.
Crea templates reutilizables.

---

# Separación Fundamental

El sistema debe separar:

## Agent Definition

De:

## Agent Runtime

---

# Agent Definition

Representa la definición permanente de un agente/template.

Contiene:

* prompt base
* personalidad
* responsabilidades
* skills
* reglas
* herramientas
* capacidades

Estas definiciones deben almacenarse en:

.agents/definitions/

Ejemplos:

.agents/definitions/backend-lead.md
.agents/definitions/auth-specialist.md

Las definitions:

* son reutilizables
* son persistentes
* pueden versionarse
* NO contienen estado temporal

---

# Agent Runtime

Representa una instancia activa de trabajo.

Contiene:

* thread actual
* contexto temporal
* eventos
* outputs
* estado de ejecución

Los runtimes deben almacenarse en:

.agents/runtime/

Ejemplos:

.agents/runtime/temp-auth-worker-1/
.agents/runtime/temp-ui-worker-4/

---

# Lifecycle de Temporary Agents

## Creación

Un manager/organizer puede decidir crear un worker temporal.

Ejemplo:

createAgentFromTemplate("auth-specialist")

Esto genera:

temp-auth-worker-1

---

## Trabajo

El agente:

* recibe contexto
* trabaja sobre el thread
* genera eventos
* responde resultados

---

## Finalización

Al terminar:

* el runtime NO debe borrarse inmediatamente
* el runtime debe marcarse como:

  * completed
  * archived
  * failed

Esto permite:

* debugging
* replay
* trazabilidad
* auditoría
* observabilidad

---

# Eliminación de Runtimes

Los runtimes archivados pueden:

* eliminarse posteriormente
* comprimirse
* exportarse
* limpiarse automáticamente

Pero nunca deberían desaparecer inmediatamente al terminar.

---

# Templates

Los templates representan moldes reutilizables.

Ejemplo:

Auth Specialist Template

Desde un template pueden crearse múltiples runtimes:

* temp-auth-worker-1
* temp-auth-worker-2
* temp-auth-worker-3

El template es permanente.
Los runtimes son efímeros.

---

# Organización Recomendada

## Permanent Layer

Capa organizacional estable.

Ejemplos:

* organizer
* backend-lead
* frontend-lead
* designer

Responsabilidad:

* coordinar
* delegar
* consolidar

---

## Runtime Layer

Capa efímera de ejecución.

Ejemplos:

* temp-jwt-worker
* temp-ui-worker

Responsabilidad:

* resolver tareas concretas

---

# Comunicación

Los agentes NO deben comunicarse mediante chats planos.

Toda interacción debe modelarse como:

Events dentro de Threads.

Ejemplos:

* TASK_ASSIGNED
* TASK_COMPLETED
* SUMMARY_CREATED
* BLOCKED
* ERROR

---

# Objetivo Arquitectónico

La meta NO es crear:

* bots desordenados
* prompts aislados
* agentes autónomos caóticos

La meta es construir:

* una organización distribuida
* workflows jerárquicos
* observabilidad completa
* coordinación escalable
* trazabilidad organizacional

El sistema debe pensarse como:

"Un sistema operativo para organizaciones de agentes".
