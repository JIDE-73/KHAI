import swaggerJsdoc from "swagger-jsdoc";

const PORT = process.env.PORT || 3000;
const HOST = process.env.API_BASE_URL || `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KHAI API",
      version: "1.0.0",
      description: "API documentation for the KHAI backend.",
    },
    servers: [
      {
        url: HOST,
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Add JSDoc @openapi blocks inside your route handlers/controllers
  apis: ["./src/routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
