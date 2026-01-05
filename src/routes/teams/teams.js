import express from "express";
import { teamMembers } from "../../controllers/teams/teams.js";

const router = express.Router();

/**
 * @openapi
 * /teams/getTeam/{userId}:
 *   get:
 *     summary: Obtiene el equipo asociado al usuario
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Miembros del equipo }
 *       401: { description: No autorizado }
 */
router.get("/getTeam/:userId", teamMembers);

export default router;
