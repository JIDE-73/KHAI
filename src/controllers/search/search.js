import prisma from "../../../prisma/prismaClient.js";
import { check, validationResult } from "express-validator";

const normalizeTsQuery = (query) => {
  return query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .join(" & ");
};

const querySearch = async (req, res) => {
  const { profileId } = req.params;
  const { query } = req.body;

  await check("profileId").notEmpty().withMessage("Missing profileId").run(req);

  await check("query")
    .isString()
    .notEmpty()
    .withMessage("Missing query")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  // Normalizar query
  const tsQuery = normalizeTsQuery(query);

  try {
    const documents = await prisma.$queryRaw`
  SELECT DISTINCT d.id, d.title, d.created_at
  FROM document_chunk dc
  JOIN documents d ON d.id = dc.document_id
  WHERE (
    dc.content_tsv @@ to_tsquery('spanish', ${tsQuery})
    OR d.title ILIKE '%' || ${query} || '%'
  )
  AND d.profile_id = ${profileId}
`;

    const links = await prisma.links.findMany({
      where: {
        profile_id: profileId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { url: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        url: true,
        created_at: true,
      },
    });

    res.status(200).json({
      query,
      documents,
      links,
    });

    prisma
      .$transaction(async (tx) => {
        const search = await tx.search_log.create({
          data: {
            profile_id: profileId,
            query,
          },
        });

        const results = [
          ...documents.map((d) => ({
            search_id: search.id,
            result_type: "document",
            document_id: d.id,
          })),
          ...links.map((l) => ({
            search_id: search.id,
            result_type: "links",
            links_id: l.id,
          })),
        ];

        if (results.length) {
          await tx.search_result.createMany({ data: results });
        }
      })
      .catch(() => {
        // logging silencioso
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Search error",
      details: error.message,
    });
  }
};

const getSearchLogs = async (req, res) => {
  const { profileId } = req.params;

  await check("profileId").notEmpty().withMessage("Missing profileId").run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    const logs = await prisma.search_log.findMany({
      where: { profile_id: profileId },
      orderBy: { created_at: "desc" },
      take: 1,
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

    res.status(200).json({ message: "Search logs fetched successfully", logs });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Search error", details: error.message });
  }
};

export { querySearch, getSearchLogs };
