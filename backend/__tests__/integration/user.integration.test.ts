import request from "supertest";
import app from "../../app";

describe("User API - Integration", () => {
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
