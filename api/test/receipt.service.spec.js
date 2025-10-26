import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /receipts returns points", () => {
  it("lists receipts with computed points", async () => {
    // 1) create a user
    const u = await request(app)
      .post("/users")
      .send({ role: "customer", display_name: "Points Tester" });
    expect(u.status).toBe(201);
    const userId = u.body.id;

    // 2) create two receipts
    const r1 = await request(app)
      .post("/receipts")
      .send({ user_id: userId, merchant_name: "Shop A", total_cents: 12300 });
    expect(r1.status).toBe(201);

    const r2 = await request(app)
      .post("/receipts")
      .send({ user_id: userId, merchant_name: "Shop B", total_cents: 9900 });
    expect(r2.status).toBe(201);

    // 3) fetch list and assert points present & correct
    const list = await request(app).get("/receipts");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(2);

    // latest first; both rows must have points = total_cents/100
    const got = list.body.map(r => ({ total_cents: r.total_cents, points: r.points }));
    // Assert that each item has integer points and matches rule
    for (const g of got) {
      expect(typeof g.points).toBe("number");
      expect(g.points).toBe(Math.round(g.total_cents / 100));
    }
  });
});
