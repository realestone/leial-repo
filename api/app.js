import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import receiptsRouter from "./routes/receipts.routes.js";
import usersRouter from "./routes/users.routes.js";
import { setupSwagger } from "./docs/swagger.js";

dotenv.config();

export function createApp() {
  const app = express();
  
  // Swagger docs
  setupSwagger(app);

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
  app.use(cors());
  app.use(express.json());

  // health
  app.get("/health", (_req, res) => {
    res.json({ ok: true, now: new Date().toISOString() });
  });

  // routes
  app.use("/receipts", receiptsRouter);
  app.use("/users", usersRouter);

  // 404
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  // after routes
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal error" });
});

return app;

}
