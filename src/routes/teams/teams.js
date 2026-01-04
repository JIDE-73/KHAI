import express from "express";
import { teamMembers } from "../../controllers/teams/teams.js";

const router = express.Router();

router.get("/getTeam/:userId", teamMembers);

export default router;