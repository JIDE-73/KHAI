import express from "express";
import { recentDocuments, mostViewedDocuments } from "../../controllers/dashboard/dashboard.js";

const router = express.Router();

router.get("/recentDocuments/:userId", recentDocuments);
router.get("/mostViewedDocuments/:userId", mostViewedDocuments);

export default router;