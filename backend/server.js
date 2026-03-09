const app = require("./app");
const port = process.env.PORT || 5500;

const { syncWireGuardPeers } = require("./services/wireguardSync.service");

// Start the server and sync WireGuard peers on startup
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await syncWireGuardPeers();
});
