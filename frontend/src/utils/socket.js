import { io } from "socket.io-client";

// For development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// For production
// const API_BASE_URL = "/";

const socket = io(API_BASE_URL + "/", {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
