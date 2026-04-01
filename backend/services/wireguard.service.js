// use an array argument with execFileSync to avoid shell injection vulnerabilities instead of using execSync with a string command.
const { execFileSync } = require("child_process");
const { get } = require("http");

// add a peer to the WireGuard configuration
function addPeer(publicKey, allowedIPs) {
  console.log("Adding WireGuard peer:", publicKey, "AllowedIPs:", allowedIPs);

  // wg set command to add a peer with the specified public key and allowed IPs
  execFileSync(
    "wg",
    [
      "set",
      process.env.WG_INTERFACE,
      "peer",
      publicKey,
      "allowed-ips",
      `${allowedIPs}/32`,
    ],
    {
      encoding: "utf-8",
    },
  );
}

// remove a peer from the WireGuard configuration
function removePeer(publicKey) {
  // wg set command to remove a peer with the specified public key
  execFileSync(
    "wg",
    ["set", process.env.WG_INTERFACE, "peer", publicKey, "remove"],
    {
      encoding: "utf-8",
    },
  );
}

async function getWireGuardPeers() {
  const wgInterface = process.env.WG_INTERFACE || "wg0";
  // wg show command to get the current WireGuard configuration in JSON format
  const output = execFileSync("wg", ["show", wgInterface, "dump"], {
    encoding: "utf-8",
  });

  // parse the output and extract peer information
  const lines = output.trim().split("\n");
  const peers = [];

  // Split the output into lines. Skip the first line(the interface header)
  for (let i = 1; i < lines.length; i++) {
    const [
      publicKey,
      presharedKey,
      endpoint,
      allowedIPs,
      latestHandshake,
      transferRx,
      transferTx,
      persistentKeepalive,
    ] = lines[i].split("\t");
    peers.push({
      publicKey,
      endpoint,
      allowedIPs,
      latestHandshake: parseInt(latestHandshake, 10),
    });
  }

  return peers;
}

function ensureWireguardUp() {
  try {
    const output = execFileSync("wg", ["show"], { encoding: "utf-8" });
    if (output.trim() === "")
      throw new Error("WireGuard is not running or no interfaces found");
  } catch {
    console.log("Starting wg0 via wg-quick...");
    execFileSync("wg-quick", ["up", "wg0"], { stdio: "inherit" });
  }
}

module.exports = {
  addPeer,
  removePeer,
  getWireGuardPeers,
  ensureWireguardUp,
};
