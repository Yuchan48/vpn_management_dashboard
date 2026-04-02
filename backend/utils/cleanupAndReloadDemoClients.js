const { cleanupOldDemoClients } = require("../services/demoCleanup.service");
const { syncWireGuardPeers } = require("../services/wireguardSync.service");

async function cleanupAndReloadDemoClients() {
  try {
    const deletedCount = await cleanupOldDemoClients();

    if (deletedCount > 0) {
      await syncWireGuardPeers();
    }
    return deletedCount;
  } catch (error) {
    console.error("Error during demo client cleanup:", error);
    return 0;
  }
}

module.exports = {
  cleanupAndReloadDemoClients,
};
