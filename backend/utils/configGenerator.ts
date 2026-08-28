import type { Client } from "../types/client";
// Generate the content of the WireGuard configuration file (.conf) for the client.
export function generateClientConfig(
  client: Client,
  privateKey: string,
): string {
  return `
[Interface]
PrivateKey = ${privateKey}
Address = ${client.ip_address}/${process.env.VPN_SUBNET_MASK}
DNS = ${process.env.DNS_SERVER}

[Peer]
PublicKey = ${process.env.SERVER_PUBLIC_KEY}
Endpoint = ${process.env.SERVER_ENDPOINT}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`.trim();
}
