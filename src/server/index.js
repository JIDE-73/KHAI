import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import validateCookies from "../middlewares/authMiddleware.js";

// Public
import authRoutes from "../routes/auth/auth.js";
// PROTECTED
import profileRoutes from "../routes/profile/profiel.js";

const app = express();
app.set("port", process.env.PORT || 3000);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FORI,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// PUBLIC
app.use("/serverAlive", (req, res) => {
  res.status(200).json({ message: `Welcome 1,000,000` });
});

app.use("/auth", authRoutes);

// MIDDLEWARE
app.use(validateCookies);

// PROTECTED
app.use("/profile", profileRoutes);

// Inicializacion del server
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
