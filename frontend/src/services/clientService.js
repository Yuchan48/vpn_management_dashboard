import { apiFetch } from "./apiFetch";
import { downloadZip } from "../utils/downloadZip";

export function fetchClients() {
  return apiFetch("/clients");
}

export async function createClient(clientName) {
  const response = await fetch("/api/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name: clientName }),
  });

  if (!response.ok) {
    try {
      const data = await response.json();
      throw new Error(
        data.error || "Failed to create client. Please try again.",
      );
    } catch (err) {
      throw new Error(err.message || "Failed to create client.");
    }
  }

  await downloadZip(response, `${clientName}.zip`);
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
  const response = await fetch(`/api/clients/${clientId}/config`, {
    credentials: "include",
  });
  await downloadZip(response, `${clientName}.zip`);
}
