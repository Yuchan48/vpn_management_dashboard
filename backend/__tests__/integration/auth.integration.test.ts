import request from "supertest";
import app from "../../app";

describe("Auth API - Integration", () => {
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
