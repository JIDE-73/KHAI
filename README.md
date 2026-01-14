KHAI - API Backend
===================

Quick API reference
-------------------
- Base URL: `http://localhost:<PORT>` (default 3000).
- Swagger docs: `GET /api-docs` (UI) and `GET /api-docs.json` (schema).
- Authentication: `/auth/login` and `/auth/confirm` set cookies `sb-access-token` and `sb-refresh-token`. All protected routes use the `validateCookies` middleware to validate `sb-access-token` against Supabase.
- Clients must send cookies with `credentials: "include"` (or equivalent).

Environment variables
---------------------
Set these before starting the server (do not commit secrets):
- `PORT`: server port (default 3000).
- `API_BASE_URL`: base URL used in Swagger (e.g. `http://localhost:3000`).
- `FORI`: allowed CORS origin (frontend URL).
- `ENV`: when `production`, cookies are marked `secure`.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: Supabase anon key.
- `DATABASE_URL`: Postgres connection string for Prisma.
- `DIRECT_URL`: (optional) direct URL for Prisma operations.

Public endpoints
----------------
- Health: `GET /serverAlive` → `{"message":"Welcome 1,000,000"}`
- Auth (`/auth`):
  - `POST /auth/register` body `{ email, password }` → 201 creates user in Supabase and sends confirmation email.
  - `GET /auth/confirm?code=<code>` → exchanges code for session and sets cookies.
  - `POST /auth/login` body `{ email, password }` → sets session cookies.
  - `POST /auth/logout` → clears cookies (does not revoke tokens in Supabase).

Protected endpoints (require valid cookies)
-------------------------------------------
Profile (`/profile`)
- `GET /profile/myProfile/:userId` → profile with its team; validates `userId` as UUID.
- `POST /profile/createProfile` body `{ userId, username, teamname, teamrole, teamid }`
  - If `teamrole` = `"Owner"`: creates profile, creates team with that owner, and adds them as member with that role.
  - Otherwise: creates profile and associates as member of team `teamid`.
  - 201 response: `{ message: "Perfil creado exitosamente." }`
- `GET /profile/verifyProfile/:userId` → validates UUID and returns `{ message, data: profile+team+memberships }`.

Docs (`/docs`)
- `POST /docs/upload/:userId` (multipart `file`) → accepts pdf/doc/docx/txt up to 5 MB, extracts text, creates document and 1000-char chunks. 200 `{ message, chunkCount }`. 401/402/403/409/422/500 on errors.
- `GET /docs/myDocuments/:userId` → `{ document: [...] }` with profile.
- `POST /docs/uploadLink/:userId` body `{ title, url }` → saves link. 200 `{ message }`.
- `GET /docs/myLinks/:userId` → `{ links: [...] }` with profile.

Search (`/search`)
- `POST /search/query/:profileId` body `{ query }` → searches `document_chunk` (Spanish full-text) and links; returns `{ query, documents, links }` and logs results.
- `GET /search/logs/:profileId` → last 8 logs with results and related documents/links.

Teams (`/teams`)
- `GET /teams/getTeam/:userId` → finds team where `owner_id = userId` and returns `{ team }` with `members.profile`. 404 if none.

References
----------
- Middleware: `src/middlewares/authMiddleware.js`
- Controllers: `src/controllers/**`
- Routes: `src/routes/**`
- Swagger config: `src/server/swagger.js`

Install and run
---------------
1) Install deps:
```bash
npm install
```
2) Generate Prisma client (requires `DATABASE_URL`):
```bash
npx prisma generate
```
Optional: apply migrations if needed:
```bash
npx prisma migrate dev --name init
```
3) Start in development (nodemon):
```bash
npm run dev
```
Production:
```bash
npm start
```