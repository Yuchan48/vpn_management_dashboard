import { apiFetch } from "./apiFetch";

export function fetchClients() {
  return apiFetch("/clients");
}

export function createClient(clientData) {
  return apiFetch("/clients", {
    method: "POST",
    body: JSON.stringify(clientData),
  });
  // return TEXT response with .conf file content
}

export function deleteClient(client, user) {
  // Only the owner of the client or an admin can delete the client
  if (user.role !== "admin" && client.userId !== user.id) {
    throw new Error("Only the owner or an admin can delete this client");
  }

  return apiFetch(`/clients/${client.clientId}`, {
    method: "DELETE",
  });
}

export function fetchClientConfig(clientId) {
  return apiFetch(`/clients/${clientId}/config`);
  // return .conf file content as blob
}

// Downloading conf file for existing client.
export async function downloadClientConfig(client) {
  const text = await apiFetch(`/clients/${client.clientId}/config`);

  downloadConfFile(text, client.name);
}

// download conf file with given text content and filename
export function downloadConfFile(text, filename) {
  const normalizedText = text.replace(/\r\n/g, "\n");
  const blob = new Blob([normalizedText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.replace(/[^a-zA-Z0-9-]/g, "-") + ".conf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
