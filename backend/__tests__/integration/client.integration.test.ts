import request from "supertest";
import { createUser } from "../../services/user.service";
import { db } from "../../database/db";

jest.mock("../../services/wireguard.service", () => ({
  addPeer: jest.fn(),
  removePeer: jest.fn(),
  getWireGuardPeers: jest.fn().mockResolvedValue([]),
}));

import app from "../../app";

describe("Client API - Integration", () => {
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

  it("should create and delete a client for an authenticated user", async () => {
    const agent = request.agent(app);

    // Login
    const loginResponse = await agent.post("/api/auth/login").send({
      username: "testuser",
      password: "password123",
    });

    expect(loginResponse.status).toBe(200);

    // Create client
    const createResponse = await agent.post("/api/clients").send({
      name: "test-client",
    });

    expect(createResponse.status).toBe(200);
    expect(createResponse.headers["content-type"]).toMatch(/application\/zip/);

    // Fetch clients to get the newly created client's ID
    const clientsResponse = await agent.get("/api/clients");

    expect(clientsResponse.status).toBe(200);

    const client = clientsResponse.body.find(
      (client: { name: string }) => client.name === "test-client",
    );

    expect(client).toBeDefined();

    // Delete client
    const deleteResponse = await agent.delete(
      `/api/clients/${client.clientId}`,
    );

    expect(deleteResponse.status).toBe(204);
  });
});
