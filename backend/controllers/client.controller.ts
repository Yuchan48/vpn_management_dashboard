import type { Request, Response, NextFunction } from "express";
import type { Client } from "../types/client";
import type { KeyPair } from "../types/wireguard";

import {
  getAllClients as getAllClientsService,
  createClient as createClientService,
  deleteClient as deleteClientService,
  getClientsWithStatus as getClientsWithStatusService,
  getClientById as getClientByIdService,
  updateClientPublicKey as updateClientPublicKeyService,
} from "../services/client.service";

import { getNextAvailableIp } from "../utils/ipAllocator";
import { generateKeyPair } from "../utils/wireguard";
import * as wireguardService from "../services/wireguard.service";

import { validateClientName } from "../utils/inputValidators";
import { zipGenerator } from "../utils/zipGenerator";
import { emitIoPerUser } from "../socketio";

export async function createClient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate that the request body contains a 'name' property, which is required to create a new client.
    if (!req.body || !req.body.name) {
      res.status(400).json({ error: "Client name is required" });
      return;
    }

    try {
      validateClientName(req.body.name);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
      return;
    }

    // Generate wireguard key pair (in memory)
    let keyPair: KeyPair;
    try {
      keyPair = generateKeyPair();
    } catch (error) {
      console.error("Error generating WireGuard key pair:", error);
      res.status(500).json({ error: "Failed to generate WireGuard key pair" });
      return;
    }

    if (!keyPair) {
      res.status(500).json({ error: "Failed to generate WireGuard key pair" });
      return;
    }

    let { publicKey, privateKey } = keyPair;

    // Trimming whitespace to prevent any formatting issues in the generated .conf file.
    privateKey = privateKey.trim();
    publicKey = publicKey.trim();

    // Get the next available IP address for the new client
    const clients = await getAllClientsService();
    const ipAddress = getNextAvailableIp(clients);

    // Create a new client object
    const client: Client = await createClientService({
      name: req.body.name,
      publicKey,
      ipAddress,
      userId: req.user!.id,
    });

    if (!client) {
      res.status(500).json({ error: "Failed to create client" });
      return;
    }

    // Add the new client as a peer to the WireGuard interface
    try {
      wireguardService.addPeer(publicKey, ipAddress);
    } catch (wgError) {
      console.error("Error adding peer to WireGuard:", wgError);
      // If adding the peer fails, we should clean up by deleting the client from the database to maintain consistency.
      try {
        await deleteClientService({
          clientId: client.id,
          userRole: req.user!.role,
          userId: req.user!.id,
        });
      } catch (deleteError) {
        console.error(
          "Error deleting client after WireGuard add failure:",
          deleteError,
        );
      }

      res
        .status(500)
        .json({ error: "Failed to add peer to WireGuard interface" });
      return;
    }

    // emit a Socket.IO event to notify connected clients that a new client has been created.
    try {
      await emitIoPerUser();
    } catch (socketError) {
      console.error("Error emitting Socket.IO event:", socketError);
    }

    return zipGenerator(res, client, privateKey);
  } catch (error) {
    console.error("Error creating client:", error);
    next(error);
  }
}

export async function getClients(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const clientsWithStatus = await getClientsWithStatusService(req.user!);

    res.json(clientsWithStatus);
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const client = await getClientByIdService({
      clientId: Number(req.params.id),
      user: req.user!,
    });

    // Remove the client as a peer from the WireGuard interface
    try {
      wireguardService.removePeer(client.public_key);
    } catch (wgError) {
      console.error("Error removing peer from WireGuard:", wgError);
    }

    // delete the client from the database.
    await deleteClientService({
      clientId: Number(req.params.id),
      userRole: req.user!.role,
      userId: req.user!.id,
    });

    // emit updated client list to connected clients via Socket.IO
    try {
      await emitIoPerUser();
    } catch (socketError) {
      console.error("Error emitting Socket.IO event:", socketError);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// Generates a new .conf file for the client with the updated configuration.
export async function downloadClientConfig(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const client: Client = await getClientByIdService({
      clientId: Number(req.params.id),
      user: req.user!,
    });

    // generate a new WireGuard key pair for the client.
    let keyPair;
    try {
      keyPair = generateKeyPair();
    } catch (err) {
      console.error("WireGuard key generation failed:", err);
      res.status(500).json({ error: "Failed to generate WireGuard keys" });
      return;
    }

    let { publicKey, privateKey } = keyPair;
    publicKey = publicKey.trim();
    privateKey = privateKey.trim();

    // Remove the old peer configuration from the WireGuard interface using the client's existing public key before updating it with the new key pair.
    try {
      wireguardService.removePeer(client.public_key); // Remove the old peer configuration
    } catch (wgError) {
      console.error("Error removing old peer from WireGuard:", wgError);
      res
        .status(500)
        .json({ error: "Failed to remove old peer from WireGuard interface" });
      return;
    }

    // Update the client's public key in the database to reflect the new key pair.
    try {
      await updateClientPublicKeyService(client.id, publicKey);
    } catch (dbError) {
      console.error("Error updating client public key in database:", dbError);
      res
        .status(500)
        .json({ error: "Failed to update client public key in database" });
      return;
    }

    // Add the new peer configuration with the updated public key to the WireGuard interface.
    try {
      wireguardService.addPeer(publicKey, client.ip_address); // Add the new peer configuration with the updated public key
    } catch (wgError) {
      console.error("Error adding new peer to WireGuard:", wgError);
      res
        .status(500)
        .json({ error: "Failed to add new peer to WireGuard interface" });
      return;
    }

    client.public_key = publicKey; // Update the client object with the new public key for generating the config.

    return zipGenerator(res, client, privateKey);
  } catch (error) {
    next(error);
  }
}
