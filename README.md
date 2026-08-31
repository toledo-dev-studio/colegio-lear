# COLEGIO LEAR

`COLEGIO LEAR` es unn proyecto enfocado en el servicio al estudiante y la administración de información relacionada a los alumnos y su estancia en un colegio.

El proyecto se compone de dos sitios web que coexisten con el fin de dar una mejor visibilidad a todos los integrantes del colegio, uno de los portales esta enfocado para su uso por el personal administrativo así como de docentes de un colegio, y el otro es un portal de servicio de cara al estudiante y/o sus tutores.

## Aspectos técnicos

El siguiente es la arquitectura técnica que se llevó a cabo para el desarrollo de este proyecto.

---
### Docker

Con el fin de que este proyecto se pueda replicar en diferentes colegios, se opto por desarrollarlo utilizando la herramienta de contenedores `Docker`, lo que permite una facilidad al momento de desarrollar y/o desplegar el aplicativo.

Su uso local esta configurado con la caracteristica `Compose` que integra `Docker` por medio del archivo `compose.yaml`, en la siguiente sección se explica su uso.

#### Servicios de docker compose

Este proyecto se compone de los siguientes servicios

1. **colegio-lear-db**: Base de datos PostgreSQL 17
   - Binding port: `5432:5432`
   - Credenciales (configurables): `postgres` / `postgres`
   - Nombre de base de datos: `colegio_lear`

2. **colegio-lear-backend-cli**: NodeJS para administración de Backend
   - Volumenes para desarrollo: `./backend:/app`
   - Binding port: `3000:3000`
   - Dependiente de: `colegio-lear-db`

3. **colegio-lear-admin-web-cli**: NodeJS para administración de portal web admin
   - Volumenes para desarrollo: `./frontend/admin-web:/app`
   - Binding port: `3001:80`

4. **colegio-lear-student-web-cli**: NodeJS para administración de portal web estudiantes
   - Volumenes para desarrollo: `./frontend/student-web:/app`
   - Binding port: `3002:80`

---

### Backend

#### Configuración de primer uso del Backend

1. Inicializamos el servicio de base de datos

```bash
docker compose up -d colegio-lear-db
```

2. Accedemos a la shell del backend

```bash
docker compose run -p 3000:3000 --rm colegio-lear-backend-cli
```

3. Dentro del contenedor ejecutamos las siguientes configuraciones

```bash
# Install dependencies
pnpm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your values (DATABASE_URL is already set via Docker env)

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev

# Run seed (creates admin users + test data)
npx prisma db seed

# Start the development server
pnpm run dev
```

4. Verificamos que todo funcione

   - API: http://localhost:3000/health
   - Swagger Docs: http://localhost:3000/api-docs

5. Login con credenciales de admin

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "sadmin",
  "password": "SuperAdmin123!"
}
```

> El login genera un HttpOnly cookie `access_token`. Todos los otros servicios consumos desde el frontend envia la cookie de forma automática.
> El campo `username` permite tanto el username como el email.


#### Comando de referencia

| Command                            | Description                           |
| ---------------------------------- | ------------------------------------- |
| `pnpm install`                     | Install dependencies                  |
| `pnpm run dev`                     | Start dev server (port 3000)          |
| `pnpm run build`                   | Build TypeScript                      |
| `pnpm test`                        | Run tests                             |
| `npx prisma generate`              | Regenerate Prisma client              |
| `npx prisma migrate dev`           | Apply pending migrations              |
| `npx prisma migrate reset --force` | Reset DB + re-apply migrations + seed |
| `npx prisma db seed`               | Run seed only                         |
| `npx prisma studio`                | Open Prisma Studio (DB GUI)           |

---

#### Environment Variables

Puede consultar el archivo `backend/.env.example` para configurar las variables de entorno para el archivo `backend/.env`.

| Variable                | Default                      | Description                                 |
| ----------------------- | ---------------------------- | ------------------------------------------- |
| `DATABASE_URL`          | (required)                   | PostgreSQL connection string                |
| `JWT_SECRET`            | (required)                   | Secret for signing JWT tokens               |
| `JWT_ACCESS_EXPIRATION` | `15m`                        | JWT expiration (e.g. 15m, 1h, 7d)           |
| `PORT`                  | `3000`                       | Server port                                 |
| `CORS_ORIGIN`           | `http://localhost:5173`      | Frontend URL for CORS                       |
| `FRONTEND_URL`          | `http://localhost:5173`      | Frontend URL used in emails (links/buttons) |
| `COOKIE_SECURE`         | `false`                      | Set `true` in production (HTTPS)            |
| `BCRYPT_SALT_ROUNDS`    | `10`                         | Bcrypt hashing rounds                       |
| `STORAGE_PROVIDER`      | `local`                      | `local` or `azure`                          |
| `MAIL_HOST`             | `smtp.gmail.com`             | SMTP host                                   |
| `MAIL_PORT`             | `587`                        | SMTP port                                   |
| `MAIL_USER`             | (required)                   | Email address for sending                   |
| `MAIL_PASSWORD`         | (required)                   | App Password (see Gmail setup below)        |
| `ADMIN1_NAME`           | `Super`                      | SuperAdmin first name                       |
| `ADMIN1_LAST_NAME`      | `Admin`                      | SuperAdmin last name                        |
| `ADMIN1_EMAIL`          | `superadmin@colegiolear.com` | SuperAdmin email                            |
| `ADMIN1_PASSWORD`       | `SuperAdmin123!`             | SuperAdmin password                         |
| `ADMIN2_NAME`           | `Admin`                      | Admin first name                            |
| `ADMIN2_LAST_NAME`      | `Two`                        | Admin last name                             |
| `ADMIN2_EMAIL`          | `admin2@colegiolear.com`     | Admin email                                 |
| `ADMIN2_PASSWORD`       | `Admin456!`                  | Admin password                              |

