import express from "express";

import {
  register,
  confirmEmail,
  login,
  logout,
} from "../../controllers/auth/auth.js";

const router = express.Router();

router.post("/register", register);
router.get("/confirm", confirmEmail);
router.post("/login", login);
router.post("/logout", logout);

export default router;
