import { apiFetch, apiFetchBlob } from "./apiFetch";

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

// download conf file with given text content and filename
export async function downloadConfFile(clientId, clientName) {
  const blob = await apiFetchBlob(`/clients/${clientId}/config`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${clientName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
