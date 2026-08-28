import type { ClientStatus } from "./client";

export interface ServerToClientEvents {
  clientsUpdated: (clients: ClientStatus[]) => void;
}

export interface ClientToServerEvents {}
