# COLEGIO LEAR

`COLEGIO LEAR` is a project focus on student service, from administrative operations to manage the student lifecycle, unit self-service site for students.

## Docker Compose

This project uses Docker Compose to manage development containers. The configuration is defined in the `compose.yaml` file.

### Available Services

The project includes the following containerized services:

1. **colegio-lear-db** - PostgreSQL 17 database
   - Port: `5432:5432`
   - Credentials: `postgres` / `postgres`
   - Database: `colegio_lear`

2. **colegio-lear-backend-cli** - Node.js container for the backend
   - Volume: `./backend:/app`
   - Port: `3000:3000`
   - Depends on: `colegio-lear-db` (waits for healthy)

3. **colegio-lear-admin-web-cli** - Node.js container for the admin panel
   - Volume: `./frontend/admin-web:/app`
   - Port: `80:80`

4. **colegio-lear-student-web-cli** - Node.js container for the student web
   - Volume: `./frontend/student-web:/app`
   - Port: `80:80`

---

## Backend Setup (First Time)

### 1. Start the database

```bash
docker compose up -d colegio-lear-db
```

Wait a few seconds for PostgreSQL to be ready.

### 2. Enter the backend container

```bash
docker compose run -p 3000:3000 --rm colegio-lear-backend-cli
```

### 3. Inside the container, run the setup

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

### 4. Verify it works

- API: http://localhost:3000/health
- Swagger Docs: http://localhost:3000/api-docs

### 5. Login with admin credentials

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "identifier": "aone",
  "password": "Admin123!"
}
```

> The login sets an HttpOnly cookie `access_token`. All other endpoints require this cookie.

---

## Backend Quick Reference

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

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable           | Default                  | Description                      |
| ------------------ | ------------------------ | -------------------------------- |
| `DATABASE_URL`     | (required)               | PostgreSQL connection string     |
| `JWT_SECRET`       | (required)               | Secret for signing JWT tokens    |
| `PORT`             | `3000`                   | Server port                      |
| `CORS_ORIGIN`      | `http://localhost:5173`  | Frontend URL for CORS            |
| `COOKIE_SECURE`    | `false`                  | Set `true` in production (HTTPS) |
| `STORAGE_PROVIDER` | `local`                  | `local` or `azure`               |
| `MAIL_PROVIDER`    | `gmail`                  | `gmail` or `smtp`                |
| `ADMIN1_EMAIL`     | `admin1@colegiolear.com` | Admin 1 email                    |
| `ADMIN1_PASSWORD`  | `Admin123!`              | Admin 1 password                 |
| `ADMIN2_EMAIL`     | `admin2@colegiolear.com` | Admin 2 email                    |
| `ADMIN2_PASSWORD`  | `Admin456!`              | Admin 2 password                 |

> When running inside Docker, `DATABASE_URL` is automatically set to connect to the `colegio-lear-db` container.

---

## Authentication

The API uses JWT stored in HttpOnly cookies:

1. **Login** → `POST /auth/login` — sets `access_token` cookie
2. **All other endpoints** require the cookie (sent automatically by the browser)
3. **Logout** → `POST /auth/logout` — clears the cookie

For API testing tools (Postman, Insomnia), enable "Send cookies" or use the `Authorization: Bearer <token>` header as fallback.

---

## Seed Data

Running `npx prisma db seed` creates:

- 3 Academic Levels (Preescolar, Primaria, Secundaria)
- 6 Education Levels
- 6 School Subjects
- 4 Scholarships
- 5 Payment Concepts
- 1 Security Role "Administrador" (full access to all 14 modules)
- 1 Job Title "Director General"
- 2 Admin Employees (credentials from env vars)

---

## Start a service

To start one of the available services locally you will need to run a command like the following:

```bash
# Start database first
docker compose up -d colegio-lear-db

# Backend utility container
docker compose run -p 3000:3000 --rm colegio-lear-backend-cli

# Admin web utility container
docker compose run -p 80:80 --rm colegio-lear-admin-web-cli

# Student web utility container
docker compose run -p 80:80 --rm colegio-lear-student-web-cli
```

> [!NOTE]
>
> - Mounted volumes allow you to edit code locally and see changes in real-time
> - Port `80` is exposed on many services. If you need to run multiple services simultaneously, you will need to modify the ports in `compose.yaml`
> - Use `--rm` with `docker compose run` to automatically clean up the container after execution
> - To stop without removing volumes, use `docker compose stop`. To remove them, use `docker compose down`
> - To re-build the image remember to use `--build` with `docker compose` command

> [!IMPORTANT]
> Remember to use the specific service according about you going to develop, because all the dependencies and volumes will work different
