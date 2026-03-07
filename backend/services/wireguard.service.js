// use an array argument with execFileSync to avoid shell injection vulnerabilities instead of using execSync with a string command.
const { execFileSync } = require("child_process");

// add a peer to the WireGuard configuration
function addPeer(publicKey, allowedIPs) {
  // wg set command to add a peer with the specified public key and allowed IPs
  execFileSync(
    "wg",
    ["set", "wg0", "peer", publicKey, "allowed-ips", `${allowedIPs}/32`],
    {
      encoding: "utf-8",
    },
  );
}

// remove a peer from the WireGuard configuration
function removePeer(publicKey) {
  // wg set command to remove a peer with the specified public key
  execFileSync("wg", ["set", "wg0", "peer", publicKey, "remove"], {
    encoding: "utf-8",
  });
}

module.exports = {
  addPeer,
  removePeer,
};
