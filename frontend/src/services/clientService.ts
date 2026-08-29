import { apiFetch } from "./apiFetch";
import { downloadZip } from "../utils/downloadZip";

import type { ClientStatus } from "../types/client";
import type { User } from "../types/user";

const prefix = "/clients";

export function fetchClients(): Promise<ClientStatus[]> {
  return apiFetch(prefix);
}

export async function createClient(clientName: string): Promise<void> {
  const blob: Blob = await apiFetch(prefix, {
    method: "POST",
    body: JSON.stringify({ name: clientName }),
  });

  await downloadZip(blob, `${clientName}.zip`);
}

export function deleteClient(
  client: ClientStatus,
  user: User,
): Promise<Response> {
  // Only the owner of the client or an admin can delete the client
  if (user.role !== "admin" && client.userId !== user.id) {
    throw new Error("Only the owner or an admin can delete this client");
  }

  return apiFetch(`${prefix}/${client.clientId}`, {
    method: "DELETE",
  });
}

// download conf file with given text content and filename
export async function downloadConfFile(
  clientId: number,
  clientName: string,
): Promise<void> {
  const blob: Blob = await apiFetch(`${prefix}/${clientId}/config`);
  await downloadZip(blob, `${clientName}.zip`);
}
