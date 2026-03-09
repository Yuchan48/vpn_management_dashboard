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
