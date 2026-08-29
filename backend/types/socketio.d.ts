import type { AuthenticatedUser } from "./auth";

declare module "socket.io" {
  interface Socket {
    user: AuthenticatedUser;
  }

  interface RemoteSocket {
    user: AuthenticatedUser;
  }
}

export {};
