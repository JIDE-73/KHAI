import express from "express";
import {
  getProfile,
  createProfile,
} from "../../controllers/profile/profiel.js";

const router = express.Router();

/**
 * @openapi
 * /profile/myProfile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       401:
 *         description: No autorizado
 */
router.get("/myProfile", getProfile);

/**
 * @openapi
 * /profile/createProfile:
 *   post:
 *     summary: Crea o actualiza el perfil del usuario
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               role: { type: string }
 *               bio: { type: string }
 *     responses:
 *       201: { description: Perfil creado/actualizado }
 *       400: { description: Datos inválidos }
 *       401: { description: No autorizado }
 */
router.post("/createProfile", createProfile);
export default router;
