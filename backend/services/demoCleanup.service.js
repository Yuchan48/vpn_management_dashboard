const clientService = require("./client.service.js");
const wireguardService = require("./wireguard.service.js");

// Delete all demo clients and their associated WireGuard peers. after 30 minutes of creation.
async function cleanupOldDemoClients(cutoffMinutes = 30) {
  try {
    console.log("[DemoCleanup] Starting cleanup of demo clients...");

    // Calculate cutoff time
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - cutoffMinutes * 60 * 1000);
    const allClients = await clientService.getAllClients();

    // Filter demo clients created before cutoff time
    const demoClientsToDelete = allClients.filter(
      (client) =>
        client.is_demo === 1 && new Date(client.created_at) < cutoffTime,
    );

    for (const client of demoClientsToDelete) {
      try {
        // remove peer from WireGuard
        await wireguardService.removePeer(client.public_key);
      } catch (wgError) {
        console.error(
          `[DemoCleanup] fail to remove peer: ${client.id} from WireGuard:`,
          wgError,
        );
      }

      try {
        // delete client from database
        await clientService.deleteClient({
          clientId: client.id,
          userRole: "admin",
          userId: null,
        });
      } catch (dbErr) {
        console.error(
          `[DemoCleanup] fail to delete client: ${client.id} from database:`,
          dbErr,
        );
      }
    }

    console.log(
      `[DemoCleanup] Cleanup complete. Deleted ${demoClientsToDelete.length} demo clients.`,
    );
  } catch (error) {
    console.error("[DemoCleanup] error:", error);
  }
}

module.exports = {
  cleanupOldDemoClients,
};
