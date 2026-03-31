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

// download conf file with given text content and filename
export function downloadConfFile(clientId) {
  const link = document.createElement("a");
  link.href = `/api/clients/${clientId}/config`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
