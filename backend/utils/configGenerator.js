// Generate the content of the WireGuard configuration file (.conf) for the client.
function generateClientConfig(client, privateKey) {
  console.log(
    `privateKey: ${privateKey}, ipAddress: ${client.ip_address}, serverPublicKey: ${process.env.SERVER_PUBLIC_KEY}, serverEndpoint: ${process.env.SERVER_ENDPOINT}, VPNSubnetMask: ${process.env.VPN_SUBNET_MASK}, dnsServer: ${process.env.DNS_SERVER}`,
  );
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

module.exports = {
  generateClientConfig,
};
