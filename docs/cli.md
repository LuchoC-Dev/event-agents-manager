# CLI — `eam`

El CLI permite interactuar con el sistema EAM directamente desde la terminal, sin necesidad de abrir la UI. Es útil para scripting, automatización, o simplemente para quienes prefieren trabajar desde la línea de comandos.

---

## Cómo correrlo

Desde `apps/cli`:

```bash
npx tsx src/index.ts <comando>
```

O con el alias del monorepo, desde la raíz:

```bash
pnpm eam <comando>
```

---

## Configuración

Por defecto el CLI apunta a `http://localhost:3001/api`.

Para usar una URL diferente:

```bash
EAM_API_URL=http://mi-servidor:3001/api npx tsx src/index.ts project list
```

---

## Ayuda

```bash
# Ayuda general
eam --help

# Ayuda de un comando
eam project --help
eam agent create --help
```

---

## Comandos — Projects

### `eam project list`

Lista todos los proyectos disponibles.

```bash
npx tsx src/index.ts project list
```

**Salida:**
```
┌──────────┬─────────────────┬──────────────────────┬────────────┐
│ ID       │ Nombre          │ Descripción          │ Creado     │
├──────────┼─────────────────┼──────────────────────┼────────────┤
│ df94242a │ Mi Proyecto     │ Proyecto principal   │ 13/5/2026  │
│ a1b2c3d4 │ Cliente App     │ —                    │ 13/5/2026  │
└──────────┴─────────────────┴──────────────────────┴────────────┘
```

> El ID se muestra truncado (primeros 8 caracteres). Para usarlo en comandos, podés usar esos 8 primeros caracteres o el UUID completo.

---

### `eam project create <nombre>`

Crea un nuevo proyecto.

```bash
npx tsx src/index.ts project create "Mi Proyecto" --description "Descripción del proyecto"
```

**Opciones:**

| Opción | Alias | Descripción |
|--------|-------|-------------|
| `--description <desc>` | `-d` | Descripción del proyecto |

**Salida:**
```
✓ Proyecto creado: Mi Proyecto
ID: df94242a-2857-4d47-b25e-f3e0fc5341e2
```

Copiá el ID completo — lo vas a necesitar para todos los comandos de agentes, threads y eventos.

---

### `eam project show <id>`

Muestra el detalle de un proyecto.

```bash
npx tsx src/index.ts project show df94242a-2857-4d47-b25e-f3e0fc5341e2
```

**Salida:**
```
ID:          df94242a-2857-4d47-b25e-f3e0fc5341e2
Nombre:      Mi Proyecto
Descripción: Proyecto principal
Creado:      13/5/2026, 18:00:00
```

---

### `eam project delete <id>`

Elimina un proyecto.

```bash
npx tsx src/index.ts project delete df94242a-2857-4d47-b25e-f3e0fc5341e2
```

---

## Comandos — Agents

Todos los comandos de agentes requieren `--project <projectId>` (o `-p`).

---

### `eam agent list`

Lista todos los agentes de un proyecto.

```bash
npx tsx src/index.ts agent list --project <projectId>
npx tsx src/index.ts agent list -p <projectId>
```

**Salida:**
```
┌──────────┬─────────────┬─────────────────────────┬───────────┬────────┬───────────┐
│ ID       │ Nombre      │ Rol                     │ Categoría │ Status │ Dept      │
├──────────┼─────────────┼─────────────────────────┼───────────┼────────┼───────────┤
│ 3a8588a9 │ CEO Agent   │ Chief Executive Officer │ permanent │ idle   │ Executive │
│ f150f98b │ Backend Lead│ Lead Engineer           │ permanent │ working│ Backend   │
└──────────┴─────────────┴─────────────────────────┴───────────┴────────┴───────────┘
```

---

### `eam agent create`

Crea un nuevo agente en un proyecto.

```bash
npx tsx src/index.ts agent create \
  --project <projectId> \
  --name "Backend Lead" \
  --role "Lead Backend Engineer" \
  --category permanent \
  --department "Engineering" \
  --parent <ceoAgentId> \
  --prompt "Sos el responsable técnico del área de backend..."
```

**Opciones:**

| Opción | Alias | Requerido | Descripción |
|--------|-------|-----------|-------------|
| `--project <id>` | `-p` | ✅ | ID del proyecto |
| `--name <nombre>` | `-n` | ✅ | Nombre del agente |
| `--role <rol>` | `-r` | ✅ | Rol o título |
| `--category <cat>` | `-c` | No | `permanent` (default) o `temporary` |
| `--department <dept>` | `-d` | No | Área o departamento |
| `--parent <id>` | — | No | ID del agente superior (manager) |
| `--prompt <texto>` | — | No | System prompt del agente |

**Salida:**
```
✓ Agente creado: Backend Lead
ID: 19f7867d-e630-4f08-8a54-a90b7bbdc90f
Rol: Lead Backend Engineer
Categoría: permanent
```

---

### `eam agent status <agentId> <status>`

Cambia el status de un agente.

```bash
npx tsx src/index.ts agent status 19f7867d-e630-4f08-8a54-a90b7bbdc90f working -p <projectId>
```

