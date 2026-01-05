import express from "express";

import {
  register,
  confirmEmail,
  login,
  logout,
} from "../../controllers/auth/auth.js";

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registra un usuario y envía correo de confirmación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               name: { type: string }
 *     responses:
 *       201: { description: Usuario creado }
 *       400: { description: Datos inválidos }
 */
router.post("/register", register);

/**
 * @openapi
 * /auth/confirm:
 *   get:
 *     summary: Confirma el correo electrónico del usuario
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Correo confirmado }
 *       400: { description: Token inválido }
 */
router.get("/confirm", confirmEmail);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Login exitoso }
 *       401: { description: Credenciales inválidas }
 */
router.post("/login", login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cierra sesión y limpia cookies/token
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logout exitoso }
 *       401: { description: No autorizado }
 */
router.post("/logout", logout);

export default router;
