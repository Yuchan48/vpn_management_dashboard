const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client.controller");

router.get("/", clientController.getClients);

router.post("/", clientController.createClient);

router.delete("/:id", clientController.deleteClient);

router.get("/:id/config", clientController.getClientConfig);

module.exports = router;
