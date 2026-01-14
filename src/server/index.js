import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import validateCookies from "../middlewares/authMiddleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

// Public
import authRoutes from "../routes/auth/auth.js";
// PROTECTED
import profileRoutes from "../routes/profile/profiel.js";
import docsRoutes from "../routes/docs/docs.js";
import teamsRoutes from "../routes/teams/teams.js";
import searchRoutes from "../routes/search/search.js";
import dashboardRoutes from "../routes/dashboard/dashboard.js";

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

// Swagger docs (public)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});

// PUBLIC
app.use("/serverAlive", (req, res) => {
  res.status(200).json({ message: `Welcome 1,000,000` });
});

app.use("/auth", authRoutes);

// MIDDLEWARE
app.use(validateCookies);

// PROTECTED
app.use("/profile", profileRoutes);
app.use("/docs", docsRoutes);
app.use("/teams", teamsRoutes);
app.use("/search", searchRoutes);
app.use("/dashboard", dashboardRoutes);

// Inicializacion del server
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
