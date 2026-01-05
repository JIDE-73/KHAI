import { Router } from "express";
import { querySearch, getSearchLogs } from "../../controllers/search/search.js";

const router = Router();

router.post("/query/:profileId", querySearch);
router.get("/logs/:profileId", getSearchLogs);
export default router;