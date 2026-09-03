import request from "supertest";
import app from "../../app";
import { createUser } from "../../services/user.service";
import { db } from "../../database/db";

describe("User API - Integration", () => {
  beforeAll(async () => {
    await createUser("testuser", "password123", 0);
  });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM users WHERE username = ?", ["testuser"], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it("should reject unauthenticated requests", async () => {
    const response = await request(app).get("/api/users/me");

    expect(response.status).toBe(401);
  });

  it("should return the current authenticated user", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      username: "testuser",
      password: "password123",
    });

    const response = await agent.get("/api/users/me");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("username", "testuser");
    expect(response.body).toHaveProperty("role", "user");
    expect(response.body).toHaveProperty("is_demo", 0);
  });
});
