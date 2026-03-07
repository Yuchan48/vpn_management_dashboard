/*
The controller functions are responsible for handling incoming HTTP requests, validating the input, calling the appropriate service functions to perform the business logic, and sending back JSON responses to the client.
*/

const clientService = require("../services/client.service");
const { generateClientConfig } = require("../utils/configGenerator");
const { getNextAvailableIp } = require("../utils/ipAllocator");

const { generateKeyPair } = require("../utils/wireguard");

const { addPeer, removePeer } = require("../services/wireguard.service");

exports.createClient = async (req, res, next) => {
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
    });

    // Add the new client as a peer to the WireGuard interface
    try {
      await addPeer(publicKey, ipAddress);
    } catch (wgError) {
      console.error("Error adding peer to WireGuard:", wgError);
      // If adding the peer fails, we should clean up by deleting the client from the database to maintain consistency.
      await clientService.deleteClient(client.id);
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
};

exports.getAllClients = async (req, res, next) => {
  try {
    // Call the service function to retrieve all clients from the database. The service will return an array of client objects, which we then send back as a JSON response.
    const clients = await clientService.getAllClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Remove the client as a peer from the WireGuard interface
    try {
      await removePeer(client.public_key);
    } catch (wgError) {
      console.error("Error removing peer from WireGuard:", wgError);
    }

    // delete the client from the database.
    await clientService.deleteClient(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
