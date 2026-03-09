const { execFileSync } = require("child_process");
const wireguardService = require("../services/wireguard.service");
jest.mock("child_process", () => ({
  execFileSync: jest.fn(),
}));

// Test suite for WireGuard service functions
describe("WireGuard Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WG_INTERFACE = "wg0"; // Set the environment variable for testing
  });

  // Test addPeer function
  describe("addPeer", () => {
    it("should execute wg command to add a peer", () => {
      execFileSync.mockReturnValue("");

      wireguardService.addPeer("abc123", "10.0.0.2");

      expect(execFileSync).toHaveBeenCalled();
    });
  });

  // Test removePeer function
  describe("removePeer", () => {
    it("should execute wg command to remove a peer", () => {
      execFileSync.mockReturnValue("");

      wireguardService.removePeer("abc123");

      expect(execFileSync).toHaveBeenCalled();
    });
  });

  // Test getWireGuardPeers function
  describe("getWireGuardPeers", () => {
    it("should parse wg show output", async () => {
      const mockOutput =
        "publickey\tpsk\tendpoint\t10.0.0.2/32\t123456\t0\t0\t25\n";

      execFileSync.mockReturnValue(mockOutput);
      const peers = await wireguardService.getWireGuardPeers();
      expect(Array.isArray(peers)).toBe(true);
    });
  });
});
