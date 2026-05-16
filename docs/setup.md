# Cómo levantar el sistema

## Requisitos previos

| Herramienta | Versión mínima | Para qué |
|-------------|---------------|---------|
| Node.js | 18+ | Backend, Frontend, CLI |
| pnpm | 8+ | Package manager del monorepo |
| Docker Desktop | Cualquiera | Base de datos PostgreSQL |
| Rust + Cargo | 1.70+ | Reservado para Tauri (futuro) |

---

## Instalación inicial (solo la primera vez)

### 1. Instalar dependencias

Desde la raíz del monorepo:

```bash
pnpm install
```

Esto instala las dependencias de los tres packages: backend, frontend y CLI.

### 2. Levantar la base de datos

```bash
docker compose up -d
```

Levanta PostgreSQL en el puerto `5555`. El contenedor se llama `eam-postgres`.

> **Nota:** El puerto es 5555 porque el 5432 estándar puede estar ocupado. Si necesitás cambiarlo, editá `docker-compose.yml` y `apps/backend/.env`.

### 3. Aplicar el schema de la base de datos

```bash
pnpm db:push
```

Crea todas las tablas necesarias. Si ya existen tablas con datos incompatibles, Drizzle va a preguntar si querés truncarlas — respondé "Yes" solo si los datos son de prueba.

---

## Levantar los servidores

Necesitás tres terminales separadas:

### Terminal 1 — Backend

```bash
cd apps/backend
pnpm dev
```

El backend arranca en `http://localhost:3001`. Vas a ver algo como:

```
{"msg":"Server listening at http://0.0.0.0:3001"}
```

### Terminal 2 — Frontend

```bash
cd apps/frontend
pnpm dev
```

El frontend arranca en `http://localhost:5173`. Abrí esa URL en el browser.

### Terminal 3 — CLI (opcional)

El CLI no necesita un servidor propio. Lo corrés directamente:

```bash
cd apps/cli
npx tsx src/index.ts --help
```

---

## Variables de entorno

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=postgresql://eam:eam_secret@localhost:5555/eam_db
PORT=3001
```

### CLI (opcional)

Si el backend corre en un puerto o host diferente:

```bash
EAM_API_URL=http://localhost:3001/api npx tsx src/index.ts project list
```

---

## Comandos útiles del monorepo

Desde la raíz:

```bash
pnpm dev:backend      # Levantar backend
pnpm dev:frontend     # Levantar frontend
pnpm db:push          # Aplicar schema a la DB
pnpm db:studio        # Abrir Drizzle Studio (UI para ver la DB)
pnpm eam              # Alias para correr el CLI
```

---

## Detener el sistema

```bash
# Detener PostgreSQL
docker compose down

# Los servidores de Node se detienen con Ctrl+C en cada terminal
```
