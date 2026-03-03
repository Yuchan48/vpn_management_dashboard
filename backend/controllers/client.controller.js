/*
The controller functions are responsible for handling incoming HTTP requests, validating the input, calling the appropriate service functions to perform the business logic, and sending back JSON responses to the client.
*/

const clientService = require("../services/client.service");
const { generateClientConfig } = require("../utils/configGenerator");
const { getNextAvailableIp } = require("../utils/ipAllocator");

const { generateKeyPair } = require("../utils/wireguard");

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
    // Extract the client ID from the request parameters and pass it to the service function to delete the client from the database. If successful, we send a 204 No Content response to indicate that the deletion was successful without returning any content.
    await clientService.deleteClient(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
