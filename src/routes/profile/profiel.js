import express from "express";
import {
  getProfile,
  createProfile,
  profielVerification,
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
router.get("/myProfile/:userId", getProfile);

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

/**
 * @openapi
 * /profile/verifyProfile/{userId}:
 *   post:
 *     summary: Verifica el perfil del usuario
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil verificado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Perfil no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/verifyProfile/:userId", profielVerification);

export default router;
