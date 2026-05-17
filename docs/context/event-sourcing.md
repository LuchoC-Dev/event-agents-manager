TODO el sistema debe ser event-driven.

Los eventos son la fuente de verdad.

NO deben editarse eventos.
NO deben borrarse eventos.

Los eventos son append-only.

El sistema NO debe depender de:
"actualizar estado directamente"

Sino de:
evento → persistencia → reconstrucción/proyección de estado.

Eventos posibles:
- InstructionCreated
- InstructionReceived
- InstructionAccepted
- InstructionRejected
- InstructionCompleted
- InstructionCancelled
- RetryRequested
- ReviewRequested
- ReviewApproved
- ReviewRejected
- InstructionInvalidated

Los eventos deben ser específicos.
NO genéricos.

Cada evento debe contener:
- eventId
- timestamp
- sequenceNumber
- instructionId
- threadId
- senderAgentId
- receiverAgentId

La UI debe ordenar eventos por:
sequenceNumber
NO por orden de llegada.

Esto evita problemas en sistemas distribuidos y tiempo real.