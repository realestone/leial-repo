import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./test-app.js";

describe("routes", () => {
  it("GET /health returns ok:true", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("now");
  });
});
