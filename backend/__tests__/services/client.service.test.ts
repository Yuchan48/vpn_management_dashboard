import {
  createClient,
  getClientById,
  getAllClients,
  getClientsWithStatus,
  getClientsByUserId,
  deleteClient,
  updateClientPublicKey,
} from "../../services/client.service";

import { db } from "../../database/db";
import { getWireGuardPeers } from "../../services/wireguard.service";
import { mapClientToStatus } from "../../utils/clientStatus";

import type { Client, ClientWithUser } from "../../types/client";
import type { AuthenticatedUser } from "../../types/auth";

jest.mock("../../database/db", () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
  },
}));

jest.mock("../../services/wireguard.service", () => ({
  getWireGuardPeers: jest.fn(),
}));

jest.mock("../../utils/clientStatus", () => ({
  mapClientToStatus: jest.fn(),
}));

const mockedDb = db as jest.Mocked<typeof db>;
const mockedGetWireGuardPeers = getWireGuardPeers as jest.MockedFunction<
  typeof getWireGuardPeers
>;
const mockedMapClientToStatus = mapClientToStatus as jest.MockedFunction<
  typeof mapClientToStatus
>;

const adminUser: AuthenticatedUser = {
  id: 1,
  role: "admin",
  is_demo: 0,
};

const regularUser: AuthenticatedUser = {
  id: 5,
  role: "user",
  is_demo: 0,
};

const client: Client = {
  id: 10,
  name: "test-client",
  public_key: "public-key-123",
  ip_address: "10.0.0.2",
  user_id: 5,
};

const client2: Client = {
  id: 11,
  name: "test-client-2",
  public_key: "public-key-456",
  ip_address: "10.0.0.3",
  user_id: 6,
};

const clientWithUser: ClientWithUser = {
  ...client,
  created_at: new Date(),
  username: "testuser",
  is_demo: 0,
};

