/*
Define endpoints
Call controller functions
*/

const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client.controller");

router.get("/", clientController.getAllClients);

router.post("/", clientController.createClient);

router.delete("/:id", clientController.deleteClient);

router.get("/:id/config", clientController.getClientConfig);

router.get("/:id/status", clientController.getClientStatus);

router.get("/status", clientController.getAllClientsStatus);

module.exports = router;

/*
The routes defined in this file are responsible for handling HTTP requests related to clients. Each route corresponds to a specific endpoint and HTTP method, such as GET for retrieving all clients, POST for creating a new client, and DELETE for removing a client by ID. The route handlers call the appropriate controller functions to perform the necessary operations and send back JSON responses to the client. This separation of concerns allows for cleaner code organization and easier maintenance.
*/
