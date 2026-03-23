import { apiFetch } from "./apiFetch";

export async function fetchClients() {
  return await apiFetch("/clients");
  // return [// {id, name, publicKey, ipAddress, user_id, isConnected, lastHandshake}, ...]
}

export async function createClient(clientData) {
  return await apiFetch("/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clientData),
  });
  // return TEXT response with .conf file content
}

export async function deleteClient(client, user) {
  // Only the owner of the client or an admin can delete the client
  if (user.role !== "admin" && client.userId !== user.id) {
    throw new Error("Only the owner or an admin can delete this client");
  }

  return await apiFetch(`/clients/${client.clientId}`, {
    method: "DELETE",
  });
}

export async function fetchClientConfig(clientId) {
  return await apiFetch(`/clients/${clientId}/config`);
  // return .conf file content as blob
}

// Downloading conf file for existing client.
export async function downloadClientConfig(client) {
  const text = await apiFetch(`/clients/${client.clientId}/config`);

  const filename = `client_${client.name}.conf`;
  downloadConfFile(text, filename);
}

// download conf file with given text content and filename
export function downloadConfFile(text, filename) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
