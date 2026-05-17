El tiempo real es crítico.

La UI debe actualizarse automáticamente.

NO debe depender de refresh manual.

El sistema debe soportar:
- streaming de eventos,
- actualizaciones en vivo,
- sincronización en tiempo real,
- observabilidad instantánea.

La arquitectura debe pensarse desde el inicio como:
- asincrónica,
- distribuida,
- event-driven,
- real-time.

Los agentes funcionan asincrónicamente.

Las instrucciones viven independientemente de los agentes.

Los agentes:
- pueden responder después,
- pueden tener backlog,
- pueden procesar luego,
- pueden recibir instrucciones en cualquier momento.

Pero:
los agentes tienen obligación organizacional de responder.

No funcionan como usuarios libres de chat.
Funcionan como trabajadores organizacionales.