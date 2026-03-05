// Generate the content of the WireGuard configuration file (.conf) for the client.
function generateClientConfig(client, privateKey) {
  return `
[Interface]
PrivateKey = ${privateKey}
Address = ${client.ip_address}/${process.env.VPN_SUBNET_MASK}
DNS = ${process.env.DNS_SERVER}

[Peer]
PublicKey = ${process.env.SERVER_PUBLIC_KEY}
Endpoint = ${process.env.SERVER_ENDPOINT}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
`.trim();
}

/*
DNS is usually the VPN server or a public DNS server. Same for all clients.

SERVER_PUBLIC_KEY and SERVER_ENDPOINT are the same for all clients, as they point to the VPN server.

AllowedIPs is set to 0.0.0.0/0 to route all traffic through the VPN.

PersistentKeepalive is optional but can help maintain the connection, especially for clients behind NAT.
*/

module.exports = {
  generateClientConfig,
};
