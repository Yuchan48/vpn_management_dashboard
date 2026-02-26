/*
Validate input
Call service
Send JSON response
*/

const clientService = require("../services/client.service");

/*
The controller functions are responsible for handling incoming HTTP requests, validating the input, calling the appropriate service functions to perform the business logic, and sending back JSON responses to the client. Each function is designed to handle a specific route and HTTP method, such as creating a new client, retrieving all clients, or deleting a client by ID. Error handling is also included to ensure that any issues during the process are properly managed and communicated back to the client.
*/

exports.createClient = async (req, res, next) => {
  try {
    // Validate that the request body contains a 'name' property, which is required to create a new client. If the validation fails, we return a 400 Bad Request response with an error message.
    if (!req.body || !req.body.name) {
      return res.status(400).json({ error: "Client name is required" });
    }

    console.log("REQ.BODY:", req.body); // <-- Debug

    // Pass the client's name from the request body to the service function. The service will handle generating keys and assigning an IP address.
    const client = await clientService.createClient({ name: req.body.name });
    res.status(201).json(client);
  } catch (error) {
    next(error);
    // res.status(500).json({ error: err.message });
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
