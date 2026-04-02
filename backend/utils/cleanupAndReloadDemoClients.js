const { cleanupOldDemoClients } = require("../services/demoCleanup.service");
const { syncWireGuardPeers } = require("../services/wireguardSync.service");
const { emitIoPerUser } = require("../socketio");

async function cleanupAndReloadDemoClients() {
  try {
    const deletedCount = await cleanupOldDemoClients();

    if (deletedCount > 0) {
      console.log(`[DemoCleanup] ${deletedCount} clients removed.`);
      await syncWireGuardPeers();

      await emitIoPerUser();
    }
  } catch (error) {
    console.error("Error during demo client cleanup:", error);
  }
}

module.exports = {
  cleanupAndReloadDemoClients,
};
