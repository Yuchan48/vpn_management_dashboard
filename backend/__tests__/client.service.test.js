const clientService = require("../services/client.service");
const db = require("../database/db");

afterEach(async () => {
  await new Promise((resolve, reject) => {
    db.run("DELETE FROM clients", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

describe("Client Service", () => {
  // Test create client
  describe("createClient", () => {
    it("should create a new client", async () => {
      const clientName = `test-device-${Date.now()}`;
      const client = await clientService.createClient({
        name: clientName,
        publicKey: `key-${Date.now()}`,
        ipAddress: "10.0.0.10",
      });
      expect(client).toHaveProperty("id");
      expect(client.name).toBe(clientName);
    });
  });

  // Test get client by ID
  describe("getClientById", () => {
    it("should return a client by ID", async () => {
      const client = await clientService.createClient({
        name: "test-device2",
        publicKey: "testkey456",
        ipAddress: "10.0.0.11",
      });
      const fetchedClient = await clientService.getClientById(client.id);
      expect(fetchedClient.id).toBe(client.id);
    });
  });

  // Test get all clients
  describe("getAllClients", () => {
    it("should return an array of clients", async () => {
      const clients = await clientService.getAllClients();
      expect(Array.isArray(clients)).toBe(true);
    });
  });

  // Test delete client
  describe("deleteClient", () => {
    it("should delete a client by ID", async () => {
      const client = await clientService.createClient({
        name: "test-device3",
        publicKey: "testkey789",
        ipAddress: "10.0.0.12",
      });
      await clientService.deleteClient(client.id);
      await expect(clientService.getClientById(client.id)).rejects.toThrow(
        "Client not found",
      );
    });
  });
});
