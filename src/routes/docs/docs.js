import multer from "multer";
import express from "express";
import { uploadDocument } from "../../controllers/docs/docs.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const router = express.Router();

router.post("/upload/:userId", upload.single("file"), uploadDocument);

export default router;
