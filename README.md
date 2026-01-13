KHAI - API Backend
===================

Referencia rápida de la API
---------------------------
- Base URL: `http://localhost:<PORT>` (por defecto 3000).
- Documentación Swagger: `GET /api-docs` (UI) y `GET /api-docs.json` (esquema).
- Autenticación: `/auth/login` y `/auth/confirm` setean cookies `sb-access-token` y `sb-refresh-token`. Todas las rutas protegidas pasan por el middleware `validateCookies` que valida el `sb-access-token` con Supabase.
- Clientes deben enviar cookies con `credentials: "include"` o equivalente.

Endpoints públicos
------------------
- Saludo: `GET /serverAlive` → `{"message":"Welcome 1,000,000"}`
- Auth (`/auth`):
  - `POST /auth/register` body `{ email, password }` → 201 crea usuario en Supabase y envía correo de confirmación.
  - `GET /auth/confirm?code=<codigo>` → intercambia el código por sesión y setea cookies.
  - `POST /auth/login` body `{ email, password }` → setea cookies de sesión.
  - `POST /auth/logout` → limpia cookies (no revoca tokens en Supabase).

Endpoints protegidos (requieren cookies válidas)
------------------------------------------------
Profile (`/profile`)
- `GET /profile/myProfile/:userId` → perfil con su equipo (`team`). Valida que `userId` sea UUID.
- `POST /profile/createProfile` body `{ userId, username, teamname, teamrole, teamid }`
  - Si `teamrole` = `"Owner"`: crea perfil, crea equipo (`team`) con owner y lo añade como miembro con ese rol.
  - Caso contrario: crea perfil y lo asocia como miembro al equipo `teamid`.
  - Respuesta 201: `{ message: "Perfil creado exitosamente." }`
- `GET /profile/verifyProfile/:userId` → valida UUID y devuelve `{ message, data: perfil+team+memberships }`.

Docs (`/docs`)
- `POST /docs/upload/:userId` (multipart `file`) → permite pdf/doc/docx/txt hasta 5 MB, extrae texto, crea documento y chunks (1000 chars). 200 `{ message, chunkCount }`. 401/402/403/409/422/500 en errores.
- `GET /docs/myDocuments/:userId` → `{ document: [...] }` con perfil.
- `POST /docs/uploadLink/:userId` body `{ title, url }` → guarda link. 200 `{ message }`.
- `GET /docs/myLinks/:userId` → `{ links: [...] }` con perfil.

Search (`/search`)
- `POST /search/query/:profileId` body `{ query }` → busca en `document_chunk` (full-text español) y links; responde `{ query, documents, links }` y registra el log y resultados.
- `GET /search/logs/:profileId` → últimos 8 logs con resultados y documentos/links relacionados.

Teams (`/teams`)
- `GET /teams/getTeam/:userId` → busca el equipo donde `owner_id = userId` y retorna `{ team }` con `members.profile`. 404 si no existe.

Referencias
-----------
- Middleware: `src/middlewares/authMiddleware.js`
- Controladores: `src/controllers/**`
- Rutas: `src/routes/**`
- Swagger config: `src/server/swagger.js`