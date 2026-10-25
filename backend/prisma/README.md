# Prisma — Guía rápida

Guía práctica para cuando haces `git pull` y hay migraciones nuevas (carpetas
dentro de `migrations/`) que tu base de datos local todavía no tiene. Si ya
tienes la base de datos creada (contenedor de Docker corriendo) y solo
necesitas ponerla al día, son **3 pasos**:

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

Corre estos comandos desde la carpeta `backend/` (no desde `backend/prisma/`).

## Qué hace cada uno

1. **`npx prisma migrate deploy`** — aplica todas las migraciones pendientes
   (las carpetas nuevas en `migrations/` que tu base de datos aún no tiene)
   en orden, sin preguntar nada ni generar migraciones nuevas. Es el comando
   correcto cuando **tú no estás creando una migración**, solo estás
   poniendo tu base al día con las que ya existen en el repo.

2. **`npx prisma generate`** — regenera el cliente de Prisma
   (`src/generated/prisma/`) para que coincida con `schema.prisma`. Si no
   corres esto después de un `migrate deploy`, TypeScript se queja de
   campos que "no existen" aunque la base de datos ya los tenga.

3. **`npx prisma db seed`** — vuelve a correr el seed (`prisma/seed.ts`),
   que crea/actualiza los datos base: roles de seguridad, puestos,
   niveles académicos, empleados admin, etc. Es seguro correrlo varias
   veces (usa `upsert`, no duplica registros).

## ¿Por qué `migrate deploy` y no `migrate dev`?

`migrate dev` es para cuando **tú mismo estás creando una migración nueva**
(compara tu `schema.prisma` contra la base de datos y genera el SQL de la
diferencia). Si lo corres solo para "ponerte al día" con migraciones que
otra persona ya creó, puede:

- Detectar "drift" (diferencias) y ofrecerte **resetear tu base de datos**
  completa — ahí es donde probablemente se generan la mayoría de los
  "temas" al sincronizar.
- Preguntarte cosas de forma interactiva, lo cual no siempre es claro.

`migrate deploy` simplemente aplica lo que ya existe en `migrations/`, sin
tocar nada más. Es el mismo comando que se usa en producción/CI. Usa
`migrate dev` únicamente cuando tú vayas a crear una migración nueva (ver
abajo).

## Si nunca has creado la base de datos (primera vez)

Con el contenedor de Docker de la base de datos corriendo
(`docker compose up -d colegio-lear-db` desde la raíz del proyecto):

```bash
npx prisma migrate deploy   # crea todas las tablas desde cero
npx prisma generate
npx prisma db seed
```

Es exactamente el mismo flujo — `migrate deploy` funciona igual si la base
está vacía o si ya tiene algunas migraciones aplicadas.

## Si de verdad necesitas empezar de cero (borra todo)

Solo si tu base de datos local quedó en un estado raro y prefieres
reconstruirla desde cero (esto **borra todos los datos**):

```bash
npx prisma migrate reset --force
```

Esto hace drop de la base, vuelve a correr todas las migraciones desde el
inicio, y corre el seed automáticamente al final (no hace falta correr
`db seed` aparte después de esto).

## Si tú vas a crear una migración nueva

Esto es lo que hace quien trabaja en el backend cuando cambia
`schema.prisma` (agrega un campo, renombra una columna, etc.):

```bash
npx prisma migrate dev --name descripcion_corta_del_cambio
```

Esto sí compara tu schema contra la base de datos, genera el SQL, lo aplica,
y regenera el cliente automáticamente. No es lo que normalmente necesita
alguien que solo consume el backend (como el front) — es solo para quien
está modificando el esquema de la base de datos.

## Otros comandos útiles

| Comando | Qué hace |
|---|---|
| `npx prisma studio` | Abre una interfaz visual en el navegador para ver/editar los datos de la base directamente |
| `npx prisma migrate status` | Te dice qué migraciones están aplicadas y cuáles faltan, sin aplicar nada — útil para diagnosticar antes de correr cualquier otro comando |
| `npx prisma validate` | Valida que `schema.prisma` no tenga errores de sintaxis |

## Variables de entorno necesarias

Todos estos comandos necesitan `DATABASE_URL` en `backend/.env` apuntando a
la base de datos correcta. Si usas el Docker Compose del proyecto, las
credenciales son `postgres`/`postgres` y la base se llama `colegio_lear`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/colegio_lear?schema=public"
```

Si `npx prisma migrate status` dice que no puede conectar, revisa primero
que el contenedor esté corriendo (`docker compose up -d colegio-lear-db`
desde la raíz del proyecto) antes de intentar cualquier otro comando.
