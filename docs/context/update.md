Estamos diseñando un sistema de organizaciones multi-agente enfocado en observabilidad, coordinación organizacional y visualización de interacciones entre agentes inteligentes.

La aplicación NO debe pensarse como:
- un sistema de chats entre LLMs,
- un framework clásico de agentes,
- ni una colección de prompts gigantes.

El sistema debe pensarse como:
- un runtime organizacional,
- un protocolo de coordinación,
- un sistema de observabilidad distribuida,
- y una plataforma para visualizar trabajo organizacional entre agentes inteligentes.

━━━━━━━━━━━━━━━━━━
FILOSOFÍA GENERAL
━━━━━━━━━━━━━━━━━━

Los agentes NO son simplemente LLMs.

Un agente representa:
- un rol organizacional,
- una responsabilidad,
- un departamento,
- o una función dentro de una organización artificial.

Ejemplos:
- Frontend Lead
- Backend Architect
- UI Designer
- QA Reviewer
- Research Specialist

El LLM es solamente el motor de razonamiento del agente.

La inteligencia NO debe vivir en el backend.

El backend NO debe:
- controlar workflows complejos,
- decidir comportamiento,
- imponer lógica organizacional rígida,
- ni funcionar como cerebro central.

El backend debe ser mínimo y actuar principalmente como:
- runtime organizacional,
- event bus,
- sistema de persistencia,
- sistema de sincronización,
- y fuente de datos para la UI.

━━━━━━━━━━━━━━━━━━
NUEVA FILOSOFÍA DE AGENTES
━━━━━━━━━━━━━━━━━━

Los agentes NO serán definidos manualmente mediante:
- enormes JSONs,
- builders complejos,
- configuraciones rígidas,
- ni prompts gigantes hardcodeados.

En cambio:
los agentes serán creados dinámicamente por el propio LLM utilizando un protocolo organizacional.

Ejemplo conceptual:

Prompt al modelo:
"Utiliza /app-init y vas a ser el encargado del frontend."

Con solamente esa instrucción:
el LLM debe poder:
- inicializarse dentro del sistema,
- entender el protocolo,
- asumir un rol organizacional,
- comprender cómo comunicarse,
- crear instrucciones,
- responder instrucciones,
- delegar,
- revisar,
- y operar organizacionalmente.

━━━━━━━━━━━━━━━━━━
PROTOCOLO ORGANIZACIONAL
━━━━━━━━━━━━━━━━━━

El verdadero núcleo del sistema es el protocolo organizacional.

NO los prompts.

NO los workflows hardcodeados.

NO el backend.

El backend debe exponer primitivas organizacionales.

El LLM aprende y utiliza esas primitivas.

El sistema debe ser protocol-driven.

NO prompt-driven.

━━━━━━━━━━━━━━━━━━
/app-init
━━━━━━━━━━━━━━━━━━

El comando /app-init representa:
- inicialización del agente,
- conexión al runtime organizacional,
- e inyección del protocolo organizacional.

Conceptualmente, /app-init debe proporcionarle al agente:

1. Identidad organizacional
- role
- department
- responsibilities

2. Reglas organizacionales
- toda comunicación es una instrucción
- las instrucciones son asincrónicas
- toda acción genera eventos
- las instrucciones pertenecen a threads
- las respuestas deben ser estructuradas

3. Operaciones disponibles
- create-instruction
- respond-instruction
- reject-instruction
- request-review
- delegate-instruction
- complete-instruction

4. Estados posibles
- created
- received
- accepted
- in_progress
- completed
- rejected
- error
- cancelled

5. Relaciones organizacionales
- thread
- review
- retry
- child instruction
- related instruction

6. Formatos esperados
- estructura de respuestas
- estructura de instrucciones
- referencias a instructionId
- referencias a threadId

━━━━━━━━━━━━━━━━━━
CAMBIO FUNDAMENTAL EN LA ARQUITECTURA
━━━━━━━━━━━━━━━━━━

Anteriormente:
el backend parecía responsable de:
- definir agentes,
- controlar comportamiento,
- controlar workflows,
- y gestionar inteligencia.

Ahora:
la inteligencia vive dentro del agente/LLM.

El backend:
- NO decide comportamiento,
- NO fuerza lógica organizacional,
- NO controla razonamiento.

El backend solamente:
- organiza,
- persiste,
- sincroniza,
- transmite eventos,
- y alimenta la UI.

━━━━━━━━━━━━━━━━━━
EL AGENTE COMO ENTIDAD LIGERA
━━━━━━━━━━━━━━━━━━