**Status válidos:** `idle` · `working` · `blocked` · `completed` · `archived`

**Salida:**
```
✓ Status actualizado: Backend Lead → working
```

---

### `eam agent edit <agentId>`

Edita el nombre, rol o system prompt de un agente existente. Pasá solo los campos que querés modificar.

```bash
npx tsx src/index.ts agent edit 19f7867d-e630-4f08-8a54-a90b7bbdc90f \
  --project <projectId> \
  --name "Backend Lead Senior" \
  --role "Senior Lead Engineer" \
  --prompt "Sos el responsable técnico principal del área de backend..."
```

**Opciones:**

| Opción | Alias | Requerido | Descripción |
|--------|-------|-----------|-------------|
| `--project <id>` | `-p` | ✅ | ID del proyecto |
| `--name <nombre>` | `-n` | No | Nuevo nombre |
| `--role <rol>` | `-r` | No | Nuevo rol |
| `--prompt <texto>` | — | No | Nuevo system prompt |

Se debe especificar al menos uno de `--name`, `--role` o `--prompt`.

**Salida:**
```
✓ Agente actualizado: Backend Lead Senior
Rol: Senior Lead Engineer
System prompt: Sos el responsable técnico principal del área de backend...
```

---

## Comandos — Threads

Todos los comandos requieren `--project <projectId>` (o `-p`).

---

### `eam thread list`

Lista todos los threads de un proyecto.

```bash
npx tsx src/index.ts thread list -p <projectId>
```

**Salida:**
```
┌──────────┬──────────────────────────┬─────────────┬────────────┐
│ ID       │ Título                   │ Status      │ Creado     │
├──────────┼──────────────────────────┼─────────────┼────────────┤
│ 620e605a │ Implement Login System   │ open        │ 13/5/2026  │
│ a3b4c5d6 │ Create Dashboard         │ in_progress │ 13/5/2026  │
└──────────┴──────────────────────────┴─────────────┴────────────┘
```

---

### `eam thread create`

Crea un nuevo thread.

```bash
npx tsx src/index.ts thread create \
  --project <projectId> \
  --title "Implementar sistema de login" \
  --owner <agentId> \
  --description "Full auth con JWT" \
  --parent <parentThreadId>
```

**Opciones:**

| Opción | Alias | Requerido | Descripción |
|--------|-------|-----------|-------------|
| `--project <id>` | `-p` | ✅ | ID del proyecto |
| `--title <titulo>` | `-t` | ✅ | Título del thread |
| `--owner <agentId>` | `-o` | ✅ | ID del agente responsable |
| `--description <desc>` | `-d` | No | Descripción del workflow |
| `--parent <threadId>` | — | No | ID del thread padre (sub-thread) |

Al crear el thread se genera automáticamente el evento `THREAD_CREATED`.

**Salida:**
```
✓ Thread creado: Implementar sistema de login
ID: 620e605a-a52a-4649-bfee-f8654924dff8
Status: open
```

---

### `eam thread show <threadId>`

Muestra el detalle de un thread con su timeline de eventos completa.

```bash
npx tsx src/index.ts thread show 620e605a-a52a-4649-bfee-f8654924dff8 -p <projectId>
```

**Salida:**
```
Título:      Implementar sistema de login
Status:      in_progress
Descripción: Full auth con JWT

┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ Tipo            │ Agente       │ → Destino    │ Hora         │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ THREAD_CREATED  │ CEO Agent    │ —            │ 18:00:40     │
│ TASK_ASSIGNED   │ CEO Agent    │ Backend Lead │ 18:05:12     │
│ TASK_STARTED    │ Backend Lead │ —            │ 18:06:00     │
│ DELEGATED       │ Backend Lead │ Auth Agent   │ 18:10:30     │
└─────────────────┴──────────────┴──────────────┴──────────────┘
```

---

### `eam thread status <threadId> <status>`

Cambia el status de un thread.

```bash
npx tsx src/index.ts thread status 620e605a in_progress -p <projectId>
```

**Status válidos:** `open` · `in_progress` · `blocked` · `completed` · `archived`

---

## Comandos — Templates

Los templates permiten definir "moldes" de agentes reutilizables dentro de un proyecto. Al crear un agente temporal, podés referenciar un template con `--template <id>`.

Todos los comandos requieren `--project <projectId>` (o `-p`).

---

### `eam template list`

Lista todos los templates de un proyecto.

```bash
npx tsx src/index.ts template list -p <projectId>
```

**Salida:**
```
┌──────────┬──────────────────┬──────────────┬─────────┬────────────────────┐
│ ID       │ Nombre           │ Rol          │ Dept    │ Skills             │
├──────────┼──────────────────┼──────────────┼─────────┼────────────────────┤
│ a1b2c3d4 │ Backend Worker   │ Developer    │ Backend │ typescript,postgres │
│ e5f6g7h8 │ QA Tester        │ QA Engineer  │ QA      │ testing,cypress     │
└──────────┴──────────────────┴──────────────┴─────────┴────────────────────┘
```

