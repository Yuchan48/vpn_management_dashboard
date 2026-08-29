import { io } from "socket.io-client";

// For development
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/";

const socket = io("/", {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false,
});

export default socket;
