// use an array argument with execFileSync to avoid shell injection vulnerabilities.
import { execFileSync } from "child_process";

import type { WireGuardPeer } from "../types/wireguard";

// add a peer to the WireGuard configuration
export function addPeer(publicKey: string, allowedIPs: string): void {
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
export function removePeer(publicKey: string): void {
  // wg set command to remove a peer with the specified public key
  execFileSync(
    "wg",
    ["set", process.env.WG_INTERFACE, "peer", publicKey, "remove"],
    {
      encoding: "utf-8",
    },
  );
}

// get the list of peers from the WireGuard configuration
export async function getWireGuardPeers(): Promise<WireGuardPeer[]> {
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
    const [publicKey, , endpoint, allowedIPs, latestHandshake] =
      lines[i].split("\t");
    peers.push({
      publicKey,
      endpoint,
      allowedIPs,
      latestHandshake: parseInt(latestHandshake, 10),
    });
  }

  return peers;
}

// Ensure that the WireGuard interface is up and running. If not, attempt to bring it up using wg-quick.
export function ensureWireguardUp(): void {
  try {
    const output = execFileSync("wg", ["show"], { encoding: "utf-8" });
    if (output.trim() === "")
      throw new Error("WireGuard is not running or no interfaces found");
  } catch {
    console.log("Starting wg0 via wg-quick...");
    execFileSync("wg-quick", ["up", "wg0"], { stdio: "inherit" });
  }
}
