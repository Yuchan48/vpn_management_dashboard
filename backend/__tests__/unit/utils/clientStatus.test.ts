import { mapClientToStatus } from "../../../utils/clientStatus";
import type { ClientWithUser } from "../../../types/client";
import type { WireGuardPeer } from "../../../types/wireguard";

describe("mapClientToStatus", () => {
  const client: ClientWithUser = {
    id: 1,
    name: "test-client",
    public_key: "client-public-key",
    ip_address: "10.0.0.2",
    user_id: 5,
    username: "testuser",
    is_demo: 0,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-30T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns Not Configured when the client has no matching peer", () => {
    const peers: WireGuardPeer[] = [];

    const result = mapClientToStatus(client, peers);

    expect(result).toEqual({
      clientId: 1,
      name: "test-client",
      status: "Not Configured",
      userId: 5,
      username: "testuser",
    });
  });

  it("returns Online when the peer has a recent handshake and endpoint", () => {
    const peers: WireGuardPeer[] = [
      {
        publicKey: "client-public-key",
        endpoint: "192.168.1.100:51820",
        allowedIPs: "10.0.0.2/32",
        latestHandshake: Math.floor(Date.now() / 1000) - 60,
      },
    ];

    const result = mapClientToStatus(client, peers);

    expect(result).toEqual({
      clientId: 1,
      name: "test-client",
      publicKey: "client-public-key",
      allowedIPs: "10.0.0.2/32",
      endpoint: "192.168.1.100:51820",
      status: "Online",
      userId: 5,
      username: "testuser",
    });
  });

  it("returns Offline when the handshake is older than 120 seconds", () => {
    const peers: WireGuardPeer[] = [
      {
        publicKey: "client-public-key",
        endpoint: "192.168.1.100:51820",
        allowedIPs: "10.0.0.2/32",
        latestHandshake: Math.floor(Date.now() / 1000) - 121,
      },
    ];

    const result = mapClientToStatus(client, peers);

    expect(result.status).toBe("Offline");
  });

  it("returns Offline when the peer endpoint is off", () => {
    const peers: WireGuardPeer[] = [
      {
        publicKey: "client-public-key",
        endpoint: "off",
        allowedIPs: "10.0.0.2/32",
        latestHandshake: Math.floor(Date.now() / 1000) - 10,
      },
    ];

    const result = mapClientToStatus(client, peers);

    expect(result.status).toBe("Offline");
  });

  it("returns Offline when there is no latest handshake", () => {
    const peers: WireGuardPeer[] = [
      {
        publicKey: "client-public-key",
        endpoint: "192.168.1.100:51820",
        allowedIPs: "10.0.0.2/32",
        latestHandshake: 0,
      },
    ];

    const result = mapClientToStatus(client, peers);

    expect(result.status).toBe("Offline");
  });

  it("matches the peer using the client's public key", () => {
    const peers: WireGuardPeer[] = [
      {
        publicKey: "different-key",
        endpoint: "192.168.1.100:51820",
        allowedIPs: "10.0.0.99/32",
        latestHandshake: Math.floor(Date.now() / 1000),
      },
      {
        publicKey: "client-public-key",
        endpoint: "192.168.1.100:51820",
        allowedIPs: "10.0.0.2/32",
        latestHandshake: Math.floor(Date.now() / 1000),
      },
    ];

    const result = mapClientToStatus(client, peers);

    expect(result.status).toBe("Online");
    expect(result.publicKey).toBe("client-public-key");
    expect(result.allowedIPs).toBe("10.0.0.2/32");
  });
});