Los agentes ya NO son entidades rígidas y pesadas.

Ahora son:

skill
+
runtime context
+
organizational protocol
+
LLM reasoning

Los agentes funcionan más como procesos runtime dinámicos.

No deben requerir:
- configuración manual extensa,
- builders complejos,
- ni schemas organizacionales gigantes.

━━━━━━━━━━━━━━━━━━
SKILLS
━━━━━━━━━━━━━━━━━━

La skill define:
- comportamiento esperado,
- especialización,
- responsabilidades,
- forma de trabajar,
- y criterios organizacionales.

Ejemplo:

"Eres un diseñador UI especializado en:
- diseño moderno
- accesibilidad
- sistemas de diseño

Debes:
- pedir revisión QA antes de finalizar
- rechazar requerimientos ambiguos
- comunicar claramente problemas"

El backend NO debe interpretar esta skill.

El LLM interpreta naturalmente el comportamiento esperado.

━━━━━━━━━━━━━━━━━━
IMPORTANTE:
BACKEND MINIMALISTA
━━━━━━━━━━━━━━━━━━

El backend debe depender lo mínimo posible de lógica organizacional.

Debe evitar:
- reglas hardcodeadas,
- árboles de decisión organizacionales,
- workflows rígidos,
- validaciones inteligentes complejas.

La inteligencia organizacional emerge desde:
- el skill,
- el contexto,
- y el protocolo.

━━━━━━━━━━━━━━━━━━
RESPONSABILIDADES DEL BACKEND
━━━━━━━━━━━━━━━━━━

El backend solamente debe encargarse de:

1. Event Bus
- persistir eventos
- transmitir eventos
- sincronizar eventos

2. Persistencia
- instrucciones
- eventos
- relaciones
- threads
- agentes
- sesiones

3. Realtime
- WebSockets
- streaming
- sincronización en vivo

4. Observabilidad
- timelines
- tracing
- graph visualization
- estado organizacional

5. Relaciones
- ownership
- thread relationships
- instruction relationships

6. Integridad mínima
- ids válidos
- referencias válidas
- estructura básica válida

━━━━━━━━━━━━━━━━━━
IMPORTANTE:
NO CHAT SYSTEM
━━━━━━━━━━━━━━━━━━

Las comunicaciones NO son chats.

Todo intercambio organizacional importante:
es una instrucción.

Ejemplo:

Frontend
 └── Instruction A → Designer

Designer necesita algo
 └── Instruction B → Frontend

Frontend responde
 └── completa Instruction B

Designer continúa
 └── completa Instruction A

No existen:
- replies anidados,
- árboles de mensajes,
- conversaciones libres.

Todo es:
- instruction-driven
- event-driven
- organizationally structured

━━━━━━━━━━━━━━━━━━
EVENT SOURCING
━━━━━━━━━━━━━━━━━━

Todo el sistema debe ser event-driven.

Los eventos son la fuente de verdad.

Los eventos:
- no se editan
- no se borran
- son append-only

Toda acción genera eventos.

Ejemplos:
- InstructionCreated
- InstructionAccepted
- InstructionRejected
- InstructionCompleted
- ReviewRequested
- ReviewRejected
- RetryRequested

━━━━━━━━━━━━━━━━━━
ORGANIZACIÓN EMERGENTE
━━━━━━━━━━━━━━━━━━

La organización ya NO depende solamente de configuración manual.

Ahora:
las relaciones reales emergen desde runtime.

Ejemplo:

Aunque Designer no tenga relación explícita con QA,
si constantemente:
Designer → QA

entonces:
la UI puede inferir:
- dependencia operacional,
- colaboración frecuente,
- patrones organizacionales reales.

Por lo tanto:
existen dos organizaciones:

1. Declarativa
La configurada explícitamente.

2. Emergente
La observada mediante eventos y actividad real.

━━━━━━━━━━━━━━━━━━
OBJETIVO FINAL
━━━━━━━━━━━━━━━━━━

El objetivo NO es crear:
- otro framework de agentes,
- ni otro sistema de prompts.

El objetivo es construir:
- un runtime organizacional,
- un protocolo para inteligencia distribuida,
- y una plataforma de observabilidad organizacional en tiempo real.

La aplicación debe permitir visualizar:
- coordinación,
- delegaciones,
- revisiones,
- retries,
- ownership,
- relaciones,
- eventos,
- workflows,
- y evolución organizacional entre agentes inteligentes.