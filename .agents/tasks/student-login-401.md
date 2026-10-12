# Student login 401 (LR-2026-0001 / Estudiante123!)

## Summary
Root cause NOT conclusively proven. Live checks were blocked. The backend is not running and the Supabase DB was unreachable from this machine. The code path for student login is correct and not behind auth middleware. The most likely causes, in order:
1. The client calls the wrong endpoint. The employee `POST /auth/login` (or any protected route) rejects a student code with 401. The student endpoint is `POST /auth/student/login` with body `{ "username", "password" }`, and there is no `/api` prefix.
2. The DB row for LR-2026-0001 has a missing or different password hash. This happens if the DB was seeded before `20260608040000_student_add_password`, or the seed did not run against this DB. The seed does hash "Estudiante123!" (`prisma/seed.ts:1566`, assigned at `:1638`).
3. Cannot be ruled out: the student exists but the stored hash is stale, so bcrypt compare fails and returns "Credenciales inválidas" (401).

Note: an inactive or deleted student returns 403, not 401, so that is not the cause of a plain 401.

## Evidence
- `backend/.env`: PORT=3000. Nothing listens on 3000 (`Get-NetTCPConnection` empty), so I could not call the endpoint. `Invoke-RestMethod` got "No es posible conectar con el servidor remoto".
- `backend/logs/application-2026-10-06.log` is 0 bytes. There is no error history there.
- `backend/src/index.ts:60-62`: `/auth` (employee) and `/auth/student` are mounted as public routes before any global `authenticate`. In `auth.routes.ts` only `/reset-password` and `/me` use `authenticate`. No fall-through from the employee router intercepts `/auth/student/login`.
- `auth-student.routes.ts:55`: `router.post("/login", validate(studentLoginSchema,"body"), login)`. No auth middleware. The schema requires `username` and `password`.
- `auth-student.service.ts` `login()` (lines 67-104):
  - Looks up by `email` OR `enrollment`, case-insensitive. `LR-2026-0001` matches `enrollment`.
  - Missing student returns 401 "Credenciales inválidas".
  - `isDeleted` or `!isActive` returns 403.
  - `bcrypt.compare(password, student.password)` failure returns 401 "Credenciales inválidas".
  - JWT payload is `{studentId, email}`, with no role.
- `auth-student.middleware.ts`: 401 "El token de acceso es requerido" or "inválido" only applies to protected student routes (`/me`, etc.), not to login. A "no autorizado" from the UI could come from `/auth/student/me` right after login, if the cookie is not stored (CORS_ORIGIN/credentials or cookie settings mismatch between the student-web origin and the API).
- Seed: `prisma/seed.ts:1608` builds the code as `LR-2026-${seq padded to 4}`, and `:1638` sets `password: studentPassword`. So LR-2026-0001 is the first seeded student, if the seed ran.
- DB check: `select ... from students where enrollment ilike 'LR-2026%'` could not run. The connection to the pooler (`aws-0-us-west-2.pooler.supabase.com:5432`) timed out and `Test-NetConnection` hung. Whether the row exists, is active, or has a matching hash is unverified.

## Recommendations (nothing implemented)
1. Start the backend (`npm run dev` in `backend`) and test:
   `Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/student/login -ContentType application/json -Body '{"username":"LR-2026-0001","password":"Estudiante123!"}'`
   - 401 "Credenciales inválidas": the student is missing or the hash mismatches. Re-run `npm run prisma:deploy`, then `npx prisma db seed` (check the seed is idempotent for the password), or reset the hash for that row.
   - 403: the account is inactive or deleted.
   - Success: the problem is in the client (wrong URL, or cookie/CORS on `/me`). Check `CORS_ORIGIN` matches the student-web origin and that the client sends `credentials: 'include'`.
2. Confirm the network to Supabase works (VPN, firewall, paused free-tier project). Login cannot work without the DB.
3. If the student-web client posts to `/auth/login`, point it at `/auth/student/login` with `username`.
4. Possible improvement: log the reason for failed student logins at debug level. Today the log is empty, which makes this kind of diagnosis slow.
