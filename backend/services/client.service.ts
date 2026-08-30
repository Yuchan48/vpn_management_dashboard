import { db } from "../database/db";
import sqlite3 from "sqlite3";
import { getWireGuardPeers } from "./wireguard.service";
import { mapClientToStatus } from "../utils/clientStatus";

import { AuthenticatedUser } from "../types/auth";
import type { Client, ClientWithUser, ClientStatus } from "../types/client";
import type { CreateClientParams } from "../types/client";
import type { SqliteError } from "../types/api";

// Create a client in the database.
export async function createClient({
  name,
  publicKey,
  ipAddress,
  userId,
}: CreateClientParams): Promise<Client> {
  // Check if the user has reached the maximum number of clients (5 clients per user)
  const clientCount = await new Promise<number>((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) AS count FROM clients WHERE user_id = ?",
      [userId],
      (err, row: { count: number } | undefined) => {
        if (err) {
          return reject({ status: 500, error: err.message });
        }
        if (!row) {
          return reject({ status: 404, error: "User not found" });
        }
        resolve(row.count);
      },
    );
  });

  if (clientCount >= 5) {
    throw {
      status: 400,
      error: "Client limit reached. Maximum of 5 clients per user.",
    };
  }

  return new Promise<Client>((resolve, reject) => {
    const query = `INSERT INTO clients (name, public_key, ip_address, user_id) VALUES (?, ?, ?, ?)`;

    db.run(
      query,
      [name, publicKey, ipAddress, userId],
      function (this: sqlite3.RunResult, err: SqliteError | null) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            return reject({
              status: 400,
              error:
                "Client name already in use. Please choose a different name.",
            });
          }

          return reject({
            status: 500,
            error: "Failed to create client",
          });
        } else {
          // Return the created client object, including the newly assigned ID (this.lastID))
          resolve({
            id: this.lastID,
            name,
            public_key: publicKey,
            ip_address: ipAddress,
            user_id: userId,
          });
        }
      },
    );
  });
}

type GetClientByIdParams = {
  clientId: number;
  user: AuthenticatedUser;
};

// Get a client by ID from the database.
export async function getClientById({
  clientId,
  user,
}: GetClientByIdParams): Promise<Client> {
  return new Promise<Client>((resolve, reject) => {
    const query =
      user.role === "admin"
        ? "SELECT * FROM clients WHERE id = ?"
        : "SELECT * FROM clients WHERE id = ? AND user_id = ?";

    const params = user.role === "admin" ? [clientId] : [clientId, user.id];
    db.get(query, params, (err, row: Client | undefined) => {
      // The id parameter is passed as an array to prevent SQL injection. As SQLite treats [id] as data, and not SQL code.
      if (err) {
        reject({ status: 500, error: err.message });
      } else if (!row) {
        reject({ status: 404, error: "Client not found" });
      } else {
        resolve(row);
      }
    });
  });
}

// Returns an array of all client objects from the database.
export async function getAllClients(): Promise<ClientWithUser[]> {
  return new Promise<ClientWithUser[]>((resolve, reject) => {
    const query =
      "SELECT clients.id, clients.name, clients.public_key, clients.ip_address, clients.user_id,clients.created_at, users.username,  users.is_demo FROM clients JOIN users ON clients.user_id = users.id ORDER BY clients.user_id ASC, clients.id ASC;";
    db.all(query, [], (err, rows: ClientWithUser[]) => {
      if (err) {
        reject({ status: 500, error: err.message });
      } else {
        resolve(rows);
      }
    });
  });
}

// Returns array of all clients for admin and clients associated with the authenticated user for regular users with their status.
export async function getClientsWithStatus(
  user: AuthenticatedUser,
): Promise<ClientStatus[]> {
  const clients = await getAllClients();
  const peers = await getWireGuardPeers();

  return clients
    .filter(
      (client) => !user || user.role === "admin" || client.user_id === user.id,
    )
    .map((client) => mapClientToStatus(client, peers));
}

// Returns an array of all client objects associated with a specific user ID from the database.
export async function getClientsByUserId(userId: number): Promise<Client[]> {
  return new Promise<Client[]>((resolve, reject) => {
    const query = "SELECT * FROM clients WHERE user_id = ? ORDER BY id";
    db.all(query, [userId], (err, rows: Client[]) => {
      if (err) {
        reject({ status: 500, error: err.message });
      } else {
        resolve(rows);
      }
    });
  });
}

type DeleteClientParams = {
  clientId: number;
  userRole: string;
  userId: number;
};

// Delete a client by ID from the database.
export function deleteClient({
  clientId,
  userRole,
  userId,
}: DeleteClientParams): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const query =
      userRole === "admin"
        ? "DELETE FROM clients WHERE id = ?"
        : "DELETE FROM clients WHERE id = ? AND user_id = ?";
    const params = userRole === "admin" ? [clientId] : [clientId, userId];
    db.run(query, params, function (err) {
      if (err) {
        reject({ status: 500, error: err.message });
      } else if (this.changes === 0) {
        // this.changes contains the number of rows affected by the delete operation. If it's 0, it means no client was found with the given ID.
        reject({ status: 404, error: "Client not found" });
      } else {
        resolve();
      }
    });
  });
}

export function updateClientPublicKey(
  id: number,
  newPublicKey: string,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const query = "UPDATE clients SET public_key = ? WHERE id = ?";
    db.run(query, [newPublicKey, id], function (err) {
      if (err) {
        reject({ status: 500, error: err.message });
      } else if (this.changes === 0) {
        reject({ status: 404, error: "Client not found" });
      } else {
        resolve();
      }
    });
  });
}
