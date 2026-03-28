const { cleanupOldDemoClients } = require("../services/demoCleanup.service");
const { syncWireGuardPeers } = require("../services/wireguardSync.service");
const { getClientsWithStatus } = require("../services/client.service");
const { emitIo } = require("../socketio");

async function cleanupAndReloadDemoClients() {
  try {
    const deletedCount = await cleanupOldDemoClients();

    if (deletedCount > 0) {
      console.log(`[DemoCleanup] ${deletedCount} clients removed.`);
      await syncWireGuardPeers();
      const updatedClients = await getClientsWithStatus();
      emitIo(updatedClients);
    }
  } catch (error) {
    console.error("Error during demo client cleanup:", error);
  }
}

module.exports = {
  cleanupAndReloadDemoClients,
};
