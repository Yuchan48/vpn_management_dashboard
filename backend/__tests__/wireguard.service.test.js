const { execFileSync } = require("child_process");
const wireguardService = require("../services/wireguard.service");

jest.mock("child_process", () => ({
  execFileSync: jest.fn(),
}));

describe("WireGuard Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WG_INTERFACE = "wg0";
  });

  it("addPeer should call execFileSync", () => {
    wireguardService.addPeer("abc123", "10.0.0.2");
    expect(execFileSync).toHaveBeenCalled();
  });

  it("removePeer should call execFileSync", () => {
    wireguardService.removePeer("abc123");
    expect(execFileSync).toHaveBeenCalled();
  });
});
