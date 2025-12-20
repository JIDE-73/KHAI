import "dotenv/config";
import express from "express";
import cors from "cors";

//rutas


const app = express();
app.set("port", process.env.PORT || 3000);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FORI,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// PUBLICAS
app.use("/serverAlive", (req, res) => {
  res.status(200).json({ message: `Welcome 1,000,000` });
});

//rutas


// Inicializacion del server
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
