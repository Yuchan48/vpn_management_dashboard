import { getAllClients } from "../services/client.service";
import { addPeer, ensureWireguardUp } from "../services/wireguard.service";

import type { ClientWithUser } from "../types/client";

// sync WireGuard peers with the clients in the database on server startup to ensure that the WireGuard configuration is always up to date with the clients stored in the database.
export async function syncWireGuardPeers(): Promise<void> {
  console.log("Syncing WireGuard peers...");

  ensureWireguardUp();

  try {
    // get all clients from the database
    const clients: ClientWithUser[] = await getAllClients();
    for (const client of clients) {
      try {
        addPeer(client.public_key, client.ip_address);
        console.log(
          `Added peer for client ${client.id} (${client.ip_address})`,
        );
      } catch (wgError) {
        console.error(
          `Error adding peer for client ${client.id} to WireGuard:`,
          wgError,
        );
      }
    }

    console.log("WireGuard peer sync complete.");
  } catch (error) {
    console.error("Error syncing WireGuard peers:", error);
    return;
  }
}
