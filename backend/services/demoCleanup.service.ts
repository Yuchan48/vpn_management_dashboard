import { getAllClients, deleteClient } from "./client.service";
import { removePeer } from "./wireguard.service";

import type { ClientWithUser } from "../types/client";

// Delete all demo clients and their associated WireGuard peers after a specified interval.
export async function cleanupOldDemoClients(): Promise<number> {
  try {
    console.log("[DemoCleanup] Starting cleanup of demo clients...");

    // Calculate cutoff time
    const now = Date.now();
    const cleanupInterval = Number(
      process.env.DEMO_CLEANUP_INTERVAL || 1800000,
    );

    const cutoffTime = now - cleanupInterval;

    const allClients: ClientWithUser[] = await getAllClients();

    // Filter demo clients created before cutoff time
    const demoClientsToDelete = allClients.filter(
      (client) =>
        client.is_demo === 1 &&
        new Date(client.created_at + "Z").getTime() < cutoffTime,
    );

    for (const client of demoClientsToDelete) {
      try {
        // remove peer from WireGuard
        removePeer(client.public_key);
      } catch (wgError) {
        console.error(
          `[DemoCleanup] fail to remove peer: ${client.id} from WireGuard:`,
          wgError,
        );
      }

      try {
        // delete client from database
        await deleteClient({
          clientId: client.id,
          userRole: "admin",
          userId: 0,
        });
      } catch (dbErr) {
        console.error(
          `[DemoCleanup] fail to delete client: ${client.id} from database:`,
          dbErr,
        );
      }
    }

    return demoClientsToDelete.length;
  } catch (error) {
    console.error("[DemoCleanup] error:", error);
  }
  return 0;
}
