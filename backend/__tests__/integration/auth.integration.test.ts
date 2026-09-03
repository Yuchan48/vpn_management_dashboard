import request from "supertest";
import app from "../../app";
import { createUser } from "../../services/user.service";
import { db } from "../../database/db";

describe("Auth API - Integration", () => {
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

  it("should login successfully with valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Login successful");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should reject login with invalid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
  });
});
