El ownership de un hilo pertenece al agente que inicia el flujo principal.

Ejemplo:

Frontend
 └── Instruction → Designer

Aunque:
Designer cree nuevas instrucciones,
el ownership organizacional principal sigue siendo del Frontend.

El sistema necesita:
- threadId,
- relationId,
- parentInstructionId,
o conceptos equivalentes.

Esto permite:
- agrupar instrucciones relacionadas,
- visualizar workflows completos,
- entender trazabilidad organizacional.

IMPORTANTE:
el flujo de respuestas NO necesariamente sigue la jerarquía.

Ejemplo:
A → B → C

Pero:
C puede responder directamente a A.

La jerarquía organizacional NO determina el flujo exacto de comunicación.