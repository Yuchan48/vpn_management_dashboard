/*
The controller functions are responsible for handling incoming HTTP requests, validating the input, calling the appropriate service functions to perform the business logic, and sending back JSON responses to the client.
*/

const clientService = require("../services/client.service");
const { generateClientConfig } = require("../utils/configGenerator");
const { getNextAvailableIp } = require("../utils/ipAllocator");

const { generateKeyPair } = require("../utils/wireguard");

const wireguardService = require("../services/wireguard.service");

const { mapClientToStatus } = require("../utils/clientStatus");

const { syncWireGuardPeers } = require("../services/wireguardSync.service");

async function createClient(req, res, next) {
  try {
    // Validate that the request body contains a 'name' property, which is required to create a new client.
    if (!req.body || !req.body.name) {
      return res.status(400).json({ error: "Client name is required" });
    }

    // console.log("REQ.BODY:", req.body); // <-- Debug

    // Generate wireguard key pair (in memory)
    let { publicKey, privateKey } = await generateKeyPair();

    // Trimming whitespace to prevent any formatting issues in the generated .conf file.
    privateKey = privateKey.trim();
    publicKey = publicKey.trim();

    // Get the next available IP address for the new client
    const clients = await clientService.getAllClients();
    const ipAddress = getNextAvailableIp(clients);

    // Create a new client object
    const client = await clientService.createClient({
      name: req.body.name,
      publicKey,
      ipAddress,
      userId: req.user.id,
    });

    // Add the new client as a peer to the WireGuard interface
    try {
      await wireguardService.addPeer(publicKey, ipAddress);

      // Sync all peers in case anything got out of sync
      await syncWireGuardPeers();
    } catch (wgError) {
      console.error("Error adding peer to WireGuard:", wgError);
      // If adding the peer fails, we should clean up by deleting the client from the database to maintain consistency.
      await clientService.deleteClient({
        clientId: client.id,
        user: req.user,
      });
      return res
        .status(500)
        .json({ error: "Failed to add peer to WireGuard interface" });
    }

    // Generate a .conf file content for the newly created client.
    const configContent = generateClientConfig(client, privateKey);

    // The filename is dynamically generated based on the client's ID for better organization.
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=client_${client.id}.conf`,
    );

    // Set the content type to indicate that the response is a file download.
    res.setHeader("Content-Type", "text/plain");

    // Send the generated .conf file as the response body, allowing the client to download it immediately after creation.
    res.send(configContent);
  } catch (error) {
    console.error("Error creating client:", error);
    next(error);
  }
}

async function getAllClients(req, res, next) {
  try {
    // Call the service function to retrieve all clients from the database. The service will return an array of client objects, which we then send back as a JSON response.
    const clients = await clientService.getAllClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
}

// get clients of the authenticated user
async function getUserClients(req, res, next) {
  try {
    const clients = await clientService.getClientsByUserId(req.user.id);
    res.json(clients);
  } catch (error) {
    next(error);
  }
}

async function deleteClient(req, res, next) {
  try {
    const client = await clientService.getClientById({
      clientId: req.params.id,
      user: req.user,
    });

    // Remove the client as a peer from the WireGuard interface
    try {
      await wireguardService.removePeer(client.public_key);
    } catch (wgError) {
      console.error("Error removing peer from WireGuard:", wgError);
    }

    // delete the client from the database.
    await clientService.deleteClient({
      clientId: req.params.id,
      user: req.user,
    });

    // Sync WireGuard peers after deletion
    await syncWireGuardPeers();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// Generates a new .conf file for the client with the updated configuration.
async function getClientConfig(req, res, next) {
  try {
    const client = await clientService.getClientById({
      clientId: req.params.id,
      user: req.user,
    });

    // generate a new WireGuard key pair for the client.
    let { publicKey, privateKey } = await generateKeyPair();
    publicKey = publicKey.trim();
    privateKey = privateKey.trim();

    // Remove the old peer configuration from the WireGuard interface using the client's existing public key before updating it with the new key pair.
    try {
      await wireguardService.removePeer(client.public_key); // Remove the old peer configuration
    } catch (wgError) {
      console.error("Error removing old peer from WireGuard:", wgError);
      return res
        .status(500)
        .json({ error: "Failed to remove old peer from WireGuard interface" });
    }

    // Update the client's public key in the database to reflect the new key pair.
    await clientService.updateClientPublicKey(client.id, publicKey);

    // Add the new peer configuration with the updated public key to the WireGuard interface.
    try {
      await wireguardService.addPeer(publicKey, client.ip_address); // Add the new peer configuration with the updated public key
    } catch (wgError) {
      console.error("Error adding new peer to WireGuard:", wgError);
      return res
        .status(500)
        .json({ error: "Failed to add new peer to WireGuard interface" });
    }

    client.public_key = publicKey; // Update the client object with the new public key for generating the config.

    // Generate a new .conf file content for the client with the updated public key and send it as a response, allowing the client to download the updated configuration.
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=client_${client.id}.conf`,
    );
    res.setHeader("Content-Type", "text/plain");

    res.send(generateClientConfig(client, privateKey));
  } catch (error) {
    next(error);
  }
}

// Return a single client status with its connection status
async function getClientStatus(req, res, next) {
  try {
    const clientId = req.params.id;
    const client = await clientService.getClientById({
      clientId,
      user: req.user,
    });

    // Get the list of peers from the WireGuard interface to check if the client is currently connected.
    const peers = await wireguardService.getWireGuardPeers();

    const clientStatus = mapClientToStatus(client, peers);

    res.status(200).json(clientStatus);
  } catch (error) {
    next(error);
  }
}

// Return all clients with status
async function getAllClientsStatus(req, res, next) {
  try {
    const clients = await clientService.getAllClients();

    const peers = await wireguardService.getWireGuardPeers();

    const clientsStatus = clients.map((client) =>
      mapClientToStatus(client, peers),
    );

    res.status(200).json(clientsStatus);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createClient,
  getAllClients,
  getUserClients,
  deleteClient,
  getClientConfig,
  getClientStatus,
  getAllClientsStatus,
};
