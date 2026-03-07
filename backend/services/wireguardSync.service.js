const clientService = require("../services/client.service");
const { addPeer } = require("../services/wireguard.service");

// sync WireGuard peers with the clients in the database on server startup to ensure that the WireGuard configuration is always up to date with the clients stored in the database. This is important because if the server restarts, any peers that were added to WireGuard but not persisted in the database would be lost, and we need to re-add them to maintain connectivity for existing clients.
async function syncWireGuardPeers() {
  console.log("Syncing WireGuard peers...");

  try {
    // get all clients from the database
    const clients = await clientService.getAllClients();
    for (const client of clients) {
      try {
        await addPeer(client.public_key, client.ip_address);
        console.log(`Added peer for client ${client.id} (${client.ip_address})`);
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

module.exports = {
  syncWireGuardPeers,
};
