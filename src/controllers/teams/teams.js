import prisma from "../../../prisma/prismaClient.js";
import { check, validationResult } from "express-validator";

const teamMembers = async (req, res) => {
  const { userId } = req.params;

  await check("userId").isUUID().withMessage("userId is required").run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    // owner_id is not unique; use findFirst to fetch a team for this owner
    const team = await prisma.team.findFirst({
      where: { owner_id: userId },
      include: { members: true },
    });

    if (!team) {
      return res.status(404).json({ message: "Equipo no encontrado" });
    }

    return res.status(200).json({ message: "Equipo encontrado", team });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error al buscar el equipo", details: error.message });
  }
};

export { teamMembers };
