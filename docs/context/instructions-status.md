Las instrucciones representan comunicaciones persistentes.

Los estados NO representan trabajo interno complejo.
Representan el estado organizacional/comunicacional.

Estados recomendados:

Core:
- created
- received
- accepted
- in_progress
- responded
- completed
- rejected
- error
- cancelled

Estados opcionales:
- waiting_external
- waiting_review
- retry_requested

Las instrucciones pueden necesitar:
- estado principal,
- y subestado opcional.

Ejemplo:
status: in_progress
substatus: waiting_external_response

Esto es importante para la UI y trazabilidad.