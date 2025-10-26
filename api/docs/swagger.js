import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.3",
    info: { title: "Leial API", version: "0.1.0" },
    servers: [{ url: "http://localhost:4000" }],
  },
  // 👇 tell swagger-jsdoc where to look for the JSDoc comments
  apis: ["./routes/*.js"],
};

export function setupSwagger(app) {
  const specs = swaggerJsdoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
}
