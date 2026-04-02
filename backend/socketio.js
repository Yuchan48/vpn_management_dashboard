const { Server } = require("socket.io");
const { extractJtwFromCookie } = require("./utils/auth");
const jwt = require("jsonwebtoken");
const { getClientsWithStatus } = require("./services/client.service");
const { get } = require("./app");

let io;
const lastStatePerUser = new Map();
// Initialize Socket.IO server and set up connection handling
function initSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.REACT_APP_FRONTEND_URL,
      credentials: true,
    },
  });

  // add user authentication here
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const token = extractJtwFromCookie(cookieHeader);
      if (!token) {
        return next(new Error("Unauthorized: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: "personal-vpn-backend",
      });

      // attach user info to socket
      socket.user = {
        id: decoded.sub,
        role: decoded.role,
      };
      next();
    } catch (err) {
      console.error("Socket.IO authentication error:", err);
      next(new Error("Authentication error"));
    }
  });

  // Handle new client connections
  io.on("connection", async (socket) => {
    const user = socket.user;

    // join user specific room
    socket.join(`user_${user.id}`);

    // emit data only it has changed since last emit to avoid unnecessary updates
    try {
      const currentClients = await getClientsWithStatus(user);
      const lastState = lastStatePerUser.get(user.id) || [];
      if (JSON.stringify(currentClients) !== JSON.stringify(lastState)) {
        socket.emit("clientsUpdated", currentClients);
        lastStatePerUser.set(user.id, currentClients);
      }
    } catch (error) {
      console.error("Error emitting initial client data:", error);
    }

    // Handle client disconnections
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${user.id}`);
    });
  });
}

// Function to get the Socket.IO instance for emitting events from other parts of the app
function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

async function emitIoPerUser() {
  try {
    const io = getIO();
    // get all connected sockets
    const sockets = await io.fetchSockets();

    const userSockets = new Map();
    // group sockets by user ID
    for (const socket of sockets) {
      const userId = socket.user.id;
      if (!userSockets.has(userId)) {
        userSockets.set(userId, []);
      }
      userSockets.get(userId).push(socket);
    }
    // emit updated client list to each connected socket based on their user ID
    for (const [userId, socketsArr] of userSockets) {
      // all sockets in this group belong to the same user, so we can take the user info from the first socket
      const user = socketsArr[0].user;
      const currentClients = await getClientsWithStatus(user);
      const lastState = lastStatePerUser.get(userId) || [];
      if (JSON.stringify(currentClients) !== JSON.stringify(lastState)) {
        socketsArr.forEach((s) => s.emit("clientsUpdated", currentClients));
        lastStatePerUser.set(userId, currentClients);
      }
    }
  } catch (error) {
    console.error("Error emitting Socket.IO event per user:", error);
  }
}

module.exports = { initSocketIO, getIO, emitIoPerUser };
