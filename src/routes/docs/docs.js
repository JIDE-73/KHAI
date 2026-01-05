import multer from "multer";
import express from "express";
import {
  uploadDocument,
  uploadLink,
  getMyDocument,
  getMyLinks,
} from "../../controllers/docs/docs.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const router = express.Router();

/**
 * @openapi
 * /docs/upload/{userId}:
 *   post:
 *     summary: Sube un documento para el usuario
 *     tags: [Docs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Archivo subido }
 *       400: { description: Datos inválidos }
 *       401: { description: No autorizado }
 */
router.post("/upload/:userId", upload.single("file"), uploadDocument);

/**
 * @openapi
 * /docs/myDocuments/{userId}:
 *   get:
 *     summary: Lista documentos del usuario
 *     tags: [Docs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista de documentos }
 *       401: { description: No autorizado }
 */
router.get("/myDocuments/:userId", getMyDocument);

/**
 * @openapi
 * /docs/uploadLink/{userId}:
 *   post:
 *     summary: Registra un link externo para el usuario
 *     tags: [Docs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string, format: uri }
 *               title: { type: string }
 *     responses:
 *       201: { description: Link guardado }
 *       400: { description: Datos inválidos }
 *       401: { description: No autorizado }
 */
router.post("/uploadLink/:userId", uploadLink);

/**
 * @openapi
 * /docs/myLinks/{userId}:
 *   get:
 *     summary: Lista links guardados del usuario
 *     tags: [Docs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista de links }
 *       401: { description: No autorizado }
 */
router.get("/myLinks/:userId", getMyLinks);

export default router;
