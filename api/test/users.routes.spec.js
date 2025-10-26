import request from "supertest";
import { createApp } from "../app.js";  // ✅ import your app factory
import { describe, it, expect } from "vitest";

const app = createApp();

describe("users", () => {
  it("creates a customer", async () => {
    const res = await request(app)
      .post("/users")
      .send({ role: "customer", display_name: "Lukas" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it("creates a merchant and org", async () => {
    const res = await request(app)
      .post("/users")
      .send({ role: "merchant", display_name: "Alice", merchant_name: "Cafe Java" });

    expect(res.status).toBe(201);
    expect(res.body.user.id).toBeDefined();
    expect(res.body.merchant.id).toBeDefined();
  });
});
