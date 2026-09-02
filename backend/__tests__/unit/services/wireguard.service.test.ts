import { execFileSync } from "child_process";

import {
  addPeer,
  removePeer,
  getWireGuardPeers,
  ensureWireguardUp,
} from "../../../services/wireguard.service";

jest.mock("child_process", () => ({
  execFileSync: jest.fn(),
}));

const mockedExecFileSync = jest.mocked(execFileSync);

describe("wireguard.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.WG_INTERFACE;
  });

  describe("addPeer", () => {
    it("should add a peer with the correct WireGuard command", () => {
      mockedExecFileSync.mockReturnValue("");

      addPeer("public-key-123", "10.0.0.5");

      expect(mockedExecFileSync).toHaveBeenCalledWith(
        "wg",
        ["set", "wg0", "peer", "public-key-123", "allowed-ips", "10.0.0.5/32"],
        { encoding: "utf-8" },
      );
    });
  });

  describe("removePeer", () => {
    it("should remove a peer with the correct WireGuard command", () => {
      mockedExecFileSync.mockReturnValue("");

      removePeer("public-key-123");

      expect(mockedExecFileSync).toHaveBeenCalledWith(
        "wg",
        ["set", "wg0", "peer", "public-key-123", "remove"],
        { encoding: "utf-8" },
      );
    });
  });

  describe("getWireGuardPeers", () => {
    it("should parse WireGuard peer information correctly", async () => {
      const output = [
        "private-key\tpublic-key\t51820\t10.0.0.1/24\t0\t0\t0\t0",
        "peer-public-key\tpreshared-key\t192.168.1.10:12345\t10.0.0.2/32\t1700000000\t1000\t2000\t25",
      ].join("\n");

      mockedExecFileSync.mockReturnValue(output);

      const peers = await getWireGuardPeers();

      expect(peers).toEqual([
        {
          publicKey: "peer-public-key",
          endpoint: "192.168.1.10:12345",
          allowedIPs: "10.0.0.2/32",
          latestHandshake: 1700000000,
        },
      ]);
    });
  });

  describe("ensureWireguardUp", () => {
    it("should start WireGuard when no interface is running", () => {
      mockedExecFileSync.mockReturnValueOnce("").mockReturnValueOnce("");

      ensureWireguardUp();

      expect(mockedExecFileSync).toHaveBeenNthCalledWith(1, "wg", ["show"], {
        encoding: "utf-8",
      });

      expect(mockedExecFileSync).toHaveBeenNthCalledWith(
        2,
        "wg-quick",
        ["up", "wg0"],
        { stdio: "inherit" },
      );
    });
  });
});
