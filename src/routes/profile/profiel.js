import express from "express";
import { getProfile, createProfile } from "../../controllers/profile/profiel.js";

const router = express.Router();

router.get("/myProfile", getProfile);
router.post("/createProfile", createProfile);
export default router;