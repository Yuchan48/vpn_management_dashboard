import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchClients,
  createClient,
  deleteClient,
  downloadConfFile,
} from "../../src/services/clientService";

import { apiFetch } from "../../src/services/apiFetch";
import { downloadZip } from "../../src/utils/downloadZip";

import type { ClientStatus } from "../../src/types/client";
import type { User } from "../../src/types/user";

vi.mock("../../src/services/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("../../src/utils/downloadZip", () => ({
  downloadZip: vi.fn(),
}));

describe("clientService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchClients", () => {
    it("fetches and returns the clients", async () => {
      const clients: ClientStatus[] = [
        {
          clientId: 1,
          name: "laptop",
          status: "Online",
          publicKey: "public-key",
          allowedIPs: "10.0.0.2/32",
          endpoint: "192.168.1.10:51820",
          userId: 2,
          username: "testuser",
        },
      ];

      vi.mocked(apiFetch).mockResolvedValue(clients);

      const result = await fetchClients();

      expect(apiFetch).toHaveBeenCalledWith("/clients");
      expect(result).toEqual(clients);
    });
  });

  describe("createClient", () => {
    it("creates a client and downloads its ZIP file", async () => {
      const blob = new Blob(["wireguard config"]);

      vi.mocked(apiFetch).mockResolvedValue(blob);
      vi.mocked(downloadZip).mockResolvedValue(undefined);

      await createClient("my-laptop");

      expect(apiFetch).toHaveBeenCalledWith("/clients", {
        method: "POST",
        body: JSON.stringify({
          name: "my-laptop",
        }),
      });

      expect(downloadZip).toHaveBeenCalledWith(blob, "my-laptop.zip");
    });
  });

  describe("deleteClient", () => {
    const client: ClientStatus = {
      clientId: 1,
      name: "my-laptop",
      status: "Online",
      publicKey: "public-key",
      allowedIPs: "10.0.0.2/32",
      endpoint: "192.168.1.10:51820",
      userId: 2,
      username: "testuser",
    };

    const owner: User = {
      id: 2,
      username: "testuser",
      role: "user",
      is_demo: 0,
      created_at: "2026-08-31",
    };

    const admin: User = {
      id: 1,
      username: "admin",
      role: "admin",
      is_demo: 0,
      created_at: "2026-08-31",
    };

    it("allows the owner to delete the client", async () => {
      const response = new Response(null, {
        status: 204,
      });

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await deleteClient(client, owner);

      expect(apiFetch).toHaveBeenCalledWith("/clients/1", {
        method: "DELETE",
      });

      expect(result).toBe(response);
    });

    it("allows an admin to delete the client", async () => {
      const response = new Response(null, {
        status: 204,
      });

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await deleteClient(client, admin);

      expect(apiFetch).toHaveBeenCalledWith("/clients/1", {
        method: "DELETE",
      });

      expect(result).toBe(response);
    });

    it("rejects deletion by a non-owner non-admin", () => {
      const otherUser: User = {
        id: 3,
        username: "otheruser",
        role: "user",
        is_demo: 0,
        created_at: "2026-08-31",
      };

      expect(() => deleteClient(client, otherUser)).toThrow(
        "Only the owner or an admin can delete this client",
      );

      expect(apiFetch).not.toHaveBeenCalled();
    });
  });

  describe("downloadConfFile", () => {
    it("fetches the config and downloads it", async () => {
      const blob = new Blob(["wireguard config"]);

      vi.mocked(apiFetch).mockResolvedValue(blob);
      vi.mocked(downloadZip).mockResolvedValue(undefined);

      await downloadConfFile(1, "my-laptop");

      expect(apiFetch).toHaveBeenCalledWith("/clients/1/config");

      expect(downloadZip).toHaveBeenCalledWith(blob, "my-laptop.zip");
    });
  });
});
