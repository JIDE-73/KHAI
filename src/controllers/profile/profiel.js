import { check, validationResult } from "express-validator";
import prisma from "../../../prisma/prismaClient.js";

const getProfile = async (req, res) => {
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
      include: {
        team: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Perfil no encontrado." });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

const createProfile = async (req, res) => {
  const { userId, username, teamname, teamrole, teamid } = req.body;

  await check("userId")
    .isUUID()
    .withMessage("El ID de usuario no es válido.")
    .run(req);
  await check("username")
    .isString()
    .withMessage("El nombre de usuario no es válido.")
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  var permissions = "Reader";

  try {
    if (teamrole === "Owner") {
      permissions = "Admin";

      const profile = await prisma.profiles.create({
        data: {
          id: userId,
          name: username,
          permissions,
        },
      });

      if (!profile) {
        return res.status(400).json({ error: "Error al crear el perfil." });
      }

      const team = await prisma.team.create({
        data: {
          name: teamname,
          owner_id: profile.id,
        },
      });

      if (!team) {
        return res.status(400).json({ error: "Error al crear el equipo." });
      }

      const teamMember = await prisma.team_members.create({
        data: {
          team_id: team.id,
          profile_id: profile.id,
          role: teamrole,
        },
      });

      if (!teamMember) {
        return res
          .status(400)
          .json({ error: "Error al crear el miembro del equipo." });
      }
    } else {
      const profile = await prisma.profiles.create({
        data: {
          id: userId,
          name: username,
          permissions,
        },
      });

      if (!profile) {
        return res.status(400).json({ error: "Error al crear el perfil." });
      }

      const teamMember = await prisma.team_members.create({
        data: {
          team_id: teamid,
          profile_id: profile.id,
        },
      });
      if (!teamMember) {
        return res
          .status(400)
          .json({ error: "Error al crear el miembro del equipo." });
      }
    }
    return res.status(201).json({ message: "Perfil creado exitosamente." });
  } catch (error) {
    console.error("Error al crear el perfil:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

const profielVerification = async (req, res) => {
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
      include: {
        team: true,
        memberships: {
          include: {
            team: true,
          },
        },
      }
    });

    if (!profile) {
      return res.status(404).json({ error: "Perfil no encontrado." });
    }

    return res.status(200).json({ message: "Perfil verificado exitosamente.", data: profile });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export { getProfile, createProfile, profielVerification };
