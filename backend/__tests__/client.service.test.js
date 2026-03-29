const clientService = require("../services/client.service");
const { db } = require("../database/db");

afterEach(async () => {
  await new Promise((resolve, reject) => {
    db.run("DELETE FROM clients", (err) => (err ? reject(err) : resolve()));
  });
});

describe("Client Service", () => {
  const adminUser = { id: 1, role: "admin" };
  const normalUser = { id: 2, role: "user" };

  describe("createClient", () => {
    it("should reject if name is missing", async () => {
      await expect(
        clientService.createClient({
          publicKey: "somekey",
          ipAddress: "10.0.0.5",
          userId: 2,
        }),
      ).rejects.toMatchObject({
        error: expect.any(String),
        status: expect.any(Number),
      });
    });

    it("should create a new client", async () => {
      const clientName = `test-device-${Date.now()}-${Math.random()}`;
      const client = await clientService.createClient({
        name: clientName,
        publicKey: `key-${Date.now()}`,
        ipAddress: "10.0.0.10",
        userId: 2,
      });

      expect(client).toHaveProperty("id");
      expect(client.name).toBe(clientName);
    });
  });

  describe("getClientById", () => {
    it("should return a client by id", async () => {
      const client = await clientService.createClient({
        name: "find-me",
        publicKey: "key-find",
        ipAddress: "10.0.0.20",
        userId: 2,
      });

      const fetched = await clientService.getClientById({
        clientId: client.id,
        user: normalUser,
      });
      expect(fetched.name).toBe("find-me");
    });

    it("should throw 404 if client not found", async () => {
      await expect(
        clientService.getClientById({ clientId: 9999, user: normalUser }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("deleteClient", () => {
    it("should delete a client", async () => {
      const client = await clientService.createClient({
        name: "delete-me",
        publicKey: "key-delete",
        ipAddress: "10.0.0.30",
        userId: 2,
      });

      await clientService.deleteClient({
        clientId: client.id,
        user: normalUser,
      });
      await expect(
        clientService.getClientById({ clientId: client.id, user: normalUser }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