---

### `eam template create`

Crea un nuevo template de agente.

```bash
npx tsx src/index.ts template create \
  --project <projectId> \
  --name "Backend Worker" \
  --role "Developer" \
  --department "Backend" \
  --prompt "Sos un desarrollador backend especializado en..." \
  --skills "typescript,postgres,redis"
```

**Opciones:**

| Opción | Alias | Requerido | Descripción |
|--------|-------|-----------|-------------|
| `--project <id>` | `-p` | ✅ | ID del proyecto |
| `--name <nombre>` | `-n` | ✅ | Nombre del template |
| `--role <rol>` | `-r` | ✅ | Rol del agente |
| `--department <dept>` | `-d` | No | Departamento |
| `--prompt <texto>` | — | No | System prompt base |
| `--skills <lista>` | — | No | Skills separadas por coma |

**Salida:**
```
✓ Template creado: Backend Worker
ID: a1b2c3d4-...
Rol: Developer
Skills: typescript, postgres, redis
```

---

## Comandos — Events

---

### `eam event list`

Lista eventos de un proyecto, con opción de filtrar por thread.

```bash
# Todos los eventos del proyecto
npx tsx src/index.ts event list -p <projectId>

# Solo los eventos de un thread específico
npx tsx src/index.ts event list -p <projectId> --thread <threadId>
```

**Opciones:**

| Opción | Alias | Requerido | Descripción |
|--------|-------|-----------|-------------|
| `--project <id>` | `-p` | ✅ | ID del proyecto |
| `--thread <id>` | `-t` | No | Filtrar por thread |

---

### `eam event add`

Registra un nuevo evento en un thread.

```bash
npx tsx src/index.ts event add \
  --project <projectId> \
  --thread <threadId> \
  --agent <agentId> \
  --type TASK_ASSIGNED \
  --target <targetAgentId> \
  --payload '{"task":"Implementar JWT middleware","priority":"high"}'
```

**Opciones:**

| Opción | Alias | Requerido | Descripción |
|--------|-------|-----------|-------------|
| `--project <id>` | `-p` | ✅ | ID del proyecto |
| `--thread <id>` | `-t` | ✅ | Thread donde ocurre el evento |
| `--agent <id>` | `-a` | ✅ | Agente que genera el evento |
| `--type <tipo>` | — | ✅ | Tipo de evento |
| `--target <id>` | — | No | Agente destinatario |
| `--payload <json>` | — | No | JSON con datos adicionales (default: `{}`) |

**Tipos de evento válidos:**
`TASK_ASSIGNED` · `TASK_STARTED` · `TASK_COMPLETED` · `DELEGATED` · `AGENT_SPAWNED` · `AGENT_ARCHIVED` · `SUMMARY_CREATED` · `BLOCKED` · `UNBLOCKED` · `ERROR`

**Salida:**
```
✓ Evento registrado: TASK_ASSIGNED
ID: e1234567-...
Thread: 620e605a
```

---

## Flujo de trabajo completo desde el CLI

```bash
# 1. Crear proyecto
npx tsx src/index.ts project create "Mi App" -d "Desarrollo de la app móvil"
# → Copiar el ID del proyecto: PROJECT_ID

# 2. Crear estructura de agentes
npx tsx src/index.ts agent create -p $PROJECT_ID -n "CEO" -r "Chief Executive Officer"
# → Copiar ID: CEO_ID

npx tsx src/index.ts agent create -p $PROJECT_ID -n "Backend Lead" -r "Lead Engineer" --parent $CEO_ID -d "Backend"
# → Copiar ID: LEAD_ID

npx tsx src/index.ts agent create -p $PROJECT_ID -n "Auth Specialist" -r "Auth Engineer" --parent $LEAD_ID -c temporary
# → Copiar ID: AUTH_ID

# 3. Ver el organigrama
npx tsx src/index.ts agent list -p $PROJECT_ID

# 4. Crear un thread de trabajo
npx tsx src/index.ts thread create -p $PROJECT_ID -t "Implementar Auth" -o $CEO_ID -d "JWT + bcrypt"
# → Copiar ID: THREAD_ID

# 5. Registrar el workflow mediante eventos
npx tsx src/index.ts event add -p $PROJECT_ID -t $THREAD_ID -a $CEO_ID --type TASK_ASSIGNED --target $LEAD_ID --payload '{"task":"Implementar autenticación"}'

npx tsx src/index.ts agent status $LEAD_ID working -p $PROJECT_ID

npx tsx src/index.ts event add -p $PROJECT_ID -t $THREAD_ID -a $LEAD_ID --type DELEGATED --target $AUTH_ID --payload '{"subtask":"JWT middleware"}'

npx tsx src/index.ts event add -p $PROJECT_ID -t $THREAD_ID -a $AUTH_ID --type TASK_COMPLETED --payload '{"result":"JWT implementado y testeado"}'

npx tsx src/index.ts thread status $THREAD_ID completed -p $PROJECT_ID

# 6. Ver la timeline completa
npx tsx src/index.ts thread show $THREAD_ID -p $PROJECT_ID
```