describe("client.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createClient", () => {
    it("should create a client successfully", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: { count: number }) => void,
        ) => {
          callback(null, { count: 2 });
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null) => void,
        ) => {
          const context = {
            lastID: 10,
          };

          callback.call(context, null);

          return mockedDb;
        },
      );

      const result = await createClient({
        name: "test-client",
        publicKey: "public-key-123",
        ipAddress: "10.0.0.2",
        userId: 5,
      });

      expect(result).toEqual({
        id: 10,
        name: "test-client",
        public_key: "public-key-123",
        ip_address: "10.0.0.2",
        user_id: 5,
      });

      expect(mockedDb.get).toHaveBeenCalledWith(
        "SELECT COUNT(*) AS count FROM clients WHERE user_id = ?",
        [5],
        expect.any(Function),
      );

      expect(mockedDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO clients"),
        ["test-client", "public-key-123", "10.0.0.2", 5],
        expect.any(Function),
      );
    });

    it("should reject when the user has reached the client limit", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: { count: number }) => void,
        ) => {
          callback(null, { count: 5 });
          return mockedDb;
        },
      );

      await expect(
        createClient({
          name: "test-client",
          publicKey: "public-key",
          ipAddress: "10.0.0.2",
          userId: 5,
        }),
      ).rejects.toEqual({
        status: 400,
        error: "Client limit reached. Maximum of 5 clients per user.",
      });

      expect(mockedDb.run).not.toHaveBeenCalled();
    });

    it("should reject when counting existing clients fails", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: { count: number }) => void,
        ) => {
          callback(new Error("Database failure"));
          return mockedDb;
        },
      );

      await expect(
        createClient({
          name: "test-client",
          publicKey: "public-key",
          ipAddress: "10.0.0.2",
          userId: 5,
        }),
      ).rejects.toEqual({
        status: 500,
        error: "Database failure",
      });
    });

    it("should reject when the count query returns no row", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: { count: number }) => void,
        ) => {
          callback(null, undefined);
          return mockedDb;
        },
      );

      await expect(
        createClient({
          name: "test-client",
          publicKey: "public-key",
          ipAddress: "10.0.0.2",
          userId: 5,
        }),
      ).rejects.toEqual({
        status: 404,
        error: "User not found",
      });
    });

    it("should reject when the client name already exists", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: { count: number }) => void,
        ) => {
          callback(null, { count: 2 });
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (err: Error | null) => void,
      ) {
        const error = new Error(
          "SQLITE_CONSTRAINT: UNIQUE constraint failed: clients.name",
        );

        callback(error);
        return mockedDb;
      });

      await expect(
        createClient({
          name: "existing-client",
          publicKey: "public-key",
          ipAddress: "10.0.0.2",
          userId: 5,
        }),
      ).rejects.toEqual({
        error: "Failed to create client",
        status: 500,
      });
    });

    it("should reject when creating the client fails", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: { count: number }) => void,
        ) => {
          callback(null, { count: 2 });
          return mockedDb;
        },
      );

      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (err: Error | null) => void,
      ) {
        callback(new Error("Insert failed"));
        return mockedDb;
      });

      await expect(
        createClient({
          name: "test-client",
          publicKey: "public-key",
          ipAddress: "10.0.0.2",
          userId: 5,
        }),
      ).rejects.toEqual({
        status: 500,
        error: "Failed to create client",
      });
    });
  });

  describe("getClientById", () => {
    it("should allow an admin to retrieve any client", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: Client) => void,
        ) => {
          callback(null, client);
          return mockedDb;
        },
      );

      const result = await getClientById({
        clientId: 10,
        user: adminUser,
      });

      expect(result).toEqual(client);

      expect(mockedDb.get).toHaveBeenCalledWith(
        "SELECT * FROM clients WHERE id = ?",
        [10],
        expect.any(Function),
      );
    });

    it("should allow a regular user to retrieve their own client", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: Client) => void,
        ) => {
          callback(null, client);
          return mockedDb;
        },
      );

      const result = await getClientById({
        clientId: 10,
        user: regularUser,
      });

      expect(result).toEqual(client);

      expect(mockedDb.get).toHaveBeenCalledWith(
        "SELECT * FROM clients WHERE id = ? AND user_id = ?",
        [10, 5],
        expect.any(Function),
      );
    });

    it("should reject when the client is not found", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: Client) => void,
        ) => {
          callback(null, undefined);
          return mockedDb;
        },
      );

      await expect(
        getClientById({
          clientId: 999,
          user: regularUser,
        }),
      ).rejects.toEqual({
        status: 404,
        error: "Client not found",
      });
    });

    it("should reject when the database query fails", async () => {
      mockedDb.get.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, row?: Client) => void,
        ) => {
          callback(new Error("Database failure"));
          return mockedDb;
        },
      );

      await expect(
        getClientById({
          clientId: 10,
          user: regularUser,
        }),
      ).rejects.toEqual({
        status: 500,
        error: "Database failure",
      });
    });
  });

  describe("getAllClients", () => {
    it("should return all clients with user information", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows: ClientWithUser[]) => void,
        ) => {
          callback(null, [clientWithUser]);
          return mockedDb;
        },
      );

      const result = await getAllClients();

      expect(result).toEqual([clientWithUser]);
      expect(mockedDb.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT clients.id"),
        [],
        expect.any(Function),
      );
    });

    it("should reject when the database query fails", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows: ClientWithUser[]) => void,
        ) => {
          callback(new Error("Database failure"), []);
          return mockedDb;
        },
      );

      await expect(getAllClients()).rejects.toEqual({
        status: 500,
        error: "Database failure",
      });
    });
  });

  describe("getClientsWithStatus", () => {
    it("should return all clients for an admin", async () => {
      const secondClientWithUser: ClientWithUser = {
        ...client2,
        created_at: new Date(),
        username: "otheruser",
        is_demo: 0,
      };

      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows: ClientWithUser[]) => void,
        ) => {
          callback(null, [clientWithUser, secondClientWithUser]);
          return mockedDb;
        },
      );

      mockedGetWireGuardPeers.mockResolvedValue([]);

      mockedMapClientToStatus.mockImplementation((client) => ({
        clientId: client.id,
        name: client.name,
        status: "Not Configured",
        userId: client.user_id,
        username: client.username,
      }));

      const result = await getClientsWithStatus(adminUser);

      expect(result).toHaveLength(2);
      expect(mockedMapClientToStatus).toHaveBeenCalledTimes(2);
    });

    it("should return only the regular user's clients", async () => {
      const secondClientWithUser: ClientWithUser = {
        ...client2,
        created_at: new Date(),
        username: "otheruser",
        is_demo: 0,
      };

      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows: ClientWithUser[]) => void,
        ) => {
          callback(null, [clientWithUser, secondClientWithUser]);
          return mockedDb;
        },
      );

      mockedGetWireGuardPeers.mockResolvedValue([]);

      mockedMapClientToStatus.mockImplementation((client) => ({
        clientId: client.id,
        name: client.name,
        status: "Not Configured",
        userId: client.user_id,
        username: client.username,
      }));

      const result = await getClientsWithStatus(regularUser);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(5);
      expect(mockedMapClientToStatus).toHaveBeenCalledTimes(1);
      expect(mockedMapClientToStatus).toHaveBeenCalledWith(clientWithUser, []);
    });
  });

  describe("getClientsByUserId", () => {
    it("should return all clients belonging to a user", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows: Client[]) => void,
        ) => {
          callback(null, [client]);
          return mockedDb;
        },
      );

      const result = await getClientsByUserId(5);

      expect(result).toEqual([client]);

      expect(mockedDb.all).toHaveBeenCalledWith(
        "SELECT * FROM clients WHERE user_id = ? ORDER BY id",
        [5],
        expect.any(Function),
      );
    });

    it("should reject when the database query fails", async () => {
      mockedDb.all.mockImplementation(
        (
          _sql: string,
          _params: unknown[],
          callback: (err: Error | null, rows: Client[]) => void,
        ) => {
          callback(new Error("Database failure"), []);
          return mockedDb;
        },
      );

      await expect(getClientsByUserId(5)).rejects.toEqual({
        status: 500,
        error: "Database failure",
      });
    });
  });

  describe("deleteClient", () => {
    it("should allow an admin to delete a client", async () => {
      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (this: { changes: number }, err: Error | null) => void,
      ) {
        callback.call({ changes: 1 }, null);
        return mockedDb;
      });

      await expect(
        deleteClient({
          clientId: 10,
          userRole: "admin",
          userId: 1,
        }),
      ).resolves.toBeUndefined();

      expect(mockedDb.run).toHaveBeenCalledWith(
        "DELETE FROM clients WHERE id = ?",
        [10],
        expect.any(Function),
      );
    });

    it("should allow a regular user to delete their own client", async () => {
      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (this: { changes: number }, err: Error | null) => void,
      ) {
        callback.call({ changes: 1 }, null);
        return mockedDb;
      });

      await expect(
        deleteClient({
          clientId: 10,
          userRole: "user",
          userId: 5,
        }),
      ).resolves.toBeUndefined();

      expect(mockedDb.run).toHaveBeenCalledWith(
        "DELETE FROM clients WHERE id = ? AND user_id = ?",
        [10, 5],
        expect.any(Function),
      );
    });

    it("should reject when the client does not exist", async () => {
      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (this: { changes: number }, err: Error | null) => void,
      ) {
        callback.call({ changes: 0 }, null);
        return mockedDb;
      });

      await expect(
        deleteClient({
          clientId: 999,
          userRole: "admin",
          userId: 1,
        }),
      ).rejects.toEqual({
        status: 404,
        error: "Client not found",
      });
    });

    it("should reject when deleting the client fails", async () => {
      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (this: { changes: number }, err: Error | null) => void,
      ) {
        callback.call({ changes: 0 }, new Error("Delete failed"));
        return mockedDb;
      });

      await expect(
        deleteClient({
          clientId: 10,
          userRole: "admin",
          userId: 1,
        }),
      ).rejects.toEqual({
        status: 500,
        error: "Delete failed",
      });
    });
  });

  describe("updateClientPublicKey", () => {
    it("should update a client's public key successfully", async () => {
      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (this: { changes: number }, err: Error | null) => void,
      ) {
        callback.call({ changes: 1 }, null);
        return mockedDb;
      });

      await expect(
        updateClientPublicKey(10, "new-public-key"),
      ).resolves.toBeUndefined();

      expect(mockedDb.run).toHaveBeenCalledWith(
        "UPDATE clients SET public_key = ? WHERE id = ?",
        ["new-public-key", 10],
        expect.any(Function),
      );
    });

    it("should reject when the client does not exist", async () => {
      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (this: { changes: number }, err: Error | null) => void,
      ) {
        callback.call({ changes: 0 }, null);
        return mockedDb;
      });

      await expect(
        updateClientPublicKey(999, "new-public-key"),
      ).rejects.toEqual({
        status: 404,
        error: "Client not found",
      });
    });

    it("should reject when updating the public key fails", async () => {
      mockedDb.run.mockImplementation(function (
        _sql: string,
        _params: unknown[],
        callback: (this: { changes: number }, err: Error | null) => void,
      ) {
        callback.call({ changes: 0 }, new Error("Update failed"));
        return mockedDb;
      });

      await expect(updateClientPublicKey(10, "new-public-key")).rejects.toEqual(
        {
          status: 500,
          error: "Update failed",
        },
      );
    });
  });
});