> Cuando el proyecto se ejecuta localmente, la variable `DATABASE_URL` se conecta automaticamente el servicio `colegio-lear-db`.

#### Configuración de envios de correo Gmail (Configuración SMTP)

El backend se encarga de enviar correos en diferentes procesos, si se requiere configurar un cliente de `gmail` diferente se deberían seguir los siguientes pasos.

1. **Enable 2-Step Verification** on your Google account:
   - Go to https://myaccount.google.com/security
   - Under "Signing in to Google", enable **2-Step Verification**

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other** (write "Colegio Lear")
   - Click **Generate**
   - Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)

3. **Configure your `.env`**:
   ```env
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASSWORD=abcdefghijklmnop
   ```

#### Autenticación

La `API` utiliza autenticación por `JWT` almacenada en un `HttpOnly Cookie`:

1. **Login** → `POST /auth/login` — sets `access_token` cookie
2. **All other endpoints** require the cookie (sent automatically by the browser)
3. **Logout** → `POST /auth/logout` — clears the cookie

Para probar la `API` en herramientas como Postman, Insomnia, etc., debes de habilitar `Send cookies` o utilizar el header `Authorization: Bearer <token>`.

---

### Frontend

La siguiente configuración funciona tanto para el `frontend` `admin-web` como para `student-web`.

#### Variables de entorno

Para que el proyecto funcione correctamente se debe de configura el archivo `.env` en la carpeta raíz de cada proyecto de `frontend`

Puede consultar el archivo `.env.example` para configurar las variables de entorno para el archivo `.env`.

| Variable                | Default                      | Description                                                                     |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| `VITE_API_URL`          | (required)                   | URL de API para servicios web (http://localhost:3001/api) para entorno mockable |
| `VITE_ENVIRONMENT`      | (required)                   | Entorno de ejecución en frontend (mockable, development, production)            |

--- 
### Inicializar entorno/servicios locales

Para inicializar un entorno local, basta con utilizar el comando siguiente:

```bash
docker compose up
```

Si se necesita inicializar uno de los servicios de forma independiente, puede ejecutar uno de los siguientes comandos:

```bash
# Start database first
docker compose up -d colegio-lear-db

# Backend utility container
docker compose run -p 3000:3000 --rm colegio-lear-backend-cli

# Admin web utility container
docker compose run -p 3001:80 --rm colegio-lear-admin-web-cli

# Student web utility container
docker compose run -p 3002:80 --rm colegio-lear-student-web-cli
```

> [!NOTE]
>
> - Los volumenes que existen actualmente es para poder editar cada proyecto y ver los cambios en tiempo real.
> - Utilizar `--rm` con el comando `docker compose run` elimina automaticamente los contenedores una vez detenidos.
> - Para generar un nuevo build de la imagen utiliza `--build` con el comando`docker compose`.
