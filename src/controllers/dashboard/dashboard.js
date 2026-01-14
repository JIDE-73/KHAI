import prisma from "../../../prisma/prismaClient.js";
import { check, validationResult } from "express-validator";

const recentDocuments = async (req, res) => {
  const { userId } = req.params;
  await check("userId")
    .isUUID()
    .withMessage("El ID de usuario no es válido.")
    .run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Perfil no valido." });
    }

    const logs = await prisma.search_log.findMany({
      where: { profile_id: profile.id },
      orderBy: { created_at: "desc" },
      take: 8,
      include: {
        results: {
          include: {
            document: {
              select: {
                id: true,
                title: true,
                created_at: true,
              },
            },
            links: true,
          },
        },
      },
    });

    const documents = logs.map((log) =>
      log.results.map((result) => result.document)
    );
    const links = logs.map((log) => log.results.map((result) => result.links));

    return res.status(200).json({
      message: "Documentos recientes obtenidos correctamente",
      documents,
      links,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error al obtener los documentos recientes.",
      error: error,
    });
  }
};

const mostViewedDocuments = async (req, res) => {
  const { userId } = req.params;
  await check("userId")
    .isUUID()
    .withMessage("El ID de usuario no es válido.")
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Perfil no valido." });
    }

    const documents = await prisma.documents.findMany({
      orderBy: { count: "desc" },
      select: {
        id: true,
        title: true,
        count: true,
        profile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 8,
    });
    return res.status(200).json({
      message: "Documentos más vistos obtenidos correctamente",
      documents,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener los documentos más vistos.",
      error: error,
    });
  }
};

export { recentDocuments, mostViewedDocuments };
