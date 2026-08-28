import { Server, type Socket } from "socket.io";

import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "./types/socket";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

import { extractJwtFromCookie } from "./utils/auth";
import { getClientsWithStatus } from "./services/client.service";
import type { AuthenticatedUser } from "./types/auth";
import type { ClientStatus } from "./types/client";

type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

let io: AppServer | undefined;
const lastStatePerUser = new Map<number, ClientStatus[]>();

// Initialize Socket.IO server and set up connection handling
export function initSocketIO(server: HttpServer): void {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.REACT_APP_FRONTEND_URL,
      credentials: true,
    },
  });

  // add user authentication here
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const token = extractJwtFromCookie(cookieHeader);
      if (!token) {
        return next(new Error("Unauthorized: No token provided"));
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        return next(new Error("Internal server error"));
      }

      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: "personal-vpn-backend",
      });

      const user: AuthenticatedUser = {
        id: (decoded as any).sub,
        role: (decoded as any).role,
        is_demo: (decoded as any).is_demo,
      };

      // attach user info to socket
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket.IO authentication error:", err);
      next(new Error("Authentication error"));
    }
  });

  // Handle new client connections
  io.on("connection", async (socket: AppSocket) => {
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
export function getIO(): AppServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export async function emitIoPerUser(): Promise<void> {
  try {
    const io = getIO();

    // get all connected sockets
    const sockets = await io.fetchSockets();
    const userSockets = new Map<number, typeof sockets>();
    // group sockets by user ID
    for (const socket of sockets) {
      const userId = socket.user.id;
      if (!userSockets.has(userId)) {
        userSockets.set(userId, []);
      }
      userSockets.get(userId)!.push(socket);
    }
    // emit updated client list to each connected socket based on their user ID
    for (const [userId, socketsArr] of userSockets) {
      // all sockets in this group belong to the same user, so we can take the user info from the first socket
      const user = socketsArr[0].user;
      const currentClients = await getClientsWithStatus(user);
      const lastState = lastStatePerUser.get(userId) || [];

      // send update only if client list has changed since last emit
      if (JSON.stringify(currentClients) !== JSON.stringify(lastState)) {
        socketsArr.forEach((s) => s.emit("clientsUpdated", currentClients));
        lastStatePerUser.set(userId, currentClients);
      }
    }
  } catch (error) {
    console.error("Error emitting Socket.IO event per user:", error);
  }
}
