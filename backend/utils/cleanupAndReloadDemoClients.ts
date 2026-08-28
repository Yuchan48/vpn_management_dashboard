import { cleanupOldDemoClients } from "../services/demoCleanup.service";
import { syncWireGuardPeers } from "../services/wireguardSync.service";

export async function cleanupAndReloadDemoClients(): Promise<number> {
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
