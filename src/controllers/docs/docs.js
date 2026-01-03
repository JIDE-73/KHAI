import prisma from "../../../prisma/prismaClient.js";
import { param, validationResult } from "express-validator";
import crypto from "crypto";

const uploadDocument = async (req, res) => {
  const { userId } = req.params;
  const file = req.file;

  // Tipos de archivo permitidos
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  await param("userId")
    .isString()
    .withMessage("userId must be a string")
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty() || !file) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  // Verificar tipo de archivo
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(401).json({ message: "File type not allowed" });
  }

  if (file.size > 1024 * 1024 * 5) {
    return res.status(402).json({ message: "File size is too large" });
  }

  try {
    // Calcular MD5 del archivo
    const md5Hash = crypto.createHash("md5").update(file.buffer).digest("hex");

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return res.status(403).json({ message: "Profile not found" });
    }

    // Crear el documento
    const document = await prisma.documents.create({
      data: {
        title: file.originalname,
        source: file.mimetype,
        content: file.buffer.toString("base64"),
        content_sha: md5Hash,
        profile_id: userId,
        file_size: file.size,
      },
    });

    // Crear los chunks
    const chunks = [];
    const CHUNK_SIZE = 1024 * 1024; // 1MB
    for (let offset = 0; offset < file.buffer.length; offset += CHUNK_SIZE) {
      const slice = file.buffer.subarray(offset, offset + CHUNK_SIZE);
      chunks.push(slice.toString("base64"));
    }

    // Guardar cada chunk con su índice
    await prisma.document_chunk.createMany({
      data: chunks.map((content, idx) => ({
        document_id: document.id,
        chunk_index: idx,
        content,
      })),
    });

    return res.status(200).json({
      message: "Documento subido correctamente",
      documentId: document.id,
      chunkCount: chunks.length,
      profile_id: profile.id,
      profile_name: profile.name,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Document already exists" });
    }

    return res
      .status(500)
      .json({ message: "Error al subir el documento", details: error.message });
  }
};

const getMyDocument = async (req, res) => {
  const { userId } = req.params;
  const document = await prisma.documents.findMany({
    where: { profile_id: userId },
  });
  return res.status(200).json({ document });
};

export { uploadDocument, getMyDocument };
