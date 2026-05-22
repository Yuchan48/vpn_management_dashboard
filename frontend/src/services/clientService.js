import { apiFetch } from "./apiFetch";
import { downloadZip } from "../utils/downloadZip";

const prefix = "/clients";

export function fetchClients() {
  return apiFetch(prefix);
}

export async function createClient(clientName) {
  const blob = await apiFetch(prefix, {
    method: "POST",
    body: JSON.stringify({ name: clientName }),
  });

  await downloadZip(blob, `${clientName}.zip`);
}

export function deleteClient(client, user) {
  // Only the owner of the client or an admin can delete the client
  if (user.role !== "admin" && client.userId !== user.id) {
    throw new Error("Only the owner or an admin can delete this client");
  }

  return apiFetch(`${prefix}/${client.clientId}`, {
    method: "DELETE",
  });
}

// download conf file with given text content and filename
export async function downloadConfFile(clientId, clientName) {
  const blob = await apiFetch(`${prefix}/${clientId}/config`);
  await downloadZip(blob, `${clientName}.zip`);
}
