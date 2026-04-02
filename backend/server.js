require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? `${__dirname}/.env.production`
      : `${__dirname}/.env.development`,
});

const { db, initDb } = require("./database/db");

const app = require("./app");

// create server from express app and initialize Socket.IO
const server = require("http").createServer(app);
const { initSocketIO } = require("./socketio");
initSocketIO(server);

const port = process.env.PORT || 5500;

const ensureRootAdmin = require("./utils/initAdmin");

const { syncWireGuardPeers } = require("./services/wireguardSync.service");
const { validateEnvVariables } = require("./utils/envValidator");

const {
  cleanupAndReloadDemoClients,
} = require("./utils/cleanupAndReloadDemoClients");

async function startServer() {
  try {
    // Validate environment variables on startup
    validateEnvVariables();

    // Initialize the database (this will also ensure the root admin user exists)
    await initDb();

    //Ensure root admin user exists on startup
    await ensureRootAdmin();

    // Sync WireGuard peers with clients in the database on startup
    await syncWireGuardPeers();

    // Start the server and sync WireGuard peers on startup
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // initial cleanup of expired demo clients on server startup
    await cleanupAndReloadDemoClients();

    // polling every 10 second for clean up demo clinets and client status update
    setInterval(async () => {
      try {
        const deletedCount = await cleanupAndReloadDemoClients();

        if (deletedCount > 0) {
          console.log(`[Polling] ${deletedCount} demo clients removed.`);
        }
      } catch (error) {
        console.error("[Polling] error:", error);
      }
    }, 10 * 1000);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
startServer();
