Los agentes pueden delegar instrucciones.

Ejemplo:
Frontend → Designer

El Designer puede:
- completar la instrucción,
- pedir aclaraciones,
- generar nuevas instrucciones,
- solicitar revisiones,
- o delegar partes del trabajo.

MUY IMPORTANTE:
cuando un agente necesita algo adicional:
NO responde dentro de la misma instrucción.

En cambio:
crea una NUEVA instrucción.

Ejemplo:

Frontend
 └── Instruction A → Designer

Designer
 └── Instruction B → Frontend

Frontend
 └── responde Instruction B

Designer
 └── completa Instruction A

Por lo tanto:
NO existen replies anidados tipo chat.

Todo intercambio organizacional importante:
es una nueva instrucción.

Esto evita:
- árboles caóticos,
- chats imposibles de visualizar,
- threading complejo.

Las instrucciones pueden estar relacionadas entre sí mediante relaciones explícitas.

Ejemplos:
- clarification_of
- retry_of
- review_of
- child_of
- related_to

Las instrucciones forman una red organizacional.
NO un simple chat thread.