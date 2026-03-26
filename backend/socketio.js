const { Server } = require("socket.io");

let io;
// Initialize Socket.IO server and set up connection handling
function initSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.REACT_APP_FRONTEND_URL,
      credentials: true,
    },
  });

  // Handle new client connections
  io.on("connection", (socket) => {
    console.log("client connected");

    // Handle client disconnections
    socket.on("disconnect", () => {
      console.log("client disconnected");
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

// Function to emit an event to all connected clients with the updated client list
async function emitIo(updatedClients) {
  try {
    const socket = getIO();
    socket.emit("clientsUpdated", updatedClients);
  } catch (error) {
    console.error("Error emitting Socket.IO event:", error);
  }
}

module.exports = { initSocketIO, getIO, emitIo };
