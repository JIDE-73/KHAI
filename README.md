KHAI - API Backend
===================

Formato de referencia rápida de endpoints
-----------------------------------------
- Base URL: `http://localhost:<PORT>` (por defecto 3000)
- Las rutas protegidas requieren cookies `sb-access-token`/`sb-refresh-token` y el middleware `validateCookies`.
- En clientes usar `credentials: "include"` para enviar cookies.

Saludo
-----
GET `/serverAlive`
- Respuesta 200:
  - body:
    {
      "message": "Welcome 1,000,000"
    }

Autenticación (`/auth`)
-----------------------
POST `/auth/register`
- body:
  {
    "email": "usuario@dominio.com",
    "password": "min 6 caracteres"
  }
- respuestas:
  - 201: {"message":"Registro exitoso. Revisa tu correo para confirmar la cuenta.","user":{"id":"...","email":"..."}}
  - 400: {"errors":[...]} o {"message":"<motivo>"}
  - 500: {"message":"Error interno en registro","details":"..."}

GET `/auth/confirm`
- query:
  ?code=<codigo_de_supabase>
- efecto: intercambia el código por sesión y setea cookies.
- respuestas:
  - 200: {"message":"Cuenta confirmada correctamente","user":{...}}
  - 400: {"message":"Falta el código de confirmación"} o error de Supabase
  - 500: {"message":"Error al confirmar la cuenta","details":"..."}

POST `/auth/login`
- body:
  {
    "email": "usuario@dominio.com",
    "password": "..."
  }
- respuestas:
  - 200: {"message":"Login exitoso","user":{...}} (setea cookies)
  - 400: {"errors":[...]} o {"message":"<motivo>"}
  - 500: {"message":"Error al iniciar sesión","details":"..."}

POST `/auth/logout`
- body: (vacío)
- respuestas:
  - 200: {"message":"Sesión cerrada"} (limpia cookies en cliente)
  - 500: {"message":"Error al cerrar sesión","details":"..."}
- nota: no revoca tokens en Supabase (requiere service role).

Perfil protegido (`/profile`) — requiere cookies válidas
-------------------------------------------------------
GET `/profile/myProfile`
- body: (vacío)
- respuestas:
  - 200: perfil del usuario autenticado con:
    - datos de `prisma.profiles`
    - `user_roles` con `roles`
    - `search_logs`
  - 400: {"error":"El ID de usuario es obligatorio."}
  - 404: {"error":"Perfil no encontrado."}
  - 500: {"error":"Error interno del servidor."}

Referencias rápidas
-------------------
- Middleware: `src/middlewares/authMiddleware.js`
- Controladores: `src/controllers/auth/auth.js`, `src/controllers/profile/profiel.js`
- Rutas: `src/routes/auth/auth.js`, `src/routes/profile/profiel.js`