import prisma from "../../../prisma/prismaClient.js";
import { check, param, validationResult } from "express-validator";
import crypto from "crypto";
import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const { PdfReader } = require("pdfreader");

const extractPdfText = (buffer) =>
  new Promise((resolve, reject) => {
    let text = "";
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) return reject(err);
      if (!item) return resolve(text);
      if (item.text) text += item.text + " ";
    });
  });

const uploadDocument = async (req, res) => {
  const CHUNK_SIZE = 1000; // char

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
    // extraer el texto del archivo
    let extractedText = "";

    if (file.mimetype === "application/pdf") {
      extractedText = await extractPdfText(file.buffer);
    }

    if (file.mimetype.includes("word")) {
      const result = await mammoth.extractRawText({
        buffer: file.buffer,
      });
      extractedText = result.value;
    }

    if (file.mimetype === "text/plain") {
      extractedText = file.buffer.toString("utf-8");
    }

    extractedText = extractedText.replace(/\s+/g, " ").trim();

    if (!extractedText) {
      return res.status(422).json({
        message: "No se pudo extraer texto del documento",
      });
    }

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return res.status(403).json({ message: "Profile not found" });
    }

    // Calcular MD5 del archivo
    const md5Hash = crypto.createHash("md5").update(file.buffer).digest("hex");

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
    for (let i = 0; i < extractedText.length; i += CHUNK_SIZE) {
      chunks.push(extractedText.slice(i, i + CHUNK_SIZE));
    }

    // Guardar cada chunk con su índice
    await prisma.document_chunk.createMany({
      data: chunks.map((text, idx) => ({
        document_id: document.id,
        chunk_index: idx,
        content: text,
      })),
    });

    return res.status(200).json({
      message: "Documento subido correctamente",
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.log(error);

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Document already exists" });
    }

    return res
      .status(500)
      .json({ message: "Error al subir el documento", details: error.message });
  }
};

const uploadLink = async (req, res) => {
  const { userId } = req.params;
  const { title, url } = req.body;

  await param("userId").notEmpty().withMessage("userId is required").run(req);
  await check("title").notEmpty().withMessage("title is required").run(req);
  await check("url").isURL().withMessage("url is not a valid URL").run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const links = await prisma.links.create({
      data: {
        url: url,
        title: title,
        profile_id: userId,
      },
    });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Error al subir el enlace", details: error.message });
  }

  return res.status(200).json({ message: "Enlace subido correctamente" });
};

const getMyDocument = async (req, res) => {
  const { userId } = req.params;
  const document = await prisma.documents.findMany({
    where: { profile_id: userId },
    include: {
      profile: true,
    },
  });
  return res.status(200).json({ document });
};

const getMyLinks = async (req, res) => {
  const { userId } = req.params;
  const links = await prisma.links.findMany({
    where: { profile_id: userId },
    include: {
      profile: true,
    },
  });
  return res.status(200).json({ links });
};

const getDocumentById = async (req, res) => {
  const { documentId } = req.params;
  try {
    const document = await prisma.documents.findUnique({
      where: { id: documentId },
      include: {
        profile: true,
      },
    });

    const count = await prisma.documents.update({
      where: { id: documentId },
      data: {
        count: document.count + 1,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }

    return res.status(200).json({ message: "Documento encontrado", document });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener el documento",
    });
  }
};

export { uploadDocument, uploadLink, getMyDocument, getMyLinks, getDocumentById };
