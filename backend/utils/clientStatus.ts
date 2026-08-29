import type { ClientWithUser, ClientStatus } from "../types/client";
import type { WireGuardPeer } from "../types/wireguard";

export function mapClientToStatus(
  client: ClientWithUser,
  peers: WireGuardPeer[],
): ClientStatus {
  const peer = peers.find((p) => p.publicKey === client.public_key);

  if (!peer) {
    return {
      clientId: client.id,
      name: client.name,
      status: "Not Configured",
      userId: client.user_id,
      username: client.username,
    };
  }

  // Calculate the age of the latest handshake in seconds.
  const now = Math.floor(Date.now() / 1000);
  const handshakeAge = peer.latestHandshake
    ? now - peer.latestHandshake
    : Infinity;

  // Determine if the client is online based on the endpoint and handshake age.
  const isOnline =
    peer.endpoint !== "off" && handshakeAge < 120 ? "Online" : "Offline";

  return {
    clientId: client.id,
    name: client.name,
    publicKey: client.public_key,
    allowedIPs: client.ip_address + "/32",
    endpoint: peer ? peer.endpoint : "not configured",
    status: isOnline,
    userId: client.user_id,
    username: client.username,
  };
}
