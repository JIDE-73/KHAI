import { Router } from "express";
import { querySearch, getSearchLogs } from "../../controllers/search/search.js";

const router = Router();

/**
 * @openapi
 * /search/query/{profileId}:
 *   post:
 *     summary: Ejecuta una búsqueda para un perfil
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query: { type: string }
 *     responses:
 *       200: { description: Resultado de la búsqueda }
 *       400: { description: Datos inválidos }
 *       401: { description: No autorizado }
 */
router.post("/query/:profileId", querySearch);

/**
 * @openapi
 * /search/logs/{profileId}:
 *   get:
 *     summary: Obtiene logs de búsqueda para un perfil
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista de logs }
 *       401: { description: No autorizado }
 */
router.get("/logs/:profileId", getSearchLogs);
export default router;
