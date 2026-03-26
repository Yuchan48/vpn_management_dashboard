require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const app = require("./app");

// create server from express app and initialize Socket.IO
const server = require("http").createServer(app);
const { initSocketIO } = require("./socketio");
initSocketIO(server);

const port = process.env.PORT || 5500;

const ensureRootAdmin = require("./utils/initAdmin");

const { syncWireGuardPeers } = require("./services/wireguardSync.service");
const { validateEnvVariables } = require("./utils/envValidator");

async function startServer() {
  try {
    // Validate environment variables on startup
    validateEnvVariables();

    // Ensure root admin user exists on startup
    await ensureRootAdmin();

    // Sync WireGuard peers with clients in the database on startup
    await syncWireGuardPeers();

    // Start the server and sync WireGuard peers on startup
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
startServer();
