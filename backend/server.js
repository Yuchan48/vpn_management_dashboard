// Load environment variables based on the current NODE_ENV
const { loadEnv } = require("./config");
loadEnv();

const app = require("./app");
const port = process.env.PORT || 5500;

const { syncWireGuardPeers } = require("./services/wireguardSync.service");
const { validateEnvVariables } = require("./utils/envValidator");

// Validate environment variables on startup
validateEnvVariables();

// Start the server and sync WireGuard peers on startup
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  syncWireGuardPeers().catch((err) => {
    console.error("WireGuard sync failed on startup:", err);
  });
});
